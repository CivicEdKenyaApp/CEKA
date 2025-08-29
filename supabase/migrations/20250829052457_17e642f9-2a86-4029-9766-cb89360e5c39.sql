-- Add missing geo_json_url column to visualizers table
ALTER TABLE public.visualizers 
ADD COLUMN IF NOT EXISTS geo_json_url TEXT;

-- Create RLS policy for visualizers if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'visualizers' 
        AND policyname = 'Visualizers are viewable by everyone'
    ) THEN
        CREATE POLICY "Visualizers are viewable by everyone" 
        ON public.visualizers 
        FOR SELECT 
        USING (is_active = true);
    END IF;
END $$;