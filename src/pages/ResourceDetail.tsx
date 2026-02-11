import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Download, FileText, Video, Image, Share2, Eye } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import DocumentViewer from '@/components/documents/DocumentViewer';
import { useDocument } from '@/hooks/use-document';
import { useViewCount } from '@/hooks/useViewCount';
import { useViewTracking } from '@/hooks/useViewTracking';
import { normalizeDownloadUrl, getYouTubeEmbedUrl } from '@/utils/url';
import { placeholderService } from '@/services/placeholderService';

type Resource = Tables<'resources'>;

// No mock resources needed in GO HAM mode

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedResources, setRelatedResources] = useState<Resource[]>([]);
  const { toast } = useToast();

  // Use Supabase-backed realtime view count
  const viewCount = useViewCount(id || '', 'resource');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        if (!id) return;

        // Fetch from Supabase directly
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Resource not found");

        const normalizedDb = {
          ...data,
          url: normalizeDownloadUrl((data as any).url),
          description: data.description || (data as any).summary || ''
        };
        setResource(normalizedDb as any);

        // Fetch related resources (same category, excluding current)
        const { data: relatedData } = await supabase
          .from('resources')
          .select('*')
          .eq('category', data.category)
          .neq('id', id)
          .limit(5);

        if (relatedData) setRelatedResources(relatedData as any);
      } catch (error) {
        console.error('Error fetching resource:', error);
        toast({
          title: "Error",
          description: "Could not load the resource from the vault.",
          variant: "destructive",
        });
        navigate('/resources');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, toast, navigate]);

  // Track view once the resource is known
  const { trackVideoPlay } = useViewTracking({
    resourceId: id || '',
    resourceType: 'resource',
    viewType: 'page_view',
  });

  useEffect(() => {
    // If it's a video and auto-play/interaction happens, we can later call trackVideoPlay()
    // We keep this returned function for potential cleanup
    return () => { };
  }, [trackVideoPlay]);

  const { isLoading: isDocumentLoading } = useDocument({
    url: resource?.url || '',
    type: resource?.type || '',
  });

  const getResourceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
      case 'document':
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
      const finalUrl = normalizeDownloadUrl((resource as any).downloadUrl || resource.url);
      if (finalUrl) window.open(finalUrl, '_blank');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Resource link copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Related resources handled via state and fetch above

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

  const youTubeEmbed = resource.type?.toLowerCase() === 'video' ? getYouTubeEmbedUrl((resource as any).videoUrl || resource.url) : null;

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
                  <span>Added {new Date((resource as any).created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <p className="text-lg mb-6">{(resource as any).description}</p>

                {/* Local inline viewer */}
                {youTubeEmbed ? (
                  <div className="aspect-video w-full rounded-md overflow-hidden">
                    <iframe
                      title={resource.title}
                      src={youTubeEmbed}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onLoad={() => {
                        // Count a play interaction opportunity
                        // Note: actual play tracking can be wired via YouTube API; here we record a play intent
                        console.log('YouTube embed loaded');
                      }}
                    />
                  </div>
                ) : (
                  <DocumentViewer
                    url={(resource as any).url}
                    type={(resource as any).type}
                    title={(resource as any).title}
                  />
                )}

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
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
              <p>
                {(resource as any).summary || (resource as any).description}
              </p>
              {(resource as any).provider && (
                <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border/50">
                  <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Source / Provider</p>
                  <p className="text-sm font-bold">{(resource as any).provider}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video w-full mb-6 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  {(resource as any).thumbnail_url ? (
                    <img
                      src={(resource as any).thumbnail_url}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={placeholderService.getPlaceholderByTags((resource as any).tags || [], (resource as any).type)}
                      alt="Placeholder"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <h3 className="font-semibold mb-4">Resource Information</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{(resource as any).type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{(resource as any).category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Added on:</span>
                    <span className="font-medium">{new Date((resource as any).created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last updated:</span>
                    <span className="font-medium">{new Date((resource as any).updated_at).toLocaleDateString()}</span>
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
                      {(() => {
                        switch ((related.type || '').toLowerCase()) {
                          case 'video': return <Video className="h-5 w-5" />;
                          case 'image':
                          case 'infographic': return <Image className="h-5 w-5" />;
                          default: return <FileText className="h-5 w-5" />;
                        }
                      })()}
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
