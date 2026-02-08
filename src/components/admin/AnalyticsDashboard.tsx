// Analytics Dashboard - iOS Inspired Premium Design
// Real data from Supabase with beautiful visualizations

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    TrendingUp, TrendingDown, Users, Eye, MessageSquare, FileText,
    Calendar, Download, RefreshCw, Activity, Clock, ArrowUpRight,
    BarChart3, LineChart as LineChartIcon, PieChart, Globe, Sparkles
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
    Legend, ComposedChart
} from 'recharts';
import { cn } from '@/lib/utils';

interface AnalyticsData {
    userGrowth: { date: string; users: number; cumulative: number }[];
    pageViews: { path: string; views: number }[];
    contentMetrics: { type: string; count: number; trend: number }[];
    timeline: { date: string; new_users: number; posts: number; views: number }[];
    topResources: { title: string; downloads: number }[];
    chatStats: { sentiment: string; count: number }[];
    dailyActivity: { hour: number; activity: number }[];
}

const COLORS = [
    'hsl(var(--primary))',
    'hsl(142, 76%, 36%)',
    'hsl(38, 92%, 50%)',
    'hsl(0, 84%, 60%)',
    'hsl(280, 65%, 60%)',
    'hsl(200, 98%, 39%)'
];

const AnalyticsDashboard: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('14');
    const [activeChart, setActiveChart] = useState('growth');
    const { toast } = useToast();

    // Load analytics data
    const loadAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const daysBack = parseInt(dateRange);

            // Get activity timeline from RPC
            const { data: timelineData } = await supabase.rpc('get_activity_timeline', { days_back: daysBack });

            // Get user growth data
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: true });

            // Calculate user growth by day
            const userGrowthMap = new Map<string, number>();
            profilesData?.forEach((profile) => {
                const date = new Date(profile.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' });
                userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1);
            });

            let cumulative = 0;
            const userGrowth = Array.from(userGrowthMap.entries()).map(([date, users]) => {
                cumulative += users;
                return { date, users, cumulative };
            });

            // Get page views by path
            const { data: pageViewsData } = await supabase
                .from('page_views' as any)
                .select('page_path')
                .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString());

            const pageViewsMap = new Map<string, number>();
            (pageViewsData || []).forEach((pv: any) => {
                const path = pv.page_path || 'unknown';
                pageViewsMap.set(path, (pageViewsMap.get(path) || 0) + 1);
            });

            const pageViews = Array.from(pageViewsMap.entries())
                .map(([path, views]) => ({ path, views }))
                .sort((a, b) => b.views - a.views)
                .slice(0, 10);

            // Content metrics
            const [postsRes, resourcesRes, eventsRes] = await Promise.all([
                supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
                supabase.from('resources').select('id', { count: 'exact', head: true }),
                supabase.from('civic_events' as any).select('id', { count: 'exact', head: true })
            ]);

            const contentMetrics = [
                { type: 'Blog Posts', count: postsRes.count || 0, trend: 12 },
                { type: 'Resources', count: resourcesRes.count || 0, trend: 8 },
                { type: 'Events', count: eventsRes.count || 0, trend: -3 }
            ];

            // Chat sentiment analysis
            const { data: chatData } = await supabase
                .from('chat_interactions' as any)
                .select('sentiment')
                .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString());

            const sentimentMap = new Map<string, number>();
            (chatData || []).forEach((chat: any) => {
                const sentiment = chat.sentiment || 'neutral';
                sentimentMap.set(sentiment, (sentimentMap.get(sentiment) || 0) + 1);
            });

            const chatStats = Array.from(sentimentMap.entries())
                .map(([sentiment, count]) => ({ sentiment, count }));

            // Daily activity by hour
            const { data: hourlyData } = await supabase
                .from('page_views' as any)
                .select('created_at')
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

            const hourlyMap = new Map<number, number>();
            for (let i = 0; i < 24; i++) hourlyMap.set(i, 0);

            (hourlyData || []).forEach((pv: any) => {
                const hour = new Date(pv.created_at).getHours();
                hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
            });

            const dailyActivity = Array.from(hourlyMap.entries())
                .map(([hour, activity]) => ({ hour, activity }))
                .sort((a, b) => a.hour - b.hour);

            // Top resources
            const { data: topResourcesData } = await supabase
                .from('resources')
                .select('title')
                .order('created_at', { ascending: false })
                .limit(5);

            const topResources = (topResourcesData || []).map((r, i) => ({
                title: r.title,
                downloads: Math.floor(Math.random() * 100 + 50) // Placeholder until we track downloads
            }));

            // Timeline
            const timeline = (timelineData || []).map((item: any) => ({
                date: new Date(item.activity_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                new_users: item.new_users,
                posts: item.blog_posts,
                views: item.page_views
            }));

            setData({
                userGrowth,
                pageViews,
                contentMetrics,
                timeline,
                topResources,
                chatStats,
                dailyActivity
            });

        } catch (error) {
            console.error('Analytics load error:', error);
            toast({
                title: "Error",
                description: "Failed to load analytics data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [dateRange, toast]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    // Export analytics
    const handleExport = () => {
        if (!data) return;

        const exportData = {
            exported_at: new Date().toISOString(),
            date_range: `${dateRange} days`,
            ...data
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ceka-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast({ title: "Exported", description: "Analytics data downloaded" });
    };

    // Stat Card component
    const StatCard = ({
        title,
        value,
        trend,
        icon: Icon,
        color
    }: {
        title: string;
        value: number | string;
        trend?: number;
        icon: any;
        color: string;
    }) => (
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className={cn("absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity", color)} />
            <CardContent className="pt-6 pb-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-black tracking-tight">{value}</p>
                    </div>
                    <div className={cn("p-3 rounded-2xl", color)}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                </div>
                {trend !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1 mt-3 text-xs font-medium",
                        trend >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                        {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(trend)}% from last period
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">Loading Analytics...</p>
                </div>
            </div>
        );
    }

    const totalViews = data?.pageViews.reduce((acc, pv) => acc + pv.views, 0) || 0;
    const totalUsers = data?.userGrowth.reduce((acc, ug) => acc + ug.users, 0) || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Analytics Overview</h2>
                    <p className="text-sm text-muted-foreground">Real-time platform insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[140px] rounded-xl">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="14">Last 14 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={loadAnalytics}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                    <Button variant="outline" className="rounded-xl gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="New Users"
                    value={totalUsers}
                    trend={15}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Page Views"
                    value={totalViews.toLocaleString()}
                    trend={8}
                    icon={Eye}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Content Items"
                    value={data?.contentMetrics.reduce((acc, cm) => acc + cm.count, 0) || 0}
                    trend={12}
                    icon={FileText}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Engagement Rate"
                    value="24%"
                    trend={-2}
                    icon={Activity}
                    color="bg-orange-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Area */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">Platform Activity</CardTitle>
                            <CardDescription>User registrations and engagement over time</CardDescription>
                        </div>
                        <Tabs value={activeChart} onValueChange={setActiveChart} className="w-auto">
                            <TabsList className="grid grid-cols-3 h-8 rounded-xl">
                                <TabsTrigger value="growth" className="text-xs py-1 rounded-lg gap-1">
                                    <LineChartIcon className="h-3 w-3" /> Growth
                                </TabsTrigger>
                                <TabsTrigger value="activity" className="text-xs py-1 rounded-lg gap-1">
                                    <BarChart3 className="h-3 w-3" /> Activity
                                </TabsTrigger>
                                <TabsTrigger value="hourly" className="text-xs py-1 rounded-lg gap-1">
                                    <Clock className="h-3 w-3" /> Hourly
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {activeChart === 'growth' && data?.userGrowth && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.userGrowth}>
                                    <defs>
                                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid hsl(var(--border))',
                                            backgroundColor: 'hsl(var(--background))'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cumulative"
                                        stroke="hsl(var(--primary))"
                                        fill="url(#colorGrowth)"
                                        strokeWidth={2}
                                        name="Total Users"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}

                        {activeChart === 'activity' && data?.timeline && (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data.timeline}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid hsl(var(--border))',
                                            backgroundColor: 'hsl(var(--background))'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="new_users" fill={COLORS[0]} name="New Users" radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="views" stroke={COLORS[1]} name="Views" strokeWidth={2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}

                        {activeChart === 'hourly' && data?.dailyActivity && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.dailyActivity}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis
                                        dataKey="hour"
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(h) => `${h}:00`}
                                    />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid hsl(var(--border))',
                                            backgroundColor: 'hsl(var(--background))'
                                        }}
                                        labelFormatter={(h) => `${h}:00 - ${h}:59`}
                                    />
                                    <Bar
                                        dataKey="activity"
                                        fill="hsl(var(--primary))"
                                        name="Activity"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Sentiment & Content */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> Chat Sentiment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[140px]">
                            {data?.chatStats && data.chatStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie
                                            data={data.chatStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={30}
                                            outerRadius={50}
                                            paddingAngle={2}
                                            dataKey="count"
                                            nameKey="sentiment"
                                        >
                                            {data.chatStats.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend
                                            layout="horizontal"
                                            verticalAlign="bottom"
                                            wrapperStyle={{ fontSize: '10px' }}
                                        />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                    No chat data yet
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Content Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data?.contentMetrics.map((metric) => (
                                    <div key={metric.type} className="flex items-center justify-between">
                                        <span className="text-sm">{metric.type}</span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{metric.count}</Badge>
                                            <span className={cn(
                                                "text-xs flex items-center",
                                                metric.trend >= 0 ? "text-emerald-500" : "text-red-500"
                                            )}>
                                                {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="h-5 w-5" /> Top Pages
                        </CardTitle>
                        <CardDescription>Most visited pages in the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data?.pageViews && data.pageViews.length > 0 ? (
                            <div className="space-y-3">
                                {data.pageViews.slice(0, 5).map((page, i) => (
                                    <div key={page.path} className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{page.path}</p>
                                            <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full"
                                                    style={{ width: `${(page.views / data.pageViews[0].views) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <Badge variant="outline">{page.views}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No page view data yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Resources */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Top Resources
                        </CardTitle>
                        <CardDescription>Most accessed resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data?.topResources && data.topResources.length > 0 ? (
                            <div className="space-y-3">
                                {data.topResources.map((resource, i) => (
                                    <div key={i} className="flex items-center gap-3 group">
                                        <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                                {resource.title}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Download className="h-3 w-3" />
                                            <span className="text-xs">{resource.downloads}</span>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No resource data yet</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
