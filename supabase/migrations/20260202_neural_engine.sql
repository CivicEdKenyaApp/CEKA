-- ================================================
-- CEKA Legislative Neural Engine - Schema Updates
-- ================================================

-- 1. ENHANCE BILLS TABLE
ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS text_content text,           -- Indexed for deep search
ADD COLUMN IF NOT EXISTS neural_summary text,         -- AI Insight
ADD COLUMN IF NOT EXISTS analysis_status text DEFAULT 'pending', -- pending, processing, completed, failed
ADD COLUMN IF NOT EXISTS pdf_url text,                -- Backblaze Link
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0; -- Analytics tracking

-- 2. STATUS HISTORY TRACKING
CREATE TABLE IF NOT EXISTS public.bill_status_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bill_id uuid NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    old_status text,
    new_status text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. TRENDING VIEW ENGINE
-- Ranks bills by follows + views
CREATE OR REPLACE VIEW public.trending_bills AS
SELECT 
    b.*,
    (SELECT count(*) FROM public.bill_follows f WHERE f.bill_id = b.id) as follow_count,
    b.views_count as view_intensity,
    ((SELECT count(*) FROM public.bill_follows f WHERE f.bill_id = b.id) * 5 + b.views_count) as trending_score
FROM public.bills b
ORDER BY trending_score DESC;

-- 4. RPC FOR TRENDING DATA
CREATE OR REPLACE FUNCTION public.get_trending_bills(limit_count integer DEFAULT 5)
RETURNS SETOF public.bills AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.trending_bills
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. NOTIFICATION TRIGGER
-- Notify users when a followed bill's status changes
CREATE OR REPLACE FUNCTION public.notify_bill_status_change() RETURNS trigger AS $$
DECLARE
    v_follower record;
BEGIN
    -- Log status history
    INSERT INTO public.bill_status_history (bill_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);

    -- Only notify if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        FOR v_follower IN 
            SELECT user_id FROM public.bill_follows WHERE bill_id = NEW.id
        LOOP
            PERFORM public.create_notification(
                v_follower.user_id,
                'bill_update',
                NEW.id,
                NULL, -- System action
                'Bill Movement: ' || NEW.title,
                'The bill has moved from ' || COALESCE(OLD.status, 'Initial') || ' to ' || NEW.status || '.',
                '/bill/' || NEW.id,
                NULL,
                'high',
                jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_bill_status_change ON public.bills;
CREATE TRIGGER on_bill_status_change
    AFTER UPDATE OF status ON public.bills
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_bill_status_change();

-- 6. FULL TEXT SEARCH INDEX
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS fts tsvector 
GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(text_content, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_bills_fts ON public.bills USING gin(fts);

-- 7. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
破
