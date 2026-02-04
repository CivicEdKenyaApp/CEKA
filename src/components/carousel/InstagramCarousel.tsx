import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Maximize2, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { type MediaContent, type MediaItem } from '@/services/mediaService';
import { processingService } from '@/services/processingService';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

    const handleDownloadImage = async (quality: string) => {
        // Use the processing engine to "prepare" the resolution
        try {
            const downloadUrl = await processingService.requestResolution(currentItem.id, quality as any);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.target = '_blank';
            link.download = `${content.slug}-${currentIndex + 1}-${quality}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Failed to process image:', err);
        }
    };

    const getAspectRatioPadding = (ratio?: string) => {
        switch (ratio) {
            case '3:4': return '133.33%';
            case '4:5': return '125%';
            case '16:9': return '56.25%';
            case '9:16': return '177.78%';
            case '1:1':
            default: return '100%';
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
        <div className={cn("relative group max-w-xl mx-auto flex flex-col bg-transparent", className)}>
            {/* Media Container (100% Unobstructed) */}
            <div className="relative overflow-hidden rounded-2xl bg-transparent">
                <motion.div
                    className="relative w-full"
                    animate={{ paddingBottom: getAspectRatioPadding(currentItem.metadata?.aspect_ratio as string) }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
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
                                x: { type: "spring", stiffness: 350, damping: 35 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute inset-0 flex items-center justify-center overflow-hidden"
                        >
                            {currentItem.type === 'image' ? (
                                <img
                                    src={currentItem.file_url || ''}
                                    alt={content.title}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                    loading="lazy"
                                />
                            ) : currentItem.type === 'video' ? (
                                <video
                                    src={currentItem.file_url || ''}
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                                    <Maximize2 size={40} strokeWidth={1.5} className="mb-2" />
                                    <span className="text-xs uppercase tracking-widest font-medium">Unsupported Media</span>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation - Discreet Dots */}
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center">
                        {currentIndex > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={prevSlide}
                                className="h-8 w-8 rounded-full bg-background/20 hover:bg-background/40 text-background backdrop-blur-sm border-none opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronLeft size={18} />
                            </Button>
                        )}
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                        {currentIndex < items.length - 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={nextSlide}
                                className="h-8 w-8 rounded-full bg-background/20 hover:bg-background/40 text-background backdrop-blur-sm border-none opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronRight size={18} />
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Controls - Minimalist */}
            <div className="pt-4 flex flex-col gap-4">
                {/* Indicators & Counter */}
                <div className="flex justify-between items-center px-1">
                    <div className="flex gap-1">
                        {items.length > 1 && items.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-300",
                                    i === currentIndex ? "w-6 bg-kenya-red" : "w-2 bg-muted-foreground/20"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        {currentIndex + 1} / {items.length}
                    </span>
                </div>

                {/* Simplified Actions */}
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex-1 rounded-full border-muted-foreground/20 hover:border-kenya-red/50 hover:bg-kenya-red/5 text-xs font-bold transition-all"
                            >
                                <Download size={14} className="mr-2" />
                                SAVE IMAGE
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 rounded-2xl p-2 shadow-2xl border-muted-foreground/10 bg-background/95 backdrop-blur-xl">
                            {['320p', '720p', '1080p', '4k'].map((quality) => (
                                <DropdownMenuItem
                                    key={quality}
                                    onClick={() => handleDownloadImage(quality)}
                                    className="rounded-lg cursor-pointer py-2 px-3 focus:bg-kenya-red/10 focus:text-kenya-red text-xs font-medium"
                                >
                                    {quality} Resolution
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {content.metadata?.pdf_url && (
                        <Button
                            onClick={handleDownloadPDF}
                            className="bg-kenya-red hover:bg-kenya-red/90 text-white rounded-full px-6 text-xs font-bold"
                        >
                            <Download size={14} className="mr-2" />
                            PDF
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstagramCarousel;
