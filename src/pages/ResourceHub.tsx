
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Filter, ArrowDown, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceTypeFilter from '@/components/resources/ResourceTypeFilter';
import CivicEducationQuiz from '@/components/resources/CivicEducationQuiz';
import OfflineResources from '@/components/resources/OfflineResources';

const mockResources = [
  {
    id: 1,
    title: "Understanding the Constitution of Kenya",
    description: "A comprehensive guide to the Kenyan Constitution",
    type: "pdf",
    category: "Constitution",
    imageUrl: "/placeholder.svg",
    url: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Documents/Constitution/constitution-kenya-2010.pdf",
    downloadUrl: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Documents/Constitution/constitution-kenya-2010.pdf?download=1",
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
  },
  {
    id: 4,
    title: "County Government Structure",
    description: "Understanding devolution and county governance",
    type: "pdf",
    category: "Governance",
    imageUrl: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Public Participation Guide",
    description: "How to get involved in your government's decision-making",
    type: "video",
    category: "Participation",
    imageUrl: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Electoral Process in Kenya",
    description: "A step-by-step guide to elections in Kenya",
    type: "infographic",
    category: "Elections",
    imageUrl: "/placeholder.svg",
  }
];

const heroResources = [
  {
    id: "1",
    title: "Understanding the Constitution of Kenya",
    description: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
    imageUrl: "/placeholder.svg",
    type: "pdf",
    category: "Constitution",
    url: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Documents/Constitution/constitution-kenya-2010.pdf",
    downloadUrl: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/resources/Documents/Constitution/constitution-kenya-2010.pdf?download=1"
  },
  {
    id: "2",
    title: "How Laws are Made in Kenya",
    description: "The complete legislative process from bill drafting to presidential assent.",
    imageUrl: "/placeholder.svg",
    type: "video",
    category: "Lawmaking"
  },
  {
    id: "3",
    title: "Your Rights as a Kenyan Citizen",
    description: "Visual guide to fundamental rights guaranteed by the Constitution.",
    imageUrl: "/placeholder.svg",
    type: "infographic",
    category: "Rights"
  }
];

const ResourceHub = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedResources, setSelectedResources] = useState<number[]>([]);

  const handleResourceSelection = (resourceId: number) => {
    if (selectedResources.includes(resourceId)) {
      setSelectedResources(selectedResources.filter(id => id !== resourceId));
    } else {
      setSelectedResources([...selectedResources, resourceId]);
    }
  };

  const enhancedMockResources = React.useMemo(() => {
    const enhancedResources = mockResources.map(resource => ({
      ...resource,
      isSelected: selectedResources.includes(resource.id)
    }));
    
    return enhancedResources;
  }, [mockResources, selectedResources]);

  const categories = ["All", "Constitution", "Lawmaking", "Rights", "Governance", "Elections"];

  return (
    <Layout>
      <section className="bg-gradient-to-b from-background to-muted/30 pt-8 pb-12">
        <div className="container space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{translate("Educational Resources", language)}</h1>
              <p className="text-muted-foreground mt-1">
                {translate("Learn about governance, rights, and civic processes.", language)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={translate("Search resources...", language)}
                  className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {translate("Filter", language)}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {heroResources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge>{resource.type}</Badge>
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                  <Link to={`/resource/${resource.id}`} className="hover:underline">
                    <CardTitle>{resource.title}</CardTitle>
                  </Link>
                </CardHeader>
                <CardContent>
                  <CardDescription>{resource.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      {translate(
                `View ${
                  resource.type === "pdf"
                  ? "PDF"
                  : resource.type === "video"
                  ? "Video"
                  : "Infographic"
                }`,
                language
              )}
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold">{translate("Browse Resources", language)}</h2>
            <Button variant="outline" className="mt-2 sm:mt-0">
              <Link to="/resource-library" className="flex items-center">
                {translate("View All Resources", language)}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="mb-4">
                {categories.map((category) => (
                  <TabsTrigger key={category.toLowerCase()} value={category.toLowerCase()}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              <div>
                <ResourceTypeFilter />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {enhancedMockResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onToggleSelect={() => handleResourceSelection(resource.id)}
                    />
                  ))}
                </div>
                <div className="flex justify-center mt-8">
                  <Button className="gap-2" asChild>
                    <Link to="/resource-library">
                      <Download className="h-4 w-4" />
                      {translate("Download Selected Resources", language)}
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>

            {categories.slice(1).map((category) => (
              <TabsContent key={category.toLowerCase()} value={category.toLowerCase()} className="mt-0">
                <div>
                  <ResourceTypeFilter />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {enhancedMockResources
                      .filter(resource => resource.category === category)
                      .map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          onToggleSelect={() => handleResourceSelection(resource.id)}
                        />
                      ))}
                  </div>
                  <div className="flex justify-center mt-8">
                    <Button className="gap-2" asChild>
                      <Link to="/resource-library">
                        <Download className="h-4 w-4" />
                        {translate("Download Selected Resources", language)}
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <Separator />

      <section className="py-12 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">{translate("Test Your Knowledge", language)}</h2>
          <CivicEducationQuiz />
        </div>
      </section>

      <Separator />

      <section className="py-12">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">{translate("Offline Resources", language)}</h2>
          <OfflineResources />
        </div>
      </section>
    </Layout>
  );
};

export default ResourceHub;
