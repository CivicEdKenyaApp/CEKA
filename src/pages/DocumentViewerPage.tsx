
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, ChevronLeft, Share2, Lock, Eye } from 'lucide-react'; // Added Eye icon
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardHeader, CardTitle
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import DocumentViewerComponent from '@/components/documents/DocumentViewer'; // Renamed to avoid conflict with page name
import { Tables } from '@/integrations/supabase/types'; // Import Supabase types

// Define Resource type based on Supabase 'resources' table
type Resource = Tables<'resources'>;

// Interface for related resources, can be simpler if needed
interface RelatedResourcePreview {
  id: string | number;
  title: string;
  type: string;
}

const DocumentViewerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0); // Placeholder, consider implementing actual view tracking
  const [relatedResources, setRelatedResources] = useState<RelatedResourcePreview[]>([]);

  useEffect(() => {
    const fetchResourceDetails = async () => {
      if (!id) {
        toast({ title: "Error", description: "Resource ID is missing.", variant: "destructive" });
        navigate("/resources");
        return;
      }

      try {
        setLoading(true);
        
        // Fetch main resource
        const { data: resourceData, error: resourceError } = await supabase
          .from('resources')
          .select('*')
          .eq('id', id)
          .single();

        if (resourceError) throw resourceError;
        
        if (!resourceData) {
          toast({
            title: "Resource not found",
            description: "The requested resource could not be loaded.",
            variant: "destructive",
          });
          navigate("/resources");
          return;
        }
        
        setResource(resourceData);
        setViewCount(Math.floor(Math.random() * 100) + 20); // Mock view count

        // Fetch related resources (e.g., 3 other resources, excluding the current one)
        // For more sophisticated related resources, you might filter by category or tags
        const { data: relatedData, error: relatedError } = await supabase
          .from('resources')
          .select('id, title, type')
          .neq('id', id) // Exclude current resource
          .limit(3);

        if (relatedError) {
          console.warn("Could not fetch related resources:", relatedError.message);
        } else if (relatedData) {
          setRelatedResources(relatedData.map(r => ({
            id: r.id,
            title: r.title ?? 'Untitled Resource',
            type: r.type ?? 'document'
          })));
        }

      } catch (error: any) {
        console.error('Error fetching resource details:', error);
        toast({
          title: "Error",
          description: "Could not load the resource: " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResourceDetails();
  }, [id, navigate, toast]);

  const handleDownload = () => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please sign in to download this resource.",
      });
      navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    if (resource?.is_downloadable && resource?.url) { // Assuming 'url' can be used for download if 'downloadUrl' is not present
      const downloadLink = resource.downloadUrl || resource.url; // Prefer downloadUrl if available
      // Append ?download=1 if not already part of the url and it's a Supabase storage URL
      const finalDownloadLink = (downloadLink.includes('supabase.co/storage/v1/object') && !downloadLink.includes('?download=')) 
                                ? `${downloadLink}?download=1`
                                : downloadLink;

      toast({
        title: "Download started",
        description: "Your download has begun.",
      });
      
      window.open(finalDownloadLink, '_blank');
    } else if (!resource?.is_downloadable) {
        toast({
            title: "Not Downloadable",
            description: "This resource is not available for download.",
            variant: "default"
        });
    } else {
        toast({
            title: "Download Error",
            description: "Could not initiate download. Resource URL is missing.",
            variant: "destructive"
        });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Resource link copied to clipboard.",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4 mt-2"></div>
            <div className="h-4 bg-muted rounded w-full mt-1"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!resource) {
    return (
      <Layout>
        <div className="container py-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
          <p className="mb-6">The resource you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/resources">Back to Resources</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/resources" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </Link>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                {resource.type && <Badge className="mb-2">{resource.type}</Badge>}
                <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                  <Eye className="h-4 w-4 mr-1" /> <span>{viewCount} views</span>
                  <span className="mx-2">•</span>
                  <span>Added {new Date(resource.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <p className="text-lg mb-6">{resource.description}</p>
                
                <DocumentViewerComponent
                  url={resource.url} // DocumentViewer expects a `url` prop
                  type={resource.type} // And a `type` prop
                  title={resource.title}
                />
                
                <Separator className="my-6" />
                
                <div className="flex flex-wrap gap-4">
                  {resource.is_downloadable && (
                    <Button
                      className="bg-kenya-green hover:bg-kenya-green/90"
                      onClick={handleDownload}
                    >
                      {session ? (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Sign in to Download
                        </>
                      )}
                    </Button>
                  )}
                   {!resource.is_downloadable && (
                     <Button variant="outline" disabled>
                        Not Downloadable
                     </Button>
                   )}
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-xl font-semibold mb-4">About this Resource</h2>
            <p className="text-muted-foreground">
              This {resource.type.toLowerCase()} {resource.category ? `focuses on ${resource.category}` : ''}. 
              It is part of our civic education materials designed to help citizens understand 
              their rights and responsibilities.
            </p>
            
            {/* billObjective and county are not in the current 'resources' table. Display if present. */}
            {/* {(resource as any).billObjective && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Bill Objective Alignment</h3>
                <Badge variant="secondary">{(resource as any).billObjective}</Badge>
              </div>
            )}
            
            {(resource as any).county && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Geographic Focus</h3>
                <p className="text-sm">{(resource as any).county}</p>
              </div>
            )} */}
          </div>

          <div>
            <Card>
                <CardHeader>
                    <CardTitle>Resource Information</CardTitle>
                </CardHeader>
              <CardContent className="p-6 space-y-4"> {/* Reduced spacing */}
                <div>
                  {/* <h3 className="font-semibold mb-2">Resource Information</h3> */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{resource.type}</span>
                    </div>
                    {resource.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{resource.category}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Added on:</span>
                      <span className="font-medium">{new Date(resource.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last updated:</span>
                      <span className="font-medium">{new Date(resource.updated_at).toLocaleDateString()}</span>
                    </div>
                    {resource.uploadedBy && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uploaded by:</span>
                        <span className="font-medium">{resource.uploadedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {relatedResources.length > 0 && <Separator />}
                
                {relatedResources.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Related Resources</h3>
                    <div className="space-y-2">
                      {relatedResources.map(related => (
                        <Button key={related.id} variant="link" className="w-full justify-start p-0 h-auto text-sm" asChild>
                          <Link to={`/resources/${related.id}`}>
                            {related.title} ({related.type})
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    If you have any questions about this resource or need assistance, 
                    please contact our support team.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/feedback">Contact Support</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentViewerPage;
