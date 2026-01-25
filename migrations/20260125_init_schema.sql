-- Initial Migration for CEKA Upgrade
-- Generated from provided backup.sql and Table Schema - Screenshot.txt

-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE,
  full_name text,
  avatar_url text,
  email text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  county text,
  bio text,
  interests jsonb,
  areas_of_interest jsonb,
  is_admin boolean DEFAULT false
);

-- RESOURCE CATEGORIES
CREATE TABLE IF NOT EXISTS public.resource_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RESOURCES
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  category text NOT NULL,
  is_downloadable boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES public.profiles(id)
);

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  author text,
  tags text[] DEFAULT '{}'::text[],
  status text DEFAULT 'draft'::text,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid REFERENCES public.profiles(id)
);

-- CIVIC EVENTS
CREATE TABLE IF NOT EXISTS public.civic_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  category text,
  color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- CHAPTERS (As requested in tasks, even if not in original dump)
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  county text,
  lead_name text,
  contact_email text,
  social_links jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ALUMNI
CREATE TABLE IF NOT EXISTS public.alumni (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name text NOT NULL,
  batch_year text,
  bio text,
  avatar_url text,
  current_role text,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS POLICIES (Scaffolded suggestions as comments)
-- ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public can view resources" ON public.resources FOR SELECT USING (true);
-- CREATE POLICY "Authenticated users can create resources" ON public.resources FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TRIGGERS for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to relevant tables
DO $$
BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.civic_events FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
EXCEPTION
  WHEN others THEN NULL;
END $$;
