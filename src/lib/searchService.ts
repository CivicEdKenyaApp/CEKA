// src/services/searchService.ts
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'resource' | 'bill' | 'blog' | 'discussion' | 'campaign';
  category: string;
  url: string;
  date?: string;
  score?: number;
}

export interface SearchSuggestion {
  id: string;
  title: string;
  type: 'resource' | 'bill' | 'blog' | 'discussion' | 'campaign';
  category: string;
}

class SearchService {
  private async searchResources(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, description, type, category, url, created_at')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(resource => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: 'resource' as const,
        category: resource.category,
        url: `/resources/${resource.id}`,
        date: resource.created_at,
      }));
    } catch (error) {
      console.error('Error searching resources:', error);
      return [];
    }
  }

  private async searchBills(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('id, title, summary, status, category, created_at')
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(bill => ({
        id: bill.id,
        title: bill.title,
        description: bill.summary,
        type: 'bill' as const,
        category: bill.category,
        url: `/legislative-tracker/bills/${bill.id}`,
        date: bill.created_at,
      }));
    } catch (error) {
      console.error('Error searching bills:', error);
      return [];
    }
  }

  private async searchBlogPosts(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, created_at, published_at')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(post => ({
        id: post.id,
        title: post.title,
        description: post.excerpt || '',
        type: 'blog' as const,
        category: 'Blog',
        url: `/blog/${post.id}`,
        date: post.published_at || post.created_at,
      }));
    } catch (error) {
      console.error('Error searching blog posts:', error);
      return [];
    }
  }

  private async searchDiscussions(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select('id, title, content, created_at, user_id')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(discussion => ({
        id: discussion.id,
        title: discussion.title,
        description: discussion.content,
        type: 'discussion' as const,
        category: 'Discussion',
        url: `/community/discussions/${discussion.id}`,
        date: discussion.created_at,
      }));
    } catch (error) {
      console.error('Error searching discussions:', error);
      return [];
    }
  }

  async searchAll(query: string, limitPerType: number = 3): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const [resources, bills, blogPosts, discussions] = await Promise.all([
      this.searchResources(query, limitPerType),
      this.searchBills(query, limitPerType),
      this.searchBlogPosts(query, limitPerType),
      this.searchDiscussions(query, limitPerType),
    ]);

    // Combine and sort by relevance (simple scoring)
    const allResults = [
      ...resources.map(r => ({ ...r, score: this.calculateScore(r, query, 'resource') })),
      ...bills.map(r => ({ ...r, score: this.calculateScore(r, query, 'bill') })),
      ...blogPosts.map(r => ({ ...r, score: this.calculateScore(r, query, 'blog') })),
      ...discussions.map(r => ({ ...r, score: this.calculateScore(r, query, 'discussion') })),
    ];

    return allResults.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
  }

  async getSuggestions(query: string, limit: number = 5): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const results = await this.searchAll(query, 2);
    
    return results.map(result => ({
      id: result.id,
      title: result.title,
      type: result.type,
      category: result.category,
    })).slice(0, limit);
  }

  private calculateScore(result: SearchResult, query: string, type: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = result.title.toLowerCase();
    const descriptionLower = result.description.toLowerCase();

    // Title matches are most important
    if (titleLower.includes(queryLower)) score += 100;
    if (titleLower.startsWith(queryLower)) score += 50;

    // Description matches
    if (descriptionLower.includes(queryLower)) score += 30;

    // Type weighting
    const typeWeights: Record<string, number> = {
      'resource': 10,
      'bill': 15,
      'blog': 8,
      'discussion': 5,
    };
    score += typeWeights[type] || 0;

    // Recency bonus
    if (result.date) {
      const daysAgo = (Date.now() - new Date(result.date).getTime()) / (1000 * 60 * 60 * 24);
      if (daysAgo < 7) score += 20; // Within a week
      else if (daysAgo < 30) score += 10; // Within a month
    }

    return score;
  }

  async getPopularSearches(): Promise<string[]> {
    return [
      'Constitution',
      'Voting Rights',
      'Legislative Process',
      'County Government',
      'Public Participation',
      'Taxation',
      'Elections',
      'Human Rights',
      'Devolution',
      'Civic Education'
    ];
  }
}

export const searchService = new SearchService();
