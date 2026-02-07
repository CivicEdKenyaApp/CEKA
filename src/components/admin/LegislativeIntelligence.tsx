
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Globe, Search, Play, Plus, Trash2, RefreshCw,
    ExternalLink, CheckCircle2, AlertCircle, Clock, Activity,
    Settings, Edit3, Save, Code, FileCode, Terminal,
    ChevronUp, ChevronDown, ListRestart, Eye, Power, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { intelService, ScraperSource, ProcessingJob } from '@/services/intelService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

// Interfaces are now imported from intelService

const LegislativeIntelligence = () => {
    const [sources, setSources] = useState<ScraperSource[]>([]);
    const [jobs, setJobs] = useState<ProcessingJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUrl, setNewUrl] = useState('');
    const [newName, setNewName] = useState('');

    // Editor State
    const [scripts, setScripts] = useState<string[]>([]);
    const [selectedScript, setSelectedScript] = useState<string>('');
    const [scriptContent, setScriptContent] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingSource, setEditingSource] = useState<ScraperSource | null>(null);
    const [viewingLogs, setViewingLogs] = useState<ProcessingJob | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        fetchData();
        loadScripts();
        const interval = setInterval(fetchData, 10000); // Polling for jobs
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const sourcesData = await intelService.getSources();
            const jobsData = await intelService.getJobs(10);
            if (sourcesData) setSources(sourcesData);
            if (jobsData) setJobs(jobsData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadScripts = async () => {
        try {
            const scriptList = await intelService.getPipelineScripts();
            setScripts(scriptList);
            if (scriptList.length > 0 && !selectedScript) {
                handleLoadScript(scriptList[0]);
            }
        } catch (err) {
            console.error('Error loading scripts:', err);
        }
    };

    const handleLoadScript = async (name: string) => {
        try {
            setSelectedScript(name);
            const content = await intelService.getScriptContent(name);
            setScriptContent(content);
        } catch (err) {
            toast({ title: "Error", description: "Failed to load script", variant: "destructive" });
        }
    };

    const handleSaveScript = async () => {
        if (!selectedScript) return;
        setIsSaving(true);
        try {
            await intelService.saveScriptContent(selectedScript, scriptContent);
            toast({ title: "Success", description: "Pipeline script deployed" });
        } catch (err: any) {
            toast({ title: "Save Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
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
            await intelService.triggerPipeline({ type: source.name.toLowerCase().includes('bill') ? 'bills' : 'gazette' });
            toast({
                title: "Crawl Started",
                description: `Deployment job for ${source.name} is now in queue.`
            });
            fetchData();
        } catch (err: any) {
            toast({ title: "Trigger Failed", description: err.message, variant: "destructive" });
        }
    };

    const handleRerunJob = async (jobId: string) => {
        try {
            await intelService.rerunJob(jobId);
            toast({ title: "Rerun Initiated", description: "Job has been duplicated and queued." });
            fetchData();
        } catch (err: any) {
            toast({ title: "Rerun Failed", description: err.message, variant: "destructive" });
        }
    };

    const handleReorderSource = async (id: string, direction: 'up' | 'down') => {
        const index = sources.findIndex(s => s.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sources.length - 1) return;

        // Note: Real implementation would update a 'sort_order' column in DB
        const newSources = [...sources];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSources[index], newSources[targetIndex]] = [newSources[targetIndex], newSources[index]];
        setSources(newSources);

        toast({ title: "Priority Updated", description: "Scraper order adjusted locally." });
    };

    const handleUpdateSourceStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        try {
            await intelService.updateSource(id, { status: newStatus });
            toast({ title: "Source Updated", description: `Scraper is now ${newStatus}.` });
            fetchData();
        } catch (err: any) {
            toast({ title: "Update Failed", description: err.message, variant: "destructive" });
        }
    };

    const handleDeleteSource = async (id: string) => {
        if (!confirm("Are you sure? This will remove the scraper metadata permanently.")) return;
        try {
            await intelService.deleteSource(id);
            toast({ title: "Source Deleted", description: "Scraper metadata removed." });
            fetchData();
        } catch (err: any) {
            toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
        }
    };

    const handleSaveEdit = async () => {
        if (!editingSource) return;
        try {
            await intelService.updateSource(editingSource.id, {
                name: editingSource.name,
                url: editingSource.url,
                frequency_hours: editingSource.frequency_hours
            });
            toast({ title: "Success", description: "Scraper configuration updated." });
            setEditingSource(null);
            fetchData();
        } catch (err: any) {
            toast({ title: "Update Failed", description: err.message, variant: "destructive" });
        }
    };

    return (
        <Tabs defaultValue="sources" className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <TabsList className="bg-muted/50 p-1 rounded-2xl h-12">
                    <TabsTrigger value="sources" className="rounded-xl px-4 gap-2">
                        <Globe className="h-4 w-4" />
                        Sources
                    </TabsTrigger>
                    <TabsTrigger value="queue" className="rounded-xl px-4 gap-2">
                        <Activity className="h-4 w-4" />
                        Queue
                    </TabsTrigger>
                    <TabsTrigger value="pipeline" className="rounded-xl px-4 gap-2">
                        <Code className="h-4 w-4" />
                        Pipeline Code
                    </TabsTrigger>
                </TabsList>

                <Button
                    onClick={() => intelService.triggerPipeline({ type: 'bills' })}
                    className="bg-primary hover:bg-primary/90 rounded-2xl h-12 font-bold shadow-ios-low"
                >
                    <Terminal className="mr-2 h-4 w-4" />
                    Force Run Pipeline
                </Button>
            </div>

            <TabsContent value="sources">
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card className="rounded-[32px] border-none shadow-ios-high bg-white dark:bg-[#111]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-primary" />
                                    Add Intelligence Source
                                </CardTitle>
                                <CardDescription>Establish new legislative monitoring endpoints</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Source Name</Label>
                                    <Input
                                        placeholder="Parliament Portal..."
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="rounded-xl h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL Endpoint</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        className="rounded-xl h-12"
                                    />
                                </div>
                                <Button onClick={handleAddSource} className="w-full rounded-xl bg-primary h-12 font-bold">
                                    Link Scraper Engine
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {sources.map(source => (
                            <div key={source.id} className="p-5 rounded-3xl bg-white dark:bg-white/5 border border-border/50 shadow-ios-low flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${source.status === 'active' ? 'bg-kenya-green/10 text-kenya-green' : 'bg-muted text-muted-foreground'}`}>
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-base">{source.name}</span>
                                            {source.status === 'active' && <Badge className="bg-kenya-green/10 text-kenya-green border-none text-[8px] uppercase tracking-widest">Live</Badge>}
                                        </div>
                                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">{source.url}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={source.status === 'active'}
                                        onCheckedChange={() => handleUpdateSourceStatus(source.id, source.status)}
                                    />
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingSource(source)}>
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-[32px]">
                                            <DialogHeader>
                                                <DialogTitle>Adjust Scraper Intelligence</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Name</Label>
                                                    <Input value={editingSource?.name} onChange={e => setEditingSource(prev => prev ? { ...prev, name: e.target.value } : null)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>URL</Label>
                                                    <Input value={editingSource?.url} onChange={e => setEditingSource(prev => prev ? { ...prev, url: e.target.value } : null)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Scrape Frequency (Hours)</Label>
                                                    <Input type="number" value={editingSource?.frequency_hours} onChange={e => setEditingSource(prev => prev ? { ...prev, frequency_hours: parseInt(e.target.value) } : null)} />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setEditingSource(null)}>Cancel</Button>
                                                <Button onClick={handleSaveEdit}>Save recalibration</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        onClick={() => handleTriggerScrape(source)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-kenya-green hover:bg-kenya-green/10"
                                    >
                                        <Play className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteSource(source.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-kenya-red hover:bg-kenya-red/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="flex flex-col gap-0.5 ml-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleReorderSource(source.id, 'up')}
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleReorderSource(source.id, 'down')}
                                        >
                                            <ChevronDown className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="queue">
                <Card className="rounded-[32px] border-none shadow-ios-high bg-white dark:bg-[#111]">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-kenya-green" />
                                Intelligence Queue
                            </CardTitle>
                            <CardDescription>Real-time status of neural scraping and analysis jobs</CardDescription>
                        </div>
                        <Button variant="outline" onClick={fetchData} className="rounded-xl h-10">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {jobs.length === 0 ? (
                                <div className="py-12 text-center opacity-40">
                                    <Clock className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-xs uppercase font-black tracking-widest">No Recent Activity</p>
                                </div>
                            ) : (
                                jobs.map(job => (
                                    <div key={job.id} className="p-4 rounded-2xl border border-border/50 bg-slate-50/50 dark:bg-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {job.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-kenya-green" /> :
                                                    job.status === 'processing' ? <RefreshCw className="h-5 w-5 text-primary animate-spin" /> :
                                                        <AlertCircle className="h-5 w-5 text-kenya-red" />}
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{job.job_name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{new Date(job.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" className="rounded-xl gap-2 h-8" onClick={() => handleRerunJob(job.id)}>
                                                    <ListRestart className="h-3.5 w-3.5" />
                                                    Rerun
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl gap-2 h-8"
                                                    onClick={() => setViewingLogs(job)}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Logs
                                                </Button>
                                            </div>
                                        </div>
                                        {viewingLogs?.id === job.id && (
                                            <div className="p-4 bg-black/5 dark:bg-black/20 rounded-xl font-mono text-[10px] text-muted-foreground animate-in slide-in-from-top-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold">TRANSCRIPT LOGS</span>
                                                    <Button variant="ghost" size="sm" className="h-6" onClick={() => setViewingLogs(null)}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <pre className="whitespace-pre-wrap">
                                                    {JSON.stringify(job.processing_logs || { message: "Waiting for stream..." }, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                                <span>{job.current_step}</span>
                                                <span>{job.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${job.status === 'failed' ? 'bg-kenya-red' : 'bg-primary'}`}
                                                    style={{ width: `${job.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="pipeline">
                <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
                    <Card className="lg:col-span-1 rounded-[32px] border-none shadow-ios-high overflow-hidden bg-white dark:bg-[#111]">
                        <ScrollArea className="h-full">
                            <CardHeader>
                                <CardTitle className="text-sm uppercase tracking-widest font-black opacity-50">Active Scripts</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 space-y-1">
                                {scripts.map(script => (
                                    <button
                                        key={script}
                                        onClick={() => handleLoadScript(script)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${selectedScript === script ? 'bg-primary text-white shadow-ios-low' : 'hover:bg-muted'
                                            }`}
                                    >
                                        {script.endsWith('.py') ? <FileCode className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                                        <span className="text-xs font-bold font-mono">{script}</span>
                                    </button>
                                ))}
                            </CardContent>
                        </ScrollArea>
                    </Card>

                    <Card className="lg:col-span-3 rounded-[32px] border-none shadow-ios-high overflow-hidden flex flex-col bg-[#1e1e1e] border-2 border-primary/20">
                        <div className="p-4 bg-muted/10 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-primary" />
                                <span className="text-xs font-mono font-bold text-white/80">{selectedScript || 'Pipeline Editor'}</span>
                            </div>
                            <Button
                                onClick={handleSaveScript}
                                disabled={isSaving || !selectedScript}
                                className="bg-kenya-green hover:bg-kenya-green/90 rounded-xl h-9 gap-2"
                            >
                                {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                Deploy Changes
                            </Button>
                        </div>
                        <ScrollArea className="flex-1">
                            <Textarea
                                value={scriptContent}
                                onChange={(e) => setScriptContent(e.target.value)}
                                className="min-h-full w-full bg-transparent border-none font-mono text-xs p-6 text-slate-300 focus-visible:ring-0 leading-relaxed"
                                spellCheck={false}
                                placeholder="# Select a script from the left to start recalibrating the pipeline..."
                            />
                        </ScrollArea>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
    );
};

export default LegislativeIntelligence;
