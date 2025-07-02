
-- Enhanced Admin Dashboard Tables and Functions

-- Create admin_sessions table with proper indexes
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'),
  is_active BOOLEAN DEFAULT true
);

-- Create system_metrics table for dashboard analytics
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_audit_log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced get_admin_dashboard_stats function
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE(
  total_users BIGINT,
  total_posts BIGINT,
  total_resources BIGINT,
  total_bills BIGINT,
  active_sessions BIGINT,
  recent_signups BIGINT,
  pending_drafts BIGINT,
  total_discussions BIGINT,
  total_views BIGINT,
  avg_daily_users NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM blog_posts WHERE status = 'published') as total_posts,
    (SELECT COUNT(*) FROM resources) as total_resources,
    (SELECT COUNT(*) FROM bills) as total_bills,
    (SELECT COUNT(*) FROM admin_sessions WHERE is_active = true AND expires_at > now()) as active_sessions,
    (SELECT COUNT(*) FROM profiles WHERE created_at > now() - interval '7 days') as recent_signups,
    (SELECT COUNT(*) FROM blog_posts WHERE status = 'draft') as pending_drafts,
    (SELECT COUNT(*) FROM discussions) as total_discussions,
    (SELECT COUNT(*) FROM resource_views) as total_views,
    (SELECT COALESCE(AVG(daily_count), 0) FROM (
      SELECT COUNT(DISTINCT user_id) as daily_count 
      FROM resource_views 
      WHERE viewed_at > now() - interval '30 days'
      GROUP BY DATE(viewed_at)
    ) as daily_stats) as avg_daily_users;
END;
$$;

-- Function to get user activity analytics
CREATE OR REPLACE FUNCTION get_user_activity_stats()
RETURNS TABLE(
  date DATE,
  new_users BIGINT,
  active_users BIGINT,
  blog_posts BIGINT,
  discussions BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - interval '30 days',
      CURRENT_DATE,
      interval '1 day'
    )::date as date
  )
  SELECT 
    ds.date,
    COALESCE(new_users.count, 0) as new_users,
    COALESCE(active_users.count, 0) as active_users,
    COALESCE(blog_posts.count, 0) as blog_posts,
    COALESCE(discussions.count, 0) as discussions
  FROM date_series ds
  LEFT JOIN (
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM profiles
    WHERE created_at > CURRENT_DATE - interval '30 days'
    GROUP BY DATE(created_at)
  ) new_users ON ds.date = new_users.date
  LEFT JOIN (
    SELECT DATE(viewed_at) as date, COUNT(DISTINCT user_id) as count
    FROM resource_views
    WHERE viewed_at > CURRENT_DATE - interval '30 days'
    GROUP BY DATE(viewed_at)
  ) active_users ON ds.date = active_users.date
  LEFT JOIN (
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM blog_posts
    WHERE created_at > CURRENT_DATE - interval '30 days'
    GROUP BY DATE(created_at)
  ) blog_posts ON ds.date = blog_posts.date
  LEFT JOIN (
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM discussions
    WHERE created_at > CURRENT_DATE - interval '30 days'
    GROUP BY DATE(created_at)
  ) discussions ON ds.date = discussions.date
  ORDER BY ds.date;
END;
$$;

