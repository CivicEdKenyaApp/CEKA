import os
import time
import json
import logging
import traceback
from supabase import create_client, Client
from sovereign_ai_router import get_router
from const_rag import ConstitutionRAG

# ==============================================================================
# SOVEREIGN SIMULATOR DAEMON (THE LOGIC THRONE BACKEND)
# Mission: Process "Dry Run" requests from the UI in real-time.
# ==============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [SIMULATOR-DAEMON] - %(levelname)s - %(message)s'
)

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

class SovereignSimulator:
    def __init__(self):
        load_env()
        self.router = get_router()
        self.rag = ConstitutionRAG()
        self.supabase: Client = create_client(
            os.environ.get("SUPABASE_URL"), 
            os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        )
        logging.info("🧠 Simulator Daemon Initialized.")

    def run_loop(self):
        logging.info("🚀 Listening for simulation requests...")
        while True:
            try:
                # Poll for pending requests
                response = self.supabase.table("sovereign_simulation_queue")\
                    .select("*")\
                    .eq("status", "pending")\
                    .limit(1)\
                    .execute()
                
                if response.data:
                    request = response.data[0]
                    self.process_request(request)
                
                time.sleep(1) # Poll interval
            except Exception as e:
                logging.error(f"❌ Loop Error: {e}")
                time.sleep(5)

    def process_request(self, request):
        req_id = request['id']
        query = request['query']
        logging.info(f"⚡ Processing Request {req_id}: '{query}'")
        
        try:
            # Update status to processing
            self.supabase.table("sovereign_simulation_queue")\
                .update({"status": "processing"})\
                .eq("id", req_id)\
                .execute()

            # 1. RAG Step
            start_time = time.time()
            context_items = self.rag.retrieve_context(query, limit=5)
            # Filter low relevance if needed, but for sim show raw
            articles = [item['clause_ref'] for item in context_items]
            context_str = "\n".join([f"[{item['clause_ref']}] {item['content']}" for item in context_items])
            
            # 2. Reasoning Step (Router)
            reasoning_prompt = f"""
            ANALYZE the following user query against the provided Constitutional Context.
            Query: {query}
            Context: {context_str}
            
            OUTPUT JSON ONLY:
            {{
                "integrity": float (0.0-1.0 based on constitutional alignment),
                "reasoning": "Internal monologue explaining the link between query and context...",
                "draft_preview": "<h1>Title</h1><p>Short snippet of how you would answer...</p>"
            }}
            """
            
            # Generate reasoning
            raw_response = self.router.generate(reasoning_prompt, system_instruction="You are the Sovereign Simulator. Output JSON.")
            
            # Simple cleanup for JSON parsing
            json_str = raw_response.replace("```json", "").replace("```", "").strip()
            result = json.loads(json_str)
            
            # Add metadata
            result['articles'] = articles
            result['process_time'] = round(time.time() - start_time, 2)
            
            # 3. Update Result
            self.supabase.table("sovereign_simulation_queue")\
                .update({
                    "status": "completed",
                    "result_json": result,
                    "processed_at": "now()"
                })\
                .eq("id", req_id)\
                .execute()
                
            logging.info(f"✅ Request {req_id} Completed in {result['process_time']}s")
            
        except Exception as e:
            logging.error(f"❌ Request {req_id} Failed: {e}")
            traceback.print_exc()
            self.supabase.table("sovereign_simulation_queue")\
                .update({
                    "status": "failed",
                    "result_json": {"error": str(e)}
                })\
                .eq("id", req_id)\
                .execute()

if __name__ == "__main__":
    sim = SovereignSimulator()
    sim.run_loop()
