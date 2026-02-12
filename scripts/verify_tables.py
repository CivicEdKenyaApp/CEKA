import os
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

def check_tables():
    load_env()
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        print("MISSING_ENV")
        return

    s = create_client(url, key)
    
    tables = ['generated_articles', 'blog_posts', 'sovereign_simulation_queue']
    
    print("--- TABLE AUDIT ---")
    for table_name in tables:
        try:
            s.table(table_name).select('id').limit(1).execute()
            print(f"✅ {table_name}: EXISTS")
        except Exception as e:
            if "relation" in str(e) and "does not exist" in str(e):
                print(f"❌ {table_name}: MISSING")
            else:
                print(f"⚠️ {table_name}: ERROR ({e})")

if __name__ == "__main__":
    check_tables()
