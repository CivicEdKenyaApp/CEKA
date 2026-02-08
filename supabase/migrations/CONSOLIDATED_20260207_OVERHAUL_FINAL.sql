-- ==========================================================
-- CEKA PLATFORM OVERHAUL - CONSOLIDATED MASTER MIGRATION
-- Date: 2026-02-07
-- Version: 3.4 (HAM Mode: Bug-Smashing & Stability)
-- ==========================================================

-- 0. SCHEMA ENFORCEMENT & PRE-REQUISITES
-- ---------------------------------------------------

-- Fix Profiles: Ensure preferences column exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- Fix Bills: Tactical & AI Columns
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS text_content text;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS neural_summary text;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS analysis_status text DEFAULT 'pending';
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS pdf_url text;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS vault_id text;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS vault_metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS follow_count integer DEFAULT 0;

-- 0.1 IS_ADMIN SECURITY DEFINER (Critical Core)
-- ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- 1. SERVICE ROLE BYPASS
  IF (auth.role() = 'service_role') THEN
    RETURN true;
  END IF;

  -- 2. ROOT EMAIL BYPASS
  IF (auth.jwt()->>'email' = 'civiceducationkenya@gmail.com') THEN
    RETURN true;
  END IF;

  -- 3. ROLE TABLE CHECK
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- 4. PROFILE TABLE FALLBACK
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND (is_admin = true OR preferences->>'role' = 'admin')
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- 1. INFRASTRUCTURE TABLES (IF NOT EXISTS)
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    room_id text DEFAULT 'general',
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'system',
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scraper_sources (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    url text NOT NULL,
    selector_config jsonb DEFAULT '{}'::jsonb,
    last_scraped_at timestamp with time zone,
    status text DEFAULT 'active',
    frequency_hours integer DEFAULT 24,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Fix Scraper Sources Unique Constraint: Deduplicate and Enforce (Required for ON CONFLICT)
DO $$
BEGIN
    -- 1. Remove duplicates if they exist to prevent constraint failure
    DELETE FROM public.scraper_sources 
    WHERE id IN (
        SELECT id FROM (
            SELECT id, row_number() OVER (PARTITION BY name ORDER BY created_at DESC) as rn
            FROM public.scraper_sources
        ) t WHERE t.rn > 1
    );

    -- 2. Ensure unique constraint exists on 'name'
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scraper_sources_name_key') THEN
        ALTER TABLE public.scraper_sources ADD CONSTRAINT scraper_sources_name_key UNIQUE (name);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.processing_jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_name text NOT NULL,
    input_urls text[] DEFAULT '{}'::text[],
    input_files text[] DEFAULT '{}'::text[],
    status text DEFAULT 'pending',
    progress integer DEFAULT 0,
    current_step text,
    result_data jsonb DEFAULT '{}'::jsonb,
    error_message text,
    processing_logs jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    related_id text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    session_token text NOT NULL,
    last_active timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.system_metrics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    metric_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(metric_name, metric_date)
);

CREATE TABLE IF NOT EXISTS public.chat_interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    interaction_type text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. SEARCH & ANALYTICS VIEWS
-- ------------------------------------------

