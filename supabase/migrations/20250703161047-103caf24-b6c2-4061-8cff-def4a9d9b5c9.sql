
-- Add rich content support to blog posts table
ALTER TABLE blog_posts 
ADD COLUMN content_type TEXT DEFAULT 'html' CHECK (content_type IN ('html', 'markdown')),
ADD COLUMN meta_description TEXT,
ADD COLUMN featured_image_url TEXT,
ADD COLUMN reading_time INTEGER DEFAULT 0,
ADD COLUMN word_count INTEGER DEFAULT 0,
ADD COLUMN seo_keywords TEXT[],
ADD COLUMN revision_number INTEGER DEFAULT 1;

-- Create media assets table for uploaded files
CREATE TABLE public.blog_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  alt_text TEXT,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on blog_media
ALTER TABLE blog_media ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_media
CREATE POLICY "Users can view media for published posts" ON blog_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE blog_posts.id = blog_media.blog_post_id 
      AND blog_posts.status = 'published'
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can upload media for their posts" ON blog_media
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media" ON blog_media
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media" ON blog_media
  FOR DELETE USING (auth.uid() = user_id);

-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on blog_categories
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for blog_categories
CREATE POLICY "Anyone can view categories" ON blog_categories
  FOR SELECT USING (true);

-- Create blog tags table
CREATE TABLE public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on blog_tags
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- Create policy for blog_tags
CREATE POLICY "Anyone can view tags" ON blog_tags
  FOR SELECT USING (true);

-- Create junction table for blog posts and tags
CREATE TABLE public.blog_post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(blog_post_id, tag_id)
);

-- Enable RLS on blog_post_tags
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Create policy for blog_post_tags
CREATE POLICY "Anyone can view post tags" ON blog_post_tags
  FOR SELECT USING (true);

CREATE POLICY "Users can manage tags for their posts" ON blog_post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE blog_posts.id = blog_post_tags.blog_post_id 
      AND blog_posts.user_id = auth.uid()
    )
  );

-- Create storage bucket for blog media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-media',
  'blog-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
);

-- Create storage policies for blog media
CREATE POLICY "Anyone can view blog media" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-media');

CREATE POLICY "Authenticated users can upload blog media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-media' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own blog media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own blog media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to calculate reading time and word count
CREATE OR REPLACE FUNCTION calculate_reading_stats(content_text TEXT)
RETURNS TABLE(word_count INTEGER, reading_time INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  word_cnt INTEGER;
  reading_mins INTEGER;
BEGIN
  -- Strip HTML tags and count words
  word_cnt := array_length(string_to_array(regexp_replace(content_text, '<[^>]*>', '', 'g'), ' '), 1);
  
  -- Calculate reading time (average 200 words per minute)
  reading_mins := GREATEST(1, ROUND(word_cnt::numeric / 200));
  
  RETURN QUERY SELECT word_cnt, reading_mins;
END;
$$;

-- Trigger to auto-update reading stats
CREATE OR REPLACE FUNCTION update_blog_reading_stats()
RETURNS TRIGGER AS $$
DECLARE
  stats RECORD;
BEGIN
  SELECT * INTO stats FROM calculate_reading_stats(NEW.content);
  
  NEW.word_count := stats.word_count;
  NEW.reading_time := stats.reading_time;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_reading_stats_trigger
  BEFORE INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  WHEN (NEW.content IS NOT NULL)
  EXECUTE FUNCTION update_blog_reading_stats();
