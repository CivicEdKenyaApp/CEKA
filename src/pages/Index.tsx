
import React from 'react';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import FeaturedLegislation from '@/components/home/FeaturedLegislation';
import CommunitySection from '@/components/home/CommunitySection';
import ResourceHighlights from '@/components/home/ResourceHighlights';
import VolunteerOpportunities from '@/components/home/VolunteerOpportunities';
import ProjectsCarousel from '@/components/home/ProjectsCarousel';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedLegislation />
      <ProjectsCarousel />
      <ResourceHighlights />
      <CommunitySection />
      <VolunteerOpportunities />
    </Layout>
  );
};

export default Index;
