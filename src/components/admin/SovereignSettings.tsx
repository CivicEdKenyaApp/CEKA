import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
    BrainCircuit,
    ShieldCheck,
    Zap,
    Settings2,
    History,
    PlayCircle,
    Database,
    Cpu,
    Fingerprint,
    Radio,
    GanttChartSquare,
    Network,
    Activity,
    Terminal,
    Save,
    Radar,
    Clock,
    Code2,
    FlaskConical,
    MessagesSquare,
    Workflow,
    AlertTriangle,
    CheckCircle2,
    Copy,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface IntelligenceProfile {
    id: string;
    profile_name: string;
    display_name: string;
    description: string;
    system_prompt: string;
    rigor_threshold: number;
    is_active: boolean;
    version: string;
}

export function SovereignSettings() {
    const [profiles, setProfiles] = useState<IntelligenceProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pipeline");
    const { toast } = useToast();

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('ai_intelligence_configs')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleProfile = async (id: string) => {
        try {
            // Deactivate all first (Sovereignty Rule: Only one mind at a time)
            await supabase.from('ai_intelligence_configs').update({ is_active: false }).neq('id', 'temp');

            // Activate selected
            const { error } = await supabase
                .from('ai_intelligence_configs')
                .update({ is_active: true })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Intelligence Shifted",
                description: "The Sovereign Mind has assumed a new persona.",
            });

            fetchProfiles();
        } catch (error) {
            toast({ title: "Profile shift failed", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Logic Throne Navigation */}
            <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl ring-4 ring-slate-900/10">
                    <BrainCircuit className="h-6 w-6 text-kenya-red" />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">The Logic Throne</h2>
                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Cognitive Parameter Control • SIS Phase 10</p>
                </div>
            </div>

            <Tabs defaultValue="pipeline" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100 p-1.5 rounded-[24px] border border-slate-200 shadow-sm mb-6">
                    <TabsTrigger value="pipeline" className="rounded-2xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 font-bold transition-all text-slate-500">
                        <Network className="h-4 w-4 mr-2" /> Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="personas" className="rounded-2xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 font-bold transition-all text-slate-500">
                        <Fingerprint className="h-4 w-4 mr-2" /> Persona Lab
                    </TabsTrigger>
                    <TabsTrigger value="memory" className="rounded-2xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 font-bold transition-all text-slate-500">
                        <Database className="h-4 w-4 mr-2" /> RAG Memory
                    </TabsTrigger>
                    <TabsTrigger value="simulator" className="rounded-2xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 font-bold transition-all text-slate-500">
                        <FlaskConical className="h-4 w-4 mr-2" /> Simulator
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pipeline" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* iOS Inspired Node Map */}
                        <Card className="lg:col-span-2 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden bg-white/50 backdrop-blur-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-kenya-red" />
                                    Neural Flow Visualizer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px] relative flex items-center justify-center overflow-hidden">
                                <PipelineNodes />
                            </CardContent>
                        </Card>

                        {/* Live Metrics & Neural Constellation */}
                        <div className="space-y-6">
                            <NeuralConstellation />

                            <Card className="border-none shadow-xl rounded-[32px] bg-white p-6 space-y-4">
                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Factual Rigor Floor</p>
                                <div className="space-y-6">
                                    <div className="flex justify-between text-2xl font-black italic">
                                        <span>95%</span>
                                        <span className="text-slate-200">/ 100</span>
                                    </div>
                                    <Slider defaultValue={[95]} max={100} min={80} step={1} className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-kenya-red [&_[role=slider]]:bg-white [&_.relative]:h-2" />
                                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium italic">
                                        "Setting the floor higher increases reasoning loops and API consumption but guarantees absolute legal truth."
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <Card className="border-none shadow-xl rounded-[32px] bg-slate-50">
                        <CardHeader>
                            <CardTitle className="text-sm font-black flex items-center gap-2 text-slate-400">
                                <Terminal className="h-4 w-4" />
                                SOVEREIGN_LOG_STREAM :: STATUS_OK
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[11px] text-slate-300 min-h-[120px] max-h-[200px] overflow-y-auto space-y-1">
                                <p className=""><span className="text-kenya-green font-bold">[READY]</span> Synchronizer initialized v2.0.0-sis</p>
                                <p className=""><span className="text-blue-400 font-bold">[INFO]</span> RAG Memory connected: 264 Articles, 6 Schedules.</p>
                                <p className=""><span className="text-yellow-400 font-bold">[WAIT]</span> Listening for legislative movement (Scraper Ingress)...</p>
                                <p className="opacity-50 italic">_waiting for neural spark_</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="personas" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profiles.map((profile) => (
                            <Card
                                key={profile.id}
                                className={cn(
                                    "border-2 transition-all duration-500 rounded-[32px] overflow-hidden group cursor-pointer",
                                    profile.is_active
                                        ? "border-kenya-red bg-white shadow-[0_32px_64px_-12px_rgba(235,53,67,0.15)] scale-[1.02]"
                                        : "border-slate-100 bg-slate-50/50 grayscale hover:grayscale-0 hover:border-slate-200"
                                )}
                                onClick={() => toggleProfile(profile.id)}
                            >
                                <CardHeader className="relative pb-0">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500",
                                        profile.is_active ? "bg-kenya-red text-white rotate-3" : "bg-white text-slate-400 shadow-sm"
                                    )}>
                                        <Cpu className="h-7 w-7" />
                                    </div>
                                    <AnimatePresence>
                                        {profile.is_active && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute top-6 right-6 px-3 py-1 bg-kenya-red text-[8px] font-black text-white rounded-full tracking-widest uppercase"
                                            >
                                                Active Mind
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <CardTitle className="text-xl font-black tracking-tight">{profile.display_name}</CardTitle>
                                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider h-12">
                                        {profile.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="p-4 bg-slate-900/5 rounded-2xl border border-slate-900/5">
                                        <p className="text-[10px] leading-relaxed italic text-slate-600">
                                            "{profile.system_prompt.substring(0, 150)}..."
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-2">
                                        <span className="text-slate-400">Rigor Score: {profile.rigor_threshold * 100}%</span>
                                        <span className="text-slate-400">v{profile.version}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="memory" className="outline-none">
                    <Card className="border-none shadow-xl rounded-[40px] bg-white overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="p-10 space-y-8 bg-slate-50">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight mb-2">Incorruptible Memory</h3>
                                    <p className="text-slate-500 text-sm">Full Constitutional RAG (Articles 1-264 + Schedules).</p>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: "Vector Index Size", value: "270 Chunks", icon: Database },
                                        { label: "Last Ingestion", value: "Today, 23:24", icon: Clock },
                                        { label: "Embedding Engine", value: "Gemini 004", icon: Cpu }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                                                <stat.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                <p className="text-sm font-bold text-slate-900">{stat.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black font-bold text-sm shadow-xl flex items-center gap-2 group">
                                    <PlayCircle className="h-5 w-5 text-kenya-red group-hover:scale-110 transition-all" />
                                    Perform Full Vector Audit
                                </Button>
                            </div>
                            <div className="p-10 relative overflow-hidden flex flex-col justify-center">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-kenya-green/5 blur-3xl rounded-full" />
                                <div className="relative z-10 space-y-6">
                                    <div className="italic text-slate-400 text-xs">"Memory retrieval is currently active. Every word being drafted by the Sovereign Mind is cross-referenced against Article 1-28 for immediate legal grounding."</div>
                                    <div className="flex flex-wrap gap-2">
                                        {["Article 1", "Article 10", "Article 27", "Schedule 4", "Art 35"].map((art) => (
                                            <div key={art} className="px-3 py-1 bg-slate-100 text-slate-900 rounded-full text-[10px] font-black border border-slate-200">
                                                {art}
                                            </div>
                                        ))}
                                        <div className="px-3 py-1 bg-kenya-red text-white rounded-full text-[10px] font-black shadow-lg">
                                            +265 MORE
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
                <TabsContent value="simulator" className="outline-none">
                    <IntelligenceSimulator />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PromptEditor({ profile, onSave }: { profile: IntelligenceProfile; onSave: (p: IntelligenceProfile) => void }) {
    const [editingPrompt, setEditingPrompt] = useState(profile.system_prompt);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Code2 className="h-4 w-4" /> Persona Prompt Editor
                </h4>
                <Button
                    size="sm"
                    className="h-8 rounded-xl bg-kenya-red hover:bg-red-600 shadow-lg text-[10px] font-black uppercase tracking-wider"
                    onClick={() => onSave({ ...profile, system_prompt: editingPrompt })}
                >
                    <Save className="h-3 w-3 mr-2" /> Commit to Mind
                </Button>
            </div>
            <div className="relative rounded-[24px] overflow-hidden border border-slate-200 bg-slate-950 p-1">
                <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                    <div className="h-2 w-2 rounded-full bg-red-500/50" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                    <div className="h-2 w-2 rounded-full bg-green-500/50" />
                </div>
                <textarea
                    value={editingPrompt}
                    onChange={(e) => setEditingPrompt(e.target.value)}
                    className="w-full h-[300px] bg-transparent text-indigo-300 font-mono text-xs p-10 outline-none resize-none selection:bg-indigo-500/30 leading-relaxed"
                    spellCheck={false}
                />
                <div className="absolute bottom-4 right-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    Monaco_SIS_v2.0 // UTF-8
                </div>
            </div>
        </div>
    );
}

function IntelligenceSimulator() {
    const [query, setQuery] = useState("");
    const [simulating, setSimulating] = useState(false);
    const [result, setResult] = useState<any>(null);

    const runSimulation = async () => {
        if (!query) return;
        setSimulating(true);
        setResult(null);

        try {
            // 1. Submit Request to Queue (Casting to any because table is newly created via SQL)
            const { data, error } = await supabase
                .from('sovereign_simulation_queue' as any)
                .insert([{ query }] as any)
                .select()
                .single();

            if (error) throw error;
            const requestId = (data as any).id;

            // 2. Subscribe to Realtime Updates for this request
            const channel = supabase
                .channel(`sim-${requestId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'sovereign_simulation_queue',
                        filter: `id=eq.${requestId}`
                    },
                    (payload) => {
                        const newRow = payload.new as any;
                        if (newRow.status === 'completed' && newRow.result_json) {
                            setResult(newRow.result_json);
                            setSimulating(false);
                            supabase.removeChannel(channel);
                        } else if (newRow.status === 'failed') {
                            setSimulating(false);
                            supabase.removeChannel(channel);
                        }
                    }
                )
                .subscribe();

            // Fallback timeout (if daemon is offline)
            setTimeout(() => {
                if (simulating) {
                    supabase.removeChannel(channel);
                    setSimulating(false);
                }
            }, 30000); // 30s timeout

        } catch (error) {
            console.error("Simulation failed:", error);
            setSimulating(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-2xl rounded-[40px] bg-white p-8 space-y-6">
                <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <FlaskConical className="h-6 w-6 text-kenya-red" />
                        Intelligence Simulator
                    </h3>
                    <p className="text-slate-500 text-xs font-medium">Test the Sovereign Mind's reasoning before pushing to production.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Query / Topic Ingress</label>
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. Analysis of the Finance Bill 2025 impact on SMEs..."
                            className="w-full h-32 rounded-[24px] bg-slate-50 border border-slate-100 p-6 text-sm font-medium focus:ring-2 focus:ring-kenya-red/20 outline-none transition-all"
                        />
                    </div>
                    <Button
                        disabled={simulating || !query}
                        onClick={runSimulation}
                        className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black font-bold text-sm shadow-xl flex items-center justify-center gap-3 group overflow-hidden relative"
                    >
                        {simulating ? (
                            <>
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                <span>Engaging Reasoners...</span>
                            </>
                        ) : (
                            <>
                                <PlayCircle className="h-5 w-5 text-kenya-red group-hover:scale-110 transition-all" />
                                <span>Run Sovereign Dry-Run</span>
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            <div className="space-y-6">
                <AnimatePresence mode="wait">
                    {simulating ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 text-center space-y-6"
                        >
                            <div className="relative">
                                <Activity className="h-12 w-12 text-slate-200" />
                                <motion.div
                                    animate={{ height: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-kenya-red/10 overflow-hidden"
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-black uppercase tracking-widest text-slate-300">Scanning Incorruptible Memory...</p>
                                <div className="flex gap-1 justify-center">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                                            className="h-1 w-4 rounded-full bg-slate-200"
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : result ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            {/* Simulator Results */}
                            <Card className="border-none shadow-2xl rounded-[32px] bg-slate-900 text-white overflow-hidden">
                                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-kenya-green" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Simulation Output</span>
                                    </div>
                                    <div className="p-2 bg-kenya-green/20 text-kenya-green rounded-full text-[9px] font-black uppercase border border-kenya-green/20">
                                        Integrity: {(result.integrity * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Retrieved Articles</p>
                                        <div className="flex gap-2">
                                            {result.articles.map((art: string) => (
                                                <div key={art} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold border border-white/5">
                                                    {art}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Internal Reasoning</p>
                                        <p className="text-xs text-slate-300 leading-relaxed font-mono">
                                            {result.reasoning}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                        <Button variant="ghost" className="w-full text-xs text-slate-400 hover:text-white font-bold gap-2">
                                            <MessagesSquare className="h-4 w-4" /> View Full Chain of Thought
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            <Card className="border-none shadow-xl rounded-[32px] bg-white p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Draft Synthesis</p>
                                    <Button variant="ghost" size="sm" className="h-6 rounded-lg text-[9px] font-black uppercase">
                                        <Copy className="h-3 w-3 mr-1" /> Copy HTML
                                    </Button>
                                </div>
                                <div
                                    className="prose prose-sm max-w-none text-slate-900 line-clamp-6 opacity-80"
                                    dangerouslySetInnerHTML={{ __html: result.draft_preview }}
                                />
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="h-full min-h-[400px] rounded-[40px] bg-slate-50 border-2 border-slate-100 p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <Workflow className="h-12 w-12 text-slate-200" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Waiting for Ingress...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function PipelineNodes() {
    const nodes = [
        { id: 'scout', label: 'The Omni-Scout', icon: Radar, color: 'blue', status: 'Scanning' },
        { id: 'judge', label: 'Neural Judge', icon: ShieldCheck, color: 'red', status: 'Listening' },
        { id: 'griot', label: 'The Griot', icon: BrainCircuit, color: 'green', status: 'Ready' }
    ];

    return (
        <div className="relative w-full max-w-2xl px-12">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 z-0">
                <motion.div
                    className="h-full bg-slate-900"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <div className="flex justify-between items-center relative z-10 w-full">
                {nodes.map((node, i) => (
                    <div key={node.id} className="flex flex-col items-center gap-4 group">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
                            className={cn(
                                "h-24 w-24 rounded-[32px] bg-white border-2 border-slate-100 flex items-center justify-center shadow-xl group-hover:border-slate-900 transition-all duration-500",
                                i === 1 ? "ring-8 ring-slate-50" : ""
                            )}
                        >
                            <node.icon className={cn(
                                "h-10 w-10 transition-all duration-500",
                                node.color === 'blue' ? 'text-blue-500' :
                                    node.color === 'red' ? 'text-kenya-red' :
                                        'text-kenya-green'
                            )} />
                        </motion.div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight mb-1">{node.label}</p>
                            <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse",
                                    node.color === 'blue' ? 'bg-blue-400' :
                                        node.color === 'red' ? 'bg-red-400' : 'bg-green-400'
                                )} />
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">{node.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// End of SovereignSettings components

function NeuralConstellation() {
    const providers = [
        { name: 'Gemini 2.0 Flash', status: 'active', color: 'bg-blue-500', tier: 'Primary' },
        { name: 'OpenRouter (GPT-4o)', status: 'standby', color: 'bg-purple-500', tier: 'Failover 1' },
        { name: 'Groq (Llama 3 70B)', status: 'standby', color: 'bg-orange-500', tier: 'Failover 2' },
        { name: 'Mistral Large', status: 'standby', color: 'bg-yellow-500', tier: 'Failover 3' },
        { name: 'DeepSeek V3', status: 'standby', color: 'bg-cyan-500', tier: 'Failover 4' },
    ];

    return (
        <Card className="border-none shadow-xl rounded-[32px] bg-slate-900 text-white p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15)_0%,_transparent_60%)] animate-pulse" />
            </div>

            <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-indigo-400" />
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Neural Constellation</p>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-wider border border-green-500/20">
                        Autoshift Active
                    </div>
                </div>

                <div className="space-y-3">
                    {providers.map((p, i) => (
                        <div key={p.name} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className={cn("h-2 w-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-500",
                                    p.status === 'active' ? `${p.color} scale-125 animate-pulse` : "bg-slate-700"
                                )} />
                                <span className={cn("text-xs font-bold transition-colors",
                                    p.status === 'active' ? "text-white" : "text-slate-500"
                                )}>
                                    {p.name}
                                </span>
                            </div>
                            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-600">
                                {p.status === 'active' ? (
                                    <span className={cn("text-xs font-black", p.color.replace("bg-", "text-"))}>ENGAGED</span>
                                ) : (
                                    <span>{p.tier}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <p className="text-[9px] italic text-slate-500">
                        *Routing logic automatically fails over in &lt;200ms
                    </p>
                </div>
            </div>
        </Card>
    );
}
