import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * B2 Asset Proxy (v4 - Native API Flow)
 * 
 * Securely fetches assets from a private Backblaze B2 bucket
 * using the Native B2 API which is more reliable for simple proxying.
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

        // Get credentials from environment (trying both VITE_ and non-prefixed)
        const B2_KEY_ID = Deno.env.get('VITE_B2_KEY_ID') || Deno.env.get('B2_KEY_ID');
        const B2_APP_KEY = Deno.env.get('VITE_B2_APP_KEY') || Deno.env.get('B2_APP_KEY');
        const B2_BUCKET = Deno.env.get('VITE_B2_BUCKET_NAME') || Deno.env.get('B2_BUCKET_NAME');

        if (!B2_KEY_ID || !B2_APP_KEY || !B2_BUCKET) {
            console.error('[B2-Proxy] Missing secrets:', { keyId: !!B2_KEY_ID, appKey: !!B2_APP_KEY, bucket: !!B2_BUCKET });
            return new Response(JSON.stringify({ error: 'Storage configuration missing in Edge Function secrets' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 1. Authorize with B2 to get a download token
        const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
            headers: {
                'Authorization': `Basic ${btoa(`${B2_KEY_ID}:${B2_APP_KEY}`)}`
            }
        });

        if (!authResponse.ok) {
            const errText = await authResponse.text();
            console.error('[B2-Proxy] B2 Auth failed:', errText);
            return new Response(JSON.stringify({ error: 'B2 Authorization failed' }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { authorizationToken, downloadUrl } = await authResponse.json();

        // 2. Fetch the file using the download token
        const b2Url = `${downloadUrl}/file/${B2_BUCKET}/${path}`;

        console.log(`[B2-Proxy] Fetching: ${path}`);

        const response = await fetch(b2Url, {
            method: 'GET',
            headers: {
                'Authorization': authorizationToken
            }
        });

        if (!response.ok) {
            console.error(`[B2-Proxy] B2 download error: ${response.status}`);
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
