// src/pages/LegislativeTracker.tsx
import { vaultService } from '@/services/vaultService';
import React, { useEffect, useState, useMemo } from 'react';
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
  TrendingUp, RefreshCw, Layers, CheckCircle, Clock, Users, BookOpen, Globe, Shield, Scale
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BillFollowButton } from '@/components/legislative/BillFollowButton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Actual Kenyan Legislative Stages
const LEGISLATIVE_STAGES = [
  { id: 'publication', label: 'Publication', desc: 'Bill published in Kenya Gazette' },
  { id: 'first_reading', label: '1st Reading', desc: 'Formal introduction in Parliament' },
  { id: 'committee_referral', label: 'Committee', desc: 'Scrutiny & Public Participation' },
  { id: 'second_reading', label: '2nd Reading', desc: 'Debate on principles & merits' },
  { id: 'whole_house', label: 'House Committee', desc: 'Detailed clause-by-clause review' },
  { id: 'third_reading', label: '3rd Reading', desc: 'Final vote on the floor' },
  { id: 'bicameral', label: 'Bicameral', desc: 'Processing by the other House' },
  { id: 'assent', label: 'Assent', desc: 'Presidential signature into law' }
];

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
  stage_index?: number;
  neural_summary?: string | null;
  text_content?: string | null;
  pdf_url?: string | null;
  follow_count?: number;
}

type SortOption = 'date-desc' | 'date-asc' | 'alpha-asc' | 'alpha-desc' | 'status' | 'category';

