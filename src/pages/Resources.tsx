
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ResourceTypeFilter from '@/components/resources/ResourceTypeFilter';
import ResourceCard from '@/components/resources/ResourceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, BookOpen, FileText, Video, Image } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  url: string;
  is_downloadable: boolean;
  created_at: string;
  updated_at: string;
  uploadedBy?: string;
  thumbnail_url?: string;
  user_id?: string;
}

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);

  // Get filter parameters from URL
  const categoryFilter = searchParams.get('category');
  const typeFilter = searchParams.get('type');
  const searchQuery = searchParams.get('search');

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'document':
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'infographic':
      case 'image':
        return <Image className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply category filter if specified
      if (categoryFilter) {
        query = query.ilike('category', `%${categoryFilter}%`);
      }

      // Apply type filter if specified
      if (typeFilter) {
        query = query.ilike('type', `%${typeFilter}%`);
      }

      // Apply search filter if specified
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching resources:', error);
        toast({
          title: "Error",
          description: "Failed to load resources. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [categoryFilter, typeFilter, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Filter resources based on local search term
    if (!searchTerm.trim()) {
      setFilteredResources(resources);
    } else {
      const filtered = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResources(filtered);
    }
  }, [resources, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchTerm('');
  };

  const hasActiveFilters = categoryFilter || typeFilter || searchQuery;

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Civic Education Resources</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access a comprehensive collection of educational materials, documents, and tools 
              to enhance your understanding of Kenya's civic processes and governance.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-6 mb-8">
            {/* Search Bar */}
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search resources by title, description, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" className="bg-kenya-green hover:bg-kenya-green/90">
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Filters */}
            <ResourceTypeFilter />

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active filters:</span>
                
                {categoryFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {categoryFilter}
                  </Badge>
                )}
                
                {typeFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {typeFilter}
                  </Badge>
                )}
                
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-xs h-6"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {loading 
                ? "Loading resources..." 
                : `Showing ${filteredResources.length} resource${filteredResources.length !== 1 ? 's' : ''}`
              }
              {hasActiveFilters && " matching your filters"}
            </p>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full mb-4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters or search terms." 
                  : "We're working on adding more resources. Check back soon!"
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  id={resource.id}
                  title={resource.title}
                  description={resource.description}
                  type={resource.type}
                  category={resource.category}
                  url={resource.url}
                  is_downloadable={resource.is_downloadable}
                  created_at={resource.created_at}
                  updated_at={resource.updated_at}
                  uploadedBy={resource.uploadedBy}
                  thumbnail_url={resource.thumbnail_url}
                  onClick={() => navigate(`/resources/${resource.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Resources;
