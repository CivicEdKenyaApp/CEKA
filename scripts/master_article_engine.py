import os
import time
import json
import uuid
import logging
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from sovereign_ai_router import get_router
from const_rag import ConstitutionRAG

# ==============================================================================
# CEKA MASTER ARTICLE ENGINE (THE SOVEREIGN MIND)
# Mission: Generate world-class, human-quality civic education content.
# Rigor: Military Grade (RAG + Autoshift + Length Enforcement)
# ==============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [MASTER-ENGINE] - %(levelname)s - %(message)s'
)

class MasterArticleEngine:
    def __init__(self):
        self._load_env()
        self.router = get_router()
        self.rag = ConstitutionRAG()
        self.supabase: Client = self._init_supabase()
        self.output_dir = "generated_reports"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # The Uncompromising Master Prompt (Attuned)
        self.master_prompt_template = """
        ====================================================================
        CEKA SOVEREIGN MIND — THE MASTER ARTICLE ENGINE INVOKED
        ====================================================================
        
        TASK_ID: {task_id}
        TOPIC: {topic}
        ANGLE: {angle}
        AUDIENCE: {audience}
        TONE: {tone}
        TARGET LENGTH: 8000-10000 characters (STRICT MINIMUM: 7500 chars)
        KEYWORDS: {keywords}
        
        === CONSTITUTIONAL FOUNDATION (INCORRUPTIBLE MEMORY) ===
        The following Articles from the Constitution of Kenya (2010) have been 
        retrieved as the absolute legal basis for this article. 
        YOU MUST cite these Article numbers using the [CEKA_SRC] token.
        
        {context_str}
        ========================================================
        
        PRIMARY COMMAND:
        Speak as THE ORACLE OF THE SOVEREIGN CITIZEN. Your tone is witty, authoritative, 
        and deeply patriotic. You are sarcastic only toward corruption or bureaucratic 
        inefficiency. You are writing for the Kenyan commoner—the BOSS.
        
        ARTICLE STRUCTURE:
        1. LEDE (Punchy, 2-3 sentences): Start with a practical, human example of {topic} 
           to draw the reader in smoothly.
        2. NUT GRAF: Explain why this matters NOW and the roadmap of the piece.
        3. MID-BODY: Persuade the reader to keep reading. Capture attention with 
           frequent but very well-placed breaks (H2/H3).
        4. DATA BOXES: For each numeric claim, insert a small [DATA: ...] callout.
        5. WITTY OUTTAKE: End with a memorable, humane perspective that leaves the boss empowered.
        
        STYLE RULES:
        - Use Kenyan English (resonant particles allowed).
        - NO em-dashes (—). Use colons (:) or periods (.).
        - NO AI Jargon ("delve deeper", "comprehensive guide", "important to note").
        - NO fluff. Every paragraph must have legal or social substance.
        
        OUTPUT FORMAT (HTML):
        - Output semantic HTML only (h1, h2, h3, p, blockquote, ul, ol, table).
        - Wrap in <article class="prose max-w-none">.
        - INCLUDE A HIDDEN METADATA JSON BLOCK in HTML comments:
        <!-- CEKA_META {{
            "author": "CEKA MASTER ENGINE",
            "factual_integrity": 0.99,
            "constitutional_intersections": {keywords},
            "status": "GREEN"
        }} -->
        """

    def _load_env(self):
        if os.path.exists(".env"):
            with open(".env", "r") as f:
                for line in f:
                    if "=" in line and not line.startswith("#"):
                        k, v = line.strip().split("=", 1)
                        os.environ[k] = v

    def _init_supabase(self) -> Client:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if url and key:
            return create_client(url, key)
        return None

    def generate(self, task: Dict[str, Any]):
        logging.info(f"🚀 MISSION START: {task['topic']}")
        
        # 1. RAG RETRIEVAL (Incorruptible Memory)
        logging.info("   📚 Consulting Constitutional Memory...")
        context_items = self.rag.retrieve_context(f"{task['topic']} {task['angle']}", limit=8)
        
        context_str = ""
        for item in context_items:
            context_str += f"[Article {item['clause_ref']}] {item['content']}\n\n"
        
        if not context_str:
            context_str = "[SYSTEM_NOTE] No specific articles found. Defaulting to Chapter 1: Sovereignty of the People."

        # 2. PROMPT CONSTRUCTION
        prompt = self.master_prompt_template.format(
            task_id=task['task_id'],
            topic=task['topic'],
            angle=task['angle'],
            audience=task['audience'],
            tone=task['tone'],
            keywords=json.dumps(task['keywords']),
            context_str=context_str
        )

        # 3. EXECUTION (The Router)
        try:
            logging.info("   ⚡ Engaging Sovereign Router (Omni-Model / Autoshift)...")
            content = self.router.generate(prompt, system_instruction="You are the CEKA Sovereign Engine. Author: CEKA. Minimum 8000 chars.")
            
            # 4. LENGTH ENFORCEMENT LOOP (FULL HAM)
            char_count = len(content)
            loop_count = 0
            while char_count < 7500 and loop_count < 3:
                logging.warning(f"   ⚠️ Length Failure ({char_count} chars). Triggering Expansion Loop {loop_count+1}...")
                expansion_prompt = f"""
                CRITICAL INSTRUCTION: The draft is too short ({char_count} chars). 
                The Boss demands a 10,000 character deep dive. 
                EXPAND the following article by adding more legal analysis, historical context, 
                and street-level metaphors. DO NOT repeat yourself. 
                
                DRAFT TO EXPAND:
                {content}
                """
                content = self.router.generate(expansion_prompt)
                char_count = len(content)
                loop_count += 1

            # 5. FINAL SANITIZATION
            content = content.replace("—", ":").replace(" - ", ": ") # Kill em-dashes
            
            self._save_and_publish(task, content)
            
        except Exception as e:
            logging.error(f"❌ MISSION FAILED: {str(e)}")

    def _save_and_publish(self, task, content):
        slug = task['topic'].lower().replace(" ", "_").replace("/", "_").replace("?", "")
        filename = f"{self.output_dir}/{slug}_cis_report.html"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        logging.info(f"✅ Article Saved: {filename} ({len(content)} chars)")
        
        if self.supabase:
            try:
                # Save to generated_articles table (The Ingress)
                self.supabase.table("generated_articles").insert({
                    "id": task['task_id'],
                    "title": task['topic'],
                    "excerpt": f"A sovereign deep-dive into {task['topic']}.",
                    "content": content,
                    "status": "draft",
                    "analysis_score": 99,
                    "seo_keywords": task['keywords'],
                    "author": "CEKA"
                }).execute()
                logging.info(f"💾 Pushed to Logic Throne for Review.")
            except Exception as e:
                logging.error(f"⚠️ DB Sync failed: {str(e)}")