const LegislativeTracker = () => {
  const [billsData, setBillsData] = useState<Bill[]>([]);
  const [trendingBills, setTrendingBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all_stages');
  const [searchTerm, setSearchTerm] = useState('');
  const [deepSearch, setDeepSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: trendingData } = await (supabase.rpc as any)('get_trending_bills', { limit_count: 5 });
        if (trendingData) setTrendingBills(trendingData as any);

        // 2. Fetch All Bills (Standard Query)
        let query = supabase.from('bills').select('*');

        if (deepSearch && searchTerm) {
          query = query.textSearch('fts', searchTerm);
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;

        const processedData = (data || []).map(bill => {
          const statusLower = bill.status?.toLowerCase() || '';
          let stageIndex = 0;
          if (statusLower.includes('assent')) stageIndex = 7;
          else if (statusLower.includes('bicameral')) stageIndex = 6;
          else if (statusLower.includes('third')) stageIndex = 5;
          else if (statusLower.includes('whole house')) stageIndex = 4;
          else if (statusLower.includes('second')) stageIndex = 3;
          else if (statusLower.includes('committee')) stageIndex = 2;
          else if (statusLower.includes('first')) stageIndex = 1;

          return { ...bill, stage_index: stageIndex };
        });

        setBillsData(processedData as Bill[]);
      } catch (e: any) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deepSearch, searchTerm]);

  const filteredBills = useMemo(() => {
    return billsData.filter(bill => {
      // If deepSearch is active, data is already filtered/searched by Supabase
      if (deepSearch && searchTerm) return true;

      const matchesSearch = bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || bill.category === selectedCategory;
      const matchesTab = activeTab === 'all_stages' ||
        bill.status.toLowerCase().replace(/ /g, '_').includes(activeTab);

      return matchesSearch && matchesCategory && matchesTab;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'alpha-asc') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [billsData, searchTerm, selectedCategory, activeTab, sortBy, deepSearch]);

  const trendingBill = trendingBills[0] || billsData[0] || { id: "trending-placeholder", title: "Finance Bill", created_at: new Date().toISOString() };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FDFDFD] dark:bg-background overflow-x-hidden">
        {/* EXECUTIVE HERO: Mobile Optimized */}
        <section className="relative px-4 pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-kenya-green/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full" />
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <Badge className="mb-6 rounded-full px-4 py-1.5 bg-kenya-green/10 text-kenya-green border-kenya-green/20 font-black tracking-widest text-[10px] uppercase">
                <Globe className="h-3 w-3 mr-2 animate-pulse" />
                Live National Intelligence
              </Badge>
              <h1 className="text-5xl md:text-8xl font-[1000] tracking-tight leading-[0.9] mb-8 dark:text-white">
                Track <span className="text-transparent bg-clip-text bg-gradient-to-r from-kenya-green to-primary">Democracy</span>.
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                The most advanced legislative bridge in Kenya. Real-time updates from
                <span className="text-foreground font-bold"> National Assembly</span>,
                <span className="text-foreground font-bold"> The Senate</span>, and
                <span className="text-foreground font-bold"> The Gazette</span>.
              </p>
            </motion.div>

            {/* DYNAMIC TRENDING: Variable Based */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12 p-1 rounded-[32px] bg-gradient-to-r from-kenya-green/20 to-primary/20 max-w-md shadow-2xl overflow-hidden"
            >
              <div className="bg-white dark:bg-[#111] p-6 rounded-[28px] flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-kenya-green/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-6 w-6 text-kenya-green" />
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-1 opacity-60">High Activity Trace</h4>
                  <p className="font-bold text-sm mb-3">
                    The <span className="text-kenya-green">{trendingBill.title}</span> is currently seeing 32% more tracking activity this week.
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto text-primary font-black text-xs uppercase tracking-widest gap-2">
                    <Link to={`/bill/${trendingBill.id || ''}`}>
                      View Full Analysis <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* VAULT INTERFACE */}
        <div className="container pb-24">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* SEARCH & FILTERS: Sidebar for Desktop, Floating Tray for Mobile */}
            <aside className="lg:col-span-3 space-y-8">
              <div className="sticky top-24 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Vault Query
                  </h3>
                  <div className="relative group space-y-3">
                    <Input
                      placeholder="Title | Year | Keyword"
                      className="h-14 rounded-2xl bg-white dark:bg-[#111] border-slate-200 dark:border-white/5 shadow-sm focus:ring-primary/20 pr-12"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex items-center gap-2 px-2">
                      <button
                        onClick={() => setDeepSearch(!deepSearch)}
                        className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all",
                          deepSearch
                            ? "bg-primary text-white"
                            : "bg-slate-100 dark:bg-white/5 opacity-50"
                        )}
                      >
                        {deepSearch ? 'Deep Neural Search Active' : 'Enable Deep PDF Search'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Governance Sector
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {['all', 'Finance', 'Education', 'Healthcare', 'Environment'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all",
                          selectedCategory === cat
                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                            : "bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                        )}
                      >
                        {cat === 'all' ? 'All Portfolios' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <Card className="rounded-[32px] border-none bg-kenya-green/5 overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <Scale className="h-8 w-8 text-kenya-green opacity-40" />
                    <h5 className="font-bold">Public Mandate</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Mandatory public participation is currently active for 4 bills in the Committee Stage.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* BILLS JOURNEY: Main Content */}
            <main className="lg:col-span-9 space-y-12">
              <Tabs defaultValue="all_stages" onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-border/50 pb-2">
                  <TabsList className="bg-transparent h-auto p-0 flex-wrap justify-start gap-6 overflow-x-auto no-scrollbar">
                    {['all_stages', 'publication', 'first_reading', 'committee', 'second_reading', 'assent'].map(tab => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="p-0 bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none relative h-10 px-1"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-data-[state=active]:opacity-100">
                          {tab.replace('_', ' ')}
                        </span>
                        <AnimatePresence>
                          {activeTab === tab && (
                            <motion.div
                              layoutId="tab_underline"
                              className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"
                            />
                          )}
                        </AnimatePresence>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="flex items-center gap-4">
                    <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                      <SelectTrigger className="w-[160px] h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-none font-bold text-xs uppercase tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="date-desc">Newest First</SelectItem>
                        <SelectItem value="alpha-asc">A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <TabsContent value={activeTab} className="space-y-6 mt-0">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-64 rounded-[40px] bg-slate-50 dark:bg-white/5 animate-pulse" />
                    ))
                  ) : filteredBills.length === 0 ? (
                    <div className="py-32 text-center space-y-4">
                      <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto">
                        <Shield className="h-10 w-10 opacity-20" />
                      </div>
                      <h3 className="font-black text-2xl tracking-tight">No bills tracked in this vault.</h3>
                      <p className="text-muted-foreground">The "Track & Trace" engine is currently scanning for updates.</p>
                    </div>
                  ) : (
                    filteredBills.map((bill) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={bill.id}
                      >
                        <Card className="group relative overflow-hidden border-none bg-white dark:bg-[#111] shadow-ios-high dark:shadow-ios-high-dark rounded-[40px] transition-all hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                          <div className="flex flex-col md:flex-row">
                            {/* Visual Progress Pillar */}
                            <div className="md:w-48 p-8 flex flex-col justify-between border-r border-border/50 bg-slate-50/30 dark:bg-white/[0.01]">
                              <div className="space-y-4">
                                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-white/5 shadow-sm flex items-center justify-center">
                                  <Scale className="h-7 w-7 text-primary" />
                                </div>
                                <div className="space-y-1">
                                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Current Stage</div>
                                  <div className="text-sm font-black text-kenya-green">{bill.status}</div>
                                </div>
                              </div>

                              {/* Actual Kenyan Stage Journey Mini-Visualizer */}
                              <div className="grid grid-cols-8 gap-1 h-1.5 mt-8">
                                {LEGISLATIVE_STAGES.map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "rounded-full transition-all",
                                      idx <= (bill.stage_index || 0)
                                        ? "bg-kenya-green"
                                        : "bg-slate-200 dark:bg-white/10"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Bill Intelligence */}
                            <div className="flex-1 p-8 md:p-10 space-y-8">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex gap-2">
                                  <Badge className="bg-primary/10 text-primary border-none font-bold rounded-lg px-3">
                                    {bill.category}
                                  </Badge>
                                  {bill.stage_index === 2 && (
                                    <Badge className="bg-orange-500/10 text-orange-500 border-none font-bold rounded-lg px-3 animate-pulse">
                                      Public Feedback Needed
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                  {new Date(bill.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h3 className="text-3xl font-[1000] tracking-tight leading-none dark:text-white group-hover:text-primary transition-colors">
                                  <Link to={`/bill/${bill.id}`}>{bill.title}</Link>
                                </h3>

                                {bill.neural_summary ? (
                                  <div className="bg-kenya-green/[0.03] border border-kenya-green/10 rounded-3xl p-6 mb-4">
                                    <div className="flex items-center gap-2 text-kenya-green mb-3">
                                      <Globe className="h-4 w-4" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Neural Insight (Gemini AI)</span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed italic opacity-80">
                                      {bill.neural_summary}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl line-clamp-3">
                                    {bill.summary}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-border/50">
                                <div className="flex items-center gap-4">
                                  {bill.sponsor && (
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs">
                                        {bill.sponsor.charAt(0)}
                                      </div>
                                      <div className="text-xs font-bold leading-none">
                                        <div className="opacity-40 uppercase tracking-widest text-[8px] mb-1">Mover / Sponsor</div>
                                        {bill.sponsor}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  {bill.pdf_url && (
                                    <Button
                                      variant="outline"
                                      onClick={() => vaultService.openDocument(bill.pdf_url!)}
                                      className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 font-black text-xs uppercase tracking-widest"
                                    >
                                      Vault Copy
                                      <BookOpen className="ml-2 h-4 w-4" />
                                    </Button>
                                  )}
                                  <BillFollowButton billId={bill.id} variant="ghost" className="h-12 px-6 rounded-2xl" />
                                  <Button asChild className="h-12 px-10 rounded-2xl bg-[#111] dark:bg-white text-white dark:text-black font-black hover:opacity-90 shadow-xl">
                                    <Link to={`/bill/${bill.id}`}>
                                      Trace Progress
                                      <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegislativeTracker;
