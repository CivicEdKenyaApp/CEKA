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
DROP POLICY IF EXISTS "Users can update own sessions" ON public.admin_sessions;
CREATE POLICY "Users can update own sessions" ON public.admin_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

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
-- SECTION 6: PLATFORM CAMPAIGNS TABLE + RLS (SAFE CHECK)
-- =========================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_campaigns' AND table_schema = 'public') THEN
        ALTER TABLE public.platform_campaigns ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admins can manage platform_campaigns" ON public.platform_campaigns;
        CREATE POLICY "Admins can manage platform_campaigns" ON public.platform_campaigns FOR ALL USING (public.is_admin());
        
        DROP POLICY IF EXISTS "Public can read active campaigns" ON public.platform_campaigns;
        CREATE POLICY "Public can read active campaigns" ON public.platform_campaigns FOR SELECT USING (is_active = true);
    END IF;
END $$;

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
DROP POLICY IF EXISTS "Users can insert chat" ON public.chat_interactions;
CREATE POLICY "Users can insert chat" ON public.chat_interactions FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can read page_views" ON public.page_views;
CREATE POLICY "Admins can read page_views" ON public.page_views FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Anyone can insert page_views" ON public.page_views;
CREATE POLICY "Anyone can insert page_views" ON public.page_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read user_activity_log" ON public.user_activity_log;
CREATE POLICY "Admins can read user_activity_log" ON public.user_activity_log FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Users can insert own activity" ON public.user_activity_log;
CREATE POLICY "Users can insert own activity" ON public.user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- SECTION 9: PROCESSING JOBS TABLE (FOR INTEL PIPELINE)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.processing_jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id uuid,
    job_type text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress integer DEFAULT 0,
    total_items integer,
    processed_items integer,
    error_message text,
    started_at timestamptz,
    completed_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    logs text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ensure columns exist if table was already there
ALTER TABLE public.processing_jobs ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.processing_jobs ADD COLUMN IF NOT EXISTS job_type text NOT NULL DEFAULT 'crawl';

ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage processing_jobs" ON public.processing_jobs;
CREATE POLICY "Admins can manage processing_jobs" ON public.processing_jobs FOR ALL USING (public.is_admin());

-- =========================================================================
-- SECTION 10: SCRAPER SOURCES TABLE (FOR INTEL PIPELINE)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.scraper_sources (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    url text NOT NULL,
    is_active boolean DEFAULT true,
    last_scraped_at timestamptz,
    scrape_frequency text DEFAULT 'daily',
    selector_config jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ensure columns exist if table was already there (Fixes ERROR: 42703)
ALTER TABLE public.scraper_sources ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.scraper_sources ADD COLUMN IF NOT EXISTS scrape_frequency text DEFAULT 'daily';
ALTER TABLE public.scraper_sources ADD COLUMN IF NOT EXISTS selector_config jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.scraper_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage scraper_sources" ON public.scraper_sources;
CREATE POLICY "Admins can manage scraper_sources" ON public.scraper_sources FOR ALL USING (public.is_admin());

-- Insert default sources
INSERT INTO public.scraper_sources (name, url, is_active) VALUES
    ('Kenya Gazette', 'http://kenyalaw.org/kenya_gazette/', true),
    ('National Assembly Bills', 'http://www.parliament.go.ke/the-national-assembly/house-business/bills', true),
    ('The Senate Bills', 'http://www.parliament.go.ke/the-senate/house-business/bills', true)
ON CONFLICT DO NOTHING;

-- =========================================================================
-- SECTION 11: RESOURCE METADATA TABLE (For Backblaze Sync)
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
    category text DEFAULT 'general',
    tags text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ensure columns exist if table was already there
ALTER TABLE public.resource_files ADD COLUMN IF NOT EXISTS storage_provider text DEFAULT 'backblaze';
ALTER TABLE public.resource_files ADD COLUMN IF NOT EXISTS extracted_text text;
ALTER TABLE public.resource_files ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.resource_files ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';

ALTER TABLE public.resource_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage resource_files" ON public.resource_files;
CREATE POLICY "Admins can manage resource_files" ON public.resource_files FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Public can read resource_files" ON public.resource_files;
CREATE POLICY "Public can read resource_files" ON public.resource_files FOR SELECT USING (true);

-- =========================================================================
-- SECTION 12: STORAGE BUCKETS
-- =========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resources', 'resources', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- SECTION 13: STORAGE POLICIES
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
-- SECTION 14: REALTIME PUBLICATIONS (SAFE)
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
ALTER TABLE public.processing_jobs REPLICA IDENTITY FULL;

-- =========================================================================
-- SECTION 15: ANALYTICS HELPER FUNCTIONS
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    v_total_users bigint;
    v_total_posts bigint;
    v_total_resources bigint;
    v_total_bills bigint;
    v_active_sessions bigint;
    v_recent_signups bigint;
    v_pending_drafts bigint;
    v_total_discussions bigint;
    v_total_page_views bigint;
    v_total_chat bigint;
BEGIN
    -- Get counts with error handling
    SELECT COUNT(*) INTO v_total_users FROM public.profiles;
    
    SELECT COUNT(*) INTO v_total_posts FROM public.blog_posts WHERE status = 'published';
    
    SELECT COUNT(*) INTO v_total_resources FROM public.resources;
    
    -- Check if bills table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bills' AND table_schema = 'public') THEN
        SELECT COUNT(*) INTO v_total_bills FROM public.bills;
    ELSE
        v_total_bills := 0;
    END IF;
    
    SELECT COUNT(*) INTO v_active_sessions FROM public.admin_sessions WHERE is_active = true;
    
    SELECT COUNT(*) INTO v_recent_signups FROM public.profiles WHERE created_at > now() - interval '7 days';
    
    SELECT COUNT(*) INTO v_pending_drafts FROM public.blog_posts WHERE status = 'draft';
    
    -- Check if forum_posts exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts' AND table_schema = 'public') THEN
        SELECT COUNT(*) INTO v_total_discussions FROM public.forum_posts;
    ELSE
        v_total_discussions := 0;
    END IF;
    
    SELECT COUNT(*) INTO v_total_page_views FROM public.page_views;
    
    SELECT COUNT(*) INTO v_total_chat FROM public.chat_interactions;
    
    result := jsonb_build_object(
        'total_users', COALESCE(v_total_users, 0),
        'total_posts', COALESCE(v_total_posts, 0),
        'total_resources', COALESCE(v_total_resources, 0),
        'total_bills', COALESCE(v_total_bills, 0),
        'active_sessions', COALESCE(v_active_sessions, 0),
        'recent_signups', COALESCE(v_recent_signups, 0),
        'pending_drafts', COALESCE(v_pending_drafts, 0),
        'total_discussions', COALESCE(v_total_discussions, 0),
        'total_page_views', COALESCE(v_total_page_views, 0),
        'total_chat_interactions', COALESCE(v_total_chat, 0)
    );
    
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

-- Helper function for admin check
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN public.is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activity_timeline(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_is_admin() TO authenticated;

-- =========================================================================
-- SECTION 16: USER ROLES TABLE (IF NOT EXISTS)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'user',
    granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage user_roles" ON public.user_roles FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- =========================================================================
-- COMPLETE! All tables, policies, and functions are now in place.
-- =========================================================================
