import os
import sys
import time
import argparse
import json
import re
import hashlib
import requests
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from collections import deque
from playwright.sync_api import sync_playwright
import pandas as pd

def get_original_host_from_wayback(url):
    m = re.search(r'/web/\d+/(https?://.*)', url)
    if m:
        inner = m.group(1)
        return urlparse(inner).netloc
    return urlparse(url).netloc

def is_same_site(target_url, original_host):
    try:
        p = urlparse(target_url)
        host = p.netloc
        if not host:
            return True
        if "web.archive.org" in host:
            if re.search(r"/http[s]?://" + re.escape(original_host) + "/", target_url):
                return True
        if original_host and original_host in host:
            return True
        return False
    except:
        return False

def extract_links_from_html(html, base):
    soup = BeautifulSoup(html, "lxml")
    links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        full = urljoin(base, href)
        links.add(full)
    return links

def safe_filename(url, extension="html"):
    url_hash = hashlib.md5(url.encode('utf-8')).hexdigest()
    return f"{url_hash}.{extension}"

def extract_facility_data(html_content, url):
    """Extract facility data from HTML content"""
    soup = BeautifulSoup(html_content, 'html.parser')
    facilities = []
    
    # Look for facility elements - try multiple selectors
    facility_selectors = ['.facility-card', '.facility-item', '[data-facility]', '.facility', 
                         '.health-facility', '.facility-row', 'tr[data-facility]', 'div.facility', 'li.facility']
    facility_elements = []
    
    for selector in facility_selectors:
        elements = soup.select(selector)
        if elements:
            facility_elements.extend(elements)
    
    # If no specific facility elements found, try tables
    if not facility_elements:
        tables = soup.find_all('table')
        for table in tables:
            # Check if this looks like a facilities table
            headers = [th.get_text(strip=True).lower() for th in table.select('thead th') if th]
            if any('facility' in h or 'name' in h or 'county' in h for h in headers):
                # Extract rows as facilities
                rows = table.select('tbody tr')
                for row in rows:
                    facility_elements.append(row)
    
    for element in facility_elements:
        facility = {}
        
        # Extract basic information - try multiple selectors for each field
        name_selectors = ['.facility-name', 'h2', 'h3', 'h4', '[data-name]', '.name', 'td:nth-child(1)']
        facility['name'] = extract_text(element, name_selectors)
        
        # Extract all requested details
        details_mapping = {
            'type': ['.facility-type', '[data-type]', '.type', 'td:nth-child(2)'],
            'county': ['.county', '[data-county]', '.county', 'td:nth-child(3)'],
            'subcounty': ['.subcounty', '[data-subcounty]', '.sub-county', 'td:nth-child(4)'],
            'ward': ['.ward', '[data-ward]', '.ward', 'td:nth-child(5)'],
            'constituency': ['.constituency', '[data-constituency]', '.constituency', 'td:nth-child(6)'],
            'owner': ['.owner', '[data-owner]', '.owner', 'td:nth-child(7)'],
            'services': ['.services', '[data-services]', '.services', 'td:nth-child(8)'],
            'money_allocated': ['.allocation', '[data-allocation]', '.budget', 'td:nth-child(9)'],
            'allocation_period': ['.period', '[data-period]', '.fiscal-year', 'td:nth-child(10)'],
            'division': ['.division', '[data-division]', '.division', 'td:nth-child(11)'],
            'location': ['.location', '[data-location]', '.location', 'td:nth-child(12)'],
            'sub_location': ['.sub-location', '[data-sub-location]', '.sub-location', 'td:nth-child(13)'],
            'nearest_to': ['.nearest-to', '[data-nearest]', '.nearest', 'td:nth-child(14)'],
            'coordinates': ['.coordinates', '[data-coordinates]', '.coords', 'td:nth-child(15)'],
            'latitude': ['.latitude', '[data-latitude]', '.lat', 'td:nth-child(16)'],
            'longitude': ['.longitude', '[data-longitude]', '.lon', 'td:nth-child(17)']
        }
        
        for field, selectors in details_mapping.items():
            facility[field] = extract_text(element, selectors)
        
        # Extract links to detail pages
        link_elem = element.select_one('a[href*="facility"]')
        if link_elem and 'href' in link_elem.attrs:
            facility['detail_url'] = link_elem['href']
        
        # Only add if we found meaningful data
        if facility.get('name') or any(v for k, v in facility.items() if k != 'source_url'):
            facility['source_url'] = url
            facilities.append(facility)
    
    return facilities

def extract_text(element, selectors):
    """Extract text using multiple selector options"""
    for selector in selectors:
        found = element.select_one(selector)
        if found:
            text = found.get_text(strip=True)
            if text:
                return text
    return None

