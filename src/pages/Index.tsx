
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
    constitution: [
      {
        id: '1',
        title: 'Understanding Kenya\'s Constitution',
        description: 'A comprehensive guide to Kenya\'s Constitution and your rights as a citizen.',
        type: 'guide' as const,
        url: '/resources/constitution-guide',
        featured: true
      }
    ],
    lawmaking: [
      {
        id: '2', 
        title: 'How to Participate in Public Participation',
        description: 'Learn how to effectively participate in county and national public participation forums.',
        type: 'tutorial' as const,
        url: '/resources/public-participation',
        featured: true
      }
    ],
    rights: [
      {
        id: '3',
        title: 'Civic Education Quiz',
        description: 'Test your knowledge of Kenya\'s civic processes and governance.',
        type: 'interactive' as const,
        url: '/resources/civic-quiz',
        featured: true
      }
    ]
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
