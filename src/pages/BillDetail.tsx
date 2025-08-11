
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/layout/Layout';
import { BillFollowButton } from '@/components/legislative/BillFollowButton';
import { ShareButton } from '@/components/legislative/ShareButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Bill {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  sponsor: string;
  date: string;
  description?: string;
  constitutional_section?: string;
  sources?: string;
  stages?: any;
}

const BillDetail = () => {
  const { id } = useParams();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchBill();
    }
  }, [id]);

  const fetchBill = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBill(data);
    } catch (error) {
      console.error('Error fetching bill:', error);
      toast({
        title: "Error",
        description: "Failed to load bill details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!bill) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Bill not found</h1>
            <p className="text-muted-foreground">The requested bill could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const billUrl = `${window.location.origin}/bills/${bill.id}`;
  const shareText = `Check out this bill: ${bill.title}`;

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bill Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge variant={bill.status === 'passed' ? 'default' : 'secondary'}>
                      {bill.status}
                    </Badge>
                    <CardTitle className="text-2xl">{bill.title}</CardTitle>
                    <CardDescription>
                      Sponsored by {bill.sponsor} • {new Date(bill.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{bill.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-lg text-muted-foreground mb-4">{bill.summary}</p>
                  {bill.description && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{bill.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bill Stages */}
            {bill.stages && (
              <Card>
                <CardHeader>
                  <CardTitle>Legislative Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {typeof bill.stages === 'object' && Object.entries(bill.stages).map(([stage, status], index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${status ? 'bg-kenya-green' : 'bg-gray-300'}`} />
                        <span className={`capitalize ${status ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {stage.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {(bill.constitutional_section || bill.sources) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bill.constitutional_section && (
                    <div>
                      <h4 className="font-semibold mb-2">Constitutional Section</h4>
                      <p className="text-muted-foreground">{bill.constitutional_section}</p>
                    </div>
                  )}
                  {bill.sources && (
                    <div>
                      <h4 className="font-semibold mb-2">Sources</h4>
                      <p className="text-muted-foreground">{bill.sources}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <BillFollowButton 
                  billId={bill.id} 
                  size="default" 
                  variant="default"
                  showCount={true}
                />
                <ShareButton
                  title={bill.title}
                  text={shareText}
                  url={billUrl}
                  billId={bill.id}
                  variant="outline"
                  size="default"
                />
              </CardContent>
            </Card>

            {/* Bill Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bill Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={bill.status === 'passed' ? 'default' : 'secondary'}>
                    {bill.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{bill.category}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sponsor</span>
                  <span className="font-medium">{bill.sponsor}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(bill.date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillDetail;
