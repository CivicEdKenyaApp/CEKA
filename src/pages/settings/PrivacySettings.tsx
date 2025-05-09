
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

const PrivacySettings = () => {
  const { language } = useLanguage();
  
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{translate("Privacy Settings", language)}</h1>
        <p className="text-muted-foreground">{translate("Manage your privacy preferences and data", language)}</p>
      </div>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{translate("Profile Visibility", language)}</CardTitle>
            <CardDescription>{translate("Control who can see your profile information", language)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public-profile" className="font-medium">{translate("Public Profile", language)}</Label>
                <p className="text-sm text-muted-foreground">{translate("Make your profile visible to everyone", language)}</p>
              </div>
              <Switch id="public-profile" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="activity-visibility" className="font-medium">{translate("Activity Visibility", language)}</Label>
                <p className="text-sm text-muted-foreground">{translate("Show your activities in the community", language)}</p>
              </div>
              <Switch id="activity-visibility" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="searchable" className="font-medium">{translate("Searchable", language)}</Label>
                <p className="text-sm text-muted-foreground">{translate("Allow others to find you by name or email", language)}</p>
              </div>
              <Switch id="searchable" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{translate("Data Usage", language)}</CardTitle>
            <CardDescription>{translate("Control how your data is used", language)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics" className="font-medium">{translate("Analytics", language)}</Label>
                <p className="text-sm text-muted-foreground">{translate("Allow us to collect anonymous usage data to improve the platform", language)}</p>
              </div>
              <Switch id="analytics" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="personalization" className="font-medium">{translate("Personalization", language)}</Label>
                <p className="text-sm text-muted-foreground">{translate("Allow us to personalize your experience based on your activity", language)}</p>
              </div>
              <Switch id="personalization" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{translate("Cookie Preferences", language)}</CardTitle>
            <CardDescription>{translate("Manage cookie settings", language)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="essential-cookies" className="font-medium">{translate("Essential Cookies", language)}</Label>
                <p className="text-sm text-muted-foreground">{translate("Required for the website to function properly", language)}</p>
              </div>
              <Switch id="essential-cookies" defaultChecked disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="preference-cookies" className="font-medium">{translate("Preference Cookies", language)}</Label>
                <p className="text-sm text-muted-foreground">{translate("Remember your settings and preferences", language)}</p>
              </div>
              <Switch id="preference-cookies" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics-cookies" className="font-medium">{translate("Analytics Cookies", language)}</Label>
                <p className="text-sm text-muted-foreground">{translate("Help us improve by collecting anonymous usage information", language)}</p>
              </div>
              <Switch id="analytics-cookies" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{translate("Download Your Data", language)}</CardTitle>
            <CardDescription>{translate("Export a copy of your personal data", language)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">{translate("You can request a download of all your personal data. This includes your profile information, activities, and contributions.", language)}</p>
            <Button variant="outline">{translate("Request Data Export", language)}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacySettings;
