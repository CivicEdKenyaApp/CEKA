import asyncio
import re
from playwright.async_api import async_playwright
from urllib.parse import urljoin

async def diagnostic():
    url = "https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports/"
    print(f"DIAGNOSTIC START: {url}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, wait_until="networkidle")
        
        links = await page.query_selector_all("a")
        print(f"Found {len(links)} anchors.")
        
        for i, link in enumerate(links):
            onclick = await link.get_attribute("onclick")
            if onclick:
                print(f"[{i}] RAW ONCLICK: {onclick}")
                if "location.href" in onclick:
                    match = re.search(r"location\.href\s*=\s*['\"]([^'\"]+)['\"]", onclick)
                    if match:
                        extracted = match.group(1)
                        full = urljoin(url, extracted)
                        print(f"    FOUND: {extracted} -> {full}")
                        # Check match
                        is_dl = re.search(r'/download/', full.lower())
                        print(f"    IS_DOWNLOAD_PATH: {bool(is_dl)}")
            
            href = await link.get_attribute("href")
            if href and "download" in href.lower():
                print(f"[{i}] HREF DOWNLOAD: {href}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(diagnostic())
