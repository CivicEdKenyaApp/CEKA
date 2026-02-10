import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import storageService from '@/services/storageService';
import { CEKACardSkeleton } from '@/components/ui/ceka-loader';

interface Campaign {
    id: string;
    title: string;
    description: string;
    image_url: string;
    target_url: string;
}

interface CampaignSpotlightProps {
    section: string;
}

const CampaignSpotlight: React.FC<CampaignSpotlightProps> = ({ section }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const { data, error } = await (supabase
                    .from('platform_campaigns' as any) as any)
                    .select('*')
                    .eq('section_target', section)
                    .eq('is_active', true)
                    .limit(1);

                if (error) throw error;

                // HYDRATE campaign images for B2 proxy
                const rawCampaigns = data || [];
                const hydratedCampaigns = await Promise.all(rawCampaigns.map(async (camp: any) => {
                    if (camp.image_url) {
                        const authorizedUrl = await storageService.getAuthorizedUrl(camp.image_url);
                        return { ...camp, image_url: authorizedUrl };
                    }
                    return camp;
                }));

                setCampaigns(hydratedCampaigns as any);
            } catch (err) {
                console.error('Error fetching campaigns:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [section]);

    if (loading) return <CEKACardSkeleton className="h-48" />;

    if (campaigns.length === 0) {
        // Hidden if no active campaigns for this section
        return null;
    }

    const campaign = campaigns[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-0 flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-1/3 h-48 relative">
                        {campaign.image_url ? (
                            <img
                                src={campaign.image_url}
                                alt={campaign.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <Megaphone className="h-12 w-12 text-primary/30" />
                            </div>
                        )}
                        <Badge className="absolute top-2 left-2 bg-primary/80 backdrop-blur-sm">
                            Spotlight
                        </Badge>
                    </div>
                    <div className="p-6 flex-1 py-8">
                        <h3 className="text-xl font-bold mb-2">{campaign.title}</h3>
                        <p className="text-muted-foreground mb-4 max-w-2xl">
                            {campaign.description}
                        </p>
                        <Button asChild>
                            <a href={campaign.target_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                Join Initiative
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default CampaignSpotlight;
