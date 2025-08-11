
import React from 'react';
import { MegaCarousel } from './MegaCarousel';

const ProjectsCarousel = () => {
  return (
    <MegaCarousel 
      showProjects={true}
      autoplay={true} 
      autoplayDelay={4000}
      className="max-w-4xl mx-auto"
    />
  );
};

export default ProjectsCarousel;
