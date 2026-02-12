-- ==============================================================================
-- SOVEREIGN SIMULATION REQUESTS (NO MOCK DATA)
-- Mission: Enable real-time "Dry Runs" of the Sovereign Mind from the UI.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.sovereign_simulation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    result_json JSONB,             -- Stores the simulator output (integrity, reasoning, draft)
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- Enable Realtime for this table so the UI can subscribe
ALTER PUBLICATION supabase_realtime ADD TABLE public.sovereign_simulation_queue;

-- RLS
ALTER TABLE public.sovereign_simulation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for now" ON public.sovereign_simulation_queue FOR ALL USING (true);
