"""
CEKA Constitution Full Seeder
Seeds all 18 chapters and articles of the Kenyan Constitution 2010
"""
import os
import json
import logging
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def load_constitution_data():
    """Load constitution data from JSON files"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Load chapters
    chapters_file = os.path.join(script_dir, 'constitution_chapters.json')
    with open(chapters_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Load additional articles if exists
    articles_file = os.path.join(script_dir, 'constitution_articles.json')
    if os.path.exists(articles_file):
        with open(articles_file, 'r', encoding='utf-8') as f:
            additional = json.load(f)
            data['sections'].extend(additional.get('sections', []))
    
    return data

def seed_chapters(chapters):
    """Seed constitution chapters"""
    logging.info(f"Seeding {len(chapters)} chapters...")
    
    for chapter in chapters:
        try:
            result = supabase.table('constitution_chapters').upsert({
                'chapter_number': chapter['chapter_number'],
                'title_en': chapter['title_en'],
                'title_sw': chapter.get('title_sw', '')
            }, on_conflict='chapter_number').execute()
            logging.info(f"  ✓ Chapter {chapter['chapter_number']}: {chapter['title_en'][:40]}...")
        except Exception as e:
            logging.error(f"  ✗ Chapter {chapter['chapter_number']}: {e}")

def seed_sections(sections):
    """Seed constitution sections/articles"""
    logging.info(f"Seeding {len(sections)} articles...")
    
    # Get chapter ID mapping
    chapters = supabase.table('constitution_chapters').select('id, chapter_number').execute()
    chapter_map = {c['chapter_number']: c['id'] for c in chapters.data}
    
    for section in sections:
        try:
            chapter_id = chapter_map.get(section['chapter_number'])
            if not chapter_id:
                logging.warning(f"  ⚠ No chapter found for Article {section['article_number']}")
                continue
            
            result = supabase.table('constitution_sections').upsert({
                'chapter_id': chapter_id,
                'article_number': section['article_number'],
                'article_label': section.get('article_label', f"Article {section['article_number']}"),
                'title_en': section['title_en'],
                'title_sw': section.get('title_sw', ''),
                'content_en': section['content_en'],
                'content_sw': section.get('content_sw', ''),
                'media_status': 'approved'
            }, on_conflict='chapter_id,article_number').execute()
            logging.info(f"  ✓ Article {section['article_number']}: {section['title_en'][:40]}...")
        except Exception as e:
            logging.error(f"  ✗ Article {section['article_number']}: {e}")

def main():
    logging.info("=" * 60)
    logging.info("CEKA CONSTITUTION FULL SEEDER")
    logging.info("=" * 60)
    
    data = load_constitution_data()
    
    seed_chapters(data['chapters'])
    seed_sections(data['sections'])
    
    logging.info("=" * 60)
    logging.info(f"COMPLETE: {len(data['chapters'])} chapters, {len(data['sections'])} articles")
    logging.info("=" * 60)

if __name__ == "__main__":
    main()
