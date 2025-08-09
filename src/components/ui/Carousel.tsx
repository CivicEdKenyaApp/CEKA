
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { ExternalLink, Heart, Code, Zap } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "@/contexts/ThemeContext";
import "./Carousel.css";

interface CarouselItem {
  title: string;
  description: string;
  id: number;
  icon: React.ReactNode;
  url?: string;
  isAction?: boolean;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    title: "1TAM",
    description: "One Touch Access to Medicine - Healthcare accessibility platform for Kenya.",
    id: 1,
    icon: <Heart className="carousel-icon" />,
    url: "https://1tam.vercel.app/"
  },
  {
    title: "Recall254",
    description: "Civic engagement platform for accountability and transparency in Kenya.",
    id: 2,
    icon: <Zap className="carousel-icon" />,
    url: "https://recall254.vercel.app/"
  },
  {
    title: "Support Our Work",
    description: "More projects coming soon! Help us build better civic tools for Kenya.",
    id: 3,
    icon: <Code className="carousel-icon" />,
    isAction: true
  },
];

const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring" as const, stiffness: 300, damping: 30 };
const CLICK_THRESHOLD = 10; // pixels
const CLICK_TIME_THRESHOLD = 200; // milliseconds

// Kenyan flag colors
const KENYAN_COLORS = {
  black: '#000000',
  red: '#CE1126', 
  green: '#006600',
  white: '#FFFFFF'
};

interface CarouselProps {
  items?: CarouselItem[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  autoplay = true,
  autoplayDelay = 4000,
  pauseOnHover = true,
  loop = true,
  round = false,
}: CarouselProps) {
  const { theme } = useTheme();
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartTime = useRef(0);

  // Get current item color based on index
  const getCurrentItemColor = (index: number) => {
    const colors = [KENYAN_COLORS.green, KENYAN_COLORS.red, KENYAN_COLORS.black];
    return colors[index % colors.length];
  };

  // Generate gradient for CTA card
  const getCtaGradient = () => {
    return `linear-gradient(135deg, 
      ${KENYAN_COLORS.green}20 0%, 
      ${KENYAN_COLORS.red}20 25%, 
      ${KENYAN_COLORS.black}20 50%, 
      ${KENYAN_COLORS.white}40 75%, 
      ${KENYAN_COLORS.green}20 100%)`;
  };

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered) && !isDragging) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [autoplay, autoplayDelay, isHovered, loop, items.length, carouselItems.length, pauseOnHover, isDragging]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragStart = (event: any, info: any) => {
    setIsDragging(true);
    dragStartPos.current = { x: info.point.x, y: info.point.y };
    dragStartTime.current = Date.now();
  };

  const handleDragEnd = (_: any, info: any) => {
    const dragDistance = Math.abs(info.point.x - dragStartPos.current.x);
    const dragTime = Date.now() - dragStartTime.current;
    
    // If it's a quick tap with minimal movement, don't treat as drag
    if (dragDistance < CLICK_THRESHOLD && dragTime < CLICK_TIME_THRESHOLD) {
      setIsDragging(false);
      return;
    }

    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
    
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleItemClick = (item: CarouselItem) => {
    if (isDragging) return;

    if (window.gtag) {
      window.gtag('event', 'project_carousel_click', {
        project_url: item.url || item.title
      });
    }

    if (item.url && !item.isAction) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

  return (
    <div
      ref={containerRef}
      className={`carousel-container ${round ? "round" : ""} ${theme === 'dark' ? 'dark' : ''}`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px`, borderRadius: "50%" }),
        borderColor: theme === 'dark' ? '#374151' : '#d1d5db'
      }}
    >
      <motion.div
        className="carousel-track"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const outputRange = [90, 0, -90];
          const rotateY = useTransform(x, range, outputRange, { clamp: false });
          
          const isCtaCard = item.isAction;
          const itemColor = getCurrentItemColor(item.id - 1);
          
          return (
            <motion.div
              key={index}
              className={`carousel-item ${round ? "round" : ""}`}
              style={{
                width: itemWidth,
                height: round ? itemWidth : "100%",
                rotateY: rotateY,
                ...(round && { borderRadius: "50%" }),
                backgroundColor: theme === 'dark' ? '#1f2937' : '#0D0716',
                borderColor: itemColor,
                ...(isCtaCard && {
                  background: getCtaGradient(),
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${itemColor}40`
                })
              }}
              transition={effectiveTransition}
              onClick={() => handleItemClick(item)}
            >
              <div className={`carousel-item-header ${round ? "round" : ""}`}>
                <span 
                  className="carousel-icon-container"
                  style={{ backgroundColor: isCtaCard ? 'rgba(255,255,255,0.9)' : '#fff' }}
                >
                  {item.icon}
                </span>
              </div>
              <div className="carousel-item-content">
                <div className="carousel-item-title" style={{ color: isCtaCard ? '#fff' : '#fff' }}>
                  {item.title}
                </div>
                <p className="carousel-item-description" style={{ color: isCtaCard ? '#f3f4f6' : '#fff' }}>
                  {item.description}
                </p>
                {item.isAction && (
                  <div className="mt-4 space-y-2">
                    <Button size="sm" variant="outline" className="w-full text-xs bg-white/90 text-gray-800 border-white/50 hover:bg-white">
                      Support Our Work
                    </Button>
                    <Button size="sm" variant="ghost" className="w-full text-xs text-white/90 hover:bg-white/10">
                      More Projects
                    </Button>
                  </div>
                )}
                {item.url && !item.isAction && (
                  <div className="mt-4">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <div className={`carousel-indicators-container ${round ? "round" : ""}`}>
        <div className="carousel-indicators">
          {items.map((_, index) => {
            const isActive = currentIndex % items.length === index;
            const itemColor = getCurrentItemColor(index);
            
            return (
              <motion.div
                key={index}
                className={`carousel-indicator ${isActive ? "active" : "inactive"}`}
                style={{
                  backgroundColor: isActive ? itemColor : (theme === 'dark' ? '#4b5563' : '#6b7280'),
                  cursor: 'pointer'
                }}
                animate={{
                  scale: isActive ? 1.4 : 1,
                  opacity: isActive ? 1 : 0.6
                }}
                onClick={() => handleIndicatorClick(index)}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
                whileHover={{ scale: isActive ? 1.5 : 1.2 }}
                whileTap={{ scale: isActive ? 1.3 : 1.1 }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
