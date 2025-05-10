
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Download, FileText, Video, Image, Share2, ThumbsUp, Eye } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import DocumentViewer from '@/components/documents/DocumentViewer';
import { useDocument } from '@/hooks/use-document';

type Resource = Tables<'resources'>;

const mockResources = [
  {
    id: "1",
    title: "Understanding the Constitution of Kenya",
    type: "pdf",
    category: "Constitution",
    description: "A comprehensive guide to the Kenyan Constitution and its key provisions.",
    url: "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/resource-files/The_Constitution_of_Kenya_2010.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5Xzk4YmVjMzM2LWY3ZDAtNDZmNy1hN2IzLWUxMjUxN2QyMDEwNiJ9.eyJ1cmwiOiJyZXNvdXJjZS1maWxlcy9UaGVfQ29uc3RpdHV0aW9uX29mX0tlbnlhXzIwMTAucGRmIiwiaWF0IjoxNzQ2Njc4MTQxLCJleHAiOjE4NDEyODYxNDF9.EMfkTDvLCGwv03aWMcqo5AfHc0KZeZrXLTt-VI2Hh-8",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Blood Parliament: BBC Africa Eye Documentary",
    type: "video",
    category: "Governance",
    description: "How the Kenyan Government handled the Kenyan youth rising up against economic injustice",
    url: "https://5dorfxxwfijb.share.zrok.io/s/JHapaymSwTHKCi5",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Your Rights as a Kenyan Citizen",
    type: "image",
    category: "Rights",
    description: "Visual representation of fundamental rights guaranteed by the Constitution.",
    url: "https://ohchr.org/sites/default/files/Documents/Publications/Compilation1.1en.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const { toast } = useToast();

  // Use mock resources when running in development
  useEffect(() => {
    const fetchResource = async () => {
      try {
        if (!id) return;
        
        // First check mock resources
        const mockResource = mockResources.find(r => r.id === id);
        
        if (mockResource) {
          setResource(mockResource as unknown as Resource);
          setViewCount(Math.floor(Math.random() * 100) + 20);
          setLoading(false);
          return;
        }
        
        // If not found in mock, try Supabase
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setResource(data);
        setViewCount(Math.floor(Math.random() * 100) + 20); // Placeholder
      } catch (error) {
        console.error('Error fetching resource:', error);
        toast({
          title: "Error",
          description: "Could not load the resource. Please try again.",
          variant: "destructive",
        });
        navigate('/resources');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, toast, navigate]);

  const { isLoading: isDocumentLoading, error: documentError, documentUrl } = useDocument({
    url: resource?.url || '',
    type: resource?.type || '',
  });

  const getResourceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-10 w-10" />;
      case 'video':
        return <Video className="h-10 w-10" />;
      case 'image':
      case 'infographic':
        return <Image className="h-10 w-10" />;
      default:
        return <FileText className="h-10 w-10" />;
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your download has begun.",
    });
    
    if (resource) {
      window.open(resource.url, '_blank');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Resource link copied to clipboard",
    });
  };

  // Related resources (excluding current one)
  const relatedResources = mockResources.filter(r => r.id !== id);

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
                  <Eye className="h-4 w-4 mr-1" /> {viewCount} views
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
                  <Button className="bg-kenya-green hover:bg-kenya-green/90" onClick={handleDownload}>
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

            <h2 className="text-xl font-semibold mb-4">About this Resource</h2>
            <p className="text-muted-foreground">
              This {resource.type?.toLowerCase()} provides information about {resource.category} in Kenya. 
              It is part of our civic education materials designed to help citizens understand 
              their rights and responsibilities.
            </p>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center mb-6 bg-muted p-6 rounded-lg">
                  {getResourceIcon(resource.type || '')}
                </div>
                
                <h3 className="font-semibold mb-4">Resource Information</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{resource.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{resource.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Added on:</span>
                    <span className="font-medium">{new Date(resource.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last updated:</span>
                    <span className="font-medium">{new Date(resource.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="font-semibold mb-4">Related Resources</h3>
                
                <div className="space-y-3">
                  {relatedResources.map(related => (
                    <Link 
                      key={related.id} 
                      to={`/resources/${related.id}`} 
                      className="flex items-center p-2 hover:bg-muted rounded-md transition-colors"
                    >
                      {getResourceIcon(related.type)}
                      <span className="ml-2 text-sm">{related.title}</span>
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
};

export default ResourceDetail;
