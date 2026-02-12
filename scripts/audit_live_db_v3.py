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
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY missing!")
        sys.exit(1)

    print(f"Connecting to Supabase at {SUPABASE_URL}...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    tables_to_check = {
        'content_topics': ['gemini_prompt_template', 'min_kenyan_references'],
        'ai_models': ['provider', 'rate_limit_rpm'],
        'content_queue': ['prompt_used', 'processing_duration'],
        'generated_articles': ['html_content', 'kenyan_references'],
        'content_reviews': ['article_id', 'reviewer_id'],
        'review_assignments': ['reviewer_id', 'deadline'],
        'content_templates': ['content_structure', 'tone_guidelines'],
        'tone_profiles': ['gemini_instruction', 'config'],
        'sitemap_entries': ['changefreq', 'lastmod'],
        'generation_logs': ['action', 'details'],
        'webhook_logs': ['event', 'payload'],
        'rate_limit_tracking': ['period_type', 'token_count'],
        'performance_metrics': ['metric_name', 'metric_value']
    }

    print("\n--- DB Audit Results ---")
    
    missing_tables = []
    existing_tables = []

    for table, expected_columns in tables_to_check.items():
        try:
            sys.stdout.write(f"Checking '{table}'... ")
            sys.stdout.flush()
            # Select 1 row to check connection and table existence
            res = supabase.table(table).select("*").limit(1).execute()
            print("EXISTS [OK]")
            existing_tables.append(table)
            
            # Check for columns if data exists
            if res.data and len(res.data) > 0:
                row = res.data[0]
                missing_cols = [col for col in expected_columns if col not in row]
                if missing_cols:
                    print(f"  -> WARNING: Missing columns: {missing_cols}")
                else:
                    print("  -> Schema matches expected columns [OK]")
            else:
                # If table empty, try to insert a dummy/empty dict to trigger schema validation error or just assume OK for now?
                # Actually, postgrest returns empty list if no rows, so we can't inspect columns easily without introspection.
                # But knowing it EXISTS is the main thing.
                print("  -> Table is empty, cannot verify columns fully [INFO]")

        except Exception as e:
            msg = str(e)
            if "relation" in msg and "does not exist" in msg:
                 print("DOES NOT EXIST [MISSING]")
                 missing_tables.append(table)
            else:
                print(f"ERROR: {msg}")
                # traceback.print_exc()

    print("\n--- SUMMARY ---")
    print(f"Existing Tables: {len(existing_tables)}")
    print(f"Missing Tables: {len(missing_tables)}")
    if existing_tables:
        print("\nThese tables ALREADY EXIST (potential conflict):")
        for t in existing_tables:
            print(f"- {t}")
    if missing_tables:
        print("\nThese tables need to be created:")
        for t in missing_tables:
            print(f"- {t}")

except Exception as e:
    print("CRITICAL FAILURE:")
    traceback.print_exc()
