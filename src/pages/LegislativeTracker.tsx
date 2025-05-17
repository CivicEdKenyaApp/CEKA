
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { FileText, Search, Filter, Calendar, ArrowRight, PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

interface Bill {
  id: string; // Assuming id is string (UUID from Supabase)
  title: string;
  summary: string | null;
  status: string | null;
  category: string | null;
  date: string | null; // Supabase timestamp, will be string
  url?: string | null; // Optional URL for the full bill
  // created_at and updated_at are likely present but not explicitly used in cards
}

const LegislativeTracker = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for filters - you can implement their logic later
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    async function fetchBills() {
      setLoading(true);
      setError(null);
      // Adjust table name if different in your Supabase schema, e.g., 'bills'
      const { data, error: supabaseError } = await supabase
        .from('bills') // Ensure this is your actual table name
        .select('*') // Select all columns, or specify ones you need
        .order('date', { ascending: false }); // Order by date, newest first

      if (supabaseError) {
        console.error('Error fetching bills:', supabaseError);
        setError(supabaseError.message);
      } else {
        // Cast data to Bill[] - ensure Supabase table columns match Bill interface
        setBills(data as Bill[]); 
      }
      setLoading(false);
    }

    fetchBills();
  }, []);

  // TODO: Implement filtering logic based on searchTerm, selectedCategory, selectedStatus
  const filteredBills = bills.filter(bill => {
    const matchesSearch = searchTerm === '' || 
                          bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (bill.summary && bill.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || bill.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || bill.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Unique categories and statuses from fetched bills for filter dropdowns
  const uniqueCategories = Array.from(new Set(bills.map(bill => bill.category).filter(Boolean))) as string[];
  const uniqueStatuses = Array.from(new Set(bills.map(bill => bill.status).filter(Boolean))) as string[];


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
                  <label htmlFor="billSearch" className="text-sm font-medium mb-1.5 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="billSearch" 
                      placeholder="Search bills..." 
                      className="pl-8" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="billCategory" className="text-sm font-medium mb-1.5 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="billCategory">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="billStatus" className="text-sm font-medium mb-1.5 block">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger id="billStatus">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                       {uniqueStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Apply Filters button can be removed if filters apply on change, or implement its logic */}
                {/* <Button variant="outline" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button> */}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="all">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Bills</TabsTrigger>
                  {/* Placeholder tabs, functionality can be built out */}
                  {/* <TabsTrigger value="new">New</TabsTrigger> */}
                  {/* <TabsTrigger value="public-feedback">Public Feedback</TabsTrigger> */}
                  {/* <TabsTrigger value="followed">Following</TabsTrigger> */}
                </TabsList>
              </div>
              
              <TabsContent value="all" className="space-y-4 mt-0">
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading bills...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-10 px-4 bg-destructive/10 rounded-md">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                    <h3 className="mt-2 text-lg font-medium text-destructive">Failed to load bills</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                    <Button onClick={() => window.location.reload()} className="mt-4">
                      Try Again
                    </Button>
                  </div>
                ) : filteredBills.length === 0 ? (
                  <div className="bg-muted rounded-md p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium">No Bills Found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                        ? "No bills match your current filters. Try adjusting them."
                        : "There are currently no legislative bills to display. Please check back later or contribute."}
                    </p>
                  </div>
                ) : (
                  filteredBills.map((bill) => (
                    <Card key={bill.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-16 lg:w-20 bg-muted flex items-center justify-center p-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 p-5 md:p-6">
                          <div className="flex flex-col md:flex-row justify-between md:items-start">
                            {bill.category && (
                              <Badge variant="outline" className="mb-2 md:mb-0 w-fit">
                                {bill.category}
                              </Badge>
                            )}
                            {bill.status && (
                              <Badge 
                                variant={bill.status === "Public Feedback" ? "secondary" : "outline"}
                                className={`${bill.status === "Public Feedback" ? "bg-yellow-500 text-black" : ""} w-fit mt-2 md:mt-0`}
                              >
                                {bill.status}
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold mt-2 mb-1">
                            {/* Ensure your LegislationDetail page route matches */}
                            <Link to={`/legislation-detail/${bill.id}`} className="hover:text-kenya-green transition-colors">
                              {bill.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {bill.summary || <em>No summary provided.</em>}
                          </p>
                          
                          <div className="flex flex-wrap items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {bill.date ? `Last updated: ${new Date(bill.date).toLocaleDateString()}` : 'Date N/A'}
                              </span>
                            </div>
                            
                            <div className="flex gap-2 mt-3 md:mt-0">
                              {/* TODO: Implement "Follow" functionality */}
                              <Button size="sm" variant="outline" disabled>Follow</Button>
                              <Button size="sm" variant="ghost" asChild>
                                <Link to={`/legislation-detail/${bill.id}`} className="flex items-center">
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
              
              {/* These TabsContent sections can be built out with specific filtering logic if needed */}
              {/* <TabsContent value="new"> ... </TabsContent> */}
              {/* <TabsContent value="public-feedback"> ... </TabsContent> */}
              {/* <TabsContent value="followed"> ... </TabsContent> */}
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
            {/* Ensure this route exists or adjust as needed */}
            <Button asChild className="bg-kenya-green hover:bg-kenya-green/90">
              <Link to="/contribute"> 
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

