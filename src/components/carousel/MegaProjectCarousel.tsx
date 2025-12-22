import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Image as ImageIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

type Slide = {
  id: string;
  title: string;
  description?: string;
  ctaText?: string;
  onClick?: () => void;
  color: 'kenya-red' | 'kenya-green' | 'kenya-black' | 'kenya-white';
  iconName?: string;
  imageUrl?: string;
  badge?: string;
  badgeColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  textColorLight?: string;
  textColorDark?: string;
  buttonColorLight?: string;
  buttonColorDark?: string;
  animationType?: string;
  priority?: number;
};

interface MegaProjectCarouselProps {
  slides?: Slide[];
  className?: string;
  autoPlayMs?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
  supabaseTable?: string;
  imageBucket?: string;
}

const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return null;
  const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
  return IconComponent ? <IconComponent className="w-8 h-8 md:w-10 md:h-10" /> : null;
};

const getColorClasses = (slide: Slide, theme: string) => {
  if (slide.color === 'kenya-white') {
    return theme === 'dark' 
      ? 'bg-gray-800'
      : 'bg-gradient-to-br from-white to-gray-100 border';
  }
  
  return {
    'kenya-red': 'bg-gradient-to-br from-kenya-red/90 to-kenya-red/70',
    'kenya-green': 'bg-gradient-to-br from-kenya-green/90 to-kenya-green/70',
    'kenya-black': 'bg-gradient-to-br from-gray-900 to-black',
  }[slide.color];
};

const getTextColor = (slide: Slide, theme: string) => {
  if (slide.color === 'kenya-white') {
    return theme === 'dark' ? 'text-white' : 'text-foreground';
  }
  
  return 'text-white';
};

const getCtaClasses = (slide: Slide, theme: string) => {
  if (slide.color === 'kenya-white') {
    return theme === 'dark' 
      ? 'bg-gray-700 text-white hover:bg-gray-600' 
      : 'bg-black/20 text-foreground hover:bg-black/30';
  }
  
  return 'bg-white/20 text-white hover:bg-white/30';
};

const getBadgeColor = (slide: Slide, theme: string) => {
  if (slide.color === 'kenya-white') {
    return theme === 'dark' ? 'bg-gray-700' : 'bg-black/20';
  }
  
  return 'bg-background/90';
};

const DRAG_BUFFER = 30;
const VELOCITY_THRESHOLD = 500;
const SPRING_OPTIONS = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 };

