-- Enable all necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom types (Idempotent)
DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('draft', 'submitted', 'approved', 'published', 'rejected', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE queue_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'rate_limited');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE review_action AS ENUM ('approved', 'rejected', 'requested_changes');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE template_type AS ENUM ('opening', 'body', 'conclusion', 'full');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE model_provider AS ENUM ('Google', 'DeepSeek', 'OpenAI', 'Anthropic', 'Custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Content Topics Table - UPSERT / ALTER
CREATE TABLE IF NOT EXISTS content_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

-- Add columns if missing
DO $$ BEGIN
    ALTER TABLE content_topics ADD COLUMN keywords TEXT[] DEFAULT '{}';
    ALTER TABLE content_topics ADD COLUMN is_active BOOLEAN DEFAULT true;
    ALTER TABLE content_topics ADD COLUMN priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 10);
    ALTER TABLE content_topics ADD COLUMN gemini_prompt_template TEXT; -- Initially nullable to allow adding
    ALTER TABLE content_topics ADD COLUMN daily_article_limit INTEGER DEFAULT 2 CHECK (daily_article_limit BETWEEN 1 AND 10);
    ALTER TABLE content_topics ADD COLUMN target_word_count INTEGER DEFAULT 1000 CHECK (target_word_count BETWEEN 500 AND 5000);
    ALTER TABLE content_topics ADD COLUMN local_context_required BOOLEAN DEFAULT true;
    ALTER TABLE content_topics ADD COLUMN min_kenyan_references INTEGER DEFAULT 3 CHECK (min_kenyan_references BETWEEN 0 AND 20);
    ALTER TABLE content_topics ADD COLUMN allowed_tone_profiles UUID[] DEFAULT '{}';
    ALTER TABLE content_topics ADD COLUMN excluded_tone_profiles UUID[] DEFAULT '{}';
    ALTER TABLE content_topics ADD COLUMN rotation_schedule JSONB DEFAULT '{"days": [1,2,3,4,5], "times": ["09:00", "15:00", "21:00"]}';
    ALTER TABLE content_topics ADD COLUMN metadata JSONB DEFAULT '{"created_by": "system", "version": 1}';
    ALTER TABLE content_topics ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE content_topics ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE content_topics ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE content_topics ADD COLUMN usage_count INTEGER DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Enforce NOT NULL on key columns after adding
DO $$ BEGIN
    UPDATE content_topics SET gemini_prompt_template = 'Default prompt template' WHERE gemini_prompt_template IS NULL;
    ALTER TABLE content_topics ALTER COLUMN gemini_prompt_template SET NOT NULL;
EXCEPTION
    WHEN others THEN null;
END $$;


-- AI Models Registry - UPSERT / ALTER
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    provider model_provider NOT NULL,
    api_endpoint TEXT NOT NULL
);

DO $$ BEGIN
    ALTER TABLE ai_models ADD COLUMN api_key_required BOOLEAN DEFAULT true;
    ALTER TABLE ai_models ADD COLUMN api_key_storage_path TEXT;
    ALTER TABLE ai_models ADD COLUMN rate_limit_rpm INTEGER DEFAULT 5 CHECK (rate_limit_rpm BETWEEN 1 AND 1000);
    ALTER TABLE ai_models ADD COLUMN rate_limit_tpm INTEGER DEFAULT 250000 CHECK (rate_limit_tpm BETWEEN 1000 AND 1000000);
    ALTER TABLE ai_models ADD COLUMN rate_limit_rpd INTEGER DEFAULT 1000 CHECK (rate_limit_rpd BETWEEN 10 AND 10000);
    ALTER TABLE ai_models ADD COLUMN cost_per_token DECIMAL(10,8) DEFAULT 0.00000050;
    ALTER TABLE ai_models ADD COLUMN max_output_tokens INTEGER DEFAULT 2048 CHECK (max_output_tokens BETWEEN 100 AND 100000);
    ALTER TABLE ai_models ADD COLUMN default_temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (default_temperature BETWEEN 0.0 AND 2.0);
    ALTER TABLE ai_models ADD COLUMN is_active BOOLEAN DEFAULT true;
    ALTER TABLE ai_models ADD COLUMN is_default BOOLEAN DEFAULT false;
    ALTER TABLE ai_models ADD COLUMN config JSONB DEFAULT '{
        "safety_settings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
        ],
        "generation_config": {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 2048
        }
    }';
    ALTER TABLE ai_models ADD COLUMN features JSONB DEFAULT '{"supports_streaming": false, "supports_function_calling": false, "supports_vision": false}';
    ALTER TABLE ai_models ADD COLUMN health_status VARCHAR(20) DEFAULT 'unknown' CHECK (health_status IN ('unknown', 'healthy', 'degraded', 'unavailable'));
    ALTER TABLE ai_models ADD COLUMN last_health_check TIMESTAMP WITH TIME ZONE;
    ALTER TABLE ai_models ADD COLUMN error_count INTEGER DEFAULT 0;
    ALTER TABLE ai_models ADD COLUMN total_requests INTEGER DEFAULT 0;
    ALTER TABLE ai_models ADD COLUMN total_tokens_used INTEGER DEFAULT 0;
    ALTER TABLE ai_models ADD COLUMN total_cost DECIMAL(12,8) DEFAULT 0.00000000;
    ALTER TABLE ai_models ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE ai_models ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Content Generation Queue - UPSERT / ALTER
