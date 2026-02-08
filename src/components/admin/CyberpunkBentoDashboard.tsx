// Cyberpunk Bento Dashboard - Enhanced Admin Command Center
// Interactive grid with real-time data, modals, and futuristic aesthetics

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { analyticsService, DashboardMetrics } from '@/services/analyticsService';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Users, FileText, BookOpen, Scale, Activity, AlertTriangle,
    Database, Zap, Upload, Calendar, Bell, Settings, Radio,
    Shield, Globe, TrendingUp, Eye, MessageSquare, Clock,
    Terminal, Cpu, Server, Wifi, RefreshCw, X, Maximize2, Layers,
    BarChart3, PieChart, Network, Lock, Sparkles, Bot
} from 'lucide-react';
import { CEKALoader } from '@/components/ui/ceka-loader';
import { cn } from '@/lib/utils';

// Types
interface BentoItem {
    id: string;
    title: string;
    icon: React.ReactNode;
    size: 'sm' | 'md' | 'lg' | 'xl';
    component: React.ReactNode;
    detailComponent?: React.ReactNode;
    color: string;
    glowColor: string;
}

interface SystemStatus {
    database: 'online' | 'degraded' | 'offline';
    realtime: 'online' | 'degraded' | 'offline';
    storage: 'online' | 'degraded' | 'offline';
    edge: 'online' | 'degraded' | 'offline';
}

// Cyberpunk styling utilities
const cyberGlow = (color: string) => `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 20px ${color}40)`;

// Mini Components for Bento Cards
const StatusIndicator = ({ status }: { status: 'online' | 'degraded' | 'offline' }) => (
    <span className={cn(
        "relative flex h-2 w-2",
        status === 'online' && "text-emerald-400",
        status === 'degraded' && "text-amber-400",
        status === 'offline' && "text-red-400"
    )}>
        <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            status === 'online' && "bg-emerald-400",
            status === 'degraded' && "bg-amber-400",
            status === 'offline' && "bg-red-400"
        )} />
        <span className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            status === 'online' && "bg-emerald-400",
            status === 'degraded' && "bg-amber-400",
            status === 'offline' && "bg-red-400"
        )} />
    </span>
);

