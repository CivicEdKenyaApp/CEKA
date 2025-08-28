
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  type?: 'project' | 'cta';
  color?: 'red' | 'green' | 'black' | 'white';
}

interface MegaCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: CarouselItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  showProjects?: boolean;
}

export const MegaProjectCarousel: React.FC<MegaCarouselProps> = ({
  items: externalItems,
  autoplay = true,
  autoplayDelay = 4000,
  showProjects = true,
  className,
  ...props
}) => {
  const { language } = useLanguage();
  
  // Default projects data
  const defaultProjects = [
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

  const items = externalItems || (showProjects ? defaultProjects : []);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, time: 0 });
  const intervalRef = useRef<NodeJS.Timeout>();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (autoplay && !isHovered && !isDragging) {
      intervalRef.current = setInterval(nextSlide, autoplayDelay);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoplay, autoplayDelay, isHovered, isDragging, nextSlide]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, time: Date.now() });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = Math.abs(e.clientX - dragStart.x);
    const deltaTime = Date.now() - dragStart.time;
    
    if (deltaX > 12 && deltaTime < 200) {
      e.preventDefault();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaTime = Date.now() - dragStart.time;
    
    setIsDragging(false);
    
    if (Math.abs(deltaX) < 12 && deltaTime < 200) {
      const item = items[currentSlide];
      if (item.link) {
        window.open(item.link, '_blank', 'noopener,noreferrer');
      }
    } else if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
  };

  const getSlideColorClass = (color?: string) => {
    switch (color) {
      case 'red':
        return 'bg-gradient-to-br from-red-600 to-red-700 text-white';
      case 'green':
        return 'bg-gradient-to-br from-kenya-green to-green-700 text-white';
      case 'black':
        return 'bg-gradient-to-br from-gray-800 to-gray-900 text-white';
      case 'white':
        return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border border-gray-200';
      default:
        return 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground';
    }
  };

  const getCtaGradient = () => {
    return `bg-gradient-to-br from-red-600/20 via-kenya-green/20 via-gray-800/20 to-gray-100/20 backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-black/20 text-foreground`;
  };

  const getDotColor = (index: number, isActive: boolean) => {
    if (!isActive) return 'bg-muted-foreground/30';
    
    const item = items[index];
    switch (item.color) {
      case 'red':
        return 'bg-red-600';
      case 'green':
        return 'bg-kenya-green';
      case 'black':
        return 'bg-gray-800 dark:bg-gray-600';
      case 'white':
        return 'bg-gray-300 dark:bg-gray-400';
      default:
        return 'bg-primary';
    }
  };

  if (!items.length) return null;

  return (
    <div className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container">
        {showProjects && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {translate('Our Impact Projects', language)}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {translate('Discover how we\'re transforming civic education and democratic participation across Kenya through innovative programs and community-driven initiatives.', language)}
            </p>
          </div>
        )}
        
        <div 
          className={cn(
            'relative overflow-hidden rounded-xl max-w-4xl mx-auto',
            'before:absolute before:top-0 before:left-0 before:w-32 before:h-full before:bg-gradient-to-r before:from-background before:to-transparent before:z-10 before:pointer-events-none',
            'after:absolute after:top-0 after:right-0 after:w-32 after:h-full after:bg-gradient-to-l after:from-background after:to-transparent after:z-10 after:pointer-events-none',
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background/20 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/20 to-transparent z-10 pointer-events-none" />
          
          <motion.div 
            className="flex transition-transform duration-500 ease-in-out"
            animate={{ x: `-${currentSlide * 100}%` }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
            style={{ touchAction: 'pan-y' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'w-full flex-shrink-0 p-8 cursor-pointer select-none relative min-h-[300px] flex items-center justify-center',
                  item.type === 'cta' 
                    ? getCtaGradient()
                    : getSlideColorClass(item.color)
                )}
              >
                <div className="text-center space-y-4 z-20">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-32 h-32 mx-auto rounded-lg object-cover shadow-lg"
                    />
                  )}
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <p className="text-lg opacity-90">{item.description}</p>
                  {item.type === 'cta' && (
                    <div className="flex gap-4 justify-center mt-6">
                      <Button 
                        variant="outline" 
                        className="bg-white/20 hover:bg-white/30 border-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open('/join-community', '_blank', 'noopener,noreferrer');
                        }}
                      >
                        Support our work
                      </Button>
                      <Button 
                        variant="outline"
                        className="bg-white/20 hover:bg-white/30 border-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open('/resources', '_blank', 'noopener,noreferrer');
                        }}
                      >
                        More projects
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 z-30"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 z-30"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
            {items.map((_, index) => (
              <motion.button
                key={index}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300 ease-in-out',
                  index === currentSlide 
                    ? cn('scale-125', getDotColor(index, true))
                    : getDotColor(index, false)
                )}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaProjectCarousel;
