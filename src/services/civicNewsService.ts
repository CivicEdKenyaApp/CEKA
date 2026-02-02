// NewsAPI Integration for Civic News Curation
// https://newsapi.org - Free tier allows 100 requests/day

import { supabase } from '@/integrations/supabase/client';

// News article structure
export interface CivicNewsArticle {
    id: string;
    title: string;
    description: string;
    content: string;
    source: string;
    author: string | null;
    url: string;
    imageUrl: string | null;
    publishedAt: string;
    category: 'parliament' | 'judiciary' | 'county' | 'elections' | 'general';
}

// Civic keywords for Kenya-focused news curation
const CIVIC_KEYWORDS = [
    'Kenya Parliament',
    'National Assembly Kenya',
    'Senate Kenya',
    'IEBC Kenya',
    'Constitution Kenya',
    'Judiciary Kenya',
    'Chief Justice Kenya',
    'County Government Kenya',
    'Public Participation Kenya',
    'Kenya Law Reform',
    'EACC Kenya',
    'Controller of Budget Kenya',
    'Auditor General Kenya',
    'KNCHR',
    'LSK Kenya', // Law Society of Kenya
    'ICPAK', // Institute of Certified Public Accountants
];

// NewsAPI client (server-side via Edge Function recommended)
class CivicNewsService {
    private cache: CivicNewsArticle[] = [];
    private cacheExpiry: Date | null = null;
    private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

    /**
     * Fetch curated civic news
     * Uses Edge Function to hide API key and implement caching
     */
    async getNews(category?: string, limit: number = 10): Promise<CivicNewsArticle[]> {
        // Check cache first
        if (this.cache.length > 0 && this.cacheExpiry && new Date() < this.cacheExpiry) {
            const filtered = category
                ? this.cache.filter(a => a.category === category)
                : this.cache;
            return filtered.slice(0, limit);
        }

        try {
            // Call Edge Function (to be created) which proxies NewsAPI
            const { data, error } = await supabase.functions.invoke('civic-news', {
                body: { keywords: CIVIC_KEYWORDS, limit: 50 }
            });

            if (error) throw error;

            // Parse and categorize
            const articles: CivicNewsArticle[] = (data?.articles || []).map((a: any, idx: number) => ({
                id: `news-${Date.now()}-${idx}`,
                title: a.title,
                description: a.description || '',
                content: a.content || '',
                source: a.source?.name || 'Unknown',
                author: a.author,
                url: a.url,
                imageUrl: a.urlToImage,
                publishedAt: a.publishedAt,
                category: this.categorizeArticle(a.title + ' ' + a.description)
            }));

            // Update cache
            this.cache = articles;
            this.cacheExpiry = new Date(Date.now() + this.CACHE_DURATION_MS);

            const filtered = category
                ? articles.filter(a => a.category === category)
                : articles;
            return filtered.slice(0, limit);

        } catch (error) {
            console.error('[CivicNews] Failed to fetch news:', error);
            return this.getFallbackNews();
        }
    }

    /**
     * Categorize article based on content keywords
     */
    private categorizeArticle(text: string): CivicNewsArticle['category'] {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('parliament') || lowerText.includes('national assembly') || lowerText.includes('senate')) {
            return 'parliament';
        }
        if (lowerText.includes('judiciary') || lowerText.includes('court') || lowerText.includes('justice')) {
            return 'judiciary';
        }
        if (lowerText.includes('county') || lowerText.includes('governor') || lowerText.includes('mca')) {
            return 'county';
        }
        if (lowerText.includes('iebc') || lowerText.includes('election') || lowerText.includes('ballot')) {
            return 'elections';
        }
        return 'general';
    }

    /**
     * Fallback static news for offline/error cases
     */
    private getFallbackNews(): CivicNewsArticle[] {
        return [
            {
                id: 'fallback-1',
                title: 'Stay Updated with CEKA',
                description: 'Connect to the internet to receive the latest civic news from Kenya.',
                content: '',
                source: 'CEKA',
                author: null,
                url: 'https://civiceducationkenya.com',
                imageUrl: null,
                publishedAt: new Date().toISOString(),
                category: 'general'
            }
        ];
    }

    /**
     * Clear cache manually
     */
    clearCache(): void {
        this.cache = [];
        this.cacheExpiry = null;
    }
}

export const civicNewsService = new CivicNewsService();
export default civicNewsService;
