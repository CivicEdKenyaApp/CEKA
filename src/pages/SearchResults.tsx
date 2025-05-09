
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import ResourceCard from '@/components/resources/ResourceCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

// Mock data for search results - this would be replaced with actual API calls
const mockResources = [
  {
    id: 1,
    title: "Understanding the Constitution of Kenya",
    description: "A comprehensive guide to the Kenyan Constitution",
    type: "pdf",
    category: "Constitution",
    imageUrl: "/placeholder.svg",
  },
  {
    id: 2,
    title: "How Laws are Made in Kenya",
    description: "The legislative process explained",
    type: "video",
    category: "Lawmaking",
    imageUrl: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Your Rights as a Kenyan Citizen",
    description: "Know your constitutional rights",
    type: "infographic",
    category: "Rights",
    imageUrl: "/placeholder.svg",
  }
];

const mockDiscussions = [
  {
    id: 1,
    title: "Discussion on Kenyan constitutional reforms",
    author: "Jane Mwangi",
    date: "2025-04-05",
    content: "What are your thoughts on the proposed constitutional amendments?",
    replies: 12
  },
  {
    id: 2,
    title: "Public participation in county governance",
    author: "David Omondi",
    date: "2025-04-03",
    content: "How can we improve public participation at the county level?",
    replies: 8
  }
];

const mockCampaigns = [
  {
    id: 1,
    title: "Youth Civic Education Initiative",
    organizer: "Kenya Youth Network",
    participants: 145,
    description: "A campaign to educate youth on their civic rights and responsibilities"
  },
  {
    id: 2,
    title: "Digital Rights Awareness",
    organizer: "Digital Kenya Coalition",
    participants: 89,
    description: "Promoting awareness about digital rights and internet freedom"
  }
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [activeTab, setActiveTab] = useState('all');
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSearchTerm(query);
    
    // Simulate API loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the URL search params here
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchTerm)}`);
  };
  
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
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={translate("Search...", language)}
                className="pl-9"
              />
            </div>
            <Button type="submit">{translate("Search", language)}</Button>
            <Button type="button" variant="outline" className="px-3">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">Filters</span>
            </Button>
          </div>
        </form>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">{translate("All Results", language)}</TabsTrigger>
            <TabsTrigger value="resources">{translate("Resources", language)}</TabsTrigger>
            <TabsTrigger value="discussions">{translate("Discussions", language)}</TabsTrigger>
            <TabsTrigger value="campaigns">{translate("Campaigns", language)}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-10">
            {/* Resources Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{translate("Resources", language)}</h2>
                <Button variant="link" asChild>
                  <a href={`/resources?search=${encodeURIComponent(query)}`}>
                    {translate("View all resources", language)}
                  </a>
                </Button>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : mockResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockResources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{translate("No resources found matching your search.", language)}</p>
              )}
            </div>
            
            <Separator />
            
            {/* Discussions Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{translate("Discussions", language)}</h2>
                <Button variant="link" asChild>
                  <a href={`/community?search=${encodeURIComponent(query)}`}>
                    {translate("View all discussions", language)}
                  </a>
                </Button>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : mockDiscussions.length > 0 ? (
                <div className="space-y-4">
                  {mockDiscussions.map(discussion => (
                    <div key={discussion.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg">
                        <a href={`/community/discussions/${discussion.id}`} className="hover:text-kenya-green">
                          {discussion.title}
                        </a>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        {translate("By", language)} {discussion.author} • {new Date(discussion.date).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">{discussion.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{translate("No discussions found matching your search.", language)}</p>
              )}
            </div>
            
            <Separator />
            
            {/* Campaigns Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{translate("Campaigns", language)}</h2>
                <Button variant="link" asChild>
                  <a href={`/community?tab=campaigns&search=${encodeURIComponent(query)}`}>
                    {translate("View all campaigns", language)}
                  </a>
                </Button>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-40 bg-muted/50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : mockCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockCampaigns.map(campaign => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg">
                        <a href={`/community/campaigns/${campaign.id}`} className="hover:text-kenya-green">
                          {campaign.title}
                        </a>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        {translate("Organized by", language)} {campaign.organizer} • 
                        {campaign.participants} {translate("participants", language)}
                      </p>
                      <p className="text-muted-foreground">{campaign.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{translate("No campaigns found matching your search.", language)}</p>
              )}
            </div>
          </TabsContent>
          
          {/* Resources Tab Content */}
          <TabsContent value="resources">
            {/* Full resources search results would go here */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : mockResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...mockResources, ...mockResources].map((resource, index) => (
                  <ResourceCard key={`${resource.id}-${index}`} resource={{...resource, id: `${resource.id}-${index}`}} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{translate("No resources found matching your search.", language)}</p>
            )}
          </TabsContent>
          
          {/* Discussions Tab Content */}
          <TabsContent value="discussions">
            {/* Full discussions search results would go here */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : mockDiscussions.length > 0 ? (
              <div className="space-y-4">
                {[...mockDiscussions, ...mockDiscussions].map((discussion, index) => (
                  <div key={`${discussion.id}-${index}`} className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">
                      <a href={`/community/discussions/${discussion.id}`} className="hover:text-kenya-green">
                        {discussion.title}
                      </a>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      {translate("By", language)} {discussion.author} • {new Date(discussion.date).toLocaleDateString()}
                    </p>
                    <p className="text-muted-foreground">{discussion.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{translate("No discussions found matching your search.", language)}</p>
            )}
          </TabsContent>
          
          {/* Campaigns Tab Content */}
          <TabsContent value="campaigns">
            {/* Full campaigns search results would go here */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-40 bg-muted/50 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : mockCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...mockCampaigns, ...mockCampaigns].map((campaign, index) => (
                  <div key={`${campaign.id}-${index}`} className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">
                      <a href={`/community/campaigns/${campaign.id}`} className="hover:text-kenya-green">
                        {campaign.title}
                      </a>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      {translate("Organized by", language)} {campaign.organizer} • 
                      {campaign.participants} {translate("participants", language)}
                    </p>
                    <p className="text-muted-foreground">{campaign.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{translate("No campaigns found matching your search.", language)}</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SearchResults;
