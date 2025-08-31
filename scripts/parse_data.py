import json
import os
import re
import pandas as pd
from pathlib import Path
from bs4 import BeautifulSoup
import hashlib
import numpy as np
import requests
from io import StringIO

def download_file(url, cache_dir="cache"):
    """Download file from URL or use cached version"""
    os.makedirs(cache_dir, exist_ok=True)
    
    # Create a hash of the URL for the cache filename
    url_hash = hashlib.md5(url.encode()).hexdigest()
    cache_path = os.path.join(cache_dir, url_hash)
    
    # Use cached file if it exists and is less than 1 day old
    if os.path.exists(cache_path) and (os.path.getmtime(cache_path) > (time.time() - 86400)):
        with open(cache_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    # Download the file
    response = requests.get(url)
    response.raise_for_status()
    
    # Cache the file
    with open(cache_path, 'w', encoding='utf-8') as f:
        f.write(response.text)
    
    return response.text

def extract_facility_data(html_content, url):
    """Extract facility data from HTML content with all requested fields"""
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

def parse_json_responses(response_dir):
    """Parse JSON responses captured during crawling"""
    all_data = []
    json_files = list(Path(response_dir).glob("*.json"))
    
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract the actual response body
            if 'body' in data:
                body = data['body']
                
                # Handle different response formats
                if isinstance(body, list):
                    for item in body:
                        if isinstance(item, dict):
                            all_data.append(normalize_facility_data(item))
                elif isinstance(body, dict):
                    # Check for common data structures in API responses
                    for key in ['data', 'results', 'items', 'facilities']:
                        if key in body and isinstance(body[key], list):
                            for item in body[key]:
                                if isinstance(item, dict):
                                    all_data.append(normalize_facility_data(item))
                            break
                    else:
                        # If no specific key found, add the whole body
                        all_data.append(normalize_facility_data(body))
        except Exception as e:
            print(f"Error parsing {json_file}: {str(e)}")
    
    return all_data

def normalize_facility_data(data):
    """Normalize facility data to common field names"""
    mapping = {
        'Facility_N': 'name', 'Type': 'type', 'Owner': 'owner', 'County': 'county',
        'Sub_County': 'subcounty', 'Division': 'division', 'Location': 'location',
        'Sub_Locati': 'sub_location', 'Constituen': 'constituency', 'Nearest_To': 'nearest_to',
        'Latitude': 'latitude', 'Longitude': 'longitude', 'facility_name': 'name',
        'facility_type': 'type', 'sub_county': 'subcounty', 'sub_location': 'sub_location'
    }
    
    normalized = {}
    for key, value in data.items():
        normalized_key = mapping.get(key, key.lower())
        normalized[normalized_key] = value
    
    # Extract money allocation if available in any field
    money_fields = ['allocation', 'budget', 'money_allocated', 'funds']
    for field in money_fields:
        if field in normalized:
            normalized['money_allocated'] = normalized[field]
            break
    
    # Extract allocation period if available
    period_fields = ['period', 'fiscal_year', 'allocation_period', 'year']
    for field in period_fields:
        if field in normalized:
            normalized['allocation_period'] = normalized[field]
            break
    
    return normalized

def main(crawl_dir="downloads/wayback_crawl", output_dir="parsed_data"):
    """Main function to parse data from URLs"""
    # Configuration
    responses_dir = os.path.join(crawl_dir, "responses")
    os.makedirs(output_dir, exist_ok=True)
    
    # Parse HTML files from URLs (example implementation)
    html_urls = [
        "https://example.com/facilities/page1.html",
        "https://example.com/facilities/page2.html",
        # Add more URLs as needed
    ]
    
    all_facilities = []
    print(f"Processing {len(html_urls)} HTML URLs...")
    
    for url in html_urls:
        try:
            html_content = download_file(url)
            facilities = extract_facility_data(html_content, url)
            all_facilities.extend(facilities)
            print(f"Extracted {len(facilities)} facilities from {url}")
        except Exception as e:
            print(f"Error processing {url}: {str(e)}")
    
    # Parse JSON responses (if any)
    print("Processing JSON responses...")
    json_data = parse_json_responses(responses_dir)
    
    # Combine both data sources
    combined_data = all_facilities + json_data
    
    # Save all data
    facilities_file = os.path.join(output_dir, "facilities.json")
    with open(facilities_file, 'w', encoding='utf-8') as f:
        json.dump(combined_data, f, indent=2, ensure_ascii=False)
    
    # Also save as CSV for easier analysis
    if combined_data:
        df = pd.DataFrame(combined_data)
        csv_file = os.path.join(output_dir, "facilities.csv")
        df.to_csv(csv_file, index=False, encoding='utf-8')
    
    print(f"Extracted {len(combined_data)} facilities total")
    print(f"Data saved to {output_dir}")
    
    return combined_data

if __name__ == "__main__":
    main()
