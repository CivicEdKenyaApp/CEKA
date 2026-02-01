
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
import {
  FileText, Search, Filter, Calendar, ArrowRight, PlusCircle, Loader2, ArrowUpDown,
  TrendingUp, RefreshCw, Layers, CheckCircle, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BillFollowButton } from '@/components/legislative/BillFollowButton';

interface Bill {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  date: string;
  created_at: string;
  url?: string | null;
  sponsor?: string;
  description?: string;
}

type SortOption = 'date-desc' | 'date-asc' | 'alpha-asc' | 'alpha-desc' | 'status' | 'category';

const LegislativeTracker = () => {
  const [billsData, setBillsData] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('bills')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // If no bills in database, create some sample bills
        if (!data || data.length === 0) {
          const sampleBills: Bill[] = [
            {
              id: '74961912-8ba7-47f2-bf61-9ae3abafe2e1',
              title: 'Education Amendment Bill',
              summary: 'Enhances access to quality education for all Kenyan citizens through policy reforms and funding provisions.',
              status: 'First Reading',
              category: 'Education',
              date: '2025-03-15',
              created_at: '2025-03-15T10:00:00Z',
              sponsor: 'Hon. James Mwangi',
              description: 'The Education Amendment Bill seeks to reform Kenya\'s education system by improving infrastructure, curriculum, and teacher training.'
            },
            {
              id: '85072023-9cb8-53e3-c672-0bf4b8ceee3f',
              title: 'Healthcare Access Bill',
              summary: 'Improves healthcare accessibility and affordability for all Kenyan citizens.',
              status: 'Committee Stage',
              category: 'Healthcare',
              date: '2025-02-20',
              created_at: '2025-02-20T14:30:00Z',
              sponsor: 'Hon. Mary Wanjiku',
              description: 'This bill aims to establish universal healthcare coverage and improve medical services across Kenya.'
            },
            {
              id: '96183134-adc9-64f4-d783-1cg5c9dfff4g',
              title: 'Environmental Protection Act',
              summary: 'Strengthens environmental protection measures and promotes sustainable development.',
              status: 'Public Feedback',
              category: 'Environment',
              date: '2025-01-10',
              created_at: '2025-01-10T09:15:00Z',
              sponsor: 'Hon. Peter Kimani',
              description: 'Comprehensive environmental protection legislation to combat climate change and preserve natural resources.'
            }
          ];
          setBillsData(sampleBills);
        } else {
          setBillsData(data || []);
        }
      } catch (e: any) {
        console.error('Error fetching bills:', e);
        setError(e.message || 'Failed to fetch bills.');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  // Filter and sort bills
  useEffect(() => {
    let filtered = billsData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.sponsor && bill.sponsor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bill => bill.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(bill => bill.status === selectedStatus);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredBills(filtered);
  }, [billsData, searchTerm, selectedCategory, selectedStatus, sortBy]);

  // Get unique categories and statuses for filters
  const uniqueCategories = [...new Set(billsData.map(bill => bill.category))].filter(category => category && category.trim() !== '');
  const uniqueStatuses = [...new Set(billsData.map(bill => bill.status))].filter(status => status && status.trim() !== '');

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
      <div className="container py-8 md:py-12 space-y-10 animate-fade-in">
        {/* iOS Aero Hero Hub */}
        <div className="relative p-8 md:p-12 rounded-[40px] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/5 shadow-ios-high overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl w-fit border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kenya-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kenya-green"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Democracy Track</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                Legislative <span className="text-primary italic">Vault</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                Stay ahead of national protocols. Our "Track & Trace" engine monitors every bill, policy amendment, and gazette notice in real-time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-slate-200" />
                ))}
                <div className="h-10 px-4 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
                  +12k Trackers
                </div>
              </div>
              <div className="h-8 w-[1px] bg-border mx-2" />
              <div className="flex items-center gap-2 text-sm font-bold">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Scanning National Gazettes...
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card border-none shadow-ios-high dark:shadow-ios-high-dark rounded-[32px] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Vault Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Identifier</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Bill #, Title, Keyword..."
                      className="pl-10 h-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Order Hierarchy</label>
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl glass-card border-none shadow-2xl">
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="alpha-asc">A-Z</SelectItem>
                      <SelectItem value="alpha-desc">Z-A</SelectItem>
                      <SelectItem value="status">By Status</SelectItem>
                      <SelectItem value="category">By Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sector Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl glass-card border-none shadow-2xl">
                      <SelectItem value="all">All Sectors</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Legal Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl glass-card border-none shadow-2xl">
                      <SelectItem value="all">All Stages</SelectItem>
                      {uniqueStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-2xl hover:bg-muted/50 font-bold"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setSortBy('date-desc');
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Vault
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-ios-high dark:shadow-ios-high-dark rounded-[32px] overflow-hidden bg-kenya-green/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-kenya-green/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-kenya-green" />
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-wider">Top Trending</h4>
                </div>
                <p className="text-xs text-muted-foreground">The Finance Bill 2025 is currently seeing high tracking activity.</p>
                <Button variant="link" className="p-0 h-auto text-kenya-green font-bold text-xs uppercase tracking-widest">
                  View Analysis <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 dark:border-white/5 pb-2">
                <TabsList className="bg-transparent h-auto p-0 flex-wrap sm:flex-nowrap justify-start gap-2 overflow-x-auto no-scrollbar">
                  <TabsTrigger value="all">All Bills ({filteredBills.length})</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="public-feedback">Public Feedback</TabsTrigger>
                  <TabsTrigger value="followed">Following</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Sorted by: {
                    sortBy === 'date-desc' ? 'Newest First' :
                      sortBy === 'date-asc' ? 'Oldest First' :
                        sortBy === 'alpha-asc' ? 'A-Z' :
                          sortBy === 'alpha-desc' ? 'Z-A' :
                            sortBy === 'status' ? 'Status' : 'Category'
                  }</span>
                </div>
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
                ) : filteredBills.length === 0 ? (
                  <div className="bg-muted rounded-md p-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg">No Bills Found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {billsData.length === 0
                        ? 'There are currently no bills to display. Check back later.'
                        : 'No bills match your current filters. Try adjusting your search criteria.'
                      }
                    </p>
                  </div>
                ) : (
                  filteredBills.map((bill) => (
                    <Card key={bill.id} className="group relative overflow-hidden border-none glass-card shadow-ios-high dark:shadow-ios-high-dark rounded-[40px] transition-all hover:translate-y-[-4px]">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-32 bg-muted/20 flex flex-col items-center justify-center p-6 border-r border-border/50">
                          <div className="h-16 w-16 rounded-3xl bg-white dark:bg-white/5 shadow-ios-low flex items-center justify-center mb-3">
                            <FileText className="h-8 w-8 text-primary" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Document</span>
                        </div>
                        <div className="flex-1 p-8 min-w-0 space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                              <Badge className="rounded-xl px-4 py-1.5 bg-primary/10 text-primary border-none font-bold">
                                {bill.category}
                              </Badge>
                              <Badge className="rounded-xl px-4 py-1.5 bg-muted/50 text-muted-foreground border-none font-bold flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {bill.status}
                              </Badge>
                            </div>
                            <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">{new Date(bill.created_at).toLocaleDateString()}</div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="text-2xl font-black tracking-tight leading-tight">
                              <Link to={`/bill/${bill.id}`} className="hover:text-primary transition-colors">
                                {bill.title}
                              </Link>
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 max-w-3xl">
                              {bill.summary}
                            </p>
                          </div>

                          {/* Interactive Bill Journey Simulation */}
                          <div className="flex items-center gap-2 py-4">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden flex">
                              <div className="h-full bg-kenya-green w-1/4" />
                              <div className="h-full bg-muted w-3/4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-kenya-green">25% Progressive Path</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-4 text-xs font-bold">
                              {bill.sponsor && (
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-slate-200" />
                                  <span>{bill.sponsor}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <BillFollowButton billId={bill.id} variant="ghost" className="rounded-2xl h-12 px-6" />
                              <Button asChild className="rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20">
                                <Link to={`/bill/${bill.id}`}>
                                  Trace Bill
                                  <ArrowRight className="ml-2 h-4 w-4" />
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
      </div>
    </Layout>
  );
};

export default LegislativeTracker;
