
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
    case 'Public Feedback':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
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
      let billData = await billService.getBillById(billId);
      
      // If not found in database, try sample data
      if (!billData) {
        const sampleBills: Record<string, Bill> = {
          '74961912-8ba7-47f2-bf61-9ae3abafe2e1': {
            id: '74961912-8ba7-47f2-bf61-9ae3abafe2e1',
            title: 'Education Amendment Bill',
            summary: 'Enhances access to quality education for all Kenyan citizens through policy reforms and funding provisions.',
            status: 'First Reading',
            category: 'Education',
            date: '2025-03-15',
            created_at: '2025-03-15T10:00:00Z',
            updated_at: '2025-03-15T10:00:00Z',
            sponsor: 'Hon. James Mwangi',
            description: 'The Education Amendment Bill seeks to reform Kenya\'s education system by improving infrastructure, curriculum, and teacher training. It addresses challenges in access to quality education, particularly in underserved regions. The bill proposes increased funding for schools, modernization of educational resources, and implementation of inclusive learning practices.',
            constitutional_section: 'Article 53 & 54 - Education Rights',
            stages: [
              {
                name: "Introduction",
                date: "2025-02-10",
                completed: true,
                description: "The bill was introduced to Parliament by Hon. James Mwangi."
              },
              {
                name: "First Reading",
                date: "2025-03-15",
                completed: true,
                description: "The bill was formally introduced in Parliament."
              },
              {
                name: "Public Feedback",
                date: "2025-04-20",
                completed: false,
                description: "The bill is open for public comments and stakeholder input."
              }
            ]
          },
          '85072023-9cb8-53e3-c672-0bf4b8ceee3f': {
            id: '85072023-9cb8-53e3-c672-0bf4b8ceee3f',
            title: 'Healthcare Access Bill',
            summary: 'Improves healthcare accessibility and affordability for all Kenyan citizens.',
            status: 'Committee Stage',
            category: 'Healthcare',
            date: '2025-02-20',
            created_at: '2025-02-20T14:30:00Z',
            updated_at: '2025-02-20T14:30:00Z',
            sponsor: 'Hon. Mary Wanjiku',
            description: 'This bill aims to establish universal healthcare coverage and improve medical services across Kenya. It includes provisions for healthcare financing, insurance coverage, and medical infrastructure development.',
            constitutional_section: 'Article 43 - Healthcare Rights'
          },
          '96183134-adc9-64f4-d783-1cg5c9dfff4g': {
            id: '96183134-adc9-64f4-d783-1cg5c9dfff4g',
            title: 'Environmental Protection Act',
            summary: 'Strengthens environmental protection measures and promotes sustainable development.',
            status: 'Public Feedback',
            category: 'Environment',
            date: '2025-01-10',
            created_at: '2025-01-10T09:15:00Z',
            updated_at: '2025-01-10T09:15:00Z',
            sponsor: 'Hon. Peter Kimani',
            description: 'Comprehensive environmental protection legislation to combat climate change and preserve natural resources.',
            constitutional_section: 'Article 42 - Environmental Rights'
          }
        };
        
        billData = sampleBills[billId] || null;
      }
      
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
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {bill.description || 'Detailed information about this bill will be available soon. Our team is working to provide comprehensive details about the legislative process, key provisions, and potential impact.'}
                </p>
              </CardContent>
            </Card>

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
                          stage.completed ? 'bg-green-500' :
                          stage.status === 'current' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{stage.name}</h4>
                            {stage.date && stage.date !== 'Pending' && (
                              <span className="text-sm text-muted-foreground">
                                {new Date(stage.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {stage.description && (
                            <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                          )}
                          <Badge 
                            variant={stage.completed ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {stage.completed ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    )) : (
                      <p className="text-muted-foreground">Stage information will be updated as the bill progresses through Parliament.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bill Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sponsored by</p>
                    <p className="font-medium">{bill.sponsor || 'Information pending'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date Introduced</p>
                    <p className="font-medium">
                      {new Date(bill.date || bill.created_at).toLocaleDateString()}
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
