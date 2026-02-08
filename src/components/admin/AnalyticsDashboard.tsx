// Analytics Dashboard Component
// Real-time data visualization for admin metrics

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { analyticsService, DashboardMetrics, ActivityDataPoint } from '@/services/analyticsService';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Users, FileText, BookOpen, Scale, Activity, TrendingUp, TrendingDown,
    Eye, MessageSquare, Calendar, Clock, RefreshCw, Download, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#16a34a', '#dc2626', '#2563eb', '#d97706', '#7c3aed', '#0891b2'];

const AnalyticsDashboard = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [timeline, setTimeline] = useState<ActivityDataPoint[]>([]);
    const [topContent, setTopContent] = useState<any[]>([]);
    const [userGrowth, setUserGrowth] = useState<any[]>([]);
    const [billsData, setBillsData] = useState<any>(null);
    const [resourcesData, setResourcesData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        loadAllData();
        // Refresh every 30 seconds
        const interval = setInterval(loadAllData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const [metricsData, timelineData, topContentData, growthData, bills, resources] = await Promise.all([
                analyticsService.getDashboardMetrics(),
                analyticsService.getActivityTimeline(30),
                analyticsService.getTopContent(5),
                analyticsService.getUserGrowth(),
                analyticsService.getBillsAnalytics(),
                analyticsService.getResourcesAnalytics()
            ]);

            setMetrics(metricsData);
            setTimeline(timelineData);
            setTopContent(topContentData);
            setUserGrowth(growthData);
            setBillsData(bills);
            setResourcesData(resources);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            metrics,
            timeline,
            topContent,
            userGrowth,
            billsData,
            resourcesData
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ceka-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const MetricCard = ({ icon: Icon, label, value, change, color }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            <Card className="overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                            <p className="text-2xl font-bold mt-1">{value?.toLocaleString() || 0}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                            <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
                        </div>
                    </div>
                    {change !== undefined && (
                        <div className="flex items-center gap-1 mt-2 text-xs">
                            {change >= 0 ? (
                                <>
                                    <TrendingUp className="h-3 w-3 text-kenya-green" />
                                    <span className="text-kenya-green">+{change}%</span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="h-3 w-3 text-kenya-red" />
                                    <span className="text-kenya-red">{change}%</span>
                                </>
                            )}
                            <span className="text-muted-foreground">vs last week</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );

    if (loading && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Platform Analytics</h2>
                    <p className="text-sm text-muted-foreground">
                        Real-time insights from your civic education platform
                        {lastUpdated && (
                            <span className="ml-2">• Updated {lastUpdated.toLocaleTimeString()}</span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadAllData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={exportReport}>
                        <Download className="h-4 w-4 mr-1" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <MetricCard icon={Users} label="Total Users" value={metrics?.totalUsers} color="bg-blue-500" />
                <MetricCard icon={FileText} label="Blog Posts" value={metrics?.totalPosts} color="bg-kenya-green" />
                <MetricCard icon={BookOpen} label="Resources" value={metrics?.totalResources} color="bg-purple-500" />
                <MetricCard icon={Scale} label="Bills Tracked" value={metrics?.totalBills} color="bg-kenya-red" />
                <MetricCard icon={Activity} label="Active Sessions" value={metrics?.activeSessions} color="bg-orange-500" />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard icon={Zap} label="New This Week" value={metrics?.recentSignups} change={15} color="bg-cyan-500" />
                <MetricCard icon={Clock} label="Pending Drafts" value={metrics?.pendingDrafts} color="bg-yellow-500" />
                <MetricCard icon={MessageSquare} label="Discussions" value={metrics?.totalDiscussions} color="bg-indigo-500" />
                <MetricCard icon={Eye} label="Page Views" value={metrics?.totalPageViews} color="bg-pink-500" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">User Activity Timeline</CardTitle>
                        <CardDescription>New users, posts, and engagement over 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeline}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        fontSize={12}
                                    />
                                    <YAxis fontSize={12} />
                                    <Tooltip
                                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="newUsers" name="New Users" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                                    <Area type="monotone" dataKey="blogPosts" name="Blog Posts" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} />
                                    <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#d97706" fill="#d97706" fillOpacity={0.1} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* User Growth */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">User Growth</CardTitle>
                        <CardDescription>Growth trends comparison</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="period" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                    <Bar dataKey="users" name="Users" fill="#16a34a" radius={[4, 4, 0, 0]}>
                                        {userGrowth.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bills by Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Bills by Status</CardTitle>
                        <CardDescription>Distribution of {billsData?.total || 0} tracked bills</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={Object.entries(billsData?.byStatus || {}).map(([name, value]) => ({ name, value }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {Object.entries(billsData?.byStatus || {}).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Resources by Category */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Resources by Category</CardTitle>
                        <CardDescription>{resourcesData?.total || 0} total resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(resourcesData?.byCategory || {}).slice(0, 5).map(([category, count], i) => (
                                <div key={category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="truncate">{category}</span>
                                        <span className="font-medium">{count as number}</span>
                                    </div>
                                    <Progress
                                        value={((count as number) / (resourcesData?.total || 1)) * 100}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Top Content</CardTitle>
                        <CardDescription>Most viewed items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topContent.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No content data yet</p>
                            ) : (
                                topContent.map((item, i) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" /> {item.views}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kenya-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-kenya-green"></span>
                </span>
                <span>Live data • Auto-refreshes every 30 seconds</span>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
