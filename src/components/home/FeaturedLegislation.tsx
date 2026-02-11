import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, EyeIcon, Users, Tag, Clock, Share2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate, cn } from '@/lib/utils';
import { billService, Bill } from '@/services/billService';
import { CEKACardSkeleton } from '@/components/ui/ceka-loader';

// Status color mapping
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
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800/50';
  }
};

const getTimeRemaining = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff > 0) {
    return `${diff} days left`;
  } else if (diff === 0) {
    return 'Active Today';
  } else {
    return `${Math.abs(diff)}d ago`;
  }
};

const FeaturedLegislation = () => {
  const { language } = useLanguage();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedBills();
  }, []);

  const loadFeaturedBills = async () => {
    try {
      const featuredBills = await billService.getFeaturedBills(3);
      setBills(featuredBills);
    } catch (error) {
      console.error('Error loading featured bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (loading) {
    return (
      <div className="py-12 md:py-16 bg-slate-50/50 dark:bg-black/20">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-slate-200 dark:bg-white/5 rounded-full animate-pulse" />
              <div className="h-4 w-96 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border border-black/5 dark:border-white/5 p-6 space-y-4 animate-pulse">
                <div className="h-6 w-24 bg-slate-200 dark:bg-white/5 rounded-full" />
                <div className="h-12 w-full bg-slate-200 dark:bg-white/5 rounded-2xl" />
                <div className="h-24 w-full bg-slate-200 dark:bg-white/5 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-slate-50/30 dark:bg-black/40 -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-kenya-green/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-kenya-red/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10" />

      <div className="container relative">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6 px-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kenya-green/10 text-kenya-green text-[10px] font-bold uppercase tracking-widest border border-kenya-green/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kenya-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kenya-green"></span>
              </span>
              Parliamentary Watch
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {translate('Featured Legislation', language)}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">
              {translate('Track key bills and policies currently under consideration in the National Assembly and Senate.', language)}
            </p>
          </motion.div>
          <Link to="/legislative-tracker">
            <Button variant="outline" className="rounded-full border-black/10 dark:border-white/10 hover:bg-kenya-green hover:text-white hover:border-kenya-green transition-all duration-300 px-6 font-bold group">
              {translate('View all legislation', language)}
              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-6 px-4"
        >
          {Array.isArray(bills) && bills.map((bill) => (
            <motion.div key={bill.id} variants={cardVariants}>
              <Card className={cn(
                "group relative h-full flex flex-col overflow-hidden border-black/5 dark:border-white/10",
                "bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl shadow-ios-high dark:shadow-ios-high-dark",
                "transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-[32px]"
              )}>
                <CardHeader className="pb-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn(getStatusColor(bill.status), "font-bold border px-3 py-1 rounded-full text-[10px] uppercase tracking-wider")}>
                      {translate(bill.status, language)}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-bold">
                      <Clock className="h-3.5 w-3.5" />
                      {getTimeRemaining(bill.date)}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-kenya-green transition-colors duration-300">
                      {bill.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 mt-3 text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                      {bill.summary}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="h-3.5 w-3.5 text-kenya-green" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sector</span>
                      </div>
                      <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">{bill.category}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-kenya-red" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                      </div>
                      <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">
                        {new Date(bill.date).toLocaleDateString(language === 'sw' ? 'sw-KE' : 'en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="col-span-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-3.5 w-3.5 text-kenya-green" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sponsorship</span>
                      </div>
                      <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">
                        Sponsored by {bill.sponsor}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-6 flex gap-3 mt-auto">
                  <Button asChild className="flex-1 rounded-2xl h-11 bg-kenya-green hover:bg-kenya-green/90 text-white font-bold shadow-lg shadow-kenya-green/20 group/btn">
                    <Link to={`/bill/${bill.id}`} className="flex items-center justify-center">
                      <EyeIcon className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      {translate('View Details', language)}
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-black/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </CardFooter>

                {/* Subtle Gradient Shine */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/10 to-transparent pointer-events-none transition-opacity duration-700" />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedLegislation;
