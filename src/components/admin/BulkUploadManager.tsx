// Bulk Upload Manager - Backblaze B2 Only + Supabase Metadata
// Uploads ONLY go to Backblaze, metadata syncs to Supabase

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Upload, FolderUp, FileText, Image, Video, Music, Archive,
    CheckCircle2, XCircle, Loader2, Trash2, Eye, RefreshCw,
    CloudUpload, Database, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Backblaze B2 Configuration
const B2_CONFIG = {
    keyId: import.meta.env.VITE_B2_KEY_ID || '',
    applicationKey: import.meta.env.VITE_B2_APPLICATION_KEY || '',
    bucketId: import.meta.env.VITE_B2_BUCKET_ID || '',
    bucketName: import.meta.env.VITE_B2_BUCKET_NAME || 'ceka-resources',
    endpoint: import.meta.env.VITE_B2_ENDPOINT || ''
};

interface UploadFile {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'extracting' | 'complete' | 'error';
    progress: number;
    error?: string;
    b2Url?: string;
    extractedText?: string;
    category: string;
    description: string;
}

interface B2AuthResponse {
    authorizationToken: string;
    apiUrl: string;
    downloadUrl: string;
}

interface B2UploadUrlResponse {
    uploadUrl: string;
    authorizationToken: string;
}

