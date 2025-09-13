import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DatasetRecord {
  id: string;
  session_id: string;
  data_type: string;
  processed_date: string;
  total_records: number;
  has_geojson: boolean;
  status: string;
  progress?: number;
  created_at: string;
  updated_at: string;
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
      // Fetch all processed datasets
      const { data, error } = await supabaseClient
        .from('processing_jobs')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching datasets:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch datasets' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Transform to expected format
      const datasets = (data || []).map(job => ({
        session_id: job.id,
        data_type: job.job_name || 'healthcare',
        processed_date: job.completed_at || job.created_at,
        total_records: job.output_files?.total_records || 0,
        has_geojson: !!job.output_files?.geojson_path,
        status: job.status,
        progress: job.progress || 100
      }));

      return new Response(JSON.stringify({ datasets }), {
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
    console.error('Error in process-datasets function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});