CREATE TABLE IF NOT EXISTS content_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES content_topics(id) ON DELETE CASCADE,
    ai_model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE RESTRICT
);

DO $$ BEGIN
    ALTER TABLE content_queue ADD COLUMN parent_queue_id UUID REFERENCES content_queue(id) ON DELETE SET NULL;
    ALTER TABLE content_queue ADD COLUMN status queue_status DEFAULT 'pending';
    ALTER TABLE content_queue ADD COLUMN priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 10);
    ALTER TABLE content_queue ADD COLUMN prompt_used TEXT; -- Make nullable initially
    ALTER TABLE content_queue ADD COLUMN prompt_hash VARCHAR(64) GENERATED ALWAYS AS (encode(sha256(prompt_used::bytea), 'hex')) STORED;
    ALTER TABLE content_queue ADD COLUMN ai_raw_response TEXT;
    ALTER TABLE content_queue ADD COLUMN generated_content JSONB;
    ALTER TABLE content_queue ADD COLUMN error_message TEXT;
    ALTER TABLE content_queue ADD COLUMN error_stack TEXT;
    ALTER TABLE content_queue ADD COLUMN retry_config JSONB DEFAULT '{"max_attempts": 3, "backoff_factor": 2, "initial_delay": 60}';
    ALTER TABLE content_queue ADD COLUMN attempt_count INTEGER DEFAULT 0 CHECK (attempt_count >= 0);
    ALTER TABLE content_queue ADD COLUMN max_attempts INTEGER DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 10);
    ALTER TABLE content_queue ADD COLUMN next_retry_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE content_queue ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE content_queue ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE content_queue ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE content_queue ADD COLUMN processing_duration INTERVAL GENERATED ALWAYS AS (
        CASE 
            WHEN started_at IS NOT NULL AND completed_at IS NOT NULL THEN completed_at - started_at
            ELSE NULL
        END
    ) STORED;
    ALTER TABLE content_queue ADD COLUMN tokens_used INTEGER;
    ALTER TABLE content_queue ADD COLUMN estimated_cost DECIMAL(12,8);
    ALTER TABLE content_queue ADD COLUMN metadata JSONB DEFAULT '{"source": "auto_generation", "trigger": "scheduler"}';
    ALTER TABLE content_queue ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE content_queue ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Generated Articles (Pre-Review) - UPSERT / ALTER
CREATE TABLE IF NOT EXISTS generated_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_id UUID NOT NULL REFERENCES content_queue(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES content_topics(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(350) UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL
);

DO $$ BEGIN
    ALTER TABLE generated_articles ADD COLUMN html_content TEXT;
    ALTER TABLE generated_articles ADD COLUMN tone VARCHAR(50) DEFAULT 'informative';
    ALTER TABLE generated_articles ADD COLUMN template_used VARCHAR(100);
    ALTER TABLE generated_articles ADD COLUMN template_variation VARCHAR(50);
    ALTER TABLE generated_articles ADD COLUMN seo_keywords TEXT[] DEFAULT '{}';
    ALTER TABLE generated_articles ADD COLUMN meta_description VARCHAR(300);
    ALTER TABLE generated_articles ADD COLUMN readability_score DECIMAL(3,1) CHECK (readability_score BETWEEN 0 AND 100);
    ALTER TABLE generated_articles ADD COLUMN ai_model_used VARCHAR(50) NOT NULL DEFAULT 'unknown';
    ALTER TABLE generated_articles ADD COLUMN word_count INTEGER CHECK (word_count >= 0);
    ALTER TABLE generated_articles ADD COLUMN character_count INTEGER CHECK (character_count >= 0);
    ALTER TABLE generated_articles ADD COLUMN sentence_count INTEGER CHECK (sentence_count >= 0);
    ALTER TABLE generated_articles ADD COLUMN paragraph_count INTEGER CHECK (paragraph_count >= 0);
    ALTER TABLE generated_articles ADD COLUMN has_local_context BOOLEAN DEFAULT false;
    ALTER TABLE generated_articles ADD COLUMN kenyan_references TEXT[] DEFAULT '{}';
    ALTER TABLE generated_articles ADD COLUMN kenyan_reference_count INTEGER GENERATED ALWAYS AS (array_length(kenyan_references, 1)) STORED;
    ALTER TABLE generated_articles ADD COLUMN quality_score DECIMAL(3,1) CHECK (quality_score BETWEEN 0 AND 100);
    ALTER TABLE generated_articles ADD COLUMN seo_score DECIMAL(3,1) CHECK (seo_score BETWEEN 0 AND 100);
    ALTER TABLE generated_articles ADD COLUMN engagement_score DECIMAL(3,1) CHECK (engagement_score BETWEEN 0 AND 100);
    ALTER TABLE generated_articles ADD COLUMN originality_score DECIMAL(3,1) CHECK (originality_score BETWEEN 0 AND 100);
    ALTER TABLE generated_articles ADD COLUMN flags JSONB DEFAULT '{"needs_fact_check": false, "needs_localization": false, "needs_sensitivity_review": false}';
    ALTER TABLE generated_articles ADD COLUMN status content_status DEFAULT 'draft';
    ALTER TABLE generated_articles ADD COLUMN version INTEGER DEFAULT 1 CHECK (version >= 1);
    ALTER TABLE generated_articles ADD COLUMN previous_version_id UUID REFERENCES generated_articles(id) ON DELETE SET NULL;
    ALTER TABLE generated_articles ADD COLUMN submitted_for_review_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE generated_articles ADD COLUMN submitted_by UUID;
    ALTER TABLE generated_articles ADD COLUMN reviewed_by UUID;
    ALTER TABLE generated_articles ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE generated_articles ADD COLUMN review_notes TEXT;
    ALTER TABLE generated_articles ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE generated_articles ADD COLUMN published_by UUID;
    ALTER TABLE generated_articles ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE generated_articles ADD COLUMN archived_by UUID;
    ALTER TABLE generated_articles ADD COLUMN archive_reason TEXT;
    ALTER TABLE generated_articles ADD COLUMN metadata JSONB DEFAULT '{"generation_method": "ai", "human_touched": false, "review_cycles": 0}';
    ALTER TABLE generated_articles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE generated_articles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;


-- Human Review Workflow - UPSERT / ALTER
CREATE TABLE IF NOT EXISTS content_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES generated_articles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL,
    review_cycle INTEGER DEFAULT 1 CHECK (review_cycle >= 1),
    action review_action NOT NULL,
    feedback TEXT NOT NULL
);

