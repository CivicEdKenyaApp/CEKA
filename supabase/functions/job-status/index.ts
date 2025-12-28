import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const jobId = pathParts[pathParts.length - 1];

      if (!jobId) {
        return new Response(
          JSON.stringify({ error: 'Job ID is required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Fetch job status from database
      const { data: job, error } = await supabaseClient
        .from('processing_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job status:', error);
        return new Response(
          JSON.stringify({ error: 'Job not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Transform job data to expected format
      const jobStatus = {
        id: job.id,
        status: job.status,
        progress: job.progress || 0,
        message: job.current_step || 'Processing...',
        created_at: job.created_at,
        updated_at: job.updated_at,
        completed_at: job.completed_at,
        error_message: job.error_message,
        results: job.output_files ? {
          successful_files: job.output_files.successful_files || 0,
          failed_files: job.output_files.failed_files || 0,
          facility_count: job.output_files.total_records || 0,
          administrative_areas: job.output_files.administrative_areas || 1,
          geojson_url: job.output_files.geojson_path ? 
            `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/processed-data/${job.output_files.geojson_path}` : 
            null
        } : null
      };

      return new Response(JSON.stringify(jobStatus), {
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
    console.error('Error in job-status function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});