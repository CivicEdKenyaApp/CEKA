import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as AWS from 'https://esm.sh/aws-sdk@2.1332.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Remaining': '99',
}

interface VaultRequest {
  file_path: string
  expires_in?: number  // Optional custom expiry (max 7200 = 2 hours)
}

serve(async (req) => {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.log(`[${requestId}] Auth failed:`, authError?.message || 'No user')
      throw new Error('Unauthorized - Please sign in to access documents')
    }

    // Parse request body
    const body: VaultRequest = await req.json()
    const { file_path, expires_in } = body

    if (!file_path) {
      throw new Error('file_path is required')
    }

    // Validate file path (prevent directory traversal)
    if (file_path.includes('..') || file_path.startsWith('/')) {
      console.log(`[${requestId}] Invalid path attempt: ${file_path}`)
      throw new Error('Invalid file path')
    }

    // Calculate expiry (default 1 hour, max 2 hours)
    const expirySeconds = Math.min(expires_in || 3600, 7200)

    // Initialize B2 S3 client
    const s3 = new AWS.S3({
      endpoint: Deno.env.get('B2_S3_ENDPOINT'),
      accessKeyId: Deno.env.get('B2_KEY_ID'),
      secretAccessKey: Deno.env.get('B2_APPLICATION_KEY'),
      signatureVersion: 'v4',
      region: 'us-west-004'
    })

    const bucketName = Deno.env.get('B2_BUCKET_NAME') || 'ceka-resources-vault'

    // Generate signed URL
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: file_path,
      Expires: expirySeconds
    })

    // Log access for audit
    console.log(`[${requestId}] Vault access granted:`, {
      user_id: user.id,
      email: user.email,
      file_path,
      expires_in: expirySeconds,
      duration_ms: Date.now() - startTime
    })

    return new Response(
      JSON.stringify({
        signedUrl,
        expires_in: expirySeconds,
        request_id: requestId
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        }
      }
    )
  } catch (error) {
    const status = error.message.includes('Unauthorized') ? 401 : 400
    console.error(`[${requestId}] Vault error:`, error.message)

    return new Response(
      JSON.stringify({
        error: error.message,
        request_id: requestId
      }),
      {
        status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        }
      }
    )
  }
})

