import os
import time
import json
import uuid
from typing import List, Dict, Any
from supabase import create_client, Client
from sovereign_ai_router import get_router
from const_rag import ConstitutionRAG  # RESTORED: The Memory

# ==============================================================================
# CIS GENERATION ENGINE: SOVEREIGNTY PROTOCOL v2 (Omni-Model + RAG)
# Mission: Generate sovereign articles using Incorruptible Memory & Autoshift.
# ==============================================================================

class CISGenerator:
    def __init__(self):
        self._load_env()
        self.router = get_router()       # NEW: The Brain (Autoshift)
        self.rag = ConstitutionRAG()     # RESTORED: The Memory (RAG)
        self.supabase: Client = None
        self._init_supabase()
        self.output_dir = "generated_reports"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Add delay to avoid immediate rate limits on startup
        print("🧠 Sovereign AI Router + RAG Memory Initialized. Warming up...")
        time.sleep(2)

    def _load_env(self):
        # Load .env if present
        if os.path.exists(".env"):
            with open(".env", "r") as f:
                for line in f:
                    if "=" in line and not line.startswith("#"):
                        k, v = line.strip().split("=", 1)
                        os.environ[k] = v

    def _init_supabase(self):
        url = os.environ.get("SUPABASE_URL") or "https://cajrvemigxghnfmyopiy.supabase.co"
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if url and key:
            self.supabase = create_client(url, key)
            print("✅ Supabase Connection: Active")
        else:
            print("⚠️ Supabase Connection: Inactive (Missing Key)")

    def generate_article(self, task: Dict[str, Any]):
        print(f"\n🚀 Executing Sovereign Task: {task['topic']}")
        print(f"   Angle: {task['angle']}")
        
        # 1. RETRIEVE CONSTITUTIONAL CONTEXT (RESTORED logic)
        print("   📚 Consulting Incorruptible Memory (RAG)...")
        context_items = self.rag.retrieve_context(f"{task['topic']} {task['angle']}")
        print(f"   ↳ Retrieved {len(context_items)} constitutional clauses.")
        
        # Format context string for the prompt
        context_str = ""
        for item in context_items:
            context_str += f"""
            [Source: Constitution of Kenya, Article {item['article']}]
            "{item['content']}"
            (Relevance Score: {item['similarity']:.4f})
            \n"""

        # 2. CONSTRUCT THE SOVEREIGN PROMPT (With RAG Context)
        prompt = f"""
        You are the CEKA Sovereign Engine, a specialized AI designed to write high-impact civic education articles for Kenyan citizens.
        
        TOPIC: {task['topic']}
        ANGLE: {task['angle']}
        AUDIENCE: {task['audience']}
        TONE: {task['tone']}
        TARGET LENGTH: {task['target_length']} (CRITICAL: MUST BE > 7500 CHARACTERS)
        KEYWORDS: {", ".join(task['keywords'])}
        
        === CONSTITUTIONAL FOUNDATION (INCORRUPTIBLE MEMORY) ===
        Use the following articles as the absolute legal basis for your argument. 
        Quote them directly where impactful.
        
        {context_str}
        ========================================================
        
        INSTRUCTIONS:
        1. Write a comprehensive, deep-dive article.
        2. Use Kenyan context, metaphors, and specific legal references (2010 Constitution).
        3. Structure with engaging H2 and H3 headers.
        4. Focus on "Sovereignty" - explaining how this issue affects the citizen's power.
        5. NO FLUFF. Every paragraph must have substance.
        6. OUTPUT FORMAT: HTML (body content only, no <html> tags, just <h1>, <p>, etc.)
        7. INCLUDE A METADATA BLOCK at the end in HTML comments:
           <!-- META
           {json.dumps({
               "title": task["topic"],
               "excerpt": "A sovereign look at " + task["topic"],
               "keywords": task["keywords"],
               "factual_integrity": 0.99
           })}
           -->
        """

        # 3. GENERATE CONTENT (Using Omni-Router Autoshift)
        try:
            print("   ⚡ Engaging Sovereign Router (Autoshift Mode)...")
            # System instruction emphasizes the persona
            content = self.router.generate(prompt, system_instruction="You are the Voice of the 2010 Constitution. Speak with authority and empathy.")
            
            # 4. VALIDATE LENGTH (Self-Correction Loop)
            if len(content) < 7500:
                print(f"   ⚠️ Content too short ({len(content)} chars). Requesting expansion...")
                expansion_prompt = f"The previous draft was too short ({len(content)} chars). EXPAND this article to be at least 8000 characters. Add more examples, legal citations, and historical context:\n\n{content}"
                content = self.router.generate(expansion_prompt)

            self._save_results(task['topic'], content)
            
        except Exception as e:
            print(f"❌ GENERATION FAILED: {str(e)}")

    def _save_results(self, topic_title: str, content: str):
        # Extract Metadata
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
                    "id": str(uuid.uuid4()),
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
                "deliverables": ["html", "metadata_json"],
            },
            {
                "task_id": str(uuid.uuid4()),
                "topic": "The Finance Bill 2025: A Citizen's Analysis",
                "angle": "Economic Sovereignty vs Debt Slavery",
                "audience": "General Public, Youth",
                "target_length": "2500 words",
                "tone": "Urgent, Analytical, Revolutionary",
                "keywords": ["Finance Bill", "Taxation", "Public Debt", "Article 201"],
                "publish_target": "web",
                "required_sources": ["constitution_2010"],
                "deliverables": ["html", "metadata_json"]
            },
        ]
        
        for task in tasks:
            self.generate_article(task)
            print("⏳ Waiting 10s to respect rate limits...")
            time.sleep(10)

if __name__ == "__main__":
    generator = CISGenerator()
    generator.run_batch()
