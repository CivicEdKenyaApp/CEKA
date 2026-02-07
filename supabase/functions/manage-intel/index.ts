import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ManageRequest {
    action: 'list-scripts' | 'get-script' | 'save-script' | 'rerun-job';
    filename?: string;
    content?: string;
    jobId?: string;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for admin tasks
        );

        // Verify Admin Role (Security Barrier)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('No authorization header');

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        if (userError || !user) throw new Error('Unauthorized');

        const { data: roleData } = await supabaseClient
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (roleData?.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden: Admin access only' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const body: ManageRequest = await req.json();

        switch (body.action) {
            case 'list-scripts':
                // For local dev, we might use a predefined list or filesystem if permissions allow
                // In a hosted environment, these could be stored in a 'pipeline_code' table
                // For now, let's return the standard CEKA pipeline files
                return new Response(JSON.stringify({
                    scripts: ['legislative_scraper.py', 'crawler.py', 'scraping_targets.json', 'parser.py', 'analyzer.py']
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

            case 'get-script':
                if (!body.filename) throw new Error('Filename required');
                // Fetch from 'pipeline_code' table or localized storage
                const { data: scriptData, error: scriptError } = await supabaseClient
                    .from('pipeline_config')
                    .select('content')
                    .eq('filename', body.filename)
                    .single();

                // If not in DB, we could have a default (but let's assume we maintain them in DB for dashboard editing)
                return new Response(JSON.stringify({ content: scriptData?.content || `# Default content for ${body.filename}` }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });

            case 'save-script':
                if (!body.filename || !body.content) throw new Error('Filename and content required');
                const { error: saveError } = await supabaseClient
                    .from('pipeline_config')
                    .upsert({
                        filename: body.filename,
                        content: body.content,
                        updated_at: new Date().toISOString(),
                        updated_by: user.id
                    });

                if (saveError) throw saveError;
                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });

            case 'rerun-job':
                if (!body.jobId) throw new Error('Job ID required');
                const { data: oldJob } = await supabaseClient
                    .from('processing_jobs')
                    .select('*')
                    .eq('id', body.jobId)
                    .single();

                if (!oldJob) throw new Error('Job not found');

                const { data: newJob, error: rerunError } = await supabaseClient
                    .from('processing_jobs')
                    .insert([{
                        job_name: `${oldJob.job_name} (Rerun)`,
                        input_urls: oldJob.input_urls,
                        status: 'processing',
                        progress: 0,
                        current_step: 'Restarting pipeline...',
                    }])
                    .select()
                    .single();

                if (rerunError) throw rerunError;

                return new Response(JSON.stringify({ job_id: newJob.id }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });

            default:
                throw new Error('Invalid action');
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
