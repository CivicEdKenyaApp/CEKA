import os
import re
import json
import logging
import uuid
from datetime import datetime
from supabase import create_client, Client

# ==============================================================================
# CEKA BACKFILL & PUBLISH ENGINE
# Mission: Inject generated artifacts directly into the live bloodstream.
# ==============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [PUBLISHER] - %(levelname)s - %(message)s'
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

SUPABASE_URL = "https://cajrvemigxghnfmyopiy.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    logging.error("❌ SUPABASE_SERVICE_ROLE_KEY not found.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

REPORTS_DIR = "d:/CEKA/ceka v010/CEKA/generated_reports"

def generate_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    return slug

def parse_html_file(filepath: str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract Metadata
    metadata = {}
    if "<!-- META" in content:
        try:
            meta_raw = content.split("<!-- META")[1].split("-->")[0].strip()
            metadata = json.loads(meta_raw)
        except:
            pass
    
    # Extract Title (fallback if not in meta)
    title = metadata.get("title")
    if not title:
        # Try to find h1
        match = re.search(r'<h1[^>]*>(.*?)</h1>', content)
        if match:
            title = match.group(1).strip()
    
    if not title:
        title = os.path.basename(filepath).replace("_cis_report.html", "").replace("_", " ").title()

    excerpt = metadata.get("excerpt", f"A sovereign analysis on {title}.")
    
    return {
        "title": title,
        "content": content,
        "excerpt": excerpt,
        "metadata": metadata,
        "slug": generate_slug(title)
    }

def process_files():
    files = [f for f in os.listdir(REPORTS_DIR) if f.endswith(".html")]
    
    if not files:
        logging.warning("⚠️ No HTML reports found to publish.")
        return

    logging.info(f"🚀 Found {len(files)} articles to publish.")

    for filename in files:
        filepath = os.path.join(REPORTS_DIR, filename)
        logging.info(f"📄 Processing {filename}...")
        
        data = parse_html_file(filepath)
        
        # 1. Insert into generated_articles (The Ledger)
        gen_article_payload = {
            "id": str(uuid.uuid4()),
            "title": data["title"],
            "topic_id": "sov-rag-001", # Placeholder
            "content": data["content"],
            "excerpt": data["excerpt"],
            "status": "published", # Mark as published ensuring logic consistency
            "analysis_score": int(data["metadata"].get("factual_integrity", 0.99) * 100),
            "verification_metrics": data["metadata"],
            "seo_keywords": [k.strip() for k in data["metadata"].get("keywords", [])], # Assuming keywords list
            "author": "CEKA",
            "created_at": datetime.now().isoformat()
        }
        
        try:
            # Check if exists (by title) to avoid dups
            existing = supabase.table("generated_articles").select("id").eq("title", data["title"]).execute()
            if existing.data:
                logging.info("  ↳ Article already in 'generated_articles'. Skipping insert.")
            else:
                supabase.table("generated_articles").insert(gen_article_payload).execute()
                logging.info("  ✅ Inserted into 'generated_articles'.")
        except Exception as e:
            logging.error(f"  ❌ Failed generated_articles insert: {e}")

        # 2. Insert into blog_posts (The Live Site)
        blog_post_payload = {
            "id": str(uuid.uuid4()),
            "title": data["title"],
            "slug": data["slug"],
            "content": data["content"],
            "excerpt": data["excerpt"],
            "status": "published",
            "published_at": datetime.now().isoformat(),
            "meta_description": data["excerpt"],
            "seo_keywords": [k.strip() for k in data["metadata"].get("keywords", [])],
            "author": "CEKA",
            "featured_image": "/images/placeholder-sovereign.jpg", # Or derive from content
            "reading_time_minutes": 10,
            "created_at": datetime.now().isoformat()
        }

        try:
             # Check if exists (by slug)
            existing_blog = supabase.table("blog_posts").select("id").eq("slug", data["slug"]).execute()
            if existing_blog.data:
                 logging.info("  ↳ Article already in 'blog_posts'. Skipping insert.")
                 # Optional: Update content? For now, skip to preserve legacy safety.
            else:
                supabase.table("blog_posts").insert(blog_post_payload).execute()
                logging.info("  🚀 LIVE! Inserted into 'blog_posts'.")
        except Exception as e:
            logging.error(f"  ❌ Failed blog_posts insert: {e}")

if __name__ == "__main__":
    process_files()
