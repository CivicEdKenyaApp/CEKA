import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { query } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Retrieve relevant constitutional context via Full Text Search
    const { data: sections, error: searchError } = await supabase
      .from('constitution_sections')
      .select('article_label, title_en, content_en')
      .textSearch('fts', query)
      .limit(5)

    if (searchError) throw searchError

    const context = sections?.map(s => `[${s.article_label}: ${s.title_en}]\n${s.content_en}`).join('\n\n') || "No direct articles found."

    // 2. Query Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY')!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      You are the CEKA Constitutional Expert. Answer the user's question about the Kenyan Constitution using the provided context.
      If the context doesn't contain the answer, use your general knowledge of the Kenyan Constitution 2010 but mention if it's not in the specific articles retrieved.
      Be concise, authoritative, and helpful.

      CONTEXT:
      ${context}

      USER QUESTION:
      ${query}
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return new Response(
      JSON.stringify({ answer: text, sources: sections }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
