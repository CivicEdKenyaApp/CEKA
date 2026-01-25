// src/pages/ResourceLibrary.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Filter, Download, Book, FileText, Video, Image as ImageIcon,
  ChevronDown, CheckCircle2, X, SortAsc, SortDesc, List, Grid3X3, BookOpen, Plus
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
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

    if (viewMode === 'grid') {
      return (
        <motion.div
          key={resource.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full"
          layout
        >
          <Card className={`h-full transition-shadow hover:shadow-md overflow-hidden ${isSelected ? 'border-primary' : ''}`}>
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
                {resource.thumbnail ? (
                  <img
                    src={resource.thumbnail}
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{translate("Resource Library", language)}</h1>
            <p className="text-muted-foreground mt-1">
              {translate("Browse and download educational resources on civic education", language)}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-8 w-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => navigate('/resources/upload')} className="bg-kenya-green hover:bg-kenya-green/90 mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            {translate("Upload Resource", language)}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar with filters */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{translate("Filter Resources", language)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={translate("Search resources...", language)}
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{translate("Categories", language)}</h4>
                  <div className="space-y-2">
                    {allCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onChange={() => {
                            if (selectedCategories.includes(category)) {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            } else {
                              setSelectedCategories([...selectedCategories, category]);
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`category-${category}`} className="text-sm">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{translate("Resource Types", language)}</h4>
                  <div className="space-y-2">
                    {allTypes.map((type) => (
                      <div key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onChange={() => {
                            if (selectedTypes.includes(type)) {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            } else {
                              setSelectedTypes([...selectedTypes, type]);
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`type-${type}`} className="flex items-center text-sm">
                          <span className="mr-1">{getTypeIcon(type)}</span>
                          {type.toUpperCase()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{translate("Sort By", language)}</h4>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={sortBy === 'date' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSortBy('date');
                        if (sortBy === 'date') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortDirection('desc');
                        }
                      }}
                      className="justify-between"
                    >
                      {translate("Date Added", language)}
                      {sortBy === 'date' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant={sortBy === 'popularity' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSortBy('popularity');
                        if (sortBy === 'popularity') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortDirection('desc');
                        }
                      }}
                      className="justify-between"
                    >
                      {translate("Popularity", language)}
                      {sortBy === 'popularity' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSortBy('alphabetical');
                        if (sortBy === 'alphabetical') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortDirection('asc');
                        }
                      }}
                      className="justify-between"
                    >
                      {translate("Alphabetical", language)}
                      {sortBy === 'alphabetical' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button variant="outline" onClick={resetFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  {translate("Clear filters", language)}
                </Button>
              </CardContent>
            </Card>

            {/* Download selection panel */}
            {selectedResources.length > 0 && (
              <Card className="mt-4 border-primary">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">{translate("Selected Resources", language)}</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm font-medium">{selectedResources.length} {selectedResources.length === 1 ? 'resource' : 'resources'} selected</p>
                </CardContent>
                <CardFooter className="pt-2 pb-3">
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedResources([])}>
                      {translate("Clear", language)}
                    </Button>
                    <Button className="flex-1" onClick={downloadSelectedResources}>
                      <Download className="h-4 w-4 mr-2" />
                      {translate("Download", language)}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Main content */}
          <div className="lg:w-3/4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 flex w-full h-auto flex-wrap">
                <TabsTrigger value="all" className="flex-1">
                  {translate("All Resources", language)} ({filteredResources.length})
                </TabsTrigger>
                {allCategories.slice(0, 3).map((category) => (
                  <TabsTrigger key={category} value={category} className="flex-1">
                    {category} ({resourcesByCategory[category]?.length || 0})
                  </TabsTrigger>
                ))}
                {allCategories.length > 3 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {translate("More", language)}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>{translate("Categories", language)}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {allCategories.slice(3).map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => {
                            if (selectedCategories.includes(category)) {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            } else {
                              setSelectedCategories([...selectedCategories, category]);
                            }
                          }}
                        >
                          {category} ({resourcesByCategory[category]?.length || 0})
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredResources.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No resources match your filters</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters or search term</p>
                    <Button variant="outline" onClick={resetFilters} className="mt-4">
                      <X className="h-4 w-4 mr-2" />
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
                    {filteredResources.map(resource => renderResourceCard(resource))}
                  </div>
                )}
              </TabsContent>

              {allCategories.map((category) => (
                <TabsContent key={category} value={category} className="mt-0">
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  ) : resourcesByCategory[category]?.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium">No {category} resources match your filters</h3>
                      <p className="text-muted-foreground mt-2">Try adjusting your filters or search term</p>
                      <Button variant="outline" onClick={resetFilters} className="mt-4">
                        <X className="h-4 w-4 mr-2" />
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
                      {resourcesByCategory[category]?.map(resource => renderResourceCard(resource))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResourceLibrary;
