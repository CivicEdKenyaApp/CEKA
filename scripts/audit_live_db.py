import os
import sys
from supabase import create_client, Client

# Load environment variables
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
            print(f"Loaded environment variables from {env_path}")
        else:
            print(f"No .env file found at {env_path}")
    except Exception as e:
        print(f"Failed to load .env file: {str(e)}")

load_env_file()

SUPABASE_URL = "https://cajrvemigxghnfmyopiy.supabase.co" # Hardcoded based on previous file
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_ROLE_KEY not found.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

tables_to_check = [
    'content_topics',
    'ai_models',
    'content_queue',
    'generated_articles',
    'content_reviews',
    'review_assignments',
    'content_templates',
    'tone_profiles',
    'sitemap_entries',
    'generation_logs',
    'webhook_logs',
    'rate_limit_tracking',
    'performance_metrics'
]

print(f"Checking for existence of {len(tables_to_check)} tables in live database...")

existing_tables = []
missing_tables = []
errors = []

for table in tables_to_check:
    try:
        # Try to select 1 row to check existence
        res = supabase.table(table).select("*").limit(1).execute()
        existing_tables.append(table)
        count = len(res.data) if res.data else 0
        print(f"✅ Table '{table}' EXISTS. (Contains data: {count > 0})")
    except Exception as e:
        error_msg = str(e)
        if "relation" in error_msg and "does not exist" in error_msg:
             missing_tables.append(table)
             print(f"❌ Table '{table}' DOES NOT EXIST.")
        else:
            errors.append((table, error_msg))
            print(f"⚠️ Error checking '{table}': {error_msg}")

print("\n--- Summary ---")
print(f"Existing Tables: {len(existing_tables)}")
print(f"Missing Tables: {len(missing_tables)}")
print(f"Errors: {len(errors)}")

if existing_tables:
    print("\nWARNING: The following tables already exist in the database:")
    for t in existing_tables:
        print(f"- {t}")
    print("\nIf your migration does not use 'IF NOT EXISTS', it will fail or you might overwrite/conflict with data.")
else:
    print("\nGood news: None of the target tables exist in the live database.")

if errors:
    print("\nErrors encountered:")
    for t, msg in errors:
        print(f"- {t}: {msg}")
