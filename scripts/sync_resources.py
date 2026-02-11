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
    """Load environment variables from .env file with absolute priority."""
    env_path = 'd:/CEKA/ceka v010/CEKA/.env'
    if os.path.exists(env_path):
        from dotenv import dotenv_values
        config = dotenv_values(env_path)
        # Directly inject to os.environ to bypass shell overrides
        for k, v in config.items():
            os.environ[k] = v
        print(f"DEBUG: Manually injected {len(config)} keys from {env_path}", flush=True)
    else:
        print(f"DEBUG: .env not found at {env_path}", flush=True)

def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_SERVICE_ROLE_KEY")
    print(f"DEBUG: Using Supabase URL: {url}", flush=True)
    if not url or not key:
        raise ValueError(f"❌ Missing Supabase credentials. Checked URL and Key variations. Found URL: {bool(url)}, Key: {bool(key)}")
    return create_client(url, key)

def normalize_title(title: str) -> str:
    """Standardize title for comparison."""
    if not title: return ""
    return re.sub(r'[^a-zA-Z0-9]', '', title.lower())

def find_existing_resource(supabase: Client, item: Dict) -> Optional[Dict[str, Any]]:
    """Lookup existing resource by title or URL with semantic fallback."""
    title = item.get("title", "")
    url = item.get("url", "")
    
    # 1. Exact match by URL
    try:
        res = supabase.table("resources").select("*").eq("url", url).maybe_single().execute()
        if res and hasattr(res, 'data') and res.data: return res.data
    except Exception:
        pass

    # 2. Match by normalized title (Semantic fallback)
    norm_title = re.sub(r'[^a-zA-Z0-9]', '', title.lower())
    try:
        # We fetch potential candidates to check locally for title similarity
        res = supabase.table("resources").select("*").ilike("title", f"%{title[:20]}%").execute()
        if res and hasattr(res, 'data') and res.data:
            for existing in res.data:
                exist_norm = re.sub(r'[^a-zA-Z0-9]', '', existing['title'].lower())
                if exist_norm == norm_title:
                    return existing
    except Exception:
        pass

    return None

def sync_resources(input_dir="processed_data/resources"):
    load_env()
    supabase = get_supabase_client()
    
    # Prioritize HAM sync files
    files = [f for f in os.listdir(input_dir) if f.startswith('resources_sync_HAM_') and f.endswith('.json')]
    if not files:
        files = [f for f in os.listdir(input_dir) if f.startswith('resources_sync_') and f.endswith('.json')]
    
    if not files:
        logging.warning("⚠️ No fresh resource data files found.")
        return

    files.sort()
    latest_file = os.path.join(input_dir, files[-1])
    logging.info(f"🚀 Synchronizing Resources (GO HAM): {latest_file}")

    with open(latest_file, 'r', encoding='utf-8') as f:
        items = json.load(f)

    stats = {"total": len(items), "inserted": 0, "updated": 0, "failed": 0}
    start_time = datetime.now()

    # Log the run initiation (Self-healing: skip if table missing)
    run_id = None
    try:
        run_res = supabase.table("scrape_runs").insert({
            "source": "Ultimate Resource Scraper",
            "status": "running",
            "started_at": start_time.isoformat(),
            "resources_found": stats["total"]
        }).execute()
        if run_res and hasattr(run_res, 'data') and run_res.data:
            run_id = run_res.data[0]['id']
    except Exception as e:
        logging.warning(f"⚠️ Could not log to scrape_runs (continuing ingestion): {e}")

    for item in items:
        try:
            existing = find_existing_resource(supabase, item)
            
            data = {
                "title": item.get("title"),
                "url": item.get("url"),
                "provider": item.get("provider", "Civic Education Kenya"),
                "category": item.get("category", "Governance"),
                "type": item.get("type", "PDF").upper(),
                "summary": item.get("summary"),
                "description": item.get("summary") or item.get("title"),
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
            logging.error(f"❌ Failed to sync: {e}")
            stats["failed"] += 1

    duration = (datetime.now() - start_time).total_seconds() * 1000
    if run_id:
        try:
            supabase.table("scrape_runs").update({
                "status": "completed",
                "completed_at": datetime.now().isoformat(),
                "duration_ms": duration,
                "resources_inserted": stats["inserted"],
                "resources_updated": stats["updated"],
                "error_log": f"Failures: {stats['failed']}" if stats["failed"] > 0 else None
            }).eq("id", run_id).execute()
        except Exception:
            pass

    logging.info(f"✅ Sync Complete: {stats['inserted']} new, {stats['updated']} updated.")

    logging.info(f"✅ Sync Complete: {stats['inserted']} new, {stats['updated']} updated, {stats['failed']} failed.")

if __name__ == "__main__":
    import re
    sync_resources()
