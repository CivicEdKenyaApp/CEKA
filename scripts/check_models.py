import os
import google.generativeai as genai

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

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("NO API KEY FOUND")
    exit(1)

genai.configure(api_key=api_key)

print("Listing available models...")
try:
    for m in genai.list_models():
        print(f"MODEL: {m.name}")
        print(f"  Methods: {m.supported_generation_methods}")
except Exception as e:
    print(f"Error listing models: {e}")
