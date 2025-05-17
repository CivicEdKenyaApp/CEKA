import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, BookOpen, Search, SlidersHorizontal, UploadCloud, Video, FileText, Loader2, Filter } from 'lucide-react';
import { useAuth } from '@/App'; // Assuming useAuth is exported from App.tsx
import ResourceCard from '@/components/resources/ResourceCard'; // Re-added ResourceCard
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
// Removed BillsList import as it's no longer used here

interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  category: string;
  created_at: string;
  downloadUrl?: string | null;
  videoUrl?: string | null;
  uploadedBy?: string | null;
  is_downloadable?: boolean;
}

const resourceTypesArray = ["guide", "article", "video", "report", "toolkit", "constitution", "legislation", "policy_brief", "research_paper", "infographic", "faq", "glossary", "training_manual", "case_study", "white_paper", "ebook", "interactive_tool", "template", "checklist", "contact_directory", "curriculum", "lesson_plan", "presentation", "speech", "interview", "podcast_episode", "webinar_recording", "dataset", "map", "timeline", "legal_document", "bill_summary", "court_ruling", "official_gazette", "parliamentary_record", "election_material", "voter_guide", "party_manifesto", "civic_tech_tool", "data_visualization", "learning_module", "other"] as const;
type ResourceType = typeof resourceTypesArray[number];

const resourceTypeConfig: Record<ResourceType, { icon: React.ElementType; label: string; color: string }> = {
  guide: { icon: BookOpen, label: 'Guide', color: 'text-blue-500' },
  article: { icon: FileText, label: 'Article', color: 'text-green-500' },
  video: { icon: Video, label: 'Video', color: 'text-red-500' },
  report: { icon: FileText, label: 'Report', color: 'text-yellow-500' },
  toolkit: { icon: SlidersHorizontal, label: 'Toolkit', color: 'text-purple-500' },
  constitution: { icon: BookOpen, label: 'Constitution', color: 'text-gray-700 dark:text-gray-300' },
  legislation: { icon: FileText, label: 'Legislation', color: 'text-indigo-500' },
  policy_brief: { icon: FileText, label: 'Policy Brief', color: 'text-pink-500' },
  research_paper: { icon: FileText, label: 'Research Paper', color: 'text-teal-500' },
  infographic: { icon: FileText, label: 'Infographic', color: 'text-orange-500' },
  faq: { icon: FileText, label: 'FAQ', color: 'text-cyan-500' },
  glossary: { icon: BookOpen, label: 'Glossary', color: 'text-lime-500' },
  training_manual: { icon: BookOpen, label: 'Training Manual', color: 'text-amber-500' },
  case_study: { icon: FileText, label: 'Case Study', color: 'text-emerald-500' },
  white_paper: { icon: FileText, label: 'White Paper', color: 'text-sky-500' },
  ebook: { icon: BookOpen, label: 'E-book', color: 'text-rose-500' },
  interactive_tool: { icon: SlidersHorizontal, label: 'Interactive Tool', color: 'text-fuchsia-500' },
  template: { icon: FileText, label: 'Template', color: 'text-violet-500' },
  checklist: { icon: FileText, label: 'Checklist', color: 'text-trueGray-500' }, // Using a generic gray
  contact_directory: { icon: BookOpen, label: 'Contact Directory', color: 'text-warmGray-500' }, // Using a generic gray
  curriculum: { icon: BookOpen, label: 'Curriculum', color: 'text-blueGray-500' }, // Using a generic gray
  lesson_plan: { icon: FileText, label: 'Lesson Plan', color: 'text-coolGray-500' }, // Using a generic gray
  presentation: { icon: Video, label: 'Presentation', color: 'text-red-400' }, // Similar to video
  speech: { icon: FileText, label: 'Speech', color: 'text-green-400' }, // Similar to article
  interview: { icon: Video, label: 'Interview', color: 'text-red-600' }, // Similar to video
  podcast_episode: { icon: Video, label: 'Podcast Episode', color: 'text-purple-400' }, // Similar to video/toolkit
  webinar_recording: { icon: Video, label: 'Webinar Recording', color: 'text-yellow-600' }, // Similar to video
  dataset: { icon: FileText, label: 'Dataset', color: 'text-teal-400' }, // Similar to research
  map: { icon: FileText, label: 'Map', color: 'text-orange-400' }, // Similar to infographic
  timeline: { icon: FileText, label: 'Timeline', color: 'text-cyan-400' }, // Similar to infographic
  legal_document: { icon: FileText, label: 'Legal Document', color: 'text-indigo-400' }, // Similar to legislation
  bill_summary: { icon: FileText, label: 'Bill Summary', color: 'text-pink-400' }, // Similar to policy brief
  court_ruling: { icon: FileText, label: 'Court Ruling', color: 'text-gray-600' }, // Similar to constitution
  official_gazette: { icon: FileText, label: 'Official Gazette', color: 'text-gray-500' },
  parliamentary_record: { icon: FileText, label: 'Parliamentary Record', color: 'text-gray-400' },
  election_material: { icon: FileText, label: 'Election Material', color: 'text-blue-400' }, // Similar to guide
  voter_guide: { icon: BookOpen, label: 'Voter Guide', color: 'text-blue-600' }, // Similar to guide
  party_manifesto: { icon: FileText, label: 'Party Manifesto', color: 'text-green-600' }, // Similar to article
  civic_tech_tool: { icon: SlidersHorizontal, label: 'Civic Tech Tool', color: 'text-purple-600' }, // Similar to toolkit
  data_visualization: { icon: FileText, label: 'Data Visualization', color: 'text-orange-600' }, // Similar to infographic
  learning_module: { icon: BookOpen, label: 'Learning Module', color: 'text-lime-600' }, // Similar to glossary/training
  other: { icon: FileText, label: 'Other', color: 'text-neutral-500' }, // Neutral color
};


