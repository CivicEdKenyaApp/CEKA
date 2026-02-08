// Backblaze B2 Storage Service
// Handles uploads to Backblaze B2 with Supabase metadata sync

import { supabase } from '@/integrations/supabase/client';

export interface BackblazeConfig {
    keyId: string;
    applicationKey: string;
    bucketId: string;
    bucketName: string;
    endpoint: string;
}

export interface UploadResult {
    success: boolean;
    fileId?: string;
    fileName?: string;
    fileUrl?: string;
    error?: string;
}

export interface FileMetadata {
    id?: string;
    title: string;
    description?: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
    storageUrl: string;
    thumbnailUrl?: string;
    extractedText?: string;
    metadata?: Record<string, any>;
}

// For development/demo mode, we'll use Supabase Storage as fallback
// while maintaining the same interface for when B2 is configured
const STORAGE_MODE = import.meta.env.VITE_STORAGE_MODE || 'supabase';

class BackblazeStorageService {
    private config: BackblazeConfig | null = null;
    private authToken: string | null = null;
    private apiUrl: string | null = null;
    private downloadUrl: string | null = null;
    private uploadUrl: string | null = null;
    private uploadAuthToken: string | null = null;

    async initialize(): Promise<boolean> {
        // Try to get B2 config from environment or Supabase secrets
        const keyId = import.meta.env.VITE_B2_KEY_ID;
        const appKey = import.meta.env.VITE_B2_APPLICATION_KEY;
        const bucketId = import.meta.env.VITE_B2_BUCKET_ID;
        const bucketName = import.meta.env.VITE_B2_BUCKET_NAME;
        const endpoint = import.meta.env.VITE_B2_ENDPOINT || 'https://api.backblazeb2.com';

        if (keyId && appKey && bucketId && bucketName) {
            this.config = { keyId, applicationKey: appKey, bucketId, bucketName, endpoint };
            return await this.authorize();
        }

        console.log('[BackblazeStorage] No B2 config found, using Supabase Storage fallback');
        return false;
    }

    private async authorize(): Promise<boolean> {
        if (!this.config) return false;

        try {
            const credentials = btoa(`${this.config.keyId}:${this.config.applicationKey}`);
            const response = await fetch(`${this.config.endpoint}/b2api/v2/b2_authorize_account`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });

            if (!response.ok) {
                console.error('[BackblazeStorage] Authorization failed:', response.status);
                return false;
            }

            const data = await response.json();
            this.authToken = data.authorizationToken;
            this.apiUrl = data.apiUrl;
            this.downloadUrl = data.downloadUrl;

            // Get upload URL
            const uploadUrlResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
                method: 'POST',
                headers: {
                    'Authorization': this.authToken!,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bucketId: this.config.bucketId })
            });

            if (uploadUrlResponse.ok) {
                const uploadData = await uploadUrlResponse.json();
                this.uploadUrl = uploadData.uploadUrl;
                this.uploadAuthToken = uploadData.authorizationToken;
            }

            console.log('[BackblazeStorage] Authorized successfully');
            return true;
        } catch (error) {
            console.error('[BackblazeStorage] Authorization error:', error);
            return false;
        }
    }

    async uploadFile(
        file: File,
        folder: string = 'resources',
        onProgress?: (progress: number) => void
    ): Promise<UploadResult> {
        const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Use Supabase Storage fallback if B2 is not configured
        if (!this.config || !this.uploadUrl) {
            return await this.uploadToSupabase(file, fileName, onProgress);
        }

        return await this.uploadToB2(file, fileName, onProgress);
    }

    private async uploadToB2(
        file: File,
        fileName: string,
        onProgress?: (progress: number) => void
    ): Promise<UploadResult> {
        try {
            // Calculate SHA1 hash for B2
            const arrayBuffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const sha1Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            onProgress?.(10);

            const response = await fetch(this.uploadUrl!, {
                method: 'POST',
                headers: {
                    'Authorization': this.uploadAuthToken!,
                    'X-Bz-File-Name': encodeURIComponent(fileName),
                    'Content-Type': file.type || 'application/octet-stream',
                    'Content-Length': String(file.size),
                    'X-Bz-Content-Sha1': sha1Hash
                },
                body: arrayBuffer
            });

            onProgress?.(80);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const result = await response.json();

            // Construct public URL
            const fileUrl = `${this.downloadUrl}/file/${this.config!.bucketName}/${fileName}`;

            onProgress?.(100);

            // Save metadata to Supabase
            await this.saveMetadataToSupabase({
                title: file.name,
                fileName: fileName,
                fileSize: file.size,
                mimeType: file.type,
                storagePath: fileName,
                storageUrl: fileUrl,
                metadata: {
                    b2FileId: result.fileId,
                    b2FileName: result.fileName,
                    contentSha1: sha1Hash
                }
            });

            return {
                success: true,
                fileId: result.fileId,
                fileName: result.fileName,
                fileUrl: fileUrl
            };
        } catch (error) {
            console.error('[BackblazeStorage] B2 upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }

    private async uploadToSupabase(
        file: File,
        filePath: string,
        onProgress?: (progress: number) => void
    ): Promise<UploadResult> {
        try {
            onProgress?.(10);

            const { data, error } = await supabase.storage
                .from('resources')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            onProgress?.(80);

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath);

            onProgress?.(100);

            // Save metadata
            await this.saveMetadataToSupabase({
                title: file.name,
                fileName: filePath,
                fileSize: file.size,
                mimeType: file.type,
                storagePath: filePath,
                storageUrl: urlData.publicUrl,
                metadata: { storage: 'supabase' }
            });

            return {
                success: true,
                fileId: data.path,
                fileName: filePath,
                fileUrl: urlData.publicUrl
            };
        } catch (error) {
            console.error('[BackblazeStorage] Supabase upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }

    private async saveMetadataToSupabase(metadata: FileMetadata): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('resource_files' as any).insert({
            title: metadata.title,
            description: metadata.description || '',
            file_name: metadata.fileName,
            file_size: metadata.fileSize,
            mime_type: metadata.mimeType,
            storage_provider: this.config ? 'backblaze' : 'supabase',
            storage_path: metadata.storagePath,
            storage_url: metadata.storageUrl,
            thumbnail_url: metadata.thumbnailUrl,
            extracted_text: metadata.extractedText,
            metadata: metadata.metadata || {},
            uploaded_by: user?.id
        });
    }

    async deleteFile(filePath: string): Promise<boolean> {
        // For now, handle Supabase deletion
        try {
            const { error } = await supabase.storage
                .from('resources')
                .remove([filePath]);

            if (error) throw error;

            // Also delete metadata
            await supabase.from('resource_files' as any)
                .delete()
                .eq('storage_path', filePath);

            return true;
        } catch (error) {
            console.error('[BackblazeStorage] Delete error:', error);
            return false;
        }
    }

    getStorageMode(): string {
        return this.config ? 'backblaze' : 'supabase';
    }
}

export const backblazeStorage = new BackblazeStorageService();
export default backblazeStorage;
