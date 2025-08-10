
import React from 'react';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import FeaturedLegislation from '@/components/home/FeaturedLegislation';
import ResourceHighlights from '@/components/home/ResourceHighlights';
import CommunitySection from '@/components/home/CommunitySection';
import VolunteerOpportunities from '@/components/home/VolunteerOpportunities';
import ProjectsCarousel from '@/components/home/ProjectsCarousel';

const Index = () => {
  // Define the resources structure expected by ResourceHighlights
  const resources = {
    constitution: {
      pdf: "647caa0e-6ffd-44b1-8962-4bb96ae7dfb3",
      video: "4a8f62d5-5edd-4cfe-8c05-c6cfaba3c9bb"
    },
    lawmaking: {
      infographic: "9e3756a7-9c6d-4352-9539-9a589e2428c9",
      video: "4a8f62d5-5edd-4cfe-8c05-c6cfaba3c9bb"
    },
    rights: {
      infographic: "98f0e638-115c-48a6-ae94-74c8c26e650d",
      video: "4a8f62d5-5edd-4cfe-8c05-c6cfaba3c9bb"
    }
  };

  return (
    <Layout>
      <Hero />
      <ProjectsCarousel />
      <FeaturedLegislation />
      <ResourceHighlights resources={resources} />
      <CommunitySection />
      <VolunteerOpportunities />
    </Layout>
  );
};

export default Index;
