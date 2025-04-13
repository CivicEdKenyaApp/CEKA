
import React from 'react';
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
