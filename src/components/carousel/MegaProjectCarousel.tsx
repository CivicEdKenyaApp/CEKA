
import React from 'react';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useTheme } from '@/contexts/ThemeContext';

type Slide = {
  id: string;
  title: string;
  description?: string;
  ctaText?: string;
  onClick?: () => void;
  color: 'kenya-red' | 'kenya-green' | 'kenya-black' | 'kenya-white';
};

interface MegaProjectCarouselProps {
  slides: Slide[];
  className?: string;
  autoPlayMs?: number;
}

const colorClassMap: Record<Slide['color'], string> = {
  'kenya-red': 'bg-kenya-red/20 text-foreground',
  'kenya-green': 'bg-kenya-green/20 text-foreground',
  'kenya-black': 'bg-black/20 text-white',
  'kenya-white': 'bg-white/30 text-foreground',
};

export default function MegaProjectCarousel({ slides, className, autoPlayMs = 4500 }: MegaProjectCarouselProps) {
  const { theme } = useTheme();
  const [api, setApi] = React.useState<any>(null);
  const [current, setCurrent] = React.useState(0);
  const [isHover, setIsHover] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);
  const pointer = React.useRef<{ downAt: number; x: number } | null>(null);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on('select', onSelect);
    setCurrent(api.selectedScrollSnap());
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!isHover) {
      timerRef.current = window.setInterval(() => {
        api.scrollNext();
      }, autoPlayMs);
    }
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [api, isHover, autoPlayMs]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointer.current = { downAt: Date.now(), x: e.clientX };
  };
  const onPointerUp = (slide: Slide) => (e: React.PointerEvent) => {
    const p = pointer.current;
    pointer.current = null;
    if (!p) return;
    const elapsed = Date.now() - p.downAt;
    const moved = Math.abs((e.clientX ?? 0) - p.x);
    if (elapsed < 200 && moved < 12) {
      slide.onClick?.();
    }
  };

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* Gradient edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background via-background/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <Carousel setApi={setApi} className="w-full">
        <CarouselContent className="select-none">
          {slides.map((slide, idx) => (
            <CarouselItem key={slide.id} className="md:basis-1/2 lg:basis-1/3">
              <div
                className={cn(
                  'rounded-xl p-6 md:p-8 backdrop-blur-sm border transition-all',
                  colorClassMap[slide.color],
                  theme === 'dark' ? 'border-primary/20' : 'border-primary/10',
                  'hover:shadow-lg'
                )}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp(slide)}
              >
                <div className="text-sm opacity-80">Slide {idx + 1}</div>
                <h3 className="text-xl md:text-2xl font-semibold mt-2">{slide.title}</h3>
                {slide.description && (
                  <p className="mt-2 text-sm md:text-base opacity-90">{slide.description}</p>
                )}
                {slide.ctaText && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-background/60 border">
                    <span className="text-sm">{slide.ctaText}</span>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Dots */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-all',
              i === current ? 'w-6' : 'opacity-60',
              i % 4 === 0
                ? 'bg-kenya-green'
                : i % 4 === 1
                ? 'bg-kenya-red'
                : i % 4 === 2
                ? 'bg-black'
                : 'bg-white border'
            )}
            onClick={() => api?.scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
