import os
import asyncio
import json
import logging
import random
import re
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple, Any

import aiohttp
import asyncpg
import backoff
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("ai_generator.log")
    ]
)
logger = logging.getLogger("CekaContentGenerator")

# Load environment variables
load_dotenv()

# --- Configuration & Constants ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DB_CONNECTION_STRING = os.getenv("DB_CONNECTION_STRING") # Optional, for direct asyncpg

if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY not found in environment variables.")
    raise ValueError("GEMINI_API_KEY is required.")

# --- Pydantic Models for Validation ---

class ArticleSection(BaseModel):
    heading: str
    content: str

class ArticleData(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: str
    content: str
    seo_keywords: List[str]
    meta_description: str
    word_count: int
    readability_score: Optional[float] = None
    references: List[str] = Field(default_factory=list)

class GenerationResult(BaseModel):
    success: bool
    data: Optional[ArticleData] = None
    error: Optional[str] = None
    tokens_used: int = 0
    model_name: str

# --- Advanced Rate Limiter & Circuit Breaker ---

class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF-OPEN

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            logger.warning(f"Circuit breaker OPENED after {self.failure_count} failures.")

    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"
        self.last_failure_time = None

    def can_execute(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if (datetime.now() - self.last_failure_time).total_seconds() > self.recovery_timeout:
                self.state = "HALF-OPEN"
                logger.info("Circuit breaker HALF-OPEN, attempting recovery.")
                return True
            return False
        return True  # HALF-OPEN

class AdvancedRateLimiter:
    def __init__(self):
        # Buckets for different models: {model_name: {tokens: int, requests: int, last_refill: datetime}}
        self.buckets = {}
        self.circuit_breakers = {}
        
        # Default limits (fallback)
        self.default_limits = {
            'gemini-1.5-pro': {'rpm': 2, 'tpm': 32000},
            'gemini-1.5-flash': {'rpm': 15, 'tpm': 100000},
            'deepseek-chat': {'rpm': 60, 'tpm': 50000}
        }

    def get_bucket(self, model_name: str):
        if model_name not in self.buckets:
            limits = self.default_limits.get(model_name, {'rpm': 2, 'tpm': 32000})
            self.buckets[model_name] = {
                'tokens': limits['tpm'],
                'requests': limits['rpm'],
                'last_refill': datetime.now(),
                'limits': limits
            }
            self.circuit_breakers[model_name] = CircuitBreaker()
        return self.buckets[model_name]

    def _refill_bucket(self, bucket, model_name):
        now = datetime.now()
        elapsed = (now - bucket['last_refill']).total_seconds()
        
        if elapsed > 60:
            limits = bucket['limits']
            bucket['tokens'] = limits['tpm']
            bucket['requests'] = limits['rpm']
            bucket['last_refill'] = now

    def can_make_request(self, model_name: str, estimated_tokens: int) -> Tuple[bool, float]:
        if model_name not in self.circuit_breakers:
             self.get_bucket(model_name) # Initialize if missing

        if not self.circuit_breakers[model_name].can_execute():
            return False, 60.0

        bucket = self.get_bucket(model_name)
        self._refill_bucket(bucket, model_name)

        if bucket['requests'] <= 0 or bucket['tokens'] < estimated_tokens:
            wait_seconds = 60 - (datetime.now() - bucket['last_refill']).total_seconds()
            return False, max(1.0, wait_seconds)

        return True, 0.0

    def consume(self, model_name: str, tokens: int):
        bucket = self.get_bucket(model_name)
        bucket['requests'] -= 1
        bucket['tokens'] -= tokens

    def record_error(self, model_name: str):
         if model_name in self.circuit_breakers:
            self.circuit_breakers[model_name].record_failure()

    def record_success(self, model_name: str):
        if model_name in self.circuit_breakers:
            self.circuit_breakers[model_name].record_success()


# --- Main Generator Class ---

class CekaContentGenerator:
    def __init__(self):
        self._validate_environment()
        
        # Initialize Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        self.gemini_models = {
            'complex': genai.GenerativeModel('gemini-1.5-pro'),
            'standard': genai.GenerativeModel('gemini-1.5-flash'),
            'simple': genai.GenerativeModel('gemini-1.5-flash')
        }
        
        self.rate_limiter = AdvancedRateLimiter()
        self.cache = {}
        self.cache_timeout = 300 # 5 minutes
        self.last_cache_refresh = datetime.min

    def _validate_environment(self):
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError("Supabase URL and Key are required.")
    
    async def _init_db_pool(self):
        # Create a connection pool to the database
        # For simplicity in this script, we'll assume direct connection if string provided
        # or use Supabase-py client (simulated here with HTTP for broader compatibility)
        if DB_CONNECTION_STRING:
             return await asyncpg.create_pool(DB_CONNECTION_STRING)
        return None

    # --- Supabase Interactions (using REST for simplicity/portability) ---
    async def _supabase_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Any:
        headers = {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
        
        async with aiohttp.ClientSession() as session:
            async with session.request(method, url, headers=headers, json=data, params=params) as response:
                if response.status >= 400:
                    text = await response.text()
                    logger.error(f"Supabase Error ({response.status}): {text}")
                    raise Exception(f"Supabase request failed: {text}")
                try:
                    return await response.json()
                except:
                    return await response.text()

    async def _get_pending_queue_items(self, limit: int = 5) -> List[Dict]:
        try:
            # Atomic update to lock items would be better, but standard select for now
            params = {
                "select": "*",
                "status": "eq.pending",
                "order": "priority.desc,scheduled_for.asc",
                "limit": str(limit)
            }
            return await self._supabase_request("GET", "content_queue", params=params)
        except Exception as e:
            logger.error(f"Failed to fetch queue: {e}")
            return []

    async def _update_queue_status(self, queue_id: str, status: str, details: Dict = None):
        data = {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}
        if status == 'processing':
            data["started_at"] = datetime.now(timezone.utc).isoformat()
        elif status in ['completed', 'failed']:
            data["completed_at"] = datetime.now(timezone.utc).isoformat()
            if details:
                if 'error' in details:
                    data["error_message"] = details['error']
                if 'tokens' in details:
                    data["tokens_used"] = details['tokens']
        
        await self._supabase_request("PATCH", f"content_queue?id=eq.{queue_id}", data=data)

    async def _fetch_related_data(self, topic_id: str):
        # Fetch topic, tone, template
        # Ideally this would be a joined query or multiple parallel requests
        topic = await self._supabase_request("GET", f"content_topics?id=eq.{topic_id}")
        topic = topic[0] if topic else None
        
        if not topic:
             raise ValueError(f"Topic not found: {topic_id}")

        # Basic rotation logic for tone/template if not specified
        # For this implementation, we pick random active ones if list empty
        tones = await self._supabase_request("GET", "tone_profiles?is_active=eq.true")
        templates = await self._supabase_request("GET", "content_templates?is_active=eq.true")
        
        selected_tone = random.choice(tones) if tones else None
        selected_template = random.choice(templates) if templates else None
        
        return topic, selected_tone, selected_template

    # --- Content Generation Logic ---

    def _build_prompt(self, topic: Dict, tone: Dict, template: Dict) -> str:
        prompt_parts = [
            "SYSTEM PROMPT: YOU ARE A SENIOR INVESTIGATIVE JOURNALIST AND CIVIC EDUCATOR FOR CIVIC EDUCATION KENYA (CEKA).",
            f"YOUR GOAL IS TO WRITE A HIGH-QUALITY, SEO-OPTIMIZED ARTICLE ABOUT: {topic['name']}",
            "---",
            f"TOPIC DESCRIPTION: {topic['description']}",
            f"KEYWORDS TO INCLUDE: {', '.join(topic.get('keywords', []))}",
            "---",
            f"TONE INSTRUCTIONS: {tone['gemini_instruction'] if tone else 'Professional and informative.'}",
            "---",
            "MANDATORY REQUIREMENTS:",
            "1. CONTEXT: The content MUST be specifically tailored to the Kenyan legal and political context.",
            f"2. LOCAL REFERENCES: You MUST include at least {topic.get('min_kenyan_references', 3)} specific references to Kenyan laws (Constitution 2010), institutions (e.g., IEBC, EACC), or locations.",
            "3. STRUCTURE: Follow the structure defined below exactly.",
            f"4. LENGTH: Target approximately {topic.get('target_word_count', 1000)} words.",
            "5. OUTPUT FORMAT: The final output MUST be a valid JSON object.",
            "---",
            f"TEMPLATE STRUCTURE:\n{json.dumps(template.get('content_structure', {}), indent=2)}",
            "---",
            "OUTPUT SCHEMA (JSON ONLY):",
            "```json",
            "{",
            '  "title": "A catchy, SEO-friendly headline",',
            '  "slug": "url-friendly-slug",',
            '  "excerpt": "A 160-char summary for meta description",',
            '  "content": "The full article content in HTML format (use <h2>, <p>, <ul>, etc.)",',
            '  "seo_keywords": ["keyword1", "keyword2"],',
            '  "meta_description": "SEO meta description",',
            '  "word_count": 1200,',
            '  "references": ["Ref 1", "Ref 2"]',
            "}",
            "```",
            "Use British English (Kenyan standard). Ensure the content is accurate, unbiased, and empowering.",
            "DO NOT include any markdown code block formatting (like ```json) in the response outside of the JSON object itself, or better yet, return PURE JSON."
        ]
        return "\n".join(prompt_parts)

    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    async def _call_gemini_api(self, prompt: str, model_type: str = 'standard') -> GenerationResult:
        model_name = 'gemini-1.5-flash' if model_type == 'standard' else 'gemini-1.5-pro'
        estimated_tokens = len(prompt) // 4
        
        # Rate Limiting Check
        can_run, wait_time = self.rate_limiter.can_make_request(model_name, estimated_tokens)
        while not can_run:
            logger.warning(f"Rate limited on {model_name}. Waiting {wait_time}s.")
            await asyncio.sleep(wait_time)
            can_run, wait_time = self.rate_limiter.can_make_request(model_name, estimated_tokens)

        try:
            model = self.gemini_models[model_type]
            # Helper to run blocking sync call in async
            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            self.rate_limiter.consume(model_name, response.usage_metadata.total_token_count)
            self.rate_limiter.record_success(model_name)
            
            # Parse response
            try:
                text = response.text
                # Clean up if model included markdown blocks despite instructions
                text = re.sub(r'^```json\s*', '', text)
                text = re.sub(r'\s*```$', '', text)
                
                data_dict = json.loads(text)
                article_data = ArticleData(**data_dict)
                
                return GenerationResult(
                    success=True,
                    data=article_data,
                    tokens_used=response.usage_metadata.total_token_count,
                    model_name=model_name
                )
            except json.JSONDecodeError as e:
                logger.error(f"JSON Parse Error: {e}. Raw text: {response.text[:100]}...")
                return GenerationResult(success=False, error="Failed to parse JSON response", model_name=model_name)
            except ValidationError as e:
                logger.error(f"Validation Error: {e}")
                return GenerationResult(success=False, error=str(e), model_name=model_name)

        except Exception as e:
            self.rate_limiter.record_error(model_name)
            logger.error(f"Gemini API Error: {e}")
            raise e # Trigger backoff

    async def save_generated_article(self, result: GenerationResult, queue_item: Dict, topic: Dict):
        if not result.success or not result.data:
            return

        article = result.data
        data = {
            "queue_id": queue_item['id'],
            "topic_id": topic['id'],
            "title": article.title,
            "slug": article.slug or self._generate_slug(article.title),
            "excerpt": article.excerpt,
            "content": article.content,
            "html_content": article.content, # In this case same, but could be transformed
            "seo_keywords": article.seo_keywords,
            "meta_description": article.meta_description,
            "word_count": article.word_count,
            "readability_score": article.readability_score or 0,
            "ai_model_used": result.model_name,
            "kenyan_references": article.references,
            "status": "submitted", # Ready for review
            "submitted_for_review_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            await self._supabase_request("POST", "generated_articles", data=data)
            logger.info(f"Article '{article.title}' saved successfully.")
        except Exception as e:
            logger.error(f"Failed to save article: {e}")
            raise e

    def _generate_slug(self, title: str) -> str:
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        return f"{slug}-{int(time.time())}"

    # --- Main Loop ---

    async def process_queue(self):
        logger.info("Starting queue processing loop...")
        while True:
            try:
                items = await self._get_pending_queue_items(limit=3)
                
                if not items:
                    logger.info("No items in queue. Sleeping...")
                    await asyncio.sleep(60) # Wait 1 minute before polling again
                    continue
                
                tasks = []
                for item in items:
                    tasks.append(self.process_single_item(item))
                
                await asyncio.gather(*tasks)
                
            except Exception as e:
                logger.error(f"Global loop error: {e}")
                await asyncio.sleep(30)

    async def process_single_item(self, item: Dict):
        queue_id = item['id']
        logger.info(f"Processing item {queue_id} for topic {item.get('topic_id')}")
        
        try:
            # 1. Update status to processing
            await self._update_queue_status(queue_id, "processing")
            
            # 2. Fetch context
            topic, tone, template = await self._fetch_related_data(item['topic_id'])
            
            # 3. Build prompt
            prompt = self._build_prompt(topic, tone, template)
            
            # 4. Determine model complexity (simple logic for now)
            model_type = 'complex' if topic.get('priority', 2) == 1 else 'standard'
            
            # 5. Generate
            result = await self._call_gemini_api(prompt, model_type=model_type)
            
            if result.success:
                # 6. Save Article
                await self.save_generated_article(result, item, topic)
                
                # 7. Complete Queue Item
                await self._update_queue_status(queue_id, "completed", details={'tokens': result.tokens_used})
            else:
                # Handle generation failure (soft fail)
                await self._update_queue_status(queue_id, "failed", details={'error': result.error})

        except Exception as e:
            logger.error(f"Failed to process item {queue_id}: {e}", exc_info=True)
            await self._update_queue_status(queue_id, "failed", details={'error': str(e)})

if __name__ == "__main__":
    generator = CekaContentGenerator()
    try:
        asyncio.run(generator.process_queue())
    except KeyboardInterrupt:
        logger.info("Shutting down generator...")
