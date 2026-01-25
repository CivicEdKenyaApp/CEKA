import os
import logging
from typing import List, Dict, Any
from supabase import create_client, Client
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

class VectorStoreService:
    def __init__(self):
        self.url = os.environ.get('SUPABASE_URL')
        self.key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        self.openai_key = os.environ.get('OPENAI_API_KEY')
        
        if self.url and self.key:
            self.supabase: Client = create_client(self.url, self.key)
            self.embeddings = OpenAIEmbeddings(openai_api_key=self.openai_key) if self.openai_key else None
        else:
            self.supabase = None
            self.embeddings = None

    async def ingest_document(self, resource_id: str, content: str, metadata: Dict = {}):
        """Split, embed and store a document in pgvector."""
        if not self.supabase or not self.embeddings:
            logger.warning("AI features disabled: Missing Supabase or OpenAI keys.")
            return

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_text(content)
        
        vectors = self.embeddings.embed_documents(chunks)
        
        data = []
        for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
            data.append({
                "resource_id": resource_id,
                "content": chunk,
                "embedding": vector,
                "metadata": {**metadata, "index": i}
            })

        self.supabase.table("document_embeddings").insert(data).execute()
        logger.info(f"Ingested {len(chunks)} fragments for resource {resource_id}")

    async def search_context(self, query: str, limit: int = 5) -> List[Dict]:
        """Perform semantic search for relevant legislative context."""
        if not self.supabase or not self.embeddings: return []
        
        query_vector = self.embeddings.embed_query(query)
        
        # Call the RPC function defined in our SQL schema (or a custom one)
        # Note: We need to ensure a 'match_documents' RPC exists or use direct query
        result = self.supabase.rpc(
            'match_documents', 
            {
                'query_embedding': query_vector,
                'match_threshold': 0.7,
                'match_count': limit
            }
        ).execute()

        return result.data if result.data else []

vector_store = VectorStoreService()
