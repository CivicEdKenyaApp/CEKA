// Featured Legislation Carousel with Embla
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Bill {
    id: string;
    title: string;
    summary: string;
    status: string;
    category?: string;
    created_at: string;
    follow_count?: number;
}

interface FeaturedLegislationCarouselProps {
    bills: Bill[];
    isLoading?: boolean;
}

const FeaturedLegislationCarousel: React.FC<FeaturedLegislationCarouselProps> = ({ bills, isLoading }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'start',
        skipSnaps: false,
        dragFree: true
    });

    const scrollPrev = () => emblaApi?.scrollPrev();
    const scrollNext = () => emblaApi?.scrollNext();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-48 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="min-w-[320px] h-48 bg-slate-100 dark:bg-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!bills.length) return null;

    return (
        <section className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-kenya-green/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-kenya-green" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">Featured Legislation</h2>
                        <p className="text-xs text-muted-foreground">Most followed bills this week</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollPrev}
                        className="h-9 w-9 rounded-xl border-slate-200 dark:border-white/10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollNext}
                        className="h-9 w-9 rounded-xl border-slate-200 dark:border-white/10"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4">
                    {Array.isArray(bills) && bills.map((bill, index) => (
                        <motion.div
                            key={bill.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="min-w-[320px] md:min-w-[380px]"
                        >
                            <Card className="h-full border-0 bg-white dark:bg-white/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group">
                                <CardContent className="p-6 flex flex-col h-full">
                                    {/* Top Row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <Badge
                                            variant="outline"
                                            className="rounded-full text-[10px] font-black uppercase tracking-widest bg-kenya-green/10 text-kenya-green border-kenya-green/20"
                                        >
                                            {bill.status || 'In Progress'}
                                        </Badge>
                                        {bill.follow_count && bill.follow_count > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Sparkles className="h-3 w-3" />
                                                {bill.follow_count} following
                                            </div>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-kenya-green transition-colors line-clamp-2">
                                        {bill.title}
                                    </h3>

                                    {/* Summary */}
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                        {bill.summary || 'No summary available'}
                                    </p>

                                    {/* Category Tag */}
                                    {bill.category && (
                                        <Badge variant="secondary" className="w-fit mb-4 text-xs rounded-full">
                                            {bill.category}
                                        </Badge>
                                    )}

                                    {/* CTA */}
                                    <Button
                                        asChild
                                        className="w-full rounded-2xl h-12 bg-kenya-black hover:bg-kenya-black/90 text-white font-bold group/btn"
                                    >
                                        <Link to={`/legislative-tracker/bills/${bill.id}`}>
                                            Track This Bill
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Gradient Fades */}
            <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </section>
    );
};

export default FeaturedLegislationCarousel;
