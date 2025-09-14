import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignedUrlRequest {
  filename: string;
  bucket?: string;
  contentType?: string;
  expiresIn?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for signed URLs
    );

    if (req.method === 'POST') {
      const { filename, bucket = 'processed-data', contentType = 'application/octet-stream', expiresIn = 300 }: SignedUrlRequest = await req.json();

      // Validate filename for anonymous uploads - must be in uploads/ directory
      const authHeader = req.headers.get('Authorization');
      const isAuthenticated = authHeader && authHeader.includes('Bearer ');
      
      if (!isAuthenticated && !filename.startsWith('uploads/')) {
        return new Response(
          JSON.stringify({ error: 'Anonymous uploads must use uploads/ prefix' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Generate unique filename to prevent conflicts
      const timestamp = Date.now();
      const uniqueFilename = filename.includes('/') 
        ? filename.replace(/([^/]+)$/, `${timestamp}_$1`)
        : `${timestamp}_${filename}`;

      // Create signed URL for upload
      const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
        .from(bucket)
        .createSignedUploadUrl(uniqueFilename, {
          expiresIn,
        });

      if (signedUrlError) {
        console.error('Error creating signed upload URL:', signedUrlError);
        return new Response(
          JSON.stringify({ error: 'Failed to create signed upload URL', details: signedUrlError.message }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(JSON.stringify({ 
        uploadUrl: signedUrlData.signedUrl,
        token: signedUrlData.token,
        path: signedUrlData.path,
        filename: uniqueFilename
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
    console.error('Error in get-signed-upload-url function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});