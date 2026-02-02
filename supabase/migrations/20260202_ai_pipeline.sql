-- ================================================
-- PHASE 10: AI CONTENT AUTOMATION PIPELINE (GOHAM)
-- ================================================

-- 1. AI MODELS REGISTRY
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL,
    api_endpoint TEXT,
    rate_limit_rpm INTEGER DEFAULT 5,
    rate_limit_tpm INTEGER DEFAULT 250000,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial AI models
INSERT INTO public.ai_models (name, provider, api_endpoint, rate_limit_rpm, rate_limit_tpm, is_active, config) VALUES
('gemini-1.5-flash', 'Google', NULL, 15, 1000000, true, '{"max_output_tokens": 2048, "temperature": 0.7}'),
('gemini-1.5-pro', 'Google', NULL, 2, 32000, true, '{"max_output_tokens": 1024, "temperature": 0.6}'),
('deepseek-chat', 'DeepSeek', 'https://api.deepseek.com/chat/completions', 20, 300000, false, '{"max_tokens": 2000, "temperature": 0.7}')
ON CONFLICT (name) DO UPDATE SET is_active = EXCLUDED.is_active;

-- 2. CONTENT TOPICS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    keywords TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CONTENT TEMPLATES LIBRARY (Rotational)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    template_type VARCHAR(50) CHECK (template_type IN ('opening', 'body', 'conclusion', 'full')),
    content TEXT NOT NULL,
    rotation_weight INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TONE PROFILES
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.tone_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    instruction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. GENERATED ARTICLES (Pre-Review)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES public.content_topics(id),
    model_id UUID REFERENCES public.ai_models(id),
    title VARCHAR(300) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    tone_id UUID REFERENCES public.tone_profiles(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'published', 'rejected')),
    meta_description VARCHAR(300),
    seo_keywords TEXT[] DEFAULT '{}',
    review_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CONTENT QUEUE (Rate limiting & Lifecycle)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES public.content_topics(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RLS POLICIES
-- ------------------------------------------
ALTER TABLE public.generated_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON public.generated_articles 
    FOR ALL USING (auth.role() = 'service_role' OR auth.jwt()->>'email' LIKE '%@ceka.or.ke');

CREATE POLICY "Public can view published articles" ON public.generated_articles 
    FOR SELECT USING (status = 'published');

-- 8. INITIAL DATA SEEDING (GOHAM)
-- ------------------------------------------
INSERT INTO public.tone_profiles (name, description, instruction) VALUES
('Investigative', 'Hard-hitting, factual, focuses on exposing details', 'Write in an investigative journalism style. Be factual, direct, and slightly critical. Use data where possible.'),
('Educational', 'Informative, clear, friendly', 'Write as a friendly teacher. Explain complex terms simply. Be encouraging.'),
('Visionary', 'Inspiring, future-focused, patriotic', 'Write with passion about the future of Kenya. Focus on unity, progress, and civic duty.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.content_topics (name, description, keywords) VALUES
('Public Accountability', 'Tracking how public funds are used at national and county levels', '{"audit", "funds", "counties", "transparency"}'),
('Voting Rights', 'Educating citizens on their right to vote and electoral processes', '{"IEBC", "elections", "registration", "rights"}'),
('Constitution 2010', 'Deep dives into specific chapters of the Constitution', '{"rights", "chapters", "law", "supreme"}')
ON CONFLICT (name) DO NOTHING;
