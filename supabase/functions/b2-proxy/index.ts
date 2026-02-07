import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * B2 Asset Proxy
 * 
 * Securely fetches assets from a private Backblaze B2 bucket
 * and streams them to the frontend. Reuses existing VITE_B2_ secrets.
 */
serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const path = url.searchParams.get('path');

        if (!path) {
            return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Get credentials from environment
        const B2_KEY_ID = Deno.env.get('VITE_B2_KEY_ID');
        const B2_APP_KEY = Deno.env.get('VITE_B2_APP_KEY');
        const B2_BUCKET = Deno.env.get('VITE_B2_BUCKET_NAME');
        const B2_ENDPOINT = Deno.env.get('VITE_B2_ENDPOINT'); // e.g. s3.eu-central-003.backblazeb2.com

        if (!B2_KEY_ID || !B2_APP_KEY || !B2_BUCKET || !B2_ENDPOINT) {
            return new Response(JSON.stringify({ error: 'Storage configuration missing in Edge Function secrets' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`[B2-Proxy] Fetching: ${path} from bucket: ${B2_BUCKET}`);

        // Construct the B2 S3-Compatible Download URL
        // Format: https://[bucket].[endpoint]/[path]
        const b2Url = `https://${B2_BUCKET}.${B2_ENDPOINT}/${path}`;

        // 1. Authorize with B2 to get a token (Basic Auth)
        const authHeader = `Basic ${btoa(`${B2_KEY_ID}:${B2_APP_KEY}`)}`;

        // 2. Fetch from B2 with Auth
        const response = await fetch(b2Url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader
            }
        });

        if (!response.ok) {
            console.error(`[B2-Proxy] B2 error: ${response.status} ${response.statusText}`);
            return new Response(JSON.stringify({ error: 'Failed to fetch asset from B2' }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 3. Proxy the response (headers + body)
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const cacheControl = 'public, max-age=31536000, immutable'; // Cache heavily

        return new Response(response.body, {
            headers: {
                ...corsHeaders,
                'Content-Type': contentType,
                'Cache-Control': cacheControl,
                'Content-Length': response.headers.get('content-length') || '',
            }
        });

    } catch (err: any) {
        console.error('[B2-Proxy] Unexpected error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
