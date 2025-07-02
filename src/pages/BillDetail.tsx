
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, ExternalLink, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/layout/Layout';
import { billService, Bill } from '@/services/billService';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'First Reading':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'Second Reading':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'Committee Stage':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'Third Reading':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
    case 'Presidential Assent':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'Enacted':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const BillDetail = () => {
  const { id } = useParams();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBill(id);
    }
  }, [id]);

  const loadBill = async (billId: string) => {
    try {
      setLoading(true);
      const billData = await billService.getBillById(billId);
      
      if (!billData) {
        setError('Bill not found');
        return;
      }
      
      setBill(billData);
    } catch (error) {
      console.error('Error loading bill:', error);
      setError('Failed to load bill details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-24 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !bill) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error || 'Bill not found'}
            </h1>
            <Button asChild>
              <Link to="/legislative-tracker">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Legislative Tracker
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/legislative-tracker">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Legislative Tracker
            </Link>
          </Button>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(bill.status)}>
                  {bill.status}
                </Badge>
                <Badge variant="outline">{bill.category}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{bill.title}</h1>
              <p className="text-lg text-muted-foreground">{bill.summary}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {bill.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {bill.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Stages */}
            {bill.stages && (
              <Card>
                <CardHeader>
                  <CardTitle>Legislative Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(bill.stages) ? bill.stages.map((stage: any, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          stage.status === 'completed' ? 'bg-green-500' :
                          stage.status === 'current' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{stage.name}</h4>
                            {stage.date && (
                              <span className="text-sm text-muted-foreground">
                                {new Date(stage.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <Badge 
                            variant={stage.status === 'completed' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {stage.status}
                          </Badge>
                        </div>
                      </div>
                    )) : (
                      <p className="text-muted-foreground">Stage information not available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bill Info */}
            <Card>
              <CardHeader>
                <CardTitle>Bill Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sponsored by</p>
                    <p className="font-medium">{bill.sponsor}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date Introduced</p>
                    <p className="font-medium">
                      {new Date(bill.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{bill.category}</p>
                  </div>
                </div>

                {bill.constitutional_section && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Constitutional Section</p>
                        <p className="font-medium">{bill.constitutional_section}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  Follow Bill Updates
                </Button>
                
                {bill.url && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={bill.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Official Document
                    </Link>
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  Share Bill
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Updated {new Date(bill.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Created {new Date(bill.created_at).toLocaleDateString()}
                    </span>
                  </div>
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
