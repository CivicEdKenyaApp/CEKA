
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, GraduationCap, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface Alumnus {
    id: string;
    full_name: string;
    batch_year: string;
    bio?: string;
    avatar_url?: string;
    current_role?: string;
    is_featured?: boolean;
}

const AlumniPage = () => {
    const [alumni, setAlumni] = useState<Alumnus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlumni();
    }, []);

    const fetchAlumni = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('alumni')
                .select('*')
                .order('batch_year', { ascending: false });

            if (error) throw error;
            setAlumni(data || []);
        } catch (err) {
            console.error('Error fetching alumni:', err);
        } finally {
            setLoading(false);
        }
    };

    const featuredAlumni = alumni.filter(a => a.is_featured);
    const regularAlumni = alumni.filter(a => !a.is_featured);

    return (
        <Layout>
            <div className="container py-8 md:py-12">
                <div className="max-w-3xl mb-16">
                    <Badge className="bg-primary/10 text-primary mb-4 border-none px-4 py-1 rounded-full font-bold">
                        CEKA Alumni Network
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Our Future Leaders</h1>
                    <p className="text-muted-foreground text-xl leading-relaxed">
                        Meet the graduates of our civic education programs who are now making a difference in their communities across Kenya.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                    </div>
                ) : (
                    <div className="space-y-20">
                        {/* Featured Section */}
                        {featuredAlumni.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                    <GraduationCap className="h-6 w-6 text-primary" />
                                    Featured Alumni
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {featuredAlumni.map((alumnus) => (
                                        <motion.div
                                            key={alumnus.id}
                                            whileHover={{ y: -5 }}
                                            className="relative"
                                        >
                                            <Card className="bg-muted/30 border-border/50 rounded-[32px] overflow-hidden backdrop-blur-sm">
                                                <CardContent className="p-8">
                                                    <Quote className="h-10 w-10 text-primary/20 absolute top-8 right-8" />
                                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                                        <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                                                            <AvatarImage src={alumnus.avatar_url} />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                                                                {alumnus.full_name?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-xl font-bold">{alumnus.full_name}</h3>
                                                                <Badge variant="outline" className="text-[10px] rounded-full">
                                                                    Class of {alumnus.batch_year}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-primary font-semibold text-sm">{alumnus.current_role}</p>
                                                            <p className="text-muted-foreground text-sm italic line-clamp-4">
                                                                "{alumnus.bio || 'This program completely changed my understanding of governance and my role as a citizen.'}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* List Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gradient-gold">
                                All Alumni
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {regularAlumni.length > 0 ? regularAlumni.map((alumnus) => (
                                    <Card key={alumnus.id} className="border-border/40 hover:border-primary/30 transition-all rounded-3xl">
                                        <CardContent className="p-6 text-center">
                                            <Avatar className="h-16 w-16 mx-auto mb-4 border-2 border-muted">
                                                <AvatarImage src={alumnus.avatar_url} />
                                                <AvatarFallback>{alumnus.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <h4 className="font-bold mb-1">{alumnus.full_name}</h4>
                                            <p className="text-xs text-muted-foreground mb-3">{alumnus.current_role || 'Civic Leader'}</p>
                                            <Badge variant="secondary" className="text-[10px] bg-muted/50 rounded-full">
                                                Class of {alumnus.batch_year}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="col-span-full py-12 text-center text-muted-foreground italic">
                                        More alumni profiles are being added. Check back soon!
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AlumniPage;
