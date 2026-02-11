-- ====================================================================
-- CEKA PIPELINE ENHANCEMENT: ORDER PAPERS & BILL VERSIONING
-- ====================================================================

-- 1. Create Order Papers Table
CREATE TABLE IF NOT EXISTS public.order_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    house TEXT, -- 'National Assembly' or 'Senate'
    date DATE DEFAULT CURRENT_DATE,
    pdf_url TEXT,
    source TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Order Papers
ALTER TABLE public.order_papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage order papers" ON public.order_papers;
CREATE POLICY "Admins manage order papers" ON public.order_papers 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can read order papers" ON public.order_papers;
CREATE POLICY "Anyone can read order papers" ON public.order_papers 
FOR SELECT TO anon, authenticated USING (true);

-- 2. Enhance Bills Table for Versioning
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'history') THEN
        ALTER TABLE public.bills ADD COLUMN history JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'bill_no') THEN
        ALTER TABLE public.bills ADD COLUMN bill_no TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'session_year') THEN
        ALTER TABLE public.bills ADD COLUMN session_year INTEGER;
    END IF;
END $$;

-- 3. Trigger for updated_at on order_papers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_order_papers_updated_at ON public.order_papers;
CREATE TRIGGER tr_order_papers_updated_at
    BEFORE UPDATE ON public.order_papers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Realtime for Order Papers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_papers') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.order_papers;
    END IF;
END $$;
