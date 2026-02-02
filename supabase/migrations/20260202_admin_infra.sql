-- ================================================
-- ADMIN INFRASTRUCTURE & RLS FIX
-- ================================================

-- 1. IDENTIFY & FIX ADMIN ACCESS HELPER
-- ------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Root Bypass for legacy support and high-privilege access
  IF (auth.jwt()->>'email' = 'civiceducationkenya@gmail.com') THEN
    RETURN true;
  END IF;

  -- Role check
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ENSURE ROOT ADMIN HAS ROLE
-- ------------------------------------------
-- Find user id for the root email if they exist
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'civiceducationkenya@gmail.com' LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;

-- 3. APPLY RLS POLICIES TO ADMIN TABLES
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

-- generated_articles (Phase 10 fix)
ALTER TABLE public.generated_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON public.generated_articles;
CREATE POLICY "Admin full access" ON public.generated_articles
FOR ALL USING (public.is_admin());

-- system_metrics
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to metrics" ON public.system_metrics;
CREATE POLICY "Admins have full access to metrics" ON public.system_metrics
FOR ALL USING (public.is_admin());

-- 4. ENSURE REALTIME IS ACTIVE FOR ADMIN TABLES
-- ------------------------------------------
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
EXCEPTION WHEN OTHERS THEN END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_sessions;
EXCEPTION WHEN OTHERS THEN END $$;
