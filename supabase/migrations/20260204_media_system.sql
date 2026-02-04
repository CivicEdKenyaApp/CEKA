-- Migration to support Instagram-style media content (Carousels, PDF Series, Videos)
-- Created: 2026-02-04

-- Table for high-level media containers (e.g., a "Post" or "Series")
CREATE TABLE IF NOT EXISTS public.media_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('carousel', 'pdf_series', 'video', 'document')),
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    cover_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for individual items within a content container
CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES public.media_content(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'pdf', 'audio')),
    file_path TEXT NOT NULL, -- Relative path in Backblaze B2
    file_url TEXT,           -- Public URL or cached URL
    order_index INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Policies for media_content
CREATE POLICY "Public media_content is viewable by everyone" 
ON public.media_content FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can manage media_content" 
ON public.media_content FOR ALL 
USING (true)
WITH CHECK (true);

-- Policies for media_items
CREATE POLICY "Public media_items are viewable by everyone" 
ON public.media_items FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.media_content 
    WHERE id = public.media_items.content_id AND status = 'published'
));

CREATE POLICY "Admins can manage media_items" 
ON public.media_items FOR ALL 
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.media_content
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_media_content_slug ON public.media_content(slug);
CREATE INDEX IF NOT EXISTS idx_media_items_content_id ON public.media_items(content_id);
