import { supabase } from '@/integrations/supabase/client';

// Types for unified search
export interface SearchSuggestion {
  id: string;
  title: string;
  type: 'resource' | 'bill' | 'blog';
  category?: string;
  description?: string;
  relevance: number; // 0-1 for sorting
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'resource' | 'bill' | 'blog';
  url: string;
  category?: string;
  date?: string;
  author?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  suggestions: SearchSuggestion[];
  results: SearchResult[];
  total: number;
  hasMore: boolean;
}

class SearchService {
  private static instance: SearchService;
  private debounceTimer: NodeJS.Timeout | null = null;

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // Get search suggestions with debouncing
  async getSuggestions(query: string, limit: number = 8): Promise<SearchSuggestion[]> {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    try {
      // Fetch from all sources in parallel
      const [resources, bills, blogs] = await Promise.all([
        this.searchResources(normalizedQuery, Math.ceil(limit / 3)),
        this.searchBills(normalizedQuery, Math.ceil(limit / 3)),
        this.searchBlogPosts(normalizedQuery, Math.ceil(limit / 3))
      ]);

      // Combine and sort by relevance
      const allSuggestions = [...resources, ...bills, ...blogs];
      
      return allSuggestions
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);
    } catch (error) {
      console.error('Search suggestion error:', error);
      return this.getFallbackSuggestions(normalizedQuery, limit);
    }
  }

  // Full search across all data sources
  async fullSearch(query: string, options?: {
    page?: number;
    limit?: number;
    types?: ('resource' | 'bill' | 'blog')[];
  }): Promise<SearchResponse> {
    const normalizedQuery = query.toLowerCase().trim();
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    try {
      // Get counts for each type
      const [resourceCount, billCount, blogCount] = await Promise.all([
        this.getResourceCount(normalizedQuery),
        this.getBillCount(normalizedQuery),
        this.getBlogPostCount(normalizedQuery)
      ]);

      const totalCount = resourceCount + billCount + blogCount;
      
      // Get paginated results from requested types
      const types = options?.types || ['resource', 'bill', 'blog'];
      const promises = types.map(type => {
        switch (type) {
          case 'resource':
            return this.searchResources(normalizedQuery, limit, offset, true);
          case 'bill':
            return this.searchBills(normalizedQuery, limit, offset, true);
          case 'blog':
            return this.searchBlogPosts(normalizedQuery, limit, offset, true);
          default:
            return Promise.resolve([]);
        }
      });

      const resultsArrays = await Promise.all(promises);
      const allResults = resultsArrays.flat() as SearchResult[];
      
      // Sort by relevance and paginate
      const sortedResults = allResults.sort((a, b) => {
        // @ts-ignore - metadata exists
        const aScore = a.metadata?.relevance || 0;
        // @ts-ignore - metadata exists
        const bScore = b.metadata?.relevance || 0;
        return bScore - aScore;
      });

      const paginatedResults = sortedResults.slice(0, limit);
      
      // Get suggestions for the same query
      const suggestions = await this.getSuggestions(normalizedQuery, 5);

      return {
        suggestions,
        results: paginatedResults,
        total: totalCount,
        hasMore: offset + limit < totalCount
      };
    } catch (error) {
      console.error('Full search error:', error);
      return this.getFallbackSearch(normalizedQuery, page, limit);
    }
  }

  // Search resources from Supabase with fallback to mock data
  private async searchResources(
    query: string, 
    limit: number, 
    offset: number = 0,
    fullResults: boolean = false
  ): Promise<any[]> {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .range(offset, offset + limit - 1);

      if (!error && data && data.length > 0) {
        return data.map(resource => ({
          id: resource.id,
          title: resource.title,
          description: resource.description,
          type: 'resource' as const,
          category: resource.category,
          url: `/resources/${resource.id}`,
          ...(fullResults ? { 
            metadata: { ...resource, relevance: this.calculateRelevance(resource, query) }
          } : {
            relevance: this.calculateRelevance(resource, query)
          })
        }));
      }

      // Fallback to mock data
      return this.searchMockResources(query, limit, fullResults);
    } catch (error) {
      console.error('Resource search error:', error);
      return this.searchMockResources(query, limit, fullResults);
    }
  }

  private async getResourceCount(query: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);

      if (!error && count !== null) return count;
      
      // Fallback to mock data count
      const mockResources = await import('./mockData').then(m => m.mockResources || []);
      return mockResources.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.description.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
      ).length;
    } catch {
      return 0;
    }
  }

  // Search bills from Supabase
  private async searchBills(
    query: string, 
    limit: number, 
    offset: number = 0,
    fullResults: boolean = false
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .range(offset, offset + limit - 1);

      if (!error && data) {
        return data.map(bill => ({
          id: bill.id,
          title: bill.title,
          description: bill.summary || bill.description || '',
          type: 'bill' as const,
          category: bill.category,
          url: `/bills/${bill.id}`,
          date: bill.date,
          ...(fullResults ? { 
            metadata: { ...bill, relevance: this.calculateRelevance(bill, query) }
          } : {
            relevance: this.calculateRelevance(bill, query)
          })
        }));
      }
      return [];
    } catch (error) {
      console.error('Bill search error:', error);
      return [];
    }
  }

  private async getBillCount(query: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('bills')
        .select('*', { count: 'exact', head: true })
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%,description.ilike.%${query}%`);

      return error ? 0 : (count || 0);
    } catch {
      return 0;
    }
  }

  // Search blog posts from Supabase
  private async searchBlogPosts(
    query: string, 
    limit: number, 
    offset: number = 0,
    fullResults: boolean = false
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .range(offset, offset + limit - 1);

      if (!error && data) {
        return data.map(post => ({
          id: post.id,
          title: post.title,
          description: post.excerpt || post.content.substring(0, 150) + '...',
          type: 'blog' as const,
          url: `/blog/${post.slug || post.id}`,
          date: post.published_at,
          author: post.author,
          ...(fullResults ? { 
            metadata: { ...post, relevance: this.calculateRelevance(post, query) }
          } : {
            relevance: this.calculateRelevance(post, query)
          })
        }));
      }
      return [];
    } catch (error) {
      console.error('Blog search error:', error);
      return [];
    }
  }

  private async getBlogPostCount(query: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`);

      return error ? 0 : (count || 0);
    } catch {
      return 0;
    }
  }

  // Fallback to mock resources when Supabase fails
  private searchMockResources(query: string, limit: number, fullResults: boolean = false): any[] {
    const mockResources = [
      {
        id: "1",
        title: "Understanding the Kenyan Constitution",
        description: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
        type: "pdf",
        category: "Constitution",
        url: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/resource-files/The_Constitution_of_Kenya_2010.pdf",
        dateAdded: "2023-05-15",
        author: "Civic Education Kenya",
        views: 1245,
        downloads: 521,
        tags: ["constitution", "governance", "rights"],
        featured: true
      },
      {
        id: "2",
        title: "Blood Parliament: BBC Africa Eye Documentary",
        description: "How the Kenyan Government handled the Kenyan youth rising up against economic injustice",
        type: "video",
        category: "Governance",
        url: "https://5dorfxxwfijb.share.zrok.io/s/JHapaymSwTHKCi5",
        thumbnail: "/assets/video-thumbnail.jpg",
        dateAdded: "2023-06-22",
        author: "BBC Africa",
        views: 890,
        downloads: 152,
        tags: ["democracy", "protest", "youth", "politics"],
        featured: true
      },
      {
        id: "3",
        title: "Your Rights as a Kenyan Citizen",
        description: "Visual representation of fundamental rights guaranteed by the Constitution.",
        type: "image",
        category: "Rights",
        url: "/assets/rights-infographic.png",
        thumbnail: "/assets/rights-thumbnail.jpg",
        dateAdded: "2023-07-03",
        author: "Civic Education Kenya",
        views: 732,
        downloads: 198,
        tags: ["rights", "citizenship", "infographic"],
        featured: true
      },
      {
        id: "4",
        title: "The Legislative Process in Kenya",
        description: "A detailed explanation of how laws are made in Kenya, from drafting to presidential assent.",
        type: "pdf",
        category: "Lawmaking",
        url: "/documents/legislative-process.pdf",
        dateAdded: "2023-04-18",
        author: "Kenya Law Reform Commission",
        views: 612,
        downloads: 287,
        tags: ["lawmaking", "parliament", "bills", "legislation"]
      },
      {
        id: "5",
        title: "County Governments Explained",
        description: "Structure, functions, and responsibilities of county governments under devolution.",
        type: "video",
        category: "Devolution",
        url: "/videos/county-governments.mp4",
        dateAdded: "2023-08-09",
        author: "Council of Governors",
        views: 543,
        downloads: 122,
        tags: ["devolution", "counties", "governance", "local government"],
        county: "All Counties"
      },
      {
        id: "6",
        title: "How to Participate in Public Forums",
        description: "A citizen's guide to effective participation in public participation forums.",
        type: "pdf",
        category: "Public Participation",
        url: "/documents/public-participation.pdf",
        dateAdded: "2023-09-12",
        author: "Transparency International Kenya",
        views: 398,
        downloads: 203,
        tags: ["public participation", "citizen engagement", "democracy"]
      },
      {
        id: "7",
        title: "Understanding Tax Obligations",
        description: "A simple guide to understanding your tax obligations as a Kenyan citizen or business.",
        type: "pdf",
        category: "Taxation",
        url: "/documents/tax-guide.pdf",
        dateAdded: "2023-05-22",
        author: "Kenya Revenue Authority",
        views: 876,
        downloads: 342,
        tags: ["taxation", "finance", "compliance"]
      },
      {
        id: "8",
        title: "Elections in Kenya: Process and Procedures",
        description: "Comprehensive guide to electoral processes and procedures in Kenya.",
        type: "video",
        category: "Elections",
        url: "/videos/election-process.mp4",
        dateAdded: "2023-02-14",
        author: "Independent Electoral and Boundaries Commission",
        views: 1122,
        downloads: 276,
        tags: ["elections", "democracy", "voting", "IEBC"]
      },
      {
        id: "9",
        title: "Kenya's Foreign Policy Framework",
        description: "Overview of Kenya's foreign policy principles, objectives and implementation strategies.",
        type: "pdf",
        category: "Foreign Policy",
        url: "/documents/foreign-policy.pdf",
        dateAdded: "2023-07-18",
        author: "Ministry of Foreign Affairs",
        views: 321,
        downloads: 145,
        tags: ["foreign policy", "international relations", "diplomacy"]
      },
      {
        id: "10",
        title: "Understanding Land Rights in Kenya",
        description: "Guide to land ownership, registration, and dispute resolution in Kenya.",
        type: "pdf",
        category: "Land Rights",
        url: "/documents/land-rights.pdf",
        dateAdded: "2023-06-05",
        author: "Kenya Land Alliance",
        views: 892,
        downloads: 433,
        tags: ["land", "property", "rights", "ownership"]
      },
      {
        id: "11",
        title: "Kenya's National Values and Principles",
        description: "Visual guide to the national values and principles of governance in the Constitution.",
        type: "image",
        category: "National Values",
        url: "/images/national-values.png",
        dateAdded: "2023-08-24",
        author: "National Cohesion and Integration Commission",
        views: 456,
        downloads: 219,
        tags: ["values", "principles", "patriotism", "unity"]
      },
      {
        id: "12",
        title: "Introduction to Kenya's Judicial System",
        description: "Structure, functions, and processes of Kenya's judiciary system explained.",
        type: "video",
        category: "Judiciary",
        url: "/videos/judiciary-explainer.mp4",
        dateAdded: "2023-06-30",
        author: "Judiciary of Kenya",
        views: 678,
        downloads: 234,
        tags: ["judiciary", "courts", "justice", "legal system"]
      },
      {
        id: "13",
        title: "Climate Change Policies in Kenya",
        description: "Overview of Kenya's climate change policies, strategies, and action plans.",
        type: "pdf",
        category: "Environment",
        url: "/documents/climate-policies.pdf",
        dateAdded: "2023-04-22",
        author: "Ministry of Environment and Forestry",
        views: 412,
        downloads: 189,
        tags: ["climate change", "environment", "policy", "sustainability"]
      },
      {
        id: "14",
        title: "Women's Political Representation in Kenya",
        description: "Analysis of women's representation in political and decision-making processes in Kenya.",
        type: "pdf",
        category: "Gender & Inclusion",
        url: "/documents/women-representation.pdf",
        dateAdded: "2023-03-08",
        author: "UN Women Kenya",
        views: 532,
        downloads: 267,
        tags: ["gender", "women", "representation", "politics"]
      },
      {
        id: "15",
        title: "Youth Participation in Governance",
        description: "Guide to opportunities and challenges for youth participation in governance.",
        type: "video",
        category: "Youth",
        url: "/videos/youth-governance.mp4",
        dateAdded: "2023-07-29",
        author: "Youth Senate Kenya",
        views: 789,
        downloads: 312,
        tags: ["youth", "governance", "participation", "empowerment"]
      }
    ];

    const filtered = mockResources.filter(resource => 
      resource.title.toLowerCase().includes(query) || 
      resource.description.toLowerCase().includes(query) ||
      resource.category.toLowerCase().includes(query) ||
      (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(query)))
    ).slice(0, limit);

    return filtered.map(resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: 'resource' as const,
      category: resource.category,
      url: `/resources/${resource.id}`,
      ...(fullResults ? { 
        metadata: { ...resource, relevance: this.calculateRelevance(resource, query) }
      } : {
        relevance: this.calculateRelevance(resource, query)
      })
    }));
  }

  // Fallback methods
  private getFallbackSuggestions(query: string, limit: number): SearchSuggestion[] {
    const commonSearches = [
      { id: '1', title: 'Kenyan Constitution', type: 'resource' as const, category: 'Constitution', relevance: 0.9 },
      { id: '2', title: 'Voting Process', type: 'resource' as const, category: 'Elections', relevance: 0.8 },
      { id: '3', title: 'County Governments', type: 'resource' as const, category: 'Devolution', relevance: 0.7 },
      { id: '4', title: 'Public Participation', type: 'blog' as const, category: 'Governance', relevance: 0.6 },
      { id: '5', title: 'Tax Obligations', type: 'resource' as const, category: 'Taxation', relevance: 0.5 },
    ];

    return commonSearches
      .filter(item => item.title.toLowerCase().includes(query))
      .slice(0, limit);
  }

  private getFallbackSearch(query: string, page: number, limit: number): SearchResponse {
    const suggestions = this.getFallbackSuggestions(query, 5);
    const mockResults = this.searchMockResources(query, limit, true);
    
    return {
      suggestions,
      results: mockResults,
      total: mockResults.length,
      hasMore: false
    };
  }

  // Calculate relevance score (simple implementation)
  private calculateRelevance(item: any, query: string): number {
    const titleMatch = item.title?.toLowerCase().includes(query) ? 0.5 : 0;
    const descriptionMatch = item.description?.toLowerCase().includes(query) ? 0.3 : 0;
    const categoryMatch = item.category?.toLowerCase().includes(query) ? 0.2 : 0;
    
    return titleMatch + descriptionMatch + categoryMatch;
  }

  // Debounced search for real-time suggestions
  debouncedSearch(query: string, callback: (suggestions: SearchSuggestion[]) => void, delay: number = 300) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      const suggestions = await this.getSuggestions(query);
      callback(suggestions);
    }, delay);
  }
}

export const searchService = SearchService.getInstance();
