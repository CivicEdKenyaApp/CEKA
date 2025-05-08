import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
import { Search, Filter, BookOpen, FileText, Video, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import ResourceCard from '@/components/resources/ResourceCard';

// Sample data for categories and counties (would come from API in real implementation)
const categories = [
  'All Categories',
  'Constitution',
  'Rights',
  'Governance',
  'Participation',
  'Elections',
  'Judiciary',
  'Education',
  'Framework',
  'Finance'
];

const counties = [
  'All Counties', 'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 
  'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 
  'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 
  'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
];

// Mock resources data
const mockResources = [
  {
    id: "1",
    title: "Understanding the Constitution of Kenya",
    type: "Constitution",
    category: "Constitution",
    description: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
    url: "https://example.com/constitution.pdf",
    downloadUrl: "https://example.com/constitution.pdf",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Civic Education Kenya",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    billObjective: "Constitutional Implementation",
    county: "National"
  },
  {
    id: "2",
    title: "Blood Parliament: BBC Africa Eye Documentary",
    type: "Video",
    category: "Governance",
    description: "How the Kenyan Government handled the Kenyan youth rising up against economic injustice",
    url: "https://5dorfxxwfijb.share.zrok.io/s/JHapaymSwTHKCi5",
    downloadUrl: "https://5dorfxxwfijb.share.zrok.io/s/JHapaymSwTHKCi5?download=1",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Civic Education Kenya",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    billObjective: "Political System",
    county: "National"
  },
  {
    id: "3",
    title: "Your Rights as a Kenyan Citizen",
    type: "Infographic",
    category: "Rights",
    description: "Visual representation of fundamental rights guaranteed by the Constitution.",
    url: "https://example.com/rights-infographic.png",
    downloadUrl: "https://example.com/rights-infographic.png",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "Civic Education Kenya",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    billObjective: "Bill of Rights",
    county: "Nairobi, Mombasa"
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
    updated_at: new Date().toISOString(),
    billObjective: "Devolved Government",
    county: "All Counties"
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
    updated_at: new Date().toISOString(),
    billObjective: "Service Delivery",
    county: "National"
  },
  {
    id: "6",
    title: "Kenya's Electoral System",
    type: "Video",
    category: "Elections",
    description: "Explains how elections work in Kenya, from voter registration to results announcement.",
    url: "https://example.com/elections-video.mp4",
    downloadUrl: "https://example.com/elections-video.mp4",
    is_downloadable: true,
    uploadDate: new Date().toISOString(),
    uploadedBy: "IEBC",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    billObjective: "Electoral Knowledge",
    county: "National"
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
    updated_at: new Date().toISOString(),
    billObjective: "Constitutionalism",
    county: "National"
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
    updated_at: new Date().toISOString(),
    billObjective: "Constitutional Implementation",
    county: "National"
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
    updated_at: new Date().toISOString(),
    billObjective: "Constitutional Implementation",
    county: "National"
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
    updated_at: new Date().toISOString(),
    billObjective: "Devolved Government",
    county: "All Counties"
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
    updated_at: new Date().toISOString(),
    billObjective: "Service Delivery",
    county: "National"
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
    updated_at: new Date().toISOString(),
    billObjective: "Constitutional Implementation",
    county: "National"
  }
];

// This would be expanded with more mock data in a real implementation

const ResourceLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [selectedType, setSelectedType] = useState('All Types');
  const [resources, setResources] = useState(mockResources);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Simulate API call to fetch resources
    const fetchResources = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would be a Supabase query
        // For now, we're using the mock data
        
        // Simulate loading time
        setTimeout(() => {
          setResources(mockResources);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching resources:', error);
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Filter resources based on search query and selected filters
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All Categories' || 
      resource.category === selectedCategory;
      
    const matchesCounty = selectedCounty === 'All Counties' || 
      resource.county?.includes(selectedCounty);
      
    const matchesType = selectedType === 'All Types' || 
      resource.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesCounty && matchesType;
  });

  // Group resources by type for the tabs
  const constitutionResources = filteredResources.filter(r => r.type === 'Constitution');
  const documentResources = filteredResources.filter(r => r.type === 'Document' || r.type === 'PDF');
  const videoResources = filteredResources.filter(r => r.type === 'Video');
  const infographicResources = filteredResources.filter(r => r.type === 'Infographic');

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/resources" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Resource Hub
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Resource Library</h1>
            <p className="text-muted-foreground">
              Comprehensive collection of civic education resources
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button 
              variant={view === 'grid' ? "default" : "outline"} 
              size="sm"
              onClick={() => setView('grid')}
              className="hidden sm:flex"
            >
              Grid View
            </Button>
            <Button 
              variant={view === 'list' ? "default" : "outline"} 
              size="sm"
              onClick={() => setView('list')}
              className="hidden sm:flex"
            >
              List View
            </Button>
          </div>
        </div>
        
        {/* Advanced Search & Filter Section */}
        <Card className="p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title, description, keywords..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="category-select" className="block text-sm font-medium mb-1">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="county-select" className="block text-sm font-medium mb-1">County</label>
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger id="county-select">
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="type-select" className="block text-sm font-medium mb-1">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="type-select">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Types">All Types</SelectItem>
                  <SelectItem value="Constitution">Constitution</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Infographic">Infographic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-32 self-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSelectedCounty('All Counties');
                  setSelectedType('All Types');
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          
          {/* Active Filters */}
          {(searchQuery || selectedCategory !== 'All Categories' || selectedCounty !== 'All Counties' || selectedType !== 'All Types') && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {selectedCategory !== 'All Categories' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Category: {selectedCategory}
                  <button 
                    onClick={() => setSelectedCategory('All Categories')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {selectedCounty !== 'All Counties' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  County: {selectedCounty}
                  <button 
                    onClick={() => setSelectedCounty('All Counties')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {selectedType !== 'All Types' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Type: {selectedType}
                  <button 
                    onClick={() => setSelectedType('All Types')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredResources.length} resources
          </p>
        </div>
        
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>All Resources</span>
              <Badge variant="secondary" className="ml-1">{filteredResources.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="constitution" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Constitution</span>
              <Badge variant="secondary" className="ml-1">{constitutionResources.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
              <Badge variant="secondary" className="ml-1">{documentResources.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span>Videos</span>
              <Badge variant="secondary" className="ml-1">{videoResources.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="infographics" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>Infographics</span>
              <Badge variant="secondary" className="ml-1">{infographicResources.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="animate-pulse">
                      <div className="h-40 bg-muted rounded-md mb-4"></div>
                      <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-full mb-4"></div>
                      <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredResources.length > 0 ? (
              view === 'grid' ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredResources.map(resource => (
                    <ResourceCard
                      key={resource.id}
                      resource={{
                        id: resource.id,
                        title: resource.title,
                        description: resource.description,
                        type: resource.type,
                        uploadDate: resource.uploadDate,
                        uploadedBy: resource.uploadedBy,
                        downloadUrl: resource.downloadUrl,
                        status: undefined,
                        category: resource.category,
                        billObjective: resource.billObjective,
                        county: resource.county
                      }}
                      downloadable={resource.is_downloadable}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResources.map(resource => (
                    <Card key={resource.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <Badge className="self-start mb-1">{resource.type}</Badge>
                          <Link to={`/resource/${resource.id}`} className="hover:text-primary transition-colors">
                            <h3 className="font-semibold text-lg">{resource.title}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
                          
                          <div className="flex gap-2 mt-3">
                            <Button variant="default" size="sm" asChild>
                              <Link to={`/resources/${resource.id}`}>View Details</Link>
                            </Button>
                            {resource.is_downloadable && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={resource.downloadUrl} target="_blank" rel="noopener noreferrer">
                                  Download
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">No resources found</h2>
                <p className="text-muted-foreground mb-6">
                  No resources match your search criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="constitution">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-40 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded w-1/3"></div>
              </div>
            ) : constitutionResources.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {constitutionResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={{
                      id: resource.id,
                      title: resource.title,
                      description: resource.description,
                      type: resource.type,
                      uploadDate: resource.uploadDate,
                      uploadedBy: resource.uploadedBy,
                      downloadUrl: resource.downloadUrl,
                      status: undefined,
                      category: resource.category,
                      billObjective: resource.billObjective,
                      county: resource.county
                    }}
                    downloadable={resource.is_downloadable}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No constitution resources found</h2>
                <p className="text-muted-foreground mb-6">
                  No constitution resources match your search criteria.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Similar TabsContent for other tabs (documents, videos, infographics) */}
          <TabsContent value="documents">
            {documentResources.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documentResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={{
                      id: resource.id,
                      title: resource.title,
                      description: resource.description,
                      type: resource.type,
                      uploadDate: resource.uploadDate,
                      uploadedBy: resource.uploadedBy,
                      downloadUrl: resource.downloadUrl,
                      status: undefined,
                      category: resource.category,
                      billObjective: resource.billObjective,
                      county: resource.county
                    }}
                    downloadable={resource.is_downloadable}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No document resources found</h2>
                <p className="text-muted-foreground mb-6">
                  No document resources match your search criteria.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="videos">
            {videoResources.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videoResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={{
                      id: resource.id,
                      title: resource.title,
                      description: resource.description,
                      type: resource.type,
                      uploadDate: resource.uploadDate,
                      uploadedBy: resource.uploadedBy,
                      downloadUrl: resource.downloadUrl,
                      status: undefined,
                      category: resource.category,
                      billObjective: resource.billObjective,
                      county: resource.county
                    }}
                    downloadable={resource.is_downloadable}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No video resources found</h2>
                <p className="text-muted-foreground mb-6">
                  No video resources match your search criteria.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="infographics">
            {infographicResources.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {infographicResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={{
                      id: resource.id,
                      title: resource.title,
                      description: resource.description,
                      type: resource.type,
                      uploadDate: resource.uploadDate,
                      uploadedBy: resource.uploadedBy,
                      downloadUrl: resource.downloadUrl,
                      status: undefined,
                      category: resource.category,
                      billObjective: resource.billObjective,
                      county: resource.county
                    }}
                    downloadable={resource.is_downloadable}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No infographic resources found</h2>
                <p className="text-muted-foreground mb-6">
                  No infographic resources match your search criteria.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ResourceLibrary;