def main(start_url=None, out_dir="downloads/wayback_crawl", depth=2, max_pages=300, delay=0.8):
    """Main function to crawl and extract data"""
    if not start_url:
        print("No URL provided")
        return None
    
    os.makedirs(out_dir, exist_ok=True)
    responses_dir = os.path.join(out_dir, "responses")
    os.makedirs(responses_dir, exist_ok=True)
    
    # Create index file to track URLs and their corresponding files
    index_file = os.path.join(out_dir, "crawl_index.jsonl")
    
    original_host = get_original_host_from_wayback(start_url)
    print("Original host:", original_host)
    
    q = deque()
    q.append((start_url, 0))
    seen = set()
    visited_count = 0
    all_facilities = []
    
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context()
        
        while q and visited_count < max_pages:
            url, depth_level = q.popleft()
            
            if url in seen:
                continue
            seen.add(url)
            
            print(f"[{visited_count+1}] depth={depth_level} visiting: {url}")
            
            page = context.new_page()
            captured_files = []
            
            def handle_response(resp):
                try:
                    rurl = resp.url
                    rtype = resp.request.resource_type
                    ct = resp.headers.get("content-type", "")
                    
                    if "application/json" in ct or rtype == "xhr" or rtype == "fetch":
                        try:
                            body = resp.json()
                        except Exception:
                            try:
                                body = resp.text()
                            except Exception:
                                body = None
                                
                        if body is not None:
                            safe_name = safe_filename(rurl, "json")
                            outfn = os.path.join(responses_dir, safe_name)
                            with open(outfn, "w", encoding="utf-8") as f:
                                json.dump({
                                    "url": rurl,
                                    "status": resp.status,
                                    "headers": dict(resp.headers),
                                    "body": body
                                }, f, ensure_ascii=False, indent=2)
                            captured_files.append(outfn)
                except Exception:
                    pass
                    
            page.on("response", handle_response)
            
            try:
                page.goto(url, wait_until="networkidle", timeout=120000)
                time.sleep(1)  # extra wait for lazy requests
            except Exception as e:
                print("load error:", e)
                page.close()
                continue
            
            # Extract facility data from the page
            html_content = page.content()
            facilities = extract_facility_data(html_content, url)
            all_facilities.extend(facilities)
            
            # Save rendered HTML and text using safe filenames
            html_filename = safe_filename(url, "html")
            text_filename = safe_filename(url, "txt")
            
            html_path = os.path.join(out_dir, html_filename)
            text_path = os.path.join(out_dir, text_filename)
            
            try:
                with open(html_path, "w", encoding="utf-8") as f:
                    f.write(html_content)
                    
                text_content = page.inner_text("body")
                with open(text_path, "w", encoding="utf-8") as f:
                    f.write(text_content)
            except Exception as e:
                print("save error:", e)
                page.close()
                continue
            
            # Record in index
            index_entry = {
                "url": url,
                "depth": depth_level,
                "html_file": html_filename,
                "text_file": text_filename,
                "response_files": [os.path.basename(f) for f in captured_files],
                "timestamp": time.time(),
                "facilities_found": len(facilities)
            }
            
            with open(index_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(index_entry, ensure_ascii=False) + "\n")
            
            # Extract links and enqueue same-site pages
            try:
                links = extract_links_from_html(html_content, url)
                for l in links:
                    if l in seen:
                        continue
                    if is_same_site(l, original_host):
                        if depth_level < depth and (l.endswith("/") or 
                           any(l.lower().endswith(ext) for ext in [".html", ".htm", ".php"]) or 
                           "/http" in l):
                            q.append((l, depth_level + 1))
            except Exception as e:
                print("link extraction error:", e)
            
            page.close()
            visited_count += 1
            time.sleep(delay)
        
        browser.close()
    
    # Save all extracted facilities
    if all_facilities:
        facilities_file = os.path.join(out_dir, "facilities.json")
        with open(facilities_file, 'w', encoding='utf-8') as f:
            json.dump(all_facilities, f, indent=2, ensure_ascii=False)
        
        # Also save as CSV
        df = pd.DataFrame(all_facilities)
        csv_file = os.path.join(out_dir, "facilities.csv")
        df.to_csv(csv_file, index=False, encoding='utf-8')
    
    print("Crawl finished. visited_count:", visited_count)
    print("Facilities found:", len(all_facilities))
    print("Outputs under:", out_dir)
    print("Index file:", index_file)
    
    return all_facilities

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("start_url")
    ap.add_argument("--out", "-o", default="downloads/wayback_crawl")
    ap.add_argument("--depth", "-d", type=int, default=2)
    ap.add_argument("--max-pages", type=int, default=300)
    ap.add_argument("--delay", type=float, default=0.8)
    args = ap.parse_args()
    
    main(args.start_url, args.out, args.depth, args.max_pages, args.delay)
