
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Menu, X, ChevronDown, Bell, User, MoreVertical, Globe, Settings, Shield, Search, ChevronRight,
  FileText, PenTool, MessageSquare, Calendar, Heart, LayoutGrid, Radio, Users, Home, BookOpen,
  PlusCircle, Edit3, Activity, TrendingUp, Eye, UserCheck, Clock, AlertTriangle, Download,
  RefreshCw, Plus, Sparkles
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
import AnalyticsDashboard from './AnalyticsDashboard';
import CyberpunkBentoDashboard from './CyberpunkBentoDashboard';
import { CEKALoader } from '@/components/ui/ceka-loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

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

    // Set up real-time subscriptions for live updates
    const setupRealtimeSubscriptions = async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      // Subscribe to profile changes (new users)
      const profilesChannel = supabase
        .channel('admin-profiles-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          console.log('[Dashboard] Profile change detected, refreshing...');
          loadDashboardData();
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
          console.log('[Dashboard] New chat message, refreshing content flow...');
          loadDashboardData();
        })
        .subscribe();

      // Subscribe to notification changes
      const notificationsChannel = supabase
        .channel('admin-notifications-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, () => {
          console.log('[Dashboard] New notification, refreshing queue...');
          adminService.getModerationQueue().then(setModerationQueue);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(profilesChannel);
        supabase.removeChannel(notificationsChannel);
      };
    };

    const cleanupRealtime = setupRealtimeSubscriptions();

    return () => {
      clearInterval(interval);
      cleanupRealtime.then(cleanup => cleanup?.());
    };
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <CEKALoader size="lg" variant="orbit" text="Initializing Tactical Command..." />
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
        <div className="overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 hide-scrollbar">
          <TabsList className="flex h-auto p-1 bg-muted/30 backdrop-blur-sm rounded-2xl w-max lg:w-full">
            <TabsTrigger value="overview" className="rounded-xl px-4 py-3">Overview</TabsTrigger>
            <TabsTrigger value="enhanced" className="rounded-xl px-4 py-3 gap-1">
              <Sparkles className="h-3 w-3" />
              Enhanced
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl px-4 py-3">Analytics</TabsTrigger>
            <TabsTrigger value="appraisal" className="rounded-xl px-4 py-3 gap-2">
              Appraisal
              {moderationQueue.length > 0 && (
                <Badge className="h-4 w-4 p-0 flex items-center justify-center bg-kenya-red text-[8px] animate-pulse">
                  {moderationQueue.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="rounded-xl px-4 py-3">Volunteers</TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl px-4 py-3">Events</TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-xl px-4 py-3">Campaigns</TabsTrigger>
            <TabsTrigger value="uploads" className="rounded-xl px-4 py-3">Uploads</TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-xl px-3 py-3">Sessions</TabsTrigger>
            <TabsTrigger value="intelligence" className="rounded-xl px-3 py-3 gap-1">
              <Activity className="h-3 w-3" />
              Intel
            </TabsTrigger>
            <TabsTrigger value="changes" className="rounded-xl px-3 py-3">Audit</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-3 py-3">System</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats && (
              <>
                <Card className="glass-card border-none shadow-ios-high dark:shadow-ios-high-dark overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-kenya-green transition-all group-hover:w-2" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Citizens</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black">{stats.total_users.toLocaleString()}</div>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <span className="text-kenya-green font-bold">+{stats.recent_signups}</span> signups
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-none shadow-ios-high dark:shadow-ios-high-dark overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all group-hover:w-2" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Legislative Trace</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black">{stats.total_bills}</div>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <span className="text-kenya-green font-bold">Live Monitoring</span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-none shadow-ios-high dark:shadow-ios-high-dark overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 transition-all group-hover:w-2" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Storage Vault</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black">B2</div>
                    <p className="text-[10px] text-muted-foreground mt-1">Private Proxy Active</p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-none shadow-ios-high dark:shadow-ios-high-dark overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-kenya-red transition-all group-hover:w-2" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Content Flow</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
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

        {/* Enhanced Cyberpunk View */}
        <TabsContent value="enhanced" className="-mx-4 -mt-4">
          <CyberpunkBentoDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
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
