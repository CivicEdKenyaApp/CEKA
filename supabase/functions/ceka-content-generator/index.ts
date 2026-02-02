// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
// @ts-ignore
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { status: 200, headers: corsHeaders })
    }

    try {
        // @ts-ignore
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        // @ts-ignore
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        // @ts-ignore
        const geminiKey = Deno.env.get('GEMINI_API_KEY')

        if (!supabaseUrl || !supabaseServiceKey || !geminiKey) {
            throw new Error('Missing environment secrets (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GEMINI_API_KEY)')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        const genAI = new GoogleGenerativeAI(geminiKey)

        // 1. Fetch pending items from queue
        const { data: queueItems, error: queueError } = await supabase
            .from('content_queue')
            .select('*, topic:content_topics(*)')
            .eq('status', 'pending')
            .order('scheduled_for', { ascending: true })
            .limit(1)

        if (queueError) throw queueError
        if (!queueItems || queueItems.length === 0) {
            return new Response(JSON.stringify({ message: 'No pending content jobs found.' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const job = queueItems[0]
        const topic = job.topic

        // 2. Select Tone & Template (Rotational logic)
        const { data: tones } = await supabase.from('tone_profiles').select('*')
        const { data: templates } = await supabase.from('content_templates').select('*').eq('is_active', true)

        const selectedTone = tones?.[Math.floor(Math.random() * (tones?.length || 1))]
        const selectedTemplate = templates?.[Math.floor(Math.random() * (templates?.length || 1))]

        // 3. Mark job as processing
        await supabase.from('content_queue').update({ status: 'processing' }).eq('id', job.id)

        // 4. Generate Content
        console.log(`[ContentGen] Generating article for topic: ${topic.name} using tone: ${selectedTone?.name}`)

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `You are an expert Kenyan civic educator writing for CEKA.
        Topic: ${topic.name}
        Topic Description: ${topic.description}
        Keywords: ${topic.keywords.join(', ')}
        
        Style Instruction: ${selectedTone?.instruction || 'Informative and educational.'}
        
        Template Guidance (if any): ${selectedTemplate?.content || 'Write a comprehensive article with a catchy title, excerpt, and clear body.'}
        
        Output Requirements:
        1. Title: A compelling title.
        2. Excerpt: A 2-sentence summary.
        3. Content: The full article body in Markdown. Include headers and bullet points.
        4. Meta Description: One sentence for SEO.
        5. SEO Keywords: 5 relevant tags.
        
        Format as JSON: { "title": "...", "excerpt": "...", "content": "...", "meta_description": "...", "seo_keywords": ["...", "..."] }`;

        const result = await model.generateContent(prompt)
        const response = await result.response
        const rawJson = response.text().replace(/```json|```/g, '').trim()
        const articleData = JSON.parse(rawJson)

        // 5. Save to Generated Articles
        const { error: insertError } = await supabase.from('generated_articles').insert({
            topic_id: topic.id,
            title: articleData.title,
            excerpt: articleData.excerpt,
            content: articleData.content,
            meta_description: articleData.meta_description,
            seo_keywords: articleData.seo_keywords,
            tone_id: selectedTone?.id,
            status: 'draft'
        })

        if (insertError) throw insertError

        // 6. Complete job
        await supabase.from('content_queue').update({
            status: 'completed',
            completed_at: new Date().toISOString()
        }).eq('id', job.id)

        return new Response(JSON.stringify({
            success: true,
            article: articleData.title,
            tone: selectedTone?.name
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (err: any) {
        console.error('[ContentGen Error]:', err.message)
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
