import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/App';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { animationVariants } from '@/lib/utils';

const AuthPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: translate("Success!", language),
        description: translate("Check your email for the confirmation link.", language),
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: translate("Error signing up", language),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: translate("Error signing in", language),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: translate("Error", language),
        description: error.message,
      });
    }
  };

  const handleTwitterSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: translate("Error", language),
        description: error.message,
      });
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-md py-16 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#006600]/10 via-[#141414]/5 to-[#BB1600]/10 -z-10 rounded-2xl"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{translate("Welcome to CEKA", language)}</h1>
          <p className="text-muted-foreground">{translate("Join our community of active citizens", language)}</p>
        </div>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/30">
            <TabsTrigger value="signin">{translate("Sign In", language)}</TabsTrigger>
            <TabsTrigger value="signup">{translate("Sign Up", language)}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <Card className="border-primary/10 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{translate("Sign In", language)}</CardTitle>
                <CardDescription>
                  {translate("Enter your credentials to access your account", language)}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">{translate("Email", language)}</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">{translate("Password", language)}</label>
                    <Input 
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-3">
                    <motion.button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full p-3 rounded-md bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition-colors"
                      onClick={handleGoogleSignIn}
                      variants={animationVariants.button}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                        <path fill="none" d="M1 1h22v22H1z" />
                      </svg>
                      <span>{translate("Continue with Google", language)}</span>
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full p-3 rounded-md bg-[#1DA1F2] text-white hover:bg-[#1a91da] transition-colors"
                      onClick={handleTwitterSignIn}
                      variants={animationVariants.button}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      <span>{translate("Continue with Twitter", language)}</span>
                    </motion.button>
                  </div>
                </CardContent>
                <CardFooter>
                  <motion.button
                    type="submit"
                    className="w-full bg-kenya-green hover:bg-kenya-green/90 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    disabled={loading}
                    variants={animationVariants.button}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {loading ? translate("Signing in...", language) : translate("Sign In", language)}
                  </motion.button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card className="border-primary/10 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{translate("Create Account", language)}</CardTitle>
                <CardDescription>
                  {translate("Join our community of active citizens", language)}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium">{translate("Full Name", language)}</label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">{translate("Username", language)}</label>
                    <Input
                      id="username"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signupEmail" className="text-sm font-medium">{translate("Email", language)}</label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signupPassword" className="text-sm font-medium">{translate("Password", language)}</label>
                    <Input 
                      id="signupPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="transition-all focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-3">
                    <motion.button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full p-3 rounded-md bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition-colors"
                      onClick={handleGoogleSignIn}
                      variants={animationVariants.button}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                        <path fill="none" d="M1 1h22v22H1z" />
                      </svg>
                      <span>{translate("Continue with Google", language)}</span>
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full p-3 rounded-md bg-[#1DA1F2] text-white hover:bg-[#1a91da] transition-colors"
                      onClick={handleTwitterSignIn}
                      variants={animationVariants.button}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      <span>{translate("Continue with Twitter", language)}</span>
                    </motion.button>
                  </div>
                </CardContent>
                <CardFooter>
                  <motion.button
                    type="submit"
                    className="w-full bg-kenya-green hover:bg-kenya-green/90 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    disabled={loading}
                    variants={animationVariants.button}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {loading ? translate("Creating account...", language) : translate("Create Account", language)}
                  </motion.button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default AuthPage;
