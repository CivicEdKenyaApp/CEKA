-- ==========================================================
-- RESOURCE INTELLIGENCE ULTIMATE - GO HAM CONSOLIDATED
-- Date: 2026-02-11
-- ==========================================================

-- 1. EXTEND RESOURCES TABLE
DO $$ 
BEGIN 
    -- High-fidelity Metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='provider') THEN
        ALTER TABLE public.resources ADD COLUMN provider TEXT DEFAULT 'Civic Education Kenya';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='summary') THEN
        ALTER TABLE public.resources ADD COLUMN summary TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='metadata') THEN
        ALTER TABLE public.resources ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
    END IF;

    -- Analytics & Sorting
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='tags') THEN
        ALTER TABLE public.resources ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='views') THEN
        ALTER TABLE public.resources ADD COLUMN views INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='downloads') THEN
        ALTER TABLE public.resources ADD COLUMN downloads INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='is_featured') THEN
        ALTER TABLE public.resources ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    -- Standard maintenance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='updated_at') THEN
        ALTER TABLE public.resources ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- 2. ENHANCED SCRAPER TRACKING
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scrape_runs' AND column_name='resources_found') THEN
        ALTER TABLE public.scrape_runs ADD COLUMN resources_found INTEGER DEFAULT 0;
        ALTER TABLE public.scrape_runs ADD COLUMN resources_inserted INTEGER DEFAULT 0;
        ALTER TABLE public.scrape_runs ADD COLUMN resources_updated INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. ENABLE RLS & POLICIES
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view resources" ON public.resources;
CREATE POLICY "Anyone can view resources" ON public.resources 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage all resources" ON public.resources;
CREATE POLICY "Admins manage all resources" ON public.resources
    FOR ALL TO authenticated 
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. INITIAL HAM SOURCES
INSERT INTO public.scraper_sources (name, url, status, frequency_hours, selector_config)
VALUES 
('University of Nairobi Civic Repository', 'https://erepository.uonbi.ac.ke/handle/11295/165330', 'active', 24, '{"recursive": true, "depth": 2}'),
('KeMU Wiki Gateway', 'https://library.kemu.ac.ke/kemuwiki/index.php/The_Importance_Of_Civic_Education_In_Today_s_Society', 'active', 24, '{"recursive": true, "depth": 1}'),
('Citizenship Education Kenya (BPB)', 'https://www.bpb.de/die-bpb/partner/nece/505385/citizenship-education-in-kenya/', 'active', 24, '{"recursive": false}'),
('Wiley Public Administration', 'https://onlinelibrary.wiley.com/doi/abs/10.1111/puar.13294', 'active', 48, '{"recursive": false}'),
('Controller of Budget Reports', 'https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports/', 'active', 24, '{"recursive": true, "depth": 1}')
ON CONFLICT (name) DO UPDATE SET url = EXCLUDED.url;

-- 5. REALTIME ENABLEMENT
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'resources') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
