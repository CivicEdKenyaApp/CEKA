import json
import os
from collections import Counter
import requests

def download_file(url):
    """Download file from URL"""
    response = requests.get(url)
    response.raise_for_status()
    return response.text

def analyze_data(json_url=None, api_url=None):
    """Analyze data structure from URLs or local files"""
    data_dir = "parsed_data"
    
    # Analyze facilities data
    if json_url:
        print(f"Downloading data from {json_url}")
        facilities_data = json.loads(download_file(json_url))
    else:
        facilities_file = os.path.join(data_dir, "facilities.json")
        if not os.path.exists(facilities_file):
            print("No facilities data found. Run parse_data.py first.")
            return
        with open(facilities_file, 'r', encoding='utf-8') as f:
            facilities_data = json.load(f)
    
    print(f"Total facilities: {len(facilities_data)}")
    
    # Count fields present
    field_counts = Counter()
    for facility in facilities_data:
        for key in facility.keys():
            field_counts[key] += 1
    
    print("\nField frequency in facilities data:")
    for field, count in field_counts.most_common():
        print(f"{field}: {count} ({count/len(facilities_data)*100:.1f}%)")
    
    # Analyze API data
    if api_url:
        print(f"\nDownloading API data from {api_url}")
        api_data = json.loads(download_file(api_url))
    else:
        api_file = os.path.join(data_dir, "api_responses.json")
        if os.path.exists(api_file):
            with open(api_file, 'r', encoding='utf-8') as f:
                api_data = json.load(f)
        else:
            api_data = None
    
    if api_data:
        print(f"\nTotal API records: {len(api_data)}")
        
        # Check structure of first few items
        print("\nSample API records structure:")
        for i, item in enumerate(api_data[:3]):
            print(f"Record {i+1}: {type(item)}")
            if isinstance(item, dict):
                print(f"Keys: {list(item.keys())}")
            elif isinstance(item, list) and item:
                print(f"List of {len(item)} items, first item type: {type(item[0])}")
                if isinstance(item[0], dict):
                    print(f"First item keys: {list(item[0].keys())}")

if __name__ == "__main__":
    # Example usage with URLs:
    # analyze_data(
    #     json_url="https://example.com/facilities.json",
    #     api_url="https://example.com/api_responses.json"
    # )
    
    # Or with local files:
    analyze_data()