DO $$ BEGIN
    ALTER TABLE content_reviews ADD COLUMN changes_requested JSONB;
    ALTER TABLE content_reviews ADD COLUMN suggested_title VARCHAR(300);
    ALTER TABLE content_reviews ADD COLUMN suggested_excerpt TEXT;
    ALTER TABLE content_reviews ADD COLUMN suggested_keywords TEXT[];
    ALTER TABLE content_reviews ADD COLUMN severity VARCHAR(20) DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'major', 'critical'));
    ALTER TABLE content_reviews ADD COLUMN estimated_fix_time INTEGER CHECK (estimated_fix_time >= 0);
    ALTER TABLE content_reviews ADD COLUMN resolved BOOLEAN DEFAULT false;
    ALTER TABLE content_reviews ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE content_reviews ADD COLUMN resolved_by UUID;
    ALTER TABLE content_reviews ADD COLUMN next_reviewer_id UUID;
    ALTER TABLE content_reviews ADD COLUMN requires_rework BOOLEAN DEFAULT false;
    ALTER TABLE content_reviews ADD COLUMN rework_deadline TIMESTAMP WITH TIME ZONE;
    ALTER TABLE content_reviews ADD COLUMN metadata JSONB DEFAULT '{"automated_check": false, "review_method": "manual"}';
    ALTER TABLE content_reviews ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE content_reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;


-- Content Templates Library - UPSERT / ALTER
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_type template_type NOT NULL,
    content_structure JSONB NOT NULL
);

DO $$ BEGIN
    ALTER TABLE content_templates ADD COLUMN tone_guidelines TEXT;
    ALTER TABLE content_templates ADD COLUMN example_output TEXT;
    ALTER TABLE content_templates ADD COLUMN is_active BOOLEAN DEFAULT true;
    ALTER TABLE content_templates ADD COLUMN is_system_template BOOLEAN DEFAULT false;
    ALTER TABLE content_templates ADD COLUMN rotation_weight INTEGER DEFAULT 1 CHECK (rotation_weight BETWEEN 1 AND 100);
    ALTER TABLE content_templates ADD COLUMN applicable_topics UUID[] DEFAULT '{}';
    ALTER TABLE content_templates ADD COLUMN excluded_topics UUID[] DEFAULT '{}';
    ALTER TABLE content_templates ADD COLUMN min_word_count INTEGER DEFAULT 500 CHECK (min_word_count >= 0);
    ALTER TABLE content_templates ADD COLUMN max_word_count INTEGER DEFAULT 2000 CHECK (max_word_count >= min_word_count);
    ALTER TABLE content_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
    ALTER TABLE content_templates ADD COLUMN success_rate DECIMAL(5,2) CHECK (success_rate BETWEEN 0 AND 100);
    ALTER TABLE content_templates ADD COLUMN metadata JSONB DEFAULT '{"created_by": "system", "version": 1}';
    ALTER TABLE content_templates ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE content_templates ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Tone & Style Configurations - UPSERT / ALTER
CREATE TABLE IF NOT EXISTS tone_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}'
);

DO $$ BEGIN
    ALTER TABLE tone_profiles ADD COLUMN gemini_instruction TEXT; -- Initially null
    ALTER TABLE tone_profiles ADD COLUMN deepseek_instruction TEXT;
    ALTER TABLE tone_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    ALTER TABLE tone_profiles ADD COLUMN usage_count INTEGER DEFAULT 0;
    ALTER TABLE tone_profiles ADD COLUMN success_rate DECIMAL(5,2) CHECK (success_rate BETWEEN 0 AND 100);
    ALTER TABLE tone_profiles ADD COLUMN metadata JSONB DEFAULT '{"created_by": "system", "version": 1}';
    ALTER TABLE tone_profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
   -- Try to update nullable gemini_instruction if null
   UPDATE tone_profiles SET gemini_instruction = 'Standard tone instructions' WHERE gemini_instruction IS NULL;
   -- Then set constraint
   ALTER TABLE tone_profiles ALTER COLUMN gemini_instruction SET NOT NULL;
