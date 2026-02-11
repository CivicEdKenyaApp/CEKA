// src/pages/ResourceLibrary.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Filter,
  ChevronDown, X, SortAsc, SortDesc, List, Grid3X3, Plus, RefreshCw, BookOpen
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { notificationService } from '@/services/notificationService';
import { translate, cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { placeholderService } from '@/services/placeholderService';
import ResourceCard from '@/components/resources/ResourceCard';

interface Resource {
  id: string;
  title: string;
  description: string;
  summary?: string;
  provider?: string;
  type: 'pdf' | 'video' | 'image' | 'audio' | 'link' | 'document' | 'legal';
  category: string;
  url: string;
  thumbnail?: string;
  dateAdded: string;
  author?: string;
  views: number;
  downloads: number;
  tags: string[];
  featured?: boolean;
  county?: string;
  canDownload?: boolean;
}

const ResourceLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const { language } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'alphabetical'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [dynamicThumbnails, setDynamicThumbnails] = useState<Record<string, string>>({});

  // Load resources from Supabase with debounced search and filters
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('resources' as any)
          .select('*');

        // We fetch all to handle complex local filtering for tags/metadata
        // but sorting is done on server where possible
        if (sortBy === 'date') {
          query = query.order('created_at', { ascending: sortDirection === 'asc' });
        } else if (sortBy === 'alphabetical') {
          query = query.order('title', { ascending: sortDirection === 'asc' });
        }

        const { data, error } = await query;

        if (error) throw error;

        const mappedResources: Resource[] = (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || item.summary || '',
          type: (item.type || 'link').toLowerCase() as any,
          category: item.category || 'General',
          url: item.url,
          thumbnail: item.thumbnail_url,
          dateAdded: new Date(item.created_at).toISOString().split('T')[0],
          author: item.provider || 'Civic Education Kenya',
          views: item.views || 0,
          downloads: item.downloads || 0,
          tags: item.tags || [],
          featured: item.is_featured || false,
          canDownload: item.is_downloadable !== false,
          summary: item.summary,
          provider: item.provider
        }));

        setResources(mappedResources);

        // Derive categories and providers
        const uniqueCats = Array.from(new Set(mappedResources.map(r => r.category)));
        setCategories(uniqueCats);
      } catch (error) {
        console.error('Error loading resources:', error);
        toast({
          title: "Connection Error",
          description: "Could not synchronize with the resource vault.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResources, 400);
    return () => clearTimeout(debounceTimer);
  }, [sortBy, sortDirection, toast, activeCategory]); // Added activeCategory to trigger refresh if needed, although local filtering is active. 
  // Actually, keeping it local is better for performance. But we need to ensure uniqueCats are set correctly.

  // Handle auto-thumbnail generation for videos/media
  useEffect(() => {
    const generateNeededThumbnails = async () => {
      const needed = resources.filter(r => !r.thumbnail && r.type === 'video');
      for (const res of needed) {
        if (dynamicThumbnails[res.id]) continue;
        const thumb = await notificationService.getAutoThumbnail(res.url, res.type);
        if (thumb) {
          setDynamicThumbnails(prev => ({ ...prev, [res.id]: thumb }));
        }
      }
    };
    if (resources.length > 0) generateNeededThumbnails();
  }, [resources]);

  // No longer fetching from dedicated table to ensure consistency with scraped data categories
  /* 
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('resource_categories' as any).select('name');
      if (data) setCategories((data as any[]).map(c => c.name));
    };
    fetchCategories();
  }, []);
  */

  const allResources = resources;

  const allCategories = Array.from(new Set(allResources.map(resource => resource.category)));
  const allTypes = Array.from(new Set(allResources.map(resource => resource.type)));

  // Filter and sort resources based on current state
  const filteredResources = useMemo(() => {
    let filtered = [...resources];

    // Apply search term filter (Case-insensitive, checks multiple fields)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const terms = term.split(' ').filter(t => t.length > 0);

      filtered = filtered.filter(resource => {
        const title = (resource.title || '').toLowerCase();
        const desc = (resource.description || '').toLowerCase();
        const category = (resource.category || '').toLowerCase();
        const tags = (resource.tags || []).map(t => t.toLowerCase());

        // Match if ANY search word is found in ANY field (Less restrictive, better UX)
        return terms.some(word =>
          title.includes(word) ||
          desc.includes(word) ||
          category.includes(word) ||
          tags.some(t => t.includes(word))
        );
      });
    }

    // Apply category filter (Sync with activeCategory)
    if (activeCategory !== 'All') {
      filtered = filtered.filter(resource => resource.category === activeCategory);
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(resource => selectedTypes.includes(resource.type));
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.dateAdded).getTime();
        const dateB = new Date(b.dateAdded).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'popularity') {
        const aPopularity = (a.views || 0) + (a.downloads || 0);
        const bPopularity = (b.views || 0) + (b.downloads || 0);
        return sortDirection === 'asc' ? aPopularity - bPopularity : bPopularity - aPopularity;
      } else { // alphabetical
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
  }, [resources, searchTerm, activeCategory, selectedTypes, sortBy, sortDirection]);

  // Group resources by category for the tabbed interface
  const resourcesByCategory = useMemo(() => {
    const grouped: Record<string, Resource[]> = {};
    allCategories.forEach(category => {
      grouped[category] = filteredResources.filter(resource => resource.category === category);
    });
    return grouped;
  }, [filteredResources, allCategories]);

  // Function to toggle resource selection
  const toggleResourceSelection = (resourceId: string) => {
    if (selectedResources.includes(resourceId)) {
      setSelectedResources(selectedResources.filter(id => id !== resourceId));
    } else {
      setSelectedResources([...selectedResources, resourceId]);
    }
  };

  // Function to download selected resources
  const downloadSelectedResources = () => {
    if (selectedResources.length === 0) {
      toast({
        description: "Please select resources to download.",
        variant: "destructive",
      });
      return;
    }

    if (!session) {
      toast({
        title: "Login Required",
        description: "Please sign in to download resources.",
      });
      navigate('/auth');
      return;
    }

    toast({
      title: "Download Started",
      description: `Downloading ${selectedResources.length} resources.`,
    });

    console.log("Downloading resources:", selectedResources);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSortBy('date');
    setSortDirection('desc');
  };

  // Render resource card using the shared ResourceCard component
  const renderResourceCard = (resource: any) => {
    return (
      <ResourceCard
        key={resource.id}
        variant={viewMode as any}
        resource={{
          ...resource,
          isSelected: selectedResources.includes(resource.id)
        }}
        onToggleSelect={() => toggleResourceSelection(resource.id)}
      />
    );
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col gap-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                {translate("Resource Vault", language)}
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {translate("Access the repository of civic knowledge and national protocols", language)}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-muted/20 p-1 rounded-2xl backdrop-blur-md">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-xl px-4 gap-2 font-bold group">
                    <Filter className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
                    Sort
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 p-2 rounded-[24px] glass-card border-none shadow-2xl">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-2">Sort By</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortBy('date')} className="rounded-xl p-3 cursor-pointer">Latest Arrivals</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('popularity')} className="rounded-xl p-3 cursor-pointer">Most Popular</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('alphabetical')} className="rounded-xl p-3 cursor-pointer">Alphabetical</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-2">Direction</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortDirection('desc')} className="rounded-xl p-3 cursor-pointer">Descending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortDirection('asc')} className="rounded-xl p-3 cursor-pointer">Ascending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-8 w-[1px] bg-border mx-1" />

              <div className="flex bg-muted/50 p-1 rounded-xl">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 rounded-lg"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 rounded-lg"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={() => navigate('/resources/upload')} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                {translate("Upload", language)}
              </Button>
            </div>
          </div>

          {/* iOS-inspired Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
            <Button
              variant={activeCategory === 'All' ? 'default' : 'outline'}
              className={cn(
                "rounded-full px-5 py-5 text-sm font-bold transition-all shadow-sm",
                activeCategory === 'All' ? "shadow-primary/20 scale-105" : "hover:border-primary/50"
              )}
              onClick={() => { setActiveCategory('All'); setSelectedCategories([]); }}
            >
              All Topics
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                className={cn(
                  "rounded-full px-5 py-5 text-sm font-bold transition-all shadow-sm whitespace-nowrap",
                  activeCategory === cat ? "shadow-primary/20 scale-105" : "hover:border-primary/50"
                )}
                onClick={() => { setActiveCategory(cat); setSelectedCategories([cat]); }}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="relative max-w-2xl mx-auto w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="resource-search"
              name="q"
              type="text"
              placeholder={translate("Search resources...", language)}
              className="pl-12 h-14 rounded-[28px] glass-card border-none shadow-ios-high dark:shadow-ios-high-dark text-lg focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // No specific action needed as useMemo handles filtering, 
                  // but we can add a toast or a small animation to signify "Search Triggered"
                  toast({
                    title: "Searching...",
                    description: `Refining vault for "${searchTerm}"`,
                  });
                }
              }}
            />
          </div>

          <div className="w-full">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-72 bg-muted/30 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-[40px]">
                <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="h-10 w-10 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-2xl font-black mb-2">No Results Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">Try adjusting your filters or search term to discover curated civic educational materials.</p>
                <Button variant="outline" onClick={resetFilters} className="rounded-2xl px-8 h-12">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Vault
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'max-w-4xl mx-auto'}`}>
                {filteredResources.map(resource => renderResourceCard(resource))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResourceLibrary;
