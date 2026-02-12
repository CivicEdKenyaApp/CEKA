import os
import time
import logging
import random
import requests
import json
import google.generativeai as genai
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List

# ==============================================================================
# SOVEREIGN AI ROUTER (The Unstoppable Mind)
# Mission: Orchestrate multi-provider intelligence with zero downtime (Autoshift).
# ==============================================================================

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [OMNI-ROUTER] - %(levelname)s - %(message)s')

class AIProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        pass

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "models/gemini-2.0-flash"):
        self.api_key = api_key
        self.model_name = model_name
        genai.configure(api_key=self.api_key)
        self._model = genai.GenerativeModel(self.model_name)

    @property
    def name(self) -> str:
        return f"Gemini ({self.model_name})"

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        # Gemini handling of system instruction is via model init or prompt prefix
        # We'll prepend for simplicity if not natively supported in this version
        full_prompt = f"System: {system_instruction}\n\nUser: {prompt}" if system_instruction else prompt
        
        try:
            response = self._model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Gemini Error: {str(e)}")

class OpenRouterProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "openai/gpt-4o"): # Defaulting to high tier, can request others
        self.api_key = api_key
        self.model_name = model_name
        self.url = "https://openrouter.ai/api/v1/chat/completions"

    @property
    def name(self) -> str:
        return f"OpenRouter ({self.model_name})"

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ceka.ke", 
            "X-Title": "CEKA Sovereign Engine"
        }
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        data = {
            "model": self.model_name,
            "messages": messages
        }

        response = requests.post(self.url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            raise Exception(f"OpenRouter Error {response.status_code}: {response.text}")

class GroqProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "llama3-70b-8192"):
        self.api_key = api_key
        self.model_name = model_name
        self.url = "https://api.groq.com/openai/v1/chat/completions"

    @property
    def name(self) -> str:
        return f"Groq ({self.model_name})"

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        data = {
            "model": self.model_name,
            "messages": messages
        }

        response = requests.post(self.url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            raise Exception(f"Groq Error {response.status_code}: {response.text}")

class MistralProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "mistral-large-latest"):
        self.api_key = api_key
        self.model_name = model_name
        self.url = "https://api.mistral.ai/v1/chat/completions"

    @property
    def name(self) -> str:
        return f"Mistral ({self.model_name})"

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        data = {
            "model": self.model_name,
            "messages": messages
        }

        response = requests.post(self.url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            raise Exception(f"Mistral Error {response.status_code}: {response.text}")

class DeepSeekProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "deepseek-chat"):
        self.api_key = api_key
        self.model_name = model_name
        self.url = "https://api.deepseek.com/chat/completions"

    @property
    def name(self) -> str:
        return f"DeepSeek ({self.model_name})"

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        data = {
            "model": self.model_name,
            "messages": messages,
            "stream": False
        }

        response = requests.post(self.url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            raise Exception(f"DeepSeek Error {response.status_code}: {response.text}")


class SovereignRouter:
    def __init__(self):
        self.providers: List[AIProvider] = []
        self._load_providers()

    def _load_providers(self):
        # 1. Gemini (Primary)
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                self.providers.append(GeminiProvider(gemini_key))
                logging.info("✅ Provider Loaded: Gemini")
            except Exception as e:
                logging.error(f"⚠️ Failed to load Gemini: {e}")

        # 2. OpenRouter (Secondary)
        or_key = os.getenv("OPENROUTER_API_KEY")
        if or_key:
            try:
                self.providers.append(OpenRouterProvider(or_key))
                logging.info("✅ Provider Loaded: OpenRouter")
            except Exception as e:
                logging.error(f"⚠️ Failed to load OpenRouter: {e}")

        # 3. Groq (Fast Fallback)
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            try:
                self.providers.append(GroqProvider(groq_key))
                logging.info("✅ Provider Loaded: Groq")
            except Exception as e:
                logging.error(f"⚠️ Failed to load Groq: {e}")

        # 4. Mistral (Backup)
        mistral_key = os.getenv("MISTRAL_API_KEY")
        if mistral_key:
            try:
                self.providers.append(MistralProvider(mistral_key))
                logging.info("✅ Provider Loaded: Mistral")
            except Exception as e:
                logging.error(f"⚠️ Failed to load Mistral: {e}")

        # 5. DeepSeek (Reserve)
        ds_key = os.getenv("DEEPSEEK_API_KEY")
        if ds_key:
             try:
                self.providers.append(DeepSeekProvider(ds_key))
                logging.info("✅ Provider Loaded: DeepSeek")
             except Exception as e:
                logging.error(f"⚠️ Failed to load DeepSeek: {e}")

        if not self.providers:
            logging.critical("❌ NO AI PROVIDERS AVAILABLE. SYSTEM IS BRAINDEAD.")

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        The Autoshift Engine: Tries providers in sequence until one succeeds.
        """
        errors = []
        for provider in self.providers:
            try:
                logging.info(f"🧠 Engaging: {provider.name}...")
                start_time = time.time()
                response = provider.generate(prompt, system_instruction)
                duration = time.time() - start_time
                logging.info(f"⚡ Success: {provider.name} responded in {duration:.2f}s")
                return response
            except Exception as e:
                error_msg = str(e)
                logging.warning(f"⚠️ Autoshift Triggered: {provider.name} failed. Reason: {error_msg}")
                errors.append(f"{provider.name}: {error_msg}")
                continue # Try next provider
        
        # If we get here, all failed
        raise Exception(f"🔥 ALL SOVEREIGN ENGINES FAILED. Cascade Errors: {'; '.join(errors)}")

# Functional Interface for Scripts
def get_router():
    # Helper to load env if needed (redundant if main script does, but safe)
    if not os.getenv("GEMINI_API_KEY") and os.path.exists(".env"):
         # Simple env loader
         with open(".env", "r") as f:
             for line in f:
                 if "=" in line and not line.startswith("#"):
                     k,v = line.strip().split("=", 1)
                     os.environ[k] = v
    return SovereignRouter()