-- Bills Search Index
ALTER TABLE public.bills DROP COLUMN IF EXISTS fts;
ALTER TABLE public.bills ADD COLUMN fts tsvector 
GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(text_content, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_bills_fts ON public.bills USING gin(fts);

-- Tactical Command Summary (Primary Admin Intelligence)
DROP VIEW IF EXISTS public.admin_intelligence_summary CASCADE;
CREATE VIEW public.admin_intelligence_summary AS
SELECT
    (SELECT count(*) FROM auth.users) as total_users,
    (SELECT count(*) FROM public.bills) as total_bills,
    (SELECT count(*) FROM public.user_notifications WHERE is_read = false) as pending_alerts,
    (SELECT count(*) FROM public.profiles WHERE (COALESCE(preferences->>'high_contrast', 'false'))::boolean = true) as accessibility_adopters,
    (SELECT count(*) FROM public.chat_messages WHERE created_at > now() - interval '24 hours') as chat_activity_24h;

-- Trending Bills Intelligence: Explicit Column List for Stability
DROP VIEW IF EXISTS public.trending_bills CASCADE;
CREATE VIEW public.trending_bills AS
SELECT 
    id, title, summary, status, category, date, created_at, url, sponsor, description,
    neural_summary, text_content, pdf_url, vault_id, vault_metadata,
    follow_count, views_count,
    ((COALESCE(follow_count, 0) * 5) + COALESCE(views_count, 0)) as trending_score
FROM public.bills
ORDER BY trending_score DESC;

-- 3. SECURITY & POLICIES
-- ------------------------------------------

ALTER TABLE public.scraper_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

    -- Scrapers
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage scraper sources' AND tablename = 'scraper_sources') THEN
        CREATE POLICY "Admins can manage scraper sources" ON public.scraper_sources FOR ALL
        USING (public.is_admin());
    END IF;

    -- Jobs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view processing jobs' AND tablename = 'processing_jobs') THEN
        CREATE POLICY "Admins can view processing jobs" ON public.processing_jobs FOR ALL
        USING (public.is_admin());
    END IF;

    -- Jobs

    -- Admin Sessions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access sessions' AND tablename = 'admin_sessions') THEN
        CREATE POLICY "Admins full access sessions" ON public.admin_sessions FOR ALL
        USING (public.is_admin());
    END IF;

    -- Admin Notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access notifications' AND tablename = 'admin_notifications') THEN
        CREATE POLICY "Admins full access notifications" ON public.admin_notifications FOR ALL
        USING (public.is_admin());
    END IF;

    -- Audit Logs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access audit logs' AND tablename = 'admin_audit_log') THEN
        CREATE POLICY "Admins full access audit logs" ON public.admin_audit_log FOR ALL
        USING (public.is_admin());
    END IF;

    -- System Metrics
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access metrics' AND tablename = 'system_metrics') THEN
        CREATE POLICY "Admins full access metrics" ON public.system_metrics FOR ALL
        USING (public.is_admin());
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. SEED DATA (UPSERT)
-- ------------------------------------------

INSERT INTO public.scraper_sources (name, url, selector_config)
VALUES 
    ('National Assembly Bills', 'http://www.parliament.go.ke/the-national-assembly/house-business/bills', '{"row_selector": ".views-row", "title_selector": ".bill-title"}'),
    ('The Senate Bills', 'http://www.parliament.go.ke/the-senate/house-business/bills', '{"row_selector": ".views-row", "title_selector": ".bill-title"}'),
    ('Kenya Gazette', 'http://kenyalaw.org/kenya_gazette/', '{"row_selector": ".gazette-row", "title_selector": ".gazette-title"}')
ON CONFLICT (name) DO UPDATE SET url = EXCLUDED.url, selector_config = EXCLUDED.selector_config;

-- 5. REALTIME ENABLEMENT (Explicit Form)
-- ------------------------------------------

DO $$
BEGIN
    -- Bills
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bills') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
    END IF;
    
    -- Processing Jobs
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'processing_jobs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.processing_jobs;
    END IF;
    
    -- Scraper Sources
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'scraper_sources') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.scraper_sources;
    END IF;

    -- Pipeline Config
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'pipeline_config') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_config;
    END IF;

    -- Realtime for Jobs Monitoring
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'admin_notifications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
    END IF;

    -- Admin Sessions Realtime
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'admin_sessions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_sessions;
    END IF;

    -- Replica Identity for Realtime
    ALTER TABLE public.processing_jobs REPLICA IDENTITY FULL;
    ALTER TABLE public.scraper_sources REPLICA IDENTITY FULL;
    ALTER TABLE public.pipeline_config REPLICA IDENTITY FULL;
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'Skipped Realtime addition.';
END $$;

-- 6. TACTICAL PIPELINE CONFIGURATION
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.pipeline_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    filename text UNIQUE NOT NULL,
    content text NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.pipeline_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage pipeline config' AND tablename = 'pipeline_config') THEN
        CREATE POLICY "Admins can manage pipeline config" ON public.pipeline_config FOR ALL
        USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
