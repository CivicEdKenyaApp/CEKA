import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, Calendar, ArrowRight, PlusCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Define the Bill interface based on Supabase schema
interface Bill {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  date: string; // ISO string from Supabase
  url?: string | null;
  // Add other fields if needed, like created_at, updated_at
}

// Mock data for bills - will be replaced by fetched data
// const bills = [ ... ]; // Removed mock data

const LegislativeTracker = () => {
  const [billsData, setBillsData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('bills')
          .select('*')
          .order('date', { ascending: false }); // Example: order by date

        if (fetchError) {
          throw fetchError;
        }
        setBillsData(data || []);
      } catch (e: any) {
        console.error('Error fetching bills:', e);
        setError(e.message || 'Failed to fetch bills.');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const BillCardSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-16 lg:w-20 bg-muted flex items-center justify-center p-4">
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="flex-1 p-5 md:p-6 space-y-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-5 w-20 rounded mt-1 md:mt-0" />
          </div>
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <div className="flex flex-wrap items-center justify-between mt-2">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="flex gap-2 mt-2 md:mt-0">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-24 rounded" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Legislative Tracker</h1>
            <p className="text-muted-foreground">Stay informed about bills and legislative changes in Kenya</p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
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
                    <Input placeholder="Search bills..." className="pl-8" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="first-reading">First Reading</SelectItem>
                      <SelectItem value="public-feedback">Public Feedback</SelectItem>
                      <SelectItem value="committee-review">Committee Review</SelectItem>
                      <SelectItem value="second-reading">Second Reading</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="all">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Bills</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="public-feedback">Public Feedback</TabsTrigger>
                  <TabsTrigger value="followed">Following</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="space-y-4 mt-0">
                {loading ? (
                  <>
                    <BillCardSkeleton />
                    <BillCardSkeleton />
                    <BillCardSkeleton />
                  </>
                ) : error ? (
                  <div className="text-red-500 p-4 border border-red-500 rounded-md">
                    <p>Error loading bills: {error}</p>
                    <p>Please try again later.</p>
                  </div>
                ) : billsData.length === 0 ? (
                   <div className="bg-muted rounded-md p-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg">No Bills Found</h3>
                    <p className="text-sm text-muted-foreground mt-1">There are currently no bills to display. Check back later or try adjusting your filters.</p>
                  </div>
                ) : (
                  billsData.map((bill) => (
                    <Card key={bill.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-16 lg:w-20 bg-muted flex items-center justify-center p-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 p-5 md:p-6">
                          <div className="flex flex-col md:flex-row justify-between md:items-center">
                            <Badge variant="outline" className="mb-2 md:mb-0 w-fit">
                              {bill.category}
                            </Badge>
                            <Badge 
                              variant={bill.status === "Public Feedback" ? "secondary" : "outline"}
                              className={`${bill.status === "Public Feedback" ? "bg-yellow-500 text-black" : ""} w-fit`} // Adjusted styling for Public Feedback
                            >
                              {bill.status}
                            </Badge>
                          </div>
                          
                          <h3 className="text-lg font-semibold mt-2 mb-1">
                            <Link to={`/legislative-tracker/${bill.id}`} className="hover:text-kenya-green transition-colors">
                              {bill.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3"> {/* Added line-clamp */}
                            {bill.summary}
                          </p>
                          
                          <div className="flex flex-wrap items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Last updated: {new Date(bill.date).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex gap-2 mt-2 md:mt-0">
                              <Button size="sm" variant="outline">Follow</Button>
                              <Button size="sm" variant="ghost" asChild>
                                <Link to={`/legislative-tracker/${bill.id}`} className="flex items-center">
                                  Details
                                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="new">
                <div className="bg-muted rounded-md p-8 text-center">
                  <h3 className="font-medium">New Bills</h3>
                  <p className="text-sm text-muted-foreground mt-1">Filter applied to show only recently introduced bills.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="public-feedback">
                <div className="bg-muted rounded-md p-8 text-center">
                  <h3 className="font-medium">Bills Open for Public Feedback</h3>
                  <p className="text-sm text-muted-foreground mt-1">Filter applied to show bills currently accepting public input.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="followed">
                <div className="bg-muted rounded-md p-8 text-center">
                  <h3 className="font-medium">Bills You're Following</h3>
                  <p className="text-sm text-muted-foreground mt-1">Sign in to view and track the bills you're following.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="mt-10 p-6 border border-dashed border-muted-foreground/20 rounded-lg text-center relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-4">
            <PlusCircle className="h-6 w-6 text-kenya-green mx-auto" />
          </div>
          <div className="max-w-xl mx-auto">
            <h3 className="text-lg font-medium mb-2">Contribute to Legislative Tracking</h3>
            <p className="text-muted-foreground mb-4">
              Have information about bills or legislative changes? Share URLs, documents, or descriptions 
              to help keep this tracker up-to-date.
            </p>
            <Button asChild className="bg-kenya-green hover:bg-kenya-green/90">
              <Link to="/legislative-tracker/contribute">
                Share Insights or URLs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegislativeTracker;
