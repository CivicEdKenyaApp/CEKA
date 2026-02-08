-- ==========================================================
-- ADMIN DASHBOARD ULTIMATE STABILITY FIX
-- Date: 2026-02-08
-- Focus: Fix permission denied for auth.users & missing columns
-- ==========================================================

-- 1. FIX BLOG POSTS MISSING COLUMNS
-- ---------------------------------------------------
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0; -- Adding both to be safe against different service versions

-- 2. FIX ADMIN INTELLIGENCE VIEW (CRITICAL)
-- ---------------------------------------------------
-- The previous view used auth.users which is restricted to superusers/service_role
-- We shift to public.profiles which is accessible to authenticated users

DROP VIEW IF EXISTS public.admin_intelligence_summary CASCADE;
CREATE VIEW public.admin_intelligence_summary AS
SELECT
    (SELECT count(*) FROM public.profiles) as total_users,
    (SELECT count(*) FROM public.bills) as total_bills,
    (SELECT count(*) FROM public.user_notifications WHERE is_read = false) as pending_alerts,
    (SELECT count(*) FROM public.profiles WHERE (COALESCE(preferences->>'high_contrast', 'false'))::boolean = true) as accessibility_adopters,
    (SELECT count(*) FROM public.chat_messages WHERE created_at > now() - interval '24 hours') as chat_activity_24h;

GRANT SELECT ON public.admin_intelligence_summary TO authenticated;
GRANT SELECT ON public.admin_intelligence_summary TO anon;

-- 3. FIX ADMIN SESSIONS PERMISSIONS
-- ---------------------------------------------------
-- Ensure the is_admin function is solid and properly used in RLS
-- The current is_admin is SECURITY DEFINER which is good.

-- Grant select on admin_sessions to authenticated (RLS will filter it)
GRANT SELECT ON public.admin_sessions TO authenticated;

-- Ensure RLS is active
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- 4. RE-GENERATE HELPER FUNCTIONS (OPTIONAL BUT STABILIZING)
-- ---------------------------------------------------
DROP FUNCTION IF EXISTS public.get_dashboard_stats();

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT count(*) FROM public.profiles),
        'total_posts', (SELECT count(*) FROM public.blog_posts WHERE status = 'published'),
        'total_resources', (SELECT count(*) FROM public.resources),
        'total_bills', (SELECT count(*) FROM public.bills),
        'active_sessions', (SELECT count(*) FROM public.admin_sessions WHERE is_active = true),
        'recent_signups', (SELECT count(*) FROM public.profiles WHERE created_at > now() - interval '7 days'),
        'pending_drafts', (SELECT count(*) FROM public.blog_posts WHERE status = 'draft'),
        'total_discussions', (SELECT count(*) FROM public.discussions),
        'total_page_views', (SELECT COALESCE(sum(views_count), 0) FROM public.bills) + (SELECT COALESCE(sum(views), 0) FROM public.blog_posts),
        'total_chat_interactions', (SELECT count(*) FROM public.chat_interactions)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
