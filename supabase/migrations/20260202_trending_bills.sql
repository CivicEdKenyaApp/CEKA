-- Create get_trending_bills RPC function
-- This function returns bills ordered by follow_count and recency

CREATE OR REPLACE FUNCTION public.get_trending_bills(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  title TEXT,
  summary TEXT,
  status TEXT,
  category TEXT,
  date TEXT,
  created_at TIMESTAMPTZ,
  url TEXT,
  sponsor TEXT,
  description TEXT,
  neural_summary TEXT,
  text_content TEXT,
  pdf_url TEXT,
  follow_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.summary,
    b.status,
    b.category,
    b.date,
    b.created_at,
    b.url,
    b.sponsor,
    b.description,
    b.neural_summary,
    b.text_content,
    b.pdf_url,
    COALESCE((
      SELECT COUNT(*)::BIGINT 
      FROM bill_follows bf 
      WHERE bf.bill_id = b.id
    ), 0) AS follow_count
  FROM bills b
  ORDER BY 
    COALESCE((
      SELECT COUNT(*) 
      FROM bill_follows bf 
      WHERE bf.bill_id = b.id
    ), 0) DESC,
    b.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_trending_bills(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_bills(INTEGER) TO anon;

-- Create bill_follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bill_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bill_id)
);

-- Enable RLS
ALTER TABLE public.bill_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own follows" ON public.bill_follows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can follow bills" ON public.bill_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow bills" ON public.bill_follows
  FOR DELETE USING (auth.uid() = user_id);

-- Add follow_count to bills if not exists (for caching)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bills' AND column_name = 'follow_count'
  ) THEN
    ALTER TABLE bills ADD COLUMN follow_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function to update follow count cache
CREATE OR REPLACE FUNCTION public.update_bill_follow_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE bills SET follow_count = follow_count + 1 WHERE id = NEW.bill_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE bills SET follow_count = GREATEST(follow_count - 1, 0) WHERE id = OLD.bill_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for follow count
DROP TRIGGER IF EXISTS update_follow_count ON public.bill_follows;
CREATE TRIGGER update_follow_count
  AFTER INSERT OR DELETE ON public.bill_follows
  FOR EACH ROW EXECUTE FUNCTION public.update_bill_follow_count();
