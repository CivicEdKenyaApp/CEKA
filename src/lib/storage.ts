import { supabase } from "@/integrations/supabase/client";

/**
 * Storage provider types supported by the system
 */
export type StorageProvider = 'supabase' | 'backblaze' | 'cloudflare';

interface StorageOptions {
    provider?: StorageProvider;
    bucket?: string;
    isPublic?: boolean;
}

/**
 * Storage adapter to handle file operations across different providers.
 * Default remains Supabase as per instructions.
 */
export const storage = {
    /**
     * Get a public URL for a file
     */
    getPublicUrl(path: string, options: StorageOptions = {}): string {
        const { provider = 'supabase', bucket = 'resources' } = options;

        if (provider === 'supabase') {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            return data.publicUrl;
        }

        // Fallback for Backblaze / Cloudflare based on environment config
        // This uses the STORAGE_PUBLIC_URL_PREFIX from .env
        const prefix = import.meta.env.STORAGE_PUBLIC_URL_PREFIX || '';
        if (prefix) {
            return `${prefix}/${bucket}/${path}`;
        }

        return path;
    },

    /**
     * Upload a file to storage
     * Note: This is an authenticated operation in Supabase
     */
    async uploadFile(file: File, path: string, options: StorageOptions = {}) {
        const { provider = 'supabase', bucket = 'resources' } = options;

        if (provider === 'supabase') {
            const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
                upsert: true
            });
            if (error) throw error;
            return data;
        }

        // For Backblaze/Cloudflare, typically you'd hit an API route that uses S3 SDK
        // Since we can't add runtime services, we assume a compatible S3-like endpoint
        // could be added to Supabase Edge Functions or handled client-side if keys are safe
        throw new Error(`Upload for provider ${provider} not fully implemented in client layer.`);
    }
};
