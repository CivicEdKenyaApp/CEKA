
-- Phase 17: Consolidated Migration for Calendar & Hotline Ecosystem

-- 1. Enhance civic_events for rich metadata
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='civic_events' AND column_name='icon_name') THEN
        ALTER TABLE civic_events ADD COLUMN icon_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='civic_events' AND column_name='is_newsletter') THEN
        ALTER TABLE civic_events ADD COLUMN is_newsletter BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='civic_events' AND column_name='external_link') THEN
        ALTER TABLE civic_events ADD COLUMN external_link TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='civic_events' AND column_name='metadata') THEN
        ALTER TABLE civic_events ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

COMMENT ON COLUMN civic_events.category IS 'Categories: event, newsletter, volunteer_op, holiday, legislative_deadline';

-- 2. Create civic_hotline table for strategic legal aid
CREATE TABLE IF NOT EXISTS civic_hotline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'legal_aid',
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS Policies
ALTER TABLE civic_hotline ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public Read Access for Hotlines" 
ON civic_hotline FOR SELECT 
TO public 
USING (is_active = TRUE);

-- Admin write access
CREATE POLICY "Admin Write Access for Hotlines" 
ON civic_hotline FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'super_admin')
));

-- 4. Seed Data: Initial Strategic Hotlines
INSERT INTO civic_hotline (name, organization, phone, description, priority)
VALUES 
    ('Law Society of Kenya (LSK)', 'LSK', '0800720434', 'Legal representation and advocacy for justice.', 10),
    ('Defenders Coalition', 'Defenders Coalition', '0716200100', 'Protection and support for human rights defenders.', 9),
    ('Independent Medico-Legal Unit (IMLU)', 'IMLU', '0706162795', 'Holistic support for victims of torture and police brutality.', 8),
    ('Kenya National Commission on Human Rights (KNCHR)', 'KNCHR', '0800720627', 'State organ for human rights protection.', 7),
    ('Amnesty International Kenya', 'Amnesty', '0759464346', 'Global movement protecting human rights in Kenya.', 6),
    ('Civic Freedoms Forum (CFF)', 'CFF', '0728303864', 'Safeguarding civic space and assembly rights.', 5),
    ('Kenya Human Rights Commission (KHRC)', 'KHRC', '0728606583', 'Grassroots human rights advocacy and monitoring.', 4)
ON CONFLICT (id) DO NOTHING;

-- 5. Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_civic_hotline_updated_at
    BEFORE UPDATE ON civic_hotline
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
