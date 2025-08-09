
import React from 'react';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import FeaturedLegislation from '@/components/home/FeaturedLegislation';
import CommunitySection from '@/components/home/CommunitySection';
import ResourceHighlights from '@/components/home/ResourceHighlights';
import VolunteerOpportunities from '@/components/home/VolunteerOpportunities';
import ProjectsCarousel from '@/components/home/ProjectsCarousel';

const Index = () => {
  // Mock resources data matching the expected ResourcesType structure
  const mockResources = {
    constitution: {
      pdf: "/resources/constitution-guide",
      video: "/resources/constitution-video"
    },
    lawmaking: {
      infographic: "/resources/public-participation",
      video: "/resources/lawmaking-video"
    },
    rights: {
      infographic: "/resources/civic-quiz",
      video: "/resources/rights-video"
    }
  };

  return (
    <Layout>
      <Hero />
      <FeaturedLegislation />
      <ProjectsCarousel />
      <ResourceHighlights resources={mockResources} />
      <CommunitySection />
      <VolunteerOpportunities />
    </Layout>
  );
};

export default Index;
