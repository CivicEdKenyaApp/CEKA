import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import FeaturedLegislation from '@/components/home/FeaturedLegislation';
import ResourceHighlights from '@/components/home/ResourceHighlights';
import CommunitySection from '@/components/home/CommunitySection';
import VolunteerOpportunities from '@/components/home/VolunteerOpportunities';
import MegaProjectCarousel from '@/components/carousel/MegaProjectCarousel';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import CampaignSpotlight from '@/components/campaign/CampaignSpotlight';
import InstagramCarousel from '@/components/carousel/InstagramCarousel';
import { mediaService, type MediaContent } from '@/services/mediaService';
import { Button } from '@/components/ui/button';
import storageService from '@/services/storageService';
import { CEKAFullLoader } from '@/components/ui/ceka-loader';

// Types for our carousel slides
interface CarouselSlide {
  id: string;
  title: string;
  description: string | null;
  cta_text: string | null;
  color: 'kenya-red' | 'kenya-green' | 'kenya-black' | 'kenya-white';
  link_url: string | null;
  image_url: string | null;
  type: 'project' | 'cta';
}

// Sample resource links for educational content
export const sampleResources = {
  constitution: {
    pdf: "https://www.kenya-information-guide.com/support-files/the_constitution_of_kenya.pdf",
    video: "https://www.youtube.com/watch?v=IeUZLZvlDCo"
  },
  lawmaking: {
    infographic: "https://www.lawsociety.org.uk/topics/research/how-laws-are-made",
    video: "https://www.youtube.com/watch?v=OgVKvqTItto"
  },
  rights: {
    infographic: "https://www.ohchr.org/sites/default/files/Documents/Publications/Compilation1.1en.pdf",
    video: "https://www.youtube.com/watch?v=JpY9s1Agbsw"
  }
};

// Custom component for the featured cards that link to different sections
const FeatureCard = ({ title, description, icon, to, color }: any) => {
  return (
    <Link to={to}>
      <motion.div
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-${color}/20 h-full`}
        whileHover={{
          scale: 1.03,
          boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
          borderColor: `var(--${color})`
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className={`w-12 h-12 bg-${color}/10 rounded-full flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
      </motion.div>
    </Link>
  );
};

const Index = () => {
  const { language } = useLanguage();
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredMedia, setFeaturedMedia] = useState<MediaContent | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Carousel Slides
        const { data, error: carouselError } = await (supabase as any)
          .from('carousel_slides')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (carouselError) throw carouselError;

        // HYDRATE carousel images for B2 proxy
        const rawSlides = data || [];
        const hydratedSlides = await Promise.all(rawSlides.map(async (slide: any) => {
          if (slide.image_url) {
            const authorizedUrl = await storageService.getAuthorizedUrl(slide.image_url);
            return { ...slide, image_url: authorizedUrl };
          }
          return slide;
        }));

        setCarouselSlides(hydratedSlides as any);

        // 2. Fetch Featured Instagram-style Carousel for Home
        const featured = await mediaService.getFeaturedMedia();
        if (featured) {
          setFeaturedMedia(featured);
        }
      } catch (err: any) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [language]);

  // Format the slides for the MegaProjectCarousel component
  const formattedSlides = Array.isArray(carouselSlides) ? carouselSlides.map(slide => ({
    id: slide.id,
    title: translate(slide.title, language),
    description: slide.description ? translate(slide.description, language) : undefined,
    ctaText: slide.cta_text ? translate(slide.cta_text, language) : undefined,
    color: slide.color,
    imageUrl: slide.image_url,
    onClick: () => slide.link_url && window.open(slide.link_url, '_blank')
  })) : [];

  if (loading) {
    return (
      <Layout>
        <Hero />
        <CEKAFullLoader />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Hero />
        <div className="container mx-auto py-8 text-center">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="homepage-restored">
        <Hero />

        {/* Campaign Spotlight / Ad Space (Dynamic) */}
        <section className="container mx-auto py-8">
          <CampaignSpotlight section="home_hero" />
        </section>

        <div className="py-8">
          <MegaProjectCarousel
            slides={formattedSlides}
            autoPlayMs={4500}
            className="container mx-auto"
          />
        </div>
        <FeaturedLegislation />

        {/* Featured Instagram-style Carousel Section */}
        {featuredMedia && (
          <section className="bg-background py-16 scroll-mt-20 overflow-hidden">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
                {/* Text Side */}
                <div className="flex-1 space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kenya-red/10 text-kenya-red text-xs font-bold uppercase tracking-widest">
                    <span className="animate-pulse">●</span> Education Series
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-kenya-black dark:text-white uppercase leading-tight">
                    Pieces: <br />
                    <span className="text-kenya-green">Breaking Down Topics</span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                    Simplifying complex civic, social and legal issues through visual education series. Swipe through to learn, download to share and act.
                  </p>
                  <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4">
                    <Link to="/pieces">
                      <Button className="rounded-full bg-kenya-green hover:bg-kenya-green/90 text-white font-bold px-8 h-12 shadow-lg shadow-kenya-green/20">
                        EXPLORE ALL PIECES
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Carousel Side */}
                <div className="flex-1 w-full max-w-lg relative">
                  <InstagramCarousel content={featuredMedia} className="relative z-10" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Secondary Ad Space: Between Legislation and Resources */}
        <section className="container mx-auto py-8">
          <CampaignSpotlight section="home_mid" />
        </section>

        <ResourceHighlights />
        <CommunitySection />
        <VolunteerOpportunities />
      </div>
    </Layout>
  );
};

export default Index;
