import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { BellRing, Mail, Smartphone, Loader2, Check, FileText, Users, BookOpen, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Local storage key
const NOTIFICATION_STORAGE_KEY = 'ceka_notification_settings';

interface NotificationPreferences {
  all_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  legislative_updates: boolean;
  community_replies: boolean;
  resource_updates: boolean;
  volunteer_opportunities: boolean;
}

const defaultPrefs: NotificationPreferences = {
  all_enabled: true,
  email_notifications: true,
  push_notifications: true,
  legislative_updates: true,
  community_replies: true,
  resource_updates: true,
  volunteer_opportunities: true
};

const NotificationSettings: React.FC = () => {
  const { language } = useLanguage();
  const { session } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [prefs, setPrefs] = useState<NotificationPreferences>(() => {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPrefs;
  });

  // Load from database on mount
  useEffect(() => {
    const loadPrefs = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data?.notification_preferences) {
          const dbPrefs = data.notification_preferences as any;
          setPrefs(prev => ({ ...prev, ...dbPrefs }));
        }
      } catch (err) {
        console.error('Failed to load notification preferences:', err);
      }
    };

    loadPrefs();
  }, [session]);

  // Update preference and sync
  const updatePref = async (key: keyof NotificationPreferences, value: boolean) => {
    let newPrefs = { ...prefs, [key]: value };

    // If turning off all notifications, disable individual ones
    if (key === 'all_enabled' && !value) {
      newPrefs = {
        ...newPrefs,
        email_notifications: false,
        push_notifications: false
      };
    }

    // If turning on any channel, ensure all_enabled is true
    if ((key === 'email_notifications' || key === 'push_notifications') && value) {
      newPrefs.all_enabled = true;
    }

    setPrefs(newPrefs);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(newPrefs));

    // Sync to database
    if (session?.user?.id) {
      setSaving(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            notification_preferences: newPrefs,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        setLastSaved(new Date());
      } catch (err) {
        console.error('Failed to sync notification preferences:', err);
      } finally {
        setTimeout(() => setSaving(false), 500);
      }
    }
  };

  // Update notification type
  const updateType = async (key: keyof NotificationPreferences, checked: boolean) => {
    const newPrefs = { ...prefs, [key]: checked };
    setPrefs(newPrefs);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(newPrefs));

    // Sync to database
    if (session?.user?.id) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            notification_preferences: newPrefs,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Failed to sync:', err);
      }
    }
  };

  const handleSave = () => {
    toast({
      title: translate("Success", language),
      description: translate("Your notification preferences have been updated.", language),
    });
  };

  return (
    <div className="space-y-6">
      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-lg border">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs font-medium">{translate("Saving...", language)}</span>
        </div>
      )}

      {/* Main Notification Controls */}
      <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            {translate("Notification Preferences", language)}
          </CardTitle>
          <CardDescription>
            {translate("Choose which notifications you want to receive", language)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border-2 border-primary/20">
            <div className="space-y-0.5">
              <Label htmlFor="all-notifications" className="font-bold text-primary">{translate("Enable All Notifications", language)}</Label>
              <p className="text-xs text-muted-foreground">{translate("Receive all system notifications", language)}</p>
            </div>
            <Switch
              id="all-notifications"
              checked={prefs.all_enabled}
              onCheckedChange={(checked) => updatePref('all_enabled', checked)}
            />
          </div>

          {prefs.all_enabled && (
            <>
              <Separator />

              <div className="ml-4 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="font-bold">
                        {translate("Email Notifications", language)}
                      </Label>
                      <p className="text-xs text-muted-foreground">{translate("Receive notifications via email", language)}</p>
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={prefs.email_notifications}
                    onCheckedChange={(checked) => updatePref('email_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications" className="font-bold">
                        {translate("Push Notifications", language)}
                      </Label>
                      <p className="text-xs text-muted-foreground">{translate("Receive push notifications on your device", language)}</p>
                    </div>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={prefs.push_notifications}
                    onCheckedChange={(checked) => updatePref('push_notifications', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle>{translate("Notification Types", language)}</CardTitle>
          <CardDescription>
            {translate("Select the types of notifications you want to receive", language)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <Label htmlFor="legislative-updates" className="font-bold cursor-pointer">
                {translate("Legislative Updates", language)}
              </Label>
              <p className="text-xs text-muted-foreground">{translate("New bills, amendments, and parliamentary activities", language)}</p>
            </div>
            <Checkbox
              id="legislative-updates"
              checked={prefs.legislative_updates}
              onCheckedChange={(checked) => updateType('legislative_updates', checked as boolean)}
              className="h-5 w-5"
            />
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <Label htmlFor="community-replies" className="font-bold cursor-pointer">
                {translate("Community Replies", language)}
              </Label>
              <p className="text-xs text-muted-foreground">{translate("Responses to your discussions and comments", language)}</p>
            </div>
            <Checkbox
              id="community-replies"
              checked={prefs.community_replies}
              onCheckedChange={(checked) => updateType('community_replies', checked as boolean)}
              className="h-5 w-5"
            />
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <Label htmlFor="resource-updates" className="font-bold cursor-pointer">
                {translate("New Educational Resources", language)}
              </Label>
              <p className="text-xs text-muted-foreground">{translate("New carousels, PDFs, and learning materials", language)}</p>
            </div>
            <Checkbox
              id="resource-updates"
              checked={prefs.resource_updates}
              onCheckedChange={(checked) => updateType('resource_updates', checked as boolean)}
              className="h-5 w-5"
            />
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 text-pink-500" />
            </div>
            <div className="flex-1">
              <Label htmlFor="volunteer-opportunities" className="font-bold cursor-pointer">
                {translate("Volunteer Opportunities", language)}
              </Label>
              <p className="text-xs text-muted-foreground">{translate("Ways to get involved in civic initiatives", language)}</p>
            </div>
            <Checkbox
              id="volunteer-opportunities"
              checked={prefs.volunteer_opportunities}
              onCheckedChange={(checked) => updateType('volunteer_opportunities', checked as boolean)}
              className="h-5 w-5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {lastSaved && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            {translate("Last saved", language)}: {lastSaved.toLocaleTimeString()}
          </p>
        )}
        <Button onClick={handleSave} className="rounded-2xl font-bold ml-auto">
          {translate("Save Changes", language)}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
