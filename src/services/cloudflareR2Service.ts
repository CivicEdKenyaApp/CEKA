/**
 * Cloudflare R2 Storage Service
 * 
 * S3-compatible API for Cloudflare R2 storage
 * Zero egress fees, great for global distribution
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 Configuration from environment variables
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || 'ceka-resources';
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || ''; // Custom domain or R2.dev URL

// Initialize S3 client for Cloudflare R2
const r2Client = new S3Client({
    region: 'auto',
    endpoint: R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '',
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

// Check if R2 is configured
export const isR2Configured = (): boolean => {
    return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);
};

export interface UploadResult {
    success: boolean;
    path?: string;
    url?: string;
    error?: string;
    size?: number;
    contentType?: string;
}

export interface FileInfo {
    key: string;
    size: number;
    lastModified: Date;
    contentType?: string;
}

/**
 * Cloudflare R2 Storage Service
 */
export const cloudflareR2Service = {
    /**
     * Upload a file to Cloudflare R2
     */
    async uploadFile(
        file: File,
        path: string,
        options: { contentType?: string; metadata?: Record<string, string>; cacheControl?: string } = {}
    ): Promise<UploadResult> {
        if (!isR2Configured()) {
            return { success: false, error: 'Cloudflare R2 is not configured' };
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const contentType = options.contentType || file.type || 'application/octet-stream';

            const command = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: path,
                Body: new Uint8Array(arrayBuffer),
                ContentType: contentType,
                Metadata: options.metadata,
                CacheControl: options.cacheControl || 'public, max-age=31536000', // 1 year default
            });

            await r2Client.send(command);

            // Generate public URL if custom domain is configured
            const url = R2_PUBLIC_URL
                ? `${R2_PUBLIC_URL}/${path}`
                : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${path}`;

            return {
                success: true,
                path,
                url,
                size: file.size,
                contentType,
            };
        } catch (error) {
            console.error('R2 upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed',
            };
        }
    },

    /**
     * Upload raw data to Cloudflare R2
     */
    async uploadData(
        data: Uint8Array | ArrayBuffer | string,
        path: string,
        contentType: string = 'application/octet-stream',
        metadata?: Record<string, string>
    ): Promise<UploadResult> {
        if (!isR2Configured()) {
            return { success: false, error: 'Cloudflare R2 is not configured' };
        }

        try {
            const body = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);

            const command = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: path,
                Body: body,
                ContentType: contentType,
                Metadata: metadata,
            });

            await r2Client.send(command);

            const url = R2_PUBLIC_URL
                ? `${R2_PUBLIC_URL}/${path}`
                : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${path}`;

            return {
                success: true,
                path,
                url,
                size: body.byteLength,
                contentType,
            };
        } catch (error) {
            console.error('R2 upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed',
            };
        }
    },

    /**
     * Generate a signed URL for temporary access
     */
    async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string | null> {
        if (!isR2Configured()) {
            console.warn('Cloudflare R2 is not configured');
            return null;
        }

        try {
            const command = new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: path,
            });

            const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
            return signedUrl;
        } catch (error) {
            console.error('R2 signed URL error:', error);
            return null;
        }
    },

    /**
     * Get public URL for a file (requires public bucket or custom domain)
     */
    getPublicUrl(path: string): string {
        if (R2_PUBLIC_URL) {
            return `${R2_PUBLIC_URL}/${path}`;
        }
        // Fallback to R2.dev URL pattern (requires bucket to be public)
        return `https://pub-${R2_ACCOUNT_ID}.r2.dev/${path}`;
    },

    /**
     * Delete a file from Cloudflare R2
     */
    async deleteFile(path: string): Promise<boolean> {
        if (!isR2Configured()) {
            console.warn('Cloudflare R2 is not configured');
            return false;
        }

        try {
            const command = new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: path,
            });

            await r2Client.send(command);
            return true;
        } catch (error) {
            console.error('R2 delete error:', error);
            return false;
        }
    },

    /**
     * List files in a directory
     */
    async listFiles(prefix: string = '', maxKeys: number = 100): Promise<FileInfo[]> {
        if (!isR2Configured()) {
            console.warn('Cloudflare R2 is not configured');
            return [];
        }

        try {
            const command = new ListObjectsV2Command({
                Bucket: R2_BUCKET_NAME,
                Prefix: prefix,
                MaxKeys: maxKeys,
            });

            const response = await r2Client.send(command);

            return (response.Contents || []).map(item => ({
                key: item.Key || '',
                size: item.Size || 0,
                lastModified: item.LastModified || new Date(),
            }));
        } catch (error) {
            console.error('R2 list error:', error);
            return [];
        }
    },

    /**
     * Check if a file exists
     */
    async fileExists(path: string): Promise<boolean> {
        if (!isR2Configured()) {
            return false;
        }

        try {
            const command = new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: path,
            });

            await r2Client.send(command);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Get file content
     */
    async getFile(path: string): Promise<Uint8Array | null> {
        if (!isR2Configured()) {
            return null;
        }

        try {
            const command = new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: path,
            });

            const response = await r2Client.send(command);

            if (response.Body) {
                const bytes = await response.Body.transformToByteArray();
                return bytes;
            }

            return null;
        } catch (error) {
            console.error('R2 get file error:', error);
            return null;
        }
    },
};

export default cloudflareR2Service;
