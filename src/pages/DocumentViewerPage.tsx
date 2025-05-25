
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, ChevronLeft, Share2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import DocumentViewer from '@/components/documents/DocumentViewer';

interface ResourceDetails {
  id: string | number;
  title: string;
  description: string;
  type: string;
  category?: string;
  url: string;
  downloadUrl?: string;
  is_downloadable?: boolean;
  created_at: string;
  updated_at: string;
  uploadedBy?: string;
  billObjective?: string;
  county?: string;
}

const DocumentViewerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [resource, setResource] = useState<ResourceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const [relatedResources, setRelatedResources] = useState<ResourceDetails[]>([]);

  useEffect(() => {
    const fetchResourceDetails = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would be a Supabase query
        // For now, we'll use mock data
        const mockResources = [
          {
            id: "1",
            title: "Understanding the Constitution of Kenya",
            type: "pdf",
            category: "Constitution",
            description: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
            url: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/resource-files/The_Constitution_of_Kenya_2010.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5Xzk4YmVjMzM2LWY3ZDAtNDZmNy1hN2IzLWUxMjUxN2QyMDEwNiJ9.eyJ1cmwiOiJyZXNvdXJjZS1maWxlcy9UaGVfQ29uc3RpdHV0aW9uX29mX0tlbnlhXzIwMTAucGRmIiwiaWF0IjoxNzQ2Njc4MTQxLCJleHAiOjE4NDEyODYxNDF9.EMfkTDvLCGwv03aWMcqo5AfHc0KZeZrXLTt-VI2Hh-8",
            downloadUrl: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/resource-files/The_Constitution_of_Kenya_2010.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5Xzk4YmVjMzM2LWY3ZDAtNDZmNy1hN2IzLWUxMjUxN2QyMDEwNiJ9.eyJ1cmwiOiJyZXNvdXJjZS1maWxlcy9UaGVfQ29uc3RpdHV0aW9uX29mX0tlbnlhXzIwMTAucGRmIiwiaWF0IjoxNzQ2Njc4MTQxLCJleHAiOjE4NDEyODYxNDF9.EMfkTDvLCGwv03aWMcqo5AfHc0KZeZrXLTt-VI2Hh-8?download=1",
            is_downloadable: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            uploadedBy: "Civic Education Kenya",
            billObjective: "Constitutional Implementation",
            county: "National"
          },
          {
            id: "2",
            title: "Blood Parliament: BBC Africa Eye Documentary",
            type: "video",
            category: "Governance",
            description: "How the Kenyan Government handled the Kenyan youth rising up against economic injustice",
            url: "https://5dorfxxwfijb.share.zrok.io/s/JHapaymSwTHKCi5",
            downloadUrl: "https://5dorfxxwfijb.share.zrok.io/s/JHapaymSwTHKCi5?download=1",
            is_downloadable: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            uploadedBy: "Civic Education Kenya",
            billObjective: "Political System",
            county: "National"
          },
          {
            id: "3",
            title: "Your Rights as a Kenyan Citizen",
            type: "image",
            category: "Rights",
            description: "Visual representation of fundamental rights guaranteed by the Constitution.",
            url: "https://example.com/rights-infographic.png",
            downloadUrl: "https://example.com/rights-infographic.png",
            is_downloadable: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            uploadedBy: "Civic Education Kenya",
            billObjective: "Bill of Rights",
            county: "Nairobi, Mombasa"
          }
        ];
        
        const resource = mockResources.find(resource => resource.id === id);
        
        if (!resource) {
          // In a real implementation, we'd query Supabase here
          toast({
            title: "Resource not found",
            description: "The requested resource could not be loaded.",
            variant: "destructive",
          });
          navigate("/resources");
          return;
        }
        
        setResource(resource);
        
        // Set related resources (excluding current resource)
        const related = mockResources.filter(item => item.id !== id);
        setRelatedResources(related);
        
        setViewCount(Math.floor(Math.random() * 100) + 20); // Placeholder for view count
      } catch (error) {
        console.error('Error fetching resource details:', error);
        toast({
          title: "Error",
          description: "Could not load the resource. Please try again.",
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
        description: "Please sign in to download this resource",
      });
      navigate('/auth');
      return;
    }
    
    if (resource?.downloadUrl) {
      toast({
        title: "Download started",
        description: "Your download has begun.",
      });
      
      window.open(resource.downloadUrl, '_blank');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Resource link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-1/4"></div>
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
                <Badge className="mb-2">{resource.type}</Badge>
                <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                  <span>{viewCount} views</span>
                  <span className="mx-2">•</span>
                  <span>Added {new Date(resource.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <p className="text-lg mb-6">{resource.description}</p>
                
                <DocumentViewer
                  url={resource.url}
                  type={resource.type}
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
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-xl font-semibold mb-4">About this Resource</h2>
            <p className="text-muted-foreground">
              This {resource.type} provides information about {resource.category} in Kenya. 
              It is part of our civic education materials designed to help citizens understand 
              their rights and responsibilities.
            </p>
            
            {resource.billObjective && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Bill Objective Alignment</h3>
                <Badge variant="secondary">{resource.billObjective}</Badge>
              </div>
            )}
            
            {resource.county && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Geographic Focus</h3>
                <p className="text-sm">{resource.county}</p>
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Resource Information</h3>
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
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-3">Related Resources</h3>
                  <div className="space-y-2">
                    {relatedResources.map(related => (
                      <Button key={related.id} variant="link" className="w-full justify-start p-0 h-auto" asChild>
                        <Link to={`/resources/${related.id}`}>
                          {related.title}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-3">Need Help?</h3>
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
