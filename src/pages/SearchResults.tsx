// src/pages/SearchResults.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, SlidersHorizontal, FileText, Book, Gavel, MessageSquare, TrendingUp, Calendar, ArrowUpDown, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { searchService, SearchResult } from '@/lib/searchService';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [activeTab, setActiveTab] = useState('all');
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'relevance' | 'date-desc' | 'date-asc' | 'alpha'>('relevance');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['resource', 'bill', 'blog', 'discussion']);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);;

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

  // Apply filters to results
  const applyFilters = (baseResults: SearchResult[]) => {
    let filtered = [...baseResults];

    // Filter by selected types
    if (selectedTypes.length < 4) {
      filtered = filtered.filter(r => selectedTypes.includes(r.type));
    }

    // Filter by date range
    if (dateRange !== 'all' && filtered.length > 0) {
      const now = new Date();
      const cutoff = new Date();
      if (dateRange === 'week') cutoff.setDate(now.getDate() - 7);
      else if (dateRange === 'month') cutoff.setMonth(now.getMonth() - 1);
      else if (dateRange === 'year') cutoff.setFullYear(now.getFullYear() - 1);

      filtered = filtered.filter(r => r.date && new Date(r.date) >= cutoff);
    }

    // Sort
    if (sortOrder === 'date-desc') {
      filtered.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    } else if (sortOrder === 'date-asc') {
      filtered.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
    } else if (sortOrder === 'alpha') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  };

  useEffect(() => {
    const hasFilters = sortOrder !== 'relevance' || dateRange !== 'all' || selectedTypes.length < 4;
    setHasActiveFilters(hasFilters);

    let baseResults = results;
    if (activeTab !== 'all') {
      baseResults = results.filter(result => result.type === activeTab);
    }
    setFilteredResults(applyFilters(baseResults));
  }, [activeTab, results, sortOrder, dateRange, selectedTypes]);

  const clearFilters = () => {
    setSortOrder('relevance');
    setDateRange('all');
    setSelectedTypes(['resource', 'bill', 'blog', 'discussion']);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
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
                id="search-query"
                name="q"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={translate("Search...", language)}
                className="pl-9"
              />
            </div>
            <Button type="submit">{translate("Search", language)}</Button>
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="px-3 relative">
                  <SlidersHorizontal className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-kenya-green rounded-full" />
                  )}
                  <span className="sr-only">Filters</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs">
                        <X className="h-3 w-3 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                  <Separator />

                  {/* Content Types */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Content Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['resource', 'bill', 'blog', 'discussion'].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={() => toggleType(type)}
                          />
                          <label htmlFor={`type-${type}`} className="text-sm capitalize cursor-pointer">
                            {type === 'bill' ? 'Bills' : type + 's'}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Date Range</Label>
                    <Select name="date_range" value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                      <SelectTrigger id="date_range" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="week">Past Week</SelectItem>
                        <SelectItem value="month">Past Month</SelectItem>
                        <SelectItem value="year">Past Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Sort By</Label>
                    <Select name="sort_order" value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                      <SelectTrigger id="sort_order" className="w-full">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sort order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Most Relevant</SelectItem>
                        <SelectItem value="date-desc">Newest First</SelectItem>
                        <SelectItem value="date-asc">Oldest First</SelectItem>
                        <SelectItem value="alpha">Alphabetical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={() => setFilterOpen(false)} className="w-full bg-kenya-green hover:bg-kenya-green/90">
                    Apply Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
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
