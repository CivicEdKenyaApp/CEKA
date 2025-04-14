
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import Layout from '@/components/layout/Layout';
import { Bell, Globe, Moon, Sun, UserCog, Shield, Save } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: translate("Settings saved", language),
      description: translate("Your preferences have been updated successfully.", language),
    });
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl ios-scroll">
        <h1 className="text-3xl font-bold mb-8">{translate("Settings", language)}</h1>
        
        <Tabs defaultValue="account" className="space-y-8">
          <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="account">
              <UserCog className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">{translate("Account", language)}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Sun className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">{translate("Appearance", language)}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">{translate("Notifications", language)}</span>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">{translate("Privacy", language)}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Account Information", language)}</CardTitle>
                <CardDescription>
                  {translate("Manage your account details and preferences.", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">{translate("Email", language)}</h3>
                  <p className="text-sm text-muted-foreground">user@example.com</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">{translate("Username", language)}</h3>
                  <p className="text-sm text-muted-foreground">username</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">{translate("Language", language)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {translate("Choose your preferred language", language)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
                      className="text-sm bg-background border rounded p-1"
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {translate("Save Changes", language)}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Appearance", language)}</CardTitle>
                <CardDescription>
                  {translate("Customize how the application looks and feels.", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">{translate("Dark Mode", language)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {translate("Toggle between light and dark themes", language)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {theme === 'light' ? 
                      <Sun className="h-4 w-4 text-muted-foreground" /> : 
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    }
                    <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {translate("Save Changes", language)}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Notification Preferences", language)}</CardTitle>
                <CardDescription>
                  {translate("Choose what updates you want to receive.", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">{translate("Legislative Updates", language)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {translate("Receive notifications about new legislative changes", language)}
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">{translate("Community Activity", language)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {translate("Updates about discussions and community events", language)}
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">{translate("Resource Updates", language)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {translate("New educational resources and materials", language)}
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {translate("Save Changes", language)}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Privacy Settings", language)}</CardTitle>
                <CardDescription>
                  {translate("Manage your data and privacy preferences.", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">{translate("Profile Visibility", language)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {translate("Make your profile visible to other community members", language)}
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">{translate("Data Usage", language)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {translate("Allow usage data collection to improve the app", language)}
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {translate("Save Changes", language)}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
