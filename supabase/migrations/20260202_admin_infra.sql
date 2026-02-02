-- ================================================
-- CRITICAL INFRASTRUCTURE FIX V2
-- ================================================

-- 0. PRE-REQUISITE: ENSURE BILLS TABLE HAS FOLLOW_COUNT
-- ------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bills' AND column_name = 'follow_count'
    ) THEN
        ALTER TABLE public.bills ADD COLUMN follow_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 1. ROBUST IS_ADMIN FUNCTION
-- ------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  v_user_email text;
BEGIN
  -- 1. SERVICE ROLE BYPASS
  IF (auth.role() = 'service_role') THEN
    RETURN true;
  END IF;

  -- 2. ROOT EMAIL BYPASS (Explicit check)
  v_user_email := auth.jwt()->>'email';
  IF (v_user_email = 'civiceducationkenya@gmail.com') THEN
    RETURN true;
  END IF;

  -- 3. ROLE TABLE CHECK (Primary)
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- 4. PROFILE TABLE FALLBACK (Legacy)
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND is_admin = true
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RE-APPLY POLICIES TO ALL CRITICAL TABLES
-- ------------------------------------------

-- admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to sessions" ON public.admin_sessions;
CREATE POLICY "Admins have full access to sessions" ON public.admin_sessions
FOR ALL USING (public.is_admin());

-- admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to notifications" ON public.admin_notifications;
CREATE POLICY "Admins have full access to notifications" ON public.admin_notifications
FOR ALL USING (public.is_admin());

-- admin_audit_log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to audit logs" ON public.admin_audit_log;
CREATE POLICY "Admins have full access to audit logs" ON public.admin_audit_log
FOR ALL USING (public.is_admin());

-- generated_articles
ALTER TABLE public.generated_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON public.generated_articles;
CREATE POLICY "Admin full access" ON public.generated_articles
FOR ALL USING (public.is_admin());

-- system_metrics
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to metrics" ON public.system_metrics;
CREATE POLICY "Admins have full access to metrics" ON public.system_metrics
FOR ALL USING (public.is_admin());

-- 3. FIX GET_TRENDING_BILLS PERMISSIONS
-- ------------------------------------------
GRANT EXECUTE ON FUNCTION public.get_trending_bills(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_bills(INTEGER) TO anon;

-- Add a version that takes no arguments to avoid 400s if called incorrectly
CREATE OR REPLACE FUNCTION public.get_trending_bills()
RETURNS TABLE (
  id UUID,
  title TEXT,
  summary TEXT,
  status TEXT,
  category TEXT,
  date TEXT,
  created_at TIMESTAMPTZ,
  url TEXT,
  sponsor TEXT,
  description TEXT,
  neural_summary TEXT,
  text_content TEXT,
  pdf_url TEXT,
  follow_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id, b.title, b.summary, b.status, b.category, b.date, b.created_at, b.url, b.sponsor, b.description, b.neural_summary, b.text_content, b.pdf_url, b.follow_count::BIGINT 
  FROM public.bills b 
  ORDER BY b.follow_count DESC 
  LIMIT 5;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_trending_bills() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_bills() TO anon;
