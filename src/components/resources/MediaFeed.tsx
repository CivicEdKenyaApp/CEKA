import React, { useEffect, useState, useCallback, useRef } from 'react';
import { mediaService, type MediaContent } from '@/services/mediaService';
import InstagramCarousel from '../carousel/InstagramCarousel';
import { placeholderService } from '@/services/placeholderService';
import { Grid2X2, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 6;

const MediaFeed: React.FC = () => {
    const [content, setContent] = useState<MediaContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                // Fetch all published carousels
                const data = await mediaService.listMediaContent('carousel', 1, ITEMS_PER_PAGE);

                // Fetch detailed content for each summary (to get items/slides)
                const fullData = await Promise.all(
                    data.map(async (item) => {
                        const detailed = await mediaService.getMediaContent(item.slug);
                        return detailed || item;
                    })
                );

                setContent(fullData);
                setHasMore(data.length >= ITEMS_PER_PAGE);
            } catch (error) {
                console.error('Failed to fetch media feed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);

    // Load more function
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const data = await mediaService.listMediaContent('carousel', nextPage, ITEMS_PER_PAGE);

            if (data.length === 0) {
                setHasMore(false);
                return;
            }

            const fullNewItems = await Promise.all(
                data.map(async (item) => {
                    const detailed = await mediaService.getMediaContent(item.slug);
                    return detailed || item;
                })
            );

            setContent(prev => [...prev, ...fullNewItems]);
            setPage(nextPage);
            setHasMore(data.length >= ITEMS_PER_PAGE);
        } catch (error) {
            console.error('Failed to load more:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [page, loadingMore, hasMore]);

    // Infinite scroll observer
    useEffect(() => {
        if (loading) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loading, hasMore, loadingMore, loadMore]);

    if (loading) {
        return (
            <div className="space-y-8 max-w-xl mx-auto py-8 px-4">
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-32 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-kenya-black dark:text-white">
                        Our <span className="text-kenya-red">Posts</span>
                    </h2>
                    <p className="text-muted-foreground text-sm">Visual education series and carousels</p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                    <Button
                        variant={viewMode === 'feed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('feed')}
                        className="gap-1.5 rounded-full"
                    >
                        <List size={16} />
                        Feed
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="gap-1.5 rounded-full"
                    >
                        <Grid2X2 size={16} />
                        Grid
                    </Button>
                </div>
            </div>

            {viewMode === 'feed' ? (
                <div className="space-y-12 max-w-xl mx-auto">
                    {content.length > 0 ? content.map((item) => (
                        <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                {item.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                                )}
                            </div>
                            <InstagramCarousel content={item} />
                        </div>
                    )) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-3xl opacity-50">
                            <p>No visual media published yet.</p>
                        </div>
                    )}

                    {/* Infinite Scroll Trigger */}
                    <div ref={loadMoreRef} className="py-8 flex justify-center">
                        {loadingMore && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Loading more...</span>
                            </div>
                        )}
                        {!hasMore && content.length > 0 && (
                            <p className="text-sm text-muted-foreground">You've reached the end</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                    {content.map((item) => (
                        <div
                            key={item.id}
                            className="aspect-square relative group cursor-pointer overflow-hidden bg-muted"
                            onClick={() => setViewMode('feed')}
                        >
                            <img
                                src={item.cover_url || item.items?.[0]?.file_url || placeholderService.getPlaceholderByTags(item.tags || [])}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = placeholderService.getPlaceholderByTags(item.tags || []);
                                }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                <p className="text-white text-xs font-bold text-center uppercase tracking-tight">{item.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaFeed;
