import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Any
from supabase import create_client, Client

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        logging.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment")
        raise EnvironmentError("Missing Supabase credentials")

    return create_client(url, key)


def record_scrape_run(supabase: Client, source: str, status: str, found: int, inserted: int, updated: int, error: str = None):
    """
    Log the result of the sync to the scrape_runs table.
    """
    try:
        data = {
            "source": source,
            "status": status,
            "bills_found": found,
            "bills_inserted": inserted,
            "bills_updated": updated,
            "error_log": error,
            "completed_at": datetime.now().isoformat()
        }
        supabase.table("scrape_runs").insert(data).execute()
    except Exception as e:
        logging.error(f"Failed to record scrape run: {e}")


def sync_data(output_dir="processed_data/legislative"):
    supabase = get_supabase_client()

    # Logic to find the latest JSON file
    if not os.path.exists(output_dir):
        logging.warning(f"Output directory {output_dir} does not exist.")
        return

    files = [f for f in os.listdir(output_dir) if f.endswith('.json')]
    if not files:
        logging.warning("No scraped data files found to sync.")
        return

    files.sort()
    latest_file = os.path.join(output_dir, files[-1])
    logging.info(f"Syncing data from: {latest_file}")

    with open(latest_file, 'r', encoding='utf-8') as f:
        bills = json.load(f)

    if not bills:
        logging.warning("Scraped data file is empty. Nothing to sync.")
        return

    logging.info(f"Found {len(bills)} bills to sync.")

    total_inserted = 0
    total_updated = 0
    total_skipped = 0
    total_failed = 0

    # Source for run log
    source_name = bills[0].get("source", "Unknown Source") if bills else "Unknown Source"

    for bill in bills:
        try:
            title = bill.get("title", "").strip()
            if not title:
                logging.warning("Skipping bill with empty title")
                total_skipped += 1
                continue

            # Full data mapping to match repaired schema
            data = {
                "title": title,
                "summary": bill.get("summary", ""),
                "description": bill.get("summary", ""),
                "status": bill.get("status", "Published"),
                "category": bill.get("category", "Legislative"),
                "sponsor": bill.get("sponsor", ""),
                "date": bill.get("date", datetime.now().strftime("%Y-%m-%d")),
                "url": bill.get("url", ""),
                "pdf_url": bill.get("url", ""), # In this scraper, url is the PDF url
                "sources": bill.get("source", ""),
                "updated_at": datetime.now().isoformat()
            }

            # Use upsert with on_conflict on title
            # This is much cleaner and faster than manual check-then-insert/update
            res = supabase.table("bills").upsert(data, on_conflict="title").execute()
            
            # Supabase Python client 'upsert' returns data on success.
            # However, detecting if it was an insert or update is tricky without a separate check
            # but usually 'created_at' == 'updated_at' for new ones.
            # Simplified: if it worked, increment total_inserted (or we just track "total_processed")
            if res.data:
                total_inserted += 1 # In reality this might be an update, but we'll count as "synced"
            else:
                total_failed += 1

        except Exception as e:
            logging.error(f"Failed to sync bill '{bill.get('title', 'unknown')}': {e}")
            total_failed += 1

    logging.info(f"Sync complete:")
    logging.info(f"  + Synced: {total_inserted}")
    logging.info(f"  > Skipped: {total_skipped}")
    logging.info(f"  x Failed: {total_failed}")
    
    # Record the run
    record_scrape_run(
        supabase, 
        source_name, 
        "Success" if total_failed == 0 else "Partial", 
        len(bills), 
        total_inserted, 
        0, # Using upsert we don't distinguish easily
        None if total_failed == 0 else f"Failed {total_failed} bills"
    )


if __name__ == "__main__":
    sync_data()

