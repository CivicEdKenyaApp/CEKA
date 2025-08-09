
import React from 'react';
import { Carousel } from '@/components/ui/Carousel';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

const ProjectsCarousel = () => {
  const { language } = useLanguage();

  const projects = [
    {
      id: '1',
      title: translate('Constitutional Education Initiative', language),
      description: translate('Empowering citizens with knowledge of their constitutional rights and responsibilities through community workshops and digital resources.', language),
      image: '/lovable-uploads/60eebae9-7ca2-4cb0-823d-bcecccb0027f.png',
      link: '/civic-education',
      type: 'project' as const,
      color: 'red' as const
    },
    {
      id: '2',
      title: translate('Legislative Tracking Platform', language),
      description: translate('Real-time monitoring and analysis of parliamentary proceedings, bill progress, and legislative developments affecting Kenyan citizens.', language),
      image: '/lovable-uploads/bea0d682-b245-4391-b21b-80fdf695fdae.png',
      link: '/legislative-tracker',
      type: 'project' as const,
      color: 'green' as const
    },
    {
      id: '3',
      title: translate('Community Engagement Networks', language),
      description: translate('Building grassroots networks that facilitate citizen participation in local governance and community development initiatives.', language),
      image: '/lovable-uploads/60eebae9-7ca2-4cb0-823d-bcecccb0027f.png',
      link: '/join-community',
      type: 'project' as const,
      color: 'black' as const
    },
    {
      id: '4',
      title: translate('Digital Civic Resources Hub', language),
      description: translate('Comprehensive online library providing accessible civic education materials, legal documents, and educational content for all Kenyans.', language),
      image: '/lovable-uploads/bea0d682-b245-4391-b21b-80fdf695fdae.png',
      link: '/resources',
      type: 'project' as const,
      color: 'white' as const
    },
    {
      id: '5',
      title: translate('Support Our Mission', language),
      description: translate('Join us in building a more informed and engaged democratic society. Your support helps us expand our reach and impact across Kenya.', language),
      type: 'cta' as const,
      link: '/join-community'
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {translate('Our Impact Projects', language)}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {translate('Discover how we\'re transforming civic education and democratic participation across Kenya through innovative programs and community-driven initiatives.', language)}
          </p>
        </div>
        
        <Carousel 
          items={projects} 
          autoplay={true} 
          autoplayDelay={4000}
          className="max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
};

export default ProjectsCarousel;
