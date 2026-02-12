import os
import json
from supabase import create_client

def load_env():
    env_path = "d:/CEKA/ceka v010/CEKA/.env"
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'): continue
                if '=' in line:
                    k, v = line.split('=', 1)
                    os.environ[k.strip()] = v.strip()

def audit_schema():
    load_env()
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        print("MISSING_ENV")
        return

    s = create_client(url, key)
    
    # List of all POTENTIAL tables found in codebase references
    potential_tables = [
        'profiles', 'users', 
        'blog_posts', 'generated_articles', 
        'constitution_embeddings', 'constitution_chapters', 'constitution_sections',
        'ai_intelligence_configs', 'sovereign_simulation_queue', 
        'bills', 'hansards', 'order_papers',
        'scraping_targets', 'scraper_sources', 'scrape_runs',
        'user_progress', 'achievements',
        'legislative_events', 'votes', 'mps', 'counties', 'constituencies', 'wards',
        'action_items', 'advocacy_toolkit', 'campaigns', 'discussions', 
        'volunteer_opportunities', 'volunteer_applications',
        'user_notifications', 'admin_notifications', 'admin_audit_log', 'admin_sessions'
    ]
    
    results = {}
    
    print("--- AUDIT START ---")
    for table in potential_tables:
        try:
            # Just try to fetch 1 row to see if table exists
            s.table(table).select('id').limit(1).execute()
            print(f"✅ {table}")
        except Exception as e:
            if "relation" in str(e) and "does not exist" in str(e):
                print(f"❌ {table}")
            else:
                print(f"⚠️ {table} (Error: {str(e)[:50]})")

if __name__ == "__main__":
    audit_schema()
