
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { User, Bell, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const Settings = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{translate("Settings", language)}</h1>
        <p className="text-muted-foreground">{translate("Manage your account settings and preferences", language)}</p>
      </div>
      
      <div className="grid gap-4">
        {user && (
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/settings/account')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-4">
                <User className="h-8 w-8 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">{translate("Account", language)}</CardTitle>
                  <CardDescription>{translate("Manage your account information and preferences", language)}</CardDescription>
                </div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </CardHeader>
          </Card>
        )}
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/settings/notifications')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">{translate("Notifications", language)}</CardTitle>
                <CardDescription>{translate("Configure your notification preferences", language)}</CardDescription>
              </div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/settings/privacy')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">{translate("Privacy", language)}</CardTitle>
                <CardDescription>{translate("Manage your privacy and data settings", language)}</CardDescription>
              </div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
