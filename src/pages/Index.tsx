
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import FeaturedLegislation from '@/components/home/FeaturedLegislation';
import ResourceHighlights from '@/components/home/ResourceHighlights';
import CommunitySection from '@/components/home/CommunitySection';
import VolunteerOpportunities from '@/components/home/VolunteerOpportunities';

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

// Add this component to the Hero component or modify Hero component directly
// to use these feature cards

const Index = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedLegislation />
      <ResourceHighlights resources={sampleResources} />
      <CommunitySection />
      <VolunteerOpportunities />
    </Layout>
  );
};

export default Index;
