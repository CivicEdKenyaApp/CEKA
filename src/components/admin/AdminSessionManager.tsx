
import React, { useState, useEffect } from 'react';
import { adminService, AdminSession } from '@/services/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock, Shield } from 'lucide-react';

export const AdminSessionManager: React.FC = () => {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveSessions();
    
    // Refresh sessions every 30 seconds
    const interval = setInterval(fetchActiveSessions, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const activeSessions = await adminService.getActiveSessions();
      setSessions(activeSessions);
    } catch (error) {
      console.error('Error fetching admin sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading sessions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Sessions
        </CardTitle>
        <CardDescription>
          Active admin sessions (Maximum: 3)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                Active Sessions: {sessions.length}/3
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActiveSessions}
            >
              Refresh
            </Button>
          </div>
          
          {sessions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No active admin sessions
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-medium">{session.email}</span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatLastActive(session.last_active)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {sessions.length >= 3 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Maximum admin sessions reached. New admin login attempts will be blocked until a session expires or is cleaned up.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
