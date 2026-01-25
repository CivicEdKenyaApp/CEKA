
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Mail, Globe, Twitter, Facebook, Instagram, Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Chapter {
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url?: string;
    county: string;
    lead_name: string;
    contact_email?: string;
    social_links?: {
        twitter?: string;
        facebook?: string;
        instagram?: string;
        website?: string;
    };
}

const ChapterDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) fetchChapter();
    }, [slug]);

    const fetchChapter = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('chapters')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setChapter(data);
        } catch (err) {
            console.error('Error fetching chapter:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                </div>
            </Layout>
        );
    }

    if (!chapter) {
        return (
            <Layout>
                <div className="container py-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">Chapter not found</h2>
                    <Button asChild>
                        <Link to="/chapters">Back to Chapters</Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container py-8 md:py-12">
                <Button variant="ghost" asChild className="mb-8 rounded-xl hover:bg-muted/50">
                    <Link to="/chapters" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chapters
                    </Link>
                </Button>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1">
                                {chapter.county} Chapter
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{chapter.name}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                <MapPin className="h-5 w-5" />
                                <span>{chapter.county}, Kenya</span>
                            </div>
                        </div>

                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                                {chapter.description || 'Welcome to the local CEKA chapter. We are dedicated to promoting civic education, transparency, and accountability in our county through community engagement and educational programs.'}
                            </p>
                        </div>

                        <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 backdrop-blur-sm">
                            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Leadership
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                    {chapter.lead_name?.charAt(0) || 'L'}
                                </div>
                                <div>
                                    <div className="font-bold">{chapter.lead_name || 'Chapter Lead'}</div>
                                    <div className="text-sm text-muted-foreground">Lead Coordinator</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-xl">Get in Touch</h3>
                            <div className="flex flex-wrap gap-3">
                                {chapter.contact_email && (
                                    <Button variant="outline" className="rounded-2xl gap-2" asChild>
                                        <a href={`mailto:${chapter.contact_email}`}>
                                            <Mail className="h-4 w-4" />
                                            Email Us
                                        </a>
                                    </Button>
                                )}
                                {chapter.social_links?.twitter && (
                                    <Button variant="outline" size="icon" className="rounded-2xl" asChild>
                                        <a href={chapter.social_links.twitter} target="_blank" rel="noopener noreferrer">
                                            <Twitter className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {chapter.social_links?.facebook && (
                                    <Button variant="outline" size="icon" className="rounded-2xl" asChild>
                                        <a href={chapter.social_links.facebook} target="_blank" rel="noopener noreferrer">
                                            <Facebook className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {chapter.social_links?.instagram && (
                                    <Button variant="outline" size="icon" className="rounded-2xl" asChild>
                                        <a href={chapter.social_links.instagram} target="_blank" rel="noopener noreferrer">
                                            <Instagram className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {chapter.social_links?.website && (
                                    <Button variant="outline" size="icon" className="rounded-2xl" asChild>
                                        <a href={chapter.social_links.website} target="_blank" rel="noopener noreferrer">
                                            <Globe className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="rounded-[40px] overflow-hidden aspect-[4/5] shadow-2xl border-8 border-background relative">
                            {chapter.image_url ? (
                                <img
                                    src={chapter.image_url}
                                    alt={chapter.name}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="bg-gradient-to-br from-primary/20 to-kenya-red/10 w-full h-full flex flex-col items-center justify-center p-12 text-center">
                                    <Logo className="h-20 w-auto mb-6 opacity-20 grayscale" variant="icon-only" />
                                    <h3 className="text-2xl font-bold opacity-30">{chapter.name}</h3>
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-kenya-green/10 rounded-full blur-3xl -z-10" />
                        <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-kenya-red/10 rounded-full blur-3xl -z-10" />
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

import Logo from '@/components/ui/Logo';

export default ChapterDetail;
