import asyncio
import re
from playwright.async_api import async_playwright
from urllib.parse import urljoin
from bs4 import BeautifulSoup

async def diagnostic():
    url = "https://erepository.uonbi.ac.ke/handle/11295/165330"
    print(f"DIAGNOSTIC START: {url}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(ignore_https_errors=True)
        page = await context.new_page()
        try:
            await page.goto(url, wait_until="load", timeout=30000)
            print(f"Page Loaded.")
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            links = soup.find_all('a')
            print(f"Found {len(links)} anchors.")
            
            for i, link in enumerate(links):
                href = link.get('href')
                text = link.get_text().strip()
                if not href: continue
                full_url = urljoin(url, href)
                
                # Check against scraper logic
                file_extensions = ('.pdf', '.docx', '.doc', '.pptx', '.xls', '.xlsx')
                resource_patterns = [r'/download/', r'/bitstream/', r'/handle/', r'wpdmdl=', r'\.pdf']
                
                norm_url = full_url.lower()
                pure_url = norm_url.split('?')[0]
                is_file = any(pure_url.endswith(ext) for ext in file_extensions)
                is_download_path = any(re.search(pat, norm_url) for pat in resource_patterns)
                
                if is_file or is_download_path:
                    print(f"[{i}] SUCCESS: {text[:30]} -> {full_url}")
                elif "bitstream" in norm_url:
                    print(f"[{i}] BITSTREAM (No Pattern Match): {text[:30]} -> {full_url}")

        except Exception as e:
            print(f"DIAGNOSTIC FAILED: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(diagnostic())
