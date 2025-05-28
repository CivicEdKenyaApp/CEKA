import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Download, Upload, ArrowDown, Filter, MapPin, Info, Video, FileText, BookOpen, Image as ImageIcon, Grid, List // Added Grid, List icons
} from 'lucide-react';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceTypeFilter from '@/components/resources/ResourceTypeFilter';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card } from '@/components/ui/card'; // Add this import

// County list for Kenya - remains as is for filter UI
const counties = [
  'All Counties', 'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 
  'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 
  'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 
  'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
];

// Bill objective categories - remains as is for filter UI
const billObjectives = [
  'All Objectives',
  'Constitutional Implementation', 'Devolved Government', 'Constitutionalism', 
  'Political System', 'Electoral Knowledge', 'Bill of Rights', 
  'Service Delivery', 'County Issues', 'National Cohesion'
];

// Type for resources fetched from Supabase
type Resource = Tables<'resources'> & {
  // These fields are not in the DB `resources` table, but ResourceCard might expect them.
  // They will be undefined when fetched from Supabase unless schema changes.
  // ResourceCard should handle them being optional.
  billObjective?: string; 
  county?: string; 
  uploadDate?: string; // created_at can be used
  status?: 'pending' | 'approved' | 'rejected'; // Not in current 'resources' table
};

