import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Filter, Download, Book, FileText, Video, Image as ImageIcon, 
  ChevronDown, CheckCircle2, X, SortAsc, SortDesc, List, Grid3X3, BookOpen 
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
import { useAuth } from '@/App';
import { motion } from 'framer-motion';

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
}

// Mock data with expanded resource collection
const mockResources: Resource[] = [
  {
    id: "1",
    title: "Understanding the Kenyan Constitution",
    description: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
    type: "pdf",
    category: "Constitution",
    url: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/resource-files/The_Constitution_of_Kenya_2010.pdf",
    thumbnail: "/assets/constitution-thumbnail.jpg",
    dateAdded: "2023-05-15",
    author: "Civic Education Kenya",
    views: 1245,
    downloads: 521,
    tags: ["constitution", "governance", "rights"],
    featured: true
  },
  {
    id: "2",
    title: "Blood Parliament: BBC Africa Eye Documentary",
    description: "How the Kenyan Government handled the Kenyan youth rising up against economic injustice",
    type: "video",
    category: "Governance",
    url: "https://5dorfxxwfijb.share.zrok.io/s/JHapaymSwTHKCi5",
    thumbnail: "/assets/video-thumbnail.jpg",
    dateAdded: "2023-06-22",
    author: "BBC Africa",
    views: 890,
    downloads: 152,
    tags: ["democracy", "protest", "youth", "politics"],
    featured: true
  },
  {
    id: "3",
    title: "Your Rights as a Kenyan Citizen",
    description: "Visual representation of fundamental rights guaranteed by the Constitution.",
    type: "image",
    category: "Rights",
    url: "/assets/rights-infographic.png",
    thumbnail: "/assets/rights-thumbnail.jpg",
    dateAdded: "2023-07-03",
    author: "Civic Education Kenya",
    views: 732,
    downloads: 198,
    tags: ["rights", "citizenship", "infographic"],
    featured: true
  },
  {
    id: "4",
    title: "The Legislative Process in Kenya",
    description: "A detailed explanation of how laws are made in Kenya, from drafting to presidential assent.",
    type: "pdf",
    category: "Lawmaking",
    url: "/documents/legislative-process.pdf",
    dateAdded: "2023-04-18",
    author: "Kenya Law Reform Commission",
    views: 612,
    downloads: 287,
    tags: ["lawmaking", "parliament", "bills", "legislation"]
  },
  {
    id: "5",
    title: "County Governments Explained",
    description: "Structure, functions, and responsibilities of county governments under devolution.",
    type: "video",
    category: "Devolution",
    url: "/videos/county-governments.mp4",
    dateAdded: "2023-08-09",
    author: "Council of Governors",
    views: 543,
    downloads: 122,
    tags: ["devolution", "counties", "governance", "local government"],
    county: "All Counties"
  },
  {
    id: "6",
    title: "How to Participate in Public Forums",
    description: "A citizen's guide to effective participation in public participation forums.",
    type: "pdf",
    category: "Public Participation",
    url: "/documents/public-participation.pdf",
    dateAdded: "2023-09-12",
    author: "Transparency International Kenya",
    views: 398,
    downloads: 203,
    tags: ["public participation", "citizen engagement", "democracy"]
  },
  {
    id: "7",
    title: "Understanding Tax Obligations",
    description: "A simple guide to understanding your tax obligations as a Kenyan citizen or business.",
    type: "pdf",
    category: "Taxation",
    url: "/documents/tax-guide.pdf",
    dateAdded: "2023-05-22",
    author: "Kenya Revenue Authority",
    views: 876,
    downloads: 342,
    tags: ["taxation", "finance", "compliance"]
  },
  {
    id: "8",
    title: "Elections in Kenya: Process and Procedures",
    description: "Comprehensive guide to electoral processes and procedures in Kenya.",
    type: "video",
    category: "Elections",
    url: "/videos/election-process.mp4",
    dateAdded: "2023-02-14",
    author: "Independent Electoral and Boundaries Commission",
    views: 1122,
    downloads: 276,
    tags: ["elections", "democracy", "voting", "IEBC"]
  },
  {
    id: "9",
    title: "Kenya's Foreign Policy Framework",
    description: "Overview of Kenya's foreign policy principles, objectives and implementation strategies.",
    type: "pdf",
    category: "Foreign Policy",
    url: "/documents/foreign-policy.pdf",
    dateAdded: "2023-07-18",
    author: "Ministry of Foreign Affairs",
    views: 321,
    downloads: 145,
    tags: ["foreign policy", "international relations", "diplomacy"]
  },
  {
    id: "10",
    title: "Understanding Land Rights in Kenya",
    description: "Guide to land ownership, registration, and dispute resolution in Kenya.",
    type: "pdf",
    category: "Land Rights",
    url: "/documents/land-rights.pdf",
    dateAdded: "2023-06-05",
    author: "Kenya Land Alliance",
    views: 892,
    downloads: 433,
    tags: ["land", "property", "rights", "ownership"]
  },
  {
    id: "11",
    title: "Kenya's National Values and Principles",
    description: "Visual guide to the national values and principles of governance in the Constitution.",
    type: "image",
    category: "National Values",
    url: "/images/national-values.png",
    dateAdded: "2023-08-24",
    author: "National Cohesion and Integration Commission",
    views: 456,
    downloads: 219,
    tags: ["values", "principles", "patriotism", "unity"]
  },
  {
    id: "12",
    title: "Introduction to Kenya's Judicial System",
    description: "Structure, functions, and processes of Kenya's judiciary system explained.",
    type: "video",
    category: "Judiciary",
    url: "/videos/judiciary-explainer.mp4",
    dateAdded: "2023-06-30",
    author: "Judiciary of Kenya",
    views: 678,
    downloads: 234,
    tags: ["judiciary", "courts", "justice", "legal system"]
  },
  {
    id: "13",
    title: "Climate Change Policies in Kenya",
    description: "Overview of Kenya's climate change policies, strategies, and action plans.",
    type: "pdf",
    category: "Environment",
    url: "/documents/climate-policies.pdf",
    dateAdded: "2023-04-22",
    author: "Ministry of Environment and Forestry",
    views: 412,
    downloads: 189,
    tags: ["climate change", "environment", "policy", "sustainability"]
  },
  {
    id: "14",
    title: "Women's Political Representation in Kenya",
    description: "Analysis of women's representation in political and decision-making processes in Kenya.",
    type: "pdf",
    category: "Gender & Inclusion",
    url: "/documents/women-representation.pdf",
    dateAdded: "2023-03-08",
    author: "UN Women Kenya",
    views: 532,
    downloads: 267,
    tags: ["gender", "women", "representation", "politics"]
  },
  {
    id: "15",
    title: "Youth Participation in Governance",
    description: "Guide to opportunities and challenges for youth participation in governance.",
    type: "video",
    category: "Youth",
    url: "/videos/youth-governance.mp4",
    dateAdded: "2023-07-29",
    author: "Youth Senate Kenya",
    views: 789,
    downloads: 312,
    tags: ["youth", "governance", "participation", "empowerment"]
  }
];

