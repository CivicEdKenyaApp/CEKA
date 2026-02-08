-- ==========================================================================
-- CEKA ADMIN DASHBOARD ULTIMATE FIX - COMPLETE SQL PATCH
-- Run this ENTIRE script in Supabase SQL Editor
-- Date: 2026-02-08
-- ==========================================================================

-- =========================================================================
-- SECTION 1: CORE SECURITY FUNCTION
-- =========================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- =========================================================================
-- SECTION 2: ADMIN SESSIONS TABLE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    session_token text UNIQUE,
    created_at timestamptz DEFAULT now(),
    last_active timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '24 hours'),
    is_active boolean DEFAULT true
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access sessions" ON public.admin_sessions;
CREATE POLICY "Admins full access sessions" ON public.admin_sessions FOR ALL USING (public.is_admin());

-- =========================================================================
-- SECTION 3: ADMIN NOTIFICATIONS TABLE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL DEFAULT 'system',
    title text NOT NULL,
    message text NOT NULL,
    related_id text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access notifications" ON public.admin_notifications;
CREATE POLICY "Admins full access notifications" ON public.admin_notifications FOR ALL USING (public.is_admin());

-- =========================================================================
-- SECTION 4: CIVIC EVENTS TABLE + RLS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.civic_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    event_date date NOT NULL,
    start_time time,
    end_time time,
    category text DEFAULT 'general',
    icon_name text,
    external_link text,
    is_newsletter boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.civic_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage civic_events" ON public.civic_events;
CREATE POLICY "Admins can manage civic_events" ON public.civic_events FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Public can read civic_events" ON public.civic_events;
CREATE POLICY "Public can read civic_events" ON public.civic_events FOR SELECT USING (true);

-- =========================================================================
-- SECTION 5: VOLUNTEER OPPORTUNITIES TABLE + RLS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.volunteer_opportunities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    organization text,
    location text,
    commitment text,
    date text,
    type text DEFAULT 'Volunteer',
    status text DEFAULT 'open',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage volunteer_opportunities" ON public.volunteer_opportunities;
CREATE POLICY "Admins can manage volunteer_opportunities" ON public.volunteer_opportunities FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Public can read volunteer_opportunities" ON public.volunteer_opportunities;
CREATE POLICY "Public can read volunteer_opportunities" ON public.volunteer_opportunities FOR SELECT USING (true);

-- =========================================================================
-- SECTION 6: PLATFORM CAMPAIGNS TABLE + RLS
-- =========================================================================

ALTER TABLE public.platform_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage platform_campaigns" ON public.platform_campaigns;
CREATE POLICY "Admins can manage platform_campaigns" ON public.platform_campaigns FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Public can read active campaigns" ON public.platform_campaigns;
CREATE POLICY "Public can read active campaigns" ON public.platform_campaigns FOR SELECT USING (is_active = true);

-- =========================================================================
-- SECTION 7: PROFILE TABLE ADDITIONS
-- =========================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT '{"profile_visible": true, "show_activity": true}'::jsonb;

