import os
import sys
import json
import traceback
from supabase import create_client, Client

# Load environment variables
def load_env_file():
    env_path = "d:/CEKA/ceka v010/CEKA/.env"
    try:
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key.strip()] = value.strip()
            print("Environment loaded.")
        else:
            print(f"No .env file found at {env_path}")
    except Exception as e:
        print(f"Failed to load .env file: {str(e)}")

try:
    load_env_file()

    SUPABASE_URL = "https://cajrvemigxghnfmyopiy.supabase.co" 
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not SUPABASE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY missing!")
        sys.exit(1)

    print(f"Connecting to Supabase at {SUPABASE_URL}...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Tables to check fully
    tables_to_check = {
        'content_topics': ['id', 'name', 'description', 'keywords', 'is_active', 'priority', 'gemini_prompt_template', 'daily_article_limit', 'target_word_count', 'local_context_required', 'min_kenyan_references', 'allowed_tone_profiles', 'excluded_tone_profiles', 'rotation_schedule', 'metadata', 'created_at', 'updated_at', 'last_used_at', 'usage_count'],
        'ai_models': ['id', 'name', 'provider', 'api_endpoint', 'api_key_required', 'api_key_storage_path', 'rate_limit_rpm', 'rate_limit_tpm', 'rate_limit_rpd', 'cost_per_token', 'max_output_tokens', 'default_temperature', 'is_active', 'is_default', 'config', 'features', 'health_status', 'last_health_check', 'error_count', 'total_requests', 'total_tokens_used', 'total_cost', 'created_at', 'updated_at'],
        'content_queue': ['id', 'topic_id', 'ai_model_id', 'parent_queue_id', 'status', 'priority', 'prompt_used', 'prompt_hash', 'ai_raw_response', 'generated_content', 'error_message', 'error_stack', 'retry_config', 'attempt_count', 'max_attempts', 'next_retry_at', 'scheduled_for', 'started_at', 'completed_at', 'processing_duration', 'tokens_used', 'estimated_cost', 'metadata', 'created_at', 'updated_at'],
        'generated_articles': ['id', 'queue_id', 'topic_id', 'title', 'slug', 'excerpt', 'content', 'html_content', 'tone', 'template_used', 'template_variation', 'seo_keywords', 'meta_description', 'readability_score', 'ai_model_used', 'word_count', 'character_count', 'sentence_count', 'paragraph_count', 'has_local_context', 'kenyan_references', 'kenyan_reference_count', 'quality_score', 'seo_score', 'engagement_score', 'originality_score', 'flags', 'status', 'version', 'previous_version_id', 'submitted_for_review_at', 'submitted_by', 'reviewed_by', 'reviewed_at', 'review_notes', 'published_at', 'published_by', 'archived_at', 'archived_by', 'archive_reason', 'metadata', 'created_at', 'updated_at'],
        'content_reviews': ['id', 'article_id', 'reviewer_id', 'review_cycle', 'action', 'feedback', 'changes_requested', 'suggested_title', 'suggested_excerpt', 'suggested_keywords', 'severity', 'estimated_fix_time', 'resolved', 'resolved_at', 'resolved_by', 'next_reviewer_id', 'requires_rework', 'rework_deadline', 'metadata', 'created_at', 'updated_at'],
        'content_templates': ['id', 'name', 'description', 'template_type', 'content_structure', 'tone_guidelines', 'example_output', 'is_active', 'is_system_template', 'rotation_weight', 'applicable_topics', 'excluded_topics', 'min_word_count', 'max_word_count', 'usage_count', 'success_rate', 'metadata', 'created_at', 'updated_at'],
        'tone_profiles': ['id', 'name', 'description', 'config', 'gemini_instruction', 'deepseek_instruction', 'is_active', 'usage_count', 'success_rate', 'metadata', 'created_at'],
        'review_assignments': ['id', 'article_id', 'reviewer_id', 'assigned_by', 'sequence', 'status', 'deadline', 'assigned_at', 'started_at', 'completed_at', 'escalation_reason', 'escalated_to', 'metadata', 'created_at', 'updated_at'],
        'sitemap_entries': ['id', 'article_id', 'slug', 'lastmod', 'changefreq', 'priority', 'is_active', 'created_at', 'updated_at'],
        'generation_logs': ['id', 'user_id', 'action', 'details', 'success', 'error_message', 'duration_ms', 'created_at'],
        'webhook_logs': ['id', 'event', 'payload', 'processed_at', 'status', 'error', 'retry_count', 'next_retry_at', 'created_at'],
        'rate_limit_tracking': ['id', 'ai_model_id', 'period_start', 'period_type', 'request_count', 'token_count', 'created_at'],
        'performance_metrics': ['id', 'metric_name', 'metric_value', 'metric_unit', 'context', 'recorded_at', 'created_at']
    }

    print("\n--- DB Schema Audit ---")
    
    missing_columns = {}

    for table, expected_cols in tables_to_check.items():
        try:
            sys.stdout.write(f"Checking '{table}'... ")
            sys.stdout.flush()
            
            # Use PostgREST RPC to get columns via a hack or try selecting 1 row and inspecting keys
            # Selecting keys works if table has data. If empty, difficult to check columns via JS client without RPC.
            # But we can try to insert a dummy row with ALL columns = NULL (except required) and see error? No that's risky.
            
            # Better approach: We can check if a column exists by trying to select just that column.
            # 'select=column_name' -> if error 400 Bad Request (column does not exist), then missing.
            
            # Limit check to critical known missing columns from previous failure reports first?
            # Or assume we just select * limit 1.
            
            res = supabase.table(table).select("*").limit(1).execute()
            print("EXISTS [OK]")
            
            if res.data and len(res.data) > 0:
                # Can check columns directly
                existing_cols = list(res.data[0].keys())
                missing = [col for col in expected_cols if col not in existing_cols]
                if missing:
                     print(f"  -> MISSING COLUMNS: {missing}")
                     missing_columns[table] = missing
                else:
                    print("  -> All expected columns present (based on data row)")
            else:
                 # Table empty. We have to assume columns might be missing based on user report.
                 # Actually, we can try to select specific columns.
                 print("  -> Table empty. Checking columns individually...")
                 
                 verified_missing = []
                 for col in expected_cols:
                     try:
                         # Select specific column
                         supabase.table(table).select(col).limit(0).execute()
                     except Exception as e:
                         # If column missing, PostgREST returns error
                         if "Could not find the " in str(e) or "does not exist" in str(e):
                             verified_missing.append(col)
                 
                 if verified_missing:
                     print(f"  -> CONFIRMED MISSING COLUMNS: {verified_missing}")
                     missing_columns[table] = verified_missing
                 else:
                     print("  -> All columns seem to exist.")

        except Exception as e:
            msg = str(e)
            if "relation" in msg and "does not exist" in msg:
                 print("DOES NOT EXIST [MISSING TABLE]")
                 # If table doesn't exist, our migration will create it fully, so no missing columns strictly speaking
            else:
                print(f"ERROR: {msg}")

    print("\n--- SUMMARY ---")
    if missing_columns:
        print("Missing columns detected in existing tables:")
        for t, cols in missing_columns.items():
            print(f"- {t}: {cols}")
    else:
        print("No missing columns detected (or tables don't exist yet).")

except Exception as e:
    print("CRITICAL FAILURE:")
    traceback.print_exc()
