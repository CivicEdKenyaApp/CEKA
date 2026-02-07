import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Maximize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { type MediaContent, type MediaItem } from '@/services/mediaService';
import { processingService, type ResolutionQuality } from '@/services/processingService';
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
    const [downloading, setDownloading] = useState<string | null>(null);
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

    const handleDownloadImage = async (quality: ResolutionQuality) => {
        const currentItem = items[currentIndex];
        if (!currentItem) return;

        setDownloading(quality);
        try {
            const filename = `${content.slug}-${currentIndex + 1}-${quality}.jpg`;
            await processingService.downloadImage(currentItem.id, quality, filename);
        } catch (err) {
            console.error('Failed to download image:', err);
            // Fallback: open in new tab
            const url = currentItem.file_url;
            if (url) window.open(url, '_blank');
        } finally {
            setDownloading(null);
        }
    };

    // Aspect ratio padding calculator - supports all common ratios
    const getAspectRatioPadding = (ratio?: string): string => {
        const ratioMap: Record<string, string> = {
            '4:3': '75%',
            '3:4': '133.33%',
            '4:5': '125%',
            '5:4': '80%',
            '16:9': '56.25%',
            '9:16': '177.78%',
            '21:9': '42.86%',
            '2:3': '150%',
            '3:2': '66.67%',
            '1:1': '100%'
        };
        return ratioMap[ratio || '1:1'] || '100%';
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
    const aspectRatio = currentItem.metadata?.aspect_ratio as string;

    return (
        <div className={cn("relative group max-w-xl mx-auto flex flex-col bg-transparent", className)}>
            {/* Media Container - 100% Unobstructed with Dynamic Aspect Ratio */}
            <div className="relative overflow-hidden rounded-2xl bg-muted/5">
                <motion.div
                    className="relative w-full"
                    animate={{ paddingBottom: getAspectRatioPadding(aspectRatio) }}
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
                                <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                                    <Maximize2 size={40} strokeWidth={1.5} className="mb-2" />
                                    <span className="text-xs uppercase tracking-widest font-medium">Unsupported Media</span>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows - Appear on hover */}
                    {currentIndex > 0 && (
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={prevSlide}
                                className="h-9 w-9 rounded-full bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-foreground backdrop-blur-sm shadow-lg border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                        </div>
                    )}
                    {currentIndex < items.length - 1 && (
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={nextSlide}
                                className="h-9 w-9 rounded-full bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-foreground backdrop-blur-sm shadow-lg border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Bottom Controls - Below the image, not on top */}
            <div className="pt-4 flex flex-col gap-4">
                {/* Indicators & Counter */}
                <div className="flex justify-between items-center px-1">
                    <div className="flex gap-1">
                        {items.length > 1 && items.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setDirection(i > currentIndex ? 1 : -1);
                                    setCurrentIndex(i);
                                }}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer hover:opacity-80",
                                    i === currentIndex
                                        ? "w-6 bg-kenya-red"
                                        : "w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                                )}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest tabular-nums">
                        {currentIndex + 1} / {items.length}
                    </span>
                </div>

                {/* Download Actions */}
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={!!downloading}
                                className="flex-1 rounded-full border-muted-foreground/20 hover:border-kenya-red/50 hover:bg-kenya-red/5 text-xs font-medium transition-all"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 size={14} className="mr-2 animate-spin" />
                                        Downloading {downloading}...
                                    </>
                                ) : (
                                    <>
                                        <Download size={14} className="mr-2" />
                                        Save Image
                                    </>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="w-48 rounded-xl p-1.5 shadow-xl border-muted-foreground/10 bg-background/98 backdrop-blur-xl"
                        >
                            {(['320p', '720p', '1080p', '4k'] as ResolutionQuality[]).map((quality) => (
                                <DropdownMenuItem
                                    key={quality}
                                    onClick={() => handleDownloadImage(quality)}
                                    disabled={!!downloading}
                                    className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-kenya-red/10 focus:text-kenya-red text-sm"
                                >
                                    <span className="font-medium">{quality}</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {quality === '4k' ? 'Ultra HD' : quality === '1080p' ? 'Full HD' : 'HD'}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {content.metadata?.pdf_url && (
                        <Button
                            onClick={handleDownloadPDF}
                            className="bg-kenya-red hover:bg-kenya-red/90 text-white rounded-full px-5 text-xs font-medium"
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
