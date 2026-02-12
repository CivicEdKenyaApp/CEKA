import os
import google.generativeai as genai
from supabase import create_client, Client
from typing import List, Dict, Any

# ==============================================================================
# CONSTITUTIONAL RAG MEMORY (The Incorruptible Record)
# Mission: Retrieve precise legal context from the 2010 Constitution.
# ==============================================================================

class ConstitutionRAG:
    def __init__(self):
        self._load_env()
        self._setup_gemini()
        self.supabase: Client = None
        self._init_supabase()

    def _load_env(self):
        if os.path.exists(".env"):
            with open(".env", "r") as f:
                for line in f:
                    if "=" in line and not line.startswith("#"):
                        k, v = line.strip().split("=", 1)
                        os.environ[k] = v

    def _setup_gemini(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise Exception("❌ GEMINI_API_KEY not found for RAG embeddings.")
        genai.configure(api_key=api_key)
        self.embed_model = "models/gemini-embedding-001"

    def _init_supabase(self):
        url = os.getenv("SUPABASE_URL") or "https://cajrvemigxghnfmyopiy.supabase.co"
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if url and key:
            self.supabase = create_client(url, key)
        else:
            print("⚠️ Supabase Credentials Missing for RAG.")

    def get_embedding(self, text: str) -> List[float]:
        try:
            result = genai.embed_content(
                model=self.embed_model,
                content=text,
                task_type="retrieval_query"
            )
            return result['embedding']
        except Exception as e:
            print(f"❌ Embedding Error: {e}")
            return []

    def retrieve_context(self, query: str, limit: int = 5, threshold: float = 0.5) -> List[Dict[str, Any]]:
        """
        Retrieves relevant constitutional articles based on semantic similarity.
        """
        if not self.supabase:
            return []

        print(f"   🔍 RAG Query: '{query}'")
        query_embedding = self.get_embedding(query)
        
        if not query_embedding:
            return []

        try:
            # Call the Supabase RPC function 'match_constitution'
            response = self.supabase.rpc(
                "match_constitution",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": threshold,
                    "match_count": limit
                }
            ).execute()
            
            return response.data or []
            
        except Exception as e:
            print(f"⚠️ RAG Retrieval Failed: {e}")
            # Fallback: Return nothing, generation proceeds without context (less sovereign, but functional)
            return []

# Test execution prevents import errors
if __name__ == "__main__":
    rag = ConstitutionRAG()
    test_results = rag.retrieve_context("freedom of speech")
    print(f"Test Retrieval: {len(test_results)} results found.")
