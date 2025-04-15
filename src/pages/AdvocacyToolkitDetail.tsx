
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Download, Calendar, Share2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
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

const AdvocacyToolkitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ToolkitItem | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch toolkit item and associated documents
  useEffect(() => {
    const fetchToolkitItem = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Get toolkit item
        const { data: itemData, error: itemError } = await supabase
          .from('advocacy_toolkit')
          .select('*')
          .eq('id', id)
          .single();

        if (itemError) throw itemError;
        
        setItem(itemData as ToolkitItem);
        
        // If we have document IDs, fetch the documents
        if (itemData.document_ids && itemData.document_ids.length > 0) {
          const { data: documentsData, error: docsError } = await supabase
            .from('documents')
            .select('*')
            .in('id', itemData.document_ids)
            .eq('is_approved', true);
          
          if (docsError) throw docsError;
          
          setDocuments(documentsData as Document[]);
        }
      } catch (error) {
        console.error('Error fetching toolkit item:', error);
        toast({
          title: "Error",
          description: "Failed to load resource. It may have been removed or you may not have permission to view it.",
          variant: "destructive"
        });
        navigate('/advocacy-toolkit');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchToolkitItem();
  }, [id, toast, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Resource link has been copied to clipboard"
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="h-12 w-3/4 bg-muted rounded"></div>
            <div className="h-4 w-1/4 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="container py-8 md:py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Resource Not Found</h1>
          <p className="text-muted-foreground mb-6">The resource you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/advocacy-toolkit">Back to Toolkit</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-6">
          <Link to="/advocacy-toolkit" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Advocacy Toolkit
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="bg-background">
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Badge>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold">{item.title}</h1>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Last updated: {new Date(item.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 self-start">
              <Button variant="outline" size="sm" className="flex items-center" onClick={handleShare}>
                <Share2 className="mr-1.5 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {item.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About this Resource</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            )}
            
            {item.content && (
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none dark:prose-invert prose-headings:scroll-m-20 prose-headings:font-semibold prose-p:leading-7">
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            {documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className="bg-muted p-2 rounded flex-shrink-0">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{doc.title}</h3>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                            )}
                            <div className="mt-2">
                              <a 
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-primary hover:underline"
                              >
                                Open Document
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Get Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Want to contribute to civic engagement efforts? Explore opportunities to get involved.
                </p>
                <Button className="w-full bg-kenya-green hover:bg-kenya-green/90" asChild>
                  <Link to="/volunteer">
                    Volunteer Opportunities
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/community">
                    Join Community Discussions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdvocacyToolkitDetail;
