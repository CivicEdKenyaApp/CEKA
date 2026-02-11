-- MILITARY GRADE HARDENING: CEKA SOVEREIGN MIND SCHEMA
-- Adding metrics and verification logs for research and accuracy guarantees.

BEGIN;

-- Add analysis_score if it doesn't exist (handle case where it was partially implemented)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='generated_articles' AND column_name='analysis_score') THEN
        ALTER TABLE public.generated_articles ADD COLUMN analysis_score FLOAT DEFAULT 0.0;
    END IF;
END $$;

-- Add verification_metrics for "military grade" tracking
ALTER TABLE public.generated_articles 
ADD COLUMN IF NOT EXISTS verification_metrics JSONB DEFAULT '{
    "factual_integrity": 0.0,
    "constitutional_intersections": [],
    "sources_consulted": [],
    "reasoning_loops": 0
}'::jsonb;

-- Ensure author can be tracked if not already standard (author is already in types, but let's ensure it)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='generated_articles' AND column_name='author') THEN
        ALTER TABLE public.generated_articles ADD COLUMN author VARCHAR(100) DEFAULT 'CEKA';
    END IF;
END $$;

COMMIT;
