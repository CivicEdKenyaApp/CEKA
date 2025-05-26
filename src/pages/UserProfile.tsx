
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types'; // Ensure this type import is correct

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/layout/Layout';
import { translate } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];

const UserProfile = () => {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !session) {
      navigate('/auth');
    }
  }, [session, authLoading, navigate]);

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      if (!session?.user?.id) {
        // Prevent query if user ID is not available
        setLoading(false);
        return;
      }
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && status !== 406) { // 406 can mean no row found, which is fine for single()
        throw error;
      }
      
      if (data) {
        setProfile(data);
        setUsername(data.username || '');
        setFullName(data.full_name || '');
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        title: translate("Error loading profile", language),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setUpdating(true);
      if (!session?.user?.id) {
        // Prevent update if user ID is not available
        setUpdating(false);
        toast({
            variant: "destructive",
            title: translate("Error", language),
            description: translate("User session not found.", language),
        });
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;
      
      toast({
        title: translate("Success!", language),
        description: translate("Your profile has been updated.", language),
      });
      
      getProfile(); // Refresh profile data
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: translate("Error updating profile", language),
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/'); // Redirect to home or login page after sign out
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: translate("Error signing out", language),
        description: error.message,
      });
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          {translate("Loading...", language)}
        </div>
      </Layout>
    );
  }
  
  if (!session) {
     // This case should ideally be handled by the redirect in useEffect,
     // but as a fallback or if navigation hasn't completed.
    return (
      <Layout>
        <div className="container py-16 text-center">
          {translate("Redirecting to login...", language)}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-xl py-16">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || profile?.username || 'User'} />
                <AvatarFallback className="text-2xl">
                  {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || session.user.email?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{translate("Your Profile", language)}</CardTitle>
            <CardDescription>
              {translate("Manage your account details", language)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">{translate("Email", language)}</label>
              <Input
                id="email"
                type="email"
                value={session.user.email || ''}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">{translate("Username", language)}</label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={translate("Enter your username", language)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">{translate("Full Name", language)}</label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={translate("Enter your full name", language)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={updateProfile} 
              className="w-full bg-kenya-green hover:bg-kenya-green/90" 
              disabled={updating}
            >
              {updating ? translate("Updating...", language) : translate("Update Profile", language)}
            </Button>
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="w-full"
            >
              {translate("Sign Out", language)}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default UserProfile;
