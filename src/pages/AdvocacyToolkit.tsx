import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Search,
  Download,
  ArrowRight,
  Scale,
  ShieldAlert,
  Gavel,
  BookOpen,
  Zap,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AIContextButton from '@/components/ai/AIContextButton';
import EmergencyHotline from '@/components/hotline/EmergencyHotline';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  thumbnail_url: string | null;
  type: string;
  is_downloadable: boolean;
  content?: string | null; // From advocacy_toolkit
  source?: 'resource' | 'toolkit';
}

const AdvocacyToolkit = () => {
  const [items, setItems] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch from resources
        const { data: resData, error: resError } = await supabase
          .from('resources')
          .select('*')
          .or('category.eq.advocacy,category.eq.legal,category.eq.constitution');

        // Fetch from advocacy_toolkit
        const { data: toolkitData, error: toolkitError } = await supabase
          .from('advocacy_toolkit')
          .select('*');

        if (resError) throw resError;
        if (toolkitError) throw toolkitError;

        // Map and merge
        const mappedResources: Resource[] = (resData || []).map(r => ({
          ...r,
          source: 'resource'
        }));

        const mappedToolkit: Resource[] = (toolkitData || []).map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          content: t.content,
          category: t.category,
          url: '#', // These will likely open a detail view or modal
          thumbnail_url: null,
          type: 'guide',
          is_downloadable: false,
          source: 'toolkit'
        }));

        setItems([...mappedToolkit, ...mappedResources]);
      } catch (error) {
        console.error('Error fetching toolkit items:', error);
        toast({
          title: "Connection Issue",
          description: "We couldn't load the latest advocacy tools. Falling back to offline guide.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [toast]);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const constitutionResource = items.find(r => r.title.toLowerCase().includes('constitution')) || {
    title: "The Constitution of Kenya (2010)",
    description: "The supreme law of the Republic of Kenya. Every person has an obligation to respect, uphold and defend this Constitution.",
    url: "https://www.klrc.go.ke/index.php/constitution-of-kenya",
    category: "Constitution"
  };

  const featureCards = [
    {
      title: "Know Your Rights",
      description: "Learn about Fundamental Rights and Freedoms (Chapter Four).",
      icon: <ShieldAlert className="h-6 w-6 text-kenya-red" />,
      link: "/resources?cat=rights",
      color: "from-red-500/10 to-transparent"
    },
    {
      title: "Self-Advocacy",
      description: "How to handle police encounters and illegal crackdowns.",
      icon: <Megaphone className="h-6 w-6 text-kenya-green" />,
      link: "/resources?cat=guides",
      color: "from-green-500/10 to-transparent"
    },
    {
      title: "Legal Aid",
      description: "Access pro-bono legal services and support networks.",
      icon: <LifeBuoy className="h-6 w-6 text-blue-500" />,
      link: "/resources?cat=legal",
      color: "from-blue-500/10 to-transparent"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20">
        {/* iOS style hero header */}
        <section className="relative pt-24 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-kenya-green/5 via-transparent to-transparent -z-10" />
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-kenya-green/10 text-kenya-green border-kenya-green/20 rounded-full px-4 py-1">
                <Zap className="h-3 w-3 mr-2" />
                Empowerment Hub
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Advocacy & Rights Toolkit
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                A sanctuary for legal knowledge. Access the tools you need to defend justice,
                demand accountability, and exercise your constitutional powers as a Kenyan.
              </p>

              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search laws, rights, or guides..."
                  className="pl-10 h-12 rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-ios-high shadow-slate-200/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container px-4 py-12 space-y-16">
          {/* Featured Constitution - iOS Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-ios-high bg-white dark:bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-br from-kenya-green/5 via-transparent to-kenya-red/5 opacity-50" />
              <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-kenya-green/20 blur-3xl rounded-full animate-pulse" />
                    <Card className="aspect-[3/4] w-48 bg-gradient-to-br from-kenya-green to-primary rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 text-white border-none transform group-hover:rotate-2 transition-transform duration-500">
                      <Scale className="h-16 w-16 mb-4 drop-shadow-lg" />
                      <div className="text-center font-bold text-lg leading-tight">
                        KATIBA <br />YA KENYA
                      </div>
                      <div className="mt-8 text-[8px] uppercase tracking-[0.2em] opacity-80">
                        Revised Edition 2010
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                      The Constitution of Kenya
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">Alpha Resource</Badge>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      {constitutionResource.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => window.open(constitutionResource.url, '_blank')} className="rounded-2xl h-12 px-8 bg-kenya-green hover:bg-primary text-white shadow-lg shadow-kenya-green/20 transition-all hover:scale-105">
                      Read Online
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <AIContextButton
                      label="Summarize with AI"
                      context={constitutionResource.title + ": " + constitutionResource.description}
                      variant="outline"
                      className="rounded-2xl h-12 px-8 border-slate-200 dark:border-slate-800 backdrop-blur-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className={cn(
                  "h-full rounded-3xl border-none shadow-ios-high bg-white dark:bg-slate-900 overflow-hidden",
                  "bg-gradient-to-br", card.color
                )}>
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-6">
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                      {card.description}
                    </p>
                    <Link to={card.link} className="inline-flex items-center text-kenya-green font-semibold group">
                      Explore Resources
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Dynamic Resources List */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Latest Advocacy Guides</h2>
              <Button variant="link" asChild>
                <Link to="/resources">View all resources <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-32 rounded-3xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                ))
              ) : filteredItems.length > 0 ? (
                filteredItems.slice(0, 10).map((item) => (
                  <motion.div key={item.id} whileHover={{ x: 5 }}>
                    <Card className={cn(
                      "rounded-2xl border transition-all group cursor-pointer backdrop-blur-sm",
                      item.source === 'toolkit'
                        ? "border-kenya-green/20 bg-kenya-green/5 dark:bg-kenya-green/10"
                        : "border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20"
                    )}
                      onClick={() => item.source === 'resource' ? window.open(item.url, '_blank') : toast({
                        title: item.title,
                        description: "Rich guide content is coming soon to the detail view!",
                      })}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                          item.source === 'toolkit' ? "bg-kenya-green/20 text-kenya-green" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        )}>
                          {item.source === 'toolkit' ? <BookOpen className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                            {item.source === 'toolkit' && <Badge variant="outline" className="text-[8px] h-4 px-1 border-kenya-green/30 text-kenya-green">Toolkit</Badge>}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-kenya-green transition-colors" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No specific guides found for "{searchQuery}". Try a broader term.</p>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action - Legal Services */}
          <section className="pt-8 pb-12">
            <EmergencyHotline />
          </section>

          <section className="pt-8 pb-12">
            <Card className="rounded-[2.5rem] bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-kenya-green/20 blur-[100px] -mr-32 -mt-32" />
              <CardContent className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-4 max-w-xl">
                  <h3 className="text-3xl font-bold">Involved in a legal dispute?</h3>
                  <p className="text-slate-300 text-lg">
                    CEKA works with a network of pro-bono lawyers in Kenya to support victims of
                    rights violations and police brutality. Don't fight alone.
                  </p>
                </div>
                <Button className="rounded-2xl h-14 px-10 bg-white text-slate-900 hover:bg-slate-100 font-bold transition-all hover:scale-105">
                  Request Legal Support
                </Button>
              </CardContent>
            </Card>
          </section>
        </section>
      </div>
    </Layout>
  );
};

export default AdvocacyToolkit;
