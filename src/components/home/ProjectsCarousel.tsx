
import React from 'react';
import Carousel from '@/components/ui/Carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProjectsCarousel = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Projects</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore the different civic technology projects we've built to empower Kenyan citizens 
            and improve democratic participation.
          </p>
        </div>

        <div className="flex justify-center">
          <div style={{ height: '400px', position: 'relative' }}>
            <Carousel
              baseWidth={350}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              loop={true}
              round={false}
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Swipe or drag to explore our projects • Click to visit
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProjectsCarousel;
