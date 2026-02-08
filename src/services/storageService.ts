// Storage Service - Hybrid Storage with Backblaze B2 Primary and Supabase Fallback
// Handles file uploads with automatic provider selection and metadata sync

import { supabase } from '@/integrations/supabase/client';
import backblazeStorage from './backblazeStorage';

export interface UploadOptions {
    folder?: string;
    upsert?: boolean;
    onProgress?: (progress: number) => void;
}

export interface UploadResult {
    success: boolean;
    url?: string;
    path?: string;
    error?: string;
    provider?: 'supabase' | 'backblaze';
}

class StorageService {
    private initialized = false;
    private useBackblaze = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Try to initialize Backblaze
            this.useBackblaze = await backblazeStorage.initialize();
            console.log(`[StorageService] Using ${this.useBackblaze ? 'Backblaze B2' : 'Supabase Storage'}`);
        } catch (error) {
            console.warn('[StorageService] Backblaze init failed, using Supabase:', error);
            this.useBackblaze = false;
        }

        this.initialized = true;
    }

    async upload(file: File, path: string, options: UploadOptions = {}): Promise<UploadResult> {
        await this.initialize();

        const folder = options.folder || 'resources';
        const fullPath = path.startsWith(folder) ? path : `${folder}/${path}`;

        console.log(`[Storage] Uploading to ${this.useBackblaze ? 'backblaze' : 'supabase'}: ${fullPath}`);

        if (this.useBackblaze) {
            try {
                const result = await backblazeStorage.uploadFile(file, folder, options.onProgress);
                if (result.success) {
                    return {
                        success: true,
                        url: result.fileUrl,
                        path: result.fileName,
                        provider: 'backblaze'
                    };
                }
                throw new Error(result.error);
            } catch (error) {
                console.warn('[Storage] Backblaze upload failed, falling back to Supabase:', error);
                // Fall through to Supabase
            }
        }

        // Supabase Storage upload
        return await this.uploadToSupabase(file, fullPath, options);
    }

    private async uploadToSupabase(file: File, path: string, options: UploadOptions): Promise<UploadResult> {
        try {
            // Extract bucket from path
            const parts = path.split('/');
            const bucket = parts[0];
            const filePath = parts.slice(1).join('/');

            options.onProgress?.(10);

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: options.upsert ?? true
                });

            if (error) {
                console.error('[Storage] Supabase upload error:', error);
                throw error;
            }

            options.onProgress?.(80);

            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            options.onProgress?.(100);

            return {
                success: true,
                url: urlData.publicUrl,
                path: data.path,
                provider: 'supabase'
            };
        } catch (error: any) {
            console.error('[Storage] Upload failed:', error);
            return {
                success: false,
                error: error.message || 'Upload failed'
            };
        }
    }

    async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
        const fileName = `${userId}-${Date.now()}.${file.name.split('.').pop()}`;

        try {
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update profile with new avatar URL
            await supabase
                .from('profiles')
                .update({ avatar_url: urlData.publicUrl })
                .eq('id', userId);

            return {
                success: true,
                url: urlData.publicUrl,
                path: data.path,
                provider: 'supabase'
            };
        } catch (error: any) {
            console.error('[Storage] Avatar upload error:', error);
            return {
                success: false,
                error: error.message || 'Avatar upload failed'
            };
        }
    }

    async uploadResource(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}-${sanitizedName}`;
        const path = `resources/${fileName}`;

        return await this.upload(file, path, { folder: 'resources', onProgress });
    }

    async delete(path: string): Promise<boolean> {
        try {
            const parts = path.split('/');
            const bucket = parts[0];
            const filePath = parts.slice(1).join('/');

            const { error } = await supabase.storage
                .from(bucket)
                .remove([filePath]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('[Storage] Delete error:', error);
            return false;
        }
    }

    getStorageProvider(): string {
        return this.useBackblaze ? 'backblaze' : 'supabase';
    }

    isBackblazeEnabled(): boolean {
        return this.useBackblaze;
    }
}

export const storageService = new StorageService();
export default storageService;