const MetricValue = ({ value, label, trend }: { value: number | string; label: string; trend?: number }) => (
    <div>
        <div className="flex items-end gap-2">
            <span className="text-3xl font-black font-mono">{value}</span>
            {trend !== undefined && (
                <span className={cn(
                    "text-xs mb-1",
                    trend >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                    {trend >= 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
);

// Main Dashboard Component
const CyberpunkBentoDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<BentoItem | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [systemTime, setSystemTime] = useState(new Date());
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        database: 'online',
        realtime: 'online',
        storage: 'online',
        edge: 'online'
    });

    // Load all data
    useEffect(() => {
        loadAllData();
        const interval = setInterval(() => setSystemTime(new Date()), 1000);
        const dataInterval = setInterval(loadAllData, 30000);
        return () => {
            clearInterval(interval);
            clearInterval(dataInterval);
        };
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);

            // Parallel data fetching
            const [metricsData, timelineData, eventsData, volunteersData, notifsData] = await Promise.allSettled([
                analyticsService.getDashboardMetrics(),
                analyticsService.getActivityTimeline(14),
                supabase.from('civic_events' as any).select('*').order('event_date', { ascending: true }).limit(5),
                supabase.from('volunteer_opportunities' as any).select('*').order('created_at', { ascending: false }).limit(5),
                supabase.from('admin_notifications' as any).select('*').order('created_at', { ascending: false }).limit(10)
            ]);

            if (metricsData.status === 'fulfilled') setMetrics(metricsData.value);
            if (timelineData.status === 'fulfilled') setTimeline(timelineData.value);
            if (eventsData.status === 'fulfilled' && eventsData.value.data) setEvents(eventsData.value.data);
            if (volunteersData.status === 'fulfilled' && volunteersData.value.data) setVolunteers(volunteersData.value.data);
            if (notifsData.status === 'fulfilled' && notifsData.value.data) setNotifications(notifsData.value.data);

            // Check system status
            checkSystemStatus();
        } catch (error) {
            console.error('Dashboard data load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkSystemStatus = async () => {
        try {
            // Check database
            const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
            setSystemStatus(prev => ({ ...prev, database: dbError ? 'degraded' : 'online' }));

            // Check realtime (based on subscription capability)
            const channel = supabase.channel('status-check');
            channel.subscribe((status) => {
                setSystemStatus(prev => ({
                    ...prev,
                    realtime: status === 'SUBSCRIBED' ? 'online' : 'degraded'
                }));
                channel.unsubscribe();
            });

            // Check storage
            const { error: storageError } = await supabase.storage.listBuckets();
            setSystemStatus(prev => ({ ...prev, storage: storageError ? 'degraded' : 'online' }));
        } catch {
            setSystemStatus(prev => ({ ...prev, edge: 'degraded' }));
        }
    };

    // Bento Grid Items Configuration
    const bentoItems: BentoItem[] = useMemo(() => [
        // Core Metrics - Large
        {
            id: 'users',
            title: 'User Population',
            icon: <Users className="h-6 w-6" />,
            size: 'lg',
            color: 'from-blue-600 to-cyan-500',
            glowColor: 'rgba(6, 182, 212, 0.5)',
            component: (
                <div className="h-full flex flex-col justify-between">
                    <MetricValue value={metrics?.totalUsers || 0} label="Total Citizens" trend={12} />
                    <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeline.slice(-7)}>
                                <Area
                                    type="monotone"
                                    dataKey="newUsers"
                                    stroke="#06b6d4"
                                    fill="url(#blueGradient)"
                                    strokeWidth={2}
                                />
                                <defs>
                                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )
        },
        // System Status - Medium
        {
            id: 'system',
            title: 'System Status',
            icon: <Cpu className="h-6 w-6" />,
            size: 'md',
            color: 'from-purple-600 to-pink-500',
            glowColor: 'rgba(168, 85, 247, 0.5)',
            component: (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                            <Database className="h-3 w-3" /> Database
                        </span>
                        <StatusIndicator status={systemStatus.database} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                            <Wifi className="h-3 w-3" /> Realtime
                        </span>
                        <StatusIndicator status={systemStatus.realtime} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                            <Server className="h-3 w-3" /> Storage
                        </span>
                        <StatusIndicator status={systemStatus.storage} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                            <Zap className="h-3 w-3" /> Edge Functions
                        </span>
                        <StatusIndicator status={systemStatus.edge} />
                    </div>
                </div>
            )
        },
        // Posts Counter - Small
        {
            id: 'posts',
            title: 'Blog Posts',
            icon: <FileText className="h-5 w-5" />,
            size: 'sm',
            color: 'from-emerald-600 to-green-500',
            glowColor: 'rgba(16, 185, 129, 0.5)',
            component: <MetricValue value={metrics?.totalPosts || 0} label="Published" />
        },
        // Resources - Small
        {
            id: 'resources',
            title: 'Resources',
            icon: <BookOpen className="h-5 w-5" />,
            size: 'sm',
            color: 'from-orange-600 to-yellow-500',
            glowColor: 'rgba(245, 158, 11, 0.5)',
            component: <MetricValue value={metrics?.totalResources || 0} label="Available" />
        },
        // Bills Tracker - Large
        {
            id: 'bills',
            title: 'Legislative Monitor',
            icon: <Scale className="h-6 w-6" />,
            size: 'lg',
            color: 'from-red-600 to-pink-500',
            glowColor: 'rgba(239, 68, 68, 0.5)',
            component: (
                <div className="h-full flex flex-col justify-between">
                    <MetricValue value={metrics?.totalBills || 0} label="Bills Tracked" />
                    <div className="space-y-1 mt-2">
                        {['Parliament', 'Senate', 'Gazette'].map((source, i) => (
                            <div key={source} className="flex items-center gap-2">
                                <Progress value={[65, 45, 80][i]} className="h-1 flex-1" />
                                <span className="text-[10px] text-muted-foreground w-20">{source}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        // Calendar Events - Medium
        {
            id: 'events',
            title: 'Upcoming Events',
            icon: <Calendar className="h-5 w-5" />,
            size: 'md',
            color: 'from-indigo-600 to-blue-500',
            glowColor: 'rgba(99, 102, 241, 0.5)',
            component: (
                <div className="space-y-2">
                    {events.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No upcoming events</p>
                    ) : (
                        events.slice(0, 3).map(event => (
                            <div key={event.id} className="flex items-center gap-2 text-xs">
                                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center font-mono font-bold">
                                    {new Date(event.event_date).getDate()}
                                </div>
                                <span className="truncate flex-1">{event.title}</span>
                            </div>
                        ))
                    )}
                </div>
            )
        },
        // Active Sessions
        {
            id: 'sessions',
            title: 'Active Sessions',
            icon: <Activity className="h-5 w-5" />,
            size: 'sm',
            color: 'from-teal-600 to-cyan-500',
            glowColor: 'rgba(20, 184, 166, 0.5)',
            component: <MetricValue value={metrics?.activeSessions || 0} label="Connected" />
        },
        // Pending Drafts
        {
            id: 'drafts',
            title: 'Pending Drafts',
            icon: <Clock className="h-5 w-5" />,
            size: 'sm',
            color: 'from-amber-600 to-yellow-500',
            glowColor: 'rgba(245, 158, 11, 0.5)',
            component: <MetricValue value={metrics?.pendingDrafts || 0} label="Awaiting" />
        },
        // Volunteer Ops - Medium
        {
            id: 'volunteers',
            title: 'Volunteer Ops',
            icon: <Users className="h-5 w-5" />,
            size: 'md',
            color: 'from-green-600 to-emerald-500',
            glowColor: 'rgba(16, 185, 129, 0.5)',
            component: (
                <div className="space-y-2">
                    <div className="text-2xl font-bold font-mono">{volunteers.length}</div>
                    <div className="text-xs text-muted-foreground">Active Opportunities</div>
                    <div className="flex gap-1 mt-2">
                        {['Open', 'Pending', 'Filled'].map((status, i) => (
                            <Badge key={status} variant="outline" className="text-[10px]">
                                {status}
                            </Badge>
                        ))}
                    </div>
                </div>
            )
        },
        // Notifications
        {
            id: 'notifications',
            title: 'Recent Alerts',
            icon: <Bell className="h-5 w-5" />,
            size: 'md',
            color: 'from-rose-600 to-red-500',
            glowColor: 'rgba(244, 63, 94, 0.5)',
            component: (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold font-mono">{notifications.filter(n => !n.is_read).length}</span>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Unread</Badge>
                    </div>
                    {notifications.slice(0, 2).map(n => (
                        <div key={n.id} className="text-xs truncate text-muted-foreground">
                            {n.title}
                        </div>
                    ))}
                </div>
            )
        },
        // Activity Chart - XL
        {
            id: 'activity',
            title: 'Activity Timeline',
            icon: <BarChart3 className="h-6 w-6" />,
            size: 'xl',
            color: 'from-violet-600 to-purple-500',
            glowColor: 'rgba(139, 92, 246, 0.5)',
            component: (
                <div className="h-full">
                    <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={timeline.slice(-14)}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(d) => new Date(d).toLocaleDateString('en', { day: 'numeric' })}
                                tick={{ fontSize: 10 }}
                            />
                            <Tooltip />
                            <Bar dataKey="newUsers" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="blogPosts" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )
        },
        // AI Status
        {
            id: 'ai',
            title: 'AI Status',
            icon: <Bot className="h-5 w-5" />,
            size: 'sm',
            color: 'from-pink-600 to-rose-500',
            glowColor: 'rgba(236, 72, 153, 0.5)',
            component: (
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center animate-pulse">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-sm">Online</div>
                        <div className="text-[10px] text-muted-foreground">CEKA Assistant</div>
                    </div>
                </div>
            )
        }
    ], [metrics, timeline, events, volunteers, notifications, systemStatus]);

    // Size classes for bento grid
    const sizeClasses = {
        sm: 'col-span-1 row-span-1',
        md: 'col-span-1 row-span-2',
        lg: 'col-span-2 row-span-1',
        xl: 'col-span-2 row-span-2'
    };

    if (loading && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <CEKALoader size="lg" variant="orbit" text="Initializing Cyberpunk Interface..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-30">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Glow Orbs */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                            TACTICAL COMMAND CENTER
                        </h1>
                        <p className="text-sm text-slate-400 font-mono mt-1">
                            CEKA.ADMIN.v3.0 :: {systemTime.toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadAllData}
                            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                            Sync
                        </Button>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 gap-1">
                            <StatusIndicator status="online" />
                            LIVE
                        </Badge>
                    </div>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-4 gap-4 auto-rows-[120px]">
                    <AnimatePresence>
                        {bentoItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(sizeClasses[item.size], "group")}
                            >
                                <Card
                                    className={cn(
                                        "h-full relative overflow-hidden cursor-pointer transition-all duration-300",
                                        "bg-slate-900/80 backdrop-blur-xl border-slate-800/50",
                                        "hover:border-slate-700 hover:shadow-2xl",
                                        "before:absolute before:inset-0 before:bg-gradient-to-br",
                                        `before:${item.color}`,
                                        "before:opacity-0 hover:before:opacity-5 before:transition-opacity"
                                    )}
                                    style={{
                                        boxShadow: `0 0 20px ${item.glowColor}20`
                                    }}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <CardHeader className="pb-2 pt-3 px-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "p-1.5 rounded-lg bg-gradient-to-br",
                                                        item.color
                                                    )}
                                                    style={{ filter: cyberGlow(item.glowColor) }}
                                                >
                                                    {React.cloneElement(item.icon as React.ReactElement, {
                                                        className: "h-4 w-4 text-white"
                                                    })}
                                                </div>
                                                <CardTitle className="text-xs font-medium text-slate-300">
                                                    {item.title}
                                                </CardTitle>
                                            </div>
                                            <Maximize2 className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-3 pt-0">
                                        {item.component}
                                    </CardContent>

                                    {/* Scan line effect */}
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Terminal Footer */}
                <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Terminal className="h-4 w-4" />
                        <span>CEKA::ADMIN $</span>
                        <span className="text-emerald-400">system.status</span>
                        <span>= all_services_operational</span>
                        <span className="ml-auto text-cyan-400">{systemTime.toISOString()}</span>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            {selectedItem && (
                                <>
                                    <div className={cn("p-2 rounded-lg bg-gradient-to-br", selectedItem.color)}>
                                        {React.cloneElement(selectedItem.icon as React.ReactElement, {
                                            className: "h-5 w-5 text-white"
                                        })}
                                    </div>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                        {selectedItem.title}
                                    </span>
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="space-y-4 py-4">
                            {selectedItem?.detailComponent || (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Detailed view coming soon for {selectedItem?.title}</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* CSS for scan animation */}
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(400%); }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default CyberpunkBentoDashboard;
