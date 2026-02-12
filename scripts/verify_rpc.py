import os
from supabase import create_client

def load_env():
    env_path = "d:/CEKA/ceka v010/CEKA/.env"
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

def check_rpc():
    load_env()
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        print("MISSING_ENV")
        return

    s = create_client(url, key)
    try:
        # Standard 1536 vector for Gemini/OpenAI
        res = s.rpc('match_constitution', {
            'query_embedding': [0.0] * 1536, 
            'match_threshold': 0.5, 
            'match_count': 1
        }).execute()
        print("MATCH_CONSTITUTION_EXISTS")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    check_rpc()
