
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, ExternalLink, Clock, Eye, Share2, Clipboard, Download, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/layout/Layout';
import { billService, Bill } from '@/services/billService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, translate } from '@/lib/utils';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'First Reading':
      return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800/50';
    case 'Second Reading':
      return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800/50';
    case 'Committee Stage':
      return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800/50';
    case 'Third Reading':
      return 'bg-pink-500/10 text-pink-600 border-pink-200 dark:bg-pink-500/20 dark:text-pink-400 dark:border-pink-800/50';
    case 'Presidential Assent':
      return 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800/50';
    case 'Enacted':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800/50';
    case 'Public Feedback':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800/50';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800/50';
  }
};

const LegislativeTimeline = ({ stages, language }: { stages: any[], language: any }) => {
  return (
    <div className="relative mt-8 space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-kenya-green before:via-slate-200 dark:before:via-white/5 before:to-slate-100 dark:before:to-transparent">
      {stages.map((stage, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
        >
          {/* Icon/Dot */}
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border shadow-lg z-10 shrink-0 md:order-1",
            stage.completed
              ? "bg-kenya-green border-kenya-green text-white shadow-kenya-green/20"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400"
          )}>
            {stage.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
          </div>

          {/* Content Card */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-[28px] bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/10 shadow-ios-soft dark:shadow-none hover:shadow-ios-high dark:hover:bg-white/5 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <time className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {stage.date ? new Date(stage.date).toLocaleDateString(language === 'sw' ? 'sw-KE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
              </time>
              <Badge variant="outline" className={cn(
                "font-bold text-[9px] uppercase tracking-tighter px-2",
                stage.completed ? "bg-kenya-green/5 text-kenya-green border-kenya-green/20" : "bg-slate-50 dark:bg-white/5 text-slate-400 border-none"
              )}>
                {stage.completed ? 'Completed' : 'Upcoming'}
              </Badge>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{translate(stage.name, language)}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {stage.description || 'Stage summary will be updated as the bill progresses through the legislative house.'}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const BillDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
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

      if (!billData) {
        // Fallback for demo purposes if ID is from our sample set
        const sampleBills: Record<string, any> = {
          '74961912-8ba7-47f2-bf61-9ae3abafe2e1': {
            id: '74961912-8ba7-47f2-bf61-9ae3abafe2e1',
            title: 'Education Amendment Bill 2024',
            summary: 'A transformative policy framework to enhance access to quality tertiary education through optimized funding models and systemic reforms.',
            status: 'First Reading',
            category: 'Education',
            date: '2024-03-15',
            created_at: '2024-03-15T10:00:00Z',
            updated_at: '2024-05-20T10:00:00Z',
            sponsor: 'Hon. James Mwangi',
            description: 'The Education Amendment Bill seeks to reform Kenya\'s education system by improving infrastructure, curriculum, and teacher training. It addresses challenges in access to quality education, particularly in underserved regions. The bill proposes increased funding for schools, modernization of educational resources, and implementation of inclusive learning practices.',
            constitutional_section: 'Article 53 & 54 - Human Dignity & Social Rights',
            stages: [
              { name: "Introduction", date: "2024-02-10", completed: true, description: "Bill formally introduced in the National Assembly Gazette." },
              { name: "First Reading", date: "2024-03-15", completed: true, description: "Bill read for the first time; committed to the Education Committee." },
              { name: "Public Participation", date: "2024-04-05", completed: true, description: "Stakeholder engagement and public memoranda received by the committee." },
              { name: "Committee Report", date: "2024-05-15", completed: true, description: "Committee tabled its final report recommending specific amendments." },
              { name: "Second Reading", date: "2024-06-10", completed: false, description: "Scheduled for plenary debate on merits and principles." }
            ],
            pdf_url: "https://parliament.go.ke/sites/default/files/2024-03/Education_Bill_2024.pdf"
          }
        };
        billData = sampleBills[billId] || null;
      }

      if (!billData) {
        setError('Bill context not found in the legislative vault.');
        return;
      }

      setBill(billData);
    } catch (error) {
      console.error('Error loading bill:', error);
      setError('Communication trace lost with the legislative server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white dark:bg-black pt-20">
          <div className="container px-4">
            <div className="h-8 w-32 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse mb-8" />
            <div className="space-y-6">
              <div className="h-16 w-3/4 bg-slate-100 dark:bg-white/5 rounded-3xl animate-pulse" />
              <div className="h-32 w-full bg-slate-100 dark:bg-white/5 rounded-[40px] animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !bill) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-kenya-red/5 flex items-center justify-center mx-auto">
              <Clipboard className="h-10 w-10 text-kenya-red opacity-40" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">{error || 'Bill Missing'}</h1>
            <p className="text-slate-500">The legislative engine could not locate the specific trace for this document.</p>
            <Button asChild className="rounded-2xl h-12 px-8 bg-kenya-green font-bold shadow-lg">
              <Link to="/legislative-tracker">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tracker
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const stages = bill.stages || [
    { name: "Publication", date: bill.date, completed: true },
    { name: "First Reading", date: null, completed: false },
    { name: "Second Reading", date: null, completed: false },
    { name: "Third Reading", date: null, completed: false }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/30 dark:bg-black">
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/20 backdrop-blur-3xl -z-10" />
          <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-kenya-green/5 to-transparent -z-10" />

          <div className="container relative px-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Link to="/legislative-tracker" className="inline-flex items-center gap-2 text-slate-400 hover:text-kenya-green font-bold text-xs uppercase tracking-widest transition-colors mb-6 group">
                <div className="h-8 w-8 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm group-hover:-translate-x-1 transition-transform">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                Legislative Tracker
              </Link>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge variant="outline" className={cn(getStatusColor(bill.status), "font-bold border px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest")}>
                  {translate(bill.status, language)}
                </Badge>
                <Badge variant="outline" className="bg-white dark:bg-white/5 text-slate-500 font-bold border-black/5 dark:border-white/10 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  {translate(bill.category, language)}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white mb-6">
                {bill.title}
              </h1>

              <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-4xl">
                {bill.summary}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              {[
                { icon: <User className="h-4 w-4" />, label: "Mover / Sponsor", value: bill.sponsor, color: "text-blue-500 bg-blue-500/5" },
                { icon: <Calendar className="h-4 w-4" />, label: "Date Introduced", value: new Date(bill.date || bill.created_at).toLocaleDateString(), color: "text-kenya-green bg-kenya-green/5" },
                { icon: <Tag className="h-4 w-4" />, label: "Legislative Category", value: bill.category, color: "text-kenya-red bg-kenya-red/5" },
                { icon: <Eye className="h-4 w-4" />, label: "Constitutional Anchor", value: bill.constitutional_section?.split(' - ')[0] || 'Unspecified', color: "text-amber-500 bg-amber-500/5" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-ios-soft"
                >
                  <div className={cn("inline-flex items-center justify-center p-2 rounded-xl mb-3", item.color)}>
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                    <p className="font-bold text-slate-900 dark:text-white truncate">{item.value || 'N/A'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="container relative px-4 pb-24 group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* CONTENT MAIN */}
            <div className="lg:col-span-8 space-y-12">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-1px flex-grow bg-slate-200 dark:bg-white/5" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 shrink-0">Legislative Narrative</h3>
                  <div className="h-1px flex-grow bg-slate-200 dark:bg-white/5" />
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {bill.description || 'This bill is currently undergoing active legislative processing. Comprehensive details regarding its subsections, specific clauses, and policy implications are being indexed into the CEKA engine for public review.'}
                  </p>
                </div>

                {bill.constitutional_section && (
                  <div className="mt-8 p-6 rounded-3xl bg-kenya-green/[0.03] border border-kenya-green/10 flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-2xl bg-kenya-green/10 flex items-center justify-center shrink-0">
                      <Eye className="h-5 w-5 text-kenya-green" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-kenya-green mb-1">Constitutional Context</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{bill.constitutional_section}</p>
                    </div>
                  </div>
                )}
              </motion.div>

              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black tracking-tight leading-tight">Timeline <span className="text-kenya-green mx-1">&</span> Trace</h2>
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                <LegislativeTimeline stages={stages} language={language} />
              </div>
            </div>

            {/* SIDEBAR TOOLS */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="sticky top-24 space-y-8">

                {/* OFFICIAL DOCUMENTS */}
                <Card className="rounded-[40px] border-none bg-white dark:bg-slate-900 shadow-ios-high dark:shadow-none dark:border dark:border-white/5 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Governance Artifacts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-4 group/doc hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                      <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 text-kenya-red">
                        <Download className="h-5 w-5 group-hover/doc:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">Full Gazette Version</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-tighter">PDF Document • 4.2 MB</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-300" />
                    </div>

                    <Button className="w-full h-14 rounded-2xl bg-[#111] dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl">
                      Track this bill
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                {/* ENGAGEMENT TOOLS */}
                <Card className="rounded-[40px] border-none bg-kenya-green/5 dark:bg-kenya-green/10 overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-ios-soft flex items-center justify-center">
                        <Share2 className="h-5 w-5 text-kenya-green" />
                      </div>
                      <h4 className="text-xl font-black tracking-tight">Public Discourse</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Discuss this bill with 1,200 other citizens in the Assembly forum.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full h-12 rounded-2xl border-kenya-green/20 text-kenya-green font-bold hover:bg-kenya-green/5" asChild>
                      <Link to="/blog">Join Discussion</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* UPDATES TRACE */}
                <div className="px-6 space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Last Updated: {new Date(bill.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillDetail;
