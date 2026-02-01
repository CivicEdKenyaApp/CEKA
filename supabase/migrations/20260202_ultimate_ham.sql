-- ================================================
-- CEKA ULTIMATE HAM INFRASTRUCTURE MIGRATION
-- Everything needed for Phase 3 "Going Ham"
-- ================================================

-- 1. EXTENDED REALTIME PUBLICATION
-- ------------------------------------------
-- Ensure all relevant tables are in the realtime publication
DO $$
BEGIN
    -- Check if tables exist before adding to publication
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_notifications' AND schemaname = 'public') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
    END IF;
EXCEPTION WHEN OTHERS THEN 
    -- Ignore if already in publication
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bills' AND schemaname = 'public') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
    END IF;
EXCEPTION WHEN OTHERS THEN END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chat_messages' AND schemaname = 'public') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;
EXCEPTION WHEN OTHERS THEN END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
EXCEPTION WHEN OTHERS THEN END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'constitution_sections' AND schemaname = 'public') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.constitution_sections;
    END IF;
EXCEPTION WHEN OTHERS THEN END $$;

-- 2. ADVANCED ANALYTICS VIEWS
-- ------------------------------------------

-- View for real-time dashboard metrics
CREATE OR REPLACE VIEW public.admin_intelligence_summary AS
SELECT
    (SELECT count(*) FROM auth.users) as total_users,
    (SELECT count(*) FROM public.bills) as total_bills,
    (SELECT count(*) FROM public.user_notifications WHERE is_read = false) as pending_alerts,
    (SELECT count(*) FROM public.chat_messages WHERE created_at > now() - interval '24 hours') as chat_activity_24h;

-- Bill activity heatmap data
CREATE OR REPLACE VIEW public.bill_intelligence_heatmap AS
SELECT
    b.id,
    b.title,
    b.category,
    b.views_count,
    (SELECT count(*) FROM public.bill_follows f WHERE f.bill_id = b.id) as follow_count,
    (b.views_count + (SELECT count(*) FROM public.bill_follows f WHERE f.bill_id = b.id) * 10) as intensity_score
FROM public.bills b
ORDER BY intensity_score DESC;

-- 3. SECURE VAULT FUNCTIONS
-- ------------------------------------------

-- Update bills table to include vault metadata
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS vault_id text;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS vault_metadata jsonb DEFAULT '{}'::jsonb;

-- 4. CONSTITUTION ENHANCEMENTS
-- ------------------------------------------
-- Ensure we can store article labels (e.g. "Article 42")
ALTER TABLE public.constitution_sections ADD COLUMN IF NOT EXISTS article_label text;

-- 5. RPC FOR BATCH CONSTITUTION SEEDING
-- ------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_constitution_batch(
    p_chapter_data jsonb,
    p_section_data jsonb
) RETURNS void AS $$
BEGIN
    -- Insert chapters
    INSERT INTO public.constitution_chapters (chapter_number, title_en, title_sw)
    SELECT 
        (value->>'chapter_number')::integer,
        value->>'title_en',
        value->>'title_sw'
    FROM jsonb_array_elements(p_chapter_data)
    ON CONFLICT (chapter_number) DO UPDATE SET
        title_en = EXCLUDED.title_en,
        title_sw = EXCLUDED.title_sw;

    -- Insert sections
    INSERT INTO public.constitution_sections (chapter_id, article_number, article_label, title_en, title_sw, content_en, content_sw)
    SELECT 
        (SELECT id FROM public.constitution_chapters WHERE chapter_number = (value->>'chapter_number')::integer),
        (value->>'article_number')::integer,
        value->>'article_label',
        value->>'title_en',
        value->>'title_sw',
        value->>'content_en',
        value->>'content_sw'
    FROM jsonb_array_elements(p_section_data)
    ON CONFLICT (chapter_id, article_number) DO UPDATE SET
        article_label = EXCLUDED.article_label,
        title_en = EXCLUDED.title_en,
        title_sw = EXCLUDED.title_sw,
        content_en = EXCLUDED.content_en,
        content_sw = EXCLUDED.content_sw;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint for conflict resolution
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'constitution_chapters_number_key') THEN
        ALTER TABLE public.constitution_chapters ADD CONSTRAINT constitution_chapters_number_key UNIQUE (chapter_number);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'constitution_sections_chapter_article_key') THEN
        ALTER TABLE public.constitution_sections ADD CONSTRAINT constitution_sections_chapter_article_key UNIQUE (chapter_id, article_number);
    END IF;
END $$;
