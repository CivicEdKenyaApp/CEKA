// src/components/search/SearchSuggestion.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, FileText, Book, Gavel, MessageSquare, TrendingUp, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { searchService, SearchSuggestion as SearchSuggestionType } from '@/services/searchService';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

interface SearchSuggestionProps {
  isMobile?: boolean;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  initialQuery?: string;
  className?: string;
}

const SearchSuggestion: React.FC<SearchSuggestionProps> = ({
  isMobile = false,
  onSearch,
  autoFocus = false,
  initialQuery = '',
  className = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestionType[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigate = useNavigate();
  const { language } = useLanguage();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resource':
        return <FileText className="h-4 w-4" />;
      case 'blog':
        return <Book className="h-4 w-4" />;
      case 'bill':
        return <Gavel className="h-4 w-4" />;
      case 'discussion':
        return <MessageSquare className="h-4 w-4" />;
      case 'campaign':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'resource':
        return 'bg-blue-500/10 text-blue-600';
      case 'blog':
        return 'bg-green-500/10 text-green-600';
      case 'bill':
        return 'bg-purple-500/10 text-purple-600';
      case 'discussion':
        return 'bg-amber-500/10 text-amber-600';
      case 'campaign':
        return 'bg-rose-500/10 text-rose-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  useEffect(() => {
    searchService.getPopularSearches().then(setPopularSearches);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchService.getSuggestions(debouncedQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      if (onSearch) {
        onSearch(trimmedQuery);
      } else {
        navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      }
      setShowSuggestions(false);
    }
  }, [query, navigate, onSearch]);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestionType) => {
    navigate(`/search?q=${encodeURIComponent(suggestion.title)}`);
    setShowSuggestions(false);
  }, [navigate]);

  const handlePopularSearchClick = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setShowSuggestions(false);
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  const handleInputFocus = useCallback(() => {
    if (query.trim() || popularSearches.length > 0) {
      setShowSuggestions(true);
    }
  }, [query, popularSearches.length]);

  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => {
      if (!e.relatedTarget?.closest?.('.search-suggestions')) {
        setShowSuggestions(false);
      }
    }, 200);
  }, []);

  const animationVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={translate("Search resources, bills, blog posts...", language)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={`w-full pl-9 pr-10 ${isMobile ? 'py-4 text-base' : 'py-3'} bg-background/80 backdrop-blur-sm border-border/50`}
            autoFocus={autoFocus}
            aria-label="Search input"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        
        {!isMobile && (
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground px-1">
            <span>Press Enter to search</span>
            <span>Esc to close</span>
          </div>
        )}
      </form>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={animationVariants}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-ios-high z-50 overflow-hidden search-suggestions"
          >
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto green-scrollbar">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Search Suggestions
                  </div>
                  {suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.type}-${suggestion.id}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center space-x-3 group"
                    >
                      <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {suggestion.title}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <span className="flex items-center gap-1">
                              {getTypeIcon(suggestion.type)}
                              {suggestion.type}
                            </span>
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">
                            {suggestion.category}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : query.trim() ? (
              <div className="p-6 text-center">
                <div className="text-muted-foreground mb-2">
                  No suggestions found for "{query}"
                </div>
                <Button variant="outline" size="sm" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}>
                  Search anyway
                </Button>
              </div>
            ) : popularSearches.length > 0 && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Popular Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handlePopularSearchClick(term)}
                      className="px-3 py-1.5 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-all duration-200 flex items-center space-x-1"
                    >
                      <Clock className="h-3 w-3" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t border-border/30 p-3">
              <div className="text-xs text-muted-foreground">
                Search across: Resources, Bills, Blog Posts, Discussions
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchSuggestion;
