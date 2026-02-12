#!/usr/bin/env python3
"""
Fetch top trending terms for Kenya and APPEND them to the meta keywords in index.html.
Never overwrites existing keywords – only adds new, unique terms.
Configurable via environment variables.
"""

import os
import sys
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple, Set
import re

# Third‑party imports with graceful fallback for missing dependencies
try:
    from pytrends.request import TrendReq
except ImportError:
    logging.error("pytrends not installed. Run: pip install pytrends")
    sys.exit(2)
try:
    from bs4 import BeautifulSoup, Comment
except ImportError:
    logging.error("beautifulsoup4 not installed. Run: pip install beautifulsoup4")
    sys.exit(2)
try:
    from tenacity import (
        retry,
        stop_after_attempt,
        wait_exponential,
        retry_if_exception_type,
    )
except ImportError:
    logging.error("tenacity not installed. Run: pip install tenacity")
    sys.exit(2)

# ------------------------------------------------------------
# Environment & constants
# ------------------------------------------------------------
INDEX_PATH = os.getenv("INDEX_PATH", "index.html")
TOP_K = int(os.getenv("TOP_K", "20"))          # now 20, not 5
TZ_MINUTES = int(os.getenv("TZ_MINUTES", "180"))  # Kenya UTC+3
DRY_RUN = os.getenv("DRY_RUN", "false").lower() == "true"

# Fallback keywords – only used if pytrends fails AND the meta tag would otherwise be empty.
# These are never merged if existing keywords already exist.
FALLBACK_KEYWORDS = [
    "civic education Kenya",
    "democracy Kenya",
    "governance Kenya",
    "citizen rights",
    "public participation",
    "devolution",
    "IEBC",
    "voter registration",
    "constitution Kenya",
    "recall254",
    "NASAKA map",
    "finance bill",
    "controller of budget",
    "county government",
    "youth leadership",
    "social justice",
    "bill tracker",
    "parliament Kenya",
    "chapter 6 integrity",
    "human rights Kenya"
][:TOP_K]  # ensure we don't exceed requested count

# ------------------------------------------------------------
# Logging setup – structured, with timestamps, visible in GitHub Actions
# ------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("trends_updater")

# ------------------------------------------------------------
# Keyword validation
# ------------------------------------------------------------
def is_valid_keyword(term: str) -> bool:
    """Reject malformed, too short, or URL‑like terms."""
    if not term or len(term) < 3:
        return False
    if len(term) > 100:          # unlikely to be a real trend
        return False
    if term.startswith(("http://", "https://", "www.")):
        return False
    # must contain at least one letter (not just numbers/punctuation)
    if not any(c.isalpha() for c in term):
        return False
    return True

# ------------------------------------------------------------
# Fetch trends with retry & validation
# ------------------------------------------------------------
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type(Exception),  # broad but we log details
    before_sleep=lambda retry_state: logger.warning(
        f"Retry {retry_state.attempt_number}/3 after error: {retry_state.outcome.exception()}"
    ),
)
def fetch_top_trends(top_k: int) -> List[str]:
    """
    Return list of validated top trending search terms for Kenya.
    Returns empty list on any failure (after retries).
    """
    try:
        pytrends = TrendReq(hl="en-US", tz=TZ_MINUTES)
        trending_df = pytrends.trending_searches(pn="kenya")

        if trending_df is None or trending_df.empty:
            logger.warning("pytrends returned empty DataFrame")
            return []

        # First column contains the trend strings
        col0 = trending_df.columns[0]
        raw_terms = trending_df[col0].head(top_k).astype(str).tolist()

        # Clean and validate
        valid_terms = []
        for term in raw_terms:
            term = term.strip()
            if is_valid_keyword(term):
                valid_terms.append(term)
            else:
                logger.debug(f"Filtered out invalid term: {term}")

        logger.info(f"Fetched {len(valid_terms)} valid trends out of {len(raw_terms)} raw")
        return valid_terms

    except Exception as e:
        logger.error(f"Failed to fetch trends: {e}", exc_info=True)
        return []   # signal failure, caller will decide fallback

