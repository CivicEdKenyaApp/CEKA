import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, SlidersHorizontal, FileText, Book, Scale, ChevronRight, Calendar, User } from 'lucide-react';
import ResourceCard from '@/components/resources/ResourceCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const { language } = useLanguage();

  const {
    query: searchQuery,
    setQuery,
    results,
    isLoading,
    total,
    hasMore,
    performSearch,
    clearSearch,
    suggestions
  } = useSearch({
    initialQuery: query,
    limit: 20
  });

  useEffect(() => {
    if (query) {
      setQuery(query);
      performSearch(query, 1);
    }
  }, [query, performSearch, setQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch(searchQuery.trim(), 1);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(searchQuery, nextPage);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const types = tab === 'all' ? undefined : [tab as 'resource' | 'bill' | 'blog'];
    performSearch(searchQuery, 1, types);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resource':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'bill':
        return <Scale className="h-4 w-4 mr-2" />;
      case 'blog':
        return <Book className="h-4 w-4 mr-2" />;
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  const renderResultItem = (result: any) => {
    return (
      <motion.div
        key={`${result.type}-${result.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card rounded-xl border hover:border-primary/50 transition-all duration-200 hover:shadow-md overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getTypeIcon(result.type)}
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                </Badge>
                {result.category && (
                  <Badge variant="secondary" className="text-xs">
                    {result.category}
                  </Badge>
                )}
              </div>
              
              <Link to={result.url} className="group">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {result.title}
                </h3>
              </Link>
              
              <p className="text-muted-foreground mb-3 line-clamp-2">
                {result.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {result.date && (
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(result.date).toLocaleDateString()}
                  </div>
                )}
                {result.author && (
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {result.author}
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="ml-2 flex-shrink-0"
            >
              <Link to={result.url}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Filter results by type for tabs
  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(r => r.type === activeTab);

  const resourceResults = results.filter(r => r.type === 'resource');
  const billResults = results.filter(r => r.type === 'bill');
  const blogResults = results.filter(r => r.type === 'blog');

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{translate("Search Results", language)}</h1>
            <p className="text-muted-foreground">
              {query ? (
                translate(`Showing ${total} results for: "${query}"`, language)
              ) : (
                translate("Search for resources, bills, and blog posts", language)
              )}
            </p>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={translate("Search resources, bills, blogs...", language)}
                  className="pl-10 py-6 text-base rounded-2xl"
                />
                
                {/* Quick suggestions dropdown */}
                <AnimatePresence>
                  {suggestions.length > 0 && searchQuery.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-ios-high z-50 overflow-hidden"
                    >
                      <div className="p-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                          Quick Suggestions
                        </div>
                        {suggestions.slice(0, 5).map((suggestion) => (
                          <button
                            key={`${suggestion.type}-${suggestion.id}`}
                            onClick={() => {
                              setQuery(suggestion.title);
                              performSearch(suggestion.title, 1);
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center">
                              {getTypeIcon(suggestion.type)}
                              <span className="font-medium">{suggestion.title}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="px-8 rounded-2xl"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : translate("Search", language)}
              </Button>
            </div>
          </form>
          
          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6 bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-1">
              <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {translate("All Results", language)} ({total})
              </TabsTrigger>
              <TabsTrigger value="resource" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {translate("Resources", language)} ({resourceResults.length})
              </TabsTrigger>
              <TabsTrigger value="bill" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {translate("Bills", language)} ({billResults.length})
              </TabsTrigger>
              <TabsTrigger value="blog" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {translate("Blog Posts", language)} ({blogResults.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                  ))}
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="space-y-4">
                  {filteredResults.map(renderResultItem)}
                  
                  {hasMore && (
                    <div className="flex justify-center pt-6">
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        size="lg"
                        className="rounded-2xl"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Load More Results"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Search className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or browse by category
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Constitution', 'Elections', 'Governance', 'Rights'].map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        onClick={() => {
                          setQuery(term);
                          performSearch(term, 1);
                        }}
                        className="rounded-xl"
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            {['resource', 'bill', 'blog'].map((type) => (
              <TabsContent key={type} value={type} className="mt-0">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResults.map(renderResultItem)}
                    
                    {hasMore && (
                      <div className="flex justify-center pt-6">
                        <Button
                          onClick={handleLoadMore}
                          variant="outline"
                          size="lg"
                          className="rounded-2xl"
                          disabled={isLoading}
                        >
                          {isLoading ? "Loading..." : "Load More Results"}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                      {getTypeIcon(type)}
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No {type === 'resource' ? 'resources' : type === 'bill' ? 'bills' : 'blog posts'} found
                    </h3>
                    <p className="text-muted-foreground">
                      Try searching in all categories or use different keywords
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SearchResults;
