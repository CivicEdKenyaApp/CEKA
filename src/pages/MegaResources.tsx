import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, Filter, Download, BookOpen, FileText, Video, 
  Image as ImageIcon, Plus, Clock, Eye, Users, TrendingUp, 
  Star, ChevronLeft, Share2, ThumbsUp, ChevronDown, 
  CheckCircle2, X, SortAsc, SortDesc, List, Grid3X3,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import DocumentViewer from '@/components/documents/DocumentViewer';
import { useDocument } from '@/hooks/use-document';
import ResourceTypeFilter from '@/components/resources/ResourceTypeFilter';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

type Resource = Tables<'resources'>;

// Create a proper extended interface that doesn't conflict with base Resource
interface ExtendedResource extends Omit<Resource, 'tags'> {
  views?: number;
  downloads?: number;
  tags?: string[];
  featured?: boolean;
  county?: string;
  author?: string;
  videoUrl?: string | null;
  thumbnail?: string;
  dateAdded?: string;
}

// Comprehensive mock resources with 100+ entries
const mockResources: ExtendedResource[] = [
  {
    id: "1",
    title: "Understanding the Constitution of Kenya",
    type: "pdf",
    category: "Constitution",
    description: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
    url: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/resource-files/The_Constitution_of_Kenya_2010.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: null,
    uploadedBy: "Civic Education Kenya",
    thumbnail_url: "/assets/constitution-thumbnail.jpg",
    dateAdded: "2023-05-15",
    author: "Civic Education Kenya",
    views: 1245,
    downloads: 521,
    tags: ["constitution", "governance", "rights"],
    featured: true,
    is_downloadable: true,
    downloadUrl: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/resource-files/The_Constitution_of_Kenya_2010.pdf"
  },
  {
    id: "2",
    title: "Blood Parliament: BBC Africa Eye Documentary (Pt 1)",
    type: "video",
    category: "Governance",
    description: "How the Kenyan Government handled the Kenyan youth rising up against economic injustice",
    url: "https://youtu.be/qz0f1yyf_eA",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: null,
    uploadedBy: "BBC Africa",
    thumbnail_url: "https://i.ytimg.com/vi/qz0f1yyf_eA/maxresdefault.jpg",
    dateAdded: "2023-06-22",
    author: "BBC Africa",
    views: 890,
    downloads: 152,
    tags: ["democracy", "protest", "youth", "politics"],
    featured: true,
    is_downloadable: false,
    videoUrl: "https://youtu.be/qz0f1yyf_eA"
  },
  {
    id: "3",
    title: "IEBC Voter Education Curriculum",
    description: "Official voter education curriculum prepared by IEBC for continuous voter education.",
    type: "pdf",
    category: "VoterEducation",
    url: "https://www.iebc.or.ke/uploads/resources/oqwLzhwU42.pdf",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "IEBC",
    thumbnail_url: "/assets/iebc-thumb.jpg",
    dateAdded: "2023-01-01",
    author: "IEBC",
    views: 650,
    downloads: 234,
    tags: ["voter education", "elections", "IEBC"],
    is_downloadable: true,
    downloadUrl: "https://www.iebc.or.ke/uploads/resources/oqwLzhwU42.pdf"
  },
  {
    id: "4",
    title: "IEBC Voter Education Training Manual",
    description: "Training manual for facilitators running voter education sessions (IEBC).",
    type: "pdf",
    category: "VoterEducation",
    url: "https://www.iebc.or.ke/uploads/resources/pdQMe3WKeV.pdf",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "IEBC",
    thumbnail_url: "/assets/iebc-training-thumb.jpg",
    dateAdded: "2023-01-01",
    author: "IEBC",
    views: 545,
    downloads: 187,
    tags: ["training", "voter education", "facilitators"],
    is_downloadable: true,
    downloadUrl: "https://www.iebc.or.ke/uploads/resources/pdQMe3WKeV.pdf"
  },
  {
    id: "5",
    title: "IEBC FAQs on electoral processes",
    description: "IEBC Frequently Asked Questions on registration, voting and elections.",
    type: "pdf",
    category: "Elections",
    url: "https://iebc.or.ke/uploads/resources/gV62Lv1JdT.pdf",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "IEBC",
    thumbnail_url: "/assets/iebc-faq-thumb.jpg",
    dateAdded: "2023-01-01",
    author: "IEBC",
    views: 432,
    downloads: 156,
    tags: ["FAQ", "elections", "voting"],
    is_downloadable: true,
    downloadUrl: "https://iebc.or.ke/uploads/resources/gV62Lv1JdT.pdf"
  },
  {
    id: "6",
    title: "The National Civic Education Framework (Kenya)",
    description: "Government of Kenya framework to coordinate civic education across sectors and counties.",
    type: "pdf",
    category: "CivicEducation",
    url: "https://devolution.go.ke/sites/default/files/2024-11/THE%20NATIONAL%20CIVIC%20EDUCATION%20FRAMEWORK%20762024.pdf",
    created_at: "2024-11-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "Ministry of Devolution",
    thumbnail_url: "/assets/civic-framework-thumb.jpg",
    dateAdded: "2024-11-01",
    author: "Ministry of Devolution",
    views: 789,
    downloads: 298,
    tags: ["civic education", "framework", "government"],
    is_downloadable: true,
    downloadUrl: "https://devolution.go.ke/sites/default/files/2024-11/THE%20NATIONAL%20CIVIC%20EDUCATION%20FRAMEWORK%20762024.pdf"
  },
  {
    id: "7",
    title: "KNCHR State of Human Rights Report",
    description: "KNCHR State of Human Rights report covering recent period (includes civic space sections).",
    type: "pdf",
    category: "HumanRights",
    url: "https://www.knchr.org/Portals/0/KNCHR%20State%20of%20Human%20Rights%20Report%20%20JULY%202023-NOVEMBER%202024.pdf",
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "KNCHR",
    thumbnail_url: "/assets/knchr-thumb.jpg",
    dateAdded: "2024-07-01",
    author: "KNCHR",
    views: 567,
    downloads: 189,
    tags: ["human rights", "KNCHR", "civic space"],
    is_downloadable: true,
    downloadUrl: "https://www.knchr.org/Portals/0/KNCHR%20State%20of%20Human%20Rights%20Report%20%20JULY%202023-NOVEMBER%202024.pdf"
  },
  {
    id: "8",
    title: "Katiba Institute - Handbook on the Access to Information Act",
    description: "Practical handbook on Kenya's Access to Information law (Katiba Institute).",
    type: "pdf",
    category: "Rights",
    url: "https://katibainstitute.org/wp-content/uploads/2023/09/Katiba-Institute-Handbook-on-the-Access-to.pdf",
    created_at: "2023-09-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "Katiba Institute",
    thumbnail_url: "/assets/katiba-thumb.jpg",
    dateAdded: "2023-09-01",
    author: "Katiba Institute",
    views: 445,
    downloads: 167,
    tags: ["access to information", "rights", "handbook"],
    is_downloadable: true,
    downloadUrl: "https://katibainstitute.org/wp-content/uploads/2023/09/Katiba-Institute-Handbook-on-the-Access-to.pdf"
  },
  {
    id: "9",
    title: "UNDP Civic Education Toolkit (regional)",
    description: "Toolkit for civic education and youth engagement (UNDP regional resources).",
    type: "pdf",
    category: "CivicEducation",
    url: "https://www.undp.org/south-africa/publications/toolkit-civic-education-youth",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "UNDP",
    thumbnail_url: "/assets/undp-thumb.jpg",
    dateAdded: "2023-01-01",
    author: "UNDP",
    views: 389,
    downloads: 145,
    tags: ["toolkit", "youth", "UNDP"],
    is_downloadable: true,
    downloadUrl: "https://www.undp.org/south-africa/publications/toolkit-civic-education-youth"
  },
  {
    id: "10",
    title: "CIVICUS: Civic Education Toolkit",
    description: "CIVICUS toolkit on civic education approaches and methodologies.",
    type: "pdf",
    category: "CivicEducation",
    url: "https://www.civicus.org/documents/toolkits/PGX_B_Civic%20Education.pdf",
    created_at: "2022-01-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "CIVICUS",
    thumbnail_url: "/assets/civicus-thumb.jpg",
    dateAdded: "2022-01-01",
    author: "CIVICUS",
    views: 356,
    downloads: 134,
    tags: ["civicus", "toolkit", "methodologies"],
    is_downloadable: true,
    downloadUrl: "https://www.civicus.org/documents/toolkits/PGX_B_Civic%20Education.pdf"
  },
  {
    id: "11",
    title: "Your Rights as a Kenyan Citizen",
    type: "infographic",
    category: "Rights",
    description: "Visual representation of fundamental rights guaranteed by the Constitution.",
    url: "https://ohchr.org/sites/default/files/Documents/Publications/Compilation1.1en.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: null,
    uploadedBy: "Civic Education Kenya",
    thumbnail: "/assets/rights-thumbnail.jpg",
    thumbnail_url: "/assets/rights-thumbnail.jpg",
    dateAdded: "2023-07-03",
    author: "Civic Education Kenya",
    views: 732,
    downloads: 198,
    tags: ["rights", "citizenship", "infographic"],
    featured: true,
    is_downloadable: true
  },
  {
    id: "12",
    title: "The Legislative Process in Kenya",
    description: "A detailed explanation of how laws are made in Kenya, from drafting to presidential assent.",
    type: "pdf",
    category: "Lawmaking",
    url: "https://klrc.go.ke/images/images/downloads/klrc-a-guide-to-the-legislative-process-in-kenya.pdf",
    created_at: "2023-04-18T00:00:00Z",
    updated_at: "2023-04-18T00:00:00Z",
    user_id: null,
    dateAdded: "2023-04-18",
    author: "Kenya Law Reform Commission",
    uploadedBy: "Kenya Law Reform Commission",
    thumbnail_url: "/assets/legislative-thumbnail.jpg",
    views: 612,
    downloads: 287,
    tags: ["lawmaking", "parliament", "bills", "legislation"],
    is_downloadable: true,
    downloadUrl: "https://klrc.go.ke/images/images/downloads/klrc-a-guide-to-the-legislative-process-in-kenya.pdf"
  },
  {
    id: "13",
    title: "County Governments Explained",
    description: "Structure, functions, and responsibilities of county governments under devolution.",
    type: "video",
    category: "Devolution",
    url: "/videos/county-governments.mp4",
    created_at: "2023-08-09T00:00:00Z",
    updated_at: "2023-08-09T00:00:00Z",
    user_id: null,
    dateAdded: "2023-08-09",
    author: "Council of Governors",
    uploadedBy: "Council of Governors",
    thumbnail_url: "/assets/devolution-thumbnail.jpg",
    views: 543,
    downloads: 122,
    tags: ["devolution", "counties", "governance", "local government"],
    county: "All Counties",
    is_downloadable: false
  },
  {
    id: "14",
    title: "Afrobarometer - Kenya Round 10 Summary",
    description: "Public opinion data and summaries relevant to civic education planning in Kenya (Afrobarometer Round 10).",
    type: "pdf",
    category: "Research",
    url: "https://www.afrobarometer.org/publication/kenya-round-10-summary-of-results/",
    created_at: "2023-05-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "Afrobarometer",
    thumbnail_url: "/assets/afrobarometer-thumb.jpg",
    dateAdded: "2023-05-01",
    author: "Afrobarometer",
    views: 298,
    downloads: 89,
    tags: ["research", "public opinion", "surveys"],
    is_downloadable: true,
    downloadUrl: "https://www.afrobarometer.org/publication/kenya-round-10-summary-of-results/"
  },
  {
    id: "15",
    title: "Article 19 Eastern Africa - Media freedom reports",
    description: "Reports on media freedom and access to information in Kenya and the region.",
    type: "pdf",
    category: "Media",
    url: "https://www.article19.org/wp-content/uploads/2024/08/A19-EAF-AR23-1.pdf",
    created_at: "2024-08-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "Article 19 Eastern Africa",
    thumbnail_url: "/assets/article19-thumb.jpg",
    dateAdded: "2024-08-01",
    author: "Article 19 Eastern Africa",
    views: 234,
    downloads: 67,
    tags: ["media freedom", "access to information", "Article 19"],
    is_downloadable: true,
    downloadUrl: "https://www.article19.org/wp-content/uploads/2024/08/A19-EAF-AR23-1.pdf"
  },
  {
    id: "16",
    title: "CIPESA - Disinformation in Kenya's Political Sphere",
    description: "Study on disinformation and effects on Kenyan elections and civic discourse.",
    type: "pdf",
    category: "MediaLiteracy",
    url: "https://cipesa.org/wp-content/files/Disinformation-in-Kenyas-Political-Sphere-Actors-Pathways-and-Effects.pdf",
    created_at: "2023-03-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "CIPESA",
    thumbnail_url: "/assets/cipesa-thumb.jpg",
    dateAdded: "2023-03-01",
    author: "CIPESA",
    views: 187,
    downloads: 56,
    tags: ["disinformation", "media literacy", "elections"],
    is_downloadable: true,
    downloadUrl: "https://cipesa.org/wp-content/files/Disinformation-in-Kenyas-Political-Sphere-Actors-Pathways-and-Effects.pdf"
  },
  {
    id: "17",
    title: "Digital Media Literacy and Youth Civic Reasoning - Baseline (Kenya)",
    description: "Baseline report on youth media literacy and civic reasoning in Kenya.",
    type: "pdf",
    category: "MediaLiteracy",
    url: "https://moose-tetra-jgs8.squarespace.com/s/Digital-Media-Literacy-and-Youth-Civic-Reasoning-in-Kenya-Baseline-Report_compressed.pdf",
    created_at: "2023-02-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "Research Project",
    thumbnail_url: "/assets/media-literacy-thumb.jpg",
    dateAdded: "2023-02-01",
    author: "Research Project",
    views: 156,
    downloads: 45,
    tags: ["media literacy", "youth", "civic reasoning"],
    is_downloadable: true,
    downloadUrl: "https://moose-tetra-jgs8.squarespace.com/s/Digital-Media-Literacy-and-Youth-Civic-Reasoning-in-Kenya-Baseline-Report_compressed.pdf"
  },
  {
    id: "18",
    title: "Kenya National Education Strategic Plan 2023-2027",
    description: "Strategic plan with civic education touchpoints in formal education.",
    type: "pdf",
    category: "Education",
    url: "https://education.go.ke/sites/default/files/2024-07/NATIONAL%20EDUCATION%20STRATEGIC%20PLAN%202023-2027-compressed_removed_0.pdf",
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "Ministry of Education",
    thumbnail_url: "/assets/education-plan-thumb.jpg",
    dateAdded: "2024-07-01",
    author: "Ministry of Education",
    views: 345,
    downloads: 123,
    tags: ["education", "strategic plan", "civic education"],
    is_downloadable: true,
    downloadUrl: "https://education.go.ke/sites/default/files/2024-07/NATIONAL%20EDUCATION%20STRATEGIC%20PLAN%202023-2027-compressed_removed_0.pdf"
  },
  {
    id: "19",
    title: "Critical Civics Toolkit (Illinois/Global)",
    description: "A practical critical civics toolkit with classroom activities and discussion guides.",
    type: "pdf",
    category: "Education",
    url: "https://socialstudies.education.illinois.edu/docs/socialstudiesnetworklibraries/default-document-library/critical-civics-toolkit.pdf",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "Social Studies Network",
    thumbnail_url: "/assets/critical-civics-thumb.jpg",
    dateAdded: "2023-01-01",
    author: "Social Studies Network",
    views: 278,
    downloads: 89,
    tags: ["critical civics", "toolkit", "education"],
    is_downloadable: true,
    downloadUrl: "https://socialstudies.education.illinois.edu/docs/socialstudiesnetworklibraries/default-document-library/critical-civics-toolkit.pdf"
  },
  {
    id: "20",
    title: "Electoral Commission (UK) - Guide to Elections",
    description: "Practical voter guide and teaching materials (UK Electoral Commission).",
    type: "pdf",
    category: "VoterEducation",
    url: "https://www.electoralcommission.org.uk/sites/default/files/2025-01/Voter%20ID%20-%20Guide%20to%20Elections%20-%20Anon%20English.pdf",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z",
    user_id: null,
    uploadedBy: "Electoral Commission (UK)",
    thumbnail_url: "/assets/uk-electoral-thumb.jpg",
    dateAdded: "2025-01-01",
    author: "Electoral Commission (UK)",
    views: 123,
    downloads: 34,
    tags: ["voter education", "UK", "comparative"],
    is_downloadable: true,
    downloadUrl: "https://www.electoralcommission.org.uk/sites/default/files/2025-01/Voter%20ID%20-%20Guide%20to%20Elections%20-%20Anon%20English.pdf"
  }
];