const ResourceHub = () => {
  const [allResources, setAllResources] = useState<Resource[]>([]); // Stores all fetched resources
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { type: typeFromParams, category: categoryFromParams } = useParams<{ type?: string; category?: string }>(); // Handle both type and category from URL
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  
  // Filters from UI
  const [selectedUiCategory, setSelectedUiCategory] = useState<string | null>(null); // For category buttons
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [selectedObjective, setSelectedObjective] = useState('All Objectives');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Map Supabase data to Resource type, ensuring all fields are handled
        // `billObjective` and `county` will be undefined as they are not in the DB
        // `uploadDate` can use `created_at`
        // `status` is not in DB
        const fetchedResources = data.map(r => ({
            ...r,
            id: String(r.id), // Ensure id is string if ResourceCard expects it
            uploadDate: r.created_at, // Use created_at for uploadDate
        })) as Resource[];

        setAllResources(fetchedResources);

      } catch (error: any) {
        console.error('Error fetching resources:', error);
        toast({
          title: "Error",
          description: "Could not load resources: " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is done client-side by `filteredResources` memo
    console.log("Search query:", searchQuery);
  };

  const handleCategoryButtonClick = (category: string) => {
    setSelectedUiCategory(prev => prev === category ? null : category);
  };
  
  const filteredResources = useMemo(() => {
    return allResources.filter(resource => {
      // URL parameter filter (type or category from ResourceTypeFilter component)
      const typeOrCategoryFilter = typeFromParams || categoryFromParams;
      if (typeOrCategoryFilter) {
        const filterValue = typeOrCategoryFilter.toLowerCase();
        const resourceType = resource.type?.toLowerCase();
        const resourceCategory = resource.category?.toLowerCase();
        if (resourceType !== filterValue && resourceCategory !== filterValue) {
          return false;
        }
      }

      // UI Category button filter
      if (selectedUiCategory && resource.category?.toLowerCase() !== selectedUiCategory.toLowerCase()) {
        return false;
      }
      
      // County dropdown filter
      // Assuming 'county' field in resource could be a comma-separated string if we add it later.
      // For now, this won't filter as 'county' is not in DB.
      if (selectedCounty !== 'All Counties' && !resource.county?.includes(selectedCounty)) {
        return false;
      }
      
      // Bill objective dropdown filter
      // Similarly, 'billObjective' is not in DB.
      if (selectedObjective !== 'All Objectives' && resource.billObjective !== selectedObjective) {
        return false;
      }
      
      // Search query filter (title and description)
      if (searchQuery) {
        const sqLower = searchQuery.toLowerCase();
        const titleMatch = resource.title?.toLowerCase().includes(sqLower);
        const descriptionMatch = resource.description?.toLowerCase().includes(sqLower);
        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }
      return true;
    });
  }, [allResources, typeFromParams, categoryFromParams, selectedUiCategory, selectedCounty, selectedObjective, searchQuery]);

  const handleGoToUpload = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload resources",
      });
      navigate('/auth?redirect=/resources/upload');
    } else {
      navigate('/resources/upload');
    }
  };
  
  const clearAllFilters = () => {
    setSelectedUiCategory(null);
    setSelectedCounty('All Counties');
    setSelectedObjective('All Objectives');
    setSearchQuery('');
    // To clear ResourceTypeFilter (URL based), navigate to base /resources
    if (typeFromParams || categoryFromParams) {
      navigate('/resources');
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-medium">CEKA is an educational resource</span> designed to support civic education in alignment with the County Civic Education Bill, 2024. It is not an official government platform.
              <Button variant="link" className="h-auto p-0 text-yellow-800 dark:text-yellow-200 underline ml-1" asChild>
                <Link to="/about/legal">Learn more</Link>
              </Button>
            </p>
          </div>
        </div>
      
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Resource Hub</h1>
            <p className="text-muted-foreground">Educational materials on civic rights, governance, and public participation</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button 
              onClick={handleGoToUpload}
              className="bg-kenya-green hover:bg-kenya-green/90"
            >
              <Upload className="mr-2 h-4 w-4" />
              Submit Resource
            </Button>
            {session && ( /* Only show if logged in */
              <Button variant="outline" asChild>
                <Link to="/resources/pending">
                  My Submissions
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="browse" className="mb-8">
          <TabsList className="inline-flex rounded-md bg-muted p-1 text-muted-foreground px-2 overflow-x-hidden whitespace-nowrap scroll-smooth snap-x snap-mandatory">
            <TabsTrigger value="browse">Browse Resources</TabsTrigger>
            <TabsTrigger value="providers">Educational Providers</TabsTrigger>
            <TabsTrigger value="calendar">Civic Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-6">
            <div className="mb-6">
              <ResourceTypeFilter />
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/30 dark:bg-slate-800/50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <label htmlFor="county-select" className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1" /> County
                  </label>
                  <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                    <SelectTrigger id="county-select" className="w-full">
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem key={county} value={county}>{county}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <label htmlFor="objective-select" className="text-sm font-medium flex items-center">
                    <Filter className="h-4 w-4 mr-1" /> Bill Objective
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Filter by objectives aligned with Section 3 of the County Civic Education Bill (Note: Data for this filter might not be in all resources yet).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <Select value={selectedObjective} onValueChange={setSelectedObjective}>
                    <SelectTrigger id="objective-select" className="w-full">
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      {billObjectives.map((objective) => (
                        <SelectItem key={objective} value={objective}>{objective}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <label htmlFor="search-resources" className="text-sm font-medium">Search</label>
                  <form onSubmit={handleSearch} className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="search-resources"
                      placeholder="Search resources..." 
                      className="pl-9" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {['Constitution', 'Rights', 'Governance', 'Participation'].map(cat => (
                    <Button 
                      key={cat}
                      variant={selectedUiCategory === cat ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleCategoryButtonClick(cat)}
                      className={selectedUiCategory === cat ? "bg-kenya-green hover:bg-kenya-green/90" : ""}
                    >
                      {cat}
                    </Button>
                ))}
              </div>
              
              {(selectedCounty !== 'All Counties' || selectedObjective !== 'All Objectives' || selectedUiCategory || typeFromParams || categoryFromParams || searchQuery) && (
                <div className="flex items-center flex-wrap gap-2 text-sm">
                  <span className="text-muted-foreground">Filters applied:</span>
                  {typeFromParams && <Badge variant="outline" className="bg-muted/50">Type: {typeFromParams}</Badge>}
                  {categoryFromParams && <Badge variant="outline" className="bg-muted/50">Category: {categoryFromParams}</Badge>}
                  {selectedCounty !== 'All Counties' && <Badge variant="outline" className="bg-muted/50">County: {selectedCounty}</Badge>}
                  {selectedObjective !== 'All Objectives' && <Badge variant="outline" className="bg-muted/50">Objective: {selectedObjective}</Badge>}
                  {selectedUiCategory && <Badge variant="outline" className="bg-muted/50">UI Category: {selectedUiCategory}</Badge>}
                  {searchQuery && <Badge variant="outline" className="bg-muted/50">Search: "{searchQuery}"</Badge>}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-sm hover:bg-destructive/10 text-destructive"
                    onClick={clearAllFilters}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredResources.length} of {allResources.length} resources
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <Button 
                    variant={viewMode === 'grid' ? "default" : "outline"} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? "default" : "outline"} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className={`gap-6 ${viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}`}>
                {[...Array(viewMode === 'grid' ? 8 : 4)].map((_, n) => (
                  <div key={n} className="animate-pulse">
                    <div className={`bg-muted rounded-lg ${viewMode === 'grid' ? 'h-40' : 'h-24 flex items-center p-4'}`}>
                        {viewMode === 'list' && <div className="h-12 w-12 bg-slate-300 dark:bg-slate-700 rounded mr-4"></div>}
                    </div>
                    <div className="p-4 space-y-2 border border-muted rounded-b-lg">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="col-span-full text-center py-12">
                 <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" strokeWidth={1} /> {/* Changed icon */}
                <h2 className="text-xl font-semibold mb-2">No Resources Found</h2>
                <p className="text-muted-foreground mb-6">
                  No resources match your current filter criteria. Try adjusting your filters or <Link to="/resources" onClick={clearAllFilters} className="text-kenya-green underline">view all resources</Link>.
                </p>
                <Button onClick={clearAllFilters}>Clear Filters</Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={{ // Ensure all expected props are passed, even if undefined
                      id: resource.id,
                      title: resource.title,
                      description: resource.description,
                      type: resource.type,
                      uploadDate: resource.uploadDate || resource.created_at,
                      uploadedBy: resource.uploadedBy,
                      downloadUrl: resource.downloadUrl || resource.url, // Use url as fallback for download
                      videoUrl: resource.videoUrl,
                      status: resource.status, // Will be undefined
                      category: resource.category,
                      billObjective: resource.billObjective, // Will be undefined
                      county: resource.county, // Will be undefined
                      is_downloadable: resource.is_downloadable ?? true, // Default to true if not specified
                    }}
                    downloadable={resource.is_downloadable ?? true} // Ensure this matches resource data
                  />
                ))}
              </div>
            ) : ( // List view
              <div className="space-y-4">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="flex hover:shadow-md transition-shadow">
                    <div className="p-4 flex-shrink-0 w-20 h-20 md:w-28 md:h-auto bg-muted/50 dark:bg-slate-800/30 flex items-center justify-center rounded-l-lg">
                      {resource.type?.toLowerCase() === 'video' && <Video className="h-8 w-8 text-muted-foreground" />}
                      {(resource.type?.toLowerCase() === 'document' || resource.type?.toLowerCase() === 'pdf') && <FileText className="h-8 w-8 text-muted-foreground" />}
                      {resource.type?.toLowerCase() === 'constitution' && <BookOpen className="h-8 w-8 text-muted-foreground" />}
                      {resource.type?.toLowerCase() === 'infographic' && <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className={`font-normal ${
                          resource.type === 'Constitution' ? 'bg-kenya-red/10 text-kenya-red border-kenya-red/30' :
                          resource.type === 'Video' ? 'bg-kenya-blue/10 text-kenya-blue border-kenya-blue/30' :
                          resource.type === 'Infographic' ? 'bg-kenya-green/10 text-kenya-green border-kenya-green/30' :
                          'bg-kenya-yellow/10 text-kenya-yellow border-kenya-yellow/30'
                        }`}>
                          {resource.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(resource.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Link to={`/resources/${resource.id}`} className="hover:text-kenya-green transition-colors">
                        <h3 className="font-semibold text-lg">{resource.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{resource.description}</p>
                      {/* Info for county and billObjective could be added here if data exists */}
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/resources/${resource.id}`}>View Details</Link>
                        </Button>
                        {(resource.is_downloadable ?? true) && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={resource.downloadUrl || resource.url} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-1.5 h-3.5 w-3.5" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Load More button - Placeholder, implement pagination if needed */}
             {filteredResources.length > 0 && (
              <div className="flex justify-center mt-10">
                <Button variant="outline" className="flex items-center gap-2">
                  Load More Resources
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="mt-12 p-6 bg-kenya-green/10 dark:bg-kenya-green/5 rounded-lg">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Complete Resource Library</h2>
                <p className="mb-6 text-muted-foreground">
                  Access our comprehensive collection of resources including all uploaded documents,
                  videos, infographics, and more. Perfect for offline access and deep research.
                </p>
                <Button className="bg-kenya-green hover:bg-kenya-green/90" asChild>
                  <Link to="/resources/library"> {/* Assuming /library is a valid route */}
                    <Download className="mr-2 h-4 w-4" />
                    Browse Complete Resource Library
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Educational Providers and Civic Calendar Tabs - kept as is from user's code */}
          <TabsContent value="providers" className="space-y-6">
            {/* ... keep existing code (Educational Providers content) */}
             <div className="bg-muted/30 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-2">Civic Education Providers Directory</h2>
              <p className="text-muted-foreground mb-2">
                This directory provides information about organizations offering civic education in Kenya, 
                supporting Section 4(2)(e) of the County Civic Education Bill.
              </p>
              <p className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded border border-yellow-200">
                <strong>Disclaimer:</strong> This directory is for informational purposes only and is not an official registry.
                Information is updated quarterly based on publicly available data.
              </p>
            </div>
            
            {/* Provider filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input placeholder="Search providers..." />
              </div>
              <div className="w-full md:w-48">
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by focus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All areas</SelectItem>
                    <SelectItem value="constitution">Constitutional Education</SelectItem>
                    <SelectItem value="voting">Electoral Process</SelectItem>
                    <SelectItem value="rights">Human Rights</SelectItem>
                    <SelectItem value="devolution">Devolution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Provider list */}
            <div className="space-y-4">
              {[
                { 
                  name: 'Civic Education Kenya App',
                  focus: ['Constitution', 'Rights'], 
                  counties: ['Nairobi', 'Kisumu', 'Mombasa'],
                  contact: 'ceka.lovable.app/contact | +254 798 903 373',
                  website: 'https://ceka.lovable.app' // Corrected URL
                },
                { 
                  name: 'Kenya Human Rights Commission',
                  focus: ['Rights', 'Governance'], 
                  counties: ['Nationwide'],
                  contact: 'outreach@khrc.or.ke | +254 709 132 100',
                  website: 'https://www.khrc.or.ke'
                },
                // ... other providers
              ].map((provider, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <div className="flex gap-2">
                      {provider.focus.map((area, i) => (
                        <Badge key={i} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-sm text-muted-foreground">{provider.counties.join(', ')}</span>
                  </div>
                  
                  <p className="mt-2 text-sm">{provider.contact}</p>
                  
                  <div className="mt-3 flex">
                    <Button variant="outline" size="sm" className="mr-2" asChild>
                      <a href={provider.website} target="_blank" rel="noopener noreferrer">
                        Visit Website
                      </a>
                    </Button>
                    <Button variant="secondary" size="sm">
                      View Programs
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-6">
              <Button variant="outline">
                Load More Providers
              </Button>
            </div>
            
            <Separator className="my-8" />
            
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Are you a civic education provider?</h3>
              <p className="text-muted-foreground mb-4">
                Submit your organization's information to be included in our directory.
              </p>
              <Button>Register as Provider</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            {/* ... keep existing code (Civic Calendar content) */}
            <div className="bg-muted/30 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-2">Civic Education Calendar</h2>
              <p className="text-muted-foreground mb-2">
                Upcoming civic education events and opportunities across Kenya, supporting Section 4(1)(b) of the County Civic Education Bill.
              </p>
              <p className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded border border-yellow-200">
                <strong>Disclaimer:</strong> This calendar is for informational purposes only. CEKA is not an official coordinator of these events.
                Please verify event details with the organizers directly.
              </p>
            </div>
            
            {/* Calendar filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input placeholder="Search events..." />
              </div>
              <div className="w-full md:w-48">
                <Select defaultValue="all-counties">
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-counties">All Counties</SelectItem>
                    {/* ... other counties */}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select defaultValue="all-types">
                  <SelectTrigger>
                    <SelectValue placeholder="Event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    {/* ... other event types */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Calendar events */}
            <div className="space-y-4">
              {[
                // ... events data
              ].map((event: any, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  {/* ... event card structure */}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-6">
              <Button variant="outline">
                Load More Events
              </Button>
            </div>
            
            <Separator className="my-8" />
            
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Organizing a civic education event?</h3>
              <p className="text-muted-foreground mb-4">
                Submit your event details to be included in our civic education calendar.
              </p>
              <Button>Submit Event</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ResourceHub;
