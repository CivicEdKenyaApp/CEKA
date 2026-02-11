import requests
import time

targets = [
    "https://erepository.uonbi.ac.ke/handle/11295/165330",
    "https://library.kemu.ac.ke/kemuwiki/index.php/The_Importance_Of_Civic_Education_In_Today_s_Society",
    "https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports/",
    "https://google.com"
]

print("Starting Reachability Diagnostic...")
for url in targets:
    try:
        start = time.time()
        r = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
        duration = time.time() - start
        print(f"URL: {url}")
        print(f"  Status: {r.status_code}")
        print(f"  Time: {duration:.2f}s")
        print(f"  Content Length: {len(r.content)} bytes")
    except Exception as e:
        print(f"URL: {url}")
        print(f"  FAILED: {e}")
    print("-" * 20)
