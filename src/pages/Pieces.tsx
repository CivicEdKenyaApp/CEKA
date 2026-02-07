import React from 'react';
import Layout from '@/components/layout/Layout';
import MediaFeed from '@/components/resources/MediaFeed';
import { motion } from 'framer-motion';
import { ExternalLink, Instagram, Facebook, Twitter, Users, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Upscrolled Logo SVG Component
const UpscrolledLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg
        viewBox="0 0 256 256"
        className={className}
        fill="currentColor"
    >
        <g transform="translate(0,256) scale(0.1,-0.1)">
            <path d="M680 1786 c0 -128 4 -256 10 -285 30 -158 156 -294 318 -342 l42 -12
0 -299 0 -299 120 150 c76 95 128 152 142 155 13 3 79 7 148 9 111 3 131 6
182 31 84 40 152 106 190 184 31 63 33 72 33 177 0 99 -3 116 -27 168 -45 95
-150 184 -260 221 -16 5 -18 23 -18 191 l0 185 -440 0 -440 0 0 -234z" />
        </g>
    </svg>
);

// TikTok Icon Component
const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

// CEKA Social Media Accounts - Full Data
const CEKA_SOCIALS = [
    {
        platform: 'Instagram',
        handle: '@civiceducationke',
        followers: '2,600+',
        reach: '200,000 avg monthly',
        url: 'https://instagram.com/civiceducationke',
        icon: Instagram,
        color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
        textColor: 'text-white'
    },
    {
        platform: 'TikTok',
        handle: '@civiceducationkenya',
        followers: '1,700+',
        reach: null,
        url: 'https://tiktok.com/@civiceducationkenya',
        icon: TikTokIcon,
        color: 'bg-black',
        textColor: 'text-white'
    },
    {
        platform: 'X (Twitter)',
        handle: '@CivicEdKe',
        followers: '260+',
        reach: null,
        url: 'https://x.com/CivicEdKe',
        icon: Twitter,
        color: 'bg-black',
        textColor: 'text-white'
    },
    {
        platform: 'Upscrolled',
        handle: '@civiceducationkenya',
        followers: 'New',
        reach: null,
        url: 'https://upscrolled.com/civiceducationkenya',
        icon: UpscrolledLogo,
        color: 'bg-blue-600',
        textColor: 'text-white'
    },
    {
        platform: 'Facebook',
        handle: '@civiceducationkenya',
        followers: '18',
        reach: null,
        url: 'https://facebook.com/civiceducationkenya',
        icon: Facebook,
        color: 'bg-blue-600',
        textColor: 'text-white'
    }
];

// Social Card Component
const SocialCard: React.FC<{ social: typeof CEKA_SOCIALS[0] }> = ({ social }) => {
    const IconComponent = social.icon;
    return (
        <a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
        >
            <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className={`p-4 ${social.color} ${social.textColor}`}>
                    <div className="flex items-center justify-between mb-3">
                        <IconComponent className="w-6 h-6" />
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-sm">{social.platform}</p>
                        <p className="text-xs opacity-80">{social.handle}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                            <Users className="w-3.5 h-3.5" />
                            <span>{social.followers} followers</span>
                        </div>
                        {social.reach && (
                            <div className="flex items-center gap-1.5 text-xs font-medium mt-1 opacity-80">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{social.reach}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </a>
    );
};

// CEKA About Info for AI Context
const CEKA_ABOUT = {
    name: 'Civic Education Kenya (CEKA)',
    mission: 'Empowering Kenyans with civic knowledge to actively participate in governance and democracy.',
    focus_areas: [
        'Constitutional Rights',
        'Electoral Education',
        'Public Participation',
        'Governance & Accountability',
        'Youth Civic Engagement',
        'Legal Literacy'
    ],
    content_types: [
        'Educational Carousels',
        'Infographic Series',
        'PDF Explainers',
        'Video Content',
        'Live Sessions'
    ],
    tagline: 'Know Your Rights. Use Your Voice. Shape Your Future.'
};

const Pieces = () => {
    return (
        <Layout>
            <div className="container mx-auto py-12 px-4">
                {/* Header */}
                <header className="mb-12 text-center max-w-3xl mx-auto space-y-4">
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
                        className="text-4xl md:text-5xl font-black tracking-tighter text-kenya-black dark:text-white uppercase"
                    >
                        Our <span className="text-kenya-green">Pieces</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground"
                    >
                        {CEKA_ABOUT.tagline} Explore our collection of educational carousels, PDF series and visual explainers designed to simplify complex civic, social and legal concepts for everyday Kenyans.
                    </motion.p>
                </header>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                    {/* Main Feed Area */}
                    <div>
                        <MediaFeed />
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8">
                        {/* About Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="overflow-hidden border-kenya-green/20">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold mb-3 text-kenya-black dark:text-white">About CEKA</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                        {CEKA_ABOUT.mission}
                                    </p>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-kenya-green">Focus Areas</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {CEKA_ABOUT.focus_areas.map((area) => (
                                                <span
                                                    key={area}
                                                    className="text-xs px-2 py-1 bg-kenya-green/10 text-kenya-green rounded-full"
                                                >
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Social Links */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4"
                        >
                            <h3 className="text-lg font-bold text-kenya-black dark:text-white">Follow CEKA</h3>
                            <div className="space-y-3">
                                {CEKA_SOCIALS.map((social) => (
                                    <SocialCard key={social.platform} social={social} />
                                ))}
                            </div>
                        </motion.div>

                        {/* Content Types */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="border-kenya-red/20">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold mb-3 text-kenya-black dark:text-white">Content We Create</h3>
                                    <ul className="space-y-2">
                                        {CEKA_ABOUT.content_types.map((type) => (
                                            <li key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-kenya-red" />
                                                {type}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </aside>
                </div>
            </div>
        </Layout>
    );
};

export default Pieces;
