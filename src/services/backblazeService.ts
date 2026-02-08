/**
 * Backblaze B2 Storage Service
 * 
 * S3-compatible API for Backblaze B2 storage
 * Used for storing resources, documents, and media files
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Helper to get B2 config dynamically from environment
const getB2Config = () => {
    // We check multiple sources because Vite's standard injection can be unstable in built production bundles
    const keyId = import.meta.env.VITE_B2_KEY_ID || (window as any).process?.env?.VITE_B2_KEY_ID || (globalThis as any).VITE_B2_KEY_ID || '';
    const appKey = import.meta.env.VITE_B2_APP_KEY || (window as any).process?.env?.VITE_B2_APP_KEY || (globalThis as any).VITE_B2_APP_KEY || '';
    const bucketName = import.meta.env.VITE_B2_BUCKET_NAME || (window as any).process?.env?.VITE_B2_BUCKET_NAME || (globalThis as any).VITE_B2_BUCKET_NAME || 'ceka-resources-vault';
    const endpoint = import.meta.env.VITE_B2_ENDPOINT || (window as any).process?.env?.VITE_B2_ENDPOINT || (globalThis as any).VITE_B2_ENDPOINT || 's3.eu-central-003.backblazeb2.com';
    const region = import.meta.env.VITE_B2_REGION || (window as any).process?.env?.VITE_B2_REGION || (globalThis as any).VITE_B2_REGION || 'eu-central-003';

    // Diagnostic logging - checks existence and length, never values
    const sources = {
        importMeta: !!import.meta.env.VITE_B2_KEY_ID,
        processEnv: !!(window as any).process?.env?.VITE_B2_KEY_ID,
        globalThis: !!(globalThis as any).VITE_B2_KEY_ID
    };

    if (sources.importMeta) {
        console.log('[B2] Config Source: import.meta.env');
    } else if (sources.processEnv) {
        console.log('[B2] Config Source: process.env (Vite forced define)');
    } else if (sources.globalThis) {
        console.log('[B2] Config Source: globalThis (Global injection)');
    } else {
        console.error('[B2] CRITICAL: No credentials found in ANY environment source!', sources);
    }


    return {
        keyId,
        appKey,
        bucketName,
        endpoint: endpoint.startsWith('http') ? endpoint : `https://${endpoint}`,
        region
    };
};

// Internal client instance
let _b2Client: S3Client | null = null;

// Get or create S3 client with current credentials
const getB2Client = () => {
    const config = getB2Config();

    if (!config.keyId || !config.appKey) {
        console.warn('[B2] Cannot initialize client: Missing VITE_B2_KEY_ID or VITE_B2_APP_KEY');
        return null;
    }

    if (!_b2Client) {
        console.log('[B2] Initializing S3 Client with endpoint:', config.endpoint);
        _b2Client = new S3Client({
            region: config.region,
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.keyId,
                secretAccessKey: config.appKey,
            },
            forcePathStyle: true,
        });
    }
    return _b2Client;
};

// Check if B2 is configured
export const isB2Configured = (): boolean => {
    const config = getB2Config();
    return !!(config.keyId && config.appKey && config.bucketName);
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

        const config = getB2Config();
        const client = getB2Client();
        if (!client) return { success: false, error: 'Failed to initialize B2 client' };

        try {
            const arrayBuffer = await file.arrayBuffer();
            const contentType = options.contentType || file.type || 'application/octet-stream';

            const command = new PutObjectCommand({
                Bucket: config.bucketName,
                Key: path,
                Body: new Uint8Array(arrayBuffer),
                ContentType: contentType,
                Metadata: options.metadata,
            });

            await client.send(command);

            // Generate public URL
            const url = `${config.endpoint}/${config.bucketName}/${path}`;

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

        const config = getB2Config();
        const client = getB2Client();
        if (!client) return { success: false, error: 'Failed to initialize B2 client' };

        try {
            const body = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);

            const command = new PutObjectCommand({
                Bucket: config.bucketName,
                Key: path,
                Body: body,
                ContentType: contentType,
                Metadata: metadata,
            });

            await client.send(command);

            const url = `${config.endpoint}/${config.bucketName}/${path}`;

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
        const config = getB2Config();
        const client = getB2Client();

        if (!config.keyId || !config.appKey) {
            console.warn('[B2] Missing credentials for signed URL generation');
            return null;
        }

        if (!client) {
            console.warn('[B2] Client not initialized for signed URL');
            return null;
        }

        try {
            const command = new GetObjectCommand({
                Bucket: config.bucketName,
                Key: path,
            });

            const signedUrl = await getSignedUrl(client, command, { expiresIn });
            console.log(`[B2] Generated signed URL for: ${path}`);
            return signedUrl;
        } catch (error) {
            console.error('[B2] Signed URL error:', error);
            return null;
        }
    },


    /**
     * Get public URL for a file
     */
    getPublicUrl(path: string): string {
        const config = getB2Config();
        return `${config.endpoint}/${config.bucketName}/${path}`;
    },

    /**
     * Intelligently resolves a URL to a signed one if it belongs to Backblaze.
     * This allows us to keep the bucket PRIVATE while still showing images.
     */
    async resolveSignedUrl(url: string | null): Promise<string | null> {
        if (!url) return url;

        // Only resolve if it's a B2 URL
        if (!url.includes('backblazeb2.com')) return url;

        const config = getB2Config();

        // Check creds directly
        if (!config.keyId || !config.appKey) {
            console.warn('[B2] Cannot sign URL - missing credentials');
            return url;
        }

        try {
            // Extract the path (Key) from the URL
            // URL format typically: https://s3.region.backblazeb2.com/bucket-name/path/to/file.ext
            const bucketSearch = `/${config.bucketName}/`;
            const parts = url.split(bucketSearch);

            if (parts.length < 2) {
                // Try fallback logic if the URL structure is different
                const urlObj = new URL(url);
                // B2 sometimes uses path-style: /bucket/key or virtual-host: bucket.s3.../key
                if (urlObj.pathname.startsWith(`/${config.bucketName}/`)) {
                    const extractedPath = urlObj.pathname.replace(`/${config.bucketName}/`, '');
                    console.log(`[B2] Extracted path via fallback: ${extractedPath}`);
                    return await this.getSignedUrl(extractedPath);
                }
                console.warn(`[B2] Could not extract path from URL: ${url}`);
                return url;
            }

            const path = parts[1];
            // Remove any query params if present
            const cleanPath = path.split('?')[0];
            console.log(`[B2] Signing path: ${cleanPath}`);

            return await this.getSignedUrl(cleanPath);
        } catch (error) {
            console.error('[B2] Error resolving signed URL:', error);
            return url;
        }
    },

    /**
     * Delete a file from Backblaze B2
     */
    async deleteFile(path: string): Promise<boolean> {
        if (!isB2Configured()) {
            console.warn('Backblaze B2 is not configured');
            return false;
        }

        const config = getB2Config();
        const client = getB2Client();
        if (!client) return false;

        try {
            const command = new DeleteObjectCommand({
                Bucket: config.bucketName,
                Key: path,
            });

            await client.send(command);
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

        const config = getB2Config();
        const client = getB2Client();
        if (!client) return [];

        try {
            const command = new ListObjectsV2Command({
                Bucket: config.bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys,
            });

            const response = await client.send(command);

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

        const config = getB2Config();
        const client = getB2Client();
        if (!client) return false;

        try {
            const command = new GetObjectCommand({
                Bucket: config.bucketName,
                Key: path,
            });

            await client.send(command);
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

        const config = getB2Config();
        const client = getB2Client();
        if (!client) return null;

        try {
            const command = new GetObjectCommand({
                Bucket: config.bucketName,
                Key: path,
            });

            const response = await client.send(command);

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