def run_ham():
    engine = MasterArticleEngine()
    
    tasks = [
        {
            "task_id": str(uuid.uuid4()),
            "topic": "Gender Based Violence in Kenya",
            "angle": "Constitutional Protection vs Societal Reality",
            "audience": "General Public, Youth, Policy Makers",
            "tone": "Urgent, Analytical, Powerful",
            "keywords": ["Article 29", "Article 27", "GBV", "Human Rights"]
        },
        {
            "task_id": str(uuid.uuid4()),
            "topic": "How to Register as a Voter for 2027 Elections",
            "angle": "Exercising Article 1: The Power of the Thumb",
            "audience": "Gen-Z, First time voters",
            "tone": "Educational, Inspiring, Corrective",
            "keywords": ["IEBC", "Article 38", "Voter Registration", "Sovereignty"]
        },
        {
            "task_id": str(uuid.uuid4()),
            "topic": "Why Care About Civic Education and Politics?",
            "angle": "The Price of Apathy is Governance by Thieves",
            "audience": "Corporate Kenya, Apathetic Citizens",
            "tone": "Provocative, Witty, Informational",
            "keywords": ["Article 1", "Public Participation", "Civic Education", "Political Awareness"]
        }
    ]
    
    for task in tasks:
        engine.generate(task)
        logging.info("⏳ Respecting 5-Mind Harmony (15s Cooldown)...")
        time.sleep(15)

if __name__ == "__main__":
    run_ham()
