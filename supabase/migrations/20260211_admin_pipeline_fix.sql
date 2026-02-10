-- CONSOLIDATED ADMINISTRATIVE & PIPELINE FIXES
-- GO HAM! FULL IMPLEMENTATION

-- 1. FIX is_admin() FUNCTION
-- Ensure it is robust, has security definer, and handles all bypasses correctly
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- SERVICE ROLE BYPASS
  IF (auth.role() = 'service_role') THEN RETURN true; END IF;
  
  -- ROOT EMAIL BYPASS
  IF (auth.jwt()->>'email' = 'civiceducationkenya@gmail.com') THEN RETURN true; END IF;
  
  -- ROLE TABLE CHECK
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN RETURN true; END IF;
  
  -- PROFILE TABLE FALLBACK
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN RETURN true; END IF;
  
  RETURN false;
END;
$$;

-- 2. FIX admin_sessions RLS
-- The previous policy was trying to query auth.users directly which caused 403
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admins have full access to sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admins manage sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "admins_manage_own_sessions" ON public.admin_sessions;

CREATE POLICY "Admins full access sessions" 
ON public.admin_sessions 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. FIX pipeline tables RLS (scraper_sources, scrape_runs, processing_jobs)
-- Ensure admins can always see and manage these

-- processing_jobs
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage all jobs" ON public.processing_jobs;
CREATE POLICY "Admins manage all jobs" 
ON public.processing_jobs 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- scraper_sources
ALTER TABLE public.scraper_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage sources" ON public.scraper_sources;
CREATE POLICY "Admins manage sources" 
ON public.scraper_sources 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- scrape_runs
ALTER TABLE public.scrape_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view runs" ON public.scrape_runs;
CREATE POLICY "Admins view runs" 
ON public.scrape_runs 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

-- 4. FIX permissions for users table access in profiles if needed
-- (Though is_admin now bypasses the need for restricted auth.users queries)

-- 5. ENSURE REALTIME IS ENABLED FOR THESE TABLES (Idempotent check)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'processing_jobs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.processing_jobs;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'scrape_runs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.scrape_runs;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'admin_notifications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.admin_notifications;
    END IF;
END $$;
