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
        self.base_url = "http://www.parliament.go.ke/the-national-assembly/house-business/bills"
        self.headless = headless
        self.data = []

    def scrape_bills(self, max_pages=5):
        logging.info(f"Starting scrape of {max_pages} pages from Parliament portal...")
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            page = browser.new_page()
            
            try:
                page.goto(self.base_url, wait_until="networkidle", timeout=60000)
                
                for current_page in range(1, max_pages + 1):
                    logging.info(f"Scraping page {current_page}...")
                    
                    # Wait for table to be visible
                    page.wait_for_selector("table", timeout=30000)
                    
                    # Extract bill rows
                    rows = page.query_selector_all("table tbody tr")
                    for row in rows:
                        cells = row.query_selector_all("td")
                        if len(cells) >= 5:
                            bill = {
                                "title": cells[1].inner_text().strip(),
                                "sponsor": cells[2].inner_text().strip(),
                                "status": cells[3].inner_text().strip(),
                                "date": cells[4].inner_text().strip(),
                                "url": self.extract_link(cells[1]),
                                "category": "Legislative",
                                "created_at": datetime.now().isoformat()
                            }
                            # Simple summary generation or detail fetch
                            bill["summary"] = f"A bill regarding {bill['title'][:100]}... currently at {bill['status']} stage."
                            self.data.append(bill)
                    
                    # Try to click next page if available
                    next_button = page.query_selector("li.next a")
                    if next_button and current_page < max_pages:
                        next_button.click()
                        page.wait_for_load_state("networkidle")
                        time.sleep(2) # Politeness
                    else:
                        break
                        
            except Exception as e:
                logging.error(f"Scrape failed: {str(e)}")
            finally:
                browser.close()
                
        return self.data

    def extract_link(self, cell):
        link_elem = cell.query_selector("a")
        if link_elem:
            return urljoin(self.base_url, link_elem.get_attribute("href"))
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
    from urllib.parse import urljoin
    scraper = LegislativeScraper()
    bills = scraper.scrape_bills(max_pages=3)
    scraper.save_data()
