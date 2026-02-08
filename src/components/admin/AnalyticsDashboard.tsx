// Analytics Dashboard - iOS-Inspired Real-time Metrics Visualization
// Uses analyticsService for data fetching with Recharts for visualization

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    TrendingUp, Users, FileText, BookOpen, MessageSquare, Eye,
    Download, RefreshCw, Activity, ArrowUp, ArrowDown, Clock
} from 'lucide-react';
import { analyticsService, DashboardMetrics, ActivityDataPoint, TopContent } from '@/services/analyticsService';

const CHART_COLORS = {
    primary: 'hsl(var(--primary))',
    green: '#006600',
    red: '#bb0000',
    amber: '#f59e0b',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    cyan: '#06b6d4'
};

const AnalyticsDashboard = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [activityData, setActivityData] = useState<ActivityDataPoint[]>([]);
    const [topContent, setTopContent] = useState<TopContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { toast } = useToast();

    // Load analytics data
    const loadData = useCallback(async () => {
        try {
            setRefreshing(true);
            const [metricsData, activityResult, contentData] = await Promise.all([
                analyticsService.getDashboardMetrics(),
                analyticsService.getActivityTimeline(30),
                analyticsService.getTopContent(5)
            ]);

            setMetrics(metricsData);
            setActivityData(activityResult);
            setTopContent(contentData);
        } catch (error) {
            console.error('Error loading analytics:', error);
            toast({ title: 'Error', description: 'Failed to load analytics data', variant: 'destructive' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
        // Refresh every 2 minutes
        const interval = setInterval(loadData, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadData]);

    // Export report
    const exportReport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            metrics,
            activityData,
            topContent
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ceka-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Stat card component
    const StatCard = ({ title, value, icon: Icon, change, changeType }: {
        title: string;
        value: number | string;
        icon: React.ElementType;
        change?: number;
        changeType?: 'positive' | 'negative' | 'neutral';
    }) => (
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            {title}
                        </p>
                        <p className="text-2xl font-bold mt-1">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        {change !== undefined && (
                            <div className={`flex items-center gap-1 text-xs mt-1 ${changeType === 'positive' ? 'text-green-600' :
                                changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'
                                }`}>
                                {changeType === 'positive' ? <ArrowUp className="h-3 w-3" /> :
                                    changeType === 'negative' ? <ArrowDown className="h-3 w-3" /> : null}
                                {change > 0 ? '+' : ''}{change}% vs last period
                            </div>
                        )}
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    // Prepare chart data
    const chartData = activityData.map((d) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: d.newUsers,
        posts: d.blogPosts,
        views: d.pageViews,
        chats: d.chatInteractions
    }));

    // Pie chart data
    const contentDistribution = [
        { name: 'Blog Posts', value: metrics?.totalPosts || 0, color: CHART_COLORS.green },
        { name: 'Resources', value: metrics?.totalResources || 0, color: CHART_COLORS.blue },
        { name: 'Discussions', value: metrics?.totalDiscussions || 0, color: CHART_COLORS.purple },
        { name: 'Bills', value: metrics?.totalBills || 0, color: CHART_COLORS.red }
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Platform Analytics</h2>
                    <p className="text-muted-foreground text-sm">
                        Real-time insights and engagement metrics
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={loadData}
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-xl"
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={exportReport} size="sm" className="gap-2 rounded-xl">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Citizens"
                    value={metrics?.totalUsers || 0}
                    icon={Users}
                    change={metrics?.recentSignups ? Math.round((metrics.recentSignups / Math.max(metrics.totalUsers, 1)) * 100) : 0}
                    changeType="positive"
                />
                <StatCard
                    title="Blog Posts"
                    value={metrics?.totalPosts || 0}
                    icon={FileText}
                />
                <StatCard
                    title="Resources"
                    value={metrics?.totalResources || 0}
                    icon={BookOpen}
                />
                <StatCard
                    title="Page Views"
                    value={metrics?.totalPageViews || 0}
                    icon={Eye}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Active Sessions"
                    value={metrics?.activeSessions || 0}
                    icon={Activity}
                />
                <StatCard
                    title="Recent Signups"
                    value={metrics?.recentSignups || 0}
                    icon={Users}
                    change={15}
                    changeType="positive"
                />
                <StatCard
                    title="Chat Interactions"
                    value={metrics?.totalChatInteractions || 0}
                    icon={MessageSquare}
                />
                <StatCard
                    title="Pending Drafts"
                    value={metrics?.pendingDrafts || 0}
                    icon={Clock}
                />
            </div>

            {/* Charts */}
            <Tabs defaultValue="growth" className="space-y-4">
                <TabsList className="bg-muted/50 p-1 rounded-2xl">
                    <TabsTrigger value="growth" className="rounded-xl">User Growth</TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-xl">Activity</TabsTrigger>
                    <TabsTrigger value="content" className="rounded-xl">Content</TabsTrigger>
                </TabsList>

                <TabsContent value="growth">
                    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">User Growth (Last 30 Days)</CardTitle>
                            <CardDescription>New user registrations over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        name="New Users"
                                        stroke={CHART_COLORS.green}
                                        fill="url(#userGradient)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity">
                    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Platform Activity</CardTitle>
                            <CardDescription>Posts, views, and interactions over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px'
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="posts" name="Blog Posts" stroke={CHART_COLORS.blue} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="views" name="Page Views" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="chats" name="Chat" stroke={CHART_COLORS.amber} strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Content Distribution */}
                        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Content Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={contentDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {contentDistribution.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Top Content */}
                        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Top Content</CardTitle>
                                <CardDescription>Most viewed posts</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {topContent.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No content data available</p>
                                ) : (
                                    topContent.map((content, i) => (
                                        <div key={content.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl">
                                            <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{content.title}</p>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                <Eye className="h-3 w-3 mr-1" />
                                                {content.views?.toLocaleString() || 0}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AnalyticsDashboard;