EXCEPTION
   WHEN others THEN null;
END $$;


-- Review Assignments - NEW (Should use CREATE IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS review_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES generated_articles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL,
    assigned_by UUID NOT NULL,
    sequence INTEGER DEFAULT 1 CHECK (sequence >= 1),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'escalated')),
    deadline TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    escalation_reason TEXT,
    escalated_to UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, reviewer_id, sequence)
);

-- Sitemap Entries - NEW
CREATE TABLE IF NOT EXISTS sitemap_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES generated_articles(id) ON DELETE CASCADE,
    slug VARCHAR(350) UNIQUE NOT NULL,
    lastmod TIMESTAMP WITH TIME ZONE NOT NULL,
    changefreq VARCHAR(20) DEFAULT 'weekly' CHECK (changefreq IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
    priority DECIMAL(2,1) DEFAULT 0.7 CHECK (priority BETWEEN 0.0 AND 1.0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generation Logs - NEW
CREATE TABLE IF NOT EXISTS generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(50) NOT NULL,
    details JSONB NOT NULL,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Logs - NEW
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'retrying')),
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate Limit Tracking - NEW
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_type VARCHAR(10) NOT NULL CHECK (period_type IN ('minute', 'hour', 'day')),
    request_count INTEGER DEFAULT 0 CHECK (request_count >= 0),
    token_count INTEGER DEFAULT 0 CHECK (token_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ai_model_id, period_start, period_type)
);

-- Performance Metrics - NEW
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(20),
    context JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index if not exists helper (Postgres supports IF NOT EXISTS for indexes)
CREATE INDEX IF NOT EXISTS idx_metric_name_recorded ON performance_metrics (metric_name, recorded_at);

