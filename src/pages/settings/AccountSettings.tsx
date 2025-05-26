import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { Navigate } from 'react-router-dom';

const AccountSettings = () => {
  const { session } = useAuth();
  const { language } = useLanguage();
  
  // Redirect if not signed in
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">{translate("Account Settings", language)}</h1>
        <p className="text-muted-foreground">{translate("Manage your account preferences and personal information", language)}</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{translate("Profile Information", language)}</CardTitle>
            <CardDescription>{translate("Update your account information", language)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{translate("Name", language)}</Label>
                <Input id="name" placeholder={translate("Your name", language)} defaultValue={session?.user?.user_metadata?.full_name || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{translate("Email", language)}</Label>
                <Input id="email" type="email" placeholder="you@example.com" defaultValue={session?.user?.email || ""} disabled />
              </div>
            </div>
            <Button>{translate("Save Changes", language)}</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{translate("Change Password", language)}</CardTitle>
            <CardDescription>{translate("Update your password", language)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current">{translate("Current Password", language)}</Label>
                <Input id="current" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new">{translate("New Password", language)}</Label>
                <Input id="new" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">{translate("Confirm Password", language)}</Label>
                <Input id="confirm" type="password" />
              </div>
            </div>
            <Button>{translate("Update Password", language)}</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">{translate("Danger Zone", language)}</CardTitle>
            <CardDescription>{translate("Permanently delete your account", language)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">{translate("Delete Account", language)}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSettings;
