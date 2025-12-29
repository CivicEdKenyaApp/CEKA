import { useState, useEffect, useCallback } from 'react';
import { searchService, SearchSuggestion, SearchResult, SearchResponse } from '@/lib/searchService';
import { useToast } from '@/components/ui/use-toast';

interface UseSearchOptions {
  debounceDelay?: number;
  initialQuery?: string;
  limit?: number;
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceDelay = 300, initialQuery = '', limit = 8 } = options;
  const { toast } = useToast();
  
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Real-time suggestions with debouncing [citation:7]
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    searchService.debouncedSearch(query, (newSuggestions) => {
      setSuggestions(newSuggestions);
      setIsLoading(false);
    }, debounceDelay);

    return () => {
      // Cleanup if component unmounts
      setSuggestions([]);
    };
  }, [query, debounceDelay]);

  // Perform full search
  const performSearch = useCallback(async (searchQuery: string, page: number = 1, types?: ('resource' | 'bill' | 'blog')[]) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setIsLoading(true);
    try {
      const response: SearchResponse = await searchService.fullSearch(searchQuery, {
        page,
        limit: 20,
        types
      });

      setResults(response.results);
      setTotal(response.total);
      setHasMore(response.hasMore);
      
      // Update suggestions based on full search
      if (response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Unable to perform search. Please try again.",
        variant: "destructive",
      });
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
    setTotal(0);
    setIsLoading(false);
  }, []);

  // Get suggestion groups by type
  const getGroupedSuggestions = useCallback(() => {
    const groups: Record<string, SearchSuggestion[]> = {
      resources: [],
      bills: [],
      blogs: []
    };

    suggestions.forEach(suggestion => {
      switch (suggestion.type) {
        case 'resource':
          groups.resources.push(suggestion);
          break;
        case 'bill':
          groups.bills.push(suggestion);
          break;
        case 'blog':
          groups.blogs.push(suggestion);
          break;
      }
    });

    return groups;
  }, [suggestions]);

  return {
    query,
    setQuery,
    suggestions,
    results,
    isLoading,
    total,
    hasMore,
    performSearch,
    clearSearch,
    getGroupedSuggestions
  };
}
