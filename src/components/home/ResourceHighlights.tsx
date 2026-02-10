import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Scale, FileText, ChevronRight, Play, Download, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { translate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const ResourceHighlights = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const resources = {
    constitution: {
      icon: <BookOpen className="h-6 w-6" />,
      color: 'bg-kenya-green',
      borderColor: 'border-kenya-green/20',
      lightBg: 'bg-kenya-green/5',
      id: 'fa8d9e0b-1c2d-4e5f-6g7h-8i9j0k1l2m3n', // Kenya Constitution 2010 PDF
      type: 'Interactive PDF'
    },
    lawmaking: {
      icon: <Scale className="h-6 w-6" />,
      color: 'bg-kenya-red',
      borderColor: 'border-kenya-red/20',
      lightBg: 'bg-kenya-red/5',
      id: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6', // The Lawmaking Process Video
      type: 'Video Insight'
    },
    rights: {
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-blue-600',
      borderColor: 'border-blue-200/50',
      lightBg: 'bg-blue-50/50',
      id: 'c2d3e4f5-g6h7-i8j9-k0l1-m2n3o4p5q6r7', // Bill of Rights Infographic
      type: 'Visual Guide'
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-white dark:bg-black shadow-pattern">
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
              Civic Repository
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {translate('Explore Key Resources', language)}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
              {translate('Deepen your understanding of Kenya\'s governance with our curated selection of verified educational materials.', language)}
            </p>
          </motion.div>

          <Button variant="ghost" className="rounded-full hover:bg-slate-100 dark:hover:bg-white/5 font-bold group">
            Browse Full Library
            <ExternalLink className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          </Button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4"
        >
          {Object.entries(resources).map(([key, data]) => (
            <motion.div key={key} variants={itemVariants} className="h-full">
              <Card className={cn(
                "group h-full flex flex-col overflow-hidden border-black/5 dark:border-white/10",
                "bg-white dark:bg-slate-900/40 backdrop-blur-xl shadow-ios-high dark:shadow-ios-high-dark",
                "transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-[32px]"
              )}>
                <div className={cn("h-3 w-full", data.color)} />
                <CardHeader className="pt-8 pb-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                    data.lightBg,
                    data.color.replace('bg-', 'text-')
                  )}>
                    {data.icon}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest opacity-60", data.color.replace('bg-', 'text-'))}>
                        {data.type}
                      </span>
                      <div className="h-[1px] flex-grow bg-slate-100 dark:bg-white/5" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-kenya-green transition-colors">
                      {translate(key, language)}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pt-2">
                    {key === 'constitution'
                      ? translate("A comprehensive guide to the Kenyan Constitution, breaking down your fundamental rights and the structure of government.", language)
                      : key === 'lawmaking'
                        ? translate("Understand how laws are processed through public participation, debate, and enacted in Parliament.", language)
                        : translate("Learn about your civil, political, and socio-economic rights as guaranteed by the Bill of Rights in Chapter Four.", language)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4 pb-8 space-y-4">
                  <Button
                    asChild
                    className={cn(
                      "w-full h-12 rounded-2xl font-bold transition-all duration-300 shadow-lg",
                      data.color, "hover:opacity-90 text-white shadow-low"
                    )}
                  >
                    <a href={`/resources/${data.id}`} target="_blank" rel="noopener noreferrer">
                      {key === 'lawmaking' ? <Play className="h-4 w-4 mr-2 fill-current" /> : <Download className="h-4 w-4 mr-2" />}
                      {translate('View Resource', language)}
                    </a>
                  </Button>

                  <div className="flex items-center justify-center gap-4 px-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Community Insight Active
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute right-0 bottom-0 w-1/3 h-1/2 bg-gradient-to-tl from-slate-100 dark:from-white/5 to-transparent -z-10 opacity-50" />
    </section>
  );
};

export default ResourceHighlights;
