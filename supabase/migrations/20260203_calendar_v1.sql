
-- Migration to enhance civic_events for the new Calendar Ecosystem
ALTER TABLE civic_events 
ADD COLUMN IF NOT EXISTS icon_name TEXT,
ADD COLUMN IF NOT EXISTS is_newsletter BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS external_link TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Ensure categories are consistent
COMMENT ON COLUMN civic_events.category IS 'Categories: event, newsletter, volunteer_op, holiday, legislative_deadline';
