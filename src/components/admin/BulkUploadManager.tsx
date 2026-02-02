// Admin Bulk Upload Manager with OCR Support
// Supports folder uploads, multiple file types, and text extraction for deep search

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { storageService } from '@/services/storageService';
import { supabase } from '@/integrations/supabase/client';
import {
    Upload, FolderUp, FileText, Image, Video, File, CheckCircle, XCircle,
    Loader2, Search, Database, Sparkles, AlertTriangle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Supported file types
const SUPPORTED_EXTENSIONS = {
    documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    videos: ['.mp4', '.webm', '.mov', '.avi'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a'],
    data: ['.json', '.csv', '.xlsx', '.xls']
};

interface UploadedFile {
    file: File;
    status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
    progress: number;
    url?: string;
    extractedText?: string;
    error?: string;
}

const BulkUploadManager: React.FC = () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [enableOCR, setEnableOCR] = useState(true);
    const [targetFolder, setTargetFolder] = useState('resources');
    const [insertToDatabase, setInsertToDatabase] = useState(true);
    const { toast } = useToast();

    // Handle file/folder selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles: UploadedFile[] = selectedFiles.map(file => ({
            file,
            status: 'pending',
            progress: 0
        }));
        setFiles(prev => [...prev, ...newFiles]);
    };

    // Get file icon based on extension
    const getFileIcon = (filename: string) => {
        const ext = '.' + filename.split('.').pop()?.toLowerCase();
        if (SUPPORTED_EXTENSIONS.documents.includes(ext)) return <FileText className="h-4 w-4" />;
        if (SUPPORTED_EXTENSIONS.images.includes(ext)) return <Image className="h-4 w-4" />;
        if (SUPPORTED_EXTENSIONS.videos.includes(ext)) return <Video className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    // Extract text using OCR (calls Supabase Edge Function)
    const extractTextFromFile = async (file: File): Promise<string | null> => {
        if (!enableOCR) return null;

        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const ocrFormats = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];

        if (!ocrFormats.includes(ext)) return null;

        try {
            // Convert file to base64
            const buffer = await file.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

            const { data, error } = await supabase.functions.invoke('extract-text', {
                body: {
                    fileData: base64,
                    filename: file.name,
                    mimeType: file.type
                }
            });

            if (error) throw error;
            return data?.text || null;
        } catch (err) {
            console.warn('OCR extraction failed for', file.name, err);
            return null;
        }
    };

    // Upload a single file
    const uploadFile = async (uploadedFile: UploadedFile, index: number) => {
        // Update status to uploading
        setFiles(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], status: 'uploading', progress: 10 };
            return updated;
        });

        try {
            // Upload to storage
            const path = `${targetFolder}/${Date.now()}-${uploadedFile.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const result = await storageService.upload(uploadedFile.file, path);

            if (!result.success) throw new Error(result.error);

            setFiles(prev => {
                const updated = [...prev];
                updated[index] = { ...updated[index], progress: 50, status: 'processing' };
                return updated;
            });

            // Extract text if OCR enabled
            let extractedText: string | null = null;
            if (enableOCR) {
                extractedText = await extractTextFromFile(uploadedFile.file);
            }

            setFiles(prev => {
                const updated = [...prev];
                updated[index] = { ...updated[index], progress: 75 };
                return updated;
            });

            // Insert into database if enabled
            if (insertToDatabase) {
                const ext = '.' + uploadedFile.file.name.split('.').pop()?.toLowerCase();
                let fileType = 'document';
                if (SUPPORTED_EXTENSIONS.images.includes(ext)) fileType = 'image';
                if (SUPPORTED_EXTENSIONS.videos.includes(ext)) fileType = 'video';

                await supabase.from('resources').insert({
                    title: uploadedFile.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                    description: extractedText?.slice(0, 500) || 'Uploaded resource',
                    type: fileType,
                    url: result.url,
                    category: 'General',
                    file_size: uploadedFile.file.size,
                    extracted_text: extractedText,
                    created_at: new Date().toISOString()
                });
            }

            setFiles(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    status: 'success',
                    progress: 100,
                    url: result.url,
                    extractedText: extractedText || undefined
                };
                return updated;
            });

        } catch (error) {
            console.error('Upload error:', error);
            setFiles(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Upload failed'
                };
                return updated;
            });
        }
    };

    // Start bulk upload
    const startUpload = async () => {
        setUploading(true);

        const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');

        for (let i = 0; i < files.length; i++) {
            if (files[i].status === 'pending' || files[i].status === 'error') {
                await uploadFile(files[i], i);
            }
        }

        const successCount = files.filter(f => f.status === 'success').length;
        const errorCount = files.filter(f => f.status === 'error').length;

        toast({
            title: 'Upload Complete',
            description: `${successCount} files uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
            variant: errorCount > 0 ? 'destructive' : 'default'
        });

        setUploading(false);
    };

    // Clear completed files
    const clearCompleted = () => {
        setFiles(prev => prev.filter(f => f.status !== 'success'));
    };

    const pendingCount = files.filter(f => f.status === 'pending').length;
    const successCount = files.filter(f => f.status === 'success').length;
    const errorCount = files.filter(f => f.status === 'error').length;

    return (
        <Card className="border-0 shadow-lg bg-white dark:bg-white/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FolderUp className="h-5 w-5 text-kenya-green" />
                    Bulk Upload Manager
                </CardTitle>
                <CardDescription>
                    Upload folders and files with automatic OCR text extraction for deep search
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Upload Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <div className="space-y-2">
                        <Label>Target Storage Folder</Label>
                        <Select value={targetFolder} onValueChange={setTargetFolder}>
                            <SelectTrigger>
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

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="enable-ocr"
                                checked={enableOCR}
                                onCheckedChange={(c) => setEnableOCR(!!c)}
                            />
                            <Label htmlFor="enable-ocr" className="flex items-center gap-2 cursor-pointer">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Enable OCR Text Extraction
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="insert-db"
                                checked={insertToDatabase}
                                onCheckedChange={(c) => setInsertToDatabase(!!c)}
                            />
                            <Label htmlFor="insert-db" className="flex items-center gap-2 cursor-pointer">
                                <Database className="h-4 w-4 text-primary" />
                                Insert into Resources Table
                            </Label>
                        </div>
                    </div>
                </div>

                {/* File Drop Zone */}
                <div className="relative">
                    <input
                        type="file"
                        multiple
                        // @ts-ignore - webkitdirectory is a non-standard attribute
                        webkitdirectory=""
                        directory=""
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-10 text-center hover:border-kenya-green hover:bg-kenya-green/5 transition-colors">
                        <FolderUp className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                        <p className="font-bold text-lg">Drop a folder or click to select</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Supports: PDF, DOC, Images, Videos, and more
                        </p>
                    </div>
                </div>

                {/* Single File Upload */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" className="w-full rounded-xl">
                            <Upload className="h-4 w-4 mr-2" />
                            Add Individual Files
                        </Button>
                    </div>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary">{files.length} files</Badge>
                                {successCount > 0 && <Badge className="bg-green-500">{successCount} uploaded</Badge>}
                                {errorCount > 0 && <Badge variant="destructive">{errorCount} failed</Badge>}
                            </div>
                            {successCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearCompleted}>
                                    Clear Completed
                                </Button>
                            )}
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2">
                            <AnimatePresence>
                                {files.map((f, i) => (
                                    <motion.div
                                        key={f.file.name + i}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl"
                                    >
                                        <div className="text-slate-500">{getFileIcon(f.file.name)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{f.file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(f.file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>

                                        {f.status === 'pending' && (
                                            <Badge variant="secondary">Pending</Badge>
                                        )}
                                        {(f.status === 'uploading' || f.status === 'processing') && (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <Progress value={f.progress} className="w-20 h-2" />
                                            </div>
                                        )}
                                        {f.status === 'success' && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                {f.extractedText && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        <Search className="h-3 w-3 mr-1" />
                                                        OCR
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        {f.status === 'error' && (
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500" />
                                                <span className="text-xs text-red-500">{f.error}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <Button
                            onClick={startUpload}
                            disabled={uploading || pendingCount === 0}
                            className="w-full bg-kenya-green hover:bg-kenya-green/90 rounded-xl h-12 font-bold"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload {pendingCount} {pendingCount === 1 ? 'File' : 'Files'}
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Info Note */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium">OCR Deep Search</p>
                        <p className="text-xs mt-1 opacity-80">
                            When enabled, text will be extracted from PDFs and images and stored alongside your files.
                            This enables deep search across all your uploaded content.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BulkUploadManager;
