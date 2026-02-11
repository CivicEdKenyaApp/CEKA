-- ==============================================================================
-- CEKA SIS: CONSTITUTIONAL MATCHING ENGINE (RAG)
-- MISSION: ENABLING SEMANTIC SEARCH ON THE 2010 CONSTITUTION
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.match_constitution (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  clause_ref text,
  chapter text,
  content text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.clause_ref,
    ce.chapter,
    ce.content,
    ce.category,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM public.constitution_embeddings ce
  WHERE 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION public.match_constitution IS 'Semantic search function for retrieving Constitutional clauses based on embedding similarity.';
