-- ==========================================================
-- RESOURCE INTELLIGENCE V1 - SCHEMA UNIFICATION
-- Date: 2026-02-11
-- ==========================================================

-- 1. Ensure all rich metadata columns exist in public.resources
DO $$ 
BEGIN 
    -- Basic info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='provider') THEN
        ALTER TABLE public.resources ADD COLUMN provider TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='summary') THEN
        ALTER TABLE public.resources ADD COLUMN summary TEXT;
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

    -- Rich Metadata (JSONB for extensibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='metadata') THEN
        ALTER TABLE public.resources ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
    END IF;

    -- Timestamps robustness
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='updated_at') THEN
        ALTER TABLE public.resources ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- 2. Update existing records with default provider if null
UPDATE public.resources SET provider = 'Civic Education Kenya' WHERE provider IS NULL;

-- 3. Ensure RLS is active for resources (it should be, but let's be sure)
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 4. Admin Policies for Resource Management
DROP POLICY IF EXISTS "Admins can manage all resources" ON public.resources;
CREATE POLICY "Admins can manage all resources" ON public.resources
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view resources" ON public.resources;
CREATE POLICY "Anyone can view resources" ON public.resources
    FOR SELECT USING (true);

-- 5. Add Scraper Source for Resources if missing
INSERT INTO public.scraper_sources (name, url, status, frequency_hours)
VALUES ('Civic Resource Engine', 'https://www.civiceducationkenya.com/resources', 'active', 24)
ON CONFLICT (name) DO UPDATE SET url = EXCLUDED.url;

-- 6. Replication for Real-time
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'resources') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
