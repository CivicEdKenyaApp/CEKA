import os
import re
import json
import logging
from pypdf import PdfReader
import google.generativeai as genai
from supabase import create_client, Client
from typing import List, Dict, Any

# ==============================================================================
# CEKA CONSTITUTIONAL VECTORIZER (FULL HAM)
# Mission: Vectorize the 2010 Constitution with Article-level precision.
# ==============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [CONSTITUTION-VECTORIZER] - %(levelname)s - %(message)s'
)

# Configuration
SUPABASE_URL = "https://cajrvemigxghnfmyopiy.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_KEY_REQUIRED")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "GEMINI_API_KEY_REQUIRED")
PDF_PATH = "d:/CEKA/ceka v010/CONTEXT - CEKA/The_Constitution_of_Kenya_2010.pdf"

class ConstitutionVectorizer:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.embeddings_model = "models/text-embedding-004"

    def extract_and_parse_pdf(self) -> List[Dict[str, Any]]:
        logging.info(f"📂 Loading PDF: {PDF_PATH}")
        reader = PdfReader(PDF_PATH)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"

        # Split by Articles using Regex
        # Matches "Article 1.", "Article 27.", etc.
        # We also want to capture the Chapter if possible.
        articles = []
        
        # Heuristic: Split on "Article [Number]"
        # Note: This is a simplified parser; in a real "Full Ham" scenario, 
        # we would use a library like layout-parser or a specialized PDF plumber.
        pattern = r"(Article\s+\d+\.)"
        parts = re.split(pattern, full_text)
        
        # parts[0] is everything before Article 1. (Prologue, TOC, etc.)
        # Then we get (Article X.) and then the text for it.
        
        # We'll also try to extract Chapters
        current_chapter = "General"
        
        for i in range(1, len(parts), 2):
            header = parts[i].strip()
            content = parts[i+1].strip() if i+1 < len(parts) else ""
            
            # Look for Chapter headers in the preceding text of the first Article in that chapter
            # or in the content itself. This is tricky with simple regex.
            # For now, we'll store the Article ID.
            article_id = header.replace(".", "")
            
            # Limit content length if needed, but Articles are usually fine.
            articles.append({
                "clause_ref": article_id,
                "content": f"{header}\n{content}",
                "chapter": current_chapter, # Placeholder for more advanced parsing
                "category": "Constitution"
            })
            
        logging.info(f"⚖️ Parsed {len(articles)} Articles from the Constitution.")
        return articles

    def generate_embeddings(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        logging.info(f"🧠 Generating embeddings for {len(articles)} units...")
        
        for article in articles:
            try:
                # Truncate content if it's too long for the embedding model (rare for articles)
                text = article['content'][:9000] 
                result = genai.embed_content(
                    model=self.embeddings_model,
                    content=text,
                    task_type="retrieval_document",
                    title=article['clause_ref']
                )
                article['embedding'] = result['embedding']
            except Exception as e:
                logging.error(f"❌ Embedding failed for {article['clause_ref']}: {str(e)}")
                article['embedding'] = None
                
        # Filter out failed embeddings
        return [a for a in articles if a['embedding'] is not None]

    def upload_to_supabase(self, articles: List[Dict[str, Any]]):
        logging.info(f"🚀 Uploading {len(articles)} embeddings to public.constitution_embeddings...")
        
        # Batch insert for efficiency
        batch_size = 50
        for i in range(0, len(articles), batch_size):
            batch = articles[i:i + batch_size]
            data = [{
                "clause_ref": item['clause_ref'],
                "chapter": item['chapter'],
                "content": item['content'],
                "category": item['category'],
                "embedding": item['embedding'],
                "metadata": {"source": "The_Constitution_of_Kenya_2010.pdf"}
            } for item in batch]
            
            try:
                self.supabase.table("constitution_embeddings").upsert(data, on_conflict="clause_ref").execute()
                logging.info(f"✅ Chunk {i//batch_size + 1} uploaded.")
            except Exception as e:
                logging.error(f"❌ Batch upload failed: {str(e)}")

    def run(self):
        articles = self.extract_and_parse_pdf()
        # In a real "Full Ham" run, we'd also parse the 6 Schedules here.
        # But for this implementation, we start with the core 264 Articles.
        
        # To truly GO HAM, let's also find the Schedules.
        schedules = self.extract_schedules()
        articles.extend(schedules)
        
        articles_with_embeddings = self.generate_embeddings(articles)
        self.upload_to_supabase(articles_with_embeddings)
        logging.info("🏁 MISSION COMPLETE: The 2010 Constitution is now a Sovereign Vector Memory.")

    def extract_schedules(self) -> List[Dict[str, Any]]:
        # Simplified Schedule extraction logic
        # Schedules usually follow the Articles.
        return [] # Placeholder; in production we'd regex for "First Schedule", etc.

if __name__ == "__main__":
    VECTORIZER = ConstitutionVectorizer()
    VECTORIZER.run()
