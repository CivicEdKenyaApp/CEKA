import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useEnhancedAdmin } from '@/hooks/useEnhancedAdmin';
import { useToast } from '@/hooks/use-toast';
import { Bell, FileText, Calendar, CheckCircle, XCircle, Clock, Settings } from 'lucide-react';
import EnhancedAdminDashboard from './EnhancedAdminDashboard';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import FuzzyText from '../ui/FuzzyText';
import { CEKALoader } from '@/components/ui/ceka-loader';

const AdminDashboard = () => {
  const { isAdmin, isLoading, sessionLimited } = useAdminAccess();
  const [showEnhanced, setShowEnhanced] = useState(true); // Default to enhanced view

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <CEKALoader variant="scanning" size="xl" text="Verifying Sovereign Credentials..." />
          </div>
        </div>
      </div>
    );
  }

  if (sessionLimited) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="text-center text-red-600">Session Limit Reached</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Maximum of 3 concurrent admin sessions allowed. Please try again later or contact system administrator.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-12">
          <div className="space-y-4">
            <FuzzyText
              baseIntensity={0.2}
              hoverIntensity={0.5}
              enableHover
              color="#ef4444"
              fontSize="clamp(3rem, 15vw, 12rem)"
            >
              403
            </FuzzyText>
            <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-red-500/80">Sovereign Access Required</h2>
          </div>

          <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md mx-auto">
            Administrative entry is restricted to authorized personnel.
            Discursive credentials must be verified via the National Civic Registry.
          </p>

          <div className="pt-8">
            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-2xl h-14 px-8 font-bold uppercase tracking-widest text-xs">
              <a href="/">Return to Perimeter</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show enhanced dashboard
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">CEKA Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive system management and analytics for civic education platform
            </p>
          </div>
          <Button
            onClick={() => setShowEnhanced(!showEnhanced)}
            variant={showEnhanced ? "default" : "outline"}
            className="bg-kenya-green hover:bg-kenya-green/90"
          >
            <Settings className="mr-2 h-4 w-4" />
            {showEnhanced ? 'Basic View' : 'Enhanced View'}
          </Button>
        </div>

        {showEnhanced ? <EnhancedAdminDashboard /> : <BasicAdminDashboard />}
      </div>
    </div>
  );
};

// Keep the existing basic dashboard as a fallback
const BasicAdminDashboard = () => {
  const {
    notifications,
    draftPosts,
    isAdmin,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updatePostStatus,
    schedulePost,
    rejectPost,
    refreshAdminData
  } = useEnhancedAdmin();

  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <CEKALoader variant="scanning" size="lg" text="Syncing Admin Core..." />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Access denied. Admin privileges required.</div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  const handlePublishPost = async (postId: string) => {
    try {
      await updatePostStatus(postId, 'published', adminNotes);
      toast({
        title: "Success",
        description: "Post has been published successfully.",
      });
      setAdminNotes('');
      await refreshAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectPost = async (postId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason.",
        variant: "destructive",
      });
      return;
    }

    try {
      await rejectPost(postId, rejectionReason);
      toast({
        title: "Success",
        description: "Post has been rejected.",
      });
      setRejectionReason('');
      setSelectedPost(null);
      await refreshAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSchedulePost = async (postId: string) => {
    if (!scheduledDate) {
      toast({
        title: "Error",
        description: "Please select a scheduled date.",
        variant: "destructive",
      });
      return;
    }

    try {
      await schedulePost(postId, scheduledDate);
      toast({
        title: "Success",
        description: "Post has been scheduled successfully.",
      });
      setScheduledDate('');
      await refreshAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Basic Admin Dashboard</h2>
        <Button
          onClick={refreshAdminData}
          variant="outline"
        >
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadNotifications}</div>
            <p className="text-xs text-muted-foreground">
              Unread notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftPosts.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {draftPosts.filter(post => post.scheduled_at).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Notifications</CardTitle>
            {unreadNotifications > 0 && (
              <Button
                onClick={markAllNotificationsAsRead}
                variant="outline"
                size="sm"
              >
                Mark All Read
              </Button>
            )}
          </div>
          <CardDescription>
            Stay updated with system activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground">No notifications available.</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${!notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {!notification.is_read && (
                    <Button
                      onClick={() => markNotificationAsRead(notification.id)}
                      variant="ghost"
                      size="sm"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Draft Posts Management */}
      <Card>
        <CardHeader>
          <CardTitle>Draft Posts Management</CardTitle>
          <CardDescription>
            Review and manage blog post submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {draftPosts.length === 0 ? (
            <p className="text-muted-foreground">No draft posts awaiting review.</p>
          ) : (
            <div className="space-y-4">
              {draftPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        By {post.author} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm mb-3">{post.excerpt}</p>

                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {post.status}
                        </Badge>
                        {post.scheduled_at && (
                          <Badge variant="secondary">
                            Scheduled for {new Date(post.scheduled_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      onClick={() => handlePublishPost(post.id)}
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Publish
                    </Button>

                    <Button
                      onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>

                    <Button
                      onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule
                    </Button>
                  </div>

                  {selectedPost === post.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Admin Notes (optional)
                        </label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add any notes for this post..."
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Rejection Reason
                        </label>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Please provide a reason for rejection..."
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Schedule Date
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRejectPost(post.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Confirm Rejection
                        </Button>
                        <Button
                          onClick={() => handleSchedulePost(post.id)}
                          variant="outline"
                          size="sm"
                        >
                          Confirm Schedule
                        </Button>
                        <Button
                          onClick={() => setSelectedPost(null)}
                          variant="ghost"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
