
import React, { useState, useEffect } from 'react';
import { adminService, ModerationQueueItem } from '@/services/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Eye, ShieldAlert, FileText, Database, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MediaAppraisal = () => {
    const [queue, setQueue] = useState<ModerationQueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadQueue();
    }, []);

    const loadQueue = async () => {
        try {
            setLoading(true);
            const data = await adminService.getQuarantineQueue();
            setQueue(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load quarantine queue",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string | number, type: string, status: 'approved' | 'rejected') => {
        try {
            await adminService.updateMediaStatus(id, type, status);
            toast({
                title: status === 'approved' ? "Media Approved" : "Media Rejected",
                description: `Item has been moved to ${status} state.`
            });
            setQueue(prev => prev.filter(item => !(item.id === id && item.type === type)));
        } catch (error) {
            toast({
                title: "Action Failed",
                description: "Could not update media status",
                variant: "destructive"
            });
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'blog_post': return <FileText className="h-4 w-4" />;
            case 'resource': return <Database className="h-4 w-4" />;
            case 'constitution_section': return <BookOpen className="h-4 w-4" />;
            default: return <ShieldAlert className="h-4 w-4" />;
        }
    };

    if (loading) return <div className="text-center py-10">Loading quarantine hub...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Media Appraisal Hub</h2>
                <Badge variant="outline" className="px-3 py-1">
                    {queue.length} items pending
                </Badge>
            </div>

            {queue.length === 0 ? (
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Check className="h-12 w-12 text-kenya-green opacity-20 mb-4" />
                        <p className="text-muted-foreground font-medium">All clear! No items in quarantine.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {queue.map((item) => (
                            <motion.div
                                key={`${item.type}-${item.id}`}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="group hover:border-primary/40 transition-colors">
                                    <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                                                {getTypeIcon(item.type)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-lg">{item.title}</h4>
                                                    <Badge variant="secondary" className="capitalize text-[10px]">
                                                        {item.type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                                                    {item.content_preview}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span className="font-medium">By {item.author}</span>
                                                    <span>•</span>
                                                    <span>{new Date(item.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-1 md:flex-none gap-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Preview
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 md:flex-none text-destructive hover:bg-destructive/10 gap-2"
                                                onClick={() => handleAction(item.id, item.type, 'rejected')}
                                            >
                                                <X className="h-4 w-4" />
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 md:flex-none bg-kenya-green hover:bg-kenya-green/90 gap-2"
                                                onClick={() => handleAction(item.id, item.type, 'approved')}
                                            >
                                                <Check className="h-4 w-4" />
                                                Approve
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default MediaAppraisal;
