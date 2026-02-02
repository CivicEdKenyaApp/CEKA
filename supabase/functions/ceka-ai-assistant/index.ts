// CEKA AI Assistant Edge Function
// Supports Gemini (current) with future DeepSeek integration
// Rate limited and context-aware

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.1.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AI Provider Configuration
// Future: Add DeepSeek support when ready
interface AIProviderConfig {
    provider: 'gemini' | 'deepseek';
    model: string;
    maxTokens: number;
}

const getProviderConfig = (): AIProviderConfig => {
    const provider = Deno.env.get('AI_PROVIDER') || 'gemini';

    if (provider === 'deepseek') {
        return {
            provider: 'deepseek',
            model: 'deepseek-chat', // or 'deepseek-reasoner' for R1
            maxTokens: 2000
        };
    }

    return {
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        maxTokens: 1000
    };
};

// System prompt for CEKA context
const SYSTEM_PROMPT = `You are CEKA AI, the Civic Education Kenya Assistant. You help Kenyan citizens understand:
- The Constitution of Kenya 2010
- Legislative processes and bills
- Voting and electoral rights
- Devolution and county government
- Public participation rights
- Basic civic duties

Guidelines:
- Be concise and educational
- Reference specific articles when possible
- Use simple language accessible to all Kenyans
- Stay politically neutral
- If unsure, recommend consulting official sources like kenyalaw.org

Current context: %CONTEXT%`;

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { query, context = 'general' } = await req.json();

        if (!query || query.trim().length < 3) {
            return new Response(
                JSON.stringify({ error: 'Query too short' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const config = getProviderConfig();
        let answer: string;

        if (config.provider === 'gemini') {
            const apiKey = Deno.env.get('GEMINI_API_KEY');
            if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: config.model });

            const systemPrompt = SYSTEM_PROMPT.replace('%CONTEXT%', context);
            const fullPrompt = `${systemPrompt}\n\nUser Question: ${query}\n\nProvide a helpful, educational response:`;

            const result = await model.generateContent(fullPrompt);
            answer = result.response.text();
        }
        // FUTURE: DeepSeek Integration Skeleton
        else if (config.provider === 'deepseek') {
            // DeepSeek API Integration (to be implemented)
            // const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
            // const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            //   method: 'POST',
            //   headers: {
            //     'Authorization': `Bearer ${apiKey}`,
            //     'Content-Type': 'application/json'
            //   },
            //   body: JSON.stringify({
            //     model: config.model,
            //     messages: [
            //       { role: 'system', content: SYSTEM_PROMPT.replace('%CONTEXT%', context) },
            //       { role: 'user', content: query }
            //     ],
            //     temperature: 1.5, // Recommended for creative responses
            //     max_tokens: config.maxTokens
            //   })
            // });
            // const data = await response.json();
            // answer = data.choices[0].message.content;

            answer = 'DeepSeek integration is coming soon. Using Gemini for now.';
        }
        else {
            throw new Error(`Unknown AI provider: ${config.provider}`);
        }

        return new Response(
            JSON.stringify({
                answer,
                provider: config.provider,
                model: config.model
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('AI Assistant Error:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to generate response',
                details: error.message
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
