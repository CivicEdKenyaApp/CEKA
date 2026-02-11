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

# Robust .env loader
def load_env_file():
    env_path = "d:/CEKA/ceka v010/CEKA/.env"
    try:
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key.strip()] = value.strip()
            logging.info(f"📂 Loaded environment variables from {env_path}")
        else:
            logging.warning(f"⚠️ .env file not found at {env_path}")
    except Exception as e:
        logging.error(f"❌ Failed to load .env file: {str(e)}")

load_env_file()

# Configuration
SUPABASE_URL = "https://cajrvemigxghnfmyopiy.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_KEY_REQUIRED")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "GEMINI_API_KEY_REQUIRED")
PDF_PATH = "d:/CEKA/ceka v010/CONTEXT - CEKA/The_Constitution_of_Kenya_2010.pdf"

# MODEL UPDATE: Using valid model from diagnostic check
EMBEDDING_MODEL = "models/gemini-embedding-001" 

class ConstitutionVectorizer:
    def __init__(self):
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            self.embeddings_model = EMBEDDING_MODEL
            logging.info(f"✅ Vectorizer initialized with model: {EMBEDDING_MODEL}")
        except Exception as e:
            logging.error(f"⚠️ Initialization warning: {e}")

    def extract_and_parse_pdf(self) -> List[Dict[str, Any]]:
        logging.info(f"📂 Loading PDF: {PDF_PATH}")
        try:
            reader = PdfReader(PDF_PATH)
            full_text = ""
            for page in reader.pages:
                full_text += page.extract_text() + "\n"
        except Exception as e:
            logging.error(f"❌ Failed to load PDF: {e}")
            return []

        # Split by Articles using Regex
        # Matches "Article 1.", "Article 27.", etc.
        articles = []
        
        # Heuristic: Split on "Article [Number]"
        pattern = r"(Article\s+\d+\.)"
        parts = re.split(pattern, full_text)
        
        current_chapter = "General"
        
        for i in range(1, len(parts), 2):
            header = parts[i].strip()
            content = parts[i+1].strip() if i+1 < len(parts) else ""
            
            # Simple cleanup
            article_id = header.replace(".", "")
            
            articles.append({
                "clause_ref": article_id,
                "content": f"{header}\n{content}".strip(),
                "chapter": current_chapter, 
                "category": "Constitution"
            })
            
        logging.info(f"⚖️ Parsed {len(articles)} Articles from the Constitution.")
        return articles

    def generate_embeddings(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        logging.info(f"🧠 Generating embeddings for {len(articles)} units...")
        
        processed_articles = []
        for i, article in enumerate(articles):
            try:
                # Truncate content if it's too long 
                text = article['content'][:9000] 
                result = genai.embed_content(
                    model=self.embeddings_model,
                    content=text,
                    task_type="retrieval_document",
                    title=article['clause_ref']
                )
                article['embedding'] = result['embedding']
                processed_articles.append(article)
                if i % 10 == 0:
                    logging.info(f"✅ Embedded {i}/{len(articles)}")
            except Exception as e:
                logging.error(f"❌ Embedding failed for {article['clause_ref']}: {str(e)}")
                
        return processed_articles

    def upload_to_supabase(self, articles: List[Dict[str, Any]]):
        logging.info(f"🚀 Uploading {len(articles)} embeddings to public.constitution_embeddings...")
        
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
        logging.info("🚀 Starting Constitution Vectorization...")
        articles = self.extract_and_parse_pdf()
        if not articles:
            logging.error("❌ No articles extracted. Aborting.")
            return

        articles_with_embeddings = self.generate_embeddings(articles)
        if articles_with_embeddings:
            self.upload_to_supabase(articles_with_embeddings)
            logging.info("🏁 MISSION COMPLETE: The 2010 Constitution is now a Sovereign Vector Memory.")
        else:
            logging.error("❌ No embeddings generated.")

if __name__ == "__main__":
    VECTORIZER = ConstitutionVectorizer()
    VECTORIZER.run()
