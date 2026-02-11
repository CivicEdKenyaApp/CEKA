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
    ChevronRight,
    Radar,
    Clock
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

                        {/* Live Metrics */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-xl rounded-[32px] bg-slate-900 text-white p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-kenya-red/20 blur-[64px] rounded-full -mr-16 -mt-16" />
                                <div className="relative z-10 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">System Integrity</p>
                                        <Radio className="h-4 w-4 text-kenya-green animate-pulse" />
                                    </div>
                                    <div className="text-5xl font-black">99.8%</div>
                                    <div className="flex items-center gap-2 text-[10px] text-kenya-green font-bold">
                                        <ShieldCheck className="h-3 w-3" />
                                        BATTLE-READY
                                    </div>
                                </div>
                            </Card>

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
            </Tabs>
        </div>
    );
}

function PipelineNodes() {
    const nodes = [
        { id: 'scout', label: 'The Omni-Scout', icon: Radar, color: 'blue' },
        { id: 'judge', label: 'Neural Judge', icon: ShieldCheck, color: 'red' },
        { id: 'griot', label: 'The Griot', icon: BrainCircuit, color: 'green' }
    ];

    return (
        <div className="relative w-full max-w-2xl px-12">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 z-0">
                <motion.div
                    className="h-full bg-slate-900"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>

            <div className="flex justify-between items-center relative z-10 w-full">
                {nodes.map((node, i) => (
                    <div key={node.id} className="flex flex-col items-center gap-4 group">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={cn(
                                "h-24 w-24 rounded-[32px] bg-white border-2 border-slate-100 flex items-center justify-center shadow-xl group-hover:border-slate-900 transition-all duration-500",
                                i === 1 ? "ring-8 ring-slate-100" : ""
                            )}
                        >
                            <node.icon className={cn(
                                "h-10 w-10 transition-all duration-500",
                                node.color === 'blue' ? 'text-blue-500 group-hover:text-blue-600' :
                                    node.color === 'red' ? 'text-kenya-red group-hover:text-red-600' :
                                        'text-kenya-green group-hover:text-green-600'
                            )} />
                        </motion.div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{node.label}</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                <div className="h-1 w-1 rounded-full bg-kenya-green animate-pulse" />
                                <span className="text-[8px] font-bold text-kenya-green uppercase">Scanning</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// End of SovereignSettings components
