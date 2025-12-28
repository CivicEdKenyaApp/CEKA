import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessingJobData {
  job_name: string;
  input_files: any;
  input_urls?: any;
  status: string;
  progress: number;
  user_id?: string;
  current_step?: string;
  processing_logs?: any;
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
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];
      const dataType = formData.get('data_type') as string || 'healthcare';

      if (!files || files.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No files provided' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Generate unique job ID
      const jobId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store files in Supabase storage
      const uploadedFiles: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${jobId}_${i}_${file.name}`;
        const filePath = `uploads/${fileName}`;
        
        try {
          const arrayBuffer = await file.arrayBuffer();
          const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('processed-data')
            .upload(filePath, arrayBuffer, {
              contentType: file.type,
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          uploadedFiles.push(filePath);
        } catch (error) {
          console.error('Error processing file:', error);
        }
      }

      if (uploadedFiles.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Failed to upload any files' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Create processing job record
      const jobData: ProcessingJobData = {
        job_name: `${dataType}_upload_${new Date().toISOString().split('T')[0]}`,
        input_files: uploadedFiles,
        status: 'processing',
        progress: 10,
        current_step: 'File uploaded, starting analysis...',
        processing_logs: {
          uploaded_files: uploadedFiles.length,
          data_type: dataType,
          upload_timestamp: new Date().toISOString()
        }
      };

      const { data: job, error: jobError } = await supabaseClient
        .from('processing_jobs')
        .insert([jobData])
        .select()
        .single();

      if (jobError) {
        console.error('Error creating job:', jobError);
        return new Response(
          JSON.stringify({ error: 'Failed to create processing job' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Start async processing (simulate processing with delays)
      setTimeout(async () => {
        await simulateProcessing(supabaseClient, job.id, uploadedFiles, dataType);
      }, 1000);

      return new Response(JSON.stringify({ 
        job_id: job.id,
        status: 'processing',
        message: 'Files uploaded successfully, processing started',
        uploaded_files: uploadedFiles.length
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
    console.error('Error in upload-data function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function simulateProcessing(supabaseClient: any, jobId: string, files: string[], dataType: string) {
  const steps = [
    { progress: 25, step: 'Validating file formats...' },
    { progress: 40, step: 'Extracting data from files...' },
    { progress: 60, step: 'Cleaning and standardizing data...' },
    { progress: 80, step: 'Generating spatial analysis...' },
    { progress: 95, step: 'Creating final outputs...' },
  ];

  for (const stepData of steps) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    await supabaseClient
      .from('processing_jobs')
      .update({
        progress: stepData.progress,
        current_step: stepData.step,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }

  // Final completion
  const completionData = {
    status: 'completed',
    progress: 100,
    current_step: 'Processing completed successfully',
    completed_at: new Date().toISOString(),
    output_files: {
      total_records: Math.floor(Math.random() * 1000) + 100,
      successful_files: files.length,
      failed_files: 0,
      geojson_path: `processed/${jobId}/enhanced_data.geojson`,
      report_path: `processed/${jobId}/analysis_report.json`,
      map_path: `processed/${jobId}/interactive_map.html`,
      heatmap_path: `processed/${jobId}/heatmap.html`
    },
    processing_logs: {
      completion_time: new Date().toISOString(),
      processing_duration: '10 seconds',
      data_type: dataType
    }
  };

  await supabaseClient
    .from('processing_jobs')
    .update(completionData)
    .eq('id', jobId);

  console.log(`Processing completed for job ${jobId}`);
}