-- ==========================================================
-- RESOURCE SCHEME & THUMBNAIL STABILITY FIX
-- Date: 2026-02-08
-- ==========================================================

-- 1. Ensure all required columns exist in public.resources
DO $$ 
BEGIN 
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='tags') THEN
        ALTER TABLE public.resources ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    -- Add views column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='views') THEN
        ALTER TABLE public.resources ADD COLUMN views INTEGER DEFAULT 0;
    END IF;

    -- Add downloads column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='downloads') THEN
        ALTER TABLE public.resources ADD COLUMN downloads INTEGER DEFAULT 0;
    END IF;

    -- Add is_featured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='is_featured') THEN
        ALTER TABLE public.resources ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Fix broken thumbnail paths
-- We clear paths starting with /assets/ because that folder doesn't exist.
-- This allows the frontend to fall back to the Intelligent Placeholder Engine.
UPDATE public.resources 
SET thumbnail_url = NULL 
WHERE (thumbnail_url LIKE '/assets/%' OR thumbnail_url LIKE 'https://example.org/%');

-- 3. Ensure consistent default values for counts
UPDATE public.resources SET downloads = 0 WHERE downloads IS NULL;
UPDATE public.resources SET views = 0 WHERE views IS NULL;

-- 4. Tagging for Intelligent Placeholder matching
-- We use array_cat or array_append safely
UPDATE public.resources 
SET tags = array_append(COALESCE(tags, '{}'), 'constitution')
WHERE title ILIKE '%Constitution%' AND NOT ('constitution' = ANY(COALESCE(tags, '{}')));

UPDATE public.resources 
SET tags = array_append(COALESCE(tags, '{}'), 'rights')
WHERE title ILIKE '%Rights%' AND NOT ('rights' = ANY(COALESCE(tags, '{}')));
