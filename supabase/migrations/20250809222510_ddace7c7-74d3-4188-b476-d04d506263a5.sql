
-- Ensure bill_follows table has proper structure for following functionality
ALTER TABLE bill_follows ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Add index for better performance on follow counts
CREATE INDEX IF NOT EXISTS idx_bill_follows_bill_id ON bill_follows(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_follows_user_profile ON bill_follows(user_id, bill_id);

-- Add community profiles support for non-auth users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT 'auth';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add unique constraint to prevent duplicate follows
ALTER TABLE bill_follows ADD CONSTRAINT IF NOT EXISTS unique_user_bill_follow UNIQUE(user_id, bill_id);

-- Create RLS policies for community profiles
CREATE POLICY IF NOT EXISTS "Anonymous profiles can be created" ON profiles
  FOR INSERT WITH CHECK (is_anonymous = true OR auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can view community profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can link their anonymous profile" ON profiles
  FOR UPDATE USING (is_anonymous = true OR auth.uid() = id);
