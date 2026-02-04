import React from 'react';
import Layout from '@/components/layout/Layout';
import MediaFeed from '@/components/resources/MediaFeed';
import { motion } from 'framer-motion';

const VisualInsights = () => {
    return (
        <Layout>
            <div className="container mx-auto py-12 px-4">
                <header className="mb-12 text-center max-w-2xl mx-auto space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kenya-red/10 text-kenya-red text-xs font-bold uppercase tracking-widest"
                    >
                        ● Interactive Learning
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black tracking-tighter italic text-kenya-black dark:text-white uppercase"
                    >
                        Visual <span className="text-kenya-green">Insights</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground"
                    >
                        Explore our collection of educational carousels and PDF series designed to simplify complex civic and legal concepts.
                    </motion.p>
                </header>

                <MediaFeed />
            </div>
        </Layout>
    );
};

export default VisualInsights;
