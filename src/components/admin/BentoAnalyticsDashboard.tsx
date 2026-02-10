// Bento Analytics Dashboard - iOS-Inspired Grid Layout with Modals
// Deep links to individual tabs, real-time metrics, premium glassmorphism design

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts';
import {
    TrendingUp, Users, FileText, BookOpen, MessageSquare, Eye,
    Download, RefreshCw, Activity, ArrowUp, ArrowDown, Clock,
    Calendar, Shield, Database, Globe, Zap, Heart, Star, Target,
    ChevronRight, ExternalLink, Maximize2, X, Sparkles, BarChart3,
    PieChartIcon, TrendingDown, Flame, Award, Layers, UserPlus
} from 'lucide-react';
import { analyticsService, DashboardMetrics, ActivityDataPoint, TopContent } from '@/services/analyticsService';
import { CEKALoader } from '@/components/ui/ceka-loader';

// Premium color palette
const CHART_COLORS = {
    primary: '#006600',
    secondary: '#bb0000',
    accent: '#f59e0b',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    emerald: '#10b981',
    rose: '#f43f5e',
    orange: '#f97316',
    indigo: '#6366f1'
};

const BENTO_COLORS = [
    'from-emerald-500/20 via-emerald-500/10 to-transparent',
    'from-blue-500/20 via-blue-500/10 to-transparent',
    'from-purple-500/20 via-purple-500/10 to-transparent',
    'from-amber-500/20 via-amber-500/10 to-transparent',
    'from-rose-500/20 via-rose-500/10 to-transparent',
    'from-cyan-500/20 via-cyan-500/10 to-transparent'
];

interface BentoCardProps {
    title: string;
    value: number | string;
    icon: React.ElementType;
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
    color: string;
    description?: string;
    tabLink?: string;
    onTabClick?: (tab: string) => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    children?: React.ReactNode;
    chart?: React.ReactNode;
    sparklineData?: number[];
}

// Sparkline mini chart
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - ((v - min) / range) * 100
    }));
    const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
        <svg viewBox="0 0 100 40" className="w-full h-8 overflow-visible">
            <defs>
                <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`${path} L 100,40 L 0,40 Z`} fill={`url(#spark-${color})`} />
        </svg>
    );
};