# ------------------------------------------------------------
# Keyword parsing / merging utilities
# ------------------------------------------------------------
def parse_keywords(keywords_str: str) -> List[str]:
    """Split comma‑separated string into stripped, non‑empty keywords."""
    if not keywords_str:
        return []
    # split by comma, strip each part, filter out empty strings
    return [kw.strip() for kw in keywords_str.split(",") if kw.strip()]

def merge_keywords(existing: List[str], new_terms: List[str]) -> List[str]:
    """
    Append new terms that are not already present (case‑insensitive).
    Preserves order: existing keywords first, then new ones in the order they appeared.
    Duplicates within existing are kept as they were (original code may contain them).
    """
    # Build set of lowercased existing for O(1) lookup
    existing_lower = {kw.lower() for kw in existing}

    merged = existing[:]  # copy
    for term in new_terms:
        if term.lower() not in existing_lower:
            merged.append(term)
            existing_lower.add(term.lower())
            logger.debug(f"Added new keyword: {term}")
        else:
            logger.debug(f"Skipped duplicate: {term}")

    return merged

# ------------------------------------------------------------
# HTML update – meta keywords + last‑updated
# ------------------------------------------------------------
def update_meta_keywords(
    html_path: Path, keywords_list: List[str], dry_run: bool = False
) -> Tuple[bool, List[str]]:
    """
    Update <meta name="keywords"> content with the merged list.
    Also create/update <meta name="last-updated"> with current UTC date.

    Returns:
        (changed, added_keywords) – changed indicates if file was modified,
        added_keywords is list of terms that are new in this run.
    """
    if not html_path.exists():
        raise FileNotFoundError(f"Index file not found: {html_path}")

    original_html = html_path.read_text(encoding="utf-8")
    soup = BeautifulSoup(original_html, "html.parser")

    # Ensure <head> exists
    head = soup.head
    if head is None:
        logger.warning("No <head> found – creating one.")
        head = soup.new_tag("head")
        if soup.html:
            soup.html.insert(0, head)
        else:
            html_tag = soup.new_tag("html")
            html_tag.insert(0, head)
            html_tag.append(soup)
            soup = BeautifulSoup(str(html_tag), "html.parser")
            head = soup.head

    # ----- META KEYWORDS -----
    meta_keywords = head.find("meta", attrs={"name": "keywords"})
    existing_keywords_list = []
    old_content = ""

    if meta_keywords and meta_keywords.get("content"):
        old_content = meta_keywords["content"]
        existing_keywords_list = parse_keywords(old_content)
        logger.debug(f"Existing keywords count: {len(existing_keywords_list)}")
    else:
        logger.info("No existing meta keywords tag – will create one.")

    # Merge existing with new trends
    merged_keywords = merge_keywords(existing_keywords_list, keywords_list)

    # Compute which keywords are actually new (for commit message)
    existing_set_lower = {kw.lower() for kw in existing_keywords_list}
    added_keywords = [kw for kw in merged_keywords if kw.lower() not in existing_set_lower]

    new_content = ", ".join(merged_keywords)

    # Determine if we need to write changes
    keywords_changed = False
    if meta_keywords:
        if old_content.strip() != new_content.strip():
            keywords_changed = True
            if not dry_run:
                meta_keywords["content"] = new_content
                logger.info("Updated meta keywords content.")
            else:
                logger.info("[DRY RUN] Would update meta keywords.")
        else:
            logger.info("No change to keywords content.")
    else:
        # No existing tag, create one
        keywords_changed = True
        if not dry_run:
            new_meta = soup.new_tag("meta")
            new_meta.attrs["name"] = "keywords"
            new_meta.attrs["content"] = new_content
            head.append(new_meta)
            logger.info("Created new meta keywords tag.")
        else:
            logger.info("[DRY RUN] Would create meta keywords tag.")

    # ----- META LAST‑UPDATED (freshness signal) -----
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    last_updated = head.find("meta", attrs={"name": "last-updated"})
    updated_changed = False

    if last_updated:
        old_date = last_updated.get("content", "")
        if old_date != today_str:
            updated_changed = True
            if not dry_run:
                last_updated["content"] = today_str
                logger.info(f"Updated last‑updated to {today_str}.")
            else:
                logger.info(f"[DRY RUN] Would update last‑updated to {today_str}.")
    else:
        # Create it
        updated_changed = True
        if not dry_run:
            new_meta = soup.new_tag("meta")
            new_meta.attrs["name"] = "last-updated"
            new_meta.attrs["content"] = today_str
            head.append(new_meta)
            logger.info(f"Created new last‑updated meta with {today_str}.")
        else:
            logger.info(f"[DRY RUN] Would create last‑updated meta with {today_str}.")

    # ----- WRITE BACK IF CHANGED -----
    changed = keywords_changed or updated_changed
    if changed and not dry_run:
        html_path.write_text(str(soup), encoding="utf-8")
        logger.info(f"Successfully wrote updated HTML to {html_path}")
    elif changed and dry_run:
        logger.info("[DRY RUN] No files written.")
    else:
        logger.info("No changes to write.")

    return changed, added_keywords

