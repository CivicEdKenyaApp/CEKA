-- ==========================================
-- CONSOLIDATED LEGISLATIVE PIPELINE REPAIR
-- Date: 2026-02-11
-- Description: Repairs bills, processing_jobs, and adds scraper_sources + scrape_runs
-- ==========================================

-- 1. REPAIR 'bills' TABLE
DO $$ 
BEGIN
    -- Add missing tracking & neural columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bills' AND column_name = 'text_content') THEN
        ALTER TABLE public.bills ADD COLUMN text_content text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bills' AND column_name = 'neural_summary') THEN
        ALTER TABLE public.bills ADD COLUMN neural_summary text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bills' AND column_name = 'analysis_status') THEN
        ALTER TABLE public.bills ADD COLUMN analysis_status text DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bills' AND column_name = 'pdf_url') THEN
        ALTER TABLE public.bills ADD COLUMN pdf_url text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bills' AND column_name = 'views_count') THEN
        ALTER TABLE public.bills ADD COLUMN views_count integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bills' AND column_name = 'follow_count') THEN
        ALTER TABLE public.bills ADD COLUMN follow_count integer DEFAULT 0;
    END IF;

    -- Add UNIQUE constraint for upsert support
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bills_title_key') THEN
        ALTER TABLE public.bills ADD CONSTRAINT bills_title_key UNIQUE (title);
    END IF;
END $$;

-- 2. CREATE 'scraper_sources' TABLE
CREATE TABLE IF NOT EXISTS public.scraper_sources (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    url text NOT NULL,
    selector_config jsonb,
    frequency_hours integer DEFAULT 24,
    status text DEFAULT 'active',
    last_scraped_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Seed default sources if empty
INSERT INTO public.scraper_sources (name, url, status)
SELECT 'Kenya Gazette', 'http://kenyalaw.org/kenya_gazette/', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.scraper_sources WHERE name = 'Kenya Gazette');

INSERT INTO public.scraper_sources (name, url, status)
SELECT 'National Assembly Bills', 'http://www.parliament.go.ke/the-national-assembly/house-business/bills', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.scraper_sources WHERE name = 'National Assembly Bills');

INSERT INTO public.scraper_sources (name, url, status)
SELECT 'The Senate Bills', 'http://www.parliament.go.ke/the-senate/house-business/bills', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.scraper_sources WHERE name = 'The Senate Bills');

-- 3. CREATE 'scrape_runs' TABLE
CREATE TABLE IF NOT EXISTS public.scrape_runs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    source text NOT NULL,
    status text NOT NULL,
    bills_found integer DEFAULT 0,
    bills_inserted integer DEFAULT 0,
    bills_updated integer DEFAULT 0,
    error_log text,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    duration_ms integer
);

-- 4. ENABLE RLS & POLICIES
ALTER TABLE public.scraper_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_runs ENABLE ROW LEVEL SECURITY;

-- Policies for public (read-only for authenticated users, full for admins)
-- Assuming a check_user_is_admin() function exists or using is_admin column in profiles
CREATE POLICY "Allow public read for scraper_sources" ON public.scraper_sources
    FOR SELECT USING (true);

CREATE POLICY "Allow admin manage for scraper_sources" ON public.scraper_sources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

CREATE POLICY "Allow public read for scrape_runs" ON public.scrape_runs
    FOR SELECT USING (true);

-- 5. PROCESSING JOBS REPAIR (Ensure updated_at trigger exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_processing_jobs') THEN
        CREATE TRIGGER set_updated_at_processing_jobs
        BEFORE UPDATE ON public.processing_jobs
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
