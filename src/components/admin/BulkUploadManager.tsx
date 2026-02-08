// Bulk Upload Manager - Enhanced with Backblaze Storage, OCR, and Progress Tracking
// Supports folder/file uploads with automatic metadata sync

import React, { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
    Upload, Folder, FileText, Image, Video, File,
    CheckCircle, XCircle, AlertCircle, Clock, Trash2,
    RefreshCw, Search, Database, Cloud, Zap, FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import storageService from '@/services/storageService';

interface UploadFile {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
    progress: number;
    url?: string;
    error?: string;
    extractedText?: string;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
    pdf: <FileText className="h-4 w-4 text-red-500" />,
    doc: <FileText className="h-4 w-4 text-blue-500" />,
    docx: <FileText className="h-4 w-4 text-blue-500" />,
    jpg: <Image className="h-4 w-4 text-green-500" />,
    jpeg: <Image className="h-4 w-4 text-green-500" />,
    png: <Image className="h-4 w-4 text-green-500" />,
    gif: <Image className="h-4 w-4 text-purple-500" />,
    mp4: <Video className="h-4 w-4 text-pink-500" />,
    webm: <Video className="h-4 w-4 text-pink-500" />,
    default: <File className="h-4 w-4 text-slate-500" />
};

const BulkUploadManager: React.FC = () => {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [targetFolder, setTargetFolder] = useState('resources');
    const [enableOcr, setEnableOcr] = useState(false);
    const [insertToResources, setInsertToResources] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Get file icon
    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        return FILE_ICONS[ext] || FILE_ICONS.default;
    };

    // Handle file selection
    const handleFilesSelected = useCallback((fileList: FileList | null) => {
        if (!fileList) return;

        const newFiles: UploadFile[] = Array.from(fileList).map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            progress: 0
        }));

        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    // Drag and drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const items = e.dataTransfer.items;
        const filePromises: Promise<File>[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (item) {
                if (item.isFile) {
                    filePromises.push(new Promise((resolve) => {
                        (item as FileSystemFileEntry).file(resolve);
                    }));
                } else if (item.isDirectory) {
                    traverseDirectory(item as FileSystemDirectoryEntry, filePromises);
                }
            }
        }

        Promise.all(filePromises).then(files => {
            const uploadFiles: UploadFile[] = files.map(file => ({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'pending',
                progress: 0
            }));
            setFiles(prev => [...prev, ...uploadFiles]);
        });
    };

    // Traverse directory recursively
    const traverseDirectory = (entry: FileSystemDirectoryEntry, filePromises: Promise<File>[]) => {
        const reader = entry.createReader();
        reader.readEntries(entries => {
            entries.forEach(entry => {
                if (entry.isFile) {
                    filePromises.push(new Promise((resolve) => {
                        (entry as FileSystemFileEntry).file(resolve);
                    }));
                } else if (entry.isDirectory) {
                    traverseDirectory(entry as FileSystemDirectoryEntry, filePromises);
                }
            });
        });
    };

    // Upload single file
    const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
        try {
            // Update status to uploading
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 10 } : f
            ));

            // Upload to storage
            const result = await storageService.upload(uploadFile.file, uploadFile.name, {
                folder: targetFolder,
                onProgress: (progress) => {
                    setFiles(prev => prev.map(f =>
                        f.id === uploadFile.id ? { ...f, progress } : f
                    ));
                }
            });

            if (!result.success) {
                throw new Error(result.error || 'Upload failed');
            }

            // OCR extraction if enabled
            let extractedText = '';
            if (enableOcr && ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'].includes(uploadFile.type)) {
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id ? { ...f, status: 'processing' as const, progress: 80 } : f
                ));

                try {
                    const { data: ocrData, error: ocrError } = await supabase.functions.invoke('extract-text', {
                        body: { fileUrl: result.url, fileType: uploadFile.type }
                    });

                    if (!ocrError && ocrData?.text) {
                        extractedText = ocrData.text;
                    }
                } catch (ocrErr) {
                    console.warn('OCR extraction failed:', ocrErr);
                }
            }

            // Insert into resources table if enabled
            if (insertToResources) {
                await supabase.from('resources' as any).insert({
                    title: uploadFile.name.replace(/\.[^.]+$/, ''),
                    file_url: result.url,
                    file_path: result.path,
                    file_type: uploadFile.type,
                    file_size: uploadFile.size,
                    extracted_text: extractedText || null,
                    category: 'uploaded',
                    created_at: new Date().toISOString()
                });
            }

            // Update status to success
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id
                    ? { ...f, status: 'success' as const, progress: 100, url: result.url, extractedText }
                    : f
            ));

        } catch (error: any) {
            console.error('Upload error:', error);
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id
                    ? { ...f, status: 'error' as const, progress: 0, error: error.message }
                    : f
            ));
        }
    };

    // Start all uploads
    const startUpload = async () => {
        const pendingFiles = files.filter(f => f.status === 'pending');
        if (pendingFiles.length === 0) {
            toast({ title: "No files", description: "Add files to upload first" });
            return;
        }

        setUploading(true);

        // Process files with concurrency limit
        const concurrency = 3;
        for (let i = 0; i < pendingFiles.length; i += concurrency) {
            const batch = pendingFiles.slice(i, i + concurrency);
            await Promise.all(batch.map(f => uploadFile(f)));
        }

        setUploading(false);

        const successful = files.filter(f => f.status === 'success').length;
        const failed = files.filter(f => f.status === 'error').length;

        toast({
            title: "Upload Complete",
            description: `${successful} succeeded, ${failed} failed`,
            variant: failed > 0 ? "destructive" : "default"
        });
    };

    // Remove file from list
    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    // Clear completed files
    const clearCompleted = () => {
        setFiles(prev => prev.filter(f => f.status !== 'success'));
    };

    // Clear all files
    const clearAll = () => {
        setFiles([]);
    };

    // Retry failed uploads
    const retryFailed = () => {
        setFiles(prev => prev.map(f =>
            f.status === 'error' ? { ...f, status: 'pending' as const, progress: 0, error: undefined } : f
        ));
    };

    const stats = {
        total: files.length,
        pending: files.filter(f => f.status === 'pending').length,
        uploading: files.filter(f => f.status === 'uploading' || f.status === 'processing').length,
        success: files.filter(f => f.status === 'success').length,
        error: files.filter(f => f.status === 'error').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Bulk Upload Manager</h2>
                <p className="text-sm text-muted-foreground">
                    Upload folders and files with automatic OCR text extraction for deep search
                </p>
            </div>

            {/* Settings */}
            <Card className="rounded-2xl">
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Target Storage Folder</Label>
                        <Select value={targetFolder} onValueChange={setTargetFolder}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="resources">Resources</SelectItem>
                                <SelectItem value="documents">Documents</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="legislation">Legislation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                        <Checkbox
                            id="enableOcr"
                            checked={enableOcr}
                            onCheckedChange={(checked) => setEnableOcr(!!checked)}
                        />
                        <Label htmlFor="enableOcr" className="cursor-pointer flex items-center gap-2">
                            <FileSearch className="h-4 w-4 text-blue-500" />
                            Enable OCR Text Extraction
                        </Label>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                        <Checkbox
                            id="insertToResources"
                            checked={insertToResources}
                            onCheckedChange={(checked) => setInsertToResources(!!checked)}
                        />
                        <Label htmlFor="insertToResources" className="cursor-pointer flex items-center gap-2">
                            <Database className="h-4 w-4 text-emerald-500" />
                            Insert into Resources Table
                        </Label>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                        <Badge variant="outline" className="gap-1">
                            <Cloud className="h-3 w-3" />
                            {storageService.getStorageProvider() === 'backblaze' ? 'Backblaze B2' : 'Supabase Storage'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Drop Zone */}
            <Card
                className={cn(
                    "rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
                )}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <CardContent className="py-12 text-center">
                    <input
                        ref={folderInputRef}
                        type="file"
                        // @ts-ignore - webkitdirectory is not in types
                        webkitdirectory="true"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFilesSelected(e.target.files)}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFilesSelected(e.target.files)}
                    />

                    <Folder className={cn(
                        "h-12 w-12 mx-auto mb-4 transition-colors",
                        isDragging ? "text-primary" : "text-muted-foreground"
                    )} />

                    <p className="text-muted-foreground mb-4">
                        Drop a folder or click to select
                    </p>

                    <div className="flex gap-2 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => folderInputRef.current?.click()}
                            className="rounded-xl gap-2"
                        >
                            <Folder className="h-4 w-4" /> Select Folder
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-xl gap-2"
                        >
                            <Upload className="h-4 w-4" /> Add Individual Files
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                        Supports: PDF, DOC, Images, Videos, and more
                    </p>
                </CardContent>
            </Card>

            {/* OCR Info */}
            {enableOcr && (
                <Card className="rounded-xl bg-blue-500/5 border-blue-500/20">
                    <CardContent className="py-4 flex items-start gap-3">
                        <Search className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-500">OCR Deep Search</h4>
                            <p className="text-sm text-muted-foreground">
                                When enabled, text will be extracted from PDFs and images and stored alongside your files.
                                This enables deep search across all your uploaded content.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats & Actions */}
            {files.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <Badge variant="outline">{stats.total} files</Badge>
                        <Badge className="bg-yellow-500/20 text-yellow-600">{stats.pending} pending</Badge>
                        <Badge className="bg-blue-500/20 text-blue-600">{stats.uploading} active</Badge>
                        <Badge className="bg-emerald-500/20 text-emerald-600">{stats.success} done</Badge>
                        {stats.error > 0 && (
                            <Badge className="bg-red-500/20 text-red-600">{stats.error} failed</Badge>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={startUpload}
                            disabled={uploading || stats.pending === 0}
                            className="rounded-xl gap-2"
                        >
                            {uploading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Zap className="h-4 w-4" />
                            )}
                            {uploading ? 'Uploading...' : 'Start Upload'}
                        </Button>
                        {stats.error > 0 && (
                            <Button variant="outline" onClick={retryFailed} className="rounded-xl gap-2">
                                <RefreshCw className="h-4 w-4" /> Retry Failed
                            </Button>
                        )}
                        {stats.success > 0 && (
                            <Button variant="outline" onClick={clearCompleted} className="rounded-xl gap-2">
                                <CheckCircle className="h-4 w-4" /> Clear Completed
                            </Button>
                        )}
                        <Button variant="ghost" onClick={clearAll} className="rounded-xl text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* File List */}
            <div className="space-y-2">
                <AnimatePresence>
                    {files.map((file) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <Card className={cn(
                                "rounded-xl transition-all",
                                file.status === 'success' && "bg-emerald-500/5 border-emerald-500/20",
                                file.status === 'error' && "bg-red-500/5 border-red-500/20"
                            )}>
                                <CardContent className="py-3 flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        {getFileIcon(file.name)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">{file.name}</span>
                                            <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                                        </div>

                                        {(file.status === 'uploading' || file.status === 'processing') && (
                                            <Progress value={file.progress} className="h-1 mt-1" />
                                        )}

                                        {file.error && (
                                            <p className="text-xs text-red-500 mt-1">{file.error}</p>
                                        )}

                                        {file.extractedText && (
                                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                                OCR: {file.extractedText.slice(0, 100)}...
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {file.status === 'pending' && (
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        {(file.status === 'uploading' || file.status === 'processing') && (
                                            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                                        )}
                                        {file.status === 'success' && (
                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        )}
                                        {file.status === 'error' && (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(file.id)}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {files.length === 0 && (
                <Card className="rounded-2xl border-dashed">
                    <CardContent className="py-12 text-center">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No files added yet. Drop files or folders above to get started.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BulkUploadManager;
