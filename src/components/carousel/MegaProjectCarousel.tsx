import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase/client';

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

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

export default function MegaProjectCarousel({ 
  slides: propSlides, 
  className, 
  autoPlayMs = 4500, 
  baseWidth = 300,
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
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;
  
  const carouselItems = loop && slides.length > 0 ? [...slides, slides[0]] : slides;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
    if (slides.length === 0) return;
    
    let timer: NodeJS.Timeout;
    if (autoPlayMs > 0 && !isHovered) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === slides.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoPlayMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoPlayMs, isHovered, loop, slides.length, carouselItems.length]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === slides.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(slides.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

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
      className={cn('relative', className, round && 'rounded-full')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px`, borderRadius: '50%' }),
      }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background via-background/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />

      <motion.div
        className="carousel-track flex"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((slide, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const outputRange = [90, 0, -90];
          const rotateY = useTransform(x, range, outputRange, { clamp: false });
          
          return (
            <motion.div
              key={`${slide.id}-${index}`}
              className={cn(
                'rounded-xl p-6 md:p-8 backdrop-blur-sm border transition-all flex flex-col justify-between cursor-grab',
                colorClassMap[slide.color],
                theme === 'dark' ? 'border-primary/20' : 'border-primary/10',
                'hover:shadow-lg',
                round && 'rounded-full justify-center items-center text-center'
              )}
              style={{
                width: itemWidth,
                height: round ? itemWidth : 'auto',
                rotateY: rotateY,
                ...(round && { borderRadius: '50%' }),
              }}
              transition={effectiveTransition}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => slide.onClick?.()}
            >
              {slide.icon && (
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                  round && "mx-auto"
                )}>
                  {slide.icon}
                </div>
              )}
              
              <div className={cn(round && "flex flex-col items-center")}>
                <div className="text-sm opacity-80">Slide {index + 1}</div>
                <h3 className="text-xl md:text-2xl font-semibold mt-2">{slide.title}</h3>
                {slide.description && (
                  <p className="mt-2 text-sm md:text-base opacity-90">{slide.description}</p>
                )}
              </div>
              
              {slide.ctaText && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-background/60 border self-start">
                  <span className="text-sm">{slide.ctaText}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <div className={cn(
        "mt-3 flex items-center justify-center gap-2",
        round && "absolute bottom-4 left-1/2 transform -translate-x-1/2"
      )}>
        {slides.map((s, i) => (
          <motion.button
            key={s.id}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-all cursor-pointer',
              currentIndex % slides.length === i ? 'w-6' : 'opacity-60',
              i % 4 === 0
                ? 'bg-kenya-green'
                : i % 4 === 1
                ? 'bg-kenya-red'
                : i % 4 === 2
                ? 'bg-black'
                : 'bg-white border'
            )}
            animate={{
              scale: currentIndex % slides.length === i ? 1.2 : 1,
            }}
            onClick={() => setCurrentIndex(i)}
            transition={{ duration: 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
