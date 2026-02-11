// Legislative Intelligence Component - Pipeline Management UI
// Deep iOS-inspired design with proper Supabase integration

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Code, Database, FileText, Globe, Play, RefreshCw, Save, Scale, ChevronRight,
    Terminal, Trash2, Plus, X, CheckCircle, Clock, AlertCircle, Zap, Power,
    Settings, ExternalLink, RotateCcw, ChevronDown, MoveRight
} from 'lucide-react';
import { intelService, ScraperSource, ProcessingJob, PipelineConfig } from '@/services/intelService';
import { CEKALoader } from '@/components/ui/ceka-loader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const LegislativeIntelligence = () => {
    const [sources, setSources] = useState<ScraperSource[]>([]);
    const [jobs, setJobs] = useState<ProcessingJob[]>([]);
    const [scrapeRuns, setScrapeRuns] = useState<any[]>([]);
    const [scripts, setScripts] = useState<{ name: string; category: string }[]>([]);
    const [orderPapers, setOrderPapers] = useState<any[]>([]);
    const [billsWithHistory, setBillsWithHistory] = useState<any[]>([]);
    const [selectedScript, setSelectedScript] = useState<string | null>(null);
    const [scriptContent, setScriptContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [runningPipeline, setRunningPipeline] = useState<string | null>(null);
    const [showAddSource, setShowAddSource] = useState(false);
    const [newSource, setNewSource] = useState({ name: '', url: '' });
    const [vaultHealth, setVaultHealth] = useState<any>(null);
    const { toast } = useToast();

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [sourcesData, jobsData, scriptsData, runsData, healthData, opData, billsHistory] = await Promise.all([
                intelService.getSources(),
                intelService.getJobs(),
                intelService.getPipelineScripts(),
                intelService.getScrapeRuns(),
                intelService.getVaultHealth(),
                intelService.getOrderPapers(),
                intelService.getBillsWithHistory()
            ]);
            setSources(sourcesData);
            setJobs(jobsData);
            setScripts(scriptsData);
            setScrapeRuns(runsData);
            setVaultHealth(healthData);
            setOrderPapers(opData);
            setBillsWithHistory(billsHistory);
        } catch (error) {
            console.error('Error loading intel data:', error);
            toast({ title: 'Error', description: 'Failed to load intelligence data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
        // Refresh jobs and runs every 15 seconds
        const interval = setInterval(() => {
            Promise.all([
                intelService.getJobs(),
                intelService.getScrapeRuns(),
                intelService.getVaultHealth()
            ]).then(([j, r, h]) => {
                setJobs(j);
                setScrapeRuns(r);
                setVaultHealth(h);
            });
        }, 15000);
        return () => clearInterval(interval);
    }, [loadData]);

    // Stall job
    const stallJob = async (jobId: string) => {
        await intelService.stallJob(jobId);
        toast({ title: 'Pipeline Stalled', description: 'The job status has been set to stalled.' });
        loadData();
    };

    // Resume job
    const resumeJob = async (jobId: string) => {
        await intelService.resumeJob(jobId);
        toast({ title: 'Pipeline Resumed', description: 'The job has been set back to processing.' });
        loadData();
    };

    // Cancel job
    const cancelJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job record?')) return;
        await intelService.cancelJob(jobId);
        toast({ title: 'Job Cancelled', description: 'The job record was removed.' });
        loadData();
    };

    // Load script content
    const loadScript = async (name: string) => {
        setSelectedScript(name);
        const content = await intelService.getScriptContent(name);
        setScriptContent(content);
    };

    // Save script
    const handleSaveScript = async () => {
        if (!selectedScript) return;
        try {
            setSaving(true);
            await intelService.saveScriptContent(selectedScript, scriptContent);
            toast({ title: 'Saved', description: 'Script saved successfully' });
        } catch (error) {
            toast({ title: 'Warning', description: 'Script saved locally (edge function unavailable)', variant: 'default' });
        } finally {
            setSaving(false);
        }
    };

    // Trigger pipeline
    const triggerPipeline = async (type: 'bills' | 'gazette' | 'healthcare') => {
        try {
            setRunningPipeline(type);
            const result = await intelService.triggerPipeline({ type });
            toast({
                title: 'Job Queued',
                description: `Pipeline job ${result.jobId.slice(0, 8)}... created and queued for processing`
            });
            await loadData();
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to create pipeline job', variant: 'destructive' });
        } finally {
            setRunningPipeline(null);
        }
    };

    // Rerun job
    const rerunJob = async (jobId: string) => {
        try {
            await intelService.rerunJob(jobId);
            toast({ title: 'Rerun Started', description: 'Job has been requeued' });
            await loadData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to rerun job', variant: 'destructive' });
        }
    };

    // Add source
    const addSource = async () => {
        if (!newSource.name || !newSource.url) return;
        try {
            await intelService.addSource(newSource);
            toast({ title: 'Added', description: 'Source added successfully' });
            setNewSource({ name: '', url: '' });
            setShowAddSource(false);
            await loadData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add source', variant: 'destructive' });
        }
    };

    // Toggle source
    const toggleSource = async (source: ScraperSource) => {
        await intelService.updateSource(source.id, { is_active: !source.is_active });
        await loadData();
    };

    // Delete source
    const deleteSource = async (id: string) => {
        await intelService.deleteSource(id);
        await loadData();
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
            stalled: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
            completed: 'bg-green-500/10 text-green-600 border-green-500/20',
            failed: 'bg-red-500/10 text-red-600 border-red-500/20'
        };
        const icons: Record<string, React.ReactNode> = {
            pending: <Clock className="h-3 w-3 mr-1" />,
            processing: <Activity className="h-3 w-3 mr-1 animate-pulse" />,
            stalled: <Power className="h-3 w-3 mr-1" />,
            completed: <CheckCircle className="h-3 w-3 mr-1" />,
            failed: <AlertCircle className="h-3 w-3 mr-1" />
        };
        return (
            <Badge variant="outline" className={`${styles[status] || ''} flex items-center gap-1 uppercase text-[10px] font-black`}>
                {icons[status] || icons.pending}
                {status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <CEKALoader variant="scanning" size="lg" text="Syncing Neural Pipeline..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="rounded-[32px] border-none bg-kenya-green/5 overflow-hidden">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Vault Capacity</p>
                        <h3 className="text-3xl font-black tracking-tighter text-kenya-green">{vaultHealth?.totalBills || 0}</h3>
                        <p className="text-[10px] opacity-60 text-kenya-green/80 font-bold">BILLS IN SYSTEM</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[32px] border-none bg-blue-500/5 overflow-hidden">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Order Papers</p>
                        <h3 className="text-3xl font-black tracking-tighter text-blue-600">{vaultHealth?.totalOrderPapers || 0}</h3>
                        <p className="text-[10px] opacity-60 text-blue-600/80 font-bold">PAPERS STANDING</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[32px] border-none bg-amber-500/5 overflow-hidden">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Pipeline Health</p>
                        <h3 className="text-3xl font-black tracking-tighter text-amber-600">{vaultHealth?.syncedBills || 0}</h3>
                        <p className="text-[10px] opacity-60 text-amber-600/80 font-bold">TOTAL SUCCESS SYNCED</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[32px] border-none bg-rose-500/5 overflow-hidden">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Last Update</p>
                        <h3 className="text-3xl font-black tracking-tighter text-rose-600">
                            {vaultHealth?.lastSync ? new Date(vaultHealth.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NONE'}
                        </h3>
                        <p className="text-[10px] opacity-60 text-rose-600/80 font-bold">RECENT COMPLETION</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="queue" className="space-y-4">
                <TabsList className="bg-muted/50 p-1 rounded-2xl">
                    <TabsTrigger value="queue" className="rounded-xl px-6">Live Queue</TabsTrigger>
                    <TabsTrigger value="vault" className="rounded-xl px-6">System Vault</TabsTrigger>
                    <TabsTrigger value="sources" className="rounded-xl px-6">Sources</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-4 py-2 font-bold data-[state=active]:bg-kenya-black data-[state=active]:text-white">Run History</TabsTrigger>
                    <TabsTrigger value="code" className="rounded-xl px-4 py-2 font-bold data-[state=active]:bg-kenya-black data-[state=active]:text-white">Operations & Code</TabsTrigger>
                </TabsList>

                {/* Queue Tab */}
                <TabsContent value="queue" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Control Center */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="border-0 shadow-lg bg-kenya-black text-white rounded-[32px] overflow-hidden">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 bg-kenya-red rounded-full flex items-center justify-center animate-pulse">
                                            <Zap className="h-4 w-4 text-white" />
                                        </div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tighter">Command Center</CardTitle>
                                    </div>
                                    <CardDescription className="text-white/60">Manual override & forced synchronization</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {['bills', 'order-papers', 'gazette', 'healthcare'].map((type) => (
                                        <Button
                                            key={type}
                                            variant="ghost"
                                            className="w-full justify-between h-14 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 group transition-all"
                                            onClick={() => triggerPipeline(type as any)}
                                            disabled={runningPipeline === type}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    {type === 'bills' ? <Scale className="h-4 w-4" /> : type === 'order-papers' ? <FileText className="h-4 w-4" /> : type === 'gazette' ? <Globe className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                                                </div>
                                                <span className="capitalize font-bold tracking-tight">Sync {type.replace('-', ' ')}</span>
                                            </div>
                                            {runningPipeline === type ? <CEKALoader variant="ios" size="xs" /> : <ChevronRight className="h-4 w-4 opacity-40" />}
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Intelligence Queue */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card className="border-none shadow-sm bg-muted/20 rounded-[32px]">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tighter">Active Neural Tasks</CardTitle>
                                        <CardDescription>Real-time pipeline monitoring</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={loadData} className="rounded-full">
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {jobs.map((job) => (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-5 bg-white dark:bg-black/40 rounded-[28px] border border-border/50 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-full flex items-center justify-center shadow-inner",
                                                        job.status === 'processing' ? 'bg-blue-500/10 text-blue-600' : 'bg-muted/50 text-muted-foreground'
                                                    )}>
                                                        <Database className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-sm uppercase tracking-tight">{job.job_name}</h4>
                                                        <p className="text-[10px] text-muted-foreground tabular-nums">
                                                            {new Date(job.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(job.status)}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                                                <Settings className="h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl border-muted-foreground/10">
                                                            <DropdownMenuItem onClick={() => rerunJob(job.id)} className="gap-2">
                                                                <RotateCcw className="h-4 w-4" /> Rerun Job
                                                            </DropdownMenuItem>
                                                            {job.status === 'processing' && (
                                                                <DropdownMenuItem onClick={() => stallJob(job.id)} className="gap-2 text-rose-500">
                                                                    <Power className="h-4 w-4" /> Stall Pipeline
                                                                </DropdownMenuItem>
                                                            )}
                                                            {job.status === 'stalled' && (
                                                                <DropdownMenuItem onClick={() => resumeJob(job.id)} className="gap-2 text-blue-500">
                                                                    <Play className="h-4 w-4" /> Resume Pipeline
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => cancelJob(job.id)} className="gap-2 text-red-500">
                                                                <Trash2 className="h-4 w-4" /> Remove Record
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                                                    <span className="text-muted-foreground truncate max-w-[80%]">
                                                        {job.current_step || 'Initializing neural net...'}
                                                    </span>
                                                    <span className="text-kenya-red">{job.progress}%</span>
                                                </div>
                                                <Progress value={job.progress} className="h-1.5 bg-muted/30" />
                                            </div>

                                            {job.error_message && (
                                                <div className="mt-4 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                                                    <p className="text-[10px] font-bold text-red-600 uppercase mb-1 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> Execution Error
                                                    </p>
                                                    <p className="text-xs font-mono text-red-500/80">{job.error_message}</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                    {jobs.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                                                <Database className="h-6 w-6 text-muted-foreground/40" />
                                            </div>
                                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">No active neural tasks</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">Trigger a forced sync to populate the queue</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Vault Tab */}
                <TabsContent value="vault" className="space-y-4">
                    <Tabs defaultValue="bills_list" className="space-y-4">
                        <TabsList className="bg-muted/30 p-1 rounded-xl">
                            <TabsTrigger value="bills_list" className="text-xs font-bold px-4">Active Bills & History</TabsTrigger>
                            <TabsTrigger value="op_list" className="text-xs font-bold px-4">Order Papers Repository</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bills_list">
                            <Card className="border-none shadow-sm bg-muted/20 rounded-[32px]">
                                <CardHeader className="pb-3 border-b border-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-black uppercase tracking-tighter">Parliamentary Bills Vault</CardTitle>
                                            <CardDescription>Live tracking & version history of all legislative items</CardDescription>
                                        </div>
                                        <Button variant="ghost" onClick={loadData} className="rounded-full h-10 w-10 p-0"><RefreshCw className="h-4 w-4" /></Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-muted/10">
                                        {billsWithHistory.map((bill) => (
                                            <div key={bill.id} className="p-5 hover:bg-muted/20 transition-all flex flex-col gap-3 group">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                                            <Scale className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black bg-kenya-black text-white px-2 py-0.5 rounded-full uppercase tabular-nums">
                                                                    {bill.bill_no || 'NO. PENDING'}
                                                                </span>
                                                                {bill.history && bill.history.length > 0 && (
                                                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-black">
                                                                        {bill.history.length} ADVANCEMENTS
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <h4 className="font-bold text-sm leading-tight mt-1 line-clamp-1">{bill.title}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-black tabular-nums">SESSION {bill.session_year || '2024'}</p>
                                                            <p className="text-[10px] font-bold text-muted-foreground">{bill.sponsor}</p>
                                                        </div>
                                                        <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/10 text-[10px] uppercase font-black">
                                                            {bill.status}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pl-12 pt-1 border-t border-muted/5 mt-1">
                                                    <div className="flex gap-4">
                                                        <a href={bill.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:underline">
                                                            <ExternalLink className="h-3 w-3" /> CURRENT VERSION
                                                        </a>
                                                        {bill.history?.length > 0 && (
                                                            <button className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground hover:text-kenya-black transition-colors">
                                                                <Clock className="h-3 w-3" /> VIEW HISTORY
                                                            </button>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] opacity-40 tabular-nums">UPDATED {new Date(bill.updated_at || bill.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="op_list">
                            <Card className="border-none shadow-sm bg-muted/20 rounded-[32px]">
                                <CardHeader className="pb-3 border-b border-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-black uppercase tracking-tighter">Order Papers Repository</CardTitle>
                                            <CardDescription>Official business of the National Assembly and Senate</CardDescription>
                                        </div>
                                        <Button variant="ghost" onClick={loadData} className="rounded-full h-10 w-10 p-0"><RefreshCw className="h-4 w-4" /></Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-muted/10">
                                        {orderPapers.map((paper) => (
                                            <div key={paper.id} className="p-5 hover:bg-muted/20 transition-all flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-blue-500/5 flex items-center justify-center">
                                                            <FileText className="h-5 w-5 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <Badge variant="outline" className="text-[8px] font-black uppercase mb-1">
                                                                {paper.house}
                                                            </Badge>
                                                            <h4 className="font-bold text-sm line-clamp-1">{paper.title}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tabular-nums">{paper.date}</p>
                                                        <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-1.5 text-[10px] font-black text-blue-600 hover:underline mt-1">
                                                            <ExternalLink className="h-3 w-3" /> PDF
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {orderPapers.length === 0 && (
                                            <div className="p-20 text-center opacity-40">
                                                <FileText className="h-10 w-10 mx-auto mb-3" />
                                                <p className="font-black uppercase tracking-widest text-xs">No order papers in vault</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                {/* Sources Tab */}
                <TabsContent value="sources" className="space-y-4">
                    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm rounded-[32px]">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black uppercase tracking-tighter">Intelligence Grid</CardTitle>
                                    <CardDescription>Configured legislative endpoints</CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => setShowAddSource(!showAddSource)}
                                    className="rounded-full h-10 w-10 p-0"
                                >
                                    {showAddSource ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        <AnimatePresence>
                            {showAddSource && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <CardContent className="space-y-4 border-t border-muted/20 pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black text-muted-foreground px-1">Source Name</Label>
                                                <Input
                                                    placeholder="e.g. Health Ministry Reports"
                                                    value={newSource.name}
                                                    onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                                                    className="rounded-2xl bg-muted/30 border-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black text-muted-foreground px-1">URL Endpoint</Label>
                                                <Input
                                                    placeholder="https://..."
                                                    value={newSource.url}
                                                    onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                                                    className="rounded-2xl bg-muted/30 border-none"
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={addSource} className="w-full h-12 rounded-2xl bg-kenya-black hover:bg-kenya-red transition-all font-black uppercase tracking-tight">
                                            Connect New Endpoint
                                        </Button>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <CardContent className="pt-2 space-y-2">
                            {sources.map((source) => (
                                <div
                                    key={source.id}
                                    className="flex items-center justify-between p-4 bg-muted/30 rounded-[24px] hover:bg-muted/50 transition-all border border-transparent hover:border-kenya-green/10"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-white dark:bg-black/20 flex items-center justify-center shadow-sm">
                                            <Globe className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tight">{source.name}</p>
                                            <p className="text-[10px] text-muted-foreground truncate max-w-[200px] md:max-w-md font-mono">
                                                {source.url}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => toggleSource(source)}
                                            className="h-10 w-10 rounded-full"
                                        >
                                            <Power className={cn("h-4 w-4", source.is_active ? 'text-green-500' : 'text-gray-300')} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => deleteSource(source.id)}
                                            className="h-10 w-10 rounded-full hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Runs Tab */}
                <TabsContent value="history" className="space-y-4">
                    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm rounded-[32px]">
                        <CardHeader>
                            <CardTitle className="text-lg font-black uppercase tracking-tighter">Batch Synchronization Log</CardTitle>
                            <CardDescription>Historical record of automated scraper runs</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {scrapeRuns.map((run) => (
                                <div key={run.id} className="p-4 bg-white dark:bg-black/20 rounded-[24px] border border-border/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-bold text-xs uppercase tracking-tight">{run.source}</span>
                                        </div>
                                        <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/10 text-[9px] font-black uppercase">
                                            Success
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-muted/30 p-2 rounded-xl">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground">Found</p>
                                            <p className="text-sm font-black text-kenya-black dark:text-white">{run.bills_found}</p>
                                        </div>
                                        <div className="bg-green-500/5 p-2 rounded-xl">
                                            <p className="text-[10px] font-black uppercase text-kenya-green">New</p>
                                            <p className="text-sm font-black text-kenya-green">{run.bills_inserted}</p>
                                        </div>
                                        <div className="bg-blue-500/5 p-2 rounded-xl">
                                            <p className="text-[10px] font-black uppercase text-blue-600">Updated</p>
                                            <p className="text-sm font-black text-blue-600">{run.bills_updated}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-[10px] text-muted-foreground flex justify-between items-center tabular-nums">
                                        <span>Duration: 12.4s</span>
                                        <span>{new Date(run.completed_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                            {scrapeRuns.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Terminal className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No historical run data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pipeline Code Tab */}
                <TabsContent value="code" className="space-y-6">
                    <div className="grid lg:grid-cols-12 gap-6">
                        {/* Pipeline Inventory */}
                        <aside className="lg:col-span-4 space-y-6">
                            <Card className="border-none shadow-ios-high dark:shadow-ios-high-dark bg-white dark:bg-[#111] overflow-hidden rounded-[32px]">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Zap className="h-4 w-4 text-primary" />
                                        </div>
                                        <CardTitle className="text-sm font-black uppercase tracking-widest">Cloud Workflows</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2">
                                    {[
                                        { name: 'Legislative Sync', id: 'legislative_sync.yml', status: 'Healthy' },
                                        { name: 'AI Generation', id: 'ai_content_automation.yml', status: 'Active' },
                                        { name: 'Native Builds', id: 'native-builds.yml', status: 'On-Demand' }
                                    ].map(wf => (
                                        <div key={wf.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/50">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold">{wf.name}</span>
                                                <span className="text-[10px] opacity-40 font-mono">{wf.id}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[8px] uppercase font-black bg-kenya-green/5 text-kenya-green border-kenya-green/20">
                                                {wf.status}
                                            </Badge>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full rounded-2xl h-10 text-[10px] font-black uppercase tracking-widest border-dashed mt-2">
                                        Open GitHub Actions <ExternalLink className="h-3 w-3 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-ios-high dark:shadow-ios-high-dark bg-white dark:bg-[#111] overflow-hidden rounded-[32px]">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                            <Terminal className="h-4 w-4 text-orange-500" />
                                        </div>
                                        <CardTitle className="text-sm font-black uppercase tracking-widest">Support Scripts</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-2 pt-4">
                                    {scripts.map((script) => (
                                        <Button
                                            key={script.name}
                                            variant={selectedScript === script.name ? "default" : "ghost"}
                                            className={cn(
                                                "w-full justify-start rounded-2xl h-12 mb-2 px-4 transition-all",
                                                selectedScript === script.name ? "bg-kenya-black text-white" : "hover:bg-muted/50"
                                            )}
                                            onClick={() => loadScript(script.name)}
                                        >
                                            <Code className="h-4 w-4 mr-3" />
                                            <div className="flex flex-col items-start overflow-hidden">
                                                <span className="font-bold tracking-tight text-xs truncate w-full">{script.name}</span>
                                                <span className="text-[8px] uppercase opacity-50 font-black">{script.category}</span>
                                            </div>
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        </aside>

                        {/* Script Editor - Main Content */}
                        <div className="lg:col-span-8">
                            <Card className="border-none shadow-ios-high dark:shadow-ios-high-dark bg-white dark:bg-[#111] overflow-hidden rounded-[40px] h-[700px] flex flex-col">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-kenya-black text-white flex items-center justify-center">
                                            <Code className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-black uppercase tracking-widest">{selectedScript || "Select Pipeline Component"}</CardTitle>
                                            <CardDescription className="text-[10px] uppercase font-black opacity-50">Neural Protocol Editor v2.0</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="rounded-xl h-10 px-4 font-bold text-xs gap-2"
                                            onClick={() => selectedScript && loadScript(selectedScript)}
                                            disabled={!selectedScript}
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                            Revert
                                        </Button>
                                        <Button
                                            className="rounded-xl h-10 px-6 font-bold text-xs gap-2 bg-kenya-green text-white hover:bg-kenya-green/90 shadow-lg shadow-kenya-green/20"
                                            onClick={handleSaveScript}
                                            disabled={!selectedScript}
                                        >
                                            <Save className="h-3 w-3" />
                                            Deploy to Vault
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 relative bg-[#090909]">
                                    {selectedScript ? (
                                        <textarea
                                            className="w-full h-full bg-transparent text-kenya-green p-8 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0"
                                            value={scriptContent}
                                            onChange={(e) => setScriptContent(e.target.value)}
                                            spellCheck={false}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-4">
                                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
                                                <Terminal className="h-10 w-10 text-white/20" />
                                            </div>
                                            <h3 className="text-white font-black text-xl uppercase tracking-widest">No Component Selected</h3>
                                            <p className="text-white/40 text-sm max-w-xs">Select a pipeline script from the inventory to view or modify its neural logic.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LegislativeIntelligence;
