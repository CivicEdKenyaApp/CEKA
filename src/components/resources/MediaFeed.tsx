import React, { useEffect, useState } from 'react';
import { mediaService, type MediaContent } from '@/services/mediaService';
import { InstagramCarousel } from '../carousel/InstagramCarousel';
import { Grid2X2, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const MediaFeed: React.FC = () => {
    const [content, setContent] = useState<MediaContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const data = await mediaService.listMediaContent();
                // For each content, fetch its items
                const fullData = await Promise.all(
                    data.map(async (item) => {
                        const detailed = await mediaService.getMediaContent(item.slug);
                        return detailed || item;
                    })
                );
                setContent(fullData);
            } catch (error) {
                console.error('Failed to fetch media feed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);

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
                    <h1 className="text-3xl font-black italic tracking-tighter text-kenya-black dark:text-white uppercase">
                        Civic <span className="text-kenya-red">Gallery</span>
                    </h1>
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
                                <h2 className="text-xl font-bold">{item.title}</h2>
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
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                    {content.map((item) => (
                        <div
                            key={item.id}
                            className="aspect-square relative group cursor-pointer overflow-hidden bg-muted"
                            onClick={() => setViewMode('feed')} // Simple transition back to feed for now
                        >
                            <img
                                src={item.cover_url || ''}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
