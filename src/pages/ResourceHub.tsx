import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, Download, Search, Filter, BookOpen, 
  Video, FileText, Image as ImageIcon, Plus, 
  Clock, Eye, Users, TrendingUp, Star 
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

const ResourceHub = () => {
  const [resources, setResources] = useState(mockResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast()
  const { session } = useAuth();
  const navigate = useNavigate();

  const categories = ['All', ...new Set(mockResources.map(resource => resource.category))];

  const filteredResources = resources.filter(resource => {
    const searchMatch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = categoryFilter === 'All' || resource.category === categoryFilter;
    return searchMatch && categoryMatch;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    } else if (sortOrder === 'popular') {
      return (b.views + b.downloads) - (a.views + a.downloads);
    }
    return 0;
  });

  const handleUploadClick = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload resources",
        variant: "destructive",
      })
      navigate('/auth');
      return;
    }
    navigate('/resource-upload');
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold">Resource Hub</h1>
            <p className="text-muted-foreground">Explore curated resources for civic education</p>
          </div>
          <Button onClick={handleUploadClick} className="bg-kenya-green hover:bg-kenya-green/90">
            <Plus className="mr-2 h-4 w-4" />
            Upload Resource
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {/* Filters */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    type="text"
                    id="search"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={setCategoryFilter} defaultValue={categoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sort">Sort By</Label>
                  <Select onValueChange={setSortOrder} defaultValue={sortOrder}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource List */}
          <div className="md:col-span-3">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {sortedResources.map(resource => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle>{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    <Badge variant="secondary" className="mt-2">{resource.category}</Badge>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <Eye className="mr-1 inline-block h-4 w-4" /> {resource.views}
                      <Download className="ml-2 mr-1 inline-block h-4 w-4" /> {resource.downloads}
                    </div>
                    <Button variant="outline" asChild>
                      <Link to={resource.url} target="_blank" rel="noopener noreferrer">
                        View Resource
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResourceHub;
