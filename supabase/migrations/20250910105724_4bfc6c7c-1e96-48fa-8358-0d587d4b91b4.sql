-- Create the community_members table for Join Community form submissions
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL CHECK (char_length(first_name) >= 1 AND char_length(first_name) <= 100),
  last_name TEXT NOT NULL CHECK (char_length(last_name) >= 1 AND char_length(last_name) <= 100),
  email TEXT NOT NULL CHECK (char_length(email) >= 5 AND char_length(email) <= 255),
  county TEXT CHECK (char_length(county) <= 100),
  interests TEXT CHECK (char_length(interests) <= 2000),
  areas_of_interest TEXT[] DEFAULT '{}',
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  source_ip TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'email_failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_members_email ON public.community_members(email);
CREATE INDEX IF NOT EXISTS idx_community_members_created_at ON public.community_members(created_at);
CREATE INDEX IF NOT EXISTS idx_community_members_status ON public.community_members(status);

-- Enable RLS
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Allow authenticated users to insert community applications" 
ON public.community_members 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view their own applications" 
ON public.community_members 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Admin can manage all community member applications
CREATE POLICY "Admins can manage community applications" 
ON public.community_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'civiceducationkenya@gmail.com'
  )
);

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_community_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_community_members_updated_at
  BEFORE UPDATE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_members_updated_at();