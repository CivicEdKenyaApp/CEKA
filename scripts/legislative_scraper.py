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
        logging.FileHandler("legislative_scrape.log"),
        logging.StreamHandler()
    ]
)


class LegislativeScraper:
    """
    GO-HAM Legislative Scraper for the Kenyan Parliament website.

    The parliament.go.ke/bills page does NOT use <table> elements.
    Bills are listed as direct PDF links (<a> tags) inside a Drupal
    views content area. Each bill has a PDF link and a "Submit Comments" link.

    This scraper:
    1. Uses Playwright to load the page (handles JS-rendered content).
    2. Extracts all PDF links from the bills listing.
    3. Paginates through all available pages.
    4. Extracts bill title, PDF URL, and year from the filename/path.
    5. Saves to JSON and CSV for downstream sync to Supabase.
    """

    def __init__(self, headless=True):
        self.targets_file = "scripts/scraping_targets.json"
        self.headless = headless
        self.data = []
        self.seen_titles = set()  # Deduplication
        self.targets = self.load_targets()

    def load_targets(self):
        try:
            with open(self.targets_file, 'r') as f:
                return json.load(f).get("targets", [])
        except Exception as e:
            logging.error(f"Failed to load targets: {e}")
            return []

    def scrape_all(self, max_pages=15):
        """Main entry point. Scrapes all configured targets."""
        logging.info(f"🚀 Initializing GO-HAM Legislative Sync Engine (Scheduled @ 09:00 EAT)")
        logging.info(f"   Targets: {len(self.targets)}, Max pages per target: {max_pages}")

        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            logging.error("Playwright not installed. Run: pip install playwright && playwright install chromium")
            # Fallback to requests+BeautifulSoup for CI environments
            return self._scrape_with_requests(max_pages)

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                           "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            )
            page = context.new_page()

            for target in self.targets:
                logging.info(f"🔍 Digging into: {target['name']}...")
                try:
                    if target['type'] == "bills":
                        self._extract_bills_playwright(page, target, max_pages)
                    elif target['type'] == "order_papers":
                        self._extract_order_papers_playwright(page, target)
                    elif target['type'] == "gazette":
                        self._extract_gazette_playwright(page, target)
                except Exception as e:
                    logging.error(f"Failed to scrape {target['name']}: {str(e)}")

            browser.close()

        logging.info(f"✅ Total items scraped: {len(self.data)}")
        return self.data

    def _scrape_with_requests(self, max_pages):
        """Fallback scraper using requests + BeautifulSoup (no JS rendering)."""
        try:
            import requests
            from bs4 import BeautifulSoup
        except ImportError:
            logging.error("requests/beautifulsoup4 not installed")
            return self.data

        for target in self.targets:
            if target['type'] != 'bills':
                continue

            logging.info(f"🔍 [requests fallback] Scraping: {target['name']}")
            base_url = target['url']

            for page_num in range(0, max_pages):
                page_url = f"{base_url}?title=%20&field_parliament_value=2022&page={page_num}"
                logging.info(f"   Page {page_num + 1}: {page_url}")

                try:
                    resp = requests.get(page_url, timeout=30, headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0'
                    })
                    if resp.status_code != 200:
                        logging.warning(f"   HTTP {resp.status_code} for {page_url}")
                        break

                    soup = BeautifulSoup(resp.text, 'html.parser')
                    self._extract_bills_from_soup(soup, target, base_url)

                    # Check if there's a "Next" link
                    next_link = soup.select_one('li.pager-next a, li.next a, a[rel="next"]')
                    if not next_link:
                        logging.info(f"   No more pages after page {page_num + 1}")
                        break

                    time.sleep(1)  # Be polite

                except Exception as e:
                    logging.error(f"   Failed page {page_num + 1}: {e}")
                    break

        logging.info(f"✅ Total items scraped: {len(self.data)}")
        return self.data

    def _extract_bills_from_soup(self, soup, target, base_url):
        """Extract bills from a BeautifulSoup parsed page."""
        # The parliament.go.ke bills page lists PDF links directly
        # Look for all <a> tags that link to PDF files
        all_links = soup.find_all('a', href=True)

        for link in all_links:
            href = link['href']
            if not href.lower().endswith('.pdf'):
                continue
            # Skip "Submit Comments" links
            if 'petition' in href.lower() or 'contact' in href.lower():
                continue

            full_url = urljoin(base_url, href)
            title = self._clean_bill_title(link.get_text(strip=True) or self._title_from_url(href))

            if not title or title in self.seen_titles:
                continue

            self.seen_titles.add(title)
            bill = self._build_bill_record(title, full_url, target)
            self.data.append(bill)
            logging.info(f"   📋 {title}")

    def _extract_bills_playwright(self, page, target, max_pages):
        """Extract bills using Playwright (handles JS-rendered pages)."""
        base_url = target['url']

        for page_num in range(0, max_pages):
            page_url = f"{base_url}?title=%20&field_parliament_value=2022&page={page_num}"
            logging.info(f"   Page {page_num + 1}: {page_url}")

            try:
                page.goto(page_url, wait_until="domcontentloaded", timeout=60000)
                # Wait for content to load
                page.wait_for_timeout(3000)

                # Extract all PDF links on the page
                pdf_links = page.evaluate("""() => {
                    const links = document.querySelectorAll('a[href$=".pdf"], a[href*=".pdf"]');
                    return Array.from(links).map(a => ({
                        href: a.href,
                        text: a.textContent.trim()
                    })).filter(l =>
                        !l.href.includes('petition') &&
                        !l.href.includes('contact') &&
                        l.text.length > 0
                    );
                }""")

                if not pdf_links:
                    logging.info(f"   No PDF links found on page {page_num + 1}. Trying alternate selectors...")
                    # Fallback: try the view-content area specifically
                    pdf_links = page.evaluate("""() => {
                        const container = document.querySelector('.view-content, .field-items, article, main');
                        if (!container) return [];
                        const links = container.querySelectorAll('a[href$=".pdf"], a[href*=".pdf"]');
                        return Array.from(links).map(a => ({
                            href: a.href,
                            text: a.textContent.trim()
                        })).filter(l => !l.href.includes('petition') && !l.href.includes('contact'));
                    }""")

                if not pdf_links:
                    logging.warning(f"   Still no links found on page {page_num + 1}. Stopping pagination.")
                    break

                bills_on_page = 0
                for link_data in pdf_links:
                    href = link_data['href']
                    text = link_data['text']

                    title = self._clean_bill_title(text or self._title_from_url(href))
                    if not title or title in self.seen_titles:
                        continue

                    self.seen_titles.add(title)
                    bill = self._build_bill_record(title, href, target)
                    self.data.append(bill)
                    bills_on_page += 1
                    logging.info(f"   📋 {title}")

                logging.info(f"   Found {bills_on_page} new bills on page {page_num + 1}")

                if bills_on_page == 0:
                    logging.info(f"   No new bills on page {page_num + 1}, stopping.")
                    break

                # Check for next page
                has_next = page.evaluate("""() => {
                    const nextLink = document.querySelector('li.pager-next a, li.next a, a[rel="next"]');
                    return !!nextLink;
                }""")

                if not has_next:
                    logging.info(f"   No next page link found. Done with {target['name']}.")
                    break

                time.sleep(2)  # Be polite to the server

            except Exception as e:
                logging.error(f"   Error on page {page_num + 1}: {e}")
                break

    def _extract_order_papers_playwright(self, page, target):
        """Extract order papers using Playwright."""
        try:
            page.goto(target['url'], wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(3000)

            items = page.evaluate("""(selector) => {
                const elements = document.querySelectorAll(selector);
                return Array.from(elements).map(el => {
                    const a = el.querySelector('a');
                    return a ? { text: a.textContent.trim(), href: a.href } : null;
                }).filter(Boolean);
            }""", target['selector'])

            for item in items:
                title = f"Order Paper: {item['text']}"
                if title in self.seen_titles:
                    continue
                self.seen_titles.add(title)
                self.data.append({
                    "title": title,
                    "url": item['href'],
                    "source": target['name'],
                    "category": "Order Paper",
                    "status": "Published",
                    "sponsor": "National Assembly",
                    "summary": f"Order Paper: {item['text']}",
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "created_at": datetime.now().isoformat()
                })
        except Exception as e:
            logging.error(f"Order papers extraction failed: {e}")

    def _extract_gazette_playwright(self, page, target):
        """Extract gazette notices using Playwright."""
        try:
            page.goto(target['url'], wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(3000)

            items = page.evaluate("""(selector) => {
                const elements = document.querySelectorAll(selector);
                return Array.from(elements).map(el => {
                    const a = el.querySelector('a');
                    return {
                        text: el.textContent.trim().split('\\n')[0],
                        href: a ? a.href : ''
                    };
                });
            }""", target['selector'])

            for item in items:
                title = item['text']
                if not title or title in self.seen_titles:
                    continue
                self.seen_titles.add(title)
                self.data.append({
                    "title": title,
                    "url": item['href'],
                    "source": target['name'],
                    "category": "Gazette",
                    "status": "Notice",
                    "sponsor": "",
                    "summary": f"Kenya Gazette notice: {title}",
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "created_at": datetime.now().isoformat()
                })
        except Exception as e:
            logging.error(f"Gazette extraction failed: {e}")

    def _build_bill_record(self, title: str, url: str, target: dict) -> dict:
        """Build a standardized bill record dict."""
        year = self._extract_year(title) or self._extract_year(url) or str(datetime.now().year)
        status = self._infer_status(title)

        return {
            "title": title,
            "sponsor": self._extract_sponsor(title),
            "status": status,
            "date": f"{year}-01-01",
            "url": url,
            "pdf_url": url,
            "source": target['name'],
            "category": "Legislative",
            "summary": f"Bill before Parliament: {title}. Source: {target['name']}.",
            "text_content": f"Full text unavailable at scrape time but available at: {url}",
            "analysis_status": "pending",
            "created_at": datetime.now().isoformat()
        }

    def _clean_bill_title(self, raw: str) -> str:
        """Clean up a bill title extracted from the page."""
        if not raw:
            return ""
        # Remove .pdf extension
        title = re.sub(r'\.pdf$', '', raw, flags=re.IGNORECASE).strip()
        # Remove leading/trailing whitespace and normalize
        title = re.sub(r'\s+', ' ', title).strip()
        # Remove common artifacts
        title = title.replace('(Compressed Copy)', '').strip()
        return title

    def _title_from_url(self, url: str) -> str:
        """Extract a bill title from its URL/filename."""
        filename = url.split('/')[-1]
        filename = unquote(filename)
        filename = re.sub(r'\.pdf$', '', filename, flags=re.IGNORECASE)
        filename = re.sub(r'[_-]+', ' ', filename)
        filename = re.sub(r'\s+', ' ', filename).strip()
        return filename

    def _extract_year(self, text: str) -> str:
        """Extract the year (e.g. 2025) from title or URL."""
        match = re.search(r'20[2-3]\d', text)  # Match 2020-2039
        return match.group(0) if match else ""

    def _extract_sponsor(self, title: str) -> str:
        """Infer sponsor from the bill context."""
        title_lower = title.lower()
        if 'senate bill' in title_lower:
            return "Senate"
        if 'national assembly' in title_lower:
            return "National Assembly"
        return "National Assembly"  # Default for parliament.go.ke bills

    def _infer_status(self, title: str) -> str:
        """Infer a basic status from the bill title/context."""
        title_lower = title.lower()
        if 'amendment' in title_lower:
            return "Amendment"
        if 'appropriation' in title_lower:
            return "Appropriation"
        return "Published"

    def extract_link(self, element, base_url):
        """Legacy helper for extracting links."""
        link_elem = element.query_selector("a")
        if link_elem:
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
        try:
            import pandas as pd
            csv_path = os.path.join(output_dir, f"bills_{timestamp}.csv")
            df = pd.DataFrame(self.data)
            df.to_csv(csv_path, index=False)
            logging.info(f"Saved {len(self.data)} bills to {json_path} and {csv_path}")
        except ImportError:
            logging.info(f"Saved {len(self.data)} bills to {json_path} (pandas not available for CSV)")


if __name__ == "__main__":
    scraper = LegislativeScraper(headless=True)
    results = scraper.scrape_all(max_pages=15)
    scraper.save_data()
    logging.info(f"🏁 Scraping complete. {len(results)} bills captured.")