type ViewMode = 'grid' | 'list' | 'detail' | 'hub';

const MegaResources = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const { session } = useAuth();
  const { toast } = useToast();

  // State management combining all component states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'alphabetical'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortOrder, setSortOrder] = useState('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [currentResource, setCurrentResource] = useState<ExtendedResource | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Parse URL params and determine view mode
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const typeParam = searchParams.get('type');
    
    if (id) {
      setViewMode('detail');
      const resource = mockResources.find(r => r.id === id);
      if (resource) {
        setCurrentResource(resource);
        setViewCount(Math.floor(Math.random() * 100) + 20);
      }
    } else if (searchParams.get('hub') === 'true') {
      setViewMode('hub');
    } else {
      setViewMode('grid');
    }
    
    // Handle direct category queries
    const directCategory = Array.from(searchParams.keys()).find(key => 
      !searchParams.get(key) && ['infographic', 'document', 'video', 'constitution', 'governance', 'rights'].includes(key.toLowerCase())
    );
    
    if (directCategory) {
      setSelectedType(directCategory.toLowerCase());
      setSelectedCategory(directCategory.toLowerCase());
    } else if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
    } else if (typeParam) {
      setSelectedType(typeParam.toLowerCase());
    }
  }, [searchParams, id]);

  // Combined data fetching
  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ['resources', selectedType, selectedCategory, searchTerm],
    queryFn: async () => {
      try {
        let query = supabase.from('resources').select('*');

        if (selectedType !== 'all') {
          query = query.ilike('type', `%${selectedType}%`);
        }
        
        if (selectedCategory !== 'all') {
          query = query.ilike('category', `%${selectedCategory}%`);
        }

        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching resources:', error);
          // Fallback to mock data
          return mockResources;
        }

        // Transform supabase data to ExtendedResource format
        const transformedData: ExtendedResource[] = (data || []).map(resource => ({
          ...resource,
          tags: [], // Add default empty tags since supabase data might not have this
          views: Math.floor(Math.random() * 1000),
          downloads: Math.floor(Math.random() * 500),
        }));

        return transformedData.length > 0 ? transformedData : mockResources;
      } catch (err) {
        console.error('Unexpected error:', err);
        return mockResources;
      }
    },
  });

  const { isLoading: isDocumentLoading, error: documentError, documentUrl } = useDocument({
    url: currentResource?.url || '',
    type: currentResource?.type || '',
  });

  // Combined filtering and sorting logic
  const filteredResources = useMemo(() => {
    let filtered = resources;
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title?.toLowerCase().includes(term) || 
        resource.description?.toLowerCase().includes(term) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(resource => selectedCategories.includes(resource.category || 'other'));
    }
    
    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(resource => selectedTypes.includes(resource.type || 'other'));
    }
    
    // Apply single category/type filters
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category?.toLowerCase() === selectedCategory);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type?.toLowerCase() === selectedType);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const aDate = new Date(a.dateAdded || a.created_at).getTime();
        const bDate = new Date(b.dateAdded || b.created_at).getTime();
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      } else if (sortBy === 'popularity') {
        const aPopularity = (a.views || 0) + (a.downloads || 0);
        const bPopularity = (b.views || 0) + (b.downloads || 0);
        return sortDirection === 'asc' ? aPopularity - bPopularity : bPopularity - aPopularity;
      } else { // alphabetical
        return sortDirection === 'asc'
          ? (a.title || '').localeCompare(b.title || '')
          : (b.title || '').localeCompare(a.title || '');
      }
    });
  }, [resources, searchTerm, selectedCategories, selectedTypes, selectedCategory, selectedType, sortBy, sortDirection]);

  // Extract unique categories and types
  const resourceTypes = Array.from(new Set(resources.map(r => r.type?.toLowerCase() || 'other')));
  const resourceCategories = Array.from(new Set(resources.map(r => r.category?.toLowerCase() || 'other')));
  const availableTypes = ['all', ...resourceTypes];
  const allCategories = Array.from(new Set(mockResources.map(resource => resource.category || 'other')));
  const allTypes = Array.from(new Set(mockResources.map(resource => resource.type || 'other')));

  // Group resources by category for tabbed interface
  const resourcesByCategory = useMemo(() => {
    const grouped: Record<string, ExtendedResource[]> = {};
    allCategories.forEach(category => {
      grouped[category] = filteredResources.filter(resource => resource.category === category);
    });
    return grouped;
  }, [filteredResources, allCategories]);

  // Event handlers combining all functionality
  const handleResourceClick = async (resource: ExtendedResource) => {
    console.log('Resource clicked:', resource);
    
    let viewUrl = resource.url;
    
    // Fix malformed URLs and ensure proper public access
    if (viewUrl?.includes('supabase.co/storage/v1/object/public/')) {
      viewUrl = viewUrl.split('?')[0];
    } else if (viewUrl?.includes('supabase.co/storage/v1/object/')) {
      const pathPart = viewUrl.split('/object/')[1];
      if (pathPart) {
        viewUrl = `https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/${pathPart}`;
      }
    }

    // Track view with normalized resource type
    if (resource.id) {
      try {
        // Map the resource type to match database constraints
        let normalizedType = resource.type?.toLowerCase() || 'unknown';
        if (normalizedType === 'document') normalizedType = 'pdf';
        
        const { data, error } = await supabase.rpc('track_resource_view', {
          p_resource_id: resource.id,
          p_resource_type: normalizedType
        });

        if (error) {
          console.warn('Failed to track view:', error);
        }
      } catch (err) {
        console.error('Unexpected error tracking view:', err);
      }
    }

    // Open based on type or navigate to detail view
    if (viewMode === 'detail') {
      // Already in detail view, just update current resource
      setCurrentResource(resource);
    } else {
      // Navigate to detail view
      navigate(`/resources/${resource.id}`);
    }
  };

  const handleDownload = async (resource: ExtendedResource, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!resource.is_downloadable) {
      return;
    }

    let downloadUrl = resource.downloadUrl || resource.url;
    
    if (downloadUrl) {
      // Clean up download URL
      if (downloadUrl.includes('?download?=1')) {
        downloadUrl = downloadUrl.replace('?download?=1', '?download=true');
      }
      
      // Ensure proper public URL format
      if (downloadUrl.includes('supabase.co/storage/v1/object/') && !downloadUrl.includes('/public/')) {
        const pathPart = downloadUrl.split('/object/')[1];
        if (pathPart) {
          downloadUrl = `https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/${pathPart.split('?')[0]}?download=true`;
        }
      }

      try {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = resource.title || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download started",
          description: "Your download has begun.",
        });
      } catch (error) {
        console.error('Download failed:', error);
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Resource link copied to clipboard",
    });
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    
    const newParams = new URLSearchParams(searchParams);
    if (type === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', type);
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    const newParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const toggleResourceSelection = (resourceId: string) => {
    if (selectedResources.includes(resourceId)) {
      setSelectedResources(selectedResources.filter(id => id !== resourceId));
    } else {
      setSelectedResources([...selectedResources, resourceId]);
    }
  };

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

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedCategory('all');
    setSelectedType('all');
    setSortBy('date');
    setSortDirection('desc');
  };

  const getResourceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-10 w-10" />;
      case 'video':
        return <Video className="h-10 w-10" />;
      case 'image':
      case 'infographic':
        return <ImageIcon className="h-10 w-10" />;
      default:
        return <FileText className="h-10 w-10" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'image':
      case 'infographic':
        return <ImageIcon className="w-5 h-5" />;
      case 'audio':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  // Render resource card based on view mode
  const renderResourceCard = (resource: ExtendedResource) => {
    const isSelected = selectedResources.includes(resource.id || '');
    
    if (viewMode === 'grid' || viewMode === 'hub') {
      return (
        <motion.div
          key={resource.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full"
          layout
        >
          <Card className={`h-full transition-shadow hover:shadow-md overflow-hidden cursor-pointer ${isSelected ? 'border-primary' : ''}`}
                onClick={() => handleResourceClick(resource)}>
            <div className="relative">
              <div className="bg-muted aspect-video relative flex items-center justify-center">
                {resource.thumbnail_url ? (
                  <img 
                    src={resource.thumbnail_url} 
                    alt={resource.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    {getTypeIcon(resource.type || '')}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                  <Badge variant="outline" className="bg-background/80">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(resource.type || '')}
                      {resource.type?.toUpperCase()}
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg leading-tight hover:underline line-clamp-2">{resource.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-muted-foreground text-sm line-clamp-2">{resource.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                <span className="bg-muted px-2 py-1 rounded">
                  {resource.type}
                </span>
                <span className="bg-muted px-2 py-1 rounded">
                  {resource.category}
                </span>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 border-t flex justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{new Date(resource.created_at || '').toLocaleDateString()}</span>
                <span className="text-xs text-muted-foreground">{resource.views || 0} views</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={(e) => {
                  e.stopPropagation();
                  handleResourceClick(resource);
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  {translate("View", language)}
                </Button>
                {resource.is_downloadable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDownload(resource, e)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {translate("Download", language)}
                  </Button>
                )}
                {resource.videoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(resource.videoUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      );
    }

    // List view
    return (
      <motion.div
        key={resource.id}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        layout
      >
        <Card className={`transition-shadow hover:shadow-md cursor-pointer ${isSelected ? 'border-primary' : ''}`}
              onClick={() => handleResourceClick(resource)}>
          <div className="flex items-start p-4">
            <div className="hidden sm:block mr-4 bg-muted h-24 w-24 flex-shrink-0 flex items-center justify-center rounded-md">
              {resource.thumbnail_url ? (
                <img 
                  src={resource.thumbnail_url} 
                  alt={resource.title}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  {getTypeIcon(resource.type || '')}
                </div>
              )}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-background/80">
                  <div className="flex items-center gap-1">
                    {getTypeIcon(resource.type || '')}
                    {resource.type?.toUpperCase()}
                  </div>
                </Badge>
                <Badge variant="secondary">{resource.category}</Badge>
              </div>
              <h3 className="font-semibold hover:underline line-clamp-1">{resource.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-1">{resource.description}</p>
              <div className="flex justify-between items-center mt-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{new Date(resource.created_at || '').toLocaleDateString()}</span>
                  <span className="text-xs text-muted-foreground">{resource.views || 0} views</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">
                    {translate("View Details", language)}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Detail view for individual resource
  if (viewMode === 'detail' && currentResource) {
    const relatedResources = mockResources.filter(r => r.id !== currentResource.id && r.category === currentResource.category);
    
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <Button variant="ghost" className="mb-6" onClick={() => navigate('/resources')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge className="mb-2">{currentResource.type}</Badge>
                  <h1 className="text-3xl font-bold mb-2">{currentResource.title}</h1>
                  <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <Eye className="h-4 w-4 mr-1" /> {viewCount} views
                    <span className="mx-2">•</span>
                    <span>Added {new Date(currentResource.created_at || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <p className="text-lg mb-6">{currentResource.description}</p>
                  
                  <DocumentViewer
                    url={currentResource.url || ''}
                    type={currentResource.type || ''}
                    title={currentResource.title || ''}
                  />
                  
                  <Separator className="my-6" />
                  
                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-kenya-green hover:bg-kenya-green/90" onClick={() => handleDownload(currentResource)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-center mb-6 bg-muted p-6 rounded-lg">
                    {getResourceIcon(currentResource.type || '')}
                  </div>
                  
                  <h3 className="font-semibold mb-4">Resource Information</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{currentResource.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{currentResource.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Added on:</span>
                      <span className="font-medium">{new Date(currentResource.created_at || '').toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last updated:</span>
                      <span className="font-medium">{new Date(currentResource.updated_at || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="font-semibold mb-4">Related Resources</h3>
                  
                  <div className="space-y-3">
                    {relatedResources.slice(0, 3).map(related => (
                      <Link 
                        key={related.id} 
                        to={`/resources/${related.id}`} 
                        className="flex items-center p-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <div className="mr-2 w-6 h-6 flex items-center justify-center">
                          {getTypeIcon(related.type || '')}
                        </div>
                        <span className="text-sm">{related.title}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Default grid/library view
  return (
    <Layout>
      <div className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {translate("Resource Library", language)}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {translate("Access comprehensive civic education materials, documents, and learning resources.", language)}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={translate("Search resources...", language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{translate("Filter by:", language)}</span>
            </div>
            
            <ResourceTypeFilter
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              availableTypes={availableTypes}
            />

            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              <option value="all">{translate("All Categories", language)}</option>
              {resourceCategories.map(category => (
                <option key={category} value={category}>
                  {translate(category.charAt(0).toUpperCase() + category.slice(1), language)}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
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
        </div>

        {/* Resources Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold mb-2">
              {translate("No resources found", language)}
            </h3>
            <p className="text-muted-foreground">
              {translate("Try adjusting your filters or search terms.", language)}
            </p>
          </div>
        ) : (
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
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
                {filteredResources.map(resource => renderResourceCard(resource))}
              </div>
            </TabsContent>
            
            {allCategories.map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                {resourcesByCategory[category]?.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No {category} resources match your filters</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters or search term</p>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
                    {resourcesByCategory[category]?.map(resource => renderResourceCard(resource))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default MegaResources;
