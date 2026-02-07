import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Cookie, Download, Loader2, Check, Eye, Users, Search, BarChart3, Sparkles } from 'lucide-react';

// Local storage key for privacy settings
const PRIVACY_STORAGE_KEY = 'ceka_privacy_settings';

interface PrivacySettings {
  public_profile: boolean;
  activity_visibility: boolean;
  searchable: boolean;
  analytics: boolean;
  personalization: boolean;
  preference_cookies: boolean;
  analytics_cookies: boolean;
}

const defaultSettings: PrivacySettings = {
  public_profile: true,
  activity_visibility: true,
  searchable: true,
  analytics: true,
  personalization: true,
  preference_cookies: true,
  analytics_cookies: true
};

const PrivacySettings: React.FC = () => {
  const { language } = useLanguage();
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<PrivacySettings>(() => {
    const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  // Load from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('privacy_settings')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data?.privacy_settings) {
          const dbSettings = data.privacy_settings as any;
          setSettings(prev => ({ ...prev, ...dbSettings }));
        }
      } catch (err) {
        console.error('Failed to load privacy settings:', err);
      }
    };

    loadSettings();
  }, [session]);

  // Save to localStorage and sync to database
  const updateSetting = async (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(newSettings));

    // Sync to database
    if (session?.user?.id) {
      setSaving(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            privacy_settings: newSettings,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      } catch (err) {
        console.error('Failed to sync privacy settings:', err);
      } finally {
        setTimeout(() => setSaving(false), 500);
      }
    }
  };

  // Data export handler
  const handleDataExport = async () => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: translate("Sign in required", language),
        description: translate("Please sign in to export your data.", language)
      });
      return;
    }

    setExporting(true);
    try {
      // Fetch all user data
      const [profileRes, commentsRes, discussionsRes, feedbackRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('resource_comments').select('*').eq('user_id', session.user.id),
        supabase.from('discussions').select('*').eq('user_id', session.user.id),
        supabase.from('bill_feedback').select('*').eq('user_id', session.user.id)
      ]);

      // Compile user data
      const userData = {
        exported_at: new Date().toISOString(),
        user_email: session.user.email,
        profile: profileRes.data,
        comments: commentsRes.data || [],
        discussions: discussionsRes.data || [],
        bill_feedback: feedbackRes.data || [],
        settings: {
          privacy: settings,
          appearance: {
            text_size: localStorage.getItem('ceka_text_size'),
            high_contrast: localStorage.getItem('ceka_high_contrast'),
            autoplay_media: localStorage.getItem('ceka_autoplay_media')
          }
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ceka-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: translate("Export complete", language),
        description: translate("Your data has been downloaded.", language),
      });
    } catch (err: any) {
      console.error('Data export failed:', err);
      toast({
        variant: "destructive",
        title: translate("Export failed", language),
        description: err.message
      });
    } finally {
      setExporting(false);
    }
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

      {/* Profile Visibility */}
      <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            {translate("Profile Visibility", language)}
          </CardTitle>
          <CardDescription>{translate("Control who can see your profile information", language)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <Label htmlFor="public-profile" className="font-bold">{translate("Public Profile", language)}</Label>
                <p className="text-xs text-muted-foreground">{translate("Make your profile visible to everyone", language)}</p>
              </div>
            </div>
            <Switch
              id="public-profile"
              checked={settings.public_profile}
              onCheckedChange={(checked) => updateSetting('public_profile', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <Label htmlFor="activity-visibility" className="font-bold">{translate("Activity Visibility", language)}</Label>
                <p className="text-xs text-muted-foreground">{translate("Show your activities in the community", language)}</p>
              </div>
            </div>
            <Switch
              id="activity-visibility"
              checked={settings.activity_visibility}
              onCheckedChange={(checked) => updateSetting('activity_visibility', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <Label htmlFor="searchable" className="font-bold">{translate("Searchable", language)}</Label>
                <p className="text-xs text-muted-foreground">{translate("Allow others to find you by name or email", language)}</p>
              </div>
            </div>
            <Switch
              id="searchable"
              checked={settings.searchable}
              onCheckedChange={(checked) => updateSetting('searchable', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Usage */}
      <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            {translate("Data Usage", language)}
          </CardTitle>
          <CardDescription>{translate("Control how your data is used", language)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <Label htmlFor="analytics" className="font-bold">{translate("Analytics", language)}</Label>
                <p className="text-xs text-muted-foreground">{translate("Allow us to collect anonymous usage data to improve the platform", language)}</p>
              </div>
            </div>
            <Switch
              id="analytics"
              checked={settings.analytics}
              onCheckedChange={(checked) => updateSetting('analytics', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <Label htmlFor="personalization" className="font-bold">{translate("Personalization", language)}</Label>
                <p className="text-xs text-muted-foreground">{translate("Allow us to personalize your experience based on your activity", language)}</p>
              </div>
            </div>
            <Switch
              id="personalization"
              checked={settings.personalization}
              onCheckedChange={(checked) => updateSetting('personalization', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cookie Preferences */}
      <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-amber-500" />
            {translate("Cookie Preferences", language)}
          </CardTitle>
          <CardDescription>{translate("Manage cookie settings", language)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl opacity-60">
            <div>
              <Label htmlFor="essential-cookies" className="font-bold">{translate("Essential Cookies", language)}</Label>
              <p className="text-xs text-muted-foreground">{translate("Required for the website to function properly", language)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <Switch id="essential-cookies" checked disabled />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <div>
              <Label htmlFor="preference-cookies" className="font-bold">{translate("Preference Cookies", language)}</Label>
              <p className="text-xs text-muted-foreground">{translate("Remember your settings and preferences", language)}</p>
            </div>
            <Switch
              id="preference-cookies"
              checked={settings.preference_cookies}
              onCheckedChange={(checked) => updateSetting('preference_cookies', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <div>
              <Label htmlFor="analytics-cookies" className="font-bold">{translate("Analytics Cookies", language)}</Label>
              <p className="text-xs text-muted-foreground">{translate("Help us improve by collecting anonymous usage information", language)}</p>
            </div>
            <Switch
              id="analytics-cookies"
              checked={settings.analytics_cookies}
              onCheckedChange={(checked) => updateSetting('analytics_cookies', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            {translate("Download Your Data", language)}
          </CardTitle>
          <CardDescription>{translate("Export a copy of your personal data", language)}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {translate("You can request a download of all your personal data. This includes your profile information, activities, and contributions.", language)}
          </p>
          <Button
            onClick={handleDataExport}
            disabled={exporting}
            className="rounded-2xl font-bold gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {translate("Preparing...", language)}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {translate("Request Data Export", language)}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;
