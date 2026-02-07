/**
 * Processing Service
 *
 * Handles on-demand image processing at multiple resolutions.
 * Falls back to original URLs if Edge Function is unavailable.
 */

import { supabase } from '@/integrations/supabase/client';

export type ResolutionQuality = '320p' | '720p' | '1080p' | '4k';

interface ProcessedImage {
    url: string;
    quality: ResolutionQuality;
    cached: boolean;
}

// In-memory cache for processed URLs
const urlCache = new Map<string, Map<ResolutionQuality, string>>();

export const processingService = {
    /**
     * Request a specific resolution for an image
     * Falls back to original if processing fails
     */
    async requestResolution(
        itemId: string,
        quality: ResolutionQuality,
        originalUrl?: string
    ): Promise<ProcessedImage> {
        // Check cache first
        if (urlCache.has(itemId) && urlCache.get(itemId)?.has(quality)) {
            console.log(`[ProcessingEngine] Cache hit for ${quality}`);
            return {
                url: urlCache.get(itemId)!.get(quality)!,
                quality,
                cached: true
            };
        }

        console.log(`[ProcessingEngine] Requesting ${quality} for item: ${itemId}`);

        try {
            // Try Edge Function
            const { data, error } = await supabase.functions.invoke('process-media-resolution', {
                body: {
                    itemId,
                    quality,
                    originalUrl: originalUrl || '',
                    dimensions: this.getResolutionDimensions(quality)
                }
            });

            if (error) {
                console.log(`[ProcessingEngine] Edge function error, returning original:`, error);
                // Fallback to original
                if (originalUrl) {
                    return { url: originalUrl, quality, cached: false };
                }
            }

            if (data?.url) {
                // Cache the result
                if (!urlCache.has(itemId)) {
                    urlCache.set(itemId, new Map());
                }
                urlCache.get(itemId)!.set(quality, data.url);

                return {
                    url: data.url,
                    quality,
                    cached: data.cached || false
                };
            }
        } catch (err) {
            console.log(`[ProcessingEngine] Edge function not available, returning original:`, err);
        }

        // Fallback to original URL
        if (originalUrl) {
            return { url: originalUrl, quality, cached: false };
        }

        // Last resort: try to get from media_items table
        const { data: item } = await supabase
            .from('media_items')
            .select('file_url')
            .eq('id', itemId)
            .single();

        return {
            url: (item as any)?.file_url || '',
            quality,
            cached: false
        };
    },

    /**
     * Get resolution dimensions
     */
    getResolutionDimensions(quality: ResolutionQuality): { width: number; height: number } {
        const dimensions: Record<ResolutionQuality, { width: number; height: number }> = {
            '320p': { width: 320, height: 320 },
            '720p': { width: 1280, height: 720 },
            '1080p': { width: 1920, height: 1080 },
            '4k': { width: 3840, height: 2160 }
        };
        return dimensions[quality];
    },

    /**
     * Download an image at a specific quality
     * Uses direct fetch and blob download for reliability
     */
    async downloadImage(itemId: string, quality: ResolutionQuality, filename: string): Promise<void> {
        // First get the URL
        const { data: item } = await supabase
            .from('media_items')
            .select('file_url, metadata')
            .eq('id', itemId)
            .single();

        const originalUrl = (item as any)?.file_url;
        if (!originalUrl) {
            throw new Error('No file URL found');
        }

        // Try to get processed URL, fall back to original
        const processed = await this.requestResolution(itemId, quality, originalUrl);
        const downloadUrl = processed.url || originalUrl;

        try {
            // Fetch the image
            const response = await fetch(downloadUrl, {
                mode: 'cors',
                credentials: 'omit'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();

            // Create download link
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

            console.log(`[ProcessingEngine] Downloaded ${filename} at ${quality}`);
        } catch (fetchError) {
            console.log(`[ProcessingEngine] CORS fetch failed, using direct download`);

            // Fallback: open in new tab (works for CORS-restricted resources)
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(`[ProcessingEngine] Downloaded ${filename} at ${quality} (fallback)`);
        }
    },

    /**
     * Batch process all images in a series
     */
    async batchProcess(
        items: Array<{ id: string; file_url: string }>,
        qualities: ResolutionQuality[] = ['720p', '1080p']
    ): Promise<Map<string, Map<ResolutionQuality, string>>> {
        const results = new Map<string, Map<ResolutionQuality, string>>();

        for (const item of items) {
            const itemResults = new Map<ResolutionQuality, string>();

            for (const quality of qualities) {
                try {
                    const processed = await this.requestResolution(item.id, quality, item.file_url);
                    itemResults.set(quality, processed.url);
                } catch (err) {
                    console.warn(`[ProcessingEngine] Failed to process ${item.id} at ${quality}`);
                    itemResults.set(quality, item.file_url);
                }
            }

            results.set(item.id, itemResults);
        }

        return results;
    },

    /**
     * Get available resolutions for an image based on its metadata
     */
    getAvailableResolutions(metadata?: Record<string, any>): ResolutionQuality[] {
        if (!metadata?.max_resolution) {
            return ['320p', '720p', '1080p', '4k'];
        }

        const maxRes = metadata.max_resolution as string;
        const allRes: ResolutionQuality[] = ['320p', '720p', '1080p', '4k'];
        const maxIndex = allRes.indexOf(maxRes as ResolutionQuality);

        if (maxIndex === -1) {
            return allRes;
        }

        return allRes.slice(0, maxIndex + 1);
    },

    /**
     * Clear cache for an item or all items
     */
    clearCache(itemId?: string): void {
        if (itemId) {
            urlCache.delete(itemId);
        } else {
            urlCache.clear();
        }
    }
};

export default processingService;
