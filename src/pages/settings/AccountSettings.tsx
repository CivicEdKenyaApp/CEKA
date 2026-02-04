
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera, Save, LogOut, HandHelping, AlertTriangle, User as UserIcon } from 'lucide-react';

const AccountSettings = () => {
  const { session, user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    email: '',
    avatar_url: '',
    bio: '',
    county: ''
  });

  useEffect(() => {
    if (session) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile({
          username: data.username || '',
          full_name: data.full_name || '',
          email: session?.user?.email || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
          county: (data as any).county || ''
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleUpdateProfile = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          county: profile.county,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: translate("Success", language),
        description: translate("Your profile has been updated.", language),
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: translate("Error", language),
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Profile Card */}
        <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight">{translate("Public Profile", language)}</CardTitle>
              <CardDescription>{translate("How others see you on CEKA.", language)}</CardDescription>
            </div>
            <Avatar className="h-16 w-16 border-2 border-slate-100 dark:border-white/10">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" size="sm" className="rounded-2xl gap-2 font-bold">
                <Camera className="h-4 w-4" />
                {translate("Change Photo", language)}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <Label htmlFor="username" className="font-bold ml-1 uppercase text-[10px] tracking-widest text-muted-foreground">{translate("Username", language)}</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={e => setProfile({ ...profile, username: e.target.value })}
                  placeholder="johndoe"
                  className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12"
                />
              </div>
              <div className="space-y-2 text-sm">
                <Label htmlFor="full_name" className="font-bold ml-1 uppercase text-[10px] tracking-widest text-muted-foreground">{translate("Display Name", language)}</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="rounded-2xl bg-slate-50 dark:bg-white/5 border-none h-12"
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <Label htmlFor="bio" className="font-bold ml-1 uppercase text-[10px] tracking-widest text-muted-foreground">{translate("Bio", language)}</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                placeholder={translate("Tell us about your interests in civic education...", language)}
                className="rounded-3xl bg-slate-50 dark:bg-white/5 border-none min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-xl font-black">{translate("Account Security", language)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <Label htmlFor="email" className="font-bold ml-1 uppercase text-[10px] tracking-widest text-muted-foreground">{translate("Email Address", language)}</Label>
              <Input id="email" value={profile.email} disabled className="rounded-2xl bg-slate-100 dark:bg-white/10 border-none h-12 opacity-70" />
            </div>
            <Button variant="outline" className="rounded-2xl font-bold w-full sm:w-auto">{translate("Change Password", language)}</Button>
          </CardContent>
        </Card>

        {/* Activate Section */}
        <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900 p-6 border-l-4 border-kenya-red">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-kenya-red/10 rounded-3xl flex items-center justify-center shrink-0">
              <HandHelping className="h-6 w-6 text-kenya-red" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg tracking-tight">Civic Activations</h3>
              <p className="text-xs text-muted-foreground mt-1">Activate your status to join community initiatives.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="bg-slate-100 text-slate-900 dark:bg-white/5 dark:text-white rounded-full px-3 py-1 font-bold text-[10px] border-none">STATUS: READY</Badge>
                <Badge className="bg-primary/10 text-primary rounded-full px-3 py-1 font-bold text-[10px] border-none">LEVEL: CITIZEN</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={handleUpdateProfile}
            className="rounded-3xl h-14 px-8 font-black text-lg bg-kenya-red hover:bg-kenya-red/90 shadow-lg shadow-kenya-red/20 transition-all flex-1"
            disabled={loading}
          >
            <Save className="mr-2 h-5 w-5" />
            {loading ? translate("Saving...", language) : translate("Save Changes", language)}
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="rounded-3xl h-14 px-8 font-bold border-2"
          >
            <LogOut className="mr-2 h-5 w-5" />
            {translate("Sign Out", language)}
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="pt-12">
          <h4 className="flex items-center gap-2 text-destructive font-bold uppercase tracking-widest text-[10px] mb-4 ml-6">
            <AlertTriangle className="h-3 w-3" />
            Danger Zone
          </h4>
          <Card className="rounded-[2.5rem] border-2 border-destructive/20 bg-destructive/5 dark:bg-destructive/10 overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-destructive">{translate("Delete Account", language)}</h3>
                <p className="text-xs text-destructive/70 mt-1">{translate("Permanently remove your account and all data.", language)}</p>
              </div>
              <Button variant="destructive" className="rounded-2xl font-bold">{translate("Deactivate Forever", language)}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
