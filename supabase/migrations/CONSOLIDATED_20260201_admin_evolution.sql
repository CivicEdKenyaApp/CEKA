-- ==========================================
-- CEKA PHASE 2 CONSOLIDATED MIGRATION
-- Admin Evolution, Constitution, and Badges
-- ==========================================

-- 1. ADMIN EVOLUTION (RBAC & SYSTEM)
-- ------------------------------------------

-- Update user_roles to support moderator
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
    END IF;
END $$;

-- Table for global feature flags and system configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Initial settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('chat_enabled', 'true', 'Global toggle for the community chat system'),
    ('ai_moderation_enabled', 'true', 'Toggle for AI-assisted content flagging'),
    ('maintenance_mode', 'false', 'Enable to restrict site access to admins only'),
    ('media_auto_approval', 'false', 'If false, all uploads go to quarantine first')
ON CONFLICT (key) DO NOTHING;

-- 2. CAMPAIGNS & AD SPACES
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.platform_campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    image_url text,
    target_url text,
    section_target text NOT NULL, -- e.g. 'blog_sidebar', 'home_hero', 'volunteer_list'
    is_active boolean DEFAULT true,
    start_date timestamp with time zone DEFAULT now(),
    end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- 3. INTERACTIVE CONSTITUTION
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.constitution_chapters (
    id SERIAL PRIMARY KEY,
    chapter_number INTEGER NOT NULL,
    title_en TEXT NOT NULL,
    title_sw TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.constitution_sections (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES constitution_chapters(id) ON DELETE CASCADE,
    article_number INTEGER NOT NULL,
    title_en TEXT NOT NULL,
    title_sw TEXT,
    content_en TEXT NOT NULL,
    content_sw TEXT,
    annotations JSONB, -- For AI-generated explanations or legal notes
    media_status text DEFAULT 'approved' CHECK (media_status IN ('quarantined', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add safety status to existing content tables
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS media_status text DEFAULT 'approved' CHECK (media_status IN ('quarantined', 'approved', 'rejected'));
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS media_status text DEFAULT 'quarantined' CHECK (media_status IN ('quarantined', 'approved', 'rejected'));

-- Enable real-time for constitution for dynamic updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.constitution_sections;

-- 4. CIVIC BADGES & GAMIFICATION
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.civic_badges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    icon_url text,
    criteria_type text NOT NULL, -- 'quiz', 'contribution', 'attendance'
    criteria_value integer, -- e.g. score >= 80
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id uuid REFERENCES civic_badges(id) ON DELETE CASCADE,
    awarded_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

-- Initial Badges
INSERT INTO public.civic_badges (name, description, criteria_type, criteria_value)
VALUES 
    ('Constitutional Scholar', 'Completed the Bill of Rights quiz with a perfect score', 'quiz', 100),
    ('Community Pillar', 'Contributed 5 verified resources to the platform', 'contribution', 5),
    ('Active Citizen', 'Participated in 3 live town hall sessions', 'attendance', 3)
ON CONFLICT DO NOTHING;

-- 5. POINTS & GAMIFICATION SYSTEM
-- ------------------------------------------

-- Table to track cumulative user points/XP
CREATE TABLE IF NOT EXISTS public.user_points (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points integer DEFAULT 0,
    current_level integer DEFAULT 1,
    last_earned_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Audit log for every point earned
CREATE TABLE IF NOT EXISTS public.points_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    amount integer NOT NULL,
    action_type text NOT NULL, -- 'quiz_pass', 'daily_read', 'contribution', 'bonus'
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- View for leaderboard
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    p.user_id,
    pr.full_name,
    pr.avatar_url,
    p.total_points,
    p.current_level,
    RANK() OVER (ORDER BY p.total_points DESC) as rank
FROM public.user_points p
JOIN public.profiles pr ON p.user_id = pr.id
ORDER BY p.total_points DESC;

-- Function to add points safely
CREATE OR REPLACE FUNCTION public.add_user_points(
    p_user_id uuid,
    p_amount integer,
    p_action text,
    p_description text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS integer AS $$
DECLARE
    v_total integer;
BEGIN
    -- Update or Insert into user_points
    INSERT INTO public.user_points (user_id, total_points, last_earned_at, updated_at)
    VALUES (p_user_id, p_amount, now(), now())
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = user_points.total_points + p_amount,
        last_earned_at = now(),
        updated_at = now()
    RETURNING total_points INTO v_total;

    -- Log the history
    INSERT INTO public.points_history (user_id, amount, action_type, description, metadata)
    VALUES (p_user_id, p_amount, p_action, p_description, p_metadata);

    RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. PERMISSIONS & RPCs
-- ------------------------------------------

-- Function to check if user has moderator or admin role
CREATE OR REPLACE FUNCTION public.check_user_is_moderator()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS for System Settings (Admin only)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage settings" ON public.system_settings
    FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Public can view settings" ON public.system_settings
    FOR SELECT USING (true);

-- RLS for Badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins/System award badges" ON public.user_badges
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 7. SEED DATA: CONSTITUTION (CHAPTER 1)
-- ------------------------------------------

-- Chapter 1
INSERT INTO public.constitution_chapters (chapter_number, title_en, title_sw)
VALUES (1, 'Sovereignty of the People and Supremacy of this Constitution', 'Ukuu wa Wananchi na Ukubwa wa Katiba hii')
ON CONFLICT DO NOTHING;

-- Preamble (as Article 0 in a virtual Chapter 0 or just part of Chapter 1 base)
INSERT INTO public.constitution_sections (chapter_id, article_number, title_en, title_sw, content_en, content_sw, media_status)
SELECT id, 0, 'Preamble', 'Utangulizi', 
'We, the people of Kenya— ACKNOWLEDGING the supremacy of the Almighty God... ADOPT, ENACT and give this Constitution to ourselves and to our future generations.', 
'Sisi, watu wa Kenya— TUKITAMBUA ukuu wa Mungu Mwenyezi... TUNAKUBALI, TUNAHIDHINISHA na kuipa Katiba hii kwetu wenyewe na kwa vizazi vyetu vya baadaye.',
'approved'
FROM public.constitution_chapters WHERE chapter_number = 1
ON CONFLICT DO NOTHING;

-- Articles 1-3
INSERT INTO public.constitution_sections (chapter_id, article_number, title_en, title_sw, content_en, content_sw, media_status)
SELECT id, 1, 'Sovereignty of the people', 'Ukuu wa wananchi', 
'(1) All sovereign power belongs to the people of Kenya and shall be exercised only in accordance with this Constitution...', 
'(1) Mamlaka yote ya juu kabisa ni ya watu wa Kenya na yatatekelezwa tu kwa mujibu wa Katiba hii...',
'approved'
FROM public.constitution_chapters WHERE chapter_number = 1;

INSERT INTO public.constitution_sections (chapter_id, article_number, title_en, title_sw, content_en, content_sw, media_status)
SELECT id, 2, 'Supremacy of this Constitution', 'Ukuu wa Katiba hii', 
'(1) This Constitution is the supreme law of the Republic and binds all persons and all State organs...', 
'(1) Katiba hii ndiyo sheria kuu ya Jamhuri na inafunga watu wote na vyombo vyote vya Dola...',
'approved'
FROM public.constitution_chapters WHERE chapter_number = 1;
