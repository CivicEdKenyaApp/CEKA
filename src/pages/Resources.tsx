
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Download, ExternalLink, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

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
  uploadedBy: string;
  downloadUrl?: string;
  videoUrl?: string;
  thumbnail_url?: string;
  user_id?: string;
}

const Resources = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Parse URL params on mount and when they change
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const typeParam = searchParams.get('type');
    
    // Handle direct category queries like ?infographic
    const directCategory = Array.from(searchParams.keys()).find(key => 
      !searchParams.get(key) && ['infographic', 'document', 'video', 'constitution', 'governance', 'rights'].includes(key.toLowerCase())
    );
    
    if (directCategory) {
      setSelectedType(directCategory.toLowerCase());
      setSelectedCategory(directCategory.toLowerCase());
    } else if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
    } else if (typeParam) {
      setSelectedType(typeParam.toLowerCase());
    }
  }, [searchParams]);

  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ['resources', selectedType, selectedCategory, searchTerm],
    queryFn: async () => {
      let query = supabase.from('resources').select('*');

      // Apply filters
      if (selectedType !== 'all') {
        query = query.ilike('type', `%${selectedType}%`);
      }
      
      if (selectedCategory !== 'all') {
        query = query.ilike('category', `%${selectedCategory}%`);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching resources:', error);
        throw error;
      }

      return data || [];
    },
  });

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (type === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', type);
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const handleResourceClick = (resource: Resource) => {
    console.log('Resource clicked:', resource);
    
    // Generate proper public URL for resources
    let viewUrl = resource.url;
    
    // Fix malformed URLs and ensure proper public access
    if (viewUrl.includes('supabase.co/storage/v1/object/public/')) {
      // It's already a public URL, clean it up
      viewUrl = viewUrl.split('?')[0]; // Remove any query parameters
    } else if (viewUrl.includes('supabase.co/storage/v1/object/')) {
      // Convert to public URL
      const pathPart = viewUrl.split('/object/')[1];
      if (pathPart) {
        viewUrl = `https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/${pathPart}`;
      }
    }

    // Track view
    if (resource.id) {
      supabase.rpc('track_resource_view', {
        p_resource_id: resource.id,
        p_resource_type: resource.type || 'unknown'
      }).then(() => {
        console.log('View tracked successfully');
      }).catch(err => {
        console.warn('Failed to track view:', err);
      });
    }

    // Open based on type
    if (resource.type?.toLowerCase() === 'video' && resource.videoUrl) {
      window.open(resource.videoUrl, '_blank', 'noopener,noreferrer');
    } else {
      // For documents and other resources, try to open in new tab
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = async (resource: Resource, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!resource.is_downloadable) {
      return;
    }

    let downloadUrl = resource.downloadUrl || resource.url;
    
    // Clean up download URL
    if (downloadUrl.includes('?download?=1')) {
      downloadUrl = downloadUrl.replace('?download?=1', '?download=true');
    }
    if (downloadUrl.includes('?download=true\n')) {
      downloadUrl = downloadUrl.replace('?download=true\n', '?download=true');
    }
    
    // Ensure proper public URL format
    if (downloadUrl.includes('supabase.co/storage/v1/object/') && !downloadUrl.includes('/public/')) {
      const pathPart = downloadUrl.split('/object/')[1];
      if (pathPart) {
        downloadUrl = `https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/${pathPart.split('?')[0]}?download=true`;
      }
    }

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = resource.title || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const resourceTypes = Array.from(new Set(resources.map(r => r.type?.toLowerCase() || 'other')));
  const resourceCategories = Array.from(new Set(resources.map(r => r.category?.toLowerCase() || 'other')));

  if (error) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            {translate("Error Loading Resources", language)}
          </h2>
          <p className="text-muted-foreground">
            {translate("Failed to load resources. Please try again later.", language)}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {translate("Resource Library", language)}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {translate("Access comprehensive civic education materials, documents, and learning resources.", language)}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={translate("Search resources...", language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{translate("Filter by:", language)}</span>
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              <option value="all">{translate("All Types", language)}</option>
              {resourceTypes.map(type => (
                <option key={type} value={type}>
                  {translate(type.charAt(0).toUpperCase() + type.slice(1), language)}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              <option value="all">{translate("All Categories", language)}</option>
              {resourceCategories.map(category => (
                <option key={category} value={category}>
                  {translate(category.charAt(0).toUpperCase() + category.slice(1), language)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold mb-2">
              {translate("No resources found", language)}
            </h3>
            <p className="text-muted-foreground">
              {translate("Try adjusting your filters or search terms.", language)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Card 
                key={resource.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => handleResourceClick(resource)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {resource.description}
                      </p>
                    </div>
                    {resource.thumbnail_url && (
                      <img 
                        src={resource.thumbnail_url} 
                        alt={resource.title}
                        className="w-16 h-16 object-cover rounded ml-4"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span className="bg-muted px-2 py-1 rounded">
                      {resource.type}
                    </span>
                    <span className="bg-muted px-2 py-1 rounded">
                      {resource.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResourceClick(resource);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {translate("View", language)}
                    </Button>

                    {resource.is_downloadable && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => handleDownload(resource, e)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {translate("Download", language)}
                      </Button>
                    )}

                    {resource.videoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(resource.videoUrl, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    {translate("By", language)} {resource.uploadedBy} • {new Date(resource.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Resources;
