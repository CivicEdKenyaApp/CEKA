
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  FileText,
  Calendar,
  Activity,
  Bell,
  Shield,
  BarChart3,
  Settings,
  TrendingUp,
  Eye,
  MessageSquare,
  UserCheck,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';
import { adminService, AdminDashboardStats, UserActivityStats, ModerationQueueItem } from '@/services/adminService';
import { AdminSessionManager } from './AdminSessionManager';
import AppChangeLogger from './AppChangeLogger';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const EnhancedAdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [activityStats, setActivityStats] = useState<UserActivityStats[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();

    // Set up periodic refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [dashboardStats, userActivity, queue] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUserActivityStats(),
        adminService.getModerationQueue()
      ]);

      setStats(dashboardStats);
      setActivityStats(userActivity);
      setModerationQueue(queue);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      // Download as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ceka-weekly-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading enhanced admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Tactical Command</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Live Platform Intelligence & Audit</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleGenerateReport} variant="outline" className="rounded-2xl h-12 font-bold border-2 gap-2">
            <Download className="h-4 w-4" />
            Weekly Intelligence (.json)
          </Button>
          <Button onClick={handleUpdateMetrics} className="rounded-2xl h-12 font-bold bg-primary shadow-xl shadow-primary/20 gap-2">
            <Activity className="h-4 w-4" />
            Recalibrate Metrics
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="moderation">Content</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="changes">App Changes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.recent_signups || 0} new this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_posts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pending_drafts || 0} pending review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_views || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Avg {Math.round(stats?.avg_daily_users || 0)} daily users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.active_sessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Admin sessions active
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Most common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col gap-2" variant="outline">
                  <Bell className="h-6 w-6" />
                  <span>Check Notifications</span>
                  <Badge variant="secondary">{moderationQueue.length}</Badge>
                </Button>
                <Button className="h-20 flex flex-col gap-2" variant="outline">
                  <MessageSquare className="h-6 w-6" />
                  <span>Review Content</span>
                  <Badge variant="secondary">{stats?.pending_drafts || 0}</Badge>
                </Button>
                <Button className="h-20 flex flex-col gap-2" variant="outline">
                  <UserCheck className="h-6 w-6" />
                  <span>User Management</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Resources</span>
                  <Badge variant="secondary">{stats?.total_resources || 0} items</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Discussions</span>
                  <Badge variant="secondary">{stats?.total_discussions || 0} topics</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bills Tracked</span>
                  <Badge variant="secondary">{stats?.total_bills || 0} bills</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {moderationQueue.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No items pending moderation
                  </p>
                ) : (
                  <div className="space-y-2">
                    {moderationQueue.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.type} by {item.author}
                          </p>
                        </div>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                User Activity (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="new_users" stroke="#8884d8" name="New Users" />
                  <Line type="monotone" dataKey="active_users" stroke="#82ca9d" name="Active Users" />
                  <Line type="monotone" dataKey="blog_posts" stroke="#ffc658" name="Blog Posts" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={activityStats.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="blog_posts" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={activityStats.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="discussions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Content Moderation Queue
              </CardTitle>
              <CardDescription>
                Review and manage user-generated content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {moderationQueue.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No content pending moderation
                </p>
              ) : (
                <div className="space-y-4">
                  {moderationQueue.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.type} by {item.author} • {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={item.status === 'pending' ? 'secondary' : 'outline'}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.content_preview}...
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">Approve</Button>
                        <Button size="sm" variant="destructive">Reject</Button>
                        <Button size="sm" variant="outline">Review</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <AdminSessionManager />
        </TabsContent>

        <TabsContent value="changes">
          <AppChangeLogger />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Update System Metrics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Database Status</span>
                  <Badge variant="secondary">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Backup</span>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">System Version</span>
                  <span className="text-sm text-muted-foreground">v2.1.0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAdminDashboard;
