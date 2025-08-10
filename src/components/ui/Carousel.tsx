
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  type?: 'project' | 'cta';
  color?: 'red' | 'green' | 'black' | 'white';
}

interface CarouselProps {
  items: CarouselItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({ 
  items, 
  autoplay = true, 
  autoplayDelay = 3000,
  className 
}) => {
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
    
    // If movement is significant within threshold time, it's a drag
    if (deltaX > 12 && deltaTime < 200) {
      e.preventDefault();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaTime = Date.now() - dragStart.time;
    
    setIsDragging(false);
    
    // Determine if this was a click or a drag
    if (Math.abs(deltaX) < 12 && deltaTime < 200) {
      // It's a click
      const item = items[currentSlide];
      if (item.link) {
        window.open(item.link, '_blank', 'noopener,noreferrer');
      }
    } else if (Math.abs(deltaX) > 50) {
      // It's a drag
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
        return 'bg-gradient-to-br from-green-600 to-green-700 text-white';
      case 'black':
        return 'bg-gradient-to-br from-gray-800 to-gray-900 text-white';
      case 'white':
        return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border border-gray-200';
      default:
        return 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground';
    }
  };

  const getCtaGradient = () => {
    return 'bg-gradient-to-br from-red-600/20 via-green-600/20 via-gray-800/20 to-gray-100/20 backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-black/20 text-foreground';
  };

  const getDotColor = (index: number, isActive: boolean) => {
    if (!isActive) return 'bg-muted-foreground/30';
    
    const item = items[index];
    switch (item.color) {
      case 'red':
        return 'bg-red-600';
      case 'green':
        return 'bg-green-600';
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
    <div 
      className={cn('relative overflow-hidden rounded-xl', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ 
          transform: `translateX(-${currentSlide * 100}%)`,
          touchAction: 'pan-y'
        }}
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
            <div className="text-center space-y-4">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-32 h-32 mx-auto rounded-lg object-cover"
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
                      window.open('#', '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Support our work
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 border-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('#', '_blank', 'noopener,noreferrer');
                    }}
                  >
                    More projects
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 z-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 z-10"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {items.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300 ease-in-out',
              index === currentSlide 
                ? cn('scale-125', getDotColor(index, true))
                : getDotColor(index, false)
            )}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
