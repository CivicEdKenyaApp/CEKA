
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Download, ArrowRight, Share2, ExternalLink, FileIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for our toolkit items
interface ToolkitItem {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string;
  document_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  mime_type: string;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'policy', label: 'Policy Documents' },
  { value: 'legal', label: 'Legal Resources' },
  { value: 'advocacy', label: 'Advocacy Guides' },
  { value: 'educational', label: 'Educational Materials' },
  { value: 'templates', label: 'Templates & Forms' }
];

const AdvocacyToolkit = () => {
  const [toolkitItems, setToolkitItems] = useState<ToolkitItem[]>([]);
  const [documents, setDocuments] = useState<Record<string, Document>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  // Fetch toolkit items and associated documents
  useEffect(() => {
    const fetchToolkitItems = async () => {
      setIsLoading(true);
      try {
        // Get toolkit items
        const { data: toolkitData, error: toolkitError } = await supabase
          .from('advocacy_toolkit')
          .select('*');

        if (toolkitError) throw toolkitError;
        
        const items = toolkitData as ToolkitItem[];
        setToolkitItems(items);
        
        // Get all document IDs from the toolkit items
        const allDocumentIds: string[] = [];
        items.forEach(item => {
          if (item.document_ids && item.document_ids.length > 0) {
            allDocumentIds.push(...item.document_ids);
          }
        });
        
        // If we have document IDs, fetch the documents
        if (allDocumentIds.length > 0) {
          const { data: documentsData, error: docsError } = await supabase
            .from('documents')
            .select('*')
            .in('id', allDocumentIds)
            .eq('is_approved', true);
          
          if (docsError) throw docsError;
          
          // Create a map of document ID to document
          const docsMap: Record<string, Document> = {};
          (documentsData as Document[]).forEach(doc => {
            docsMap[doc.id] = doc;
          });
          
          setDocuments(docsMap);
        }
      } catch (error) {
        console.error('Error fetching toolkit items:', error);
        toast({
          title: "Error",
          description: "Failed to load advocacy toolkit resources. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchToolkitItems();
  }, [toast]);

  // Filter toolkit items based on search query and category
  const filteredItems = toolkitItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get documents for a toolkit item
  const getDocumentsForItem = (item: ToolkitItem) => {
    if (!item.document_ids || item.document_ids.length === 0) return [];
    
    return item.document_ids.map(id => documents[id]).filter(Boolean);
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Advocacy Toolkit</h1>
            <p className="text-muted-foreground">Resources and guides to support civic engagement and advocacy efforts</p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search resources..." 
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Resources</TabsTrigger>
                <TabsTrigger value="guides">Guides</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="h-40 animate-pulse bg-muted/50" />
                    ))}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No resources found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || selectedCategory !== 'all' 
                        ? "Try adjusting your search or filters" 
                        : "Resources will be added soon"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredItems.map((item) => {
                      const itemDocuments = getDocumentsForItem(item);
                      
                      return (
                        <Card key={item.id} className="overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="flex-1 p-5 md:p-6">
                              <div className="flex flex-col md:flex-row justify-between md:items-center mb-2">
                                <Badge variant="outline" className="mb-2 md:mb-0 w-fit">
                                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                </Badge>
                              </div>
                              
                              <h3 className="text-lg font-semibold mb-1">
                                <Link to={`/advocacy-toolkit/${item.id}`} className="hover:text-kenya-green transition-colors">
                                  {item.title}
                                </Link>
                              </h3>
                              
                              {item.description && (
                                <p className="text-muted-foreground text-sm mb-4">
                                  {item.description}
                                </p>
                              )}
                              
                              {itemDocuments.length > 0 && (
                                <div className="space-y-2 mb-4">
                                  <h4 className="text-sm font-medium">Resources</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {itemDocuments.map((doc) => (
                                      <a
                                        key={doc.id}
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-xs bg-muted px-2.5 py-1.5 rounded hover:bg-muted/80 transition-colors"
                                      >
                                        <FileIcon className="h-3.5 w-3.5 mr-1.5" />
                                        {doc.title}
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  Updated: {new Date(item.updated_at).toLocaleDateString()}
                                </span>
                                
                                <Button size="sm" variant="ghost" asChild>
                                  <Link to={`/advocacy-toolkit/${item.id}`} className="flex items-center">
                                    Details
                                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              {/* These are placeholders for other tabs - we'll filter by category */}
              <TabsContent value="guides">
                <div className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <Card key={i} className="h-40 animate-pulse bg-muted/50" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredItems
                        .filter(item => item.category === 'advocacy')
                        .map((item) => {
                          const itemDocuments = getDocumentsForItem(item);
                          
                          return (
                            <Card key={item.id} className="overflow-hidden">
                              {/* Similar card content as "all" tab */}
                              <div className="flex flex-col md:flex-row">
                                <div className="flex-1 p-5 md:p-6">
                                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-2">
                                    <Badge variant="outline" className="mb-2 md:mb-0 w-fit">
                                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                    </Badge>
                                  </div>
                                  
                                  <h3 className="text-lg font-semibold mb-1">
                                    <Link to={`/advocacy-toolkit/${item.id}`} className="hover:text-kenya-green transition-colors">
                                      {item.title}
                                    </Link>
                                  </h3>
                                  
                                  {item.description && (
                                    <p className="text-muted-foreground text-sm mb-4">
                                      {item.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      Updated: {new Date(item.updated_at).toLocaleDateString()}
                                    </span>
                                    
                                    <Button size="sm" variant="ghost" asChild>
                                      <Link to={`/advocacy-toolkit/${item.id}`} className="flex items-center">
                                        Details
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="templates">
                <div className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <Card key={i} className="h-40 animate-pulse bg-muted/50" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredItems
                        .filter(item => item.category === 'templates')
                        .map((item) => {
                          return (
                            <Card key={item.id} className="overflow-hidden">
                              {/* Similar card content for templates */}
                              <div className="flex flex-col md:flex-row">
                                <div className="flex-1 p-5 md:p-6">
                                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-2">
                                    <Badge variant="outline" className="mb-2 md:mb-0 w-fit">
                                      Templates
                                    </Badge>
                                  </div>
                                  
                                  <h3 className="text-lg font-semibold mb-1">
                                    <Link to={`/advocacy-toolkit/${item.id}`} className="hover:text-kenya-green transition-colors">
                                      {item.title}
                                    </Link>
                                  </h3>
                                  
                                  {item.description && (
                                    <p className="text-muted-foreground text-sm mb-4">
                                      {item.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      Updated: {new Date(item.updated_at).toLocaleDateString()}
                                    </span>
                                    
                                    <Button size="sm" variant="ghost" asChild>
                                      <Link to={`/advocacy-toolkit/${item.id}`} className="flex items-center">
                                        Details
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <Card key={i} className="h-40 animate-pulse bg-muted/50" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredItems
                        .filter(item => ['policy', 'legal', 'educational'].includes(item.category))
                        .map((item) => {
                          return (
                            <Card key={item.id} className="overflow-hidden">
                              {/* Similar card content for documents */}
                              <div className="flex flex-col md:flex-row">
                                <div className="flex-1 p-5 md:p-6">
                                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-2">
                                    <Badge variant="outline" className="mb-2 md:mb-0 w-fit">
                                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                    </Badge>
                                  </div>
                                  
                                  <h3 className="text-lg font-semibold mb-1">
                                    <Link to={`/advocacy-toolkit/${item.id}`} className="hover:text-kenya-green transition-colors">
                                      {item.title}
                                    </Link>
                                  </h3>
                                  
                                  {item.description && (
                                    <p className="text-muted-foreground text-sm mb-4">
                                      {item.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      Updated: {new Date(item.updated_at).toLocaleDateString()}
                                    </span>
                                    
                                    <Button size="sm" variant="ghost" asChild>
                                      <Link to={`/advocacy-toolkit/${item.id}`} className="flex items-center">
                                        Details
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdvocacyToolkit;
