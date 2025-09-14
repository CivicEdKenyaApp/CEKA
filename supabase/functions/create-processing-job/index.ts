import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessingJobData {
  job_name: string;
  input_files?: string[];
  input_urls?: string[];
  user_id?: string;
  status?: string;
  progress?: number;
  current_step?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const isAuthenticated = authHeader && authHeader.includes('Bearer ');
    
    // Create appropriate client based on authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      isAuthenticated 
        ? Deno.env.get('SUPABASE_ANON_KEY') ?? ''  // Use anon key for authenticated users (RLS will apply)
        : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for anonymous users
      isAuthenticated ? {
        global: {
          headers: {
            Authorization: authHeader || '',
          },
        },
      } : undefined
    );

    if (req.method === 'POST') {
      const jobData: ProcessingJobData = await req.json();

      // Validate and prepare job data
      const jobToInsert = {
        job_name: jobData.job_name || `processing_job_${Date.now()}`,
        input_files: jobData.input_files || [],
        input_urls: jobData.input_urls || [],
        user_id: isAuthenticated ? undefined : null, // Let RLS handle user_id for authenticated users, null for anonymous
        status: jobData.status || 'pending',
        progress: jobData.progress || 0,
        current_step: jobData.current_step || 'Job created, awaiting processing...',
        processing_logs: {
          created_at: new Date().toISOString(),
          source: isAuthenticated ? 'authenticated_user' : 'anonymous_user'
        }
      };

      const { data: job, error: jobError } = await supabaseClient
        .from('processing_jobs')
        .insert([jobToInsert])
        .select()
        .single();

      if (jobError) {
        console.error('Error creating processing job:', jobError);
        return new Response(
          JSON.stringify({ error: 'Failed to create processing job', details: jobError.message }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(JSON.stringify({ 
        job,
        message: 'Processing job created successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in create-processing-job function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});