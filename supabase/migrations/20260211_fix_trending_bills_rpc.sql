-- FIX get_trending_bills RPC
-- Explicitly cast date to text to avoid type mismatch errors (400 Bad Request)

-- Drop existing functions to ensure clean recreation (Postgres supports overloading, so we drop both versions)
DROP FUNCTION IF EXISTS public.get_trending_bills();
DROP FUNCTION IF EXISTS public.get_trending_bills(integer);

-- 1. Version with no arguments
CREATE OR REPLACE FUNCTION public.get_trending_bills() 
RETURNS TABLE(
    id uuid, 
    title text, 
    summary text, 
    status text, 
    category text, 
    date text, 
    created_at timestamp with time zone, 
    url text, 
    sponsor text, 
    description text, 
    neural_summary text, 
    text_content text, 
    pdf_url text, 
    follow_count bigint
)
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id, 
    b.title, 
    b.summary, 
    b.status, 
    b.category, 
    b.date::text, -- Explicit cast to text
    b.created_at, 
    b.url, 
    b.sponsor, 
    b.description, 
    b.neural_summary, 
    b.text_content, 
    b.pdf_url, 
    b.follow_count::BIGINT
  FROM public.bills b 
  ORDER BY b.follow_count DESC 
  LIMIT 5;
END;
$$;

-- 2. Version with limit_count argument (used by frontend)
CREATE OR REPLACE FUNCTION public.get_trending_bills(limit_count integer DEFAULT 5) 
RETURNS TABLE(
    id uuid, 
    title text, 
    summary text, 
    status text, 
    category text, 
    date text, 
    created_at timestamp with time zone, 
    url text, 
    sponsor text, 
    description text, 
    neural_summary text, 
    text_content text, 
    pdf_url text, 
    follow_count bigint
)
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.title,
    b.summary,
    b.status,
    b.category,
    b.date::text, -- Explicit cast to text
    b.created_at,
    b.url,
    b.sponsor,
    b.description,
    b.neural_summary,
    b.text_content,
    b.pdf_url,
    COALESCE((
      SELECT COUNT(*)::BIGINT
      FROM public.bill_follows bf
      WHERE bf.bill_id = b.id
    ), 0) + COALESCE(b.follow_count, 0)::BIGINT AS follow_count
  FROM public.bills b
  ORDER BY
    (COALESCE((
      SELECT COUNT(*)
      FROM public.bill_follows bf
      WHERE bf.bill_id = b.id
    ), 0) + COALESCE(b.follow_count, 0)) DESC,
    b.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Restore permissions
GRANT ALL ON FUNCTION public.get_trending_bills() TO anon;
GRANT ALL ON FUNCTION public.get_trending_bills() TO authenticated;
GRANT ALL ON FUNCTION public.get_trending_bills() TO service_role;

GRANT ALL ON FUNCTION public.get_trending_bills(limit_count integer) TO anon;
GRANT ALL ON FUNCTION public.get_trending_bills(limit_count integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_trending_bills(limit_count integer) TO service_role;
