// Legislative Intelligence - Pipeline Management
// Direct Supabase integration with proper error handling

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { intelService, ScraperSource, ProcessingJob, PipelineConfig } from '@/services/intelService';
import {
    Play, Pause, RefreshCw, Settings, Code, Globe, Clock,
    CheckCircle2, XCircle, Loader2, Plus, Trash2, Edit,
    Activity, Zap, Database, FileText, ExternalLink, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LegislativeIntelligence: React.FC = () => {
    const [sources, setSources] = useState<ScraperSource[]>([]);
    const [jobs, setJobs] = useState<ProcessingJob[]>([]);
    const [scripts, setScripts] = useState<string[]>([]);
    const [selectedScript, setSelectedScript] = useState<string>('');
    const [scriptContent, setScriptContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [savingScript, setSavingScript] = useState(false);
    const [activeTab, setActiveTab] = useState('pipelines');
    const [showAddSource, setShowAddSource] = useState(false);
    const [newSource, setNewSource] = useState({ name: '', url: '', is_active: true });
    const { toast } = useToast();

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            // Load sources and jobs in parallel
            const [sourcesData, jobsData, scriptsData] = await Promise.all([
                intelService.getSources(),
                intelService.getJobs(20),
                intelService.getPipelineScripts()
            ]);

            setSources(sourcesData);
            setJobs(jobsData);
            setScripts(scriptsData);

            // Load first script content
            if (scriptsData.length > 0 && !selectedScript) {
                setSelectedScript(scriptsData[0]);
                const content = await intelService.getScriptContent(scriptsData[0]);
                setScriptContent(content);
            }
        } catch (error) {
            console.error('Error loading intel data:', error);
            toast({
                title: "Error",
                description: "Failed to load intelligence data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [selectedScript, toast]);

    useEffect(() => {
        loadData();

        // Poll for job updates every 10 seconds
        const interval = setInterval(async () => {
            const jobsData = await intelService.getJobs(20);
            setJobs(jobsData);
        }, 10000);

        return () => clearInterval(interval);
    }, [loadData]);

    // Load script content when selection changes
    const handleScriptSelect = async (scriptName: string) => {
        setSelectedScript(scriptName);
        try {
            const content = await intelService.getScriptContent(scriptName);
            setScriptContent(content);
        } catch (error) {
            console.error('Error loading script:', error);
        }
    };

    // Save script content
    const handleSaveScript = async () => {
        if (!selectedScript) return;

        setSavingScript(true);
        try {
            await intelService.saveScriptContent(selectedScript, scriptContent);
            toast({ title: "Saved", description: `${selectedScript} saved successfully` });
        } catch (error) {
            toast({
                title: "Save Failed",
                description: "Edge Function may not be deployed",
                variant: "destructive"
            });
        } finally {
            setSavingScript(false);
        }
    };

    // Trigger pipeline
    const handleTriggerPipeline = async (type: PipelineConfig['type']) => {
        try {
            const { jobId } = await intelService.triggerPipeline({ type });
            toast({
                title: "Pipeline Started",
                description: `Job ${jobId} created for ${type} pipeline`
            });

            // Refresh jobs
            const jobsData = await intelService.getJobs(20);
            setJobs(jobsData);
        } catch (error) {
            toast({
                title: "Pipeline Error",
                description: "Failed to start pipeline. Check if the processing_jobs table exists.",
                variant: "destructive"
            });
        }
    };

    // Rerun job
    const handleRerunJob = async (jobId: string) => {
        try {
            await intelService.rerunJob(jobId);
            toast({ title: "Job Requeued", description: "Job has been added to the queue" });

            // Refresh jobs
            const jobsData = await intelService.getJobs(20);
            setJobs(jobsData);
        } catch (error) {
            toast({
                title: "Rerun Failed",
                description: "Failed to rerun job. Check the processing_jobs table.",
                variant: "destructive"
            });
        }
    };

    // Toggle source active state
    const handleToggleSource = async (source: ScraperSource) => {
        try {
            await intelService.updateSource(source.id, { is_active: !source.is_active });
            setSources(sources.map(s =>
                s.id === source.id ? { ...s, is_active: !s.is_active } : s
            ));
            toast({ title: "Updated", description: `${source.name} ${!source.is_active ? 'enabled' : 'disabled'}` });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to update source",
                variant: "destructive"
            });
        }
    };

    // Add new source
    const handleAddSource = async () => {
        if (!newSource.name || !newSource.url) {
            toast({ title: "Validation Error", description: "Name and URL are required", variant: "destructive" });
            return;
        }

        try {
            const created = await intelService.createSource({ ...newSource, last_scraped_at: null });
            setSources([...sources, created]);
            setNewSource({ name: '', url: '', is_active: true });
            setShowAddSource(false);
            toast({ title: "Source Added", description: `${newSource.name} has been added` });
        } catch (error) {
            toast({
                title: "Add Failed",
                description: "Failed to add source",
                variant: "destructive"
            });
        }
    };

    // Delete source
    const handleDeleteSource = async (id: string) => {
        if (!confirm('Are you sure you want to delete this source?')) return;

        try {
            await intelService.deleteSource(id);
            setSources(sources.filter(s => s.id !== id));
            toast({ title: "Deleted", description: "Source has been removed" });
        } catch (error) {
            toast({
                title: "Delete Failed",
                description: "Failed to delete source",
                variant: "destructive"
            });
        }
    };

    // Status badge
    const StatusBadge = ({ status }: { status: ProcessingJob['status'] }) => {
        const config = {
            pending: { className: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
            processing: { className: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Loader2 },
            completed: { className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
            failed: { className: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle }
        };

        const { className, icon: Icon } = config[status];

        return (
            <Badge variant="outline" className={cn("gap-1", className)}>
                <Icon className={cn("h-3 w-3", status === 'processing' && "animate-spin")} />
                {status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading Intelligence Hub...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary" />
                        Legislative Intelligence
                    </h2>
                    <p className="text-sm text-muted-foreground">Pipeline management and data collection</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl gap-2" onClick={loadData}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="rounded-xl">
                    <TabsTrigger value="pipelines" className="rounded-lg gap-1">
                        <Zap className="h-4 w-4" /> Pipelines
                    </TabsTrigger>
                    <TabsTrigger value="sources" className="rounded-lg gap-1">
                        <Globe className="h-4 w-4" /> Sources
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="rounded-lg gap-1">
                        <Database className="h-4 w-4" /> Jobs
                    </TabsTrigger>
                    <TabsTrigger value="editor" className="rounded-lg gap-1">
                        <Code className="h-4 w-4" /> Editor
                    </TabsTrigger>
                </TabsList>

                {/* Pipelines Tab */}
                <TabsContent value="pipelines" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="cursor-pointer hover:border-primary transition-colors group">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    Bills Pipeline
                                </CardTitle>
                                <CardDescription>Parliament bills and legislation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className="w-full rounded-xl gap-2"
                                    onClick={() => handleTriggerPipeline('bills')}
                                >
                                    <Play className="h-4 w-4" /> Run Pipeline
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:border-primary transition-colors group">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-emerald-500" />
                                    Gazette Pipeline
                                </CardTitle>
                                <CardDescription>Kenya Gazette notices and publications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className="w-full rounded-xl gap-2"
                                    onClick={() => handleTriggerPipeline('gazette')}
                                >
                                    <Play className="h-4 w-4" /> Run Pipeline
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:border-primary transition-colors group">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-rose-500" />
                                    Healthcare Pipeline
                                </CardTitle>
                                <CardDescription>Health policies and regulations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className="w-full rounded-xl gap-2"
                                    onClick={() => handleTriggerPipeline('healthcare')}
                                >
                                    <Play className="h-4 w-4" /> Run Pipeline
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Jobs Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Pipeline Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {jobs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No pipeline jobs found.</p>
                                    <p className="text-xs mt-1">Run the SQL migration to create the processing_jobs table.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {jobs.slice(0, 5).map((job) => (
                                        <div key={job.id} className="flex items-center gap-4 p-3 rounded-lg border">
                                            <StatusBadge status={job.status} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{job.job_type}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(job.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {job.status === 'processing' && (
                                                <Progress value={job.progress} className="w-20 h-2" />
                                            )}
                                            {(job.status === 'failed' || job.status === 'completed') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRerunJob(job.id)}
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sources Tab */}
                <TabsContent value="sources" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={showAddSource} onOpenChange={setShowAddSource}>
                            <DialogTrigger asChild>
                                <Button className="rounded-xl gap-2">
                                    <Plus className="h-4 w-4" /> Add Source
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Scraper Source</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            value={newSource.name}
                                            onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                                            placeholder="e.g., Kenya Law Reports"
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>URL</Label>
                                        <Input
                                            value={newSource.url}
                                            onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                                            placeholder="https://..."
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={newSource.is_active}
                                            onCheckedChange={(checked) => setNewSource({ ...newSource, is_active: checked })}
                                        />
                                        <Label>Active</Label>
                                    </div>
                                    <Button className="w-full rounded-xl" onClick={handleAddSource}>
                                        Add Source
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {sources.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Globe className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="text-muted-foreground">No scraper sources configured.</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Run the SQL migration to create default sources.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sources.map((source) => (
                                <Card key={source.id} className={cn(
                                    "transition-colors",
                                    source.is_active ? "border-emerald-500/20" : "opacity-60"
                                )}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Globe className="h-4 w-4" />
                                                    {source.name}
                                                </CardTitle>
                                                <a
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                                >
                                                    {source.url.substring(0, 40)}...
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                            <Switch
                                                checked={source.is_active}
                                                onCheckedChange={() => handleToggleSource(source)}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-muted-foreground">
                                                Last scraped: {source.last_scraped_at
                                                    ? new Date(source.last_scraped_at).toLocaleDateString()
                                                    : 'Never'}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500"
                                                onClick={() => handleDeleteSource(source.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Jobs Tab */}
                <TabsContent value="jobs">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Processing Jobs</CardTitle>
                            <CardDescription>History of all pipeline executions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {jobs.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No jobs found.</p>
                                    <p className="text-xs mt-1">Start a pipeline to see jobs here.</p>
                                </div>
                            ) : (
                                <ScrollArea className="h-[400px]">
                                    <div className="space-y-2 pr-4">
                                        {jobs.map((job) => (
                                            <div key={job.id} className="p-4 rounded-lg border space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <StatusBadge status={job.status} />
                                                        <span className="font-medium">{job.job_type}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRerunJob(job.id)}
                                                        disabled={job.status === 'processing'}
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-1" /> Rerun
                                                    </Button>
                                                </div>

                                                {job.status === 'processing' && (
                                                    <Progress value={job.progress} className="h-2" />
                                                )}

                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>Created: {new Date(job.created_at).toLocaleString()}</span>
                                                    {job.completed_at && (
                                                        <span>Completed: {new Date(job.completed_at).toLocaleString()}</span>
                                                    )}
                                                </div>

                                                {job.error_message && (
                                                    <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded">
                                                        {job.error_message}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Editor Tab */}
                <TabsContent value="editor" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Select value={selectedScript} onValueChange={handleScriptSelect}>
                            <SelectTrigger className="w-[200px] rounded-xl">
                                <SelectValue placeholder="Select script" />
                            </SelectTrigger>
                            <SelectContent>
                                {scripts.map((script) => (
                                    <SelectItem key={script} value={script}>
                                        {script}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleSaveScript}
                            disabled={savingScript || !selectedScript}
                            className="rounded-xl gap-2"
                        >
                            {savingScript ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Save Script
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Textarea
                                value={scriptContent}
                                onChange={(e) => setScriptContent(e.target.value)}
                                className="font-mono text-sm min-h-[500px] border-0 rounded-xl focus-visible:ring-0"
                                placeholder="Select a script to edit..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LegislativeIntelligence;
