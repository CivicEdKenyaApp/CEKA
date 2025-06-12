
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, Calendar, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { BlogPost } from '@/services/blogService';

const AdminDashboard = () => {
  const { 
    notifications, 
    draftPosts, 
    isAdmin, 
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updatePostStatus,
    schedulePost,
    rejectPost
  } = useAdmin();
  
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read);

  const handlePublishPost = async (post: BlogPost) => {
    try {
      await updatePostStatus(post.id, 'published', adminNotes);
      toast({
        title: "Success",
        description: "Post published successfully"
      });
      setSelectedPost(null);
      setAdminNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish post",
        variant: "destructive"
      });
    }
  };

  const handleRejectPost = async (post: BlogPost) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }

    try {
      await rejectPost(post.id, rejectionReason);
      toast({
        title: "Success",
        description: "Post rejected"
      });
      setSelectedPost(null);
      setRejectionReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject post",
        variant: "destructive"
      });
    }
  };

  const handleSchedulePost = async (post: BlogPost) => {
    if (!scheduledDate) {
      toast({
        title: "Error",
        description: "Please select a scheduled date",
        variant: "destructive"
      });
      return;
    }

    try {
      await schedulePost(post.id, scheduledDate);
      toast({
        title: "Success",
        description: "Post scheduled successfully"
      });
      setSelectedPost(null);
      setScheduledDate('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule post",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          {unreadNotifications.length} unread
        </Badge>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">
            Notifications ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Draft Posts ({draftPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Notifications</CardTitle>
              {unreadNotifications.length > 0 && (
                <Button onClick={markAllNotificationsAsRead} variant="outline" size="sm">
                  Mark All Read
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No notifications</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.is_read ? 'bg-muted/50' : 'bg-background border-primary/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <Card>
            <CardHeader>
              <CardTitle>Draft Posts Awaiting Review</CardTitle>
            </CardHeader>
            <CardContent>
              {draftPosts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No draft posts</p>
              ) : (
                <div className="space-y-4">
                  {draftPosts.map((post) => (
                    <div key={post.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{post.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {post.excerpt || post.content.substring(0, 150) + '...'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>By {post.author}</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            {post.scheduled_at && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Scheduled: {new Date(post.scheduled_at).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setSelectedPost(post)}
                                variant="outline"
                                size="sm"
                              >
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Post: {post.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Content Preview</h4>
                                  <div className="p-4 bg-muted rounded-lg max-h-64 overflow-y-auto">
                                    <div className="whitespace-pre-wrap text-sm">
                                      {post.content}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Admin Notes (optional)</label>
                                    <Textarea
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Add notes about this post..."
                                      className="mt-1"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handlePublishPost(post)}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Publish Now
                                    </Button>
                                    
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4" />
                                          Schedule
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Schedule Post</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium">Publish Date & Time</label>
                                            <Input
                                              type="datetime-local"
                                              value={scheduledDate}
                                              onChange={(e) => setScheduledDate(e.target.value)}
                                              className="mt-1"
                                            />
                                          </div>
                                          <Button onClick={() => handleSchedulePost(post)}>
                                            Schedule Post
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="destructive" className="flex items-center gap-2">
                                          <XCircle className="h-4 w-4" />
                                          Reject
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Reject Post</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium">Rejection Reason</label>
                                            <Textarea
                                              value={rejectionReason}
                                              onChange={(e) => setRejectionReason(e.target.value)}
                                              placeholder="Please provide a reason for rejection..."
                                              className="mt-1"
                                            />
                                          </div>
                                          <Button 
                                            onClick={() => handleRejectPost(post)}
                                            variant="destructive"
                                          >
                                            Reject Post
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
