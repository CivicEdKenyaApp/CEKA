
-- Add missing columns to profiles table for community join functionality
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS county text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS areas_of_interest jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_via text DEFAULT 'direct_signup';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- Create indexes for better resource filtering performance
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources (lower(category));
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources (lower(type));
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources (created_at);

-- Add status column to volunteer_opportunities if not exists
ALTER TABLE volunteer_opportunities ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';
ALTER TABLE volunteer_opportunities ADD COLUMN IF NOT EXISTS skills_required jsonb;
ALTER TABLE volunteer_opportunities ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE volunteer_opportunities ADD COLUMN IF NOT EXISTS apply_url text;
ALTER TABLE volunteer_opportunities ADD COLUMN IF NOT EXISTS is_remote boolean DEFAULT false;
ALTER TABLE volunteer_opportunities ADD COLUMN IF NOT EXISTS tags jsonb;
ALTER TABLE volunteer_opportunities ADD COLUMN IF NOT EXISTS created_by_user_id uuid;

-- Create RLS policies for volunteer opportunities submission
CREATE POLICY "Anyone can submit volunteer opportunities" ON volunteer_opportunities
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update their own volunteer opportunities" ON volunteer_opportunities
FOR UPDATE USING (auth.uid() = created_by_user_id);

-- Function to create non-auth community profiles
CREATE OR REPLACE FUNCTION create_community_profile(
  p_full_name text,
  p_email text DEFAULT NULL,
  p_county text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_interests jsonb DEFAULT NULL,
  p_areas_of_interest jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  v_profile_id := gen_random_uuid();
  
  INSERT INTO profiles (
    id,
    full_name,
    email,
    county,
    bio,
    interests,
    areas_of_interest,
    created_via
  ) VALUES (
    v_profile_id,
    p_full_name,
    p_email,
    p_county,
    p_bio,
    p_interests,
    p_areas_of_interest,
    'join-community'
  );
  
  RETURN v_profile_id;
END;
$$;

-- Function to link community profile to authenticated user
CREATE OR REPLACE FUNCTION link_community_profile(
  p_profile_id uuid,
  p_auth_user_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET auth_user_id = p_auth_user_id,
      id = p_auth_user_id,
      updated_at = now()
  WHERE id = p_profile_id;
END;
$$;