-- Function to get content moderation queue
CREATE OR REPLACE FUNCTION get_moderation_queue()
RETURNS TABLE(
  id UUID,
  type TEXT,
  title TEXT,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  content_preview TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    'blog_post' as type,
    bp.title,
    bp.author,
    bp.created_at,
    bp.status,
    LEFT(bp.content, 200) as content_preview
  FROM blog_posts bp
  WHERE bp.status = 'draft'
  
  UNION ALL
  
  SELECT 
    uc.id,
    'user_contribution' as type,
    uc.title,
    p.full_name as author,
    uc.created_at,
    uc.status,
    LEFT(uc.content, 200) as content_preview
  FROM user_contributions uc
  LEFT JOIN profiles p ON uc.user_id = p.id
  WHERE uc.status = 'pending'
  
  ORDER BY created_at DESC;
END;
$$;

-- Function to update system metrics
CREATE OR REPLACE FUNCTION update_system_metrics()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  stats RECORD;
BEGIN
  -- Get current stats
  SELECT * INTO stats FROM get_admin_dashboard_stats();
  
  -- Insert/Update daily metrics
  INSERT INTO system_metrics (metric_name, metric_value) VALUES
    ('total_users', stats.total_users),
    ('total_posts', stats.total_posts),
    ('total_resources', stats.total_resources),
    ('total_bills', stats.total_bills),
    ('active_sessions', stats.active_sessions),
    ('pending_drafts', stats.pending_drafts),
    ('total_discussions', stats.total_discussions),
    ('total_views', stats.total_views),
    ('avg_daily_users', stats.avg_daily_users);
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_action ON admin_audit_log(user_id, action, created_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_date_name ON system_metrics(metric_date, metric_name);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_created ON blog_posts(status, created_at);
CREATE INDEX IF NOT EXISTS idx_resource_views_date ON resource_views(DATE(viewed_at));

-- Enhanced RLS policies
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin session policies
CREATE POLICY "Admin can manage sessions" ON admin_sessions
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- System metrics policies  
CREATE POLICY "Admin can manage metrics" ON system_metrics
  FOR ALL USING (is_admin(auth.uid()));

-- Audit log policies
CREATE POLICY "Admin can view audit log" ON admin_audit_log
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert audit log" ON admin_audit_log
  FOR INSERT WITH CHECK (true);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO admin_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
END;
$$;

-- Sample data for bills table (if empty)
INSERT INTO bills (title, summary, status, category, sponsor, date, stages, description) 
SELECT * FROM (VALUES
  ('Finance Bill, 2025', 'Proposes amendments to expand the tax net; targeting digital and informal sectors, removing several tax incentives, tightening compliance measures, and giving KRA more administrative authority', 'First Reading', 'Finance', 'National Treasury', now(), 
   '[{"name": "First Reading", "date": "2025-01-15", "status": "completed"}, {"name": "Public Participation", "date": "2025-02-01", "status": "current"}]'::jsonb,
   'This bill seeks to amend various tax laws to increase government revenue through expanded taxation of digital services and informal sector activities.'),
  
  ('Digital Rights and Freedoms Bill, 2023', 'Establishes a framework for protecting citizens digital rights, privacy, and freedoms in the online space.', 'Committee Stage', 'Technology', 'MP Jane Doe', now() - interval '6 months',
   '[{"name": "First Reading", "date": "2023-08-22", "status": "completed"}, {"name": "Second Reading", "date": "2023-09-15", "status": "completed"}, {"name": "Committee Stage", "date": "2023-10-01", "status": "current"}]'::jsonb,
   'Comprehensive legislation to protect digital rights including data privacy, freedom of expression online, and cybersecurity measures.'),
   
  ('Healthcare Access Improvement Act, 2023', 'Aims to improve healthcare accessibility and affordability for all Kenyans through system reforms.', 'Second Reading', 'Health', 'MP John Smith', now() - interval '4 months',
   '[{"name": "First Reading", "date": "2023-07-30", "status": "completed"}, {"name": "Second Reading", "date": "2023-11-01", "status": "current"}]'::jsonb,
   'Legislation focused on reforming healthcare delivery systems to ensure universal access to quality healthcare services.')
) AS v(title, summary, status, category, sponsor, date, stages, description)
WHERE NOT EXISTS (SELECT 1 FROM bills LIMIT 1);

-- Trigger to create admin notifications for new blog drafts
CREATE OR REPLACE FUNCTION create_admin_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.status = 'draft' AND (OLD IS NULL OR OLD.status != 'draft') THEN
    INSERT INTO admin_notifications (type, title, message, related_id)
    VALUES (
      'blog_draft',
      'New Blog Post Draft',
      'A new blog post draft "' || NEW.title || '" has been submitted for review.',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS blog_post_draft_notification ON blog_posts;
CREATE TRIGGER blog_post_draft_notification
  AFTER INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION create_admin_notification();