-- =========================================================================
-- SECTION 8: ANALYTICS TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.chat_interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    query text NOT NULL,
    response text,
    sentiment text DEFAULT 'neutral',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.page_views (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    page_path text NOT NULL,
    referrer text,
    user_agent text,
    session_id text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type text NOT NULL,
    activity_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- RLS for analytics tables
ALTER TABLE public.chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read chat_interactions" ON public.chat_interactions;
CREATE POLICY "Admins can read chat_interactions" ON public.chat_interactions FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read page_views" ON public.page_views;
CREATE POLICY "Admins can read page_views" ON public.page_views FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read user_activity_log" ON public.user_activity_log;
CREATE POLICY "Admins can read user_activity_log" ON public.user_activity_log FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert own activity" ON public.user_activity_log;
CREATE POLICY "Users can insert own activity" ON public.user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- SECTION 9: RESOURCE METADATA TABLE (For Backblaze Sync)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.resource_files (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    file_name text NOT NULL,
    file_size bigint,
    mime_type text,
    storage_provider text DEFAULT 'backblaze',
    storage_path text NOT NULL,
    storage_url text NOT NULL,
    thumbnail_url text,
    extracted_text text,
    metadata jsonb DEFAULT '{}'::jsonb,
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.resource_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage resource_files" ON public.resource_files;
CREATE POLICY "Admins can manage resource_files" ON public.resource_files FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Public can read resource_files" ON public.resource_files;
CREATE POLICY "Public can read resource_files" ON public.resource_files FOR SELECT USING (true);

-- =========================================================================
-- SECTION 10: STORAGE BUCKETS
-- =========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resources', 'resources', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- SECTION 11: STORAGE POLICIES
-- =========================================================================

-- Avatars: Users can upload their own, public read
DROP POLICY IF EXISTS "Avatar upload policy" ON storage.objects;
CREATE POLICY "Avatar upload policy" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Avatar update policy" ON storage.objects;
CREATE POLICY "Avatar update policy" ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
CREATE POLICY "Avatar public read" ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar delete policy" ON storage.objects;
CREATE POLICY "Avatar delete policy" ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Resources: Admins only upload, public read
DROP POLICY IF EXISTS "Resources admin upload" ON storage.objects;
CREATE POLICY "Resources admin upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'resources' AND public.is_admin());

DROP POLICY IF EXISTS "Resources admin update" ON storage.objects;
CREATE POLICY "Resources admin update" ON storage.objects FOR UPDATE 
USING (bucket_id = 'resources' AND public.is_admin());

DROP POLICY IF EXISTS "Resources public read" ON storage.objects;
CREATE POLICY "Resources public read" ON storage.objects FOR SELECT 
USING (bucket_id = 'resources');

DROP POLICY IF EXISTS "Resources admin delete" ON storage.objects;
CREATE POLICY "Resources admin delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'resources' AND public.is_admin());

-- =========================================================================
-- SECTION 12: REALTIME PUBLICATIONS (SAFE)
-- =========================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'admin_sessions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_sessions;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'admin_notifications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'processing_jobs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.processing_jobs;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'civic_events') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.civic_events;
    END IF;
END $$;

-- Set replica identity for realtime
ALTER TABLE public.admin_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.admin_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.civic_events REPLICA IDENTITY FULL;

-- =========================================================================
-- SECTION 13: ANALYTICS HELPER FUNCTIONS
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM public.profiles),
        'total_posts', (SELECT COUNT(*) FROM public.blog_posts),
        'total_resources', (SELECT COUNT(*) FROM public.resources),
        'total_bills', (SELECT COUNT(*) FROM public.bills),
        'active_sessions', (SELECT COUNT(*) FROM public.admin_sessions WHERE is_active = true),
        'recent_signups', (SELECT COUNT(*) FROM public.profiles WHERE created_at > now() - interval '7 days'),
        'pending_drafts', (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'draft'),
        'total_discussions', (SELECT COUNT(*) FROM public.forum_posts),
        'total_page_views', (SELECT COUNT(*) FROM public.page_views),
        'total_chat_interactions', (SELECT COUNT(*) FROM public.chat_interactions)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_activity_timeline(days_back integer DEFAULT 30)
RETURNS TABLE(
    activity_date date,
    new_users bigint,
    blog_posts bigint,
    page_views bigint,
    chat_interactions bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - (days_back || ' days')::interval,
            CURRENT_DATE,
            '1 day'::interval
        )::date AS d
    )
    SELECT 
        ds.d AS activity_date,
        COALESCE((SELECT COUNT(*) FROM public.profiles WHERE created_at::date = ds.d), 0) AS new_users,
        COALESCE((SELECT COUNT(*) FROM public.blog_posts WHERE created_at::date = ds.d), 0) AS blog_posts,
        COALESCE((SELECT COUNT(*) FROM public.page_views WHERE created_at::date = ds.d), 0) AS page_views,
        COALESCE((SELECT COUNT(*) FROM public.chat_interactions WHERE created_at::date = ds.d), 0) AS chat_interactions
    FROM date_series ds
    ORDER BY ds.d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activity_timeline(integer) TO authenticated;

-- =========================================================================
-- COMPLETE! All tables, policies, and functions are now in place.
-- =========================================================================
