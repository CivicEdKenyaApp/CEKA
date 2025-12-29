// src/pages/SearchResults.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, SlidersHorizontal, FileText, Book, Gavel, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { searchService, SearchResult } from '@/services/searchService';
import { Skeleton } from '@/components/ui/skeleton';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [activeTab, setActiveTab] = useState('all');
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setFilteredResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchService.searchAll(query);
        setResults(searchResults);
        setFilteredResults(searchResults);
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
        setFilteredResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredResults(results);
    } else {
      setFilteredResults(results.filter(result => result.type === activeTab));
    }
  }, [activeTab, results]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchTerm.trim())}`);
      window.location.reload();
    }
  };

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'resource': return 'Resource';
      case 'blog': return 'Blog Post';
      case 'bill': return 'Legislative Bill';
      case 'discussion': return 'Discussion';
      case 'campaign': return 'Campaign';
      default: return type;
    }
  };

  const renderResultCard = (result: SearchResult) => (
    <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link to={result.url} className="hover:underline">
              <CardTitle className="text-lg leading-tight line-clamp-2">{result.title}</CardTitle>
            </Link>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={getTypeColor(result.type)}>
                <div className="flex items-center gap-1">
                  {getTypeIcon(result.type)}
                  {getTypeLabel(result.type)}
                </div>
              </Badge>
              {result.category && (
                <Badge variant="secondary" className="text-xs">
                  {result.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-3">{result.description}</p>
        {result.date && (
          <div className="mt-3 text-xs text-muted-foreground">
            {new Date(result.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        )}
        <div className="mt-4">
          <Button size="sm" variant="outline" asChild>
            <Link to={result.url}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="p-6 border rounded-lg">
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between items-center pt-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-2">{translate("Search Results", language)}</h1>
        <p className="text-muted-foreground mb-6">
          {query ? (
            translate(`Showing results for: "${query}"`, language)
          ) : (
            translate("Search for resources, discussions, and campaigns", language)
          )}
        </p>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative max-w-lg mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={translate("Search...", language)}
                className="pl-9"
              />
            </div>
            <Button type="submit">{translate("Search", language)}</Button>
            <Button type="button" variant="outline" className="px-3">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">Filters</span>
            </Button>
          </div>
        </form>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">{translate("All Results", language)} ({results.length})</TabsTrigger>
            <TabsTrigger value="resource">{translate("Resources", language)} ({results.filter(r => r.type === 'resource').length})</TabsTrigger>
            <TabsTrigger value="bill">{translate("Bills", language)} ({results.filter(r => r.type === 'bill').length})</TabsTrigger>
            <TabsTrigger value="blog">{translate("Blog", language)} ({results.filter(r => r.type === 'blog').length})</TabsTrigger>
            <TabsTrigger value="discussion">{translate("Discussions", language)} ({results.filter(r => r.type === 'discussion').length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              renderSkeleton()
            ) : filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredResults.map(result => renderResultCard(result))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No results found for "{query}"</h3>
                <p className="text-muted-foreground mt-2">Try searching with different keywords</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resource" className="space-y-6">
            {isLoading ? (
              renderSkeleton()
            ) : filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map(result => renderResultCard(result))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No resources found for "{query}"</h3>
                <p className="text-muted-foreground mt-2">Try searching with different keywords</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bill" className="space-y-6">
            {isLoading ? (
              renderSkeleton()
            ) : filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map(result => renderResultCard(result))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No bills found for "{query}"</h3>
                <p className="text-muted-foreground mt-2">Try searching with different keywords</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="blog" className="space-y-6">
            {isLoading ? (
              renderSkeleton()
            ) : filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map(result => renderResultCard(result))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No blog posts found for "{query}"</h3>
                <p className="text-muted-foreground mt-2">Try searching with different keywords</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="discussion" className="space-y-6">
            {isLoading ? (
              renderSkeleton()
            ) : filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map(result => renderResultCard(result))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No discussions found for "{query}"</h3>
                <p className="text-muted-foreground mt-2">Try searching with different keywords</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SearchResults;
