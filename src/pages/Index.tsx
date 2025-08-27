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
import { supabase } from './supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

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
const FeatureCard = ({ title, description, icon, to, color }) => {
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

  useEffect(() => {
    const fetchCarouselSlides = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('carousel_slides')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;
        setCarouselSlides(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching carousel slides:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselSlides();
  }, []);

  // Format the slides for the MegaProjectCarousel component
  const formattedSlides = carouselSlides.map(slide => ({
    id: slide.id,
    title: translate(slide.title, language),
    description: slide.description ? translate(slide.description, language) : undefined,
    ctaText: slide.cta_text ? translate(slide.cta_text, language) : undefined,
    color: slide.color,
    onClick: () => slide.link_url && window.open(slide.link_url, '_blank')
  }));

  if (loading) {
    return (
      <Layout>
        <Hero />
        <div className="container mx-auto py-8 text-center">
          <div className="text-lg">Loading...</div>
        </div>
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
      <Hero />
      <MegaProjectCarousel 
        slides={formattedSlides}
        autoPlayMs={4500}
        className="my-8"
      />
      <FeaturedLegislation />
      <ResourceHighlights resources={sampleResources} />
      <CommunitySection />
      <VolunteerOpportunities />
    </Layout>
  );
};

export default Index;
