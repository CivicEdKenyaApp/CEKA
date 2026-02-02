// Gemini AI Bill Summarization Service
// Uses Gemini Flash (Free Tier) for fast, affordable summaries

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface BillSummary {
    title: string;
    bullets: string[];
    impact: 'positive' | 'negative' | 'neutral';
    affectedGroups: string[];
    generatedAt: string;
}

class GeminiService {
    private cache: Map<string, BillSummary> = new Map();

    /**
     * Generate a 3-bullet summary of a Bill for mobile display
     */
    async summarizeBill(billTitle: string, billContent: string): Promise<BillSummary | null> {
        // Check cache
        const cacheKey = `bill-${billTitle.slice(0, 50)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        if (!GEMINI_API_KEY) {
            console.warn('[Gemini] API key not configured');
            return null;
        }

        try {
            const prompt = `You are a Kenyan civic education expert. Summarize this bill for citizens:

BILL: ${billTitle}

CONTENT: ${billContent.slice(0, 3000)}

Provide a JSON response with:
1. "bullets": Array of exactly 3 short bullet points (max 15 words each)
2. "impact": Either "positive", "negative", or "neutral" for citizens
3. "affectedGroups": Array of groups affected (e.g., "farmers", "students", "SMEs")

Respond ONLY with valid JSON.`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 500
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Extract JSON from response (handles markdown code blocks)
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            const summary: BillSummary = {
                title: billTitle,
                bullets: parsed.bullets || [],
                impact: parsed.impact || 'neutral',
                affectedGroups: parsed.affectedGroups || [],
                generatedAt: new Date().toISOString()
            };

            // Cache result
            this.cache.set(cacheKey, summary);

            return summary;

        } catch (error) {
            console.error('[Gemini] Summarization error:', error);
            return null;
        }
    }

    /**
     * Generate a quick explanation of a Constitution article
     */
    async explainArticle(articleNumber: number, articleText: string): Promise<string | null> {
        if (!GEMINI_API_KEY) return null;

        try {
            const prompt = `Explain Article ${articleNumber} of the Kenyan Constitution in simple terms for a citizen with no legal background. Keep it under 100 words.

ARTICLE TEXT: ${articleText}

Explain in plain English, using everyday examples where possible.`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.5,
                        maxOutputTokens: 200
                    }
                })
            });

            if (!response.ok) return null;

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;

        } catch (error) {
            console.error('[Gemini] Article explanation error:', error);
            return null;
        }
    }

    /**
     * Clear the summary cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}

export const geminiService = new GeminiService();
export default geminiService;
