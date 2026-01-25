-- =====================================================
-- CEKA v2.0 ULTIMATE MASTER MIGRATION - 'FULL HAM'
-- =====================================================

-- 0. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- AI/RAG Readiness

-- 1. CORE IDENTITY
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  email text UNIQUE,
  county text,
  bio text,
  interests jsonb DEFAULT '[]'::jsonb,
  areas_of_interest jsonb DEFAULT '[]'::jsonb,
  created_via text DEFAULT 'direct_signup',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. ADVANCED CHAT SYSTEM (Formalized Discourse)
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  room_type text DEFAULT 'public' CHECK (room_type IN ('public', 'private', 'secure_vault')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Ensure default room exists
INSERT INTO public.chat_rooms (id, name, room_type)
VALUES ('general', 'General Assembly', 'public')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  room_id text NOT NULL DEFAULT 'general',
  content text NOT NULL,
  parent_id uuid REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  attachments jsonb DEFAULT '[]',
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT chat_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE
);

-- Ensure naming follows search pattern
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages (room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages (created_at DESC);

CREATE TABLE IF NOT EXISTS public.chat_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- 3. INTERACTION & ENGAGEMENT ANALYTICS
CREATE TABLE IF NOT EXISTS public.chat_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Null allowed for public views
  target_id uuid NOT NULL,
  target_type text NOT NULL, -- 'message', 'bill', 'resource', 'blog', 'chapter'
  action_type text NOT NULL, -- 'view', 'share', 'download', 'dwell', 'screenshot'
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 4. TACTICAL COMMAND & AUDIT
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  last_active timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. CIVIC OBJECTS & DISCOVERY
CREATE TABLE IF NOT EXISTS public.resource_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL,
  url text NOT NULL,
  category text NOT NULL,
  is_downloadable boolean DEFAULT true,
  uploaded_by_id uuid REFERENCES public.profiles(id),
  thumbnail_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  description text,
  status text NOT NULL, -- 'draft', 'first_reading', 'second_reading', 'assented', 'rejected'
  category text NOT NULL,
  sponsor text,
  constitutional_section text,
  stages jsonb DEFAULT '[]',
  url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bill_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bill_id uuid NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, bill_id)
);

-- 6. AI & RAG READINESS
CREATE TABLE IF NOT EXISTS public.document_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(1536), -- Designed for OpenAI ada-002/v3 dimensions
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Cosine Similarity function for RAG
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  resource_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.resource_id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- 7. MISCELLANEOUS (Chapters, Alumni, Events, Volunteers)
CREATE TABLE IF NOT EXISTS public.volunteer_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organization text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  type text NOT NULL, -- 'Local', 'Online', 'Grassroots'
  commitment text NOT NULL,
  skills text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  submission_metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT false, -- Neutral until user interacts
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  county text,
  lead_id uuid REFERENCES public.profiles(id),
  contact_email text,
  social_links jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alumni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  batch_year text,
  bio text,
  avatar_url text,
  role_title text, -- FIXED: Renamed from current_role to avoid keyword collision
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 8. SECURITY & RLS ENFORCEMENT
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Helper Function for Admin Check
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND is_admin = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies
CREATE POLICY "Public profiles are viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view chat" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post chat" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log FOR SELECT USING (public.is_admin(auth.uid()));

-- 9. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at to all relevant tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'chat_messages', 'resources', 'bills', 'chapters')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at()', t);
    END LOOP;
END;
$$;

-- 10. REALTIME
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages, public.chat_reactions, public.profiles, public.admin_notifications;

-- 11. AUTO ADMISSION OF ROOT ADMIN
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
