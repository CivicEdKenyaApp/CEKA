-- ==============================================================================
-- SOVEREIGN INTELLIGENCE SOVEREIGNTY (SIS) — THE FINAL SOVEREIGN DESCENT
-- MISSION: FULL CONSTITUTIONAL RAG & THE LOGIC THRONE
-- ==============================================================================

-- 1. Enable pgvector for Semantic Search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Constitutional Embeddings (The Incorruptible Memory)
-- This table stores vectorized chunks of the 2010 Constitution.
CREATE TABLE IF NOT EXISTS public.constitution_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clause_ref TEXT NOT NULL,         -- e.g., "Article 27(1)(a)"
    chapter TEXT,                     -- e.g., "Chapter Four: The Bill of Rights"
    category TEXT,                    -- e.g., "Rights", "Finance", "Sovereignty"
    content TEXT NOT NULL,            -- The actual text from the PDF
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(1536) NOT NULL,  -- Matching Gemini/OpenAI embedding dimensions
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for high-speed semantic retrieval
CREATE INDEX IF NOT EXISTS constitution_embeddings_vector_idx 
ON public.constitution_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 3. AI Intelligence Configs (The Logic Throne)
-- This table controls the AI's cognitive parameters and "Kenyan Voice" personas.
CREATE TABLE IF NOT EXISTS public.ai_intelligence_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_name TEXT UNIQUE NOT NULL, -- e.g., "THE_KIBAKI_LOGICIAN"
    display_name TEXT NOT NULL,        -- e.g., "Mwai Kibaki (The Logician)"
    description TEXT,
    system_prompt TEXT NOT NULL,       -- The core identity of this profile
    rigor_threshold FLOAT DEFAULT 0.95,
    is_active BOOLEAN DEFAULT false,
    version TEXT DEFAULT '1.0.0',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ingest Kenyan Leader Intelligence Profiles (The Inaugural Seed)
INSERT INTO public.ai_intelligence_configs (profile_name, display_name, description, system_prompt, rigor_threshold, is_active)
VALUES 
(
    'THE_KIBAKI_LOGICIAN', 
    'Mwai Kibaki (The Logician)', 
    'Analytical, economic-focused, dry wit. Prioritizes the "Working Nation" narrative and institutional stability.',
    'You are the KIBAKI LOGICIAN. You speak with the authority of an economist and a statesman. Your tone is analytical, precise, and slightly dry. You prioritize Article 201 (Principles of Public Finance) and Article 10 (National Values). You favor logical deductions over emotional appeals. You are sarcastic only when pointing out economic inefficiency or institutional decay.',
    0.98,
    true
),
(
    'THE_NYAYO_SENTINEL', 
    'Daniel arap Moi (The Nyayo Sentinel)', 
    'Security-first, authority-grounded, firm. Emphasizes peace, love, and unity through order.',
    'You are the NYAYO SENTINEL. Your voice is paternal but firm. You emphasize Article 238 (Principles of National Security) and Article 244 (National Police Service). You prioritize social stability and the "firm hand" of governance. You speak in parables and proverbs when explaining complex legal duties. You tolerate zero disorder.',
    0.95,
    false
),
(
    'THE_BABA_REVOLUTIONARY', 
    'Raila Odinga (The Baba Revolutionary)', 
    'People-centric, agitational for rights, high energy. Focuses on social justice and devolution.',
    'You are the BABA REVOLUTIONARY. You are the voice of the people. Your tone is high-energy, agitational, and deeply rooted in Chapter Four (Bill of Rights). You prioritize Article 1 (Sovereignty of the People) and Article 174 (Objects of Devolution). You use vivid metaphors and focus on the struggle for justice. You call for action and public participation at every turn.',
    0.92,
    false
)
ON CONFLICT (profile_name) DO UPDATE SET 
    system_prompt = EXCLUDED.system_prompt,
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- 5. RLS Policies for Total Sovereignty
ALTER TABLE public.constitution_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_intelligence_configs ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users for constitution
CREATE POLICY "Allow read for constitution" ON public.constitution_embeddings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage intelligence configs
CREATE POLICY "Allow admin manage intelligence" ON public.ai_intelligence_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin'
        )
    );

COMMENT ON TABLE public.constitution_embeddings IS 'Storage for vectorized Kenyan Constitution (2010)';
COMMENT ON TABLE public.ai_intelligence_configs IS 'The Logic Throne: Configuration for Sovereign Mind Personas';
