
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Clock, FileText, Video, Image, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Tables } from '@/integrations/supabase/types';

type UserContribution = Tables<'user_contributions'>;

const PendingResources = () => {
  const [pendingResources, setPendingResources] = useState<UserContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    const fetchPendingResources = async () => {
      if (!session) return;
      
      try {
        const { data, error } = await supabase
          .from('user_contributions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPendingResources(data || []);
      } catch (error) {
        console.error('Error fetching pending resources:', error);
        toast({
          title: "Error",
          description: "Could not load your pending submissions.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingResources();
  }, [session, toast]);

  const getResourceIcon = (content: string) => {
    if (content.includes('PDF') || content.includes('document')) {
      return <FileText className="h-6 w-6" />;
    } else if (content.includes('video') || content.includes('Video')) {
      return <Video className="h-6 w-6" />;
    } else if (content.includes('infographic') || content.includes('Infographic')) {
      return <Image className="h-6 w-6" />;
    } else {
      return <FileText className="h-6 w-6" />;
    }
  };

  if (!session) {
    return (
      <Layout>
        <div className="container py-10 text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">Please sign in to view your pending resource submissions.</p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
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

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Pending Resources</h1>
              <p className="text-muted-foreground">
                Resources you've submitted that are awaiting approval
              </p>
            </div>
            <Button asChild className="mt-4 md:mt-0 bg-kenya-green hover:bg-kenya-green/90">
              <Link to="/resources/upload" className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Submit New Resource
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingResources.length === 0 ? (
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Pending Submissions</h2>
                <p className="text-muted-foreground mb-6">
                  You haven't submitted any resources for approval yet.
                </p>
                <Button asChild>
                  <Link to="/resources/upload">Submit a Resource</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingResources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-muted p-3 rounded-full">
                        {getResourceIcon(resource.content)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Awaiting Approval
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          Submitted on {new Date(resource.created_at).toLocaleDateString()}
                        </p>
                        <p className="line-clamp-2">{resource.content}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 px-6 py-3">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Note:</span> Resources are typically reviewed within 2-3 business days.
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <div className="bg-kenya-green/10 rounded-lg p-6 mt-8">
            <h2 className="text-lg font-semibold mb-3">Resource Approval Process</h2>
            <p className="text-sm text-muted-foreground mb-4">
              All submitted resources go through our approval process to ensure quality and accuracy:
            </p>
            <ol className="text-sm space-y-2 ml-6 list-decimal">
              <li>Our team reviews the resource for accuracy and educational value</li>
              <li>Resources that meet our guidelines are approved and published</li>
              <li>You'll receive a notification when your resource status changes</li>
              <li>Approved resources become available in the public Resource Hub</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PendingResources;
