import os
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def load_env():
    """Load environment variables from .env file."""
    # Look for .env in the current directory or parent
    env_path = '.env'
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        # Try finding it in ceka v010/CEKA/.env
        load_dotenv('d:/CEKA/ceka v010/CEKA/.env')

def get_supabase_client() -> Client:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise ValueError("❌ Missing Supabase credentials in environment.")
    return create_client(url, key)

def normalize_title(title: str) -> str:
    """Standardize title for comparison."""
    if not title: return ""
    return re.sub(r'[^a-zA-Z0-9]', '', title.lower())

def find_existing_resource(supabase: Client, item: Dict) -> Optional[Dict[str, Any]]:
    """Lookup existing resource by title or URL."""
    title = item.get("title", "")
    url = item.get("url", "")
    
    # 1. Exact match by URL
    try:
        res = supabase.table("resources").select("*").eq("url", url).maybe_single().execute()
        if res and hasattr(res, 'data') and res.data: return res.data
    except Exception:
        pass

    # 2. Exact match by Title
    try:
        res = supabase.table("resources").select("*").eq("title", title).maybe_single().execute()
        if res and hasattr(res, 'data') and res.data: return res.data
    except Exception:
        pass

    return None

def sync_resources(input_dir="processed_data/resources"):
    load_env()
    supabase = get_supabase_client()
    
    if not os.path.exists(input_dir):
        logging.error(f"❌ Input directory missing: {input_dir}")
        return

    files = [f for f in os.listdir(input_dir) if f.startswith('resources_sync_') and f.endswith('.json')]
    if not files:
        logging.warning("⚠️ No fresh resource data files found.")
        return

    files.sort()
    latest_file = os.path.join(input_dir, files[-1])
    logging.info(f"🚀 Synchronizing Resources: {latest_file}")

    with open(latest_file, 'r', encoding='utf-8') as f:
        items = json.load(f)

    stats = {"total": len(items), "inserted": 0, "updated": 0, "failed": 0}
    start_time = datetime.now()

    # Log the run initiation
    run_res = supabase.table("scrape_runs").insert({
        "source": "Resource Scraper",
        "status": "running",
        "started_at": start_time.isoformat(),
        "resources_found": stats["total"]
    }).execute()
    run_id = run_res.data[0]['id'] if run_res.data else None

    for item in items:
        try:
            existing = find_existing_resource(supabase, item)
            
            data = {
                "title": item.get("title"),
                "url": item.get("url"),
                "provider": item.get("provider"),
                "category": item.get("category"),
                "type": item.get("type"),
                "summary": item.get("summary"),
                "description": item.get("summary"), # Default to summary
                "tags": item.get("tags", []),
                "metadata": item.get("metadata", {}),
                "updated_at": datetime.now().isoformat()
            }

            if existing:
                supabase.table("resources").update(data).eq("id", existing['id']).execute()
                stats["updated"] += 1
            else:
                supabase.table("resources").insert(data).execute()
                stats["inserted"] += 1
                
        except Exception as e:
            logging.error(f"❌ Failed to sync resource '{item.get('title')}': {e}")
            stats["failed"] += 1

    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds() * 1000

    # Finalize run log
    if run_id:
        supabase.table("scrape_runs").update({
            "status": "completed",
            "completed_at": end_time.isoformat(),
            "duration_ms": duration,
            "resources_inserted": stats["inserted"],
            "resources_updated": stats["updated"],
            "error_log": f"Failed items: {stats['failed']}" if stats["failed"] > 0 else None
        }).eq("id", run_id).execute()

    logging.info(f"✅ Sync Complete: {stats['inserted']} new, {stats['updated']} updated, {stats['failed']} failed.")

if __name__ == "__main__":
    import re
    sync_resources()
