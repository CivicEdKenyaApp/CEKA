// Bulk Upload Manager - Backblaze B2 Primary with Supabase Metadata Sync
// Handles folder uploads, OCR extraction, and resource cataloging

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
    Upload, Folder, File, X, CheckCircle, XCircle, Clock, RefreshCw,
    Image, FileText, Music, Video, Archive, Trash2, Eye
} from 'lucide-react';
import backblazeStorage from '@/services/backblazeStorage';
import { supabase } from '@/integrations/supabase/client';

interface UploadFile {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    url?: string;
    error?: string;
    extractedText?: string;
}

const STORAGE_FOLDERS = [
    { value: 'resources', label: 'Resources' },
    { value: 'documents', label: 'Documents' },
    { value: 'media', label: 'Media' },
    { value: 'legislation', label: 'Legislation' }
];

const CATEGORIES = [
    { value: 'general', label: 'General' },
    { value: 'constitution', label: 'Constitution' },
    { value: 'legislation', label: 'Legislation' },
    { value: 'reports', label: 'Reports' },
    { value: 'education', label: 'Education' },
    { value: 'media', label: 'Media' }
];

const BulkUploadManager = () => {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [targetFolder, setTargetFolder] = useState('resources');
    const [category, setCategory] = useState('general');
    const [enableOcr, setEnableOcr] = useState(false);
    const [insertToResources, setInsertToResources] = useState(false);
    const [globalDescription, setGlobalDescription] = useState('');
    const [backblazeReady, setBackblazeReady] = useState<boolean | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Check Backblaze on mount
    React.useEffect(() => {
        checkBackblaze();
    }, []);

    const checkBackblaze = async () => {
        try {
            const ready = await backblazeStorage.initialize();
            setBackblazeReady(ready);
        } catch (error) {
            setBackblazeReady(false);
        }
    };

    // Add files from input
    const handleFilesSelected = useCallback((selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const newFiles: UploadFile[] = Array.from(selectedFiles).map((file) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            progress: 0
        }));

        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const items = e.dataTransfer.items;

        if (items) {
            const filesList: File[] = [];
            const traverseDirectory = async (entry: FileSystemEntry): Promise<void> => {
                if (entry.isFile) {
                    const fileEntry = entry as FileSystemFileEntry;
                    return new Promise((resolve) => {
                        fileEntry.file((file) => {
                            filesList.push(file);
                            resolve();
                        });
                    });
                } else if (entry.isDirectory) {
                    const dirEntry = entry as FileSystemDirectoryEntry;
                    const reader = dirEntry.createReader();
                    return new Promise((resolve) => {
                        reader.readEntries(async (entries) => {
                            for (const ent of entries) {
                                await traverseDirectory(ent);
                            }
                            resolve();
                        });
                    });
                }
            };

            const processItems = async () => {
                for (let i = 0; i < items.length; i++) {
                    const entry = items[i].webkitGetAsEntry();
                    if (entry) {
                        await traverseDirectory(entry);
                    }
                }
                const dt = new DataTransfer();
                filesList.forEach((f) => dt.items.add(f));
                handleFilesSelected(dt.files);
            };

            processItems();
        } else {
            handleFilesSelected(e.dataTransfer.files);
        }
    }, [handleFilesSelected]);

    // Upload single file to Backblaze
    const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
        setFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 10 } : f))
        );

        try {
            // Upload to Backblaze
            const result = await backblazeStorage.uploadFile(
                uploadFile.file,
                targetFolder,
                (progress) => {
                    setFiles((prev) =>
                        prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
                    );
                }
            );

            if (!result.success) {
                throw new Error(result.error || 'Upload failed');
            }

            // OCR extraction if enabled
            let extractedText = '';
            if (enableOcr && isOcrSupported(uploadFile.type)) {
                try {
                    const { data: ocrData } = await supabase.functions.invoke('extract-text', {
                        body: { url: result.fileUrl, mimeType: uploadFile.type }
                    });
                    extractedText = ocrData?.text || '';
                } catch (ocrError) {
                    console.warn('OCR extraction failed:', ocrError);
                }
            }

            // Insert metadata to Supabase if enabled
            if (insertToResources) {
                await supabase.from('resources').insert({
                    title: uploadFile.name.replace(/\.[^/.]+$/, ''),
                    description: globalDescription || 'Uploaded via Bulk Upload Manager',
                    url: result.fileUrl || '',
                    type: uploadFile.type.split('/')[0] || 'document',
                    category
                });
            }

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'success', progress: 100, url: result.fileUrl, extractedText }
                        : f
                )
            );
        } catch (error: any) {
            console.error('Upload error:', error);
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'error', progress: 0, error: error.message }
                        : f
                )
            );
        }
    };

    // Check if file type supports OCR
    const isOcrSupported = (mimeType: string): boolean => {
        return mimeType.startsWith('image/') || mimeType === 'application/pdf';
    };

    // Start upload
    const startUpload = async () => {
        const pending = files.filter((f) => f.status === 'pending');
        if (pending.length === 0) {
            toast({ title: 'No files', description: 'Add files to upload', variant: 'destructive' });
            return;
        }

        if (!backblazeReady) {
            toast({
                title: 'Backblaze Not Ready',
                description: 'Check your B2 credentials in environment variables',
                variant: 'destructive'
            });
            return;
        }

        setUploading(true);

        // Process in batches of 3
        const batchSize = 3;
        for (let i = 0; i < pending.length; i += batchSize) {
            const batch = pending.slice(i, i + batchSize);
            await Promise.all(batch.map(uploadFile));
        }

        setUploading(false);
        toast({ title: 'Upload Complete', description: `${pending.length} files processed` });
    };

    // Remove file
    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    // Clear completed
    const clearCompleted = () => {
        setFiles((prev) => prev.filter((f) => f.status !== 'success'));
    };

    // Get file icon
    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
        if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
        if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
        if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4" />;
        if (type.includes('zip') || type.includes('archive')) return <Archive className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    // Format file size
    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Get status badge
    const getStatusBadge = (file: UploadFile) => {
        switch (file.status) {
            case 'pending':
                return <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'uploading':
                return <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />{file.progress}%</Badge>;
            case 'success':
                return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Done</Badge>;
            case 'error':
                return <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Bulk Upload Manager</h2>
                    <p className="text-muted-foreground text-sm">
                        Upload files directly to Backblaze B2. Metadata syncs to Supabase.
                    </p>
                </div>
                {backblazeReady !== null && (
                    <Badge variant={backblazeReady ? "default" : "destructive"} className="rounded-xl">
                        {backblazeReady ? 'Backblaze Ready' : 'Backblaze Not Configured'}
                    </Badge>
                )}
            </div>

            {/* Upload Options */}
            <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <Label>Target Folder</Label>
                            <Select value={targetFolder} onValueChange={setTargetFolder}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STORAGE_FOLDERS.map((f) => (
                                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Default Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="ocr"
                                    checked={enableOcr}
                                    onCheckedChange={(c) => setEnableOcr(!!c)}
                                />
                                <Label htmlFor="ocr" className="text-sm cursor-pointer">Enable OCR</Label>
                            </div>
                        </div>
                        <div className="flex items-end gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="resources"
                                    checked={insertToResources}
                                    onCheckedChange={(c) => setInsertToResources(!!c)}
                                />
                                <Label htmlFor="resources" className="text-sm cursor-pointer">Add to Resources</Label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Global Description (optional)</Label>
                        <Textarea
                            value={globalDescription}
                            onChange={(e) => setGlobalDescription(e.target.value)}
                            placeholder="Description applied to all uploaded files..."
                            className="min-h-[60px]"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Drop Zone */}
            <Card
                className="border-2 border-dashed border-muted-foreground/25 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <CardContent className="py-12 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">
                        Drop files or folders here or click to browse
                    </p>
                    <div className="flex justify-center gap-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFilesSelected(e.target.files)}
                        />
                        <input
                            ref={folderInputRef}
                            type="file"
                            /* @ts-ignore */
                            webkitdirectory=""
                            directory=""
                            multiple
                            className="hidden"
                            onChange={(e) => handleFilesSelected(e.target.files)}
                        />
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-xl"
                        >
                            <File className="h-4 w-4 mr-2" />
                            Files
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => folderInputRef.current?.click()}
                            className="rounded-xl"
                        >
                            <Folder className="h-4 w-4 mr-2" />
                            Folder
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
                <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Upload Queue</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={clearCompleted}
                                    className="rounded-xl"
                                >
                                    Clear Completed
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={startUpload}
                                    disabled={uploading || !backblazeReady}
                                    className="rounded-xl"
                                >
                                    {uploading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload to Backblaze ({files.filter(f => f.status === 'pending').length} files)
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                            >
                                <div className="text-muted-foreground">
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                                    {file.status === 'uploading' && (
                                        <Progress value={file.progress} className="h-1 mt-1" />
                                    )}
                                    {file.error && (
                                        <p className="text-xs text-red-500 mt-1">{file.error}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(file)}
                                    {file.status === 'success' && file.url && (
                                        <Button size="sm" variant="ghost" asChild>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                <Eye className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeFile(file.id)}
                                        disabled={file.status === 'uploading'}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* OCR Info */}
            {enableOcr && (
                <Card className="border-0 shadow-sm bg-amber-500/10">
                    <CardContent className="py-4">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            <strong>OCR Deep Search:</strong> When enabled, text will be extracted from PDFs and images
                            and stored alongside your files. This enables deep search across all your uploaded content.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BulkUploadManager;
