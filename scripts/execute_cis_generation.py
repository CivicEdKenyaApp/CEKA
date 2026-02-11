import os
import json
import logging
import time
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from supabase import create_client, Client

# ==============================================================================
# CEKA CIS ARTICLE GENERATOR (FULL HAM)
# Mission: Generate 3 high-fidelity articles with Constitutional RAG Integration
# ==============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [CIS-GENERATOR] - %(levelname)s - %(message)s'
)

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
            print(f"📂 Loaded environment variables from {env_path}")
        else:
            print(f"⚠️ .env file not found at {env_path}")
    except Exception as e:
        print(f"❌ Failed to load .env file: {str(e)}")

load_env_file()

# Configuration
SUPABASE_URL = "https://cajrvemigxghnfmyopiy.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_KEY_REQUIRED")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "GEMINI_API_KEY_REQUIRED")

# MODEL UPDATES: Using standard stable model
GENERATION_MODEL = "models/gemini-flash-latest" 
EMBEDDING_MODEL = "models/gemini-embedding-001"

class CISGenerator:
    def __init__(self):
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            self.embeddings_model = EMBEDDING_MODEL
            print(f"✅ CIS Generator initialized. Gen Model: {GENERATION_MODEL}, Embed Model: {EMBEDDING_MODEL}")
        except Exception as e:
            print(f"⚠️ Initialization warning: {str(e)}")
            self.supabase = None
        
        self.prompt_path = "C:/Users/Administrator/.gemini/antigravity/brain/fabb9d5c-c69c-4a7d-b9cd-409e4a5ce4b8/cortex_article_engine_prompt.md"
        self.output_dir = "d:/CEKA/ceka v010/CEKA/generated_reports"
        os.makedirs(self.output_dir, exist_ok=True)
        
        self._load_master_prompt()

    def _load_master_prompt(self):
        try:
            with open(self.prompt_path, 'r', encoding='utf-8') as f:
                self.master_prompt = f.read()
            print("📜 CIS Master Article Engine Prompt loaded successfully.")
        except Exception as e:
            print(f"❌ Failed to load master prompt: {str(e)}")
            self.master_prompt = "ROLE: CEKA MASTER ARTICLE ENGINE. GO HAM."

    def retrieve_constitutional_context(self, query: str) -> str:
        """Performs RAG to retrieve the 2010 Constitution clauses relevant to the topic."""
        print(f"🔎 Retrieving Constitutional Context for: {query}...")
        
        if not self.supabase:
            return "Constitutional RAG Offline (DB Connection failed)."

        try:
            # Generate embedding for the query
            response = genai.embed_content(
                model=self.embeddings_model,
                content=query,
                task_type="retrieval_query"
            )
            embedding = response['embedding']
            
            # Query pgvector via Supabase RPC
            res = self.supabase.rpc("match_constitution", {
                "query_embedding": embedding,
                "match_threshold": 0.5,
                "match_count": 5
            }).execute()
            
            if res.data:
                context = "\n\n".join([f"[{d['clause_ref']}]: {d['content']}" for d in res.data])
                print(f"📖 Retrieved {len(res.data)} relevant Articles.")
                return f"### CONSTITUTIONAL_CONTEXT (2010 CONSTITUTION)\n{context}"
            return "No specific constitutional matches found."
        except Exception as e:
            print(f"❌ RAG Retrieval failed: {str(e)}")
            return "Constitutional RAG Unavailable for this run."

    def generate_article(self, topic: Dict[str, Any]):
        print(f"🧠 Generating Article (REAL): {topic['topic']}...")
        
        # Step 1: Incorruptible Memory (RAG)
        constitutional_context = self.retrieve_constitutional_context(topic['topic'])
        
        # Step 2: Assemble Full Context Prompt
        full_system_prompt = f"{self.master_prompt}\n\n{constitutional_context}\n\nCRITICAL CONSTRAINTS: MINIMUM LENGTH 7500 CHARACTERS (approx 1500-2500 words). GO DEEP. PROVIDE COMPREHENSIVE ANALYSIS."
        
        input_payload = json.dumps(topic, indent=2)
        
        model = genai.GenerativeModel(GENERATION_MODEL)
        
        try:
            response = model.generate_content(
                f"SYSTEM_PROMPT: {full_system_prompt}\n\nINPUT_PAYLOAD: {input_payload}\n\nMISSION: EXECUTE REAL FULL HAM GENERATION. ENSURE LENGTH > 7500 CHARS.",
                generation_config={"temperature": 0.3, "top_p": 0.95, "max_output_tokens": 8192}
            )
            
            raw_text = response.text
            self._save_results(topic['topic'], raw_text)
            
        except Exception as e:
            print(f"❌ Generation failure for {topic['topic']}: {str(e)}")

    def _save_results(self, topic_title: str, content: str):
        # Extract metadata if possible
        metadata = {}
        if "<!-- META" in content:
            try:
                meta_raw = content.split("<!-- META")[1].split("-->")[0].strip()
                metadata = json.loads(meta_raw)
            except:
                pass

        # Save to file
        slug = topic_title.lower().replace(" ", "_").replace("/", "_").replace("?", "")
        filename = f"{self.output_dir}/{slug}_cis_report.html"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Saved HTML report to: {filename}")
        
        if self.supabase:
            # Insert into DB if possible
            try:
                self.supabase.table("generated_articles").insert({
                    "title": topic_title,
                    "excerpt": metadata.get("excerpt", f"CIS Report on {topic_title}"),
                    "content": content,
                    "status": "draft", # Start as draft for review
                    "analysis_score": int(metadata.get("factual_integrity", 0.99) * 100),
                    "verification_metrics": metadata,
                    "author": "CEKA MASTER ENGINE"
                }).execute()
                print(f"💾 Inserted into 'generated_articles' DB.")
            except Exception as e:
                print(f"⚠️ DB Insert failed: {str(e)}")

    def run_batch(self):
        tasks = [
            {
                "task_id": str(uuid.uuid4()),
                "topic": "Gender Based Violence in Kenya",
                "angle": "Analysis of legal protections in the 2010 Constitution vs rigid cultural norms.",
                "audience": "General Public, Policy Makers",
                "target_length": "2500 words", # Increased to ensure >7500 chars
                "tone": "Investigative, Authoritative, Empathetic",
                "keywords": ["GBV", "Article 27", "Protection from Abuse", "Kenyan Law"],
                "publish_target": "web",
                "required_sources": ["constitution_2010", "kdhs_2022"],
                "deliverables": ["html", "metadata_json"]
            },
            {
                "task_id": str(uuid.uuid4()),
                "topic": "How to Register as a Voter for 2027 Elections and Why",
                "angle": "Practical guide + civic duty argument based on sovereignty.",
                "audience": "Youth (18-35), First-time Voters",
                "target_length": "2500 words", # Increased
                "tone": "Motivational, Instructional, Urgent",
                "keywords": ["IEBC", "Voter Registration", "Article 38", "2027 Elections"],
                "publish_target": "web",
                "required_sources": ["constitution_2010", "iebc_guidelines"],
                "deliverables": ["html", "metadata_json"]
            },
            {
                "task_id": str(uuid.uuid4()),
                "topic": "Why Care About Civic Education/Politics?",
                "angle": "Connecting political participation directly to daily economic reality.",
                "audience": "Disillusioned Citizens, Apathetic Youth",
                "target_length": "2500 words", # Increased
                "tone": "Persuasive, Hard-hitting, Witty",
                "keywords": ["Civic Education", "Article 1", "Public Participation", "Accountability"],
                "publish_target": "web",
                "required_sources": ["constitution_2010"],
                "deliverables": ["html", "metadata_json"]
            }
        ]
        
        for task in tasks:
            self.generate_article(task)
            print("⏳ Waiting 10s to respect rate limits...")
            time.sleep(10) # Increased delay

if __name__ == "__main__":
    GENERATOR = CISGenerator()
    GENERATOR.run_batch()
