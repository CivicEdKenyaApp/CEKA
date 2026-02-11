import os
import json
import logging
import requests
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from supabase import create_client, Client

# ==============================================================================
# CEKA ATTUNED ORCHESTRATOR: THE SIS EDITION (FULL HAM)
# Mission: Constitutional RAG, Intelligence Profiles, Absolute Provance.
# ==============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [SOVEREIGN-MIND-ORCHESTRATOR] - %(levelname)s - %(message)s'
)

class AttunedSynchronizer:
    def __init__(self, api_key: str):
        self.api_key = api_key
        genai.configure(api_key=self.api_key)
        
        # Supabase Integration
        self.supabase_url = "https://cajrvemigxghnfmyopiy.supabase.co"
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_KEY_REQUIRED")
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        self.prompt_path = "C:/Users/Administrator/.gemini/antigravity/brain/fabb9d5c-c69c-4a7d-b9cd-409e4a5ce4b8/sovereign_mind_prompt.md"
        self.output_sql = "scripts/attuned_intelligence_feed.sql"
        self._load_master_prompt()
        self._load_active_profile()

    def _load_master_prompt(self):
        try:
            with open(self.prompt_path, 'r', encoding='utf-8') as f:
                self.master_prompt = f.read()
            logging.info("📜 Attuned Master Prompt loaded successfully.")
        except Exception as e:
            logging.error(f"❌ Failed to load master prompt: {str(e)}")
            self.master_prompt = "ROLE: CEKA SOVEREIGN MIND. MISSION: TRANSFORM DATA INTO CIVIC INTELLIGENCE. GO HAM."

    def _load_active_profile(self):
        """Fetches the active Intelligence Profile (Kibaki, Nyayo, Baba) from Supabase."""
        try:
            res = self.supabase.table("ai_intelligence_configs").select("*").eq("is_active", True).single().execute()
            if res.data:
                self.profile = res.data
                logging.info(f"🎭 Active Intelligence Profile: {self.profile['display_name']}")
            else:
                logging.warning("⚠️ No active profile found. Defaulting to THE_KIBAKI_LOGICIAN.")
                self.profile = {"profile_name": "DEFAULT", "system_prompt": "You are a precise constitutional scholar."}
        except Exception as e:
            logging.error(f"❌ Failed to load intelligence profile: {str(e)}")
            self.profile = {"profile_name": "DEFAULT", "system_prompt": "You are a precise constitutional scholar."}

    def retrieve_constitutional_context(self, query: str) -> str:
        """Performs RAG to retrieve the 2010 Constitution clauses relevant to the topic."""
        logging.info(f"🔎 Retrieving Constitutional Context for: {query[:50]}...")
        try:
            # Generate embedding for the query
            response = genai.embed_content(
                model="models/text-embedding-004",
                content=query,
                task_type="retrieval_query"
            )
            embedding = response['embedding']
            
            # Query pgvector via Supabase RPC (must have RAG function defined)
            # Alternatively, use a raw query if RPC isn't available.
            # For this execution, we use the matching logic.
            res = self.supabase.rpc("match_constitution", {
                "query_embedding": embedding,
                "match_threshold": 0.5,
                "match_count": 5
            }).execute()
            
            if res.data:
                context = "\n\n".join([f"[{d['clause_ref']}]: {d['content']}" for d in res.data])
                logging.info(f"📖 Retrieved {len(res.data)} relevant Articles.")
                return f"### CONSTITUTIONAL_CONTEXT (2010 CONSTITUTION)\n{context}"
            return "No specific constitutional matches found."
        except Exception as e:
            logging.error(f"❌ RAG Retrieval failed: {str(e)}")
            return "Constitutional RAG unavailable for this run."

    def execute_cov_loop(self, raw_input: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Executes the Chain of Verification (COV) loop with full RAG and Profile context."""
        title = raw_input.get('title', 'Unknown')
        logging.info(f"🧠 Initiating SIS COV Loop for: {title}")
        
        # Step 1: Incorruptible Memory (RAG)
        constitutional_context = self.retrieve_constitutional_context(f"{title} {raw_input.get('text', '')}")
        
        # Step 2: Assemble Full Context Prompt
        full_system_prompt = f"{self.master_prompt}\n\nINTELLIGENCE_PROFILE: {self.profile['system_prompt']}\n\n{constitutional_context}"
        
        model = genai.GenerativeModel("gemini-1.5-pro")
        
        try:
            response = model.generate_content(
                f"SYSTEM_PROMPT: {full_system_prompt}\n\nINPUT_PAYLOAD: {json.dumps(raw_input)}\n\nMISSION: EXECUTE CHAIN OF VERIFICATION.",
                generation_config={"temperature": 0.2, "top_p": 0.95}
            )
            
            raw_text = response.text
            parsed_result = self._parse_attuned_output(raw_text)
            
            if not parsed_result:
                logging.warning("⚠️ Output failed attunement parsing.")
                return None

            if parsed_result['metadata'].get('status') == "RED":
                logging.error("🚨 RED STATUS DETECTED.")
                return None
            
            # Enrich metadata with the profile and context used
            parsed_result['metadata']['sis_profile'] = self.profile['profile_name']
            parsed_result['metadata']['rag_enabled'] = True
            
            return parsed_result
            
        except Exception as e:
            logging.error(f"❌ Execution failure: {str(e)}")
            return None

    def _parse_attuned_output(self, text: str) -> Optional[Dict[str, Any]]:
        """Extracts HTML content and the CEKA_META JSON block."""
        try:
            if "<!-- CEKA_META" in text:
                parts = text.split("<!-- CEKA_META")
                html_content = parts[0].strip()
                meta_raw = parts[1].split("-->")[0].strip()
                metadata = json.loads(meta_raw)
                return {
                    "content": html_content,
                    "metadata": metadata,
                    "title": metadata.get("title", "Untitled Intelligence")
                }
            return None
        except Exception as e:
            logging.error(f"❌ Parsing failure: {str(e)}")
            return None

    def process_queue(self, inputs: List[Dict[str, Any]]):
        logging.info(f"🚀 Processing {len(inputs)} intelligence units.")
        verified_results = []
        for item in inputs:
            result = self.execute_cov_loop(item)
            if result:
                verified_results.append(result)
        
        if verified_results:
            self._write_sql_feed(verified_results)

    def _write_sql_feed(self, results: List[Dict[str, Any]]):
        header = "-- CEKA SIS ATTUNED INTELLIGENCE FEED\n"
        rows = []
        for res in results:
            meta = res['metadata']
            title = res['title'].replace("'", "''")
            content = res['content'].replace("'", "''")
            score = int(meta.get('factual_integrity', 0) * 100)
            metrics = json.dumps(meta).replace("'", "''")
            excerpt = f"SIS Intelligence [{meta.get('sis_profile')}] verified with score {score}%.".replace("'", "''")
            rows.append(f"('{title}', '{excerpt}', '{content}', 'draft', {score}, '{metrics}'::jsonb, 'CEKA')")

        body = "INSERT INTO public.generated_articles (title, excerpt, content, status, analysis_score, verification_metrics, author) VALUES\n" + ",\n".join(rows) + "\nON CONFLICT (title) DO NOTHING;"
        with open(self.output_sql, 'w', encoding='utf-8') as f:
            f.write(body)

if __name__ == "__main__":
    API_KEY = os.getenv("GEMINI_API_KEY", "API_KEY_REQUIRED")
    ENGINE = AttunedSynchronizer(api_key=API_KEY)
    SAMPLE_INPUTS = [{
        "title": "Universal Health Coverage Bill 2026",
        "text": "The Senate has tabled a new bill to establish the Primary Healthcare fund...",
        "source_id": "PAR-20260211"
    }]
    ENGINE.process_queue(SAMPLE_INPUTS)
