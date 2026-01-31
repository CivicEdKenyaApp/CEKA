/**
 * Unified Storage Service
 * 
 * Abstraction layer that provides a single interface for multiple storage providers:
 * - Backblaze B2
 * - Cloudflare R2
 * - Supabase Storage (fallback)
 * 
 * The active provider is determined by environment configuration
 */

import { backblazeService, isB2Configured, type UploadResult, type FileInfo } from './backblazeService';
import { cloudflareR2Service, isR2Configured } from './cloudflareR2Service';
import { supabase } from '@/integrations/supabase/client';

// Storage provider types
export type StorageProvider = 'backblaze' | 'r2' | 'supabase' | 'auto';

// Get provider from environment or use auto-detection
const STORAGE_PROVIDER = (import.meta.env.VITE_STORAGE_PROVIDER as StorageProvider) || 'auto';
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'resources';

// Re-export types
export type { UploadResult, FileInfo };

/**
 * Determine the best available storage provider
 */
const getActiveProvider = (): StorageProvider => {
    if (STORAGE_PROVIDER !== 'auto') {
        return STORAGE_PROVIDER;
    }

    // Auto-detect based on configured credentials
    if (isB2Configured()) return 'backblaze';
    if (isR2Configured()) return 'r2';
    return 'supabase';
};

/**
 * Supabase storage operations (fallback)
 */
const supabaseStorage = {
    async uploadFile(file: File, path: string): Promise<UploadResult> {
        try {
            const { data, error } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from(SUPABASE_BUCKET)
                .getPublicUrl(path);

            return {
                success: true,
                path: data.path,
                url: urlData.publicUrl,
                size: file.size,
                contentType: file.type,
            };
        } catch (error) {
            console.error('Supabase upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed',
            };
        }
    },

    async deleteFile(path: string): Promise<boolean> {
        try {
            const { error } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .remove([path]);

            return !error;
        } catch {
            return false;
        }
    },

    getPublicUrl(path: string): string {
        const { data } = supabase.storage
            .from(SUPABASE_BUCKET)
            .getPublicUrl(path);
        return data.publicUrl;
    },

    async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string | null> {
        try {
            const { data, error } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .createSignedUrl(path, expiresIn);

            if (error) throw error;
            return data.signedUrl;
        } catch {
            return null;
        }
    },

    async listFiles(prefix: string = ''): Promise<FileInfo[]> {
        try {
            const { data, error } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .list(prefix);

            if (error) throw error;

            return (data || []).map(item => ({
                key: item.name,
                size: item.metadata?.size || 0,
                lastModified: new Date(item.updated_at || item.created_at),
            }));
        } catch {
            return [];
        }
    },
};

/**
 * Unified Storage Service API
 */
export const storageService = {
    /**
     * Get the currently active storage provider
     */
    get provider(): StorageProvider {
        return getActiveProvider();
    },

    /**
     * Check if external storage is configured
     */
    get isExternalStorageConfigured(): boolean {
        return isB2Configured() || isR2Configured();
    },

    /**
     * Get configuration status for all providers
     */
    getProviderStatus(): Record<StorageProvider, boolean> {
        return {
            backblaze: isB2Configured(),
            r2: isR2Configured(),
            supabase: true, // Always available
            auto: true,
        };
    },

    /**
     * Upload a file to storage
     */
    async upload(file: File, path: string, options?: { contentType?: string }): Promise<UploadResult> {
        const provider = getActiveProvider();
        console.log(`[Storage] Uploading to ${provider}: ${path}`);

        switch (provider) {
            case 'backblaze':
                return backblazeService.uploadFile(file, path, options);
            case 'r2':
                return cloudflareR2Service.uploadFile(file, path, options);
            case 'supabase':
            default:
                return supabaseStorage.uploadFile(file, path);
        }
    },

    /**
     * Upload raw data to storage
     */
    async uploadData(
        data: Uint8Array | ArrayBuffer | string,
        path: string,
        contentType: string = 'application/octet-stream'
    ): Promise<UploadResult> {
        const provider = getActiveProvider();

        switch (provider) {
            case 'backblaze':
                return backblazeService.uploadData(data, path, contentType);
            case 'r2':
                return cloudflareR2Service.uploadData(data, path, contentType);
            case 'supabase':
            default:
                // Convert to File for Supabase
                const blob = new Blob([data], { type: contentType });
                const file = new File([blob], path.split('/').pop() || 'file', { type: contentType });
                return supabaseStorage.uploadFile(file, path);
        }
    },

    /**
     * Delete a file from storage
     */
    async delete(path: string): Promise<boolean> {
        const provider = getActiveProvider();

        switch (provider) {
            case 'backblaze':
                return backblazeService.deleteFile(path);
            case 'r2':
                return cloudflareR2Service.deleteFile(path);
            case 'supabase':
            default:
                return supabaseStorage.deleteFile(path);
        }
    },

    /**
     * Get public URL for a file
     */
    getPublicUrl(path: string): string {
        const provider = getActiveProvider();

        switch (provider) {
            case 'backblaze':
                return backblazeService.getPublicUrl(path);
            case 'r2':
                return cloudflareR2Service.getPublicUrl(path);
            case 'supabase':
            default:
                return supabaseStorage.getPublicUrl(path);
        }
    },

    /**
     * Get signed URL for temporary access
     */
    async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string | null> {
        const provider = getActiveProvider();

        switch (provider) {
            case 'backblaze':
                return backblazeService.getSignedUrl(path, expiresIn);
            case 'r2':
                return cloudflareR2Service.getSignedUrl(path, expiresIn);
            case 'supabase':
            default:
                return supabaseStorage.getSignedUrl(path, expiresIn);
        }
    },

    /**
     * List files in a directory
     */
    async list(prefix: string = '', maxKeys: number = 100): Promise<FileInfo[]> {
        const provider = getActiveProvider();

        switch (provider) {
            case 'backblaze':
                return backblazeService.listFiles(prefix, maxKeys);
            case 'r2':
                return cloudflareR2Service.listFiles(prefix, maxKeys);
            case 'supabase':
            default:
                return supabaseStorage.listFiles(prefix);
        }
    },

    /**
     * Check if a file exists
     */
    async exists(path: string): Promise<boolean> {
        const provider = getActiveProvider();

        switch (provider) {
            case 'backblaze':
                return backblazeService.fileExists(path);
            case 'r2':
                return cloudflareR2Service.fileExists(path);
            case 'supabase':
            default:
                const files = await supabaseStorage.listFiles(path);
                return files.length > 0;
        }
    },

    /**
     * Generate a unique file path with timestamp
     */
    generatePath(filename: string, folder: string = 'uploads'): string {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const extension = filename.split('.').pop() || '';
        const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
        return `${folder}/${timestamp}-${randomStr}-${safeName}`;
    },

    /**
     * Upload with automatic path generation
     */
    async uploadAuto(file: File, folder: string = 'resources'): Promise<UploadResult> {
        const path = this.generatePath(file.name, folder);
        return this.upload(file, path);
    },
};

export default storageService;
