import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera, Save, LogOut, HandHelping, AlertTriangle, Check, KeyRound, Trash2 } from 'lucide-react';
import { CEKALoader } from '@/components/ui/ceka-loader';

const AccountSettings = () => {
  const { session, user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    email: '',
    avatar_url: '',
    bio: '',
    county: ''
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
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

  // Auto-save on blur with decimal/percentage based premium delay 
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setAutoSaveStatus('saving');
    autoSaveTimerRef.current = setTimeout(async () => {
      if (!session?.user?.id) return;

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

        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (err: any) {
        console.error('Auto-save failed:', err);
        setAutoSaveStatus('idle');
      }
    }, 1000);
  }, [profile, session]);

  const handleFieldBlur = () => {
    triggerAutoSave();
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: translate("Invalid file", language),
        description: translate("Please select an image file.", language)
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: translate("File too large", language),
        description: translate("Please select an image under 5MB.", language)
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: urlData.publicUrl }));

      toast({
        title: translate("Success", language),
        description: translate("Your profile picture has been updated.", language),
      });
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      toast({
        variant: "destructive",
        title: translate("Upload failed", language),
        description: err.message
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        variant: "destructive",
        title: translate("Passwords don't match", language),
        description: translate("Please make sure your new passwords match.", language)
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        variant: "destructive",
        title: translate("Password too short", language),
        description: translate("Password must be at least 6 characters.", language)
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      toast({
        title: translate("Password updated", language),
        description: translate("Your password has been changed successfully.", language),
      });

      setShowPasswordDialog(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: translate("Error", language),
        description: err.message
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await supabase.from('profiles').delete().eq('id', session?.user?.id);
      await supabase.auth.signOut();
      toast({
        title: translate("Account deactivated", language),
        description: translate("Your account has been deactivated.", language),
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: translate("Error", language),
        description: err.message
      });
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
      {autoSaveStatus !== 'idle' && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-lg border border-slate-200 dark:border-slate-700">
          {autoSaveStatus === 'saving' && (
            <>
              <CEKALoader variant="ios" size="sm" />
              <span className="text-xs font-medium">{translate("Saving...", language)}</span>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-green-600">{translate("Saved", language)}</span>
            </>
          )}
        </div>
      )}

      <div className="grid gap-6">
        <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight">{translate("Public Profile", language)}</CardTitle>
              <CardDescription>{translate("How others see you on CEKA.", language)}</CardDescription>
            </div>
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-slate-100 dark:border-white/10 shadow-xl">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <CEKALoader variant="ios" size="md" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl gap-2 font-bold"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <CEKALoader variant="ios" size="sm" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
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
                  onBlur={handleFieldBlur}
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
                  onBlur={handleFieldBlur}
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
                onBlur={handleFieldBlur}
                placeholder={translate("Tell us about your interests in civic education...", language)}
                className="rounded-3xl bg-slate-50 dark:bg-white/5 border-none min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-xl font-black">{translate("Account Security", language)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <Label htmlFor="email" className="font-bold ml-1 uppercase text-[10px] tracking-widest text-muted-foreground">{translate("Email Address", language)}</Label>
              <Input id="email" value={profile.email} disabled className="rounded-2xl bg-slate-100 dark:bg-white/10 border-none h-12 opacity-70" />
              {session?.user?.email_confirmed_at && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs ml-1 mt-2">
                  <Check className="h-3 w-3 mr-1" />
                  {translate("Verified", language)}
                </Badge>
              )}
            </div>

            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-2xl font-bold w-full sm:w-auto gap-2">
                  <KeyRound className="h-4 w-4" />
                  {translate("Change Password", language)}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle>{translate("Change Password", language)}</DialogTitle>
                  <DialogDescription>
                    {translate("Enter your new password below.", language)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{translate("New Password", language)}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwords.new}
                      onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{translate("Confirm Password", language)}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwords.confirm}
                      onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                    {translate("Cancel", language)}
                  </Button>
                  <Button onClick={handlePasswordChange} disabled={passwordLoading}>
                    {passwordLoading && <CEKALoader variant="ios" size="sm" />}
                    {translate("Update Password", language)}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

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

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={handleUpdateProfile}
            className="rounded-3xl h-14 px-8 font-black text-lg bg-kenya-red hover:bg-kenya-red/90 shadow-lg shadow-kenya-red/20 transition-all flex-1"
            disabled={loading}
          >
            {loading ? (
              <CEKALoader variant="ios" size="sm" />
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                {translate("Save Changes", language)}
              </>
            )}
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
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="rounded-2xl font-bold gap-2">
                    <Trash2 className="h-4 w-4" />
                    {translate("Deactivate Forever", language)}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-destructive">{translate("Are you absolutely sure?", language)}</DialogTitle>
                    <DialogDescription>
                      {translate("This action cannot be undone. This will permanently delete your account and remove all your data from our servers.", language)}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      {translate("Cancel", language)}
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      {translate("Yes, delete my account", language)}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
