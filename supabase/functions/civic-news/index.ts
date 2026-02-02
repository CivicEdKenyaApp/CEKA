import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const NEWSAPI_KEY = Deno.env.get('NEWSAPI_KEY');
const NEWSAPI_URL = 'https://newsapi.org/v2/everything';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        if (!NEWSAPI_KEY) {
            throw new Error('NEWSAPI_KEY not configured');
        }

        const { keywords = [], limit = 20 } = await req.json();

        // Build query from civic keywords
        const query = keywords.slice(0, 5).join(' OR ');

        const url = new URL(NEWSAPI_URL);
        url.searchParams.set('q', query);
        url.searchParams.set('language', 'en');
        url.searchParams.set('sortBy', 'publishedAt');
        url.searchParams.set('pageSize', String(Math.min(limit, 100)));
        url.searchParams.set('apiKey', NEWSAPI_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`NewsAPI error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return new Response(
            JSON.stringify({
                articles: data.articles || [],
                totalResults: data.totalResults || 0
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        );

    } catch (error) {
        console.error('[civic-news] Error:', error);
        return new Response(
            JSON.stringify({
                error: error.message,
                articles: []
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        );
    }
});
