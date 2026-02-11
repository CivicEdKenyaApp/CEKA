from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin

def offline_diagnostic():
    filename = "debug_cob.html"
    url = "https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports/"
    print(f"OFFLINE DIAGNOSTIC START: {filename}")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    links = soup.find_all('a')
    print(f"Found {len(links)} anchors in HTML.")
    
    found_count = 0
    resource_patterns = [r'/download/', r'/bitstream/', r'/handle/']
    file_extensions = ('.pdf', '.docx', '.doc', '.pptx', '.xls', '.xlsx')
    
    for i, link in enumerate(links):
        onclick = link.get('onclick', '')
        href = link.get('href', '')
        text = link.get_text().strip()
        
        potential_urls = []
        if href and href != "#": potential_urls.append(urljoin(url, href))
        if onclick and "location.href" in onclick:
            match = re.search(r"location\.href\s*=\s*['\"]([^'\"]+)['\"]", onclick)
            if match:
                potential_urls.append(urljoin(url, match.group(1)))
        
        for full_url in potential_urls:
            is_file = any(full_url.lower().split('?')[0].endswith(ext) for ext in file_extensions)
            is_download_path = any(re.search(pat, full_url.lower()) for pat in resource_patterns)
            
            if is_file or is_download_path:
                print(f"[{i}] SUCCESS: {text[:50]} -> {full_url}")
                found_count += 1
            elif "download" in full_url.lower() or "pdf" in full_url.lower():
                print(f"[{i}] REJECTED: {full_url} (File: {is_file}, Path: {is_download_path})")

    print(f"\nTOTAL RESOURCES FOUND IN HTML: {found_count}")

if __name__ == "__main__":
    offline_diagnostic()
