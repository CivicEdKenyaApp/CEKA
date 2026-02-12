import os
import sys
import traceback
from supabase import create_client, Client

# Load environment variables
def load_env_file():
    env_path = "d:/CEKA/ceka v010/CEKA/.env"
    try:
        if os.path.exists(env_path):
            print(f"Loading .env from {env_path}")
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key.strip()] = value.strip()
            print("Environment loaded.")
        else:
            print(f"No .env file found at {env_path}")
    except Exception as e:
        print(f"Failed to load .env file: {str(e)}")

try:
    load_env_file()

    SUPABASE_URL = "https://cajrvemigxghnfmyopiy.supabase.co" 
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not SUPABASE_KEY:
        print("❌ SUPABASE_SERVICE_ROLE_KEY missing!")
        sys.exit(1)

    print(f"Connecting to Supabase at {SUPABASE_URL}...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    tables_to_check = {
        'content_topics': ['gemini_prompt_template', 'min_kenyan_references'],
        'ai_models': ['provider', 'rate_limit_rpm'],
        'content_queue': ['prompt_used', 'processing_duration'],
        'generated_articles': ['html_content', 'kenyan_references'],
        'review_assignments': ['reviewer_id', 'deadline'],
        'sitemap_entries': ['changefreq', 'lastmod'],
        'generation_logs': ['action', 'details'],
        'webhook_logs': ['event', 'payload'],
        'rate_limit_tracking': ['period_type', 'token_count'],
        'performance_metrics': ['metric_name', 'metric_value']
    }

    print("\n--- DB Audit Results ---")
    
    for table, expected_columns in tables_to_check.items():
        try:
            print(f"Checking '{table}'...", end=" ")
            # Select 1 row
            res = supabase.table(table).select("*").limit(1).execute()
            print("EXISTS ✅", end=" ")
            
            # Check for columns if data exists
            if res.data and len(res.data) > 0:
                row = res.data[0]
                missing_cols = [col for col in expected_columns if col not in row]
                if missing_cols:
                    print(f"(Missing columns: {missing_cols}) ⚠️")
                else:
                    print("(Schema matches expected columns) ✨")
            else:
                # Try inserting a dummy row that fails constraint but validates column existence?
                # No, just report empty but exists.
                print("(Table is empty, schema check limited) ℹ️")

        except Exception as e:
            msg = str(e)
            if "relation" in msg and "does not exist" in msg:
                 print("DOES NOT EXIST ❌")
            else:
                print(f"ERROR: {msg}")
                traceback.print_exc()

except Exception as e:
    print("CRITICAL FAILURE:")
    traceback.print_exc()
