-- Seed AI Models (Real Configs) - UPSERT
INSERT INTO ai_models (name, provider, api_endpoint, rate_limit_rpm, rate_limit_tpm, rate_limit_rpd, cost_per_token, max_output_tokens, is_active, is_default, config) VALUES
('gemini-1.5-pro', 'Google', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', 60, 100000, 500, 0.00000125, 8192, true, true, '{
    "safety_settings": [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"}
    ],
    "generation_config": {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192
    }
}'),
('gemini-1.5-flash', 'Google', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', 120, 200000, 1000, 0.00000050, 4096, true, false, '{
    "safety_settings": [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"}
    ],
    "generation_config": {
        "temperature": 0.6,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 4096
    }
}'),
('deepseek-chat', 'DeepSeek', 'https://api.deepseek.com/v1/chat/completions', 60, 50000, 500, 0.00000020, 4096, true, false, '{
    "model": "deepseek-chat",
    "temperature": 0.7,
    "max_tokens": 4096
}'),
('deepseek-coder', 'DeepSeek', 'https://api.deepseek.com/v1/chat/completions', 60, 50000, 500, 0.00000020, 4096, true, false, '{
    "model": "deepseek-coder",
    "temperature": 0.5,
    "max_tokens": 4096
}')
ON CONFLICT (name) DO UPDATE SET 
    provider = EXCLUDED.provider,
    api_endpoint = EXCLUDED.api_endpoint,
    is_active = EXCLUDED.is_active,
    config = EXCLUDED.config;


-- Seed Content Topics (CEKA Specific) - UPSERT
INSERT INTO content_topics (name, description, keywords, priority, gemini_prompt_template, daily_article_limit, target_word_count, local_context_required, min_kenyan_references) VALUES
('Kenyan Constitution 2010', 'In-depth analysis and education on the 2010 Constitution of Kenya', 
 ARRAY['Kenya Constitution', '2010', 'Bill of Rights', 'Devolution', 'Chapter 6', 'Integrity', 'Citizenship'], 
 1, 
 'Write a comprehensive article about {specific_aspect} of the Kenyan Constitution 2010. Focus on how it empowers citizens and improves governance. Include references to specific articles.', 
 3, 1500, true, 5),

('Devolution in Kenya', 'Updates and educational content on the devolved system of government', 
 ARRAY['Devolution', 'County Government', 'Governor', 'MCA', 'Senate', 'Resources', 'Service Delivery'], 
 1, 
 'Create a detailed article explaining the impact of devolution in {specific_county_or_sector}. Analyze challenges and successes. Cite relevant statutes like the County Governments Act.', 
 2, 1200, true, 4),

('Voter Education', 'Guides and information on voting rights, processes, and importance', 
 ARRAY['IEBC', 'Voting', 'Elections', 'Voter Registration', 'PVC', 'Democracy', 'Civic Duty'], 
 2, 
 'Compose an educational piece on {voting_topic} for Kenyan voters. Explain the process clearly as defined by the IEBC. Emphasize the importance of participation.', 
 2, 800, true, 3),

('Public Participation', 'Educating citizens on how to participate in government decision making', 
 ARRAY['Public Participation', 'Budget Process', 'County Forums', 'Petitions', 'Recall', 'Accountability'], 
 2, 
 'Write a guide on how Kenyan citizens can effectively participate in {process_name}. Provide step-by-step instructions and cite legal basis for participation.', 
 2, 1000, true, 4),

('Human Rights in Kenya', 'Articles covering fundamental rights and freedoms', 
 ARRAY['Human Rights', 'KNCHR', 'Police', 'Justice', 'Freedom of Speech', 'Assembly', 'Fair Trial'], 
 1, 
 'Analyze the state of {human_right} in Kenya. Discuss recent events, court rulings, and the role of oversight bodies like KNCHR or IPOA.', 
 2, 1300, true, 5)
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    keywords = EXCLUDED.keywords,
    gemini_prompt_template = EXCLUDED.gemini_prompt_template,
    target_word_count = EXCLUDED.target_word_count;


-- Seed Content Templates - DELETE THEN INSERT (Since no unique constraint on name guaranteed in all environments yet, safe retry)
-- Ideally we would add UNIQUE(name) but to be safe we delete by name first
DELETE FROM content_templates WHERE name IN (
    'Standard Educational Article', 
    'Quick Guide / How-To', 
    'News Analysis', 
    'Engaging Opening', 
    'Call to Action Conclusion'
);

INSERT INTO content_templates (name, description, template_type, content_structure, tone_guidelines, min_word_count, max_word_count) VALUES
('Standard Educational Article', 'General purpose educational content structure', 'full', 
 '{
    "sections": [
        {"name": "Introduction", "description": "Hook the reader and introduce the topic"},
        {"name": "Historical Context", "description": "Brief background relevant to Kenya"},
        {"name": "Key Provisions/Details", "description": "Main educational content"},
        {"name": "Real-world Application", "description": "How this affects the daily life of a Kenyan"},
        {"name": "Challenges", "description": "Current hurdles or implementation issues"},
        {"name": "Call to Action", "description": "What citizens should do"}
    ]
 }', 
 'Informative, accessible, and empowering. Avoid overly legalistic jargon.', 800, 1500),

('Quick Guide / How-To', 'Step-by-step instructions for civic processes', 'full', 
 '{
    "sections": [
        {"name": "What You Need", "description": "Requirements list"},
        {"name": "Steps", "description": "Numbered list of actions"},
        {"name": "Where to Go", "description": "Physical locations or digital portals"},
        {"name": "Timeline", "description": "How long the process takes"},
        {"name": "Fees", "description": "Official costs (if any)"}
    ]
 }', 
 'Direct, clear, and actionable. Use bullet points.', 500, 1000),