const BulkUploadManager: React.FC = () => {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [enableOCR, setEnableOCR] = useState(false);
    const [insertToResources, setInsertToResources] = useState(true);
    const [defaultCategory, setDefaultCategory] = useState('general');
    const [globalDescription, setGlobalDescription] = useState('');
    const [b2Auth, setB2Auth] = useState<B2AuthResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const isB2Configured = B2_CONFIG.keyId && B2_CONFIG.applicationKey && B2_CONFIG.bucketId;

    // Get file icon based on type
    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
        if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
        if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
        if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4" />;
        if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
        return <FileText className="h-4 w-4" />;
    };

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles) return;

        const newFiles: UploadFile[] = Array.from(selectedFiles).map((file) => ({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            status: 'pending',
            progress: 0,
            category: defaultCategory,
            description: globalDescription
        }));

        setFiles((prev) => [...prev, ...newFiles]);
        event.target.value = '';
    };

    // Handle drag and drop
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        const droppedItems = event.dataTransfer.items;

        const fileList: File[] = [];

        const processEntry = async (entry: FileSystemEntry) => {
            if (entry.isFile) {
                const fileEntry = entry as FileSystemFileEntry;
                return new Promise<File>((resolve) => {
                    fileEntry.file((file) => resolve(file));
                });
            } else if (entry.isDirectory) {
                const dirEntry = entry as FileSystemDirectoryEntry;
                const reader = dirEntry.createReader();
                return new Promise<File[]>((resolve) => {
                    reader.readEntries(async (entries) => {
                        const files: File[] = [];
                        for (const e of entries) {
                            const result = await processEntry(e);
                            if (Array.isArray(result)) {
                                files.push(...result);
                            } else {
                                files.push(result);
                            }
                        }
                        resolve(files);
                    });
                });
            }
            return null;
        };

        const processItems = async () => {
            for (let i = 0; i < droppedItems.length; i++) {
                const item = droppedItems[i];
                const entry = item.webkitGetAsEntry();
                if (entry) {
                    const result = await processEntry(entry);
                    if (result) {
                        if (Array.isArray(result)) {
                            fileList.push(...result);
                        } else {
                            fileList.push(result);
                        }
                    }
                }
            }

            if (fileList.length === 0) {
                for (let i = 0; i < droppedFiles.length; i++) {
                    fileList.push(droppedFiles[i]);
                }
            }

            const newFiles: UploadFile[] = fileList.map((file) => ({
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type || 'application/octet-stream',
                status: 'pending',
                progress: 0,
                category: defaultCategory,
                description: globalDescription
            }));

            setFiles((prev) => [...prev, ...newFiles]);
        };

        processItems();
    }, [defaultCategory, globalDescription]);

    // Authenticate with Backblaze B2
    const authenticateB2 = async (): Promise<B2AuthResponse | null> => {
        if (!isB2Configured) {
            toast({
                title: "Backblaze Not Configured",
                description: "Please set B2 environment variables",
                variant: "destructive"
            });
            return null;
        }

        if (b2Auth) return b2Auth;

        try {
            const credentials = btoa(`${B2_CONFIG.keyId}:${B2_CONFIG.applicationKey}`);

            const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });

            if (!response.ok) {
                throw new Error('B2 authentication failed');
            }

            const authData = await response.json();
            const auth: B2AuthResponse = {
                authorizationToken: authData.authorizationToken,
                apiUrl: authData.apiUrl,
                downloadUrl: authData.downloadUrl
            };

            setB2Auth(auth);
            return auth;
        } catch (error) {
            console.error('B2 auth error:', error);
            toast({
                title: "B2 Authentication Failed",
                description: "Check your Backblaze credentials",
                variant: "destructive"
            });
            return null;
        }
    };

    // Get B2 upload URL
    const getB2UploadUrl = async (auth: B2AuthResponse): Promise<B2UploadUrlResponse | null> => {
        try {
            const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
                method: 'POST',
                headers: {
                    'Authorization': auth.authorizationToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bucketId: B2_CONFIG.bucketId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get B2 upload URL');
            }

            return await response.json();
        } catch (error) {
            console.error('B2 upload URL error:', error);
            return null;
        }
    };

    // Upload single file to B2
    const uploadFileToB2 = async (
        uploadFile: UploadFile,
        uploadUrl: B2UploadUrlResponse,
        downloadUrl: string
    ): Promise<{ url: string; fileName: string } | null> => {
        try {
            const buffer = await uploadFile.file.arrayBuffer();
            const sha1 = await crypto.subtle.digest('SHA-1', buffer);
            const sha1Hex = Array.from(new Uint8Array(sha1))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            const timestamp = Date.now();
            const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const b2FileName = `uploads/${timestamp}_${safeName}`;

            const response = await fetch(uploadUrl.uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': uploadUrl.authorizationToken,
                    'Content-Type': uploadFile.type,
                    'Content-Length': uploadFile.size.toString(),
                    'X-Bz-File-Name': encodeURIComponent(b2FileName),
                    'X-Bz-Content-Sha1': sha1Hex
                },
                body: buffer
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const data = await response.json();
            const publicUrl = `${downloadUrl}/file/${B2_CONFIG.bucketName}/${b2FileName}`;

            return {
                url: publicUrl,
                fileName: b2FileName
            };
        } catch (error) {
            console.error('B2 upload error:', error);
            return null;
        }
    };

    // Extract text via OCR (Supabase Edge Function)
    const extractText = async (url: string): Promise<string | null> => {
        try {
            const { data, error } = await supabase.functions.invoke('extract-text', {
                body: { url }
            });

            if (error) throw error;
            return data?.text || null;
        } catch (error) {
            console.error('OCR error:', error);
            return null;
        }
    };

    // Save metadata to Supabase
    const saveMetadataToSupabase = async (
        uploadFile: UploadFile,
        b2Url: string,
        b2Path: string,
        extractedText?: string
    ) => {
        const { data: { user } } = await supabase.auth.getUser();

        const metadata = {
            title: uploadFile.name.replace(/\.[^/.]+$/, ''),
            description: uploadFile.description || `Uploaded via Bulk Upload Manager`,
            file_name: uploadFile.name,
            file_size: uploadFile.size,
            mime_type: uploadFile.type,
            storage_provider: 'backblaze',
            storage_path: b2Path,
            storage_url: b2Url,
            category: uploadFile.category,
            extracted_text: extractedText || null,
            uploaded_by: user?.id || null,
            metadata: {
                original_upload_time: new Date().toISOString(),
                ocr_enabled: enableOCR
            }
        };

        const { error } = await supabase
            .from('resource_files' as any)
            .insert(metadata);

        if (error) {
            console.error('Supabase metadata error:', error);
            throw error;
        }

        // Also insert to resources table if enabled
        if (insertToResources) {
            await supabase
                .from('resources')
                .insert({
                    title: metadata.title,
                    description: metadata.description,
                    resource_type: getCategoryType(uploadFile.category),
                    url: b2Url,
                    thumbnail_url: uploadFile.type.startsWith('image/') ? b2Url : null,
                    published: true
                });
        }
    };

    const getCategoryType = (category: string): string => {
        const typeMap: Record<string, string> = {
            'general': 'document',
            'constitution': 'legal',
            'legislation': 'legal',
            'policy': 'policy',
            'educational': 'educational',
            'media': 'media'
        };
        return typeMap[category] || 'document';
    };

    // Update file status
    const updateFileStatus = (
        id: string,
        updates: Partial<UploadFile>
    ) => {
        setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
        );
    };

    // Upload all files
    const handleUploadAll = async () => {
        if (!isB2Configured) {
            toast({
                title: "Backblaze Not Configured",
                description: "Please configure B2 environment variables to enable uploads",
                variant: "destructive"
            });
            return;
        }

        const pendingFiles = files.filter((f) => f.status === 'pending');
        if (pendingFiles.length === 0) {
            toast({ title: "No files to upload", variant: "destructive" });
            return;
        }

        setIsUploading(true);

        try {
            // Authenticate with B2
            const auth = await authenticateB2();
            if (!auth) {
                setIsUploading(false);
                return;
            }

            // Process files in batches of 3
            const batchSize = 3;
            for (let i = 0; i < pendingFiles.length; i += batchSize) {
                const batch = pendingFiles.slice(i, i + batchSize);

                await Promise.all(
                    batch.map(async (uploadFile) => {
                        try {
                            updateFileStatus(uploadFile.id, { status: 'uploading', progress: 10 });

                            // Get upload URL
                            const uploadUrl = await getB2UploadUrl(auth);
                            if (!uploadUrl) {
                                throw new Error('Failed to get upload URL');
                            }

                            updateFileStatus(uploadFile.id, { progress: 30 });

                            // Upload to B2
                            const result = await uploadFileToB2(uploadFile, uploadUrl, auth.downloadUrl);
                            if (!result) {
                                throw new Error('Upload to B2 failed');
                            }

                            updateFileStatus(uploadFile.id, {
                                progress: 60,
                                b2Url: result.url
                            });

                            // OCR if enabled and applicable
                            let extractedText: string | undefined;
                            if (enableOCR && (
                                uploadFile.type === 'application/pdf' ||
                                uploadFile.type.startsWith('image/')
                            )) {
                                updateFileStatus(uploadFile.id, { status: 'extracting', progress: 75 });
                                const text = await extractText(result.url);
                                if (text) {
                                    extractedText = text;
                                    updateFileStatus(uploadFile.id, { extractedText: text });
                                }
                            }

                            updateFileStatus(uploadFile.id, { progress: 85 });

                            // Save metadata to Supabase
                            await saveMetadataToSupabase(
                                uploadFile,
                                result.url,
                                result.fileName,
                                extractedText
                            );

                            updateFileStatus(uploadFile.id, {
                                status: 'complete',
                                progress: 100
                            });
                        } catch (error) {
                            console.error(`Upload error for ${uploadFile.name}:`, error);
                            updateFileStatus(uploadFile.id, {
                                status: 'error',
                                error: error instanceof Error ? error.message : 'Upload failed',
                                progress: 0
                            });
                        }
                    })
                );
            }

            const completedCount = files.filter((f) => f.status === 'complete').length;
            toast({
                title: "Upload Complete",
                description: `${completedCount} files uploaded to Backblaze B2`
            });
        } catch (error) {
            console.error('Bulk upload error:', error);
            toast({
                title: "Upload Error",
                description: "Some files failed to upload",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Remove file from queue
    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    // Clear completed files
    const clearCompleted = () => {
        setFiles((prev) => prev.filter((f) => f.status !== 'complete'));
    };

    // Clear all files
    const clearAll = () => {
        setFiles([]);
    };

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const completedCount = files.filter((f) => f.status === 'complete').length;
    const errorCount = files.filter((f) => f.status === 'error').length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CloudUpload className="h-5 w-5 text-primary" />
                        Bulk Upload Manager
                    </CardTitle>
                    <CardDescription>
                        Upload files directly to Backblaze B2. Metadata syncs to Supabase.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Configuration Status */}
                    <div className={cn(
                        "flex items-center gap-3 p-4 rounded-xl",
                        isB2Configured
                            ? "bg-emerald-500/10 border border-emerald-500/20"
                            : "bg-amber-500/10 border border-amber-500/20"
                    )}>
                        {isB2Configured ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="font-medium text-emerald-500">Backblaze B2 Connected</p>
                                    <p className="text-xs text-muted-foreground">Bucket: {B2_CONFIG.bucketName}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5 text-amber-500" />
                                <div>
                                    <p className="font-medium text-amber-500">Backblaze Not Configured</p>
                                    <p className="text-xs text-muted-foreground">
                                        Set VITE_B2_KEY_ID, VITE_B2_APPLICATION_KEY, VITE_B2_BUCKET_ID in .env
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Drop Zone */}
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer",
                            "hover:border-primary hover:bg-primary/5",
                            isUploading && "pointer-events-none opacity-50"
                        )}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-primary/10">
                                <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">Drop files or folders here</p>
                                <p className="text-sm text-muted-foreground">or click to browse</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Files
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        folderInputRef.current?.click();
                                    }}
                                >
                                    <FolderUp className="h-4 w-4 mr-2" />
                                    Folder
                                </Button>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <input
                            ref={folderInputRef}
                            type="file"
                            multiple
                            webkitdirectory=""
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Default Category</Label>
                            <Select value={defaultCategory} onValueChange={setDefaultCategory}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="constitution">Constitution</SelectItem>
                                    <SelectItem value="legislation">Legislation</SelectItem>
                                    <SelectItem value="policy">Policy</SelectItem>
                                    <SelectItem value="educational">Educational</SelectItem>
                                    <SelectItem value="media">Media</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-3 p-3 border rounded-xl">
                            <Checkbox
                                id="ocr"
                                checked={enableOCR}
                                onCheckedChange={(checked) => setEnableOCR(checked === true)}
                            />
                            <div>
                                <Label htmlFor="ocr" className="cursor-pointer flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> Enable OCR
                                </Label>
                                <p className="text-xs text-muted-foreground">Extract text from PDFs/images</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 border rounded-xl">
                            <Checkbox
                                id="resources"
                                checked={insertToResources}
                                onCheckedChange={(checked) => setInsertToResources(checked === true)}
                            />
                            <div>
                                <Label htmlFor="resources" className="cursor-pointer flex items-center gap-1">
                                    <Database className="h-3 w-3" /> Add to Resources
                                </Label>
                                <p className="text-xs text-muted-foreground">Insert into resources table</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Global Description (optional)</Label>
                        <Textarea
                            placeholder="Description applied to all uploaded files..."
                            value={globalDescription}
                            onChange={(e) => setGlobalDescription(e.target.value)}
                            className="rounded-xl min-h-[80px]"
                        />
                    </div>

                    {/* File Queue */}
                    {files.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold">
                                        {files.length} files ({formatSize(totalSize)})
                                    </span>
                                    {completedCount > 0 && (
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                                            {completedCount} done
                                        </Badge>
                                    )}
                                    {errorCount > 0 && (
                                        <Badge variant="secondary" className="bg-red-500/10 text-red-500">
                                            {errorCount} failed
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {completedCount > 0 && (
                                        <Button variant="ghost" size="sm" onClick={clearCompleted}>
                                            Clear Completed
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={clearAll}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear All
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="h-[300px] border rounded-xl">
                                <div className="p-4 space-y-2">
                                    {files.map((file) => (
                                        <div
                                            key={file.id}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                                                file.status === 'complete' && "bg-emerald-500/5 border-emerald-500/20",
                                                file.status === 'error' && "bg-red-500/5 border-red-500/20",
                                                file.status === 'uploading' && "bg-primary/5 border-primary/20"
                                            )}
                                        >
                                            <div className="text-muted-foreground">
                                                {getFileIcon(file.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{file.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{formatSize(file.size)}</span>
                                                    <span>•</span>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                        {file.category}
                                                    </Badge>
                                                </div>
                                                {(file.status === 'uploading' || file.status === 'extracting') && (
                                                    <Progress value={file.progress} className="h-1 mt-2" />
                                                )}
                                                {file.error && (
                                                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {file.status === 'pending' && (
                                                    <Badge variant="outline">Pending</Badge>
                                                )}
                                                {file.status === 'uploading' && (
                                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                )}
                                                {file.status === 'extracting' && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Sparkles className="h-3 w-3" /> OCR
                                                    </Badge>
                                                )}
                                                {file.status === 'complete' && (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                )}
                                                {file.status === 'error' && (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}

                                                {file.b2Url && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => window.open(file.b2Url, '_blank')}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                {file.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600"
                                                        onClick={() => removeFile(file.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex justify-end gap-4">
                        <Button
                            size="lg"
                            className="rounded-xl gap-2"
                            disabled={isUploading || files.filter(f => f.status === 'pending').length === 0 || !isB2Configured}
                            onClick={handleUploadAll}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <CloudUpload className="h-4 w-4" />
                                    Upload to Backblaze ({files.filter(f => f.status === 'pending').length} files)
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BulkUploadManager;

// Type declaration for folder input
declare module 'react' {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        webkitdirectory?: string;
    }
}
