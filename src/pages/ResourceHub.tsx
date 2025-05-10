import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Download, Upload, ArrowDown, Filter, MapPin, Info, Video, FileText, BookOpen, Image
} from 'lucide-react';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceTypeFilter from '@/components/resources/ResourceTypeFilter';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/App';
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

// Keep mock resources as is
const mockResources = [
  {
    id: "1",
    title: "Understanding the Constitution of Kenya",
    type: "Document",
    category: "Constitution",
    description: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
    url: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Documents/Constitution/constitution-guide.pdf",
    downloadUrl: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Documents/Constitution/constitution-guide.pdf?download=1",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Civic Education Kenya",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "Blood Parliament: BBC Africa Eye Documentary",
    type: "Video",
    category: "Governance",
    description: "How the Kenyan Government handled the Kenyan youth rising up against economic injustice",
    url: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Videos/Governance/Blood%20Parliament%20-%20BBC%20Africa%20Eye%20Documentary%20(1080p_25fps_H264-128kbit_AAC).mp4",
    videoUrl: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Videos/Governance/Blood%20Parliament%20-%20BBC%20Africa%20Eye%20Documentary%20(1080p_25fps_H264-128kbit_AAC).mp4",
    downloadUrl: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Videos/Governance/Blood%20Parliament%20-%20BBC%20Africa%20Eye%20Documentary%20(1080p_25fps_H264-128kbit_AAC).mp4?download=1",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Civic Education Kenya",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Your Rights as a Kenyan Citizen",
    type: "Infographic",
    category: "Rights",
    description: "Visual representation of fundamental rights guaranteed by the Constitution.",
    url: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Documents/Rights/citizenship-rights.pdf",
    downloadUrl: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Documents/Rights/citizenship-rights.pdf?download=1",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Civic Education Kenya",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "4",
    title: "County Governments Explained",
    type: "Document",
    category: "Governance",
    description: "Detailed explanation of how county governments work and their responsibilities.",
    url: "https://example.com/county-gov.pdf",
    downloadUrl: "https://example.com/county-gov.pdf",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Ministry of Devolution",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "5",
    title: "Introduction to Public Participation",
    type: "Document",
    category: "Participation",
    description: "Guide on how citizens can participate in governance and decision-making processes.",
    url: "https://example.com/participation.pdf",
    downloadUrl: "https://example.com/participation.pdf",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Office of the Ombudsman",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "6",
    title: "Kenya's Electoral System",
    type: "Video",
    category: "Elections",
    description: "Explains how elections work in Kenya, from voter registration to results announcement.",
    url: "https://example.com/elections-video.mp4",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    downloadUrl: "https://example.com/elections-video.mp4",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "IEBC",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "7",
    title: "Understanding the Judiciary",
    type: "Infographic",
    category: "Judiciary",
    description: "Visual guide to Kenya's court system and how the judiciary functions.",
    url: "https://example.com/judiciary.png",
    downloadUrl: "https://example.com/judiciary.png",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Judicial Service Commission",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "8",
    title: "Civic Education for Youth",
    type: "Document",
    category: "Education",
    description: "Resources specifically designed for young Kenyans to learn about civic participation.",
    url: "https://example.com/youth-civic.pdf",
    downloadUrl: "https://example.com/youth-civic.pdf",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Ministry of Education",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "9",
    title: "National Civic Education Framework",
    type: "Document",
    category: "Framework",
    description: "Official framework outlining civic education implementation at County and National levels.",
    url: "https://example.com/ncef-document.pdf",
    downloadUrl: "https://example.com/ncef-document.pdf",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Ministry of Education",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "10",
    title: "Guide to Devolved Government",
    type: "Document",
    category: "Governance",
    description: "Comprehensive document explaining Kenya's devolved system of government.",
    url: "https://example.com/devolution-guide.pdf",
    downloadUrl: "https://example.com/devolution-guide.pdf",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Council of Governors",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "11",
    title: "Civil Society Engagement Handbook",
    type: "Document",
    category: "Participation",
    description: "A handbook for civil society organizations on effective engagement with government.",
    url: "https://example.com/cso-handbook.pdf",
    downloadUrl: "https://example.com/cso-handbook.pdf",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Civil Society Reference Group",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "12",
    title: "Public Finance Management Guide",
    type: "Document",
    category: "Finance",
    description: "Document explaining public finance management processes in Kenya.",
    url: "https://example.com/pfm-guide.pdf",
    downloadUrl: "https://example.com/pfm-guide.pdf",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "National Treasury",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// County list for Kenya
const counties = [
  'All Counties', 'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 
  'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 
  'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 
  'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
];

// Bill objective categories based on Section 3 of the County Civic Education Bill
const billObjectives = [
  'All Objectives',
  'Constitutional Implementation', // Section 3a
  'Devolved Government', // Section 3b
  'Constitutionalism', // Section 3c
  'Political System', // Section 3d
  'Electoral Knowledge', // Section 3e
  'Bill of Rights', // Section 3f
  'Service Delivery', // Section 3g
  'County Issues', // Section 3h
  'National Cohesion' // Section 3i
];

type Resource = {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  url: string;
  downloadUrl?: string;
  videoUrl?: string;
  is_downloadable: boolean;
  uploadDate?: string;
  uploadedBy?: string;
  created_at: string;
  updated_at: string;
  status?: 'pending' | 'approved' | 'rejected';
  billObjective?: string; // Added for bill objective alignment
  county?: string; // Added for county-specific content
};

// Fix: Moving the enhancedMockResources inside the component
const ResourceHub = () => {
  // Fix: Move enhancedMockResources inside the component as a useMemo hook
  const enhancedMockResources = React.useMemo(() => {
    return mockResources.map(resource => {
      // Assign random bill objectives
      const objectives = [
        'Constitutional Implementation', 'Devolved Government', 
        'Constitutionalism', 'Political System', 'Electoral Knowledge',
        'Bill of Rights', 'Service Delivery', 'County Issues', 'National Cohesion'
      ];
      
      // Assign random counties (1-3 per resource)
      const countyCount = Math.floor(Math.random() * 3) + 1;
      const resourceCounties = [];
      for (let i = 0; i < countyCount; i++) {
        const randomCounty = counties[Math.floor(Math.random() * (counties.length - 1)) + 1];
        if (!resourceCounties.includes(randomCounty)) {
          resourceCounties.push(randomCounty);
        }
      }
      
      return {
        ...resource,
        billObjective: objectives[Math.floor(Math.random() * objectives.length)],
        county: resourceCounties.join(', ')
      };
    });
  }, []);
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { type } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [selectedObjective, setSelectedObjective] = useState('All Objectives');
  const [viewMode, setViewMode] = useState('grid');
  
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setTimeout(() => {
          let filteredResources = [...enhancedMockResources] as Resource[];
          
          if (type) {
            filteredResources = enhancedMockResources.filter(resource => 
              resource.type.toLowerCase() === type.toLowerCase() ||
              resource.category.toLowerCase() === type.toLowerCase()
            ) as Resource[];
          }
          
          setResources(filteredResources);
          setLoading(false);
        }, 500);
        
        // Actual Supabase implementation commented for reference
        // ... keep existing code (Supabase function implementation)
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast({
          title: "Error",
          description: "Could not load resources. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [type, toast, enhancedMockResources]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // In a real implementation, this would trigger a new search
  };

  const handleCategoryFilter = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
    }
  };

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
    console.log("Selected county:", county);
    // In a real implementation, this would filter resources by county
  };

  const handleObjectiveChange = (objective: string) => {
    setSelectedObjective(objective);
    console.log("Selected objective:", objective);
    // In a real implementation, this would filter resources by bill objective
  };

  // Filter resources based on all criteria
  const filteredResources = resources
    .filter(resource => {
      // Apply category filter if active
      if (activeCategory && resource.category !== activeCategory) {
        return false;
      }
      
      // Apply county filter if not "All Counties"
      if (selectedCounty !== 'All Counties' && !resource.county?.includes(selectedCounty)) {
        return false;
      }
      
      // Apply bill objective filter if not "All Objectives"
      if (selectedObjective !== 'All Objectives' && resource.billObjective !== selectedObjective) {
        return false;
      }
      
      // Apply search filter if there's a search query
      if (searchQuery && 
          !resource.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !resource.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });

  const handleGoToUpload = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload resources",
      });
      navigate('/auth');
    } else {
      navigate('/resources/upload');
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Bill disclaimer banner */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              <span className="font-medium">CEKA is an educational resource</span> designed to support civic education in alignment with the County Civic Education Bill, 2024. It is not an official government platform.
              <Button variant="link" className="h-auto p-0 text-yellow-800 underline ml-1" asChild>
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
            {session && (
              <Button variant="outline" asChild>
                <Link to="/resources/pending">
                  My Submissions
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="browse" className="mb-8">
          <TabsList>
            <TabsTrigger value="browse">Browse Resources</TabsTrigger>
            <TabsTrigger value="providers">Educational Providers</TabsTrigger>
            <TabsTrigger value="calendar">Civic Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-6">
            <div className="mb-6">
              <ResourceTypeFilter />
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Advanced filtering options */}
              <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-1 space-y-2">
                  <label htmlFor="county-select" className="text-sm font-medium">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      County
                    </div>
                  </label>
                  <Select value={selectedCounty} onValueChange={handleCountyChange}>
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
                  <label htmlFor="objective-select" className="text-sm font-medium">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-1" />
                      Bill Objective
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Resources aligned with Section 3 objectives of the County Civic Education Bill</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </label>
                  <Select value={selectedObjective} onValueChange={handleObjectiveChange}>
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
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
              
              {/* Category filters */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={activeCategory === "Constitution" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleCategoryFilter("Constitution")}
                >
                  Constitution
                </Button>
                <Button 
                  variant={activeCategory === "Rights" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleCategoryFilter("Rights")}
                >
                  Rights
                </Button>
                <Button 
                  variant={activeCategory === "Governance" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleCategoryFilter("Governance")}
                >
                  Governance
                </Button>
                <Button 
                  variant={activeCategory === "Participation" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleCategoryFilter("Participation")}
                >
                  Participation
                </Button>
              </div>
              
              {/* Filter summary */}
              {(selectedCounty !== 'All Counties' || selectedObjective !== 'All Objectives' || activeCategory) && (
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Filters:</span>
                  {selectedCounty !== 'All Counties' && (
                    <Badge variant="outline" className="bg-muted/50">
                      County: {selectedCounty}
                      <button 
                        className="ml-1 hover:text-destructive" 
                        onClick={() => setSelectedCounty('All Counties')}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedObjective !== 'All Objectives' && (
                    <Badge variant="outline" className="bg-muted/50">
                      Objective: {selectedObjective}
                      <button 
                        className="ml-1 hover:text-destructive" 
                        onClick={() => setSelectedObjective('All Objectives')}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {activeCategory && (
                    <Badge variant="outline" className="bg-muted/50">
                      Category: {activeCategory}
                      <button 
                        className="ml-1 hover:text-destructive" 
                        onClick={() => setActiveCategory(null)}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-sm"
                    onClick={() => {
                      setSelectedCounty('All Counties');
                      setSelectedObjective('All Objectives');
                      setActiveCategory(null);
                      setSearchQuery('');
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              )}
              
              {/* Results count */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredResources.length} resources
                  {filteredResources.length === 0 && searchQuery && " for search term: " + searchQuery}
                  {filteredResources.length === 0 && !searchQuery && " matching your filters"}
                </p>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <Button 
                    variant={viewMode === 'grid' ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('grid')}
                  >
                    <span className="sr-only">Grid view</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="7" height="7" x="3" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="14" rx="1" />
                      <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('list')}
                  >
                    <span className="sr-only">List view</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Resource grid/list */}
            {viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                  [1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="animate-pulse">
                      <div className="h-40 bg-muted rounded-t-lg"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  ))
                ) : filteredResources.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Resources Found</h2>
                    <p className="text-muted-foreground mb-6">
                      {type 
                        ? `No ${type} resources are available currently.` 
                        : "No resources match your search criteria."}
                    </p>
                    <Button asChild>
                      <Link to="/resources">View All Resources</Link>
                    </Button>
                  </div>
                ) : (
                  filteredResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={{
                        id: resource.id,
                        title: resource.title,
                        description: resource.description,
                        type: resource.type,
                        uploadDate: resource.uploadDate || resource.created_at,
                        uploadedBy: resource.uploadedBy || "Civic Education Kenya",
                        downloadUrl: resource.downloadUrl || resource.url,
                        videoUrl: resource.videoUrl,
                        status: resource.status,
                        category: resource.category,
                        billObjective: resource.billObjective,
                        county: resource.county
                      }}
                      downloadable={resource.is_downloadable}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {loading ? (
                  [1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="animate-pulse p-4 border rounded-lg">
                      <div className="flex justify-between">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-1/6"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-3/4 mt-2"></div>
                      <div className="h-4 bg-muted rounded w-full mt-2"></div>
                      <div className="h-10 bg-muted rounded w-1/4 mt-4"></div>
                    </div>
                  ))
                ) : filteredResources.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Resources Found</h2>
                    <p className="text-muted-foreground mb-6">
                      {type 
                        ? `No ${type} resources are available currently.` 
                        : "No resources match your search criteria."}
                    </p>
                    <Button asChild>
                      <Link to="/resources">View All Resources</Link>
                    </Button>
                  </div>
                ) : (
                  filteredResources.map((resource) => (
                    <div key={resource.id} className="flex p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="mr-4 flex-shrink-0 w-16 h-16 bg-muted flex items-center justify-center rounded">
                        {resource.type === 'Video' && <Video className="h-8 w-8 text-muted-foreground" />}
                        {resource.type === 'Document' && <FileText className="h-8 w-8 text-muted-foreground" />}
                        {resource.type === 'Constitution' && <BookOpen className="h-8 w-8 text-muted-foreground" />}
                        {resource.type === 'Infographic' && <Image className="h-8 w-8 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
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
                        <div className="flex flex-wrap gap-2 mt-2">
                          {resource.billObjective && (
                            <Badge variant="secondary" className="text-xs">
                              {resource.billObjective}
                            </Badge>
                          )}
                          {resource.county && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {resource.county}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/resources/${resource.id}`}>View Details</Link>
                          </Button>
                          {resource.is_downloadable && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={resource.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                Download
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {filteredResources.length > 0 && (
              <div className="flex justify-center mt-10">
                <Button variant="outline" className="flex items-center gap-2">
                  Load More Resources
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="mt-12 p-6 bg-kenya-green/10 rounded-lg">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Complete Resource Library</h2>
                <p className="mb-6 text-muted-foreground">
                  Access our comprehensive collection of resources including all uploaded documents,
                  videos, infographics, and more. Perfect for offline access and deep research.
                </p>
                <Button className="bg-kenya-green hover:bg-kenya-green/90" asChild>
                  <Link to="/ResourceLibrary">
                    <Download className="mr-2 h-4 w-4" />
                    Browse Complete Resource Library
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="providers" className="space-y-6">
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
                  name: 'Civic Education Kenya Initiative',
                  focus: ['Constitution', 'Rights'], 
                  counties: ['Nairobi', 'Kisumu', 'Mombasa'],
                  contact: 'info@ceki.org | +254 700 123 456',
                  website: 'https://www.ceki.org'
                },
                { 
                  name: 'Kenya Human Rights Commission',
                  focus: ['Rights', 'Governance'], 
                  counties: ['Nationwide'],
                  contact: 'outreach@khrc.or.ke | +254 709 132 100',
                  website: 'https://www.khrc.or.ke'
                },
                { 
                  name: 'Uraia Trust',
                  focus: ['Civic Education', 'Devolution'], 
                  counties: ['Nationwide'],
                  contact: 'info@uraia.or.ke | +254 20 271 5390',
                  website: 'https://www.uraia.or.ke'
                },
                { 
                  name: 'Constitution and Reform Education Consortium (CRECO)',
                  focus: ['Constitution', 'Governance Reform'], 
                  counties: ['Nairobi', 'Nakuru', 'Meru'],
                  contact: 'info@creco.org | +254 20 2732750',
                  website: 'https://www.creco.org'
                },
                { 
                  name: 'International Commission of Jurists - Kenya',
                  focus: ['Legal Rights', 'Constitution'], 
                  counties: ['Nairobi', 'Mombasa'],
                  contact: 'info@icj-kenya.org | +254 20 2084836',
                  website: 'https://www.icj-kenya.org'
                },
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
                    <SelectItem value="nairobi">Nairobi</SelectItem>
                    <SelectItem value="mombasa">Mombasa</SelectItem>
                    <SelectItem value="kisumu">Kisumu</SelectItem>
                    <SelectItem value="nakuru">Nakuru</SelectItem>
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
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="forum">Public Forum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Calendar events */}
            <div className="space-y-4">
              {[
                {
                  title: 'Understanding the Constitution Workshop',
                  date: 'May 15, 2025',
                  time: '9:00 AM - 1:00 PM',
                  location: 'Nairobi County Assembly Hall',
                  organizer: 'Civic Education Kenya',
                  type: 'Workshop',
                  billObjective: 'Constitutional Implementation'
                },
                {
                  title: 'Youth and Electoral Participation Seminar',
                  date: 'May 25, 2025',
                  time: '2:00 PM - 5:00 PM',
                  location: 'Kisumu Youth Center',
                  organizer: 'Kenya Youth Forum',
                  type: 'Seminar',
                  billObjective: 'Electoral Knowledge'
                },
                {
                  title: 'County Governance Public Forum',
                  date: 'June 3, 2025',
                  time: '10:00 AM - 3:00 PM',
                  location: 'Mombasa County Hall',
                  organizer: 'Uraia Trust',
                  type: 'Public Forum',
                  billObjective: 'Devolved Government'
                },
                {
                  title: 'Human Rights Awareness Training',
                  date: 'June 10, 2025',
                  time: '9:30 AM - 4:30 PM',
                  location: 'Nakuru Teachers College',
                  organizer: 'Kenya Human Rights Commission',
                  type: 'Training',
                  billObjective: 'Bill of Rights'
                },
                {
                  title: 'Civic Leadership Workshop',
                  date: 'June 17, 2025',
                  time: '8:30 AM - 2:00 PM',
                  location: 'Eldoret Town Hall',
                  organizer: 'Constitution and Reform Education Consortium',
                  type: 'Workshop',
                  billObjective: 'Service Delivery'
                }
              ].map((event, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline">{event.type}</Badge>
                        <span className="mx-2">•</span>
                        <Badge variant="secondary">{event.billObjective}</Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-medium">{event.date}</div>
                      <div className="text-sm text-muted-foreground">{event.time}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {event.location}
                    </div>
                    <div className="text-sm mt-1">
                      <span className="text-muted-foreground">Organized by:</span> {event.organizer}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm">Register</Button>
                    <Button variant="outline" size="sm">More Details</Button>
                    <Button variant="ghost" size="sm">Add to Calendar</Button>
                  </div>
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
