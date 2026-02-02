import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

# Load from .env file
load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_db_state():
    print("🔍 Auditing Live Database State...")
    print("=" * 40)
    
    # Check Articles
    try:
        sections = supabase.table('constitution_sections').select('id', count='exact').execute()
        print(f"✅ Constitution Articles: {sections.count if sections.count else 0} / 264")
    except Exception as e:
        print(f"❌ Error checking constitution_sections: {e}")

    # Check Chapters
    try:
        chapters = supabase.table('constitution_chapters').select('id', count='exact').execute()
        print(f"✅ Constitution Chapters: {chapters.count if chapters.count else 0} / 18")
    except Exception as e:
        print(f"❌ Error checking constitution_chapters: {e}")

    # Check Other Tables
    tables = ['profiles', 'blog_posts', 'resources', 'bills', 'volunteer_opportunities', 'platform_campaigns']
    for table in tables:
        try:
            res = supabase.table(table).select('id', count='exact').execute()
            print(f"📊 {table}: {res.count if res.count else 0} records")
        except Exception as e:
            print(f"⚠ {table}: Table missing or error: {e}")

    print("=" * 40)

if __name__ == "__main__":
    check_db_state()
