
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Chapter {
    id: string;
    name: string;
    slug: string;
    county: string;
    image_url?: string;
}

const ChaptersSection = () => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const { data, error } = await supabase
                    .from('chapters')
                    .select('id, name, slug, county, image_url')
                    .limit(3);

                if (error) throw error;
                setChapters(data || []);
            } catch (err) {
                console.error('Error fetching chapters for home:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChapters();
    }, []);

    if (loading) return null;
    if (chapters.length === 0) return null;

    return (
        <section className="section-padding bg-muted/30">
            <div className="container">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div className="max-w-xl">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Local Chapters</h2>
                        <p className="text-muted-foreground text-lg">
                            Connect with CEKA in your county. Our local chapters lead the way in grassroots civic education.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-2xl border-primary/20 hover:bg-primary/5">
                        <Link to="/chapters" className="flex items-center gap-2">
                            Explore all chapters
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {chapters.map((chapter, idx) => (
                        <motion.div
                            key={chapter.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link to={`/chapters/${chapter.slug}`} className="group block">
                                <Card className="overflow-hidden border-none shadow-lg group-hover:shadow-2xl transition-all duration-500 rounded-[32px] bg-background">
                                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                                        {chapter.image_url ? (
                                            <img
                                                src={chapter.image_url}
                                                alt={chapter.name}
                                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-kenya-red/5">
                                                <MapPin className="h-10 w-10 text-primary/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-6 left-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <span className="bg-primary px-2 py-0.5 rounded text-[10px] uppercase tracking-tighter">View Chapter</span>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
                                            <MapPin className="h-3 w-3" />
                                            {chapter.county}
                                        </div>
                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{chapter.name}</h3>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ChaptersSection;