// Extract unique categories for filtering
const allCategories = Array.from(new Set(mockResources.map(resource => resource.category)));
const allTypes = Array.from(new Set(mockResources.map(resource => resource.type)));

const ResourceLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const { language } = useLanguage();

  // State for filters and search



  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'alphabetical'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  // Filter and sort resources based on current state
  const filteredResources = useMemo(() => {
    let filtered = mockResources;
    
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
  }, [mockResources, searchTerm, selectedCategories, selectedTypes, sortBy, sortDirection]);

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






    // In a real application, this would initiate actual downloads
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground opacity-70 hover:opacity-100'}`}
                  onClick={() => toggleResourceSelection(resource.id)}
                >
                  {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                </Button>
              </div>
              <div className="bg-muted aspect-video relative flex items-center justify-center">
                {resource.thumbnail ? (
                  <img 
                    src={resource.thumbnail} 
                    alt={resource.title} 
                    className="w-full h-full object-cover"
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
                    <Button size="sm" variant="ghost" onClick={() => toggleResourceSelection(resource.id)}>
                      {isSelected ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Download className="h-4 w-4 mr-1" />}
                      {isSelected ? "Selected" : "Select"}
                    </Button>
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
                {filteredResources.length === 0 ? (
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
                  {resourcesByCategory[category]?.length === 0 ? (
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
