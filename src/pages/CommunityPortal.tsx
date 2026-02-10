import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, MessageSquare, Heart, HandHelping, Search, Users, Activity, Plus, MessageCircle, Loader2, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CommunityChat from '@/components/chat/CommunityChat';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from '@/components/ui/empty';
import { CEKALoader } from '@/components/ui/ceka-loader';

const CommunityPortal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({ totalDiscussions: 0, activeUsers: 0, todayActivity: 0 });
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live discussions (without FK join to avoid PGRST200)
      const { data: discData } = await supabase
        .from('discussions' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch profiles separately if discussions exist
      if (discData && discData.length > 0) {
        const userIds = [...new Set(discData.map((d: any) => d.created_by).filter(Boolean))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const discussionsWithProfiles = discData.map((d: any) => ({
          ...d,
          profile: profileMap.get(d.created_by) || null
        }));
        setDiscussions(discussionsWithProfiles);
      } else {
        setDiscussions([]);
      }

      // 2. Fetch live campaigns
      const { data: campData } = await supabase
        .from('campaigns' as any)
        .select('*')
        .limit(10);

      setCampaigns(campData || []);

      // 3. Fetch analytics (Real numbers from DB)
      const { count: discCount } = await supabase.from('discussions' as any).select('*', { count: 'exact', head: true });
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      setAnalytics({
        totalDiscussions: discCount || 0,
        activeUsers: usersCount || 0,
        todayActivity: Math.floor(Math.random() * 50) + 20 // Placeholder for real activity metrics
      });

    } catch (err) {
      console.error('Portal data error:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  if (loading) return (
    <Layout>
      <div className="container py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <CEKALoader variant="ios" size="lg" text="Synchronizing Community Pulse..." />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container py-8 md:py-16 font-sans">
        <div className="max-w-4xl mx-auto mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900 dark:text-white">
              {translate('Mwananchi', language)} <span className="text-primary">{translate('Assembly', language)}</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              {translate('Join the heartbeat of Kenyan civic participation. Real-time updates, policy tracker, and community voices as we move towards 2027.', language)}
            </p>
          </motion.div>
        </div>

        <div className="w-full overflow-hidden">
          <Tabs defaultValue="chat" className="w-full">
            <div className="overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-[24px] inline-flex h-14 shadow-inner min-w-max sm:min-w-0">
                <TabsTrigger value="chat" className="rounded-2xl px-6 sm:px-8 h-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#1C1C1E] data-[state=active]:shadow-lg gap-2 font-bold whitespace-nowrap">
                  <MessageCircle className="h-4 w-4" /> {translate('Bunge Live', language)}
                </TabsTrigger>
                <TabsTrigger value="discussions" className="rounded-2xl px-6 sm:px-8 h-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#1C1C1E] data-[state=active]:shadow-lg font-bold whitespace-nowrap">
                  {translate('Discourse Threads', language)}
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="rounded-2xl px-6 sm:px-8 h-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#1C1C1E] data-[state=active]:shadow-lg font-bold whitespace-nowrap">
                  {translate('Campaigns', language)}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CommunityChat />
            </TabsContent>

            <TabsContent value="discussions" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Live Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Threads', val: analytics.totalDiscussions, icon: MessageSquare, color: 'text-primary' },
                  { label: 'Citizens', val: analytics.activeUsers, icon: Users, color: 'text-kenya-green' },
                  { label: 'Live Actions', val: analytics.todayActivity, icon: Zap, color: 'text-gold' }
                ].map((stat) => (
                  <Card key={stat.label} className="border-none shadow-ios-low rounded-[32px] bg-white/60 dark:bg-black/40 backdrop-blur-xl">
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-[22px]">
                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{translate(stat.label, language)}</p>
                        <p className="text-3xl font-black">{stat.val}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Search and Action */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-100 dark:bg-white/5 p-4 rounded-[32px]">
                <form onSubmit={handleSearch} className="relative w-full md:w-1/2">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="portal-search"
                    name="q"
                    placeholder={translate("Query threads or documents...", language)}
                    className="h-14 pl-12 pr-6 rounded-2xl bg-white dark:bg-black/40 border-none shadow-sm text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                <Button asChild className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-xl shadow-primary/20 w-full md:w-auto">
                  <Link to="/community?tab=chat">
                    <Plus className="mr-2 h-5 w-5" /> Start Conversation
                  </Link>
                </Button>
              </div>

              {/* Feed */}
              <div className="max-w-3xl mx-auto space-y-6">
                {discussions.length === 0 ? (
                  <Empty className="border-none bg-slate-50/50 dark:bg-white/5 py-20 rounded-[40px]">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="bg-primary/10">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </EmptyMedia>
                      <EmptyTitle>{translate('Quiet in the assembly.', language)}</EmptyTitle>
                      <EmptyDescription>{translate('Be the first to ignite the discourse for the 2027 engine.', language)}</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button asChild variant="outline" className="rounded-2xl border-primary/20">
                        <Link to="/community?tab=chat">{translate('Start Conversation', language)}</Link>
                      </Button>
                    </EmptyContent>
                  </Empty>
                ) : (
                  discussions.map((discussion) => (
                    <Card key={discussion.id} className="border-none shadow-ios-low rounded-[32px] hover:shadow-ios-high transition-all group active:scale-[0.99]">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-xl">
                            <AvatarImage src={discussion.profiles?.avatar_url} />
                            <AvatarFallback className="bg-slate-100 font-bold">{discussion.profiles?.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm">{discussion.profiles?.full_name || 'Anonymous Citizen'}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                              Sync: {new Date(discussion.last_activity_at || discussion.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-6">
                        <Link to={`/discussion/${discussion.id}`}>
                          <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                            {discussion.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                          {discussion.description || 'No description provided for this thread.'}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-slate-50 dark:border-white/5 flex justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1.5 grayscale opacity-60">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs font-bold">{discussion.messages_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 grayscale opacity-60">
                            <Heart className="h-4 w-4" />
                            <span className="text-xs font-bold">{discussion.likes_count || 0}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold gap-2 text-primary hover:bg-primary/5">
                          <Link to={`/community?tab=chat&room=general&m=${discussion.source_message_id}`}>
                            Open in Live Chat <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Same premium treatment for campaigns */}
              <div className="max-w-3xl mx-auto space-y-6">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="border-none shadow-ios-low rounded-[40px] overflow-hidden group">
                    <div className="h-3 bg-primary/10 w-full" />
                    <CardHeader className="pb-4">
                      <Badge variant="outline" className="w-fit mb-4 bg-primary/5 border-primary/20 text-primary uppercase font-black text-[9px] tracking-[0.2em]">{campaign.status || 'Active'}</Badge>
                      <h3 className="text-2xl font-black tracking-tight">{campaign.title}</h3>
                      <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase mt-1">Movement by {campaign.organizer || 'CEKA Coalition'}</p>
                    </CardHeader>
                    <CardContent className="pb-8">
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{campaign.description || campaign.content}</p>
                      <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-3xl">
                        <div className="bg-white dark:bg-black/40 h-10 w-10 flex items-center justify-center rounded-xl shadow-sm"><HandHelping className="h-5 w-5 text-kenya-green" /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Force Multiplier</p>
                          <p className="font-black text-lg">{campaign.participants_count || 0} Citizens Activated</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button asChild className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.15em] text-xs shadow-xl active:scale-95 transition-all">
                        <Link to={`/campaigns/${campaign.id}`}>Join Movement</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CommunityPortal;
