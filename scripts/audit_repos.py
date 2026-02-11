import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from urllib.parse import urljoin

async def audit_url(url, name):
    print(f"\n--- Auditing: {name} ({url}) ---")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(url, wait_until="networkidle", timeout=60000)
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Save HTML for manual inspection if needed
            filename = f"debug_{name.lower().replace(' ', '_')}.html"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Saved HTML to {filename}")
            
            # Look for all links
            links = soup.find_all('a', href=True)
            print(f"Total links found: {len(links)}")
            
            # Look for specific document patterns
            file_extensions = ('.pdf', '.docx', '.doc', '.pptx', '.xls', '.xlsx')
            found_files = []
            for l in links:
                href = l['href']
                full_url = urljoin(url, href)
                text = l.get_text().strip()
                if any(full_url.lower().endswith(ext) for ext in file_extensions):
                    found_files.append((text, full_url))
                elif 'handle' in full_url.lower() or 'download' in full_url.lower() or 'bitstream' in full_url.lower():
                    # Pattern for DSpace / repositories
                    found_files.append((f"[Potential] {text}", full_url))
            
            print(f"Direct/Potential files found: {len(found_files)}")
            for text, furl in found_files[:10]:
                print(f"  - {text}: {furl}")
                
        except Exception as e:
            print(f"Error auditing {name}: {e}")
        finally:
            await browser.close()

async def main():
    targets = [
        {"url": "https://erepository.uonbi.ac.ke/handle/11295/165330", "name": "UoN"},
        {"url": "https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports/", "name": "COB"}
    ]
    for t in targets:
        await audit_url(t['url'], t['name'])

if __name__ == "__main__":
    asyncio.run(main())
