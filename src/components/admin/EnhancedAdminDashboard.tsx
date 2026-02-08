// Enhanced Admin Dashboard - Tactical Command Center
// Fixed: WebSocket race conditions, RLS fallbacks, improved error handling

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    Menu, X, ChevronDown, Bell, User, MoreVertical, Globe, Settings, Shield, Search, ChevronRight,
    FileText, PenTool, MessageSquare, Calendar, Heart, LayoutGrid, Radio, Users, Home, BookOpen,
    PlusCircle, Edit3, Activity, TrendingUp, Eye, UserCheck, Clock, AlertTriangle, Download,
    RefreshCw, Plus, Sparkles, Zap
} from 'lucide-react';
import { adminService, AdminDashboardStats, UserActivityStats, ModerationQueueItem } from '@/services/adminService';
import { AdminSessionManager } from './AdminSessionManager';
import AppChangeLogger from './AppChangeLogger';
import MediaAppraisal from './MediaAppraisal';
import VolunteerManager from './VolunteerManager';
import CampaignManager from './CampaignManager';
import BulkUploadManager from './BulkUploadManager';
import EventManager from './EventManager';
import LegislativeIntelligence from './LegislativeIntelligence';
import BentoAnalyticsDashboard from './BentoAnalyticsDashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const EnhancedAdminDashboard = () => {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [activityStats, setActivityStats] = useState<UserActivityStats[]>([]);
    const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const { toast } = useToast();

    // Refs for cleanup
    const mountedRef = useRef(true);
    const channelsRef = useRef<{
        profiles?: ReturnType<typeof supabase.channel>;
        notifications?: ReturnType<typeof supabase.channel>;
    }>({});

    // Load dashboard data with error handling
    const loadDashboardData = useCallback(async () => {
        if (!mountedRef.current) return;

        try {
            setLoading(true);

            const [dashboardStats, userActivity, queue] = await Promise.all([
                adminService.getDashboardStats().catch(err => {
                    console.warn('[Dashboard] Failed to fetch dashboard stats:', err);
                    return null;
                }),
                adminService.getUserActivityStats().catch(err => {
                    console.warn('[Dashboard] Failed to fetch user activity:', err);
                    return [];
                }),
                adminService.getModerationQueue().catch(err => {
                    console.warn('[Dashboard] Failed to fetch moderation queue:', err);
                    return [];
                })
            ]);

            if (mountedRef.current) {
                if (dashboardStats) setStats(dashboardStats);
                setActivityStats(userActivity);
                setModerationQueue(queue);
            }
        } catch (error) {
            console.error('[Dashboard] Error loading dashboard data:', error);
            if (mountedRef.current) {
                toast({
                    title: "Notice",
                    description: "Some dashboard data may be unavailable",
                    variant: "default",
                });
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [toast]);

    // Setup realtime subscriptions with proper cleanup
    const setupRealtimeSubscriptions = useCallback(() => {
        // Only setup if component is mounted
        if (!mountedRef.current) return;

        // Clean up existing channels first
        const cleanup = () => {
            Object.values(channelsRef.current).forEach(channel => {
                if (channel) {
                    try {
                        supabase.removeChannel(channel);
                    } catch (e) {
                        console.debug('[Dashboard] Channel cleanup error:', e);
                    }
                }
            });
            channelsRef.current = {};
        };

        cleanup();

        // Small delay to let cleanup complete
        setTimeout(() => {
            if (!mountedRef.current) return;

            try {
                // Subscribe to profile changes (new users)
                channelsRef.current.profiles = supabase
                    .channel('admin-profiles-realtime-' + Date.now())
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
                        if (mountedRef.current) {
                            console.log('[Dashboard] Profile change detected');
                            loadDashboardData();
                        }
                    })
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log('[Dashboard] Profiles channel connected');
                        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                            console.log('[Dashboard] Profiles channel:', status);
                        }
                    });

                // Subscribe to notification changes
                channelsRef.current.notifications = supabase
                    .channel('admin-notifications-realtime-' + Date.now())
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, () => {
                        if (mountedRef.current) {
                            console.log('[Dashboard] New notification');
                            adminService.getModerationQueue()
                                .then(queue => {
                                    if (mountedRef.current) setModerationQueue(queue);
                                })
                                .catch(() => { });
                        }
                    })
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log('[Dashboard] Notifications channel connected');
                        }
                    });
            } catch (error) {
                console.warn('[Dashboard] Failed to setup realtime:', error);
            }
        }, 100);

        return cleanup;
    }, [loadDashboardData]);

    useEffect(() => {
        mountedRef.current = true;
        loadDashboardData();

        // Set up periodic refresh every 5 minutes
        const interval = setInterval(() => {
            if (mountedRef.current) loadDashboardData();
        }, 5 * 60 * 1000);

        // Setup realtime
        const cleanupRealtime = setupRealtimeSubscriptions();

        return () => {
            mountedRef.current = false;
            clearInterval(interval);
            cleanupRealtime?.();

            // Final cleanup
            Object.values(channelsRef.current).forEach(channel => {
                if (channel) {
                    try {
                        supabase.removeChannel(channel);
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                }
            });
        };
    }, [loadDashboardData, setupRealtimeSubscriptions]);

    const handleUpdateMetrics = async () => {
        try {
            await adminService.updateSystemMetrics();
            toast({
                title: "Success",
                description: "System metrics updated successfully",
            });
            await loadDashboardData();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update system metrics",
                variant: "destructive",
            });
        }
    };

    const handleGenerateReport = async () => {
        try {
            const report = await adminService.generateWeeklyReport();
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ceka-weekly-report-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: "Success", description: "Report downloaded successfully" });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate report",
                variant: "destructive",
            });
        }
    };

    // Handle tab change from Bento Analytics
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 animate-pulse flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-primary animate-spin" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">Loading command center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Shield className="h-5 w-5 text-primary-foreground" />
                        </div>
                        Tactical Command
                    </h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">
                        Live Platform Intelligence & Audit
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleGenerateReport} variant="outline" className="rounded-2xl h-12 font-bold border-2 gap-2 hover:bg-muted/50">
                        <Download className="h-4 w-4" />
                        <span className="hidden md:inline">Weekly Intelligence</span>
                        <span className="md:hidden">Export</span>
                    </Button>
                    <Button onClick={handleUpdateMetrics} className="rounded-2xl h-12 font-bold bg-primary shadow-xl shadow-primary/20 gap-2">
                        <Activity className="h-4 w-4" />
                        <span className="hidden md:inline">Recalibrate Metrics</span>
                        <span className="md:hidden">Refresh</span>
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 hide-scrollbar">
                    <TabsList className="flex h-auto p-1.5 bg-muted/30 backdrop-blur-sm rounded-2xl w-max lg:w-full lg:grid lg:grid-cols-10">
                        <TabsTrigger value="overview" className="rounded-xl px-4 py-3 font-medium data-[state=active]:shadow-lg">
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="rounded-xl px-4 py-3 font-medium data-[state=active]:shadow-lg">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="appraisal" className="rounded-xl px-4 py-3 gap-2 font-medium data-[state=active]:shadow-lg">
                            <Eye className="h-4 w-4" />
                            Appraisal
                            {moderationQueue.length > 0 && (
                                <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-kenya-red text-[8px] animate-pulse">
                                    {moderationQueue.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="volunteers" className="rounded-xl px-4 py-3 font-medium data-[state=active]:shadow-lg">
                            <Heart className="h-4 w-4 mr-2" />
                            Volunteers
                        </TabsTrigger>
                        <TabsTrigger value="events" className="rounded-xl px-4 py-3 font-medium data-[state=active]:shadow-lg">
                            <Calendar className="h-4 w-4 mr-2" />
                            Events
                        </TabsTrigger>
                        <TabsTrigger value="campaigns" className="rounded-xl px-4 py-3 font-medium data-[state=active]:shadow-lg">
                            <Radio className="h-4 w-4 mr-2" />
                            Campaigns
                        </TabsTrigger>
                        <TabsTrigger value="uploads" className="rounded-xl px-4 py-3 font-medium data-[state=active]:shadow-lg">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Uploads
                        </TabsTrigger>
                        <TabsTrigger value="sessions" className="rounded-xl px-4 py-3 font-medium data-[state=active]:shadow-lg">
                            <Users className="h-4 w-4 mr-2" />
                            Sessions
                        </TabsTrigger>
                        <TabsTrigger value="intelligence" className="rounded-xl px-4 py-3 gap-1 font-medium data-[state=active]:shadow-lg">
                            <Zap className="h-4 w-4" />
                            Intel
                        </TabsTrigger>
                        <TabsTrigger value="changes" className="rounded-xl px-4 py-3 font-medium data-[state=active]:shadow-lg">
                            <FileText className="h-4 w-4 mr-2" />
                            Audit
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6 animate-fade-in">
                    {/* Stats Cards - Removed colored side bars */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats && (
                            <>
                                <Card className="glass-card border-0 shadow-ios-high dark:shadow-ios-high-dark overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Total Citizens</CardTitle>
                                        <div className="h-10 w-10 rounded-2xl bg-kenya-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Users className="h-5 w-5 text-kenya-green" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black">{stats.total_users.toLocaleString()}</div>
                                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3 text-kenya-green" />
                                            <span className="text-kenya-green font-bold">+{stats.recent_signups}</span> this week
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="glass-card border-0 shadow-ios-high dark:shadow-ios-high-dark overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Legislative Trace</CardTitle>
                                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Activity className="h-5 w-5 text-primary" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black">{stats.total_bills}</div>
                                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                            <Zap className="h-3 w-3 text-kenya-green" />
                                            <span className="text-kenya-green font-bold">Live Monitoring</span>
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="glass-card border-0 shadow-ios-high dark:shadow-ios-high-dark overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Storage Vault</CardTitle>
                                        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Shield className="h-5 w-5 text-amber-500" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black">B2</div>
                                        <p className="text-[10px] text-muted-foreground mt-1">Private Proxy Active</p>
                                    </CardContent>
                                </Card>

                                <Card className="glass-card border-0 shadow-ios-high dark:shadow-ios-high-dark overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Content Flow</CardTitle>
                                        <div className="h-10 w-10 rounded-2xl bg-kenya-red/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <BookOpen className="h-5 w-5 text-kenya-red" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black">{stats.total_posts + stats.total_resources}</div>
                                        <p className="text-[10px] text-muted-foreground mt-1">Resources & Posts</p>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>
                                Most common administrative tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button
                                    className="h-20 flex flex-col gap-2 rounded-2xl bg-muted/50 hover:bg-muted border-0"
                                    variant="outline"
                                    onClick={() => setActiveTab('appraisal')}
                                >
                                    <Bell className="h-6 w-6" />
                                    <span>Check Notifications</span>
                                    <Badge variant="secondary" className="rounded-xl">{moderationQueue.length}</Badge>
                                </Button>
                                <Button
                                    className="h-20 flex flex-col gap-2 rounded-2xl bg-muted/50 hover:bg-muted border-0"
                                    variant="outline"
                                    onClick={() => setActiveTab('appraisal')}
                                >
                                    <MessageSquare className="h-6 w-6" />
                                    <span>Review Content</span>
                                    <Badge variant="secondary" className="rounded-xl">{stats?.pending_drafts || 0}</Badge>
                                </Button>
                                <Button
                                    className="h-20 flex flex-col gap-2 rounded-2xl bg-muted/50 hover:bg-muted border-0"
                                    variant="outline"
                                    onClick={() => setActiveTab('sessions')}
                                >
                                    <UserCheck className="h-6 w-6" />
                                    <span>User Management</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    System Health
                                </CardTitle>
                                <CardDescription>Current system status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                                    <span className="text-sm font-medium">Resources</span>
                                    <Badge variant="secondary" className="rounded-xl">{stats?.total_resources || 0} items</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                                    <span className="text-sm font-medium">Discussions</span>
                                    <Badge variant="secondary" className="rounded-xl">{stats?.total_discussions || 0} topics</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                                    <span className="text-sm font-medium">Bills Tracked</span>
                                    <Badge variant="secondary" className="rounded-xl">{stats?.total_bills || 0} bills</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-primary" />
                                    Content Moderation
                                </CardTitle>
                                <CardDescription>Items requiring attention</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {moderationQueue.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="h-12 w-12 rounded-2xl bg-kenya-green/10 flex items-center justify-center mx-auto mb-3">
                                            <TrendingUp className="h-6 w-6 text-kenya-green" />
                                        </div>
                                        <p className="text-muted-foreground">No items pending moderation</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {moderationQueue.slice(0, 3).map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                                                <div>
                                                    <p className="font-medium text-sm">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.type} by {item.author}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="rounded-xl">{item.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <BentoAnalyticsDashboard onTabChange={handleTabChange} />
                </TabsContent>

                <TabsContent value="appraisal">
                    <MediaAppraisal />
                </TabsContent>

                <TabsContent value="volunteers">
                    <VolunteerManager />
                </TabsContent>

                <TabsContent value="events">
                    <EventManager />
                </TabsContent>

                <TabsContent value="campaigns">
                    <CampaignManager />
                </TabsContent>

                <TabsContent value="sessions">
                    <AdminSessionManager />
                </TabsContent>

                <TabsContent value="intelligence">
                    <LegislativeIntelligence />
                </TabsContent>

                <TabsContent value="uploads">
                    <BulkUploadManager />
                </TabsContent>

                <TabsContent value="changes">
                    <AppChangeLogger />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default EnhancedAdminDashboard;
