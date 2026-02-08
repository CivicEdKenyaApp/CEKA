/**
 * Media Service
 * 
 * Orchestrates Instagram-style media content (carousels, PDF series, videos).
 * Connects Supabase (metadata) with Backblaze/Storage (assets).
 * Supports pagination for infinite scroll.
 */

import { supabase } from '@/integrations/supabase/client';
import storageService from './storageService';
import type { UploadResult } from './storageService';

export type MediaType = 'carousel' | 'pdf_series' | 'video' | 'document';
export type MediaItemType = 'image' | 'video' | 'pdf' | 'audio';

export interface MediaContent {
    id: string;
    type: MediaType;
    title: string;
    description: string | null;
    slug: string;
    cover_url: string | null;
    status: 'draft' | 'published' | 'archived';
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    items?: MediaItem[];
    tags?: string[];
}

export interface MediaItem {
    id: string;
    content_id: string;
    type: MediaItemType;
    file_path: string;
    file_url: string | null;
    order_index: number;
    metadata: Record<string, any>;
    created_at: string;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export const mediaService = {
    /**
     * Fetch a single media content container with its items
     */
    async getMediaContent(slug: string): Promise<MediaContent | null> {
        const { data, error } = await (supabase as any)
            .from('media_content')
            .select(`
                *,
                items:media_items(*)
            `)
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error || !data) {
            console.error('[MediaService] Error fetching content:', error);
            return null;
        }

        // Sort items by order_index
        if (data.items) {
            data.items.sort((a: any, b: any) => a.order_index - b.order_index);
        }

        // HYDRATE: If storage is private, resolve signed URLs for everything
        return await this.hydrateMediaUrls(data as unknown as MediaContent);
    },

    /**
     * Automatically converts all B2 public URLs in a MediaContent object to signed ones.
     * Essential for private buckets.
     */
    async hydrateMediaUrls(content: MediaContent): Promise<MediaContent> {
        // 1. Resolve Cover URL
        if (content.cover_url) {
            content.cover_url = await storageService.getAuthorizedUrl(content.cover_url);
        }

        // 2. Resolve PDF URL in metadata if present
        if (content.metadata?.pdf_url) {
            content.metadata.pdf_url = await storageService.getAuthorizedUrl(content.metadata.pdf_url);
        }

        // 3. Resolve all Items - ALWAYS use file_url (full B2 URL) for domain detection
        if (content.items && content.items.length > 0) {
            const hydratedItems = await Promise.all(
                content.items.map(async (item) => {
                    // Priority: Use full file_url so we can detect the B2 domain
                    if (item.file_url) {
                        const signed = await storageService.getAuthorizedUrl(item.file_url);
                        return { ...item, file_url: signed };
                    }
                    return item;
                })
            );
            content.items = hydratedItems;
        }

        return content;
    },

    /**
     * Fetch all published media content by type with optional pagination
     */
    async listMediaContent(
        type?: MediaType,
        page: number = 1,
        pageSize: number = 50
    ): Promise<MediaContent[]> {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = (supabase as any)
            .from('media_content')
            .select('*', { count: 'exact' })
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('[MediaService] Error listing content:', error);
            return [];
        }

