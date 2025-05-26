import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Shield, User, Globe, Moon, Sun, Smartphone, Laptop, Eye, Share2, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Updated import
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { translate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const Settings = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [textSize, setTextSize] = useState(100);
  const [fontPreference, setFontPreference] = useState('default');
  const [highContrast, setHighContrast] = useState(false);
  const [autoplayMedia, setAutoplayMedia] = useState(false);
  const [location, setLocation] = useState('nairobi');
  
  const handleSaveSettings = () => {
    toast({
      title: translate("Settings saved", language),
      description: translate("Your preferences have been updated.", language),
    });
  };
  
  return (
    <Layout>
      <div className="container py-8 pb-16 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{translate("Settings", language)}</h1>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{translate("Account", language)}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{translate("Notifications", language)}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{translate("Appearance", language)}</span>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{translate("Privacy", language)}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Account Settings", language)}</CardTitle>
                <CardDescription>
                  {translate("Manage your account information and preferences.", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{translate("Profile Information", language)}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{translate("Full Name", language)}</Label>
                      <Input id="name" placeholder="John Doe" defaultValue={session?.user?.user_metadata?.full_name || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">{translate("Username", language)}</Label>
                      <Input id="username" placeholder="johndoe" defaultValue={session?.user?.user_metadata?.username || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{translate("Email", language)}</Label>
                      <Input id="email" type="email" readOnly defaultValue={session?.user?.email || ''} />
                      {session?.user?.email_confirmed_at && (
                        <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                          {translate("Verified", language)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">{translate("Preferences", language)}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="language">{translate("Language", language)}</Label>
                        <p className="text-sm text-muted-foreground">{translate("Select your preferred language", language)}</p>
                      </div>
                      <Select defaultValue={language} onValueChange={(value) => setLanguage(value as 'en' | 'sw')}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={translate("Select language", language)} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="sw">Swahili</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{translate("Region", language)}</Label>
                        <p className="text-sm text-muted-foreground">{translate("Set your location for relevant content", language)}</p>
                      </div>
                      <Select defaultValue={location} onValueChange={setLocation}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={translate("Select region", language)} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nairobi">Nairobi</SelectItem>
                          <SelectItem value="mombasa">Mombasa</SelectItem>
                          <SelectItem value="kisumu">Kisumu</SelectItem>
                          <SelectItem value="nakuru">Nakuru</SelectItem>
                          <SelectItem value="eldoret">Eldoret</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Notification Settings", language)}</CardTitle>
                <CardDescription>
                  {translate("Configure how you want to receive notifications.", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">{translate("Enable Notifications", language)}</Label>
                    <p className="text-sm text-muted-foreground">{translate("Receive updates and alerts", language)}</p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled} 
                  />
                </div>
                
                {notificationsEnabled && (
                  <div className="space-y-4 ml-6 border-l-2 pl-6 border-muted">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">{translate("Email Notifications", language)}</Label>
                        <p className="text-sm text-muted-foreground">{translate("Receive notifications via email", language)}</p>
                      </div>
                      <Switch 
                        id="email-notifications" 
                        checked={emailNotifications} 
                        onCheckedChange={setEmailNotifications} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">{translate("Push Notifications", language)}</Label>
                        <p className="text-sm text-muted-foreground">{translate("Receive push notifications on your device", language)}</p>
                      </div>
                      <Switch 
                        id="push-notifications" 
                        checked={pushNotifications} 
                        onCheckedChange={setPushNotifications} 
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">{translate("Notification Types", language)}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="legislative-updates" className="rounded" defaultChecked />
                      <Label htmlFor="legislative-updates">{translate("Legislative Updates", language)}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="community-replies" className="rounded" defaultChecked />
                      <Label htmlFor="community-replies">{translate("Community Replies", language)}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="resource-updates" className="rounded" defaultChecked />
                      <Label htmlFor="resource-updates">{translate("New Educational Resources", language)}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="volunteer-opportunities" className="rounded" defaultChecked />
                      <Label htmlFor="volunteer-opportunities">{translate("Volunteer Opportunities", language)}</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Appearance Settings", language)}</CardTitle>
                <CardDescription>
                  {translate("Customize how CEKA looks and feels.", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{translate("Theme", language)}</h3>
                  <RadioGroup defaultValue={theme} className="grid grid-cols-3 gap-4">
                    <div>
                      <RadioGroupItem 
                        value="light" 
                        id="theme-light" 
                        className="peer sr-only" 
                        onClick={() => theme !== 'light' && toggleTheme()}
                      />
                      <Label
                        htmlFor="theme-light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Sun className="mb-3 h-6 w-6" />
                        {translate("Light", language)}
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem 
                        value="dark" 
                        id="theme-dark" 
                        className="peer sr-only" 
                        onClick={() => theme !== 'dark' && toggleTheme()}
                      />
                      <Label
                        htmlFor="theme-dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Moon className="mb-3 h-6 w-6" />
                        {translate("Dark", language)}
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem 
                        value="system" 
                        id="theme-system" 
                        className="peer sr-only" 
                      />
                      <Label
                        htmlFor="theme-system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Laptop className="mb-3 h-6 w-6" />
                        {translate("System", language)}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="text-size">{translate("Text Size", language)}</Label>
                      <span className="text-sm">{textSize}%</span>
                    </div>
                    <Slider
                      id="text-size"
                      min={80}
                      max={150}
                      step={10}
                      value={[textSize]}
                      onValueChange={(values) => setTextSize(values[0])}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="high-contrast">{translate("High Contrast", language)}</Label>
                      <p className="text-sm text-muted-foreground">{translate("Increase contrast for better readability", language)}</p>
                    </div>
                    <Switch 
                      id="high-contrast" 
                      checked={highContrast} 
                      onCheckedChange={setHighContrast} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoplay-media">{translate("Autoplay Media", language)}</Label>
                      <p className="text-sm text-muted-foreground">{translate("Automatically play videos and animations", language)}</p>
                    </div>
                    <Switch 
                      id="autoplay-media" 
                      checked={autoplayMedia} 
                      onCheckedChange={setAutoplayMedia} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Privacy & Security", language)}</CardTitle>
                <CardDescription>
                  {translate("Manage your privacy settings and security options.", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{translate("Privacy", language)}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{translate("Profile Visibility", language)}</Label>
                        <p className="text-sm text-muted-foreground">{translate("Control who can see your profile", language)}</p>
                      </div>
                      <Select defaultValue="public">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={translate("Select visibility", language)} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">{translate("Public", language)}</SelectItem>
                          <SelectItem value="followers">{translate("Community Members Only", language)}</SelectItem>
                          <SelectItem value="private">{translate("Private", language)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{translate("Activity Status", language)}</Label>
                        <p className="text-sm text-muted-foreground">{translate("Show when you're active on the platform", language)}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">{translate("Security", language)}</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      {translate("Change Password", language)}
                    </Button>
                    
                    <Button variant="outline" className="w-full sm:w-auto">
                      {translate("Two-Factor Authentication", language)}
                    </Button>
                    
                    <div className="pt-4">
                      <div className="rounded-md bg-amber-50 dark:bg-amber-950/40 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                              {translate("Login Activity", language)}
                            </h3>
                            <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                              <p>
                                {translate("Last login: 2023-04-14 from Nairobi, Kenya", language)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">{translate("Data Management", language)}</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      {translate("Download Your Data", language)}
                    </Button>
                    
                    <Button variant="destructive" className="w-full sm:w-auto">
                      {translate("Delete Account", language)}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {translate("Cancel", language)}
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            {translate("Save Settings", language)}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