const categories = [
  "Civic Education Basics", "Government & Politics", "Human Rights", "Rule of Law", 
  "Democracy & Elections", "Public Participation", "Constitutionalism", 
  "Devolution", "Accountability & Transparency", "Peace & Conflict Resolution",
  "Social Justice", "Economic Literacy", "Environmental Governance", "Digital Citizenship",
  "Youth Empowerment", "Gender Equality", "Civic Tech", "National Values", "History of Kenya", "Other"
];


function ResourceLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 9;

  const { user } = useAuth(); // Get user session for upload button
  const { language } = useLanguage();


  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('Error fetching resources:', supabaseError);
        setError(supabaseError.message);
      } else {
        // Explicitly cast to Resource[] if types are compatible
        setResources(data as Resource[]);
      }
      setLoading(false);
    }

    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources
      .filter(resource =>
        (resource.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (resource.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
      .filter(resource => selectedCategory === 'all' || resource.category === selectedCategory)
      .filter(resource => selectedType === 'all' || resource.type === selectedType);
  }, [resources, searchTerm, selectedCategory, selectedType]);

  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * resourcesPerPage;
    return filteredResources.slice(startIndex, startIndex + resourcesPerPage);
  }, [filteredResources, currentPage, resourcesPerPage]);

  const totalPages = Math.ceil(filteredResources.length / resourcesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0,0);
  };
  
  const NoResultsDisplay = ({ type }: { type: 'initial' | 'search' }) => (
    <div className="text-center py-10 px-4 col-span-1 md:col-span-2 lg:col-span-3">
      <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-lg font-medium">
        {type === 'initial' ? translate("No Resources Available", language) : translate("No Matching Resources", language)}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {type === 'initial' 
          ? translate("There are currently no resources to display. Please check back later or try uploading new content.", language)
          : translate("Try adjusting your search terms or filters.", language)}
      </p>
      {type === 'initial' && user && (
        <Button asChild className="mt-4">
          <Link to="/resources/upload">{translate("Upload Resource", language)}</Link>
        </Button>
      )}
    </div>
  );


  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 dark:text-white">
            {translate("Resource Library", language)}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {translate("Explore a wide range of civic education materials.", language)}
          </p>
        </header>

        <Tabs defaultValue="resources" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <TabsList className="mb-4 sm:mb-0">
              <TabsTrigger value="resources">{translate("All Resources", language)}</TabsTrigger>
              {/* Removed Bill Tracker Tab */}
            </TabsList>
            {user && (
               <Button asChild variant="outline" className="flex items-center gap-2">
                <Link to="/resources/upload">
                  <UploadCloud className="h-4 w-4" />
                  {translate("Upload New Resource", language)}
                </Link>
              </Button>
            )}
          </div>

          <TabsContent value="resources">
            <Card className="mb-8 shadow-sm dark:bg-neutral-800/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  {translate("Filter Resources", language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium mb-1.5 text-muted-foreground">{translate("Search", language)}</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder={translate("Search by title or description...", language)}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1.5 text-muted-foreground">{translate("Category", language)}</label>
                    <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); setCurrentPage(1); }}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder={translate("All Categories", language)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{translate("All Categories", language)}</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{translate(cat, language)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-1.5 text-muted-foreground">{translate("Resource Type", language)}</label>
                    <Select value={selectedType} onValueChange={(value) => { setSelectedType(value as ResourceType | 'all'); setCurrentPage(1); }}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder={translate("All Types", language)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{translate("All Types", language)}</SelectItem>
                        {Object.entries(resourceTypeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{translate(config.label, language)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center items-center py-20 col-span-1 md:col-span-2 lg:col-span-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 <p className="ml-3 text-lg text-muted-foreground">{translate("Loading resources...", language)}</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 px-4 col-span-1 md:col-span-2 lg:col-span-3">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-2 text-lg font-medium text-destructive">{translate("Failed to load resources", language)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  {translate("Try Again", language)}
                </Button>
              </div>
            ) : resources.length === 0 ? (
                 <NoResultsDisplay type="initial" />
            ) : paginatedResources.length === 0 && (searchTerm || selectedCategory !== 'all' || selectedType !== 'all') ? (
                 <NoResultsDisplay type="search" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} language={language} />
                ))}
              </div>
            )}

            {totalPages > 1 && !loading && !error && paginatedResources.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="mr-2"
                >
                  {translate("Previous", language)}
                </Button>
                <span className="self-center text-sm text-muted-foreground">
                  {translate("Page", language)} {currentPage} {translate("of", language)} {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="ml-2"
                >
                  {translate("Next", language)}
                </Button>
              </div>
            )}
          </TabsContent>
          {/* Placeholder for future tabs if needed */}
        </Tabs>
      </div>
    </Layout>
  );
}

export default ResourceLibrary;
