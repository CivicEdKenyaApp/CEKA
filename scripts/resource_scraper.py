import os
import sys
import time
import json
import logging
import re
from datetime import datetime
from typing import List, Dict, Any
from urllib.parse import urljoin, unquote

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("resource_scrape.log"),
        logging.StreamHandler()
    ]
)

class ResourceScraper:
    """
    GO-HAM Resource Intelligence Engine.
    Scrapes educational resources, PDFs, and videos from civic portals.
    """

    def __init__(self, headless=True):
        self.targets = [
            {
                "name": "Kenya Law Reform Commission",
                "url": "https://www.klrc.go.ke/index.php/constitution-of-kenya",
                "type": "legal",
                "provider": "KLRC"
            },
            {
                "name": "Civic Education Kenya",
                "url": "https://www.civiceducationkenya.com/resources",
                "type": "educational",
                "provider": "CEKA"
            }
        ]
        self.headless = headless
        self.data = []
        self.seen_urls = set()

    def scrape_all(self):
        logging.info("🚀 Launching Resource Intelligence Hub...")
        
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            logging.error("Playwright not installed. Falling back to static scraping.")
            return self._scrape_static()

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
            )
            page = context.new_page()

            for target in self.targets:
                logging.info(f"🔍 Crawling: {target['name']}...")
                try:
                    if target['type'] == "legal":
                        self._scrape_klrc(page, target)
                    else:
                        self._scrape_generic(page, target)
                except Exception as e:
                    logging.error(f"❌ Error scraping {target['name']}: {e}")

            browser.close()
        
        self.save_data()
        return self.data

    def _scrape_klrc(self, page, target):
        page.goto(target['url'], wait_until="networkidle")
        # Extract links to chapters or specific sections
        links = page.query_selector_all("a[href*='constitution-of-kenya']")
        for link in links:
            title = link.inner_text().strip()
            href = link.get_attribute("href")
            if href and title and href not in self.seen_urls:
                full_url = urljoin(target['url'], href)
                self.data.append({
                    "title": title,
                    "url": full_url,
                    "provider": target['provider'],
                    "category": "Constitution",
                    "type": "Legal Text",
                    "summary": f"Official section of the Constitution: {title}",
                    "tags": ["constitution", "legal", "kenya"],
                    "metadata": {"source_url": target['url']}
                })
                self.seen_urls.add(href)

    def _scrape_generic(self, page, target):
        page.goto(target['url'], wait_until="networkidle")
        # Look for PDF links or Video links
        resources = page.query_selector_all("a[href$='.pdf'], a[href*='youtube.com'], a[href*='vimeo.com']")
        for res in resources:
            title = res.inner_text().strip() or "Untitled Resource"
            url = res.get_attribute("href")
            if url and url not in self.seen_urls:
                res_type = "PDF" if url.endswith(".pdf") else "Video"
                self.data.append({
                    "title": title,
                    "url": url,
                    "provider": target['provider'],
                    "category": "Civic Education",
                    "type": res_type,
                    "summary": f"Educational {res_type.lower()} resource from {target['provider']}",
                    "tags": ["civic-education", res_type.lower()],
                    "metadata": {"discovered_at": datetime.now().isoformat()}
                })
                self.seen_urls.add(url)

    def _scrape_static(self):
        import requests
        from bs4 import BeautifulSoup
        for target in self.targets:
            try:
                resp = requests.get(target['url'], timeout=10)
                soup = BeautifulSoup(resp.text, 'html.parser')
                # Simple link extraction for static fallback
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    if href.endswith('.pdf') or 'constitution' in href.lower():
                        title = a.get_text().strip()
                        if title and href not in self.seen_urls:
                            self.data.append({
                                "title": title,
                                "url": urljoin(target['url'], href),
                                "provider": target['provider'],
                                "category": "General",
                                "type": "Document",
                                "summary": title,
                                "tags": ["static-scrape"],
                                "metadata": {}
                            })
                            self.seen_urls.add(href)
            except Exception as e:
                logging.error(f"Static scrape failed for {target['name']}: {e}")
        self.save_data()
        return self.data

    def save_data(self):
        output_dir = "processed_data/resources"
        os.makedirs(output_dir, exist_ok=True)
        filename = f"resources_sync_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        path = os.path.join(output_dir, filename)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=4)
        logging.info(f"💾 Saved {len(self.data)} resources to {path}")

if __name__ == "__main__":
    scraper = ResourceScraper()
    scraper.scrape_all()
