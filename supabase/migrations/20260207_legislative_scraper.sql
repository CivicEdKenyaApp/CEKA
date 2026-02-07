-- ================================================
-- CEKA Legislative Scraper Infrastructure
-- ================================================

-- 1. SCRAPER SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.scraper_sources (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    url text NOT NULL,
    selector_config jsonb DEFAULT '{}'::jsonb, -- CSS selectors or specific parsing logic
    last_scraped_at timestamp with time zone,
    status text DEFAULT 'active', -- active, inactive, failing
    frequency_hours integer DEFAULT 24,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. ENHANCE PROCESSING JOBS (if not already there)
-- This table tracks the progress of crawls and analysis
CREATE TABLE IF NOT EXISTS public.processing_jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_name text NOT NULL,
    input_urls text[] DEFAULT '{}'::text[],
    input_files text[] DEFAULT '{}'::text[],
    status text DEFAULT 'pending', -- pending, processing, completed, failed
    progress integer DEFAULT 0,
    current_step text,
    result_data jsonb DEFAULT '{}'::jsonb,
    error_message text,
    processing_logs jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);

-- 3. RLS POLICIES
ALTER TABLE public.scraper_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage scraper sources" ON public.scraper_sources;
CREATE POLICY "Admins can manage scraper sources"
    ON public.scraper_sources FOR ALL
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can view processing jobs" ON public.processing_jobs;
CREATE POLICY "Admins can view processing jobs"
    ON public.processing_jobs FOR ALL
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 4. SEED SAMPLE SOURCES
INSERT INTO public.scraper_sources (name, url, selector_config)
VALUES 
    ('National Assembly Bills', 'http://www.parliament.go.ke/the-national-assembly/house-business/bills', '{"row_selector": ".views-row", "title_selector": ".bill-title"}'),
    ('The Senate Bills', 'http://www.parliament.go.ke/the-senate/house-business/bills', '{"row_selector": ".views-row", "title_selector": ".bill-title"}'),
    ('Kenya Gazette', 'http://kenyalaw.org/kenya_gazette/', '{"row_selector": ".gazette-row", "title_selector": ".gazette-title"}')
ON CONFLICT DO NOTHING;
