
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import Layout from '@/components/layout/Layout';

const NotificationSettings = () => {
  const { language } = useLanguage();
  
  return (
    <Layout>
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{translate("Notification Settings", language)}</h1>
          <p className="text-muted-foreground">{translate("Manage how you receive notifications", language)}</p>
        </div>
        
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{translate("Legislative Updates", language)}</CardTitle>
              <CardDescription>{translate("Control notifications for bills and legislative activities", language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="status-updates" className="font-medium">{translate("Bill Status Changes", language)}</Label>
                  <p className="text-sm text-muted-foreground">{translate("Get notified when a bill you're following changes status", language)}</p>
                </div>
                <Switch id="status-updates" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-bills" className="font-medium">{translate("New Bills", language)}</Label>
                  <p className="text-sm text-muted-foreground">{translate("Get notified when new bills are added in your interests", language)}</p>
                </div>
                <Switch id="new-bills" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public-input" className="font-medium">{translate("Public Input Periods", language)}</Label>
                  <p className="text-sm text-muted-foreground">{translate("Get notified when a bill opens for public comment", language)}</p>
                </div>
                <Switch id="public-input" defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{translate("Community Updates", language)}</CardTitle>
              <CardDescription>{translate("Manage notifications for community interactions", language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="replies" className="font-medium">{translate("Replies", language)}</Label>
                  <p className="text-sm text-muted-foreground">{translate("Get notified when someone replies to your posts", language)}</p>
                </div>
                <Switch id="replies" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mentions" className="font-medium">{translate("Mentions", language)}</Label>
                  <p className="text-sm text-muted-foreground">{translate("Get notified when someone mentions you", language)}</p>
                </div>
                <Switch id="mentions" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="events" className="font-medium">{translate("Events", language)}</Label>
                  <p className="text-sm text-muted-foreground">{translate("Get notified about upcoming events", language)}</p>
                </div>
                <Switch id="events" defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{translate("Resource Updates", language)}</CardTitle>
              <CardDescription>{translate("Get notified about new resources", language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-resources" className="font-medium">{translate("New Resources", language)}</Label>
                  <p className="text-sm text-muted-foreground">{translate("Get notified when new resources are added", language)}</p>
                </div>
                <Switch id="new-resources" defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{translate("Email Frequency", language)}</CardTitle>
              <CardDescription>{translate("Control how often we email you", language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <Label className="flex items-center space-x-2">
                  <input type="radio" name="frequency" value="immediately" className="radio" defaultChecked />
                  <span>{translate("Immediately", language)}</span>
                </Label>
                <Label className="flex items-center space-x-2">
                  <input type="radio" name="frequency" value="daily" className="radio" />
                  <span>{translate("Daily digest", language)}</span>
                </Label>
                <Label className="flex items-center space-x-2">
                  <input type="radio" name="frequency" value="weekly" className="radio" />
                  <span>{translate("Weekly digest", language)}</span>
                </Label>
              </div>
              
              <Button className="mt-4">{translate("Save Preferences", language)}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationSettings;
