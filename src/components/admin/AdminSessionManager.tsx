// Admin Session Manager - Handles active session tracking with RLS fallbacks
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminService, AdminSession } from '@/services/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock, Shield, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CEKALoader } from '@/components/ui/ceka-loader';

export const AdminSessionManager: React.FC = () => {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRLSError, setHasRLSError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const mountedRef = useRef(true);

  const fetchActiveSessions = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setRefreshing(true);
      const activeSessions = await adminService.getActiveSessions();
      if (mountedRef.current) {
        setSessions(activeSessions);
        setHasRLSError(false);
      }
    } catch (error: any) {
      console.warn('[SessionManager] Error fetching admin sessions:', error);

      // Check if it's an RLS/permission error (403)
      if (error?.code === 'PGRST301' || error?.status === 403 || error?.message?.includes('403')) {
        if (mountedRef.current) {
          setHasRLSError(true);
          setSessions([]);
        }
        // Don't show toast for RLS errors - it's expected if SQL migration hasn't been applied
      } else if (mountedRef.current) {
        toast({
          title: "Session Error",
          description: "Unable to fetch session data",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    mountedRef.current = true;
    fetchActiveSessions();

    // Refresh sessions every 30 seconds
    const interval = setInterval(() => {
      if (mountedRef.current) fetchActiveSessions();
    }, 30000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchActiveSessions]);

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            Admin Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <CEKALoader variant="ios" size="md" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Authenticating Sessions</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // RLS Error state - show helpful message
  if (hasRLSError) {
    return (
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-amber-500" />
            </div>
            Admin Sessions
          </CardTitle>
          <CardDescription>
            Session tracking for administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    Session Table Not Available
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The admin_sessions table requires database migration. Please run the SQL migration
                    file in the Supabase SQL Editor to enable session tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <span className="text-sm font-medium">Migration Required</span>
              <Badge variant="outline" className="rounded-xl">20260208_ADMIN_DASHBOARD_ULTIMATE_FIX.sql</Badge>
            </div>

            <Button
              variant="outline"
              onClick={fetchActiveSessions}
              className="w-full rounded-xl gap-2"
              disabled={refreshing}
            >
              <CEKALoader variant="ios" size="sm" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-kenya-green/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-kenya-green" />
            </div>
            <div>
              <CardTitle>Admin Sessions</CardTitle>
              <CardDescription>
                Active admin sessions (Maximum: 3)
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActiveSessions}
            className="rounded-xl gap-2"
            disabled={refreshing}
          >
            {refreshing ? <CEKALoader variant="ios" size="sm" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Active Sessions
              </span>
            </div>
            <Badge
              variant={sessions.length >= 3 ? "destructive" : "secondary"}
              className="rounded-xl"
            >
              {sessions.length}/3
            </Badge>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No active admin sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-2xl bg-kenya-green/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-kenya-green" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-kenya-green rounded-full border-2 border-background" />
                    </div>
                    <div>
                      <p className="font-medium">{session.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Active session
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatLastActive(session.last_active)}
                    </div>
                    <Badge variant="outline" className="rounded-xl bg-kenya-green/10 text-kenya-green border-kenya-green/20">
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sessions.length >= 3 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    Maximum Sessions Reached
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    New admin login attempts will be blocked until a session expires or is cleaned up.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSessionManager;
