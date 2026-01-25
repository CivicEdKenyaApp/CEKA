-- =====================================================
-- CEKA v2.0 MASTER UPGRADE - EXTREME EDITION
-- =====================================================

-- 1. BASE CHAT & SOCIAL INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id text NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES public.chat_messages(id) ON DELETE CASCADE, -- For Threading
  mentions jsonb DEFAULT '[]'::jsonb, -- Array of user_ids or resource_ids
  attachments jsonb DEFAULT '[]'::jsonb, -- urls, types
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS public.chat_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_id uuid NOT NULL, -- flexible ID for resource, bill, or message
  target_type text NOT NULL, -- 'message', 'resource', 'bill', 'blog'
  action_type text NOT NULL, -- 'like', 'share', 'view', 'download'
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 2. COMMUNITY MOVEMENTS (Campaigns)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  organizer text,
  image_url text,
  goal_count integer DEFAULT 0,
  current_count integer DEFAULT 0,
  status text DEFAULT 'active', -- 'active', 'completed', 'archived'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campaign_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

-- 3. DISCUSSIONS BRIDGE
CREATE TABLE IF NOT EXISTS public.discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  source_message_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id),
  category text,
  tags text[] DEFAULT '{}'::text[],
  likes_count integer DEFAULT 0,
  messages_count integer DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 4. ADMIN & SECURITY LAYER
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL, -- 'delete_message', 'ban_user', 'update_bill', etc.
  resource_type text,
  resource_id text,
  details jsonb,
  severity text DEFAULT 'info', -- 'info', 'warning', 'critical'
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_id text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. IDENTITY & APP REGISTRY (for OAuth)
CREATE TABLE IF NOT EXISTS public.third_party_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id text UNIQUE NOT NULL,
  client_secret text NOT NULL,
  redirect_uris text[] DEFAULT '{}'::text[],
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- SECURITY & AUTOMATION
-- =====================================================

-- Helper logic for is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to promote ROOT email to admin automaticaly
CREATE OR REPLACE FUNCTION public.handle_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'civiceducationkenya@gmail.com' THEN
    NEW.is_admin = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_admin_check ON public.profiles;
CREATE TRIGGER on_profile_created_admin_check
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_admin_promotion();

-- RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies
CREATE POLICY "Public can view chat" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can chat" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can react" ON public.chat_reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can see everything" ON public.admin_audit_log FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins manage sessions" ON public.admin_sessions FOR ALL USING (is_admin(auth.uid()));

-- =====================================================
-- REALTIME REGISTRATION
-- =====================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
