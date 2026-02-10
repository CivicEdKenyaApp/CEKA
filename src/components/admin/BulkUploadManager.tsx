// Bulk Upload Manager - Advanced B2 Cloud Manager
// Supports custom folder creation, staged metadata review, and automated SQL sync
// for both the Resource Library and Instagram-style Carousels.

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
    Image, FileText, Music, Video, Archive, Trash2, Eye, Edit3, Save, Plus, ExternalLink, Settings, Zap
} from 'lucide-react';
import backblazeStorage from '@/services/backblazeStorage';
import { supabase } from '@/integrations/supabase/client';
import { mediaService, MediaContent } from '@/services/mediaService';
import { CEKALoader } from '@/components/ui/ceka-loader';

interface UploadFile {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'success' | 'error' | 'staged';
    progress: number;
    url?: string;
    error?: string;

    // Staged metadata
    stagedTitle: string;
    stagedDescription: string;
    stagedTags: string;
}

type RegistrationMode = 'storage_only' | 'resource' | 'carousel_item';

const STORAGE_FOLDERS = [
    { value: 'resources', label: 'Resources' },
    { value: 'carousels', label: 'Carousels' },
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
    const [customFolder, setCustomFolder] = useState('');
    const [regMode, setRegMode] = useState<RegistrationMode>('resource');
    const [category, setCategory] = useState('general');
    const [selectedCarousel, setSelectedCarousel] = useState<string>('');
    const [carousels, setCarousels] = useState<MediaContent[]>([]);

    const [backblazeReady, setBackblazeReady] = useState<boolean | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Check Backblaze on mount and fetch carousels
    useEffect(() => {
        checkBackblaze();
        fetchCarousels();
    }, []);

    const checkBackblaze = async () => {
        try {
            const ready = await backblazeStorage.initialize();
            setBackblazeReady(ready);
        } catch (error) {
            setBackblazeReady(false);
        }
    };

    const fetchCarousels = async () => {
        try {
            const data = await mediaService.listMediaContent('carousel');
            setCarousels(data);
        } catch (error) {
            console.error('Failed to fetch carousels:', error);
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
            status: 'staged',
            progress: 0,
            stagedTitle: file.name.replace(/\.[^/.]+$/, ''),
            stagedDescription: '',
            stagedTags: ''
        }));

        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const dt = e.dataTransfer;
        handleFilesSelected(dt.files);
    }, [handleFilesSelected]);

    // Update staged metadata
    const updateStagedFile = (id: string, updates: Partial<UploadFile>) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    // Upload single file to Backblaze and Sync to SQL
    const processFile = async (uploadFile: UploadFile): Promise<void> => {
        setFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 10 } : f))
        );

        try {
            const finalFolder = customFolder || targetFolder;

            // 1. Upload to Backblaze
            const result = await backblazeStorage.uploadFile(
                uploadFile.file,
                finalFolder,
                (progress) => {
                    setFiles((prev) =>
                        prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: Math.min(progress, 90) } : f))
                    );
                }
            );

            if (!result.success) {
                throw new Error(result.error || 'B2 Upload failed');
            }

            // 2. Automated SQL Sync based on Registration Mode
            if (regMode === 'resource') {
                const tagsArray = uploadFile.stagedTags.split(',').map(t => t.trim()).filter(Boolean);
                const { error: sqlError } = await supabase.from('resources').insert({
                    title: uploadFile.stagedTitle,
                    description: uploadFile.stagedDescription || 'Uploaded via B2 Cloud Manager',
                    url: result.fileUrl || '',
                    thumbnail_url: null, // Let Intelligent Placeholder handle this
                    type: uploadFile.type.split('/')[0] || 'document',
                    category: category,
                    tags: tagsArray,
                    downloads: 0,
                    views: 0
                });
                if (sqlError) throw sqlError;
            }
            else if (regMode === 'carousel_item' && selectedCarousel) {
                // Get the current max order_index for this carousel
                const { data: currentItems } = await (supabase
                    .from('media_items' as any) as any)
                    .select('order_index')
                    .eq('content_id', selectedCarousel)
                    .order('order_index', { ascending: false })
                    .limit(1);

                const nextOrder = (currentItems && currentItems[0] ? currentItems[0].order_index + 1 : 0);

                const { error: sqlError } = await (supabase.from('media_items' as any) as any).insert({
                    content_id: selectedCarousel,
                    type: uploadFile.type.startsWith('image') ? 'image' :
                        uploadFile.type === 'application/pdf' ? 'pdf' : 'video',
                    file_path: result.fileName,
                    file_url: result.fileUrl,
                    order_index: nextOrder,
                    metadata: {
                        original_name: uploadFile.name,
                        title: uploadFile.stagedTitle
                    }
                });
                if (sqlError) throw sqlError;
            }

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'success', progress: 100, url: result.fileUrl }
                        : f
                )
            );
        } catch (error: any) {
            console.error('Processing error:', error);
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'error', progress: 0, error: error.message }
                        : f
                )
            );
        }
    };

    // Start Batch Upload
    const startBatchUpload = async () => {
        const stagged = files.filter((f) => f.status === 'staged' || f.status === 'pending');
        if (stagged.length === 0) {
            toast({ title: 'No files to process', description: 'Add files and review metadata first', variant: 'destructive' });
            return;
        }

        if (!backblazeReady) {
            toast({
                title: 'Backblaze Unavailable',
                description: 'Check B2 credentials in environment variables',
                variant: 'destructive'
            });
            return;
        }

        if (regMode === 'carousel_item' && !selectedCarousel) {
            toast({ title: 'Required Field', description: 'Please select a Target Carousel', variant: 'destructive' });
            return;
        }

        setUploading(true);

        // Sequential processing for atomic SQL stability
        for (const file of stagged) {
            await processFile(file);
        }

        setUploading(false);
        toast({ title: 'Cloud Sync Complete', description: `${stagged.length} assets deployed to B2 and SQL.` });
    };

    // Helpers
    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const clearCompleted = () => {
        setFiles((prev) => prev.filter((f) => f.status !== 'success'));
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
        if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
        if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
        if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getStatusBadge = (file: UploadFile) => {
        switch (file.status) {
            case 'staged': return <Badge variant="outline" className="text-amber-500 border-amber-500/20">Staged</Badge>;
            case 'uploading': return <Badge variant="outline" className="text-blue-500 border-blue-500/20"><CEKALoader variant="ios" size="sm" />{file.progress}%</Badge>;
            case 'success': return <Badge variant="outline" className="text-green-500 border-green-500/20 font-black">ACTIVE</Badge>;
            case 'error': return <Badge variant="destructive" className="text-[8px]">{file.error || 'FAILED'}</Badge>;
            default: return <Badge variant="outline">Pending</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                        Advanced B2 Cloud Manager
                        <Badge className="bg-primary/10 text-primary border-0 font-bold uppercase text-[10px]">Go Ham Mode</Badge>
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        Staged deployment to Backblaze B2 Vault with Automated SQL Metadata Sync.
                    </p>
                </div>
                {backblazeReady !== null && (
                    <Badge variant={backblazeReady ? "default" : "destructive"} className="rounded-2xl h-8 px-4 font-bold border-0 shadow-sm">
                        {backblazeReady ? 'B2 Vault Link: ACTIVE' : 'B2 Connection: DOWN'}
                    </Badge>
                )}
            </div>

            {/* Global Infrastructure Config */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-ios-high bg-card/50 backdrop-blur-xl">
                    <CardHeader className="pb-3 border-b border-muted/20">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Settings className="h-4 w-4" /> Infrastructure Setup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Target Vault Directory</Label>
                                <Select value={targetFolder} onValueChange={setTargetFolder}>
                                    <SelectTrigger className="rounded-xl border-2 h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STORAGE_FOLDERS.map((f) => (
                                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Custom Cloud Path (e.g. carousels/special)</Label>
                                <Input
                                    className="rounded-xl border-2 h-12"
                                    placeholder="resources/2026/election"
                                    value={customFolder}
                                    onChange={(e) => setCustomFolder(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Automated SQL Mode</Label>
                                <Select value={regMode} onValueChange={(v: any) => setRegMode(v)}>
                                    <SelectTrigger className="rounded-xl border-2 h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="resource">Register as Resource Library Item</SelectItem>
                                        <SelectItem value="carousel_item">Attach to Instagram Carousel</SelectItem>
                                        <SelectItem value="storage_only">Cloud Storage Only (B2 Only)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {regMode === 'resource' && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Default Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="rounded-xl border-2 h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {regMode === 'carousel_item' && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Target Carousel (Media Content)</Label>
                                    <Select value={selectedCarousel} onValueChange={setSelectedCarousel}>
                                        <SelectTrigger className="rounded-xl border-2 h-12">
                                            <SelectValue placeholder="Select a Carousel..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {carousels.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>{c.title} ({c.slug})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="border-2 border-dashed border-muted-foreground/25 bg-card/20 backdrop-blur-xl hover:border-primary/50 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-black text-lg">Deploy Assets</h3>
                    <p className="text-xs text-muted-foreground mb-4">Click or drop files to stage for cloud upload</p>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />
                    <Button variant="outline" className="rounded-xl h-10 px-6 font-bold border-2">Select Files</Button>
                </Card>
            </div>

            {/* Staging & Review Queue */}
            {files.length > 0 && (
                <Card className="border-0 shadow-ios-high bg-card/50 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-muted/20">
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight">Deployment Queue</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-primary">Stage 2: Metadata Review</CardDescription>
                        </div>
                        <div className="flex gap-3">
                            <Button size="sm" variant="outline" onClick={clearCompleted} className="rounded-xl font-bold h-10 border-2">Clear History</Button>
                            <Button
                                size="sm"
                                onClick={startBatchUpload}
                                disabled={uploading || !backblazeReady}
                                className="rounded-xl h-10 px-6 font-black bg-primary shadow-lg shadow-primary/20"
                            >
                                {uploading ? <CEKALoader variant="ios" size="sm" /> : <Zap className="h-4 w-4 mr-2" />}
                                Sync to B2 & SQL
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
                        {files.map((file) => (
                            <div key={file.id} className={`p-4 rounded-2xl border-2 transition-all ${file.status === 'success' ? 'bg-green-50/50 border-green-500/20' : 'bg-muted/10 border-muted/20'}`}>
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                                        {getFileIcon(file.type)}
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Staged Title</Label>
                                            <Input
                                                value={file.stagedTitle}
                                                onChange={(e) => updateStagedFile(file.id, { stagedTitle: e.target.value })}
                                                className="h-10 rounded-xl"
                                                disabled={file.status !== 'staged'}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tags (comma separated)</Label>
                                            <Input
                                                value={file.stagedTags}
                                                placeholder="news, constitution, alert"
                                                onChange={(e) => updateStagedFile(file.id, { stagedTags: e.target.value })}
                                                className="h-10 rounded-xl"
                                                disabled={file.status !== 'staged'}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">System Status</Label>
                                            <div className="h-10 flex items-center gap-2">
                                                {getStatusBadge(file)}
                                                <span className="text-[10px] font-bold text-muted-foreground lowercase">{formatSize(file.size)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            {file.url && (
                                                <Button size="icon" variant="outline" className="rounded-xl h-10 w-10 border-2" asChild>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => removeFile(file.id)}
                                                disabled={file.status === 'uploading'}
                                                className="rounded-xl h-10 w-10 hover:bg-kenya-red/10 hover:text-kenya-red"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {file.stagedDescription !== undefined && (
                                    <div className="mt-3 space-y-1">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Staged Description</Label>
                                        <Input
                                            value={file.stagedDescription}
                                            placeholder="Deep context for this asset..."
                                            onChange={(e) => updateStagedFile(file.id, { stagedDescription: e.target.value })}
                                            className="h-10 rounded-xl"
                                            disabled={file.status !== 'staged'}
                                        />
                                    </div>
                                )}
                                {file.status === 'uploading' && (
                                    <div className="mt-4 px-2">
                                        <Progress value={file.progress} className="h-1.5" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Help / Context */}
            <Card className="border-0 shadow-lg bg-primary/5">
                <CardContent className="py-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-primary/80 leading-tight italic">
                        <strong>Go Ham Cloud Logic:</strong> When a file is processed, it is staged in the B2 Vault with its custom metadata.
                        Upon success, the specified SQL registrations are triggered synchronously to ensure zero-lag between cloud availability and platform visibility.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default BulkUploadManager;
