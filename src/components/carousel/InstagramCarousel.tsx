
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';
import { CEKALoader } from '@/components/ui/ceka-loader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { mediaService, type MediaContent, type MediaItem } from '@/services/mediaService';
import { processingService, type ResolutionQuality } from '@/services/processingService';
import storageService from '@/services/storageService';
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

// Swipe threshold for triggering slide change
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

const InstagramCarousel: React.FC<InstagramCarouselProps> = ({ content, className }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [isCheckingPdf, setIsCheckingPdf] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [availableQualities, setAvailableQualities] = useState<ResolutionQuality[]>(['320p', '720p', '1080p', '4k']);
    const [masterRatio, setMasterRatio] = useState<string | null>(null);
    const [hydratedItems, setHydratedItems] = useState<MediaItem[]>([]);
    const [isHydrating, setIsHydrating] = useState(true);

    const items = hydratedItems;

    // Hydrate media URLs for B2 proxy
    useEffect(() => {
        const hydrateMedia = async () => {
            setIsHydrating(true);
            const rawItems = content.items || [];
            try {
                const hydrated = await Promise.all(rawItems.map(async (item) => {
                    if (item.file_url) {
                        const authorizedUrl = await storageService.getAuthorizedUrl(item.file_url);
                        return { ...item, file_url: authorizedUrl || item.file_url };
                    }
                    return item;
                }));
                setHydratedItems(hydrated);
            } catch (err) {
                console.error('[Carousel] Hydration failed:', err);
                setHydratedItems(rawItems);
            } finally {
                setIsHydrating(false);
                setImageLoading(true);
                setCurrentIndex(0);
                setDirection(0);
                setMasterRatio(null);
            }
        };

        hydrateMedia();
    }, [content.id, content.slug]);

    // Motion values for swipe feedback (drag offset)
    const dragX = useMotionValue(0);
    const dragOpacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);

    // Aspect ratio padding calculator - Convert string ratio (e.g., "4:5") to percentage
    const getAspectRatioPadding = (ratio?: string | null): string => {
        if (!ratio || ratio.includes('Square')) return '100%';

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
            '1:1': '100%',
            'square': '100%',
            'portrait': '125%',
            'landscape': '56.25%'
        };

        if (ratioMap[ratio]) return ratioMap[ratio];

        if (!ratio.includes(':')) {
            const num = parseFloat(ratio);
            if (!isNaN(num) && num > 0) return `${num * 100}%`;
        }

        const parts = ratio.split(':');
        if (parts.length === 2) {
            const [w, h] = parts.map(Number);
            if (w && h) return `${(h / w) * 100}%`;
        }

        return '100%';
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setImageLoading(false);
        if (!masterRatio && currentIndex === 0) {
            const img = e.currentTarget;
            if (img.naturalWidth > 0) {
                const ratio = img.naturalHeight / img.naturalWidth;
                setMasterRatio(ratio.toString());
            }
        }
    };

    const handleImageError = () => {
        setImageLoading(false);
        console.error(`[Carousel] Failed to load image: ${items[currentIndex]?.file_url}`);
    };

    const nextSlide = () => {
        if (currentIndex < items.length - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
            setImageLoading(true);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
            setImageLoading(true);
        }
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { offset, velocity } = info;
        if (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
            nextSlide();
        } else if (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
            prevSlide();
        }
    };

    const handleDownloadPDF = async () => {
        const rawPdfUrl = content.metadata?.pdf_url;
        if (!rawPdfUrl) return;

        const pdfUrl = rawPdfUrl.startsWith('http') ? rawPdfUrl : encodeURI(rawPdfUrl);
        setIsCheckingPdf(true);
        try {
            const response = await fetch(pdfUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${content.slug || 'document'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } catch (err) {
            console.error('PDF download failed:', err);
            window.open(pdfUrl, '_blank');
        } finally {
            setIsCheckingPdf(false);
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
            console.error('Image download failed:', err);
            const url = currentItem.file_url;
            if (url) {
                const link = document.createElement('a');
                link.href = url;
                link.download = `${content.slug}-${currentIndex + 1}.jpg`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } finally {
            setDownloading(null);
        }
    };

    useEffect(() => {
        const currentItem = items[currentIndex];
        if (currentItem?.metadata?.max_resolution) {
            const maxRes = currentItem.metadata.max_resolution as string;
            const resOrder: ResolutionQuality[] = ['320p', '720p', '1080p', '4k'];
            const maxIndex = resOrder.indexOf(maxRes as ResolutionQuality);
            if (maxIndex !== -1) {
                setAvailableQualities(resOrder.slice(0, maxIndex + 1));
            }
        } else {
            setAvailableQualities(['320p', '720p', '1080p', '4k']);
        }
    }, [currentIndex, items]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, items]);

    if (isHydrating) {
        return (
            <div className={cn("flex flex-col items-center justify-center p-12 bg-muted/5 rounded-2xl min-h-[400px]", className)}>
                <CEKALoader variant="ios" size="md" />
                <p className="mt-4 text-xs font-bold text-muted-foreground uppercase animate-pulse">Hydrating Media...</p>
            </div>
        );
    }

    if (items.length === 0) return null;

    const currentItem = items[currentIndex];
    const activeRatio = masterRatio || (currentItem.metadata?.aspect_ratio as string);

    return (
        <div className={cn("relative group max-w-xl mx-auto flex flex-col bg-transparent", className)}>
            <div className="relative overflow-hidden rounded-2xl bg-muted/5">
                <motion.div
                    className="relative w-full touch-pan-y"
                    animate={{ paddingBottom: getAspectRatioPadding(activeRatio) }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={`${content.id}-${currentIndex}`}
                            custom={direction}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.1}
                            onDragEnd={handleDragEnd}
                            variants={{
                                enter: (direction: number) => ({
                                    x: direction > 0 ? '100.5%' : '-100.5%',
                                    opacity: 0,
                                    scale: 0.95
                                }),
                                center: {
                                    x: 0,
                                    opacity: 1,
                                    scale: 1,
                                    zIndex: 1
                                },
                                exit: (direction: number) => ({
                                    x: direction < 0 ? '100.5%' : '-100.5%',
                                    opacity: 0,
                                    scale: 0.95,
                                    zIndex: 0
                                })
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.25 },
                                scale: { type: "spring", stiffness: 350, damping: 35 }
                            }}
                            className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing bg-black/5"
                        >
                            {currentItem.type === 'image' ? (
                                <>
                                    {imageLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 blur-xl">
                                            <CEKALoader variant="pulse" size="md" />
                                        </div>
                                    )}
                                    <img
                                        src={currentItem.file_url || ''}
                                        alt={content.title}
                                        className={cn(
                                            "w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300",
                                            imageLoading ? "opacity-0" : "opacity-100"
                                        )}
                                        loading="lazy"
                                        draggable={false}
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                    />
                                </>
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

                    {currentIndex > 0 && (
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center z-20">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={prevSlide}
                                className="h-10 w-10 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-xl hover:bg-white/50 dark:hover:bg-black/50 text-foreground shadow-lg border border-white/20 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                                <ChevronLeft size={22} />
                            </Button>
                        </div>
                    )}
                    {currentIndex < items.length - 1 && (
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center z-20">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={nextSlide}
                                className="h-10 w-10 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-xl hover:bg-white/50 dark:hover:bg-black/50 text-foreground shadow-lg border border-white/20 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                                <ChevronRight size={22} />
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>

            <div className="pt-4 flex flex-col gap-4">
                <div className="flex justify-between items-center px-1">
                    <div className="flex gap-1.5 flex-wrap max-w-[70%]">
                        {Array.from({ length: items.length }).map((_, i) => (
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
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest tabular-nums shrink-0">
                        {currentIndex + 1} / {items.length}
                    </span>
                </div>

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
                                        <CEKALoader variant="ios" size="xs" />
                                        {" "} Downloading {downloading}...
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
                            {availableQualities.map((quality) => (
                                <DropdownMenuItem
                                    key={quality}
                                    onClick={() => handleDownloadImage(quality)}
                                    disabled={!!downloading}
                                    className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-kenya-red/10 focus:text-kenya-red text-sm"
                                >
                                    <span className="font-medium">{quality}</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {quality === '4k' ? 'Ultra HD' : quality === '1080p' ? 'Full HD' : quality === '720p' ? 'HD' : 'SD'}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {content.metadata?.pdf_url && (
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={isCheckingPdf}
                            className="bg-kenya-red hover:bg-kenya-red/90 text-white rounded-full px-5 text-xs font-medium"
                        >
                            {isCheckingPdf ? (
                                <CEKALoader variant="ios" size="xs" />
                            ) : (
                                <Download size={14} className="mr-2" />
                            )}
                            {" "} {isCheckingPdf ? "Checking..." : "PDF"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstagramCarousel;
