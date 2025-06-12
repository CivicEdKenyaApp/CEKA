
-- First, let's update the blog_posts table to support better draft/published management
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Enable RLS on blog_posts if not already enabled
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can create drafts" ON blog_posts;
DROP POLICY IF EXISTS "Users can view their own drafts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can view all posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can update any post" ON blog_posts;

-- Create policies for blog posts
-- Allow everyone to read published posts
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
FOR SELECT USING (status = 'published');

-- Allow authenticated users to create draft posts
CREATE POLICY "Authenticated users can create drafts" ON blog_posts
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND status = 'draft');

-- Allow users to view their own drafts
CREATE POLICY "Users can view their own drafts" ON blog_posts
FOR SELECT USING (auth.uid() IS NOT NULL AND status = 'draft');

-- Allow admin to view all posts
CREATE POLICY "Admin can view all posts" ON blog_posts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'civiceducationkenya@gmail.com'
  )
);

-- Allow admin to update any post
CREATE POLICY "Admin can update any post" ON blog_posts
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'civiceducationkenya@gmail.com'
  )
);

-- Create admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Allow admin to view all notifications
CREATE POLICY "Admin can view notifications" ON admin_notifications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'civiceducationkenya@gmail.com'
  )
);

-- Allow admin to update notifications
CREATE POLICY "Admin can update notifications" ON admin_notifications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'civiceducationkenya@gmail.com'
  )
);

-- Insert all bills information for The Finance Bill, 2025
INSERT INTO bills (
  id,
  title,
  summary,
  description,
  status,
  category,
  sponsor,
  constitutional_section,
  stages,
  comments,
  url
) VALUES (
  '8feb617a-660e-40fa-915c-a4715c630027',
  'Finance Bill, 2025',
  'Proposes amendments to expand the tax net; targeting digital and informal sectors, removing several tax incentives, tightening compliance measures, and giving KRA more administrative authority',
  'The Finance Bill seeks to reform Kenya''s tax system by expanding the tax base to include digital services and informal sector businesses. It addresses challenges in revenue collection, particularly in emerging economic sectors. The bill proposes increased compliance measures, modernization of tax collection systems, and implementation of digital tax frameworks. It also establishes measures to enhance accountability in tax administration and ensure equitable distribution of tax burden across all economic sectors.',
  'First Reading',
  'Finance',
  'Hon. John Mbadi',
  'Article 210 - Taxation',
  '[
    {
      "name": "Introduction",
      "date": "2025-02-15",
      "completed": true,
      "description": "The bill was introduced to Parliament by Hon. John Mbadi."
    },
    {
      "name": "First Reading",
      "date": "2025-03-20",
      "completed": true,
      "description": "The bill was formally introduced in Parliament, its title was read, and copies were distributed to members."
    },
    {
      "name": "Public Feedback",
      "date": "2025-04-25",
      "completed": false,
      "description": "The bill is open for public comments and stakeholder input."
    },
    {
      "name": "Committee Review",
      "date": "2025-05-20",
      "completed": false,
      "description": "Detailed examination of the bill by the Finance and National Planning Committee."
    },
    {
      "name": "Second Reading",
      "date": "Pending",
      "completed": false,
      "description": "Debate on the bill''s general principles and content."
    },
    {
      "name": "Committee Stage",
      "date": "Pending",
      "completed": false,
      "description": "Detailed examination and potential amendments."
    },
    {
      "name": "Third Reading",
      "date": "Pending",
      "completed": false,
      "description": "Final review and vote on the bill."
    },
    {
      "name": "Presidential Assent",
      "date": "Pending",
      "completed": false,
      "description": "The President signs the bill into law or returns it to Parliament."
    }
  ]'::jsonb,
  '[
    {
      "user": "Kenya Association of Manufacturers",
      "date": "2025-03-22",
      "content": "We appreciate the government''s efforts to broaden the tax base, but we urge careful consideration of the impact on manufacturing sector competitiveness."
    },
    {
      "user": "Digital Economy Working Group",
      "date": "2025-03-25",
      "content": "The digital tax provisions are progressive, but implementation timelines should consider the readiness of digital platforms and SMEs."
    },
    {
      "user": "Kenya Private Sector Alliance",
      "date": "2025-03-28",
      "content": "While we support tax reforms, the removal of certain incentives may adversely affect investment climate and job creation."
    }
  ]'::jsonb,
  '/legislative-tracker/8feb617a-660e-40fa-915c-a4715c630027'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  sponsor = EXCLUDED.sponsor,
  constitutional_section = EXCLUDED.constitutional_section,
  stages = EXCLUDED.stages,
  comments = EXCLUDED.comments,
  url = EXCLUDED.url;

-- Function to create admin notification
CREATE OR REPLACE FUNCTION create_admin_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for blog post notifications
DROP TRIGGER IF EXISTS blog_post_notification_trigger ON blog_posts;
CREATE TRIGGER blog_post_notification_trigger
  AFTER INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION create_admin_notification();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND email = 'civiceducationkenya@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
