import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, ExternalLink, ChevronRight } from 'lucide-react';

type Slide = {
  id: string;
  title: string;
  description?: string;
  ctaText?: string;
  onClick?: () => void;
  color: 'kenya-red' | 'kenya-green' | 'kenya-black' | 'kenya-white';
  icon?: React.ReactNode;
  imageUrl?: string;
  badge?: string;
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
  'kenya-red': 'bg-gradient-to-br from-kenya-red/90 to-kenya-red/70 text-white',
  'kenya-green': 'bg-gradient-to-br from-kenya-green/90 to-kenya-green/70 text-white',
  'kenya-black': 'bg-gradient-to-br from-gray-900 to-black text-white',
  'kenya-white': 'bg-gradient-to-br from-white to-gray-100 text-foreground border',
};

const DRAG_BUFFER = 30;
const VELOCITY_THRESHOLD = 500;
const GAP = 20;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30, mass: 0.8 };

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
  const [cycleCount, setCycleCount] = useState(0);
  
  const containerPadding = 16;
  const itemWidth = 280;
  const trackItemOffset = itemWidth + GAP;
  
  const carouselItems = loop && slides.length > 1 ? [...slides, slides[0]] : slides;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const isSpecialTransition = useRef(false);

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
          imageUrl: slide.image_url,
          badge: slide.badge,
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
    
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current);
    }
    
    if (autoPlayMs > 0 && !isHovered && !isDragging) {
      const isLastCard = currentIndex === slides.length - 1;
      const delay = isLastCard ? autoPlayMs + 500 : autoPlayMs;
      
      autoPlayTimer.current = setTimeout(() => {
        setCurrentIndex((prev) => {
          if (prev === slides.length - 1) {
            setCycleCount(c => c + 1);
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    
    return () => {
      if (autoPlayTimer.current) {
        clearTimeout(autoPlayTimer.current);
      }
    };
  }, [autoPlayMs, isHovered, isDragging, loop, slides.length, currentIndex]);

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
      const newIndex = (currentIndex + direction + slides.length) % slides.length;
      if (newIndex === 0 && currentIndex === slides.length - 1) {
        setCycleCount(c => c + 1);
      }
      setCurrentIndex(newIndex);
    } else {
      setCurrentIndex(prev => Math.max(0, Math.min(prev + direction, slides.length - 1)));
    }
  }, [currentIndex, loop, slides.length, trackItemOffset, x]);

  const handleCardClick = useCallback((slide: Slide, index: number, event: React.MouseEvent) => {
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
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-kenya-green border-t-transparent rounded-full animate-spin mb-3"></div>
          <div className="text-lg">Loading projects...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center">
          <div className="text-lg text-red-500 mb-2">Error loading projects</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center">
          <div className="text-lg mb-2">No projects available</div>
          <div className="text-sm text-muted-foreground">Check back later for updates</div>
        </div>
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
        transition={
          isSpecialTransition.current 
            ? { type: "spring", stiffness: 400, damping: 25, mass: 0.8 }
            : SPRING_OPTIONS
        }
      >
        {carouselItems.map((slide, index) => {
          const position = (index - currentIndex + slides.length) % slides.length;
          const isActive = position === 0;
          const isAdjacent = Math.abs(position) === 1 || (loop && position === slides.length - 1);
          
          const isFirstCard = index === 0;
          const shouldSpecialAnimate = isFirstCard && cycleCount > 0 && cycleCount % 2 === 0 && isActive;
          
          return (
            <motion.div
              key={`${slide.id}-${index}`}
              className={cn(
                'rounded-2xl p-6 transition-all flex flex-col justify-between relative overflow-hidden',
                colorClassMap[slide.color],
                theme === 'dark' ? 'shadow-lg' : 'shadow-md',
                'hover:shadow-xl flex-shrink-0 group',
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
              animate={{
                scale: shouldSpecialAnimate ? [1, 1.1, 1] : isActive ? 1 : isAdjacent ? 0.95 : 0.9,
                rotate: shouldSpecialAnimate ? [0, 5, -5, 0] : 0,
              }}
              transition={{
                scale: shouldSpecialAnimate 
                  ? { duration: 0.6, ease: "easeInOut" } 
                  : SPRING_OPTIONS,
                rotate: shouldSpecialAnimate 
                  ? { duration: 0.6, ease: "easeInOut" }
                  : SPRING_OPTIONS,
              }}
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => handleCardClick(slide, index, e)}
            >
              {/* Background pattern overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.3)_1px,_transparent_0)] bg-[length:20px_20px]"></div>
              
              {/* Badge */}
              {slide.badge && (
                <div className="absolute top-4 right-4 bg-background/80 text-xs font-medium px-2 py-1 rounded-full">
                  {slide.badge}
                </div>
              )}
              
              {/* Image if provided */}
              {slide.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden h-32 bg-white/20 flex items-center justify-center">
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              <div className={cn("flex flex-col h-full justify-between", 
                round && "justify-center items-center text-center")}>
                
                <div className="flex-1">
                  {slide.icon && (
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-white/20 p-2",
                      round && "mx-auto"
                    )}>
                      {slide.icon}
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{slide.title}</h3>
                    {slide.description && (
                      <p className="text-sm opacity-90 mb-4 line-clamp-3">{slide.description}</p>
                    )}
                  </div>
                </div>
                
                {slide.ctaText && (
                  <button 
                    className={cn(
                      "mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-all group-hover:bg-white/20",
                      slide.color === 'kenya-white' 
                        ? 'bg-black/10 text-foreground hover:bg-black/20' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      slide.onClick?.();
                    }}
                  >
                    {slide.ctaText}
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {slides.length > 1 && (
        <div className={cn(
          "mt-8 flex items-center justify-center gap-2",
          round && "absolute bottom-4 left-1/2 transform -translate-x-1/2"
        )}>
          {slides.map((s, i) => (
            <motion.button
              key={s.id}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-3 w-3 rounded-full transition-all cursor-pointer',
                currentIndex === i ? 'w-8 bg-kenya-green' : 'opacity-60 bg-gray-400',
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