# ------------------------------------------------------------
# GitHub Actions integration – set environment variable for commit message
# ------------------------------------------------------------
def set_github_output(name: str, value: str):
    """Write to GITHUB_OUTPUT if running in GitHub Actions."""
    github_output = os.getenv("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"{name}={value}\n")
        logger.debug(f"Set GitHub output {name}={value}")
    else:
        logger.debug(f"Not in GitHub Actions, would set {name}={value}")

def set_github_env(name: str, value: str):
    """Write to GITHUB_ENV if running in GitHub Actions."""
    github_env = os.getenv("GITHUB_ENV")
    if github_env:
        with open(github_env, "a") as f:
            f.write(f"{name}={value}\n")
        logger.debug(f"Set GitHub env {name}={value}")
    else:
        logger.debug(f"Not in GitHub Actions, would set env {name}={value}")

# ------------------------------------------------------------
# Main orchestration
# ------------------------------------------------------------
def main():
    logger.info("=" * 60)
    logger.info("Starting Kenyan trends updater")
    logger.info(f"INDEX_PATH = {INDEX_PATH}")
    logger.info(f"TOP_K      = {TOP_K}")
    logger.info(f"DRY_RUN    = {DRY_RUN}")
    logger.info("=" * 60)

    html_path = Path(INDEX_PATH)

    # Step 1: Fetch live trends
    trends = fetch_top_trends(TOP_K)

    # If we got no trends, decide what to do
    if not trends:
        logger.warning("No live trends fetched.")
        # If there is already a meta keywords tag with content, we keep it unchanged.
        # We still might update last‑updated? For now, we exit without changes.
        logger.info("Exiting – no changes made.")
        sys.exit(0)

    logger.info(f"Fetched {len(trends)} validated trends: {trends[:5]}...")

    # Step 2: Update HTML (merge, not overwrite)
    try:
        changed, added_keywords = update_meta_keywords(
            html_path, trends, dry_run=DRY_RUN
        )
    except Exception as e:
        logger.error(f"Failed to update HTML: {e}", exc_info=True)
        sys.exit(1)

    # Step 3: Output for GitHub Actions (if changed)
    if changed and not DRY_RUN:
        # Build a concise commit message snippet (first 3 new keywords)
        if added_keywords:
            snippet = ", ".join(added_keywords[:3])
            if len(added_keywords) > 3:
                snippet += "..."
        else:
            snippet = "keywords refreshed"
        set_github_env("NEW_KEYWORDS_SNIPPET", snippet)
        # Also output the full list for debugging
        set_github_output("new_keywords", ", ".join(added_keywords))
        set_github_output("total_keywords", str(len(parse_keywords(html_path.read_text(encoding="utf-8")))))

        logger.info(f"Added {len(added_keywords)} new keywords: {added_keywords[:5]}...")
    else:
        logger.info("No changes to report to GitHub.")

    logger.info("Script finished successfully.")

if __name__ == "__main__":
    main()
