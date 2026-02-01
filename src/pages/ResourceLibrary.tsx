// src/pages/ResourceLibrary.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Filter, Download, Book, FileText, Video, Image as ImageIcon,
  ChevronDown, CheckCircle2, X, SortAsc, SortDesc, List, Grid3X3, BookOpen, Plus, RefreshCw
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
import { translate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

// Resource type definition
interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'image' | 'audio' | 'link';
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

        if (searchTerm.trim()) {
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        if (selectedCategories.length > 0) {
          query = query.in('category', selectedCategories);
        }

        if (selectedTypes.length > 0) {
          query = query.in('type', selectedTypes);
        }

        // Apply sorting on the server where possible, or finalize in useMemo
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
          description: item.description,
          type: item.type,
          category: item.category,
          url: item.url,
          thumbnail: item.thumbnail_url,
          dateAdded: new Date(item.created_at).toISOString().split('T')[0],
          author: item.uploadedBy || 'Civic Education Kenya',
          views: item.views || 0,
          downloads: item.downloads || 0,
          tags: item.tags || [],
          featured: item.is_featured || false,
          canDownload: item.is_downloadable !== false
        }));

        setResources(mappedResources);

        // Derive categories if not already fetched separately
        if (categories.length === 0) {
          const uniqueCats = Array.from(new Set(mappedResources.map(r => r.category)));
          setCategories(uniqueCats);
        }
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
  }, [searchTerm, selectedCategories, selectedTypes, sortBy, sortDirection, toast]);

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

  // Optionally fetch categories from a dedicated table
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('resource_categories' as any).select('name');
      if (data) setCategories((data as any[]).map(c => c.name));
    };
    fetchCategories();
  }, []);

  const allResources = resources;

  const allCategories = Array.from(new Set(allResources.map(resource => resource.category)));
  const allTypes = Array.from(new Set(allResources.map(resource => resource.type)));

  // Filter and sort resources based on current state
  const filteredResources = useMemo(() => {
    let filtered = allResources;

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(term) ||
        resource.description.toLowerCase().includes(term) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(resource => selectedCategories.includes(resource.category));
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(resource => selectedTypes.includes(resource.type));
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
          : new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      } else if (sortBy === 'popularity') {
        const aPopularity = a.views + a.downloads;
        const bPopularity = b.views + b.downloads;
        return sortDirection === 'asc'
          ? aPopularity - bPopularity
          : bPopularity - aPopularity;
      } else { // alphabetical
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
  }, [allResources, searchTerm, selectedCategories, selectedTypes, sortBy, sortDirection]);

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

  // Get type icon based on resource type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'audio':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Book className="w-5 h-5" />;
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSortBy('date');
    setSortDirection('desc');
  };

  // Render resource card based on view mode
  const renderResourceCard = (resource: Resource) => {
    const isSelected = selectedResources.includes(resource.id);
    const thumbnail = resource.thumbnail || dynamicThumbnails[resource.id];

    if (viewMode === 'grid') {
      return (
        <motion.div
          key={resource.id}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full cursor-pointer group"
          layout
          onClick={() => navigate(`/resources/${resource.id}`)}
        >
          <Card className={`h-full border-none glass-card shadow-ios-high dark:shadow-ios-high-dark overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                {resource.canDownload !== false ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground opacity-70 hover:opacity-100'}`}
                    onClick={() => toggleResourceSelection(resource.id)}
                  >
                    {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                  </Button>
                ) : (
                  <Badge variant="destructive" className="opacity-90">
                    Proprietary
                  </Badge>
                )}
              </div>
              <div className="bg-muted aspect-video relative flex items-center justify-center">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    {getTypeIcon(resource.type)}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                  <Badge variant="outline" className="bg-background/80">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(resource.type)}
                      {resource.type.toUpperCase()}
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
            <CardHeader className="p-4 pb-2">
              <Link to={`/resources/${resource.id}`}>
                <CardTitle className="text-lg leading-tight hover:underline line-clamp-2">{resource.title}</CardTitle>
              </Link>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-muted-foreground text-sm line-clamp-2">{resource.description}</p>
            </CardContent>
            <CardFooter className="px-4 py-3 border-t flex justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{new Date(resource.dateAdded).toLocaleDateString()}</span>
                <span className="text-xs text-muted-foreground">{resource.views} views</span>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link to={`/resources/${resource.id}`}>
                  {translate("View Details", language)}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    } else {
      // List view
      return (
        <motion.div
          key={resource.id}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          layout
        >
          <Card className={`transition-shadow hover:shadow-md ${isSelected ? 'border-primary' : ''}`}>
            <div className="flex items-start p-4">
              <div className="hidden sm:block mr-4 bg-muted h-24 w-24 flex-shrink-0 flex items-center justify-center rounded-md">
                {resource.thumbnail ? (
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-full object-cover rounded-md"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    {getTypeIcon(resource.type)}
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-background/80">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(resource.type)}
                      {resource.type.toUpperCase()}
                    </div>
                  </Badge>
                  <Badge variant="secondary">{resource.category}</Badge>
                </div>
                <Link to={`/resources/${resource.id}`}>
                  <h3 className="font-semibold hover:underline line-clamp-1">{resource.title}</h3>
                </Link>
                <p className="text-muted-foreground text-sm line-clamp-1">{resource.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{new Date(resource.dateAdded).toLocaleDateString()}</span>
                    <span className="text-xs text-muted-foreground">{resource.views} views</span>
                  </div>
                  <div className="flex gap-2">
                    {resource.canDownload !== false ? (
                      <Button size="sm" variant="ghost" onClick={() => toggleResourceSelection(resource.id)}>
                        {isSelected ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Download className="h-4 w-4 mr-1" />}
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    ) : (
                      <Badge variant="destructive" className="opacity-90">
                        Proprietary
                      </Badge>
                    )}
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={`/resources/${resource.id}`}>
                        {translate("View Details", language)}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
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
                  {activeCategory}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-2 rounded-[24px] glass-card border-none shadow-2xl">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-2">Categories</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => { setActiveCategory('All'); setSelectedCategories([]) }} className="rounded-xl p-3 cursor-pointer">All Resources</DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map(cat => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSelectedCategories([cat]) }}
                    className="rounded-xl p-3 cursor-pointer"
                  >
                    {cat}
                  </DropdownMenuItem>
                ))}
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

        <div className="space-y-10">
          <div className="relative max-w-2xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={translate("Search resources...", language)}
              className="pl-12 h-14 rounded-[28px] glass-card border-none shadow-ios-high dark:shadow-ios-high-dark text-lg focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
