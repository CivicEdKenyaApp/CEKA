import { useState, useEffect, useCallback } from 'react';
import { searchService, SearchSuggestion, SearchResult } from '@/lib/searchService';
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
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Real-time suggestions with debouncing
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new debounced search
    const timer = setTimeout(async () => {
      try {
        const newSuggestions = await searchService.getSuggestions(query, limit);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceDelay);
    
    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [query, debounceDelay, limit]);

  // Perform full search
  const performSearch = useCallback(async (searchQuery: string, page: number = 1, types?: ('resource' | 'bill' | 'blog')[]) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchService.searchAll(searchQuery, limit);
      
      // Filter by types if specified
      const filteredResults = types 
        ? searchResults.filter(r => types.includes(r.type as 'resource' | 'bill' | 'blog'))
        : searchResults;

      setResults(filteredResults);
      setTotal(filteredResults.length);
      setHasMore(false); // searchAll returns limited results
      
      // Update suggestions based on full search
      if (filteredResults.length > 0) {
        const newSuggestions = filteredResults.map(r => ({
          id: r.id,
          title: r.title,
          type: r.type,
          category: r.category
        }));
        setSuggestions(newSuggestions);
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
  }, [toast, limit]);

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
