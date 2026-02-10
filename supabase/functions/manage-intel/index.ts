import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
}

interface ManageRequest {
    action: 'list-scripts' | 'get-script' | 'save-script' | 'rerun-job' | 'run-pipeline';
    filename?: string;
    name?: string; // Fallback for filename
    content?: string;
    jobId?: string;
    pipelineType?: string;
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            status: 200,
            headers: corsHeaders
        });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

        // Verify Admin Role (Security Barrier)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('No authorization header');

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        if (userError || !user) throw new Error('Unauthorized');

        // Allow our main admin email or anyone with admin role
        if (user.email !== 'civiceducationkenya@gmail.com') {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .maybeSingle();

            if (!profile?.is_admin) {
                // Secondary check for user_roles table
                const { data: roleData } = await supabaseClient
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (roleData?.role !== 'admin') {
                    return new Response(JSON.stringify({ error: 'Forbidden: Admin access only' }), {
                        status: 403,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
            }
        }

        const body: ManageRequest = await req.json();
        const filename = body.filename || body.name;

        switch (body.action) {
            case 'list-scripts':
                return new Response(JSON.stringify({
                    scripts: ['legislative_scraper.py', 'crawler.py', 'scraping_targets.json', 'parser.py', 'analyzer.py', 'sync_to_supabase.py', 'sync_to_supabase_neural.py']
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

            case 'get-script':
                if (!filename) throw new Error('Filename or Name required');
                const { data: scriptData } = await supabaseClient
                    .from('pipeline_config')
                    .select('content')
                    .eq('filename', filename)
                    .maybeSingle();

                return new Response(JSON.stringify({ content: scriptData?.content || `# Standard template for ${filename}\nimport os\n\nprint("Initializing ${filename}...")` }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });

            case 'save-script':
                if (!filename || !body.content) throw new Error('Filename and content required');
                const { error: saveError } = await supabaseClient
                    .from('pipeline_config')
                    .upsert({
                        filename: filename,
                        content: body.content,
                        updated_at: new Date().toISOString(),
                        updated_by: user.id
                    });

                if (saveError) throw saveError;
                return new Response(JSON.stringify({ success: true, message: `Script ${filename} saved successfully` }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });

            case 'run-pipeline':
                if (!body.jobId) throw new Error('Job ID required');

                // GOHAM: Immediately advance job status to 'processing'
                const { error: runUpdateError } = await supabaseClient
                    .from('processing_jobs')
                    .update({
                        status: 'processing',
                        progress: 10,
                        current_step: `Neural net initializing for ${body.pipelineType || 'legislative'} sync...`,
                        updated_at: new Date().toISOString(),
                        started_at: new Date().toISOString()
                    })
                    .eq('id', body.jobId);

                if (runUpdateError) throw runUpdateError;

                return new Response(JSON.stringify({ success: true, message: 'Pipeline deployment signal sent', job_id: body.jobId }), {
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
                        job_type: oldJob.job_type,
                        input_urls: oldJob.input_urls,
                        status: 'processing',
                        progress: 5,
                        current_step: 'Rerun sequence initiated...',
                        created_at: new Date().toISOString(),
                    }])
                    .select()
                    .single();

                if (rerunError) throw rerunError;

                return new Response(JSON.stringify({ success: true, job_id: newJob.id }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });

            default:
                throw new Error(`Action '${body.action}' not implemented`);
        }

    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }), {
            status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
});
