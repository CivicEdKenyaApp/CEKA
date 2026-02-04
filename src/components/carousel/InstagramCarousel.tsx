import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Maximize2, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { type MediaContent, type MediaItem } from '@/services/mediaService';

interface InstagramCarouselProps {
    content: MediaContent;
    className?: string;
}

const InstagramCarousel: React.FC<InstagramCarouselProps> = ({ content, className }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const items = content.items || [];

    const nextSlide = () => {
        if (currentIndex < items.length - 1) {
            setDirection(1);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleDownloadPDF = () => {
        const pdfUrl = content.metadata?.pdf_url;
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        } else {
            console.warn('No PDF URL found for this content');
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    if (items.length === 0) return null;

    const currentItem = items[currentIndex];

    return (
        <div className={cn("relative group max-w-xl mx-auto bg-black rounded-xl overflow-hidden shadow-2xl", className)}>
            {/* Aspect Ratio Container (Square for IG feel) */}
            <div className="relative aspect-square w-full">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={{
                            enter: (direction: number) => ({
                                x: direction > 0 ? '100%' : '-100%',
                                opacity: 0
                            }),
                            center: {
                                x: 0,
                                opacity: 1
                            },
                            exit: (direction: number) => ({
                                x: direction < 0 ? '100%' : '-100%',
                                opacity: 0
                            })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {currentItem.type === 'image' ? (
                            <img
                                src={currentItem.file_url || ''}
                                alt={`${content.title} - Slide ${currentIndex + 1}`}
                                className="w-full h-full object-cover"
                            />
                        ) : currentItem.type === 'video' ? (
                            <video
                                src={currentItem.file_url || ''}
                                controls
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-white/50">
                                <Maximize2 size={48} className="mb-2" />
                                <span>Unsupported Media Type</span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Overlays / Controls */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Navigation Buttons */}
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentIndex > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={prevSlide}
                                className="rounded-full bg-black/30 hover:bg-black/50 text-white border-none h-8 w-8"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                        )}
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentIndex < items.length - 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={nextSlide}
                                className="rounded-full bg-black/30 hover:bg-black/50 text-white border-none h-8 w-8"
                            >
                                <ChevronRight size={20} />
                            </Button>
                        )}
                    </div>

                    {/* Content Header (Floating) */}
                    <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-start text-white">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wider text-kenya-red">{content.type}</span>
                            <h3 className="text-sm font-bold line-clamp-1">{content.title}</h3>
                        </div>
                        <div className="flex gap-2 pointer-events-auto">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                                <Share2 size={16} />
                            </Button>
                        </div>
                    </div>

                    {/* Indicators (Instagram Style) */}
                    <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
                        {items.length > 1 && items.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                    i === currentIndex ? "bg-white scale-125" : "bg-white/40"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Panel (Download Action) */}
            <div className="bg-background border-t p-4 flex items-center justify-between">
                <div className="flex-1 mr-4">
                    <p className="text-sm text-foreground/80 line-clamp-1 italic">
                        {currentIndex + 1} / {items.length}
                    </p>
                </div>
                {content.metadata?.pdf_url && (
                    <Button
                        onClick={handleDownloadPDF}
                        className="bg-kenya-red hover:bg-kenya-red/90 text-white gap-2 rounded-full h-9 px-4 text-xs font-bold"
                    >
                        <Download size={14} />
                        DOWNLOAD PDF
                    </Button>
                )}
            </div>
        </div>
    );
};

export default InstagramCarousel;