// Individual Bento Card with Modal
const BentoCard = ({
    title, value, icon: Icon, change, changeType, color, description,
    tabLink, onTabClick, size = 'md', children, chart, sparklineData
}: BentoCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const sizeClasses = {
        sm: 'col-span-1 row-span-1',
        md: 'col-span-1 row-span-1 md:col-span-1',
        lg: 'col-span-1 row-span-1 md:col-span-2',
        xl: 'col-span-1 row-span-2 md:col-span-2 md:row-span-2'
    };

    const handleDeepLink = () => {
        if (tabLink && onTabClick) {
            onTabClick(tabLink);
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${sizeClasses[size]} cursor-pointer`}
                >
                    <Card className={`relative h-full overflow-hidden border-0 bg-gradient-to-br ${color} backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 group`}>
                        {/* Glassmorphism overlay */}
                        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm" />

                        {/* Animated gradient border */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <CardContent className="relative p-4 h-full flex flex-col justify-between z-10">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">
                                        {title}
                                    </p>
                                    <p className="text-2xl md:text-3xl font-black tracking-tight">
                                        {typeof value === 'number' ? value.toLocaleString() : value}
                                    </p>
                                    {change !== undefined && (
                                        <div className={`flex items-center gap-1 text-xs mt-1 ${changeType === 'positive' ? 'text-emerald-500' :
                                            changeType === 'negative' ? 'text-rose-500' : 'text-muted-foreground'
                                            }`}>
                                            {changeType === 'positive' ? <ArrowUp className="h-3 w-3" /> :
                                                changeType === 'negative' ? <ArrowDown className="h-3 w-3" /> :
                                                    <Activity className="h-3 w-3" />}
                                            <span className="font-semibold">{change > 0 ? '+' : ''}{change}%</span>
                                        </div>
                                    )}
                                </div>
                                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                            </div>

                            {/* Sparkline */}
                            {sparklineData && sparklineData.length > 0 && (
                                <div className="mt-3">
                                    <Sparkline data={sparklineData} color={CHART_COLORS.primary} />
                                </div>
                            )}

                            {/* Mini chart */}
                            {chart && (
                                <div className="mt-3 h-16">
                                    {chart}
                                </div>
                            )}

                            {children}

                            {/* Expand indicator */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-0 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black">{title}</DialogTitle>
                                <DialogDescription>{description || `Detailed analytics for ${title.toLowerCase()}`}</DialogDescription>
                            </div>
                        </div>
                        {tabLink && (
                            <Button onClick={handleDeepLink} className="gap-2 rounded-xl">
                                View Full Tab
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    {/* Large stat display */}
                    <div className="text-center py-8 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl">
                        <p className="text-6xl font-black tracking-tight text-primary">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        {change !== undefined && (
                            <div className={`flex items-center justify-center gap-2 text-lg mt-2 ${changeType === 'positive' ? 'text-emerald-500' :
                                changeType === 'negative' ? 'text-rose-500' : 'text-muted-foreground'
                                }`}>
                                {changeType === 'positive' ? <TrendingUp className="h-5 w-5" /> :
                                    changeType === 'negative' ? <TrendingDown className="h-5 w-5" /> :
                                        <Activity className="h-5 w-5" />}
                                <span className="font-bold">{change > 0 ? '+' : ''}{change}% vs last period</span>
                            </div>
                        )}
                    </div>

                    {/* Placeholder for detailed charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-0 bg-muted/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Trend Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48 flex items-center justify-center text-muted-foreground">
                                    <BarChart3 className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 bg-muted/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48 flex items-center justify-center text-muted-foreground">
                                    <PieChartIcon className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

interface BentoAnalyticsDashboardProps {
    onTabChange?: (tab: string) => void;
}

const BentoAnalyticsDashboard = ({ onTabChange }: BentoAnalyticsDashboardProps) => {
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

    // Prepare sparkline data
    const userSparkline = activityData.slice(-14).map(d => d.newUsers);
    const postsSparkline = activityData.slice(-14).map(d => d.blogPosts);
    const viewsSparkline = activityData.slice(-14).map(d => d.pageViews);
    const chatSparkline = activityData.slice(-14).map(d => d.chatInteractions);

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
        { name: 'Blog Posts', value: metrics?.totalPosts || 0, color: CHART_COLORS.primary },
        { name: 'Resources', value: metrics?.totalResources || 0, color: CHART_COLORS.blue },
        { name: 'Discussions', value: metrics?.totalDiscussions || 0, color: CHART_COLORS.purple },
        { name: 'Bills', value: metrics?.totalBills || 0, color: CHART_COLORS.secondary }
    ].filter(d => d.value > 0);

    // Radial progress data
    const engagementScore = Math.min(100, Math.round(
        ((metrics?.totalPageViews || 0) + (metrics?.totalChatInteractions || 0)) /
        Math.max(1, metrics?.totalUsers || 1) * 10
    ));

    const radialData = [{ name: 'Engagement', value: engagementScore, fill: CHART_COLORS.primary }];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <CEKALoader variant="scanning" size="lg" text="Processing Platform Intelligence..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Platform Intelligence
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Real-time metrics and engagement analytics
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
                        {refreshing ? <CEKALoader variant="ios" size="sm" /> : <RefreshCw className="h-4 w-4" />}
                        Refresh
                    </Button>
                    <Button onClick={exportReport} size="sm" className="gap-2 rounded-xl">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[120px] md:auto-rows-[140px]">
                {/* Total Citizens - Large */}
                <BentoCard
                    title="Total Citizens"
                    value={metrics?.totalUsers || 0}
                    icon={Users}
                    change={metrics?.recentSignups ? Math.round((metrics.recentSignups / Math.max(metrics.totalUsers, 1)) * 100) : 0}
                    changeType="positive"
                    color={BENTO_COLORS[0]}
                    tabLink="users"
                    onTabClick={onTabChange}
                    size="lg"
                    sparklineData={userSparkline}
                    description="Total registered users on the platform"
                />

                {/* Blog Posts */}
                <BentoCard
                    title="Blog Posts"
                    value={metrics?.totalPosts || 0}
                    icon={FileText}
                    color={BENTO_COLORS[1]}
                    tabLink="content"
                    onTabClick={onTabChange}
                    sparklineData={postsSparkline}
                    description="Published articles and civic content"
                />

                {/* Resources */}
                <BentoCard
                    title="Resources"
                    value={metrics?.totalResources || 0}
                    icon={BookOpen}
                    color={BENTO_COLORS[2]}
                    tabLink="uploads"
                    onTabClick={onTabChange}
                    description="Documents, PDFs and educational materials"
                />

                {/* Active Sessions */}
                <BentoCard
                    title="Active Sessions"
                    value={metrics?.activeSessions || 0}
                    icon={Activity}
                    color={BENTO_COLORS[3]}
                    tabLink="sessions"
                    onTabClick={onTabChange}
                    description="Currently active admin sessions"
                />

                {/* Page Views - Large */}
                <BentoCard
                    title="Page Views"
                    value={metrics?.totalPageViews || 0}
                    icon={Eye}
                    color={BENTO_COLORS[4]}
                    tabLink="analytics"
                    onTabClick={onTabChange}
                    size="lg"
                    sparklineData={viewsSparkline}
                    description="Total page impressions across the platform"
                />

                {/* Recent Signups */}
                <BentoCard
                    title="Recent Signups"
                    value={metrics?.recentSignups || 0}
                    icon={UserPlus}
                    change={15}
                    changeType="positive"
                    color={BENTO_COLORS[5]}
                    tabLink="users"
                    onTabClick={onTabChange}
                    description="New users in the last 7 days"
                />

                {/* Chat Interactions */}
                <BentoCard
                    title="AI Interactions"
                    value={metrics?.totalChatInteractions || 0}
                    icon={MessageSquare}
                    color={BENTO_COLORS[0]}
                    sparklineData={chatSparkline}
                    description="CEKA AI assistant conversations"
                />

                {/* Pending Drafts */}
                <BentoCard
                    title="Pending Drafts"
                    value={metrics?.pendingDrafts || 0}
                    icon={Clock}
                    color={BENTO_COLORS[1]}
                    tabLink="appraisal"
                    onTabClick={onTabChange}
                    description="Content awaiting review and approval"
                />

                {/* Bills Tracked */}
                <BentoCard
                    title="Bills Tracked"
                    value={metrics?.totalBills || 0}
                    icon={Shield}
                    color={BENTO_COLORS[2]}
                    tabLink="intelligence"
                    onTabClick={onTabChange}
                    description="Legislative bills under monitoring"
                />

                {/* Discussions */}
                <BentoCard
                    title="Discussions"
                    value={metrics?.totalDiscussions || 0}
                    icon={MessageSquare}
                    color={BENTO_COLORS[3]}
                    description="Forum topics and community discussions"
                />

                {/* Engagement Chart - Extra Large */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="col-span-2 row-span-2 md:col-span-2 lg:col-span-3"
                >
                    <Card className="h-full border-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 backdrop-blur-xl shadow-lg">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold">User Growth Trend</CardTitle>
                                    <CardDescription>Last 30 days activity</CardDescription>
                                </div>
                                <Badge variant="outline" className="rounded-xl">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Live
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-80px)]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="userGradientBento" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                                    <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: 'none',
                                            borderRadius: '16px',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        name="New Users"
                                        stroke={CHART_COLORS.primary}
                                        fill="url(#userGradientBento)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Content Distribution - Large */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="col-span-2 row-span-2 md:col-span-2 lg:col-span-3"
                >
                    <Card className="h-full border-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 backdrop-blur-xl shadow-lg">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold">Content Distribution</CardTitle>
                                    <CardDescription>Breakdown by type</CardDescription>
                                </div>
                                <Badge variant="outline" className="rounded-xl">
                                    <Layers className="h-3 w-3 mr-1" />
                                    {contentDistribution.reduce((a, b) => a + b.value, 0)} Total
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-80px)] flex items-center">
                            <ResponsiveContainer width="50%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={contentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="50%"
                                        outerRadius="80%"
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {contentDistribution.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {contentDistribution.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Engagement Score - Radial */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="col-span-2 row-span-1"
                >
                    <Card className="h-full border-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent backdrop-blur-xl shadow-lg">
                        <CardContent className="h-full flex items-center gap-4 p-4">
                            <div className="w-24 h-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        innerRadius="70%"
                                        outerRadius="100%"
                                        data={radialData}
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        <RadialBar background dataKey="value" cornerRadius={10} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Engagement Score
                                </p>
                                <p className="text-3xl font-black text-primary">{engagementScore}%</p>
                                <p className="text-xs text-muted-foreground">Based on views & interactions</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Content Preview */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="col-span-2 row-span-1 md:col-span-2"
                >
                    <Card className="h-full border-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent backdrop-blur-xl shadow-lg overflow-hidden">
                        <CardContent className="h-full flex flex-col p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Top Content
                                </p>
                                <Star className="h-4 w-4 text-amber-500" />
                            </div>
                            <div className="flex-1 space-y-1 overflow-hidden">
                                {topContent.slice(0, 3).map((content, i) => (
                                    <div key={content.id} className="flex items-center gap-2 text-sm">
                                        <span className="font-bold text-muted-foreground w-4">{i + 1}</span>
                                        <span className="truncate flex-1">{content.title}</span>
                                        <Badge variant="outline" className="text-[10px] h-5">
                                            {content.views}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Activity Line Chart */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-xl">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold">Platform Activity</CardTitle>
                            <CardDescription>Posts, views, and interactions over time</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: 'none',
                                    borderRadius: '16px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="posts" name="Blog Posts" stroke={CHART_COLORS.blue} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="views" name="Page Views" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="chats" name="AI Chats" stroke={CHART_COLORS.accent} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default BentoAnalyticsDashboard;
