-- ====================================================================
-- CEKA GO-HAM FULL SYSTEM RESTORATION & PIPELINE ACTIVATION
-- ====================================================================
-- This migration fixes:
-- 1. is_admin() function robustness
-- 2. admin_sessions RLS (broken 403)
-- 3. processing_jobs, scraper_sources, scrape_runs RLS
-- 4. get_trending_bills RPC (400 Bad Request type mismatch)
-- 5. Realtime publications for pipeline monitoring
-- ====================================================================

-- 1. IS_ADMIN ROBUSTNESS
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

-- 2. RLS REPAIRS
-- admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admins full access sessions" ON public.admin_sessions;
CREATE POLICY "Admins full access sessions" ON public.admin_sessions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- processing_jobs
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage all jobs" ON public.processing_jobs;
CREATE POLICY "Admins manage all jobs" ON public.processing_jobs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- scraper_sources
ALTER TABLE public.scraper_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage sources" ON public.scraper_sources;
CREATE POLICY "Admins manage sources" ON public.scraper_sources FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- scrape_runs
ALTER TABLE public.scrape_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view runs" ON public.scrape_runs;
CREATE POLICY "Admins view runs" ON public.scrape_runs FOR SELECT TO authenticated USING (public.is_admin());

-- bills
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage bills" ON public.bills;
CREATE POLICY "Admins can manage bills" ON public.bills FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Anyone can read bills" ON public.bills;
CREATE POLICY "Anyone can read bills" ON public.bills FOR SELECT TO anon, authenticated USING (true);

-- 3. TRENDING BILLS RPC FIX (Type mismatch fix)
DROP FUNCTION IF EXISTS public.get_trending_bills();
DROP FUNCTION IF EXISTS public.get_trending_bills(integer);

CREATE OR REPLACE FUNCTION public.get_trending_bills(limit_count integer DEFAULT 5) 
RETURNS TABLE(
    id uuid, 
    title text, 
    summary text, 
    status text, 
    category text, 
    date text, 
    created_at timestamp with time zone, 
    url text, 
    sponsor text, 
    description text, 
    neural_summary text, 
    text_content text, 
    pdf_url text, 
    follow_count bigint
)
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.title,
    b.summary,
    b.status,
    b.category,
    b.date::text, -- Cast to text to match RETURNS TABLE
    b.created_at,
    b.url,
    b.sponsor,
    b.description,
    b.neural_summary,
    b.text_content,
    b.pdf_url,
    COALESCE((
      SELECT COUNT(*)::BIGINT
      FROM public.bill_follows bf
      WHERE bf.bill_id = b.id
    ), 0) + COALESCE(b.follow_count, 0)::BIGINT AS follow_count
  FROM public.bills b
  ORDER BY
    (COALESCE((
      SELECT COUNT(*)
      FROM public.bill_follows bf
      WHERE bf.bill_id = b.id
    ), 0) + COALESCE(b.follow_count, 0)) DESC,
    b.created_at DESC
  LIMIT limit_count;
END;
$$;

-- 4. REALTIME ENABLEMENT
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

-- RESTORE GRANTS
GRANT ALL ON FUNCTION public.get_trending_bills(integer) TO anon;
GRANT ALL ON FUNCTION public.get_trending_bills(integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_trending_bills(integer) TO service_role;
