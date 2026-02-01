import os
import requests
import logging
import json
import time
from typing import Optional
import PyPDF2
import google.generativeai as genai
from supabase import create_client, Client
from backblaze_utils import BackblazeVault

# Configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)

def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        logging.error(f"Text extraction failed: {e}")
    return text

def generate_neural_summary(title: str, content: str) -> str:
    try:
        genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Analyze the following Kenyan legislative bill entitled "{title}".
        Provide a concise "Neural Insight" for a typical citizen.
        Focus on:
        1. What this means for you (The Bottom Line).
        2. Financial implications (Taxes, Prices, Costs).
        3. Rights & Freedoms (Does it expand or restrict?).
        
        Use plain language, bold key terms, and keep it under 250 words.
        
        Content:
        {content[:10000]} # Limit content for prompt window
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logging.error(f"Gemini generation failed: {e}")
        return "Neural summary generation encountered an error. Please check back later."

def process_pending_bills():
    supabase = get_supabase_client()
    vault = BackblazeVault()
    
    # Query bills that need analysis
    res = supabase.table("bills").select("*").eq("analysis_status", "pending").execute()
    pending_bills = res.data or []
    
    if not pending_bills:
        logging.info("No pending bills to process.")
        return

    logging.info(f"Processing {len(pending_bills)} bills with Neural Engine...")

    for bill in pending_bills:
        bill_id = bill['id']
        url = bill.get('url')
        title = bill['title']
        
        if not url:
            logging.warning(f"No URL for bill {title}. Skipping.")
            continue

        logging.info(f"Analyzing: {title}")
        
        try:
            # 1. Download PDF
            pdf_path = f"temp_{bill_id}.pdf"
            response = requests.get(url, timeout=30)
            with open(pdf_path, 'wb') as f:
                f.write(response.content)
            
            # 2. Extract Text
            text = extract_text_from_pdf(pdf_path)
            
            # 3. Generate Summary
            summary = generate_neural_summary(title, text)
            
            # 4. Upload to Backblaze
            remote_path = f"bills/{bill_id}.pdf"
            b2_url = vault.upload_file(pdf_path, remote_path)
            
            # 5. Update Supabase
            update_data = {
                "neural_summary": summary,
                "text_content": text,
                "pdf_url": b2_url,
                "analysis_status": "completed",
                "updated_at": "now()"
            }
            
            supabase.table("bills").update(update_data).eq("id", bill_id).execute()
            logging.info(f"✅ Successfully processed {title}")
            
            # Cleanup
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
                
            # Rate limiting for Gemini API
            time.sleep(2)
            
        except Exception as e:
            logging.error(f"Failed to process {title}: {e}")
            supabase.table("bills").update({"analysis_status": "failed"}).eq("id", bill_id).execute()

if __name__ == "__main__":
    process_pending_bills()
破
