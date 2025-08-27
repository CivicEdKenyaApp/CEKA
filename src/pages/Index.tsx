
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import FeaturedLegislation from '@/components/home/FeaturedLegislation';
import ResourceHighlights from '@/components/home/ResourceHighlights';
import CommunitySection from '@/components/home/CommunitySection';
import VolunteerOpportunities from '@/components/home/VolunteerOpportunities';
import MegaProjectCarousel from '@/components/carousel/MegaProjectCarousel';

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

// Featured carousel slides with Kenyan flag theming
const featuredSlides = [
  {
    id: '1',
    title: 'Constitutional Education Initiative',
    description: 'Empowering citizens with knowledge of their constitutional rights and responsibilities through community workshops and digital resources.',
    ctaText: 'Learn More',
    color: 'kenya-red' as const,
    onClick: () => window.open('/constitution', '_blank')
  },
  {
    id: '2',
    title: 'Legislative Tracking Platform',
    description: 'Real-time monitoring and analysis of parliamentary proceedings, bill progress, and legislative developments affecting Kenyan citizens.',
    ctaText: 'Track Bills',
    color: 'kenya-green' as const,
    onClick: () => window.open('/legislative-tracker', '_blank')
  },
  {
    id: '3',
    title: 'Community Engagement Networks',
    description: 'Building grassroots networks that facilitate citizen participation in local governance and community development initiatives.',
    ctaText: 'Join Community',
    color: 'kenya-black' as const,
    onClick: () => window.open('/join-community', '_blank')
  },
  {
    id: '4',
    title: 'Digital Civic Resources Hub',
    description: 'Comprehensive online library providing accessible civic education materials, legal documents, and educational content for all Kenyans.',
    ctaText: 'Explore Resources',
    color: 'kenya-white' as const,
    onClick: () => window.open('/resources', '_blank')
  },
  {
    id: '5',
    title: 'Support Our Mission',
    description: 'Join us in building a more informed and engaged democratic society. Your support helps us expand our reach and impact across Kenya.',
    ctaText: 'Support Us',
    color: 'kenya-green' as const,
    onClick: () => window.open('/join-community', '_blank')
  }
];

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
  return (
    <Layout>
      <Hero />
      <MegaProjectCarousel 
        slides={featuredSlides}
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
