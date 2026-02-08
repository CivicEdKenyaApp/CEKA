// Backblaze Storage Service - B2 Cloud Storage Integration
// Hybrid approach: B2 for primary storage, Supabase as fallback

import { supabase } from '@/integrations/supabase/client';
import { backblazeService, isB2Configured } from './backblazeService';

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

class BackblazeStorageService {
    private config: BackblazeConfig | null = null;
    private authToken: string | null = null;
    private apiUrl: string | null = null;
    private downloadUrl: string | null = null;
    private uploadUrl: string | null = null;
    private uploadAuthToken: string | null = null;
    private initialized = false;
    private initPromise: Promise<boolean> | null = null;

    async initialize(): Promise<boolean> {
        // Prevent multiple simultaneous initializations
        if (this.initPromise) return this.initPromise;
        if (this.initialized) return !!this.config;

        this.initPromise = this._doInitialize();
        return this.initPromise;
    }

    private async _doInitialize(): Promise<boolean> {
        try {
            // Sync with .env names
            const keyId = import.meta.env.VITE_B2_KEY_ID;
            const appKey = import.meta.env.VITE_B2_APP_KEY; // Fixed: was VITE_B2_APPLICATION_KEY
            const bucketName = import.meta.env.VITE_B2_BUCKET_NAME;
            const endpoint = import.meta.env.VITE_B2_ENDPOINT;
            const region = import.meta.env.VITE_B2_REGION;

            if (keyId && appKey && bucketName) {
                this.config = {
                    keyId,
                    applicationKey: appKey,
                    bucketId: '', // Not strictly needed for S3 API
                    bucketName,
                    endpoint: endpoint || 'https://s3.us-west-004.backblazeb2.com'
                };

                const ready = isB2Configured();
                this.initialized = true;
                return ready;
            }

            // Not configured - use Supabase fallback silently
            console.debug('[Storage] B2 not configured, using Supabase Storage');
            this.initialized = true;
            return false;
        } catch (error) {
            console.debug('[Storage] B2 init error, using Supabase fallback');
            this.initialized = true;
            return false;
        }
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
                console.debug('[Storage] B2 authorization failed:', response.status);
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

            console.debug('[Storage] B2 authorized successfully');
            return true;
        } catch (error) {
            console.debug('[Storage] B2 authorization error');
            return false;
        }
    }

    async uploadFile(
        file: File,
        folder: string = 'resources',
        onProgress?: (progress: number) => void
    ): Promise<UploadResult> {
        // Support deep paths (e.g. "carousels/special/2026")
        const cleanFolderName = folder.endsWith('/') ? folder.slice(0, -1) : folder;
        const fileName = `${cleanFolderName}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Ensure initialized
        await this.initialize();

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
            onProgress?.(10);

            // Use the S3-compatible backblazeService for much better reliability
            const result = await backblazeService.uploadFile(file, fileName, {
                contentType: file.type
            });

            onProgress?.(90);

            if (!result.success) {
                throw new Error(result.error);
            }

            const fileUrl = result.url || '';

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
                    provider: 'backblaze_s3',
                    s3_path: fileName
                }
            });

            return {
                success: true,
                fileName: fileName,
                fileUrl: fileUrl
            };
        } catch (error) {
            console.error('[Storage] B2 upload error:', error);
            // Fallback to Supabase
            return await this.uploadToSupabase(file, fileName, onProgress);
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
            console.error('[Storage] Supabase upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }

    private async saveMetadataToSupabase(metadata: FileMetadata): Promise<void> {
        try {
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
        } catch (error) {
            // Metadata save is non-blocking - log but don't fail
            console.debug('[Storage] Metadata save failed:', error);
        }
    }

    async deleteFile(filePath: string): Promise<boolean> {
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
            console.error('[Storage] Delete error:', error);
            return false;
        }
    }

    getStorageMode(): string {
        return this.config ? 'backblaze' : 'supabase';
    }

    isConfigured(): boolean {
        return !!this.config;
    }
}

const backblazeStorage = new BackblazeStorageService();
export default backblazeStorage;
