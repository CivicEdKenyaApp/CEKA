/**
 * Backblaze B2 Storage Service
 * 
 * S3-compatible API for Backblaze B2 storage
 * Used for storing resources, documents, and media files
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// B2 Configuration from environment variables
const B2_KEY_ID = import.meta.env.VITE_B2_KEY_ID || '';
const B2_APP_KEY = import.meta.env.VITE_B2_APP_KEY || '';
const B2_BUCKET_NAME = import.meta.env.VITE_B2_BUCKET_NAME || 'ceka-resources';

// Ensure endpoint has protocol
let rawEndpoint = import.meta.env.VITE_B2_ENDPOINT || 's3.us-west-004.backblazeb2.com';
if (!rawEndpoint.startsWith('http')) {
    rawEndpoint = `https://${rawEndpoint}`;
}
const B2_ENDPOINT = rawEndpoint;

// Derive region from endpoint if not provided
const B2_REGION = import.meta.env.VITE_B2_REGION || (B2_ENDPOINT.includes('s3.') ? B2_ENDPOINT.split('.')[1] : 'us-west-004');

// Initialize S3 client for Backblaze B2
const b2Client = new S3Client({
    region: B2_REGION,
    endpoint: B2_ENDPOINT,
    credentials: {
        accessKeyId: B2_KEY_ID,
        secretAccessKey: B2_APP_KEY,
    },
    forcePathStyle: true, // Required for B2
});

// Check if B2 is configured
export const isB2Configured = (): boolean => {
    return !!(B2_KEY_ID && B2_APP_KEY && B2_BUCKET_NAME);
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
 * Backblaze B2 Storage Service
 */
export const backblazeService = {
    /**
     * Upload a file to Backblaze B2
     */
    async uploadFile(
        file: File,
        path: string,
        options: { contentType?: string; metadata?: Record<string, string> } = {}
    ): Promise<UploadResult> {
        if (!isB2Configured()) {
            return { success: false, error: 'Backblaze B2 is not configured' };
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const contentType = options.contentType || file.type || 'application/octet-stream';

            const command = new PutObjectCommand({
                Bucket: B2_BUCKET_NAME,
                Key: path,
                Body: new Uint8Array(arrayBuffer),
                ContentType: contentType,
                Metadata: options.metadata,
            });

            await b2Client.send(command);

            // Generate public URL
            const url = `${B2_ENDPOINT}/${B2_BUCKET_NAME}/${path}`;

            return {
                success: true,
                path,
                url,
                size: file.size,
                contentType,
            };
        } catch (error) {
            console.error('B2 upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed',
            };
        }
    },

    /**
     * Upload raw data to Backblaze B2
     */
    async uploadData(
        data: Uint8Array | ArrayBuffer | string,
        path: string,
        contentType: string = 'application/octet-stream',
        metadata?: Record<string, string>
    ): Promise<UploadResult> {
        if (!isB2Configured()) {
            return { success: false, error: 'Backblaze B2 is not configured' };
        }

        try {
            const body = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);

            const command = new PutObjectCommand({
                Bucket: B2_BUCKET_NAME,
                Key: path,
                Body: body,
                ContentType: contentType,
                Metadata: metadata,
            });

            await b2Client.send(command);

            const url = `${B2_ENDPOINT}/${B2_BUCKET_NAME}/${path}`;

            return {
                success: true,
                path,
                url,
                size: body.byteLength,
                contentType,
            };
        } catch (error) {
            console.error('B2 upload error:', error);
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
        if (!isB2Configured()) {
            console.warn('Backblaze B2 is not configured');
            return null;
        }

        try {
            const command = new GetObjectCommand({
                Bucket: B2_BUCKET_NAME,
                Key: path,
            });

            const signedUrl = await getSignedUrl(b2Client, command, { expiresIn });
            return signedUrl;
        } catch (error) {
            console.error('B2 signed URL error:', error);
            return null;
        }
    },

    /**
     * Get public URL for a file
     */
    getPublicUrl(path: string): string {
        return `${B2_ENDPOINT}/${B2_BUCKET_NAME}/${path}`;
    },

    /**
     * Delete a file from Backblaze B2
     */
    async deleteFile(path: string): Promise<boolean> {
        if (!isB2Configured()) {
            console.warn('Backblaze B2 is not configured');
            return false;
        }

        try {
            const command = new DeleteObjectCommand({
                Bucket: B2_BUCKET_NAME,
                Key: path,
            });

            await b2Client.send(command);
            return true;
        } catch (error) {
            console.error('B2 delete error:', error);
            return false;
        }
    },

    /**
     * List files in a directory
     */
    async listFiles(prefix: string = '', maxKeys: number = 100): Promise<FileInfo[]> {
        if (!isB2Configured()) {
            console.warn('Backblaze B2 is not configured');
            return [];
        }

        try {
            const command = new ListObjectsV2Command({
                Bucket: B2_BUCKET_NAME,
                Prefix: prefix,
                MaxKeys: maxKeys,
            });

            const response = await b2Client.send(command);

            return (response.Contents || []).map(item => ({
                key: item.Key || '',
                size: item.Size || 0,
                lastModified: item.LastModified || new Date(),
            }));
        } catch (error) {
            console.error('B2 list error:', error);
            return [];
        }
    },

    /**
     * Check if a file exists
     */
    async fileExists(path: string): Promise<boolean> {
        if (!isB2Configured()) {
            return false;
        }

        try {
            const command = new GetObjectCommand({
                Bucket: B2_BUCKET_NAME,
                Key: path,
            });

            await b2Client.send(command);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Get file content
     */
    async getFile(path: string): Promise<Uint8Array | null> {
        if (!isB2Configured()) {
            return null;
        }

        try {
            const command = new GetObjectCommand({
                Bucket: B2_BUCKET_NAME,
                Key: path,
            });

            const response = await b2Client.send(command);

            if (response.Body) {
                const bytes = await response.Body.transformToByteArray();
                return bytes;
            }

            return null;
        } catch (error) {
            console.error('B2 get file error:', error);
            return null;
        }
    },
};

export default backblazeService;
