import os
import logging
from supabase import create_client

def load_env():
    env_path = os.path.join(os.getcwd(), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

def test_rpc():
    load_env()
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        print("Missing credentials")
        return
    
    supabase = create_client(url, key)
    try:
        res = supabase.rpc('exec_sql', {'sql': 'SELECT 1'}).execute()
        print(f"Success: {res}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_rpc()