export default function MegaProjectCarousel({ 
  slides: propSlides, 
  className, 
  autoPlayMs = 4500, 
  pauseOnHover = true,
  loop = true,
  round = false,
  supabaseTable = 'carousel_slides',
  imageBucket = 'carousel-thumbnails'
}: MegaProjectCarouselProps) {
  const { theme } = useTheme();
  const [slides, setSlides] = useState<Slide[]>(propSlides || []);
  const [loading, setLoading] = useState(!propSlides);
  const [error, setError] = useState<string | null>(null);
  const [cycleCount, setCycleCount] = useState(0);
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  
  const getItemWidth = () => {
    if (dimensions.width < 640) {
      return dimensions.width * 0.82;
    } else if (dimensions.width < 768) {
      return dimensions.width * 0.65;
    } else if (dimensions.width < 1024) {
      return 380;
    } else {
      return 420;
    }
  };
  
  const itemWidth = getItemWidth();
  const gap = Math.max(18, itemWidth * 0.045);
  const trackItemOffset = itemWidth + gap;
  
  const carouselItems = loop && slides.length > 1 ? [...slides, slides[0]] : slides;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to get proper image URL from Supabase storage
  const getImageUrl = (imageUrl: string | undefined | null) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, return it
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a Supabase storage path, construct the URL
    try {
      const { data } = supabase.storage
        .from(imageBucket)
        .getPublicUrl(imageUrl);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (propSlides) return;
    
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('carousel_slides')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false, nullsFirst: false })
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        
        const formattedSlides = (data || []).map((slide: any) => ({
          id: slide.id,
          title: slide.title,
          description: slide.description,
          ctaText: slide.cta_text,
          color: slide.color,
          imageUrl: getImageUrl(slide.image_url),
          badge: slide.badge,
          badgeColor: slide.badge_color,
          iconName: slide.icon_name,
          gradientFrom: slide.gradient_from,
          gradientTo: slide.gradient_to,
          textColorLight: slide.text_color_light,
          textColorDark: slide.text_color_dark,
          buttonColorLight: slide.button_color_light,
          buttonColorDark: slide.button_color_dark,
          animationType: slide.animation_type,
          priority: slide.priority,
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

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((_, info: any) => {
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) < DRAG_BUFFER && Math.abs(velocity) < VELOCITY_THRESHOLD) {
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
    const target = event.target as HTMLElement;
    
    if (target.closest("button, a")) {
      return;
    }
    
    if (!isDragging) {
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
      ref={containerRef}
      className={cn(
        'relative overflow-hidden mx-auto w-full max-w-6xl px-4', 
        className, 
        round && 'rounded-full'
      )}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      style={{
        ...(round && { height: `${itemWidth}px`, borderRadius: '50%' }),
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
          gap: `${gap}px`,
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
          
          const isFirstCard = index === 0;
          const shouldSpecialAnimate = isFirstCard && cycleCount > 0 && cycleCount % 2 === 0 && isActive;
          
          return (
            <motion.div
              key={`${slide.id}-${index}`}
              className={cn(
                'rounded-2xl p-5 md:p-6 transition-all flex flex-col justify-between relative overflow-hidden',
                getColorClasses(slide, theme),
                theme === 'dark' ? 'shadow-lg' : 'shadow-md',
                'hover:shadow-xl flex-shrink-0 group',
                round && 'rounded-full justify-center items-center text-center'
              )}
              style={{
                width: itemWidth,
                height: round ? itemWidth : 'auto',
                minHeight: round ? itemWidth : '340px',
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
                  : { type: "spring" as const, stiffness: 300, damping: 30 },
                rotate: shouldSpecialAnimate 
                  ? { duration: 0.6, ease: "easeInOut" }
                  : { type: "spring" as const, stiffness: 300, damping: 30 },
              }}
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => handleCardClick(slide, index, e)}
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.3)_1px,_transparent_0)] bg-[length:20px_20px]"></div>
              
              {slide.badge && (
                <div className={cn(
                  "absolute top-4 right-4 text-sm font-semibold px-3 py-1.5 rounded-full",
                  getBadgeColor(slide, theme)
                )}>
                  {slide.badge}
                </div>
              )}
              
              {slide.imageUrl ? (
                <div className="mb-4 md:mb-5 rounded-xl overflow-hidden h-36 md:h-40 bg-white/20 flex items-center justify-center">
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      // If image fails to load, show a placeholder
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-200/30">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
              ) : (
                <div className="mb-4 md:mb-5 rounded-xl h-36 md:h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <div className={cn("flex flex-col h-full justify-between", 
                round && "justify-center items-center text-center")}>
                
                <div className="flex-1">
                  {slide.iconName && (
                    <div className={cn(
                      "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4 md:mb-5 bg-white/20 p-2",
                      round && "mx-auto"
                    )}>
                      {getIconComponent(slide.iconName)}
                    </div>
                  )}
                  
                  <div className={cn("flex flex-col", getTextColor(slide, theme))}>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 leading-tight group-hover:text-white transition-colors">{slide.title}</h3>
                    {slide.description && (
                      <p className="text-base md:text-lg opacity-90 mb-4 md:mb-5 line-clamp-3 leading-relaxed">{slide.description}</p>
                    )}
                  </div>
                </div>
                
                {slide.ctaText && (
                  <div 
                    className={cn(
                      "mt-4 md:mt-5 w-full rounded-xl overflow-hidden",
                      getCtaClasses(slide, theme)
                    )}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <button 
                      className="w-full flex items-center justify-center gap-2 py-3 md:py-4 font-medium transition-all text-base md:text-lg bg-transparent rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        slide.onClick?.();
                      }}
                    >
                      {slide.ctaText}
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {slides.length > 1 && (
        <div className={cn(
          "mt-6 md:mt-8 flex items-center justify-center gap-3",
          round && "absolute bottom-4 left-1/2 transform -translate-x-1/2"
        )}>
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-3 w-3 md:h-4 md:w-4 rounded-full transition-all cursor-pointer border-2',
                currentIndex === i 
                  ? 'bg-kenya-green border-kenya-green scale-110' 
                  : 'bg-gray-300 border-gray-400 opacity-70 hover:opacity-100'
              )}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
