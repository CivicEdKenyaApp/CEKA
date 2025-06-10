
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { BellRing, Mail, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  const handleSave = () => {
    toast({
      title: translate("Success", language),
      description: translate("Your notification preferences have been updated.", language),
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{translate("Notification Settings", language)}</h1>
        <p className="text-muted-foreground">{translate("Manage how you receive notifications", language)}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellRing className="mr-2 h-5 w-5" />
            {translate("Notification Preferences", language)}
          </CardTitle>
          <CardDescription>
            {translate("Choose which notifications you want to receive", language)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="all-notifications" className="font-medium">{translate("Enable All Notifications", language)}</Label>
              <p className="text-sm text-muted-foreground">{translate("Receive all system notifications", language)}</p>
            </div>
            <Switch 
              id="all-notifications" 
              checked={notificationsEnabled}
              onCheckedChange={(checked) => {
                setNotificationsEnabled(checked);
                if (!checked) {
                  setEmailNotifications(false);
                  setPushNotifications(false);
                }
              }}
            />
          </div>
          
          {notificationsEnabled && (
            <>
              <Separator />
              
              <div className="ml-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      {translate("Email Notifications", language)}
                    </Label>
                    <p className="text-sm text-muted-foreground">{translate("Receive notifications via email", language)}</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications}
                    disabled={!notificationsEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications" className="flex items-center">
                      <Smartphone className="mr-2 h-4 w-4" />
                      {translate("Push Notifications", language)}
                    </Label>
                    <p className="text-sm text-muted-foreground">{translate("Receive push notifications on your device", language)}</p>
                  </div>
                  <Switch 
                    id="push-notifications" 
                    checked={pushNotifications} 
                    onCheckedChange={setPushNotifications}
                    disabled={!notificationsEnabled}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{translate("Notification Types", language)}</CardTitle>
          <CardDescription>
            {translate("Select the types of notifications you want to receive", language)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="legislative-updates" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
              <Label htmlFor="legislative-updates">
                {translate("Legislative Updates", language)}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="community-replies" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
              <Label htmlFor="community-replies">
                {translate("Community Replies", language)}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="resource-updates" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
              <Label htmlFor="resource-updates">
                {translate("New Educational Resources", language)}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="volunteer-opportunities" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
              <Label htmlFor="volunteer-opportunities">
                {translate("Volunteer Opportunities", language)}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          {translate("Save Changes", language)}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
