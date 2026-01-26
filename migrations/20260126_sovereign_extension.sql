-- =====================================================
-- CEKA v2.0 SOVEREIGN EXTENSION - VOLUNTEER & ADMIN HARDENING
-- =====================================================

-- 1. DROP CACHE & CONFLICTS
-- If the table is wrong, we rename it to preserve data but get a clean slate
DO $$
DECLARE 
    date_time_type text;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'volunteer_opportunities') THEN
    -- Check the type of date_time
    SELECT data_type INTO date_time_type 
    FROM information_schema.columns 
    WHERE table_name = 'volunteer_opportunities' AND column_name = 'date_time';

    -- If date_time doesn't exist OR it's not a text-based type, rename for fresh start
    IF date_time_type IS NULL OR (date_time_type NOT IN ('text', 'character varying', 'character')) THEN
      EXECUTE 'ALTER TABLE public.volunteer_opportunities RENAME TO volunteer_opportunities_legacy_' || to_char(now(), 'YYYYMMDD_HH24MISS');
    END IF;
  END IF;
END $$;

-- 2. VOLUNTEER CORE (CLEAN SLATE)
CREATE TABLE IF NOT EXISTS public.volunteer_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organization text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  category text NOT NULL CHECK (category IN ('Local', 'Grassroots', 'Online')),
  date_time text NOT NULL,
  commitment_type text NOT NULL, -- 'One-time', 'Short-term', 'Ongoing'
  skills_required text[] DEFAULT '{}'::text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. VOLUNTEER APPLICATIONS
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(opportunity_id, user_id)
);

-- 4. SEED TACTICAL OPPORTUNITIES (2027 ENGINE)
INSERT INTO public.volunteer_opportunities (title, organization, location, category, date_time, commitment_type, description)
VALUES 
  ('Civic Education Workshop Facilitator', 'Democracy Kenya Foundation', 'Nairobi', 'Local', 'May 15, 2025 | 9:00 AM - 4:00 PM', 'One-time', 'Lead grassroots sessions on constitutional awareness and civic rights.'),
  ('Youth Voter Registration Drive', 'Kenya Electoral Commission', 'Multiple Locations', 'Grassroots', 'May 20-21, 2025 | Various shifts', 'Short-term', 'Assist in mobilizing young citizens for IEBC registration ahead of 2027.'),
  ('Online Content Developer', 'Civic Rights Kenya', 'Remote', 'Online', 'Flexible | 5-10 hours/week', 'Ongoing', 'Create digital assets for civic education campaigns.'),
  ('Community Meeting Coordinator', 'Local Governance Network', 'Mombasa', 'Local', 'June 5, 2025 | 2:00 PM - 6:00 PM', 'One-time', 'Organize and moderate local town hall meetings for policy discussion.'),
  ('Policy Research Assistant', 'Governance Institute', 'Remote', 'Online', 'Ongoing | 10-15 hours/week', 'Ongoing', 'Analyze legislative trends and provide reports for constitutional watchdog.'),
  ('Rural Rights Awareness Campaign', 'Rural Development Trust', 'Western Kenya', 'Grassroots', 'June 10-15, 2025 | Full day', 'Short-term', 'On-ground mobilization for land rights and local governance education.')
ON CONFLICT DO NOTHING;

-- 5. ADMIN ACCESS DEFINITIVE FIX
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_admin') THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'civiceducationkenya@gmail.com';

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

-- 6. SECURITY & RLS
ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view opportunities" ON public.volunteer_opportunities;
    CREATE POLICY "Public can view opportunities" ON public.volunteer_opportunities FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Admins manage opportunities" ON public.volunteer_opportunities;
    CREATE POLICY "Admins manage opportunities" ON public.volunteer_opportunities FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
    
    DROP POLICY IF EXISTS "Users can apply for opportunities" ON public.volunteer_applications;
    CREATE POLICY "Users can apply for opportunities" ON public.volunteer_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can view own applications" ON public.volunteer_applications;
    CREATE POLICY "Users can view own applications" ON public.volunteer_applications FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Admins manage applications" ON public.volunteer_applications;
    CREATE POLICY "Admins manage applications" ON public.volunteer_applications FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
END $$;

-- 7. REALTIME REGISTRATION
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_opportunities, public.volunteer_applications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN OTHERS THEN NULL;
END $$;
