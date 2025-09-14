import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ServerUploadRequest {
  filename: string;
  fileData: string; // base64 encoded file data
  bucket?: string;
  contentType?: string;
  createJob?: boolean;
  jobName?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Always use service_role for server-side uploads
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (req.method === 'POST') {
      const { 
        filename, 
        fileData, 
        bucket = 'processed-data', 
        contentType = 'application/octet-stream',
        createJob = true,
        jobName
      }: ServerUploadRequest = await req.json();

      if (!filename || !fileData) {
        return new Response(
          JSON.stringify({ error: 'filename and fileData are required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Decode base64 file data
      const fileBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

      // Generate unique filename
      const timestamp = Date.now();
      const uniqueFilename = `uploads/${timestamp}_${filename}`;

      // Upload file using service_role (bypasses RLS)
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from(bucket)
        .upload(uniqueFilename, fileBuffer, {
          contentType,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return new Response(
          JSON.stringify({ error: 'Upload failed', details: uploadError.message }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      let job = null;
      if (createJob) {
        // Create processing job using service_role (bypasses RLS)
        const { data: jobData, error: jobError } = await supabaseClient
          .from('processing_jobs')
          .insert([{
            job_name: jobName || `server_upload_${timestamp}`,
            user_id: null, // Server-side uploads are system jobs
            input_files: [uploadData.path],
            status: 'pending',
            progress: 0,
            current_step: 'File uploaded successfully, ready for processing',
            processing_logs: {
              uploaded_at: new Date().toISOString(),
              filename: uniqueFilename,
              size: fileBuffer.length,
              content_type: contentType,
              source: 'server_upload'
            }
          }])
          .select()
          .single();

        if (jobError) {
          console.error('Error creating job:', jobError);
          // Don't fail the upload if job creation fails, just log it
          console.warn('Upload succeeded but job creation failed:', jobError.message);
        } else {
          job = jobData;
        }
      }

      return new Response(JSON.stringify({ 
        upload: uploadData,
        job,
        message: 'File uploaded successfully' + (job ? ' and processing job created' : '')
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
    console.error('Error in server-upload function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});