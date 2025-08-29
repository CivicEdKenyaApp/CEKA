-- Create visualizers table for healthcare data visualizations
CREATE TABLE public.visualizers (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('leaflet', 'interactive', 'map', 'image')),
    category TEXT NOT NULL DEFAULT 'healthcare',
    display_order INTEGER NOT NULL DEFAULT 0,
    geo_json_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.visualizers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to visualizers
CREATE POLICY "Visualizers are viewable by everyone" 
ON public.visualizers 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_visualizers_updated_at
    BEFORE UPDATE ON public.visualizers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample visualizers data
INSERT INTO public.visualizers (title, description, url, type, category, display_order, geo_json_url, is_active) VALUES
('Kenya Healthcare Facilities Map', 'Interactive map showing all healthcare facilities across Kenya with detailed facility information', 'https://example.com/map', 'leaflet', 'healthcare', 1, 'https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/healthcare%20data/kenya_health_facilities.geojson?token=example', true),
('Healthcare Access Analysis', 'Comprehensive analysis of healthcare access patterns across different regions', 'https://example.com/analysis', 'interactive', 'healthcare', 2, null, true),
('County Distribution Overview', 'Overview of healthcare facility distribution by county', 'https://example.com/county', 'image', 'healthcare', 3, null, true);