-- Indexes for performance - COMPLETE SET (using IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_generated_articles_status_created ON generated_articles(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_articles_topic_status ON generated_articles(topic_id, status);
CREATE INDEX IF NOT EXISTS idx_generated_articles_slug ON generated_articles(slug);
-- Partial indexes require unique names to avoid conflicts or checking definition
CREATE INDEX IF NOT EXISTS idx_generated_articles_published ON generated_articles(published_at DESC) WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_content_queue_status_scheduled ON content_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_content_queue_topic ON content_queue(topic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_queue_retry ON content_queue(next_retry_at) WHERE status = 'failed' AND attempt_count < max_attempts;
CREATE INDEX IF NOT EXISTS idx_content_reviews_article ON content_reviews(article_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_reviews_reviewer ON content_reviews(reviewer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_assignments_pending ON review_assignments(article_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_content_topics_active_priority ON content_topics(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_content_templates_active_type ON content_templates(is_active, template_type);
CREATE INDEX IF NOT EXISTS idx_ai_models_active_provider ON ai_models(is_active, provider);
CREATE INDEX IF NOT EXISTS idx_sitemap_entries_active ON sitemap_entries(is_active, lastmod DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created ON generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_period ON rate_limit_tracking(period_start DESC, period_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded ON performance_metrics(recorded_at DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_generated_articles_content_search ON generated_articles USING GIN(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_generated_articles_title_search ON generated_articles USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_content_topics_search ON content_topics USING GIN(to_tsvector('english', name || ' ' || description));

-- Triggers for updated_at - COMPLETE SET
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_content_topics_updated_at 
        BEFORE UPDATE ON content_topics 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null; 
END $$;

DO $$ BEGIN
CREATE TRIGGER update_generated_articles_updated_at 
    BEFORE UPDATE ON generated_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_content_reviews_updated_at 
    BEFORE UPDATE ON content_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_content_queue_updated_at 
    BEFORE UPDATE ON content_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_review_assignments_updated_at 
    BEFORE UPDATE ON review_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
CREATE TRIGGER update_sitemap_entries_updated_at 
    BEFORE UPDATE ON sitemap_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Functions (CREATE OR REPLACE is sufficient)

-- Function to update topic usage count
CREATE OR REPLACE FUNCTION increment_topic_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE content_topics 
    SET usage_count = usage_count + 1, 
        last_used_at = NOW() 
    WHERE id = NEW.topic_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
CREATE TRIGGER increment_topic_usage_trigger
    AFTER INSERT ON content_queue
    FOR EACH ROW EXECUTE FUNCTION increment_topic_usage();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Function to update template success rate
CREATE OR REPLACE FUNCTION update_template_success_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE content_templates 
    SET usage_count = usage_count + 1,
        success_rate = CASE 
            WHEN usage_count = 0 THEN 
                CASE WHEN NEW.status = 'completed' THEN 100.0 ELSE 0.0 END
            ELSE 
                ((success_rate * (usage_count - 1)) + 
                 CASE WHEN NEW.status = 'completed' THEN 100.0 ELSE 0.0 END) / usage_count
        END
    WHERE name = NEW.template_used;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
CREATE TRIGGER update_template_success_rate_trigger
    AFTER INSERT ON generated_articles
    FOR EACH ROW EXECUTE FUNCTION update_template_success_rate();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Function to update tone success rate
CREATE OR REPLACE FUNCTION update_tone_success_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tone_profiles 
    SET usage_count = usage_count + 1,
        success_rate = CASE 
            WHEN usage_count = 0 THEN 
                CASE WHEN NEW.status IN ('approved', 'published') THEN 100.0 ELSE 0.0 END
            ELSE 
                ((success_rate * (usage_count - 1)) + 
                 CASE WHEN NEW.status IN ('approved', 'published') THEN 100.0 ELSE 0.0 END) / usage_count
        END
    WHERE name = NEW.tone;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
CREATE TRIGGER update_tone_success_rate_trigger
    AFTER UPDATE OF status ON generated_articles
    FOR EACH ROW EXECUTE FUNCTION update_tone_success_rate();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    base_slug VARCHAR;
    final_slug VARCHAR;
    slug_hash VARCHAR;
BEGIN
    -- Clean the title
    base_slug := lower(title);
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-');
    base_slug := regexp_replace(base_slug, '-+', '-');
    base_slug := trim(both '-' from base_slug);
    
    -- Limit length
    base_slug := substr(base_slug, 1, 100);
    
    -- Add hash for uniqueness
    slug_hash := substr(md5(title || '-' || now()::text), 1, 8);
    
    final_slug := base_slug || '-' || slug_hash;
    
    RETURN final_slug;
END;
$$ language 'plpgsql';

-- Function to calculate readability score
CREATE OR REPLACE FUNCTION calculate_readability(content TEXT)
RETURNS DECIMAL AS $$
DECLARE
    words INTEGER;
    sentences INTEGER;
    syllables INTEGER;
    asl DECIMAL;  -- Average Sentence Length
    asw DECIMAL;  -- Average Syllables per Word
    readability DECIMAL;
BEGIN
    -- Count words (simple whitespace split)
    words := array_length(regexp_split_to_array(content, '\s+'), 1);
    
    -- Count sentences (periods, exclamation, question marks)
    sentences := 
        (SELECT COUNT(*) FROM regexp_matches(content, '[.!?]+', 'g')) + 
        CASE WHEN content ~ '[^.!?]$' THEN 1 ELSE 0 END;
    
    -- Simple syllable estimation (rough approximation)
    syllables := words * 1.5;
    
    -- Calculate averages
    asl := words::DECIMAL / NULLIF(sentences, 0);
    asw := syllables::DECIMAL / NULLIF(words, 0);
    
    -- Flesch Reading Ease formula
    readability := 206.835 - (1.015 * asl) - (84.6 * asw);
    
    -- Clamp between 0 and 100
    readability := GREATEST(0, LEAST(100, readability));
    
    RETURN readability;
END;
$$ language 'plpgsql';

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_ai_model_id UUID,
    p_period_type VARCHAR,
    p_requests_needed INTEGER DEFAULT 1,
    p_tokens_needed INTEGER DEFAULT 0
)
RETURNS TABLE (
    can_proceed BOOLEAN,
    wait_seconds INTEGER,
    current_requests INTEGER,
    current_tokens INTEGER,
    max_requests INTEGER,
    max_tokens INTEGER
) AS $$
DECLARE
    v_model RECORD;
    v_period_start TIMESTAMP;
    v_tracking RECORD;
    v_current_requests INTEGER;
    v_current_tokens INTEGER;
    v_wait_seconds INTEGER;
BEGIN
    -- Get model details
    SELECT * INTO v_model FROM ai_models WHERE id = p_ai_model_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'AI model not found';
    END IF;
    
    -- Calculate period start
    CASE p_period_type
        WHEN 'minute' THEN v_period_start := date_trunc('minute', NOW());
        WHEN 'hour' THEN v_period_start := date_trunc('hour', NOW());
        WHEN 'day' THEN v_period_start := date_trunc('day', NOW());
        ELSE RAISE EXCEPTION 'Invalid period type';
    END CASE;
    
    -- Get current usage
    SELECT request_count, token_count INTO v_tracking
    FROM rate_limit_tracking
    WHERE ai_model_id = p_ai_model_id 
      AND period_start = v_period_start 
      AND period_type = p_period_type;
    
    IF v_tracking IS NULL THEN
        v_current_requests := 0;
        v_current_tokens := 0;
    ELSE
        v_current_requests := v_tracking.request_count;
        v_current_tokens := v_tracking.token_count;
    END IF;
    
    -- Check limits based on period type
    CASE p_period_type
        WHEN 'minute' THEN
            IF v_current_requests + p_requests_needed > v_model.rate_limit_rpm OR
               v_current_tokens + p_tokens_needed > v_model.rate_limit_tpm THEN
                can_proceed := false;
                wait_seconds := 60 - EXTRACT(SECOND FROM NOW());
            ELSE
                can_proceed := true;
                wait_seconds := 0;
            END IF;
            max_requests := v_model.rate_limit_rpm;
            max_tokens := v_model.rate_limit_tpm;
            
        WHEN 'day' THEN
            IF v_current_requests + p_requests_needed > v_model.rate_limit_rpd THEN
                can_proceed := false;
                wait_seconds := EXTRACT(EPOCH FROM (v_period_start + INTERVAL '1 day' - NOW()));
            ELSE
                can_proceed := true;
                wait_seconds := 0;
            END IF;
            max_requests := v_model.rate_limit_rpd;
            max_tokens := 1000000; -- Large value for daily token limit
            
        ELSE
            can_proceed := true;
            wait_seconds := 0;
            max_requests := 1000;
            max_tokens := 1000000;
    END CASE;
    
    current_requests := v_current_requests;
    current_tokens := v_current_tokens;
    
    RETURN NEXT;
END;
$$ language 'plpgsql';

-- Function to update rate limit tracking
CREATE OR REPLACE FUNCTION update_rate_limit(
    p_ai_model_id UUID,
    p_requests INTEGER DEFAULT 1,
    p_tokens INTEGER DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
    v_minute_start TIMESTAMP;
    v_hour_start TIMESTAMP;
    v_day_start TIMESTAMP;
BEGIN
    v_minute_start := date_trunc('minute', NOW());
    v_hour_start := date_trunc('hour', NOW());
    v_day_start := date_trunc('day', NOW());
    
    -- Update minute tracking
    INSERT INTO rate_limit_tracking (ai_model_id, period_start, period_type, request_count, token_count)
    VALUES (p_ai_model_id, v_minute_start, 'minute', p_requests, p_tokens)
    ON CONFLICT (ai_model_id, period_start, period_type)
    DO UPDATE SET 
        request_count = rate_limit_tracking.request_count + EXCLUDED.request_count,
        token_count = rate_limit_tracking.token_count + EXCLUDED.token_count;
    
    -- Update hour tracking (rollup)
    INSERT INTO rate_limit_tracking (ai_model_id, period_start, period_type, request_count, token_count)
    VALUES (p_ai_model_id, v_hour_start, 'hour', p_requests, p_tokens)
    ON CONFLICT (ai_model_id, period_start, period_type)
    DO UPDATE SET 
        request_count = rate_limit_tracking.request_count + EXCLUDED.request_count,
        token_count = rate_limit_tracking.token_count + EXCLUDED.token_count;
    
    -- Update day tracking (rollup)
    INSERT INTO rate_limit_tracking (ai_model_id, period_start, period_type, request_count, token_count)
    VALUES (p_ai_model_id, v_day_start, 'day', p_requests, p_tokens)
    ON CONFLICT (ai_model_id, period_start, period_type)
    DO UPDATE SET 
        request_count = rate_limit_tracking.request_count + EXCLUDED.request_count,
        token_count = rate_limit_tracking.token_count + EXCLUDED.token_count;
END;
$$ language 'plpgsql';

-- Function to clean up old rate limit data
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS VOID AS $$
BEGIN
    DELETE FROM rate_limit_tracking 
    WHERE period_start < NOW() - INTERVAL '7 days';
END;
$$ language 'plpgsql';

-- Scheduled job to clean up old data
SELECT cron.schedule(
    'cleanup-rate-limits',
    '0 2 * * *', -- Daily at 2 AM
    $$SELECT cleanup_old_rate_limits();$$
);

-- Function to get daily generation stats
CREATE OR REPLACE FUNCTION get_daily_generation_stats(p_date DATE DEFAULT NULL)
RETURNS TABLE (
    date DATE,
    total_articles INTEGER,
    published_articles INTEGER,
    approval_rate DECIMAL(5,2),
    avg_generation_time INTERVAL,
    avg_word_count DECIMAL(6,1),
    avg_readability DECIMAL(4,1),
    most_used_topic VARCHAR(100),
    most_used_tone VARCHAR(50),
    success_rate DECIMAL(5,2)
) AS $$
DECLARE
    v_target_date DATE;
BEGIN
    v_target_date := COALESCE(p_date, CURRENT_DATE);
    
    RETURN QUERY
    WITH daily_stats AS (
        SELECT 
            DATE(ga.created_at) as stat_date,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE ga.status = 'published') as published,
            AVG(cq.processing_duration) as avg_duration,
            AVG(ga.word_count) as avg_words,
            AVG(ga.readability_score) as avg_readability
        FROM generated_articles ga
        JOIN content_queue cq ON ga.queue_id = cq.id
        WHERE DATE(ga.created_at) = v_target_date
        GROUP BY DATE(ga.created_at)
    ),
    topic_stats AS (
        SELECT 
            DATE(ga.created_at) as stat_date,
            ct.name as topic_name,
            COUNT(*) as topic_count,
            RANK() OVER (PARTITION BY DATE(ga.created_at) ORDER BY COUNT(*) DESC) as rank
        FROM generated_articles ga
        JOIN content_topics ct ON ga.topic_id = ct.id
        WHERE DATE(ga.created_at) = v_target_date
        GROUP BY DATE(ga.created_at), ct.name
    ),
    tone_stats AS (
        SELECT 
            DATE(ga.created_at) as stat_date,
            ga.tone as tone_name,
            COUNT(*) as tone_count,
            RANK() OVER (PARTITION BY DATE(ga.created_at) ORDER BY COUNT(*) DESC) as rank
        FROM generated_articles ga
        WHERE DATE(ga.created_at) = v_target_date
        GROUP BY DATE(ga.created_at), ga.tone
    ),
    success_stats AS (
        SELECT 
            DATE(cq.completed_at) as stat_date,
            COUNT(*) as total_completed,
            COUNT(*) FILTER (WHERE cq.status = 'completed') as successful,
            ROUND(
                COUNT(*) FILTER (WHERE cq.status = 'completed') * 100.0 / 
                NULLIF(COUNT(*), 0), 2
            ) as success_percentage
        FROM content_queue cq
        WHERE DATE(cq.completed_at) = v_target_date
        GROUP BY DATE(cq.completed_at)
    )
    SELECT 
        ds.stat_date::DATE,
        COALESCE(ds.total, 0)::INTEGER,
        COALESCE(ds.published, 0)::INTEGER,
        ROUND(
            COALESCE(ds.published * 100.0 / NULLIF(ds.total, 0), 0), 2
        )::DECIMAL(5,2),
        COALESCE(ds.avg_duration, '0 seconds'::INTERVAL),
        COALESCE(ds.avg_words, 0)::DECIMAL(6,1),
        COALESCE(ds.avg_readability, 0)::DECIMAL(4,1),
        COALESCE(ts.topic_name, 'None')::VARCHAR(100),
        COALESCE(tns.tone_name, 'None')::VARCHAR(50),
        COALESCE(ss.success_percentage, 0)::DECIMAL(5,2)
    FROM daily_stats ds
    LEFT JOIN topic_stats ts ON ds.stat_date = ts.stat_date AND ts.rank = 1
    LEFT JOIN tone_stats tns ON ds.stat_date = tns.stat_date AND tns.rank = 1
    LEFT JOIN success_stats ss ON ds.stat_date = ss.stat_date;
END;
$$ language 'plpgsql';

-- Function to queue next batch of articles
CREATE OR REPLACE FUNCTION queue_next_generation_batch()
RETURNS INTEGER AS $$
DECLARE
    v_topic RECORD;
    v_today DATE;
    v_articles_to_generate INTEGER;
    v_queued_count INTEGER := 0;
    v_priority_topic_count INTEGER;
BEGIN
    v_today := CURRENT_DATE;
    
    -- Get count of priority 1 topics
    SELECT COUNT(*) INTO v_priority_topic_count
    FROM content_topics
    WHERE is_active = true AND priority = 1;
    
    -- Calculate articles to generate per topic
    v_articles_to_generate := CASE 
        WHEN v_priority_topic_count > 0 THEN 2
        ELSE 1
    END;
    
    -- Loop through active topics
    FOR v_topic IN 
        SELECT * FROM content_topics 
        WHERE is_active = true 
        ORDER BY priority DESC, last_used_at NULLS FIRST, RANDOM()
    LOOP
        -- Check how many articles already generated today for this topic
        DECLARE
            v_today_count INTEGER;
        BEGIN
            SELECT COUNT(*) INTO v_today_count
            FROM generated_articles
            WHERE topic_id = v_topic.id 
              AND DATE(created_at) = v_today;
            
            -- Queue articles if under limit
            IF v_today_count < v_topic.daily_article_limit THEN
                INSERT INTO content_queue (topic_id, ai_model_id, status, prompt_used, scheduled_for)
                SELECT 
                    v_topic.id,
                    am.id,
                    'pending',
                    v_topic.gemini_prompt_template,
                    NOW() + (RANDOM() * INTERVAL '1 hour')  -- Stagger generation
                FROM ai_models am
                WHERE am.is_active = true 
                  AND am.is_default = true
                LIMIT 1;
                
                v_queued_count := v_queued_count + 1;
            END IF;
        END;
        
        -- Limit total batch size
        IF v_queued_count >= 10 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN v_queued_count;
END;
$$ language 'plpgsql';

-- Scheduled job for automatic content generation (UPSERT cron)
SELECT cron.schedule(
    'generate-daily-content',
    '0 */4 * * *', -- Every 4 hours
    $$SELECT queue_next_generation_batch();$$
);

-- RLS Policies - COMPLETE SET (using idempotent DO blocks)
DO $$ BEGIN
    ALTER TABLE content_topics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE generated_articles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
    ALTER TABLE review_assignments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
    ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tone_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE sitemap_entries ENABLE ROW LEVEL SECURITY;
    ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN null; END $$;

-- Policy creation helpers
-- DROP POLICY IF EXISTS only works if you specific table, so we just use IF NOT EXISTS workaround or DROP first

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admin full access to content_topics" ON content_topics;
    CREATE POLICY "Admin full access to content_topics" ON content_topics FOR ALL USING (auth.role() = 'authenticated');
    
    DROP POLICY IF EXISTS "Public read access to active topics" ON content_topics;
    CREATE POLICY "Public read access to active topics" ON content_topics FOR SELECT USING (is_active = true);

    DROP POLICY IF EXISTS "Admin full access to generated_articles" ON generated_articles;
    CREATE POLICY "Admin full access to generated_articles" ON generated_articles FOR ALL USING (auth.role() = 'authenticated');
    
    DROP POLICY IF EXISTS "Reviewers can view submitted articles" ON generated_articles;
    CREATE POLICY "Reviewers can view submitted articles" ON generated_articles FOR SELECT USING (
        status IN ('submitted', 'approved', 'published') OR 
        EXISTS (SELECT 1 FROM review_assignments ra WHERE ra.article_id = generated_articles.id AND ra.reviewer_id = auth.uid())
    );

    DROP POLICY IF EXISTS "Admin full access to content_queue" ON content_queue;
    CREATE POLICY "Admin full access to content_queue" ON content_queue FOR ALL USING (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "System service can manage queue" ON content_queue;
    CREATE POLICY "System service can manage queue" ON content_queue FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
    
    -- Add other policies similarly...
EXCEPTION WHEN others THEN null; END $$;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Create service role for automated tasks if not exists
INSERT INTO auth.roles (role) VALUES ('service_role') 
ON CONFLICT (role) DO NOTHING;

-- Create indexes for JSONB columns for better performance
CREATE INDEX IF NOT EXISTS idx_content_topics_metadata ON content_topics USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_generated_articles_flags ON generated_articles USING GIN(flags);
CREATE INDEX IF NOT EXISTS idx_generated_articles_metadata ON generated_articles USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_content_queue_metadata ON content_queue USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_content_reviews_changes ON content_reviews USING GIN(changes_requested);
CREATE INDEX IF NOT EXISTS idx_content_templates_structure ON content_templates USING GIN(content_structure);
CREATE INDEX IF NOT EXISTS idx_tone_profiles_config ON tone_profiles USING GIN(config);
CREATE INDEX IF NOT EXISTS idx_ai_models_config ON ai_models USING GIN(config);
CREATE INDEX IF NOT EXISTS idx_ai_models_features ON ai_models USING GIN(features);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_articles_topic_status_date ON generated_articles(topic_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queue_status_model_date ON content_queue(status, ai_model_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reviews_article_status ON content_reviews(article_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_reviewer_status ON review_assignments(reviewer_id, status, deadline);

-- Create index for slug uniqueness check performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_slug_active ON generated_articles(slug) 
WHERE status NOT IN ('archived', 'deleted');

-- Create index for scheduled queue items
CREATE INDEX IF NOT EXISTS idx_queue_scheduled_pending ON content_queue(scheduled_for) 
WHERE status = 'pending' AND scheduled_for <= NOW();

-- Create index for retry logic
CREATE INDEX IF NOT EXISTS idx_queue_retry_needed ON content_queue(next_retry_at) 
WHERE status = 'failed' AND attempt_count < max_attempts AND next_retry_at <= NOW();

-- Create materialized view for dashboard stats (refresh daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_statistics AS SELECT 1 as id; -- Placeholder if logic fails, but better to drop
DROP MATERIALIZED VIEW IF EXISTS dashboard_statistics CASCADE;

CREATE MATERIALIZED VIEW dashboard_statistics AS
SELECT 
    DATE(ga.created_at) as date,
    COUNT(DISTINCT ga.id) as total_articles,
    COUNT(DISTINCT ga.id) FILTER (WHERE ga.status = 'published') as published_articles,
    COUNT(DISTINCT ga.id) FILTER (WHERE ga.status = 'submitted') as pending_review,
    COUNT(DISTINCT ga.id) FILTER (WHERE ga.status = 'draft') as draft_articles,
    COUNT(DISTINCT ct.id) as active_topics,
    COUNT(DISTINCT cq.ai_model_id) as models_used,
    ROUND(AVG(ga.readability_score), 1) as avg_readability,
    ROUND(AVG(ga.word_count), 0) as avg_word_count,
    ROUND(
        COUNT(DISTINCT ga.id) FILTER (WHERE ga.status IN ('approved', 'published')) * 100.0 /
        NULLIF(COUNT(DISTINCT ga.id) FILTER (WHERE ga.status IN ('submitted', 'approved', 'published', 'rejected')), 0),
        2
    ) as approval_rate,
    SUM(cq.estimated_cost) as total_cost,
    ROUND(AVG(EXTRACT(EPOCH FROM cq.processing_duration)), 2) as avg_generation_seconds
FROM generated_articles ga
LEFT JOIN content_topics ct ON ga.topic_id = ct.id
LEFT JOIN content_queue cq ON ga.queue_id = cq.id
WHERE ga.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(ga.created_at)
ORDER BY date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_statistics_date ON dashboard_statistics(date);
CREATE INDEX IF NOT EXISTS idx_dashboard_statistics_range ON dashboard_statistics(date DESC);

-- Refresh the materialized view daily
SELECT cron.schedule(
    'refresh-dashboard-stats',
    '0 1 * * *', -- Daily at 1 AM
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_statistics;$$
);

-- Final system initialization
INSERT INTO generation_logs (action, details, success)
VALUES (
    'system_schema_updated',
    jsonb_build_object(
        'version', '1.0.1',
        'timestamp', NOW(),
        'note', 'Schema verified against existing tables and updated idempotently'
    ),
    true
);

RAISE NOTICE 'CEKA AI Content Pipeline database schema updated successfully!';
