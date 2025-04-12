
import React, { useState } from 'react';
import { X, Mail, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/App';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, close the modal
  React.useEffect(() => {
    if (session) {
      onOpenChange(false);
    }
  }, [session, onOpenChange]);

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
      onOpenChange(false);
      
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

  // Animation variants for the social buttons
  const socialButtonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-lg bg-gradient-to-br from-[#EEEEEE]/80 via-[#006600]/40 to-[#BB1600]/40 border border-primary/10 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {translate("Welcome to CEKA", language)}
          </DialogTitle>
          <DialogDescription className="text-center">
            {translate("Join our community of active citizens", language)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <motion.button
              className="flex items-center justify-center gap-2 w-full p-3 rounded-md bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition-colors"
              onClick={handleGoogleSignIn}
              variants={socialButtonVariants}
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
              className="flex items-center justify-center gap-2 w-full p-3 rounded-md bg-[#1DA1F2] text-white hover:bg-[#1a91da] transition-colors"
              onClick={handleTwitterSignIn}
              variants={socialButtonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Twitter className="w-5 h-5" />
              <span>{translate("Continue with Twitter", language)}</span>
            </motion.button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-foreground">
                {translate("Or", language)}
              </span>
            </div>
          </div>
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/30">
              <TabsTrigger value="signin">{translate("Sign In", language)}</TabsTrigger>
              <TabsTrigger value="signup">{translate("Sign Up", language)}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {translate("Email", language)}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="transition-all focus:ring-2 focus:ring-primary/30 bg-white/70"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    {translate("Password", language)}
                  </label>
                  <Input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="transition-all focus:ring-2 focus:ring-primary/30 bg-white/70"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-kenya-green hover:bg-kenya-green/90 transition-all duration-300" 
                  disabled={loading}
                >
                  {loading ? translate("Signing in...", language) : translate("Sign In", language)}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    {translate("Full Name", language)}
                  </label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="transition-all focus:ring-2 focus:ring-primary/30 bg-white/70"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    {translate("Username", language)}
                  </label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="transition-all focus:ring-2 focus:ring-primary/30 bg-white/70"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signupEmail" className="text-sm font-medium">
                    {translate("Email", language)}
                  </label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="transition-all focus:ring-2 focus:ring-primary/30 bg-white/70"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signupPassword" className="text-sm font-medium">
                    {translate("Password", language)}
                  </label>
                  <Input 
                    id="signupPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="transition-all focus:ring-2 focus:ring-primary/30 bg-white/70"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-kenya-green hover:bg-kenya-green/90 transition-all duration-300" 
                  disabled={loading}
                >
                  {loading ? translate("Creating account...", language) : translate("Create Account", language)}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