        // HYDRATE cover URLs for the feed cards
        const results = data as unknown as MediaContent[];
        return await Promise.all(results.map(content => this.hydrateMediaUrls(content)));
    },

    /**
     * Get the current featured media content
     */
    async getFeaturedMedia(): Promise<MediaContent | null> {
        // We look for content with a 'featured' tag or just the latest special edition
        const { data, error } = await (supabase as any)
            .from('media_content')
            .select(`
                *,
                items:media_items(*)
            `)
            .eq('status', 'published')
            .contains('tags', ['special-edition'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            // Fallback: just get the latest published carousel
            const latest = await this.listMediaContent('carousel', 1, 1);
            if (latest.length > 0) {
                return await this.getMediaContent(latest[0].slug);
            }
            return null;
        }

        // Sort items by order_index
        if (data && (data as any).items) {
            (data as any).items.sort((a: any, b: any) => a.order_index - b.order_index);
        }

        return data as unknown as MediaContent;
    },

    /**
     * Fetch paginated media content
     */
    async listMediaContentPaginated(
        type?: MediaType,
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResult<MediaContent>> {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = (supabase as any)
            .from('media_content')
            .select('*', { count: 'exact' })
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('[MediaService] Error listing content:', error);
            return { data: [], total: 0, page, pageSize, hasMore: false };
        }

        return {
            data: data as unknown as MediaContent[],
            total: count || 0,
            page,
            pageSize,
            hasMore: (from + data.length) < (count || 0)
        };
    },

    /**
     * Search media content by title or tags
     */
    async searchMediaContent(query: string): Promise<MediaContent[]> {
        const { data, error } = await (supabase as any)
            .from('media_content')
            .select('*')
            .eq('status', 'published')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('[MediaService] Error searching content:', error);
            return [];
        }

        return data as unknown as MediaContent[];
    },

    /**
     * Create a new media content container
     */
    async createContent(content: Partial<MediaContent>): Promise<MediaContent | null> {
        const { data, error } = await (supabase as any)
            .from('media_content')
            .insert([content])
            .select()
            .single();

        if (error) {
            console.error('[MediaService] Error creating content:', error);
            return null;
        }

        return data as unknown as MediaContent;
    },

    /**
     * Update existing media content
     */
    async updateContent(id: string, updates: Partial<MediaContent>): Promise<MediaContent | null> {
        const { data, error } = await (supabase as any)
            .from('media_content')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[MediaService] Error updating content:', error);
            return null;
        }

        return data as unknown as MediaContent;
    },

    /**
     * Delete media content and all its items
     */
    async deleteContent(id: string): Promise<boolean> {
        // First delete all items
        await (supabase as any)
            .from('media_items')
            .delete()
            .eq('content_id', id);

        // Then delete the content
        const { error } = await (supabase as any)
            .from('media_content')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[MediaService] Error deleting content:', error);
            return false;
        }

        return true;
    },

    /**
     * Add an item to a content container (uploads to storage and adds to DB)
     */
    async addMediaItem(
        contentId: string,
        file: File,
        slug: string,
        type: MediaItemType,
        orderIndex: number = 0,
        metadata: Record<string, any> = {}
    ): Promise<MediaItem | null> {
        // 1. Generate path
        const path = storageService.generateMediaPath(file.name, type, slug);

        // 2. Upload to storage
        const uploadResult: UploadResult = await storageService.upload(file, path);

        if (!uploadResult.success) {
            console.error('[MediaService] Storage upload failed:', uploadResult.error);
            return null;
        }

        // 3. Detect aspect ratio from image
        let aspectRatio = '1:1';
        if (type === 'image') {
            aspectRatio = await this.detectAspectRatio(file);
        }

        // 4. Add to DB
        const { data, error } = await (supabase as any)
            .from('media_items')
            .insert([{
                content_id: contentId,
                type,
                file_path: path,
                file_url: uploadResult.url,
                order_index: orderIndex,
                metadata: {
                    ...metadata,
                    aspect_ratio: aspectRatio,
                    original_size: file.size,
                    original_name: file.name
                }
            }])
            .select()
            .single();

        if (error) {
            console.error('[MediaService] Error adding item to DB:', error);
            return null;
        }

        return data as unknown as MediaItem;
    },

    /**
     * Delete a media item
     */
    async deleteMediaItem(itemId: string): Promise<boolean> {
        // Get the item first to delete from storage
        const { data: item } = await (supabase as any)
            .from('media_items')
            .select('file_path')
            .eq('id', itemId)
            .single();

        if (item?.file_path) {
            await storageService.delete(item.file_path);
        }

        const { error } = await (supabase as any)
            .from('media_items')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('[MediaService] Error deleting item:', error);
            return false;
        }

        return true;
    },

    /**
     * Detect aspect ratio from an image file
     */
    async detectAspectRatio(file: File): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;

                // Common aspect ratios
                const ratios: [number, string][] = [
                    [1, '1:1'],
                    [4 / 3, '4:3'],
                    [3 / 4, '3:4'],
                    [16 / 9, '16:9'],
                    [9 / 16, '9:16'],
                    [4 / 5, '4:5'],
                    [5 / 4, '5:4'],
                    [3 / 2, '3:2'],
                    [2 / 3, '2:3'],
                    [21 / 9, '21:9']
                ];

                const actualRatio = width / height;
                let closestRatio = '1:1';
                let minDiff = Infinity;

                for (const [ratio, name] of ratios) {
                    const diff = Math.abs(actualRatio - ratio);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestRatio = name;
                    }
                }

                URL.revokeObjectURL(img.src);
                resolve(closestRatio);
            };
            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                resolve('1:1');
            };
            img.src = URL.createObjectURL(file);
        });
    },

    /**
     * Generate a PDF download URL for a carousel
     */
    async getCarouselPDFUrl(contentId: string): Promise<string | null> {
        const { data, error } = await (supabase as any)
            .from('media_content')
            .select('metadata')
            .eq('id', contentId)
            .single();

        if (error || !data) return null;

        return (data as any).metadata?.pdf_url || null;
    },

    /**
     * Reorder items within a content container
     */
    async reorderItems(contentId: string, itemIds: string[]): Promise<boolean> {
        try {
            for (let i = 0; i < itemIds.length; i++) {
                await (supabase as any)
                    .from('media_items')
                    .update({ order_index: i })
                    .eq('id', itemIds[i])
                    .eq('content_id', contentId);
            }
            return true;
        } catch (error) {
            console.error('[MediaService] Error reordering items:', error);
            return false;
        }
    },

    /**
     * Update item metadata (e.g., aspect ratio, captions)
     */
    async updateItemMetadata(itemId: string, metadata: Record<string, any>): Promise<boolean> {
        const { data: item } = await (supabase as any)
            .from('media_items')
            .select('metadata')
            .eq('id', itemId)
            .single();

        const updatedMetadata = { ...item?.metadata, ...metadata };

        const { error } = await (supabase as any)
            .from('media_items')
            .update({ metadata: updatedMetadata })
            .eq('id', itemId);

        if (error) {
            console.error('[MediaService] Error updating item metadata:', error);
            return false;
        }

        return true;
    },

    /**
     * Get statistics for media content
     */
    async getMediaStats(): Promise<{
        total: number;
        byType: Record<MediaType, number>;
        recent: number;
    }> {
        const { count: total } = await (supabase as any)
            .from('media_content')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published');

        const types: MediaType[] = ['carousel', 'pdf_series', 'video', 'document'];
        const byType: Record<MediaType, number> = {} as any;

        for (const type of types) {
            const { count } = await (supabase as any)
                .from('media_content')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'published')
                .eq('type', type);
            byType[type] = count || 0;
        }

        // Recent = last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { count: recent } = await (supabase as any)
            .from('media_content')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published')
            .gte('created_at', weekAgo.toISOString());

        return {
            total: total || 0,
            byType,
            recent: recent || 0
        };
    }
};

export default mediaService;
