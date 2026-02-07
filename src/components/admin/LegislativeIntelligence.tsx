
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Globe, Search, Play, Plus, Trash2, RefreshCw,
    ExternalLink, CheckCircle2, AlertCircle, Clock, Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ScraperSource {
    id: string;
    name: string;
    url: string;
    status: string;
    last_scraped_at: string | null;
}

interface ProcessingJob {
    id: string;
    job_name: string;
    status: string;
    progress: number;
    current_step: string;
    created_at: string;
}

const LegislativeIntelligence = () => {
    const [sources, setSources] = useState<ScraperSource[]>([]);
    const [jobs, setJobs] = useState<ProcessingJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUrl, setNewUrl] = useState('');
    const [newName, setNewName] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling for jobs
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const { data: sourcesData } = await (supabase
                .from('scraper_sources' as any)
                .select('*')
                .order('created_at', { ascending: false }) as any);

            const { data: jobsData } = await (supabase
                .from('processing_jobs' as any)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5) as any);

            if (sourcesData) setSources(sourcesData);
            if (jobsData) setJobs(jobsData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSource = async () => {
        if (!newUrl || !newName) {
            toast({ title: "Error", description: "Name and URL are required", variant: "destructive" });
            return;
        }

        try {
            const { error } = await supabase
                .from('scraper_sources' as any)
                .insert([{ name: newName, url: newUrl }]);

            if (error) throw error;

            toast({ title: "Success", description: "Scraper source added" });
            setNewUrl('');
            setNewName('');
            fetchData();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    const handleTriggerScrape = async (source: ScraperSource) => {
        try {
            // Trigger the Edge Function
            const { data, error } = await supabase.functions.invoke('process-url', {
                body: { url: source.url, data_type: 'bills' }
            });

            if (error) throw error;

            toast({
                title: "Crawl Started",
                description: `Deployment job for ${source.name} is now in queue.`
            });
            fetchData();
        } catch (err: any) {
            toast({ title: "Trigger Failed", description: err.message, variant: "destructive" });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-kenya-green" />;
            case 'processing': return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
            case 'failed': return <AlertCircle className="h-4 w-4 text-kenya-red" />;
            default: return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Source Management */}
                <Card className="rounded-[32px] border-none shadow-ios-high dark:shadow-ios-high-dark bg-white dark:bg-[#111]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Scraper Sources
                        </CardTitle>
                        <CardDescription>Configure URLs for bill monitoring and trace acquisition</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <Input
                                placeholder="Source Name (e.g. Parliament Portal)"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="rounded-xl"
                            />
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://..."
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    className="rounded-xl"
                                />
                                <Button onClick={handleAddSource} className="rounded-xl bg-primary">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {sources.map(source => (
                                <div key={source.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/50 flex items-center justify-between group">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{source.name}</span>
                                        <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{source.url}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => handleTriggerScrape(source)}
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-lg hover:bg-kenya-green/10 hover:text-kenya-green"
                                        >
                                            <Play className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild className="rounded-lg">
                                            <a href={source.url} target="_blank" rel="noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Live Jobs Monitior */}
                <Card className="rounded-[32px] border-none shadow-ios-high dark:shadow-ios-high-dark bg-white dark:bg-[#111]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-kenya-green" />
                            Intelligence Queue
                        </CardTitle>
                        <CardDescription>Real-time status of neural scraping and analysis jobs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {jobs.length === 0 ? (
                                <div className="py-12 text-center opacity-40">
                                    <Clock className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-xs uppercase font-black tracking-widest">No Active Jobs</p>
                                </div>
                            ) : (
                                jobs.map(job => (
                                    <div key={job.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(job.status)}
                                                <span className="font-bold text-xs">{job.job_name}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">
                                                {job.status}
                                            </Badge>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${job.progress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] text-muted-foreground uppercase tracking-widest">
                                            <span>{job.current_step}</span>
                                            <span>{job.progress}%</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LegislativeIntelligence;
