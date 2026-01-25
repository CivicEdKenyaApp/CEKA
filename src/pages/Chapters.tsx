
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowRight, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface Chapter {
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url?: string;
    county: string;
    lead_name: string;
}

const ChaptersPage = () => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchChapters();
    }, []);

    useEffect(() => {
        setFilteredChapters(
            chapters.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.county.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, chapters]);

    const fetchChapters = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('chapters')
                .select('*')
                .order('name');

            if (error) throw error;
            setChapters(data || []);
        } catch (err) {
            console.error('Error fetching chapters:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container py-8 md:py-12">
                <div className="max-w-2xl mb-12">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Our Chapters</h1>
                    <p className="text-muted-foreground text-lg">
                        CEKA is active across Kenya. Find a local chapter near you and get involved in civic engagement.
                    </p>
                </div>

                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by name or county..."
                            className="pl-10 rounded-2xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                        Showing {filteredChapters.length} chapters
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                    </div>
                ) : filteredChapters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredChapters.map((chapter, idx) => (
                            <motion.div
                                key={chapter.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="h-full overflow-hidden border-border/50 hover:shadow-ios-high transition-all duration-300 group rounded-3xl">
                                    <div className="aspect-video relative overflow-hidden bg-muted">
                                        {chapter.image_url ? (
                                            <img
                                                src={chapter.image_url}
                                                alt={chapter.name}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground/30">
                                                <MapPin className="h-12 w-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none px-3 py-1 rounded-full shadow-sm">
                                                {chapter.county}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{chapter.name}</h3>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                            {chapter.description || 'Dedicated to civic education and local governance accountability.'}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                            <Users className="h-4 w-4" />
                                            <span>Led by {chapter.lead_name || 'Chapter Team'}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="px-6 pb-6 pt-0">
                                        <Button variant="ghost" className="w-full justify-between hover:bg-primary/5 rounded-xl group/btn" asChild>
                                            <Link to={`/chapters/${chapter.slug}`}>
                                                View Details
                                                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed">
                        <h3 className="text-xl font-semibold mb-2">No chapters found</h3>
                        <p className="text-muted-foreground">Try a different search term or check back later.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ChaptersPage;
