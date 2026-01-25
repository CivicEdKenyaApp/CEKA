import { supabase } from "@/integrations/supabase/client";

/**
 * Storage adapter to handle file operations across different providers.
 * Tier: 10GB Integrated Package
 */
export type StorageProvider = 'supabase' | 'backblaze' | 'cloudflare';

interface StorageOptions {
    provider?: StorageProvider;
    bucket?: string;
    isPublic?: boolean;
}

export const storage = {
    /**
     * Get a public URL for a file
     */
    getPublicUrl(path: string, options: StorageOptions = {}): string {
        const { provider = (import.meta.env.VITE_STORAGE_PROVIDER as StorageProvider) || 'supabase', bucket = 'resources' } = options;

        if (provider === 'supabase') {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            return data.publicUrl;
        }

        // Configuration for Backblaze / Cloudflare
        const prefix = import.meta.env.VITE_STORAGE_BASE_URL || '';
        if (prefix) {
            // For Cloudflare R2: https://pub-[hash].r2.dev/[bucket]/[path]
            // For Backblaze B2: https://f000.backblazeb2.com/file/[bucket]/[path]
            return `${prefix}/${bucket}/${path}`;
        }

        return path;
    },

    /**
     * Upload a file to storage
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

        // Note: Client-side direct upload to S3 (B2/R2) requires Presigned URLs for security
        // Recommendation: Handle this via a Supabase Edge Function to keep S3 keys private
        throw new Error(`Upload for provider ${provider} requires a secure signed URL from Edge Functions.`);
    }
};
