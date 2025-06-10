
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { translate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  LogOut, 
  Camera,
  Save,
  AlertTriangle
} from 'lucide-react';

const ProfileSettings = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    email: '',
    avatar_url: '',
    bio: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    legislative: true,
    community: true,
    resources: true
  });

  useEffect(() => {
    if (!session) {
      navigate('/auth');
      return;
    }
    
    loadProfile();
  }, [session, navigate]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          username: data.username || '',
          full_name: data.full_name || '',
          email: data.email || session?.user?.email || '',
          avatar_url: data.avatar_url || '',
          bio: '',
          location: ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: translate("Error", language),
        description: translate("Failed to load profile", language),
        variant: "destructive"
      });
    }
  };

  const updateProfile = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          username: profile.username,
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: translate("Success", language),
        description: translate("Profile updated successfully", language)
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: translate("Error", language),
        description: translate("Failed to update profile", language),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: translate("Error", language),
        description: translate("Failed to sign out", language),
        variant: "destructive"
      });
    }
  };

  if (!session) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p>{translate("Please sign in to access profile settings", language)}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{translate("Profile Settings", language)}</h1>
          <p className="text-muted-foreground">
            {translate("Manage your account settings and preferences", language)}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              {translate("Profile", language)}
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              {translate("Notifications", language)}
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              {translate("Preferences", language)}
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              {translate("Security", language)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Profile Information", language)}</CardTitle>
                <CardDescription>
                  {translate("Update your personal information and profile picture", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="text-lg">
                      {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    {translate("Change Photo", language)}
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">{translate("Full Name", language)}</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder={translate("Enter your full name", language)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">{translate("Username", language)}</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      placeholder={translate("Enter your username", language)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{translate("Email Address", language)}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    {translate("Email cannot be changed directly. Contact support if needed.", language)}
                  </p>
                </div>

                <Button onClick={updateProfile} disabled={loading} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? translate("Saving...", language) : translate("Save Changes", language)}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Notification Preferences", language)}</CardTitle>
                <CardDescription>
                  {translate("Choose how you want to receive notifications", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{translate("Email Notifications", language)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {translate("Receive notifications via email", language)}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{translate("Push Notifications", language)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {translate("Receive push notifications", language)}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>

                  <Separator />

                  <h4 className="font-medium">{translate("Content Notifications", language)}</h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="legislative">{translate("Legislative Updates", language)}</Label>
                      <Switch
                        id="legislative"
                        checked={notifications.legislative}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, legislative: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="community">{translate("Community Discussions", language)}</Label>
                      <Switch
                        id="community"
                        checked={notifications.community}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, community: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="resources">{translate("New Resources", language)}</Label>
                      <Switch
                        id="resources"
                        checked={notifications.resources}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, resources: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("App Preferences", language)}</CardTitle>
                <CardDescription>
                  {translate("Customize your app experience", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{translate("Language", language)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {translate("Choose your preferred language", language)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
                    >
                      {language === 'en' ? 'English' : 'Swahili'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{translate("Theme", language)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {translate("Switch between light and dark mode", language)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        {translate("Light", language)}
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        {translate("Dark", language)}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Account Security", language)}</CardTitle>
                <CardDescription>
                  {translate("Manage your account security settings", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{translate("Account Status", language)}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {translate("Active", language)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {translate("Account created:", language)} {new Date(session.user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">{translate("Sign Out", language)}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {translate("Sign out of your account on this device", language)}
                    </p>
                    <Button variant="outline" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {translate("Sign Out", language)}
                    </Button>
                  </div>

                  <Separator />

                  <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          {translate("Danger Zone", language)}
                        </h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                          <p className="mb-3">
                            {translate("Permanently delete your account and all associated data.", language)}
                          </p>
                          <Button variant="destructive" size="sm">
                            {translate("Delete Account", language)}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfileSettings;
