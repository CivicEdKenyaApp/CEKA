-- Ensure the trigger function exists for processing_jobs
CREATE OR REPLACE FUNCTION public.update_processing_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_processing_jobs_updated_at ON public.processing_jobs;

-- Create the trigger for processing_jobs
CREATE TRIGGER update_processing_jobs_updated_at
    BEFORE UPDATE ON public.processing_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_processing_jobs_updated_at();

-- Enable RLS on processing_jobs
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "processing_jobs_insert_authenticated" ON public.processing_jobs;
DROP POLICY IF EXISTS "processing_jobs_insert_anon" ON public.processing_jobs;
DROP POLICY IF EXISTS "processing_jobs_select_owner" ON public.processing_jobs;
DROP POLICY IF EXISTS "processing_jobs_update_owner" ON public.processing_jobs;
DROP POLICY IF EXISTS "processing_jobs_delete_owner" ON public.processing_jobs;
DROP POLICY IF EXISTS "service_role_manage_processing_jobs" ON public.processing_jobs;

-- Authenticated users: insert only when user_id = auth.uid()
CREATE POLICY "processing_jobs_insert_authenticated" ON public.processing_jobs
    FOR INSERT TO authenticated
    WITH CHECK ((user_id IS NOT NULL AND user_id = auth.uid()));

-- Anonymous users: allow insert only if user_id IS NULL
CREATE POLICY "processing_jobs_insert_anon" ON public.processing_jobs
    FOR INSERT TO anon
    WITH CHECK (user_id IS NULL);

-- Authenticated users: select their own jobs
CREATE POLICY "processing_jobs_select_owner" ON public.processing_jobs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Authenticated users: update their own jobs
CREATE POLICY "processing_jobs_update_owner" ON public.processing_jobs
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Authenticated users: delete their own jobs (optional)
CREATE POLICY "processing_jobs_delete_owner" ON public.processing_jobs
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Service role can manage all jobs (bypass RLS)
CREATE POLICY "service_role_manage_processing_jobs" ON public.processing_jobs
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Anonymous users can view jobs without user_id (public jobs)
CREATE POLICY "processing_jobs_select_public" ON public.processing_jobs
    FOR SELECT TO anon
    USING (user_id IS NULL);