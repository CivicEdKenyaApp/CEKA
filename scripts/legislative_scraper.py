import os
import sys
import time
import json
import logging
from datetime import datetime
from typing import List, Dict, Any
from playwright.sync_api import sync_playwright
import pandas as pd

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("legislative_scrape.log"),
        logging.StreamHandler()
    ]
)

class LegislativeScraper:
    def __init__(self, headless=True):
        self.targets_file = "scripts/scraping_targets.json"
        self.headless = headless
        self.data = []
        self.targets = self.load_targets()

    def load_targets(self):
        try:
            with open(self.targets_file, 'r') as f:
                return json.load(f).get("targets", [])
        except Exception as e:
            logging.error(f"Failed to load targets: {e}")
            return []

    def scrape_all(self, max_pages=3):
        logging.info(f"🚀 Initializing GO-HAM Legislative Sync Engine (Scheduled @ 09:00 EAT)")
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
            page = context.new_page()
            
            for target in self.targets:
                logging.info(f"🔍 Digging into: {target['name']}...")
                try:
                    page.goto(target['url'], wait_until="networkidle", timeout=60000)
                    
                    if target['type'] == "bills":
                        self.extract_bills(page, target, max_pages)
                    elif target['type'] == "order_papers":
                        self.extract_order_papers(page, target)
                    elif target['type'] == "gazette":
                        self.extract_gazette(page, target)
                        
                except Exception as e:
                    logging.error(f"Failed to scrape {target['name']}: {str(e)}")
            
            browser.close()
        return self.data

    def extract_bills(self, page, target, max_pages):
        for cp in range(1, max_pages + 1):
            page.wait_for_selector(target['selector'], timeout=30000)
            rows = page.query_selector_all(target['selector'])
            for row in rows:
                cells = row.query_selector_all("td")
                if len(cells) >= 5:
                    title = cells[1].inner_text().strip()
                    bill = {
                        "title": title,
                        "sponsor": cells[2].inner_text().strip(),
                        "status": cells[3].inner_text().strip(),
                        "date": cells[4].inner_text().strip(),
                        "url": self.extract_link(cells[1], target['url']),
                        "source": target['name'],
                        "category": "Legislative",
                        "summary": f"Automatic trace for {title}. Status: {cells[3].inner_text().strip()}.",
                        "created_at": datetime.now().isoformat()
                    }
                    self.data.append(bill)
            
            # Check for next page
            next_btn = page.query_selector("li.next a")
            if next_btn and cp < max_pages:
                next_btn.click()
                page.wait_for_load_state("networkidle")
                time.sleep(2)
            else:
                break

    def extract_order_papers(self, page, target):
        items = page.query_selector_all(target['selector'])
        for item in items:
            title_elem = item.query_selector("a")
            if title_elem:
                self.data.append({
                    "title": f"Order Paper: {title_elem.inner_text().strip()}",
                    "url": self.extract_link(item, target['url']),
                    "source": target['name'],
                    "category": "Order Paper",
                    "status": "Published",
                    "created_at": datetime.now().isoformat()
                })

    def extract_gazette(self, page, target):
        # Gazetti specific extraction
        items = page.query_selector_all(target['selector'])
        for item in items:
            self.data.append({
                "title": item.inner_text().strip().split('\n')[0],
                "url": self.extract_link(item, target['url']),
                "source": target['name'],
                "category": "Gazette",
                "status": "Notice",
                "created_at": datetime.now().isoformat()
            })

    def extract_link(self, element, base_url):
        link_elem = element.query_selector("a")
        if link_elem:
            from urllib.parse import urljoin
            return urljoin(base_url, link_elem.get_attribute("href"))
        return None

    def save_data(self, output_dir="processed_data/legislative"):
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save JSON
        json_path = os.path.join(output_dir, f"bills_{timestamp}.json")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
            
        # Save CSV
        csv_path = os.path.join(output_dir, f"bills_{timestamp}.csv")
        df = pd.DataFrame(self.data)
        df.to_csv(csv_path, index=False)
        
        logging.info(f"Saved {len(self.data)} bills to {json_path} and {csv_path}")

if __name__ == "__main__":
    scraper = LegislativeScraper()
    results = scraper.scrape_all(max_pages=3)
    scraper.save_data()
