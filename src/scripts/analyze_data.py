# save as analyze_data.py
import json
import os
from collections import Counter

def analyze_data():
    data_dir = "parsed_data"
    facilities_file = os.path.join(data_dir, "facilities.json")
    api_file = os.path.join(data_dir, "api_responses.json")
    
    # Analyze facilities data
    if os.path.exists(facilities_file):
        with open(facilities_file, 'r', encoding='utf-8') as f:
            facilities = json.load(f)
        
        print(f"Total facilities: {len(facilities)}")
        
        # Count fields present
        field_counts = Counter()
        for facility in facilities:
            for key in facility.keys():
                field_counts[key] += 1
        
        print("\nField frequency in facilities data:")
        for field, count in field_counts.most_common():
            print(f"  {field}: {count} ({count/len(facilities)*100:.1f}%)")
    
    # Analyze API data
    if os.path.exists(api_file):
        with open(api_file, 'r', encoding='utf-8') as f:
            api_data = json.load(f)
        
        print(f"\nTotal API records: {len(api_data)}")
        
        # Check structure of first few items
        print("\nSample API records structure:")
        for i, item in enumerate(api_data[:3]):
            print(f"Record {i+1}: {type(item)}")
            if isinstance(item, dict):
                print(f"  Keys: {list(item.keys())}")
            elif isinstance(item, list) and item:
                print(f"  List of {len(item)} items, first item type: {type(item[0])}")
                if isinstance(item[0], dict):
                    print(f"  First item keys: {list(item[0].keys())}")

if __name__ == "__main__":
    analyze_data()