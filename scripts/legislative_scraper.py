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
        """
        Build a standardized bill record dict with advanced metadata extraction.
        GO-HAM implementation for full context and versioning support.
        """
        year = self._extract_year(title) or self._extract_year(url) or str(datetime.now().year)
        status = self._infer_status(title)
        bill_no = self._extract_bill_no(title)
        
        # Determine house from target or title
        house = "National Assembly"
        if "Senate" in target['name'] or "senate" in title.lower():
            house = "Senate"

        return {
            "title": title,
            "bill_no": bill_no,
            "session_year": int(year) if year.isdigit() else datetime.now().year,
            "sponsor": self._extract_sponsor(title),
            "status": status,
            "house": house,
            "date": f"{year}-01-01",
            "url": url,
            "pdf_url": url,
            "source": target['name'],
            "category": "Legislative",
            "summary": f"Legislative bill tracked from {target['name']}. Title: {title}.",
            "text_content": f"Automated neural crawl pending for content at: {url}",
            "analysis_status": "pending",
            "history": [], # To be populated during sync if existing record found
            "metadata": {
                "scraped_at": datetime.now().isoformat(),
                "original_target": target['name'],
                "inferred_year": year
            },
            "created_at": datetime.now().isoformat()
        }

    def _clean_bill_title(self, raw: str) -> str:
        """Clean and normalize bill title for better matching and display."""
        if not raw:
            return ""
        # Remove .pdf and other extensions
        title = re.sub(r'\.(pdf|docx?|html?)$', '', raw, flags=re.IGNORECASE).strip()
        # Normalize whitespace
        title = re.sub(r'\s+', ' ', title).strip()
        # Remove common wrapper text
        title = re.sub(r'\(Compressed Copy\)', '', title, flags=re.IGNORECASE).strip()
        title = re.sub(r'\(Individual Copy\)', '', title, flags=re.IGNORECASE).strip()
        # Standardize "Bill" suffix/prefix
        return title

    def _extract_bill_no(self, text: str) -> str:
        """Extract Bill No. from title string (e.g. 'No. 14 of 2024')."""
        # Patterns: "Bill No. 14 of 2024", "Bill No. 14", "No. 14 Of 2024"
        match = re.search(r'(?:Bill\s*)?No\.?\s*(\d+)(?:\s*of\s*(\d{4}))?', text, re.IGNORECASE)
        if match:
            num = match.group(1)
            year = match.group(2)
            if year:
                return f"No. {num} of {year}"
            return f"No. {num}"
        return ""

    def _title_from_url(self, url: str) -> str:
        """Fallback: Generate a readable title from the URL slug."""
        filename = url.split('/')[-1]
        filename = unquote(filename)
        filename = re.sub(r'\.(pdf|docx?|html?)$', '', filename, flags=re.IGNORECASE)
        filename = re.sub(r'[_-]+', ' ', filename)
        return re.sub(r'\s+', ' ', filename).strip().title()

    def _extract_year(self, text: str) -> str:
        """Strict year extraction for session tracking."""
        match = re.search(r'\b20(2[0-9]|3[0-9])\b', text)
        return match.group(0) if match else ""

    def _extract_sponsor(self, title: str) -> str:
        """Infer sponsor from the bill content text."""
        t = title.lower()
        if 'senate' in t: return "Senate"
        if 'national assembly' in t: return "National Assembly"
        if 'independent' in t: return "Independent Member"
        return "Government"

    def _infer_status(self, title: str) -> str:
        """Map content keywords to legislative status stages."""
        t = title.lower()
        if 'assented' in t: return "Assented"
        if 'amendment' in t: return "Amendment Stage"
        if 'committee' in t: return "Committee Stage"
        if 'reading' in t: return "Reading"
        if 'order' in t: return "Order of Business"
        return "Published"

    def _extract_order_papers_playwright(self, page, target):
        """Dedicated treatment for Order Papers per user request."""
        try:
            page.goto(target['url'], wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(2000)

            # High-precision extraction of order paper entries
            items = page.evaluate("""(selector) => {
                const rows = document.querySelectorAll(selector);
                return Array.from(rows).map(row => {
                    const link = row.querySelector('a');
                    const text = row.innerText || row.textContent;
                    return link ? { 
                        title: text.replace(/\\n/g, ' ').trim(), 
                        href: link.href,
                        raw_html: row.innerHTML
                    } : null;
                }).filter(i => i && i.href);
            }""", target['selector'])

            for item in items:
                # Deduplicate based on title and URL
                unique_key = f"OP:{item['title']}:{item['href']}"
                if unique_key in self.seen_titles:
                    continue
                self.seen_titles.add(unique_key)

                house = "National Assembly" if "National" in target['name'] else "Senate"
                
                self.data.append({
                    "title": item['title'],
                    "url": item['href'],
                    "pdf_url": item['href'],
                    "source": target['name'],
                    "house": house,
                    "category": "Order Paper",
                    "status": "Published",
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "metadata": {
                        "type": "order_paper",
                        "scraped_at": datetime.now().isoformat()
                    }
                })
        except Exception as e:
            logging.error(f"❌ Order Paper Hub error ({target['name']}): {e}")

    def _extract_gazette_playwright(self, page, target):
        """Separate channel for Official Gazette notices."""
        try:
            page.goto(target['url'], wait_until="domcontentloaded")
            items = page.evaluate("""(selector) => {
                const els = document.querySelectorAll(selector);
                return Array.from(els).map(el => ({
                    title: el.innerText.trim().split('\\n')[0],
                    href: el.querySelector('a')?.href
                })).filter(i => i.href);
            }""", target['selector'])

            for item in items:
                if item['title'] in self.seen_titles: continue
                self.seen_titles.add(item['title'])
                self.data.append({
                    "title": item['title'],
                    "url": item['href'],
                    "category": "Gazette",
                    "status": "Official Notice",
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "source": target['name']
                })
        except Exception as e:
            logging.error(f"❌ Gazette Sync error: {e}")

    def save_data(self, output_dir="processed_data/legislative"):
        """Save captured knowledge base to persistent storage."""
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Preservation of original format with enhanced depth
        json_path = os.path.join(output_dir, f"legislation_sync_{timestamp}.json")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
            
        logging.info(f"💾 Neural Data Hub preserved: {len(self.data)} records -> {json_path}")


if __name__ == "__main__":
    # GOHAM: Full throttle execution
    scraper = LegislativeScraper(headless=True)
    results = scraper.scrape_all(max_pages=15)
    scraper.save_data()
    logging.info(f"🌟 Mission Complete: {len(results)} items ready for ingestion.")
