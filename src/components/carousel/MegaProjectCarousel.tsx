import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

type Slide = {
  id: string;
  title: string;
  description?: string;
  ctaText?: string;
  onClick?: () => void;
  color: 'kenya-red' | 'kenya-green' | 'kenya-black' | 'kenya-white';
  icon?: React.ReactNode;
};

interface MegaProjectCarouselProps {
  slides?: Slide[];
  className?: string;
  autoPlayMs?: number;
  baseWidth?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
  supabaseTable?: string;
}

const colorClassMap: Record<Slide['color'], string> = {
  'kenya-red': 'bg-kenya-red/20 text-foreground',
  'kenya-green': 'bg-kenya-green/20 text-foreground',
  'kenya-black': 'bg-black/20 text-white',
  'kenya-white': 'bg-white/30 text-foreground',
};

const DRAG_BUFFER = 30;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30, mass: 0.8 };

export default function MegaProjectCarousel({ 
  slides: propSlides, 
  className, 
  autoPlayMs = 4500, 
  baseWidth = 280,
  pauseOnHover = true,
  loop = true,
  round = false,
  supabaseTable = 'carousel_slides'
}: MegaProjectCarouselProps) {
  const { theme } = useTheme();
  const [slides, setSlides] = useState<Slide[]>(propSlides || []);
  const [loading, setLoading] = useState(!propSlides);
  const [error, setError] = useState<string | null>(null);
  
  const containerPadding = 16;
  const itemWidth = 250;
  const trackItemOffset = itemWidth + GAP;
  
  const carouselItems = loop && slides.length > 1 ? [...slides, slides[0]] : slides;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  useEffect(() => {
    if (propSlides) return;
    
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from(supabaseTable)
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        
        const formattedSlides = data.map(slide => ({
          id: slide.id,
          title: slide.title,
          description: slide.description,
          ctaText: slide.cta_text,
          color: slide.color,
          onClick: () => slide.link_url && window.open(slide.link_url, '_blank')
        }));
        
        setSlides(formattedSlides);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching carousel slides:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlides();
  }, [propSlides, supabaseTable]);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    let timer: NodeJS.Timeout;
    if (autoPlayMs > 0 && !isHovered && !isDragging) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === slides.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoPlayMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoPlayMs, isHovered, isDragging, loop, slides.length]);

  const handleDragStart = useCallback((event) => {
    setIsDragging(true);
    dragStartX.current = event.clientX;
  }, []);

  const handleDragEnd = useCallback((_, info) => {
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) < DRAG_BUFFER && Math.abs(velocity) < VELOCITY_THRESHOLD) {
      animate(x, -currentIndex * trackItemOffset, SPRING_OPTIONS);
      return;
    }

    const direction = offset > 0 || velocity > 0 ? -1 : 1;

    if (loop) {
      setCurrentIndex(prev => (prev + direction + slides.length) % slides.length);
    } else {
      setCurrentIndex(prev => Math.max(0, Math.min(prev + direction, slides.length - 1)));
    }
  }, [currentIndex, loop, slides.length, trackItemOffset, x]);

  const handleCardClick = useCallback((slide: Slide, index: number, event: React.MouseEvent) => {
    // Only trigger click if it wasn't a drag gesture
    if (Math.abs(event.clientX - dragStartX.current) < 10 && !isDragging) {
      slide.onClick?.();
    }
  }, [isDragging]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-lg">Loading slides...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-lg">No slides available</div>
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden mx-auto', className, round && 'rounded-full')}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px`, borderRadius: '50%' }),
      }}
    >
      <motion.div
        className="flex cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{
          left: -(carouselItems.length - 1) * trackItemOffset,
          right: 0,
        }}
        style={{
          x,
          width: itemWidth,
          gap: `${GAP}px`,
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={{ x: -currentIndex * trackItemOffset }}
        transition={SPRING_OPTIONS}
      >
        {carouselItems.map((slide, index) => {
          const position = (index - currentIndex + slides.length) % slides.length;
          const isActive = position === 0;
          const isAdjacent = Math.abs(position) === 1 || (loop && position === slides.length - 1);
          
          return (
            <motion.div
              key={`${slide.id}-${index}`}
              className={cn(
                'rounded-xl p-6 backdrop-blur-sm border transition-all flex flex-col justify-between',
                colorClassMap[slide.color],
                theme === 'dark' ? 'border-primary/20' : 'border-primary/10',
                'hover:shadow-lg flex-shrink-0',
                round && 'rounded-full justify-center items-center text-center'
              )}
              style={{
                width: itemWidth,
                height: round ? itemWidth : 'auto',
                filter: isActive ? 'blur(0px)' : isAdjacent ? 'blur(2px)' : 'blur(4px)',
                opacity: isActive ? 1 : isAdjacent ? 0.8 : 0.5,
                scale: isActive ? 1 : isAdjacent ? 0.95 : 0.9,
                zIndex: isActive ? 20 : isAdjacent ? 10 : 1,
              }}
              transition={SPRING_OPTIONS}
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => handleCardClick(slide, index, e)}
            >
              <div className={cn("flex flex-col h-full justify-center items-center text-center", 
                round && "justify-center")}>
                {slide.icon && (
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                    round && "mx-auto"
                  )}>
                    {slide.icon}
                  </div>
                )}
                
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-2">{slide.title}</h3>
                  {slide.description && (
                    <p className="text-sm opacity-90 mb-4">{slide.description}</p>
                  )}
                </div>
                
                {slide.ctaText && (
                  <button 
                    className="mt-auto mx-auto px-4 py-2 rounded-lg bg-background/60 border text-sm hover:bg-background/80 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      slide.onClick?.();
                    }}
                  >
                    {slide.ctaText}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {slides.length > 1 && (
        <div className={cn(
          "mt-6 flex items-center justify-center gap-2",
          round && "absolute bottom-4 left-1/2 transform -translate-x-1/2"
        )}>
          {slides.map((s, i) => (
            <motion.button
              key={s.id}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-all cursor-pointer',
                currentIndex === i ? 'w-6' : 'opacity-60',
                i % 4 === 0
                  ? 'bg-kenya-green'
                  : i % 4 === 1
                  ? 'bg-kenya-red'
                  : i % 4 === 2
                  ? 'bg-black'
                  : 'bg-white border'
              )}
              animate={{
                scale: currentIndex === i ? 1.2 : 1,
              }}
              onClick={() => goToSlide(i)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
