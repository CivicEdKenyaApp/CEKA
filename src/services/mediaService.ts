/**
 * Media Service
 * 
 * Orchestrates Instagram-style media content (carousels, PDF series, videos).
 * Connects Supabase (metadata) with Backblaze/Storage (assets).
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

        if (error) {
            console.error('[MediaService] Error fetching content:', error);
            return null;
        }

        // Sort items by order_index
        if (data && (data as any).items) {
            (data as any).items.sort((a: any, b: any) => a.order_index - b.order_index);
        }

        return data as unknown as MediaContent;
    },

    /**
     * Fetch all published media content by type
     */
    async listMediaContent(type?: MediaType): Promise<MediaContent[]> {
        let query = (supabase as any)
            .from('media_content')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[MediaService] Error listing content:', error);
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

        // 2. Upload to Backblaze
        const uploadResult: UploadResult = await storageService.upload(file, path);

        if (!uploadResult.success) {
            console.error('[MediaService] Storage upload failed:', uploadResult.error);
            return null;
        }

        // 3. Add to DB
        const { data, error } = await (supabase as any)
            .from('media_items')
            .insert([{
                content_id: contentId,
                type,
                file_path: path,
                file_url: uploadResult.url,
                order_index: orderIndex,
                metadata
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
     * Generate a PDF download URL for a carousel
     * (In a real scenario, this might trigger an Edge Function to merge images)
     */
    async getCarouselPDFUrl(contentId: string): Promise<string | null> {
        const { data, error } = await (supabase as any)
            .from('media_content')
            .select('metadata')
            .eq('id', contentId)
            .single();

        if (error || !data) return null;

        return (data as any).metadata?.pdf_url || null;
    }
};

export default mediaService;
