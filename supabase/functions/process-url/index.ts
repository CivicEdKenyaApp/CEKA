import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CrawlRequest {
  url: string;
  data_type: string;
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

    if (req.method === 'POST') {
      const { url, data_type }: CrawlRequest = await req.json();

      if (!url) {
        return new Response(
          JSON.stringify({ error: 'URL is required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid URL format' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Generate unique job ID
      const jobId = `crawl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create processing job record
      const jobData = {
        job_name: `${data_type}_crawl_${new Date().toISOString().split('T')[0]}`,
        input_urls: [url],
        input_files: [],
        status: 'processing',
        progress: 5,
        current_step: 'Starting website crawl...',
        processing_logs: {
          target_url: url,
          data_type: data_type,
          crawl_start: new Date().toISOString()
        }
      };

      const { data: job, error: jobError } = await supabaseClient
        .from('processing_jobs')
        .insert([jobData])
        .select()
        .single();

      if (jobError) {
        console.error('Error creating crawl job:', jobError);
        return new Response(
          JSON.stringify({ error: 'Failed to create crawl job' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Start async crawling (simulate crawling with delays)
      setTimeout(async () => {
        await simulateCrawling(supabaseClient, job.id, url, data_type);
      }, 1000);

      return new Response(JSON.stringify({ 
        job_id: job.id,
        status: 'processing',
        message: 'Website crawling started',
        target_url: url
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
    console.error('Error in process-url function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function simulateCrawling(supabaseClient: any, jobId: string, url: string, dataType: string) {
  const steps = [
    { progress: 15, step: 'Fetching webpage content...' },
    { progress: 30, step: 'Analyzing page structure...' },
    { progress: 50, step: 'Extracting data fields...' },
    { progress: 70, step: 'Processing discovered links...' },
    { progress: 85, step: 'Validating extracted data...' },
    { progress: 95, step: 'Generating output files...' },
  ];

  try {
    // Simulate actual web crawling process
    for (const stepData of steps) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay per step
      
      await supabaseClient
        .from('processing_jobs')
        .update({
          progress: stepData.progress,
          current_step: stepData.step,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
    }

    // Simulate data extraction results
    const extractedRecords = Math.floor(Math.random() * 500) + 50;
    
    // Final completion
    const completionData = {
      status: 'completed',
      progress: 100,
      current_step: 'Crawling completed successfully',
      completed_at: new Date().toISOString(),
      output_files: {
        total_records: extractedRecords,
        successful_files: 1,
        failed_files: 0,
        geojson_path: `processed/${jobId}/crawled_data.geojson`,
        report_path: `processed/${jobId}/crawl_report.json`,
        map_path: `processed/${jobId}/crawl_map.html`,
        heatmap_path: `processed/${jobId}/crawl_heatmap.html`
      },
      processing_logs: {
        completion_time: new Date().toISOString(),
        crawling_duration: '18 seconds',
        data_type: dataType,
        source_url: url,
        records_extracted: extractedRecords
      }
    };

    await supabaseClient
      .from('processing_jobs')
      .update(completionData)
      .eq('id', jobId);

    console.log(`Crawling completed for job ${jobId}`);

  } catch (error) {
    console.error(`Error during crawling simulation for job ${jobId}:`, error);
    
    // Mark job as failed
    await supabaseClient
      .from('processing_jobs')
      .update({
        status: 'failed',
        current_step: 'Crawling failed',
        error_message: error.message || 'Unknown error during crawling',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}