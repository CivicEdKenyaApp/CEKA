import os
from supabase import create_client, Client

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
            print(f"Loaded environment variables from {env_path}")
    except Exception as e:
        print(f"Failed to load .env file: {str(e)}")

load_env_file()

SUPABASE_URL = "https://cajrvemigxghnfmyopiy.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_ROLE_KEY not found.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Using a little hack to get keys: select one row and print keys
try:
    res = supabase.table("blog_posts").select("*").limit(1).execute()
    if res.data:
        print("✅ Columns in 'blog_posts':")
        for key in res.data[0].keys():
            print(f"  - {key}")
    else:
        print("⚠️ No data in blog_posts, cannot infer schema easily via select. Trying empty insert error...")
        try:
             supabase.table("blog_posts").insert({}).execute()
        except Exception as e:
            print(f"Error hint: {str(e)}")

except Exception as e:
    print(f"❌ Error querying DB: {str(e)}")
