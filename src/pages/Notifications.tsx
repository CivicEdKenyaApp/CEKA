
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, CheckCheck, Clock, Calendar, FileText } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: '/notifications' } });
    }
  }, [user, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type: string | null) => {
    switch (type) {
      case 'bill_update':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-orange-500" />;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  if (!user) {
    return null; // Navigate will handle redirection
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                <Bell className="h-8 w-8" />
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-muted-foreground">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="flex gap-2 self-end md:self-auto">
                <Button variant="outline" size="sm" onClick={refetch}>
                  Refresh
                </Button>
                <Button variant="default" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="mr-1 h-4 w-4" />
                  Mark all as read
                </Button>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-4">
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No notifications yet</h3>
                <p className="text-muted-foreground mb-4">
                  When there are updates to bills you follow or important events, they'll appear here.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" asChild>
                    <Link to="/legislative-tracker">Browse Bills</Link>
                  </Button>
                  <Button variant="default" asChild>
                    <Link to="/civic-calendar">Check Events</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`transition-all duration-200 ${!notification.is_read ? 'border-kenya-green bg-muted/30' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex">
                      <div className="mr-4 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{notification.message}</p>
                            {!notification.is_read && (
                              <Badge variant="default" className="bg-kenya-green">New</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="mr-1 h-3.5 w-3.5" />
                              {formatDate(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-8 px-2"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {notification.link && (
                          <div className="mt-2">
                            <Button variant="link" className="p-0 h-auto" asChild>
                              <Link to={notification.link}>View details</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const NotificationSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex">
        <Skeleton className="h-8 w-8 rounded-full mr-4" />
        <div className="flex-1">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-1/4 mt-2" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Notifications;
