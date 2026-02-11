import os
import sys
import time
import json
import logging
import re
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Set
from urllib.parse import urljoin, urlparse, unquote

# Set up logging with HAM depth
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("resource_intelligence.log", encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

class ResourceScraper:
    """
    ULTIMATE Resource Intelligence Engine (GO HAM Edition).
    Recursive, context-aware, and multi-threaded discovery of civic resources.
    """

    def __init__(self, headless=True):
        self.targets = [
            {"name": "UoN Civic Repository", "url": "https://erepository.uonbi.ac.ke/handle/11295/165330", "depth": 1, "provider": "University of Nairobi"},
            {"name": "KeMU Wiki Gateway", "url": "https://library.kemu.ac.ke/kemuwiki/index.php/The_Importance_Of_Civic_Education_In_Today_s_Society", "depth": 1, "provider": "KeMU"},
            {"name": "PMG South Africa - Kenya Context", "url": "https://pmg.org.za/bills/kenya/", "depth": 0, "provider": "PMG"},
            {"name": "Citizenship Education Kenya (BPB)", "url": "https://www.bpb.de/die-bpb/partner/nece/505385/citizenship-education-in-kenya/", "depth": 0, "provider": "BPB Germany"},
            {"name": "Controller of Budget Reports", "url": "https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports/", "depth": 1, "provider": "COB"}
        ]
        self.headless = headless
        self.data = []
        self.visited_urls: Set[str] = set()
        self.file_extensions = ('.pdf', '.docx', '.doc', '.pptx', '.xls', '.xlsx')
        self.resource_patterns = [r'/download/', r'/bitstream/', r'/handle/', r'wpdmdl=', r'\.pdf']

    async def run(self):
        logging.info("🚀 Launching ULTIMATE Resource Intelligence Hub...")
        
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                ignore_https_errors=True
            )

            for target in self.targets:
                logging.info(f"🔍 Starting Deep Crawl: {target['name']}...")
                await self.scrape_recursive(context, target['url'], target.get('depth', 1), target['provider'])

            await browser.close()
        
        self.save_data()
        return self.data

    async def scrape_recursive(self, context, url: str, depth: int, provider: str):
        if depth < 0 or url in self.visited_urls:
            return
        
        self.visited_urls.add(url)
        page = await context.new_page()
        
        try:
            print(f"DEBUG: Visiting {url}", flush=True)
            logging.info(f"   [{depth}] Visiting: {url}")
            await page.goto(url, wait_until="commit", timeout=60000)
            await page.wait_for_timeout(10000) # Give JS 10s to breathe
            print(f"DEBUG: Page Committed and Breathed {url}", flush=True)
            
            # Extract Page Context
            content = await page.content()
            print(f"DEBUG: Content Extracted ({len(content)} bytes)", flush=True)
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            
            page_meta = {
                "h1": [h.get_text().strip() for h in soup.find_all('h1')],
                "meta_desc": soup.find("meta", {"name": "description"}).get("content", "") if soup.find("meta", {"name": "description"}) else "",
                "title": soup.title.string.strip() if soup.title else ""
            }

            # 1. Discover Resources via BeautifulSoup for maximum reliability
            links = soup.find_all('a')
            print(f"DEBUG: Found {len(links)} anchors", flush=True)
            logging.info(f"      📍 Found {len(links)} anchors total.")
            
            for link in links:
                href = link.get('href')
                onclick = link.get('onclick')
                text = link.get_text().strip()
                
                potential_urls = []
                if href and href != "#": potential_urls.append(urljoin(url, href))
                if onclick and "location.href" in onclick:
                    match = re.search(r"location\.href\s*=\s*['\"]([^'\"]+)['\"]", onclick)
                    if match:
                        potential_urls.append(urljoin(url, match.group(1)))
                
                for full_url in potential_urls:
                    norm_url = full_url.lower()
                    pure_url = norm_url.split('?')[0]
                    is_file = any(pure_url.endswith(ext) for ext in self.file_extensions)
                    is_download_path = any(re.search(pat, norm_url) for pat in self.resource_patterns)
                    is_wiki_article = "kemuwiki" in norm_url and any(kw in text.lower() for kw in ['civic', 'governance', 'constitution', 'rights'])
                    
                    # Exhaustive Noise Filter (Institutional Precision)
                    is_noise = any(noise in text.lower() for noise in [
                        'twitter', 'facebook', 'linkedin', 'instagram', 'next post', 'prev post',
                        'no comments', 'tender', 'procurement', 'zimbra', 'pension', 'insurance',
                        'vacancy', 'career', 'job description', 'medical cover', 'advertisement',
                        'click here', 'login', 'signup', 'forgot password', 'mortgage', 'car loan',
                        'rfp', 'bid', 'proposal', 'expression of interest', 'terms of reference',
                        'gpa', 'wiba', 'anti-spam', 'collaboration suite', 'license', 'mortgage'
                    ])
                    
                    if (is_file or is_download_path or is_wiki_article) and not is_noise:
                        title = text or (page_meta["h1"][0] if page_meta["h1"] else "Untitled Resource")
                        
                        if not any(r['url'] == full_url for r in self.data):
                            res_type = self.detect_type(full_url)
                            if is_wiki_article and res_type == "DOCUMENT": res_type = "ARTICLE"
                            
                            print(f"✅ FOUND: {title[:50]} ({res_type}) -> {full_url}", flush=True)
                            logging.info(f"      ✅ Found Resource: {title[:50]} -> {full_url}")
                            self.data.append({
                                "title": title,
                                "url": full_url,
                                "provider": provider,
                                "category": self.infer_category(title, page_meta),
                                "type": res_type,
                                "summary": page_meta["meta_desc"] or (page_meta["h1"][0] if page_meta["h1"] else ""),
                                "tags": self.infer_tags(title, page_meta),
                                "metadata": {
                                    "source_url": url,
                                    "parent_title": page_meta["title"],
                                    "discovered_at": datetime.now().isoformat(),
                                    "context_window": page_meta
                                }
                            })

            # 2. Recurse if depth > 0
            if depth > 0:
                internal_links = soup.find_all('a', href=True)
                parsed_root = urlparse(url)
                
                for il in internal_links:
                    href = il.get('href')
                    if not href: continue
                    full_il = urljoin(url, href)
                    parsed_il = urlparse(full_il)
                    
                    if parsed_il.netloc == parsed_root.netloc and full_il not in self.visited_urls:
                        if not any(x in full_il.lower() for x in ['login', 'signup', 'facebook', 'twitter', 'linkedin', 'search']):
                            await self.scrape_recursive(context, full_il, depth - 1, provider)

        except Exception as e:
            logging.error(f"      ❌ Error at {url}: {e}")
        finally:
            await page.close()

    def infer_category(self, title, context):
        text = (title + " " + " ".join(context["h1"]) + " " + (context.get("meta_desc") or "")).lower()
        if any(x in text for x in ['constitution', 'bill', 'gazette', 'law', 'act', 'statute', 'parliament']): return "Legal Documents"
        if any(x in text for x in ['budget', 'audit', 'finance', 'revenue', 'spending', 'economic', 'report', 'cob']): return "Government Publications"
        if any(x in text for x in ['course', 'lesson', 'curriculum', 'school', 'student', 'education', 'learning', 'guide', 'module']): return "Educational Materials"
        if any(x in text for x in ['training', 'manual', 'workshop', 'toolkit', 'handbook', 'how-to', 'protocol']): return "Training Materials"
        if any(x in text for x in ['community', 'citizen', 'participation', 'engagement', 'grassroots', 'forum', 'action']): return "Community Resources"
        return "National Protocols"

    def infer_tags(self, title, context):
        tags = set()
        text = (title + " " + " ".join(context["h1"]) + " " + (context.get("meta_desc") or "")).lower()
        if 'kenya' in text: tags.add('Kenya')
        if 'county' in text: tags.add('County Governance')
        if 'youth' in text: tags.add('Youth Empowerment')
        if 'education' in text: tags.add('Education')
        if 'participation' in text: tags.add('Public Participation')
        if 'rights' in text: tags.add('Human Rights')
        return list(tags) if tags else ["Civic Education"]

    def detect_type(self, url: str) -> str:
        url_lower = url.lower()
        if url_lower.endswith('.pdf') or 'download' in url_lower: return "PDF"
        if any(ext in url_lower for ext in ['.doc', '.docx']): return "DOCX"
        if any(ext in url_lower for ext in ['.xls', '.xlsx', '.csv']): return "SPREADSHEET"
        if 'handle' in url_lower or 'bitstream' in url_lower: return "REPOSITORY ITEM"
        return "DOCUMENT"

    def save_data(self):
        output_dir = "processed_data/resources"
        os.makedirs(output_dir, exist_ok=True)
        filename = f"resources_sync_HAM_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        path = os.path.join(output_dir, filename)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=4)
        logging.info(f"💾 HAM MISSION COMPLETE: Saved {len(self.data)} resources to {path}")

if __name__ == "__main__":
    import asyncio
    scraper = ResourceScraper()
    asyncio.run(scraper.run())