('News Analysis', 'Breaking down recent events through a civic lens', 'full', 
 '{
    "sections": [
        {"name": "The Event", "description": "Summary of what happened"},
        {"name": "The Law", "description": "What the constitution/law says about it"},
        {"name": "Significance", "description": "Why it matters for democracy/devolution"},
        {"name": "What Next", "description": "Future implications"}
    ]
 }', 
 'Objective but analytical. Connect events to principles.', 700, 1200),

('Engaging Opening', 'Hook for social media or newsletter', 'opening', 
 '{"structure": "Question -> Shocking Stat -> Promise of solution"}', 
 'Provocative and attention-grabbing.', 50, 150),

('Call to Action Conclusion', 'Strong ending to drive engagement', 'conclusion', 
 '{"structure": "Summary -> Emotional appeal -> Specific request"}', 
 'Inspirational and urgent.', 50, 150);


-- Seed Tone Profiles - UPSERT
INSERT INTO tone_profiles (name, description, config, gemini_instruction) VALUES
('Educator', 'Knowledgeable, patient, and clear', 
 '{"formality": 0.6, "complexity": 0.4, "empathy": 0.7}', 
 'Adopt the persona of a patient and knowledgeable high school civics teacher. Explain complex legal concepts in simple advice. Use analogies relevant to daily Kenyan life.'),

('Activist', 'Passionate, urgent, and empowering', 
 '{"formality": 0.5, "urgency": 0.8, "directness": 0.9}', 
 'Write with the passion of a civil society activist. Emphasize rights, demand accountability, and use stirring language. Encorage citizens to stand up for their rights.'),

('Analyst', 'Objective, detailed, and evidence-based', 
 '{"formality": 0.8, "complexity": 0.7, "authoritativeness": 0.9}', 
 'Write as a seasoned political analyst. Focus on facts, legal precedents, and logical outcomes. Cite sections of the law and historical examples accurately.'),

('Grassroots', 'Relatable, conversational, and community-focused', 
 '{"formality": 0.3, "conversational": 0.9, "local_context": 1.0}', 
 'Speak the language of the mwananchi. Use simple English mixed with common Kenyan phrases (optional). Focus on how issues affect the common person in the village or estate.')
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    config = EXCLUDED.config,
    gemini_instruction = EXCLUDED.gemini_instruction;

-- Ensure system initialized log is present but unique per day/event?
INSERT INTO generation_logs (action, details, success)
VALUES (
    'seed_data_applied',
    jsonb_build_object(
        'timestamp', NOW(),
        'note', 'Seed data applied via upsert (safe mode)'
    ),
    true
);

RAISE NOTICE 'Seed data applied successfully (safe update)!';
