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
        <div className={cn("relative group max-w-xl mx-auto flex flex-col bg-white dark:bg-black rounded-3xl overflow-hidden shadow-2xl border border-kenya-red/5", className)}>
            {/* Top Bar - Header */}
            <div className="px-6 py-4 bg-white/50 dark:bg-black/50 backdrop-blur-md flex justify-between items-center border-b border-kenya-red/10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-kenya-red mb-0.5">{content.type}</span>
                    <h3 className="text-sm font-bold text-kenya-black dark:text-white line-clamp-1">{content.title}</h3>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-kenya-black dark:text-white hover:bg-kenya-red/10 rounded-full transition-colors">
                        <Share2 size={16} />
                    </Button>
                </div>
            </div>

            {/* Media Container (Unobstructed) */}
            <div className="relative bg-black group/media">
                <motion.div
                    className="relative w-full overflow-hidden"
                    animate={{ paddingBottom: getAspectRatioPadding(currentItem.metadata?.aspect_ratio as string) }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute inset-0 flex items-center justify-center placeholder-glow"
                        >
                            {currentItem.type === 'image' ? (
                                <img
                                    src={currentItem.file_url || ''}
                                    alt={`${content.title} - Slide ${currentIndex + 1}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
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

                    {/* Internal Navigation Overlays (Discreet arrows) */}
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        {currentIndex > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={prevSlide}
                                className="pointer-events-auto rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm border-none h-10 w-10 opacity-0 group-hover/media:opacity-100 transition-opacity duration-300"
                            >
                                <ChevronLeft size={24} />
                            </Button>
                        )}
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {currentIndex < items.length - 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={nextSlide}
                                className="pointer-events-auto rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm border-none h-10 w-10 opacity-0 group-hover/media:opacity-100 transition-opacity duration-300"
                            >
                                <ChevronRight size={24} />
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Panel - Controls & Indicators */}
            <div className="bg-white dark:bg-[#111] px-6 py-5 flex flex-col gap-5 border-t border-kenya-red/10">
                {/* Progress Indicators */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {items.length > 1 && items.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1 w-8 rounded-full transition-all duration-500",
                                    i === currentIndex ? "bg-kenya-red" : "bg-kenya-red/20"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest tabular-nums">
                        {currentIndex + 1} / {items.length}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="flex-1 bg-kenya-black hover:bg-kenya-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 text-white gap-2 rounded-2xl h-12 text-xs font-bold shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
                            >
                                <Download size={16} />
                                SAVE IMAGE
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 rounded-2xl bg-white/95 dark:bg-black/95 backdrop-blur-3xl p-2 border-kenya-red/10 shadow-2xl">
                            {['320p', '720p', '1080p', '4k'].map((quality) => (
                                <DropdownMenuItem
                                    key={quality}
                                    onClick={() => handleDownloadImage(quality)}
                                    className="rounded-xl cursor-pointer flex justify-between items-center py-3 px-4 focus:bg-kenya-red/10 focus:text-kenya-red transition-colors"
                                >
                                    <span className="font-bold text-xs">{quality} Resolution</span>
                                    <span className="text-[10px] opacity-60 font-black">{quality === '4k' ? 'ULTRA' : 'HD'}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {content.metadata?.pdf_url && (
                        <Button
                            onClick={handleDownloadPDF}
                            className="bg-kenya-red hover:bg-kenya-red/90 text-white gap-2 rounded-2xl h-12 px-6 text-xs font-bold shadow-xl shadow-kenya-red/20 transition-all active:scale-[0.98]"
                        >
                            <Download size={16} />
                            PDF
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstagramCarousel;
