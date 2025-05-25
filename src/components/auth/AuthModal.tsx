
'use client';

import React, { useState, useEffect } from 'react';
import { X, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { translate } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
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
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isDarkMode = theme === 'dark';

  // 💡 Auto-close modal if user is signed in
  useEffect(() => {
    if (session && open) {
      onOpenChange(false);
    }
  }, [session, open, onOpenChange]);

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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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
        options: { redirectTo: window.location.origin },
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
        options: { redirectTo: window.location.origin },
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

  const socialButtonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`sm:max-w-md backdrop-blur-lg shadow-lg border border-primary/10 relative overflow-auto max-h-[90vh] z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          ${isDarkMode ? 
            'bg-gray-800/90 text-white border-gray-700' : 
            'bg-white/90 text-gray-900 border-gray-200'}`}
      >
        {/* Kenya-themed color gradient overlay - adjusted for dark mode */}
        <div className={`absolute inset-0 ${
          isDarkMode ? 
            'bg-gradient-to-br from-[#006600]/20 via-[#1A1A1A]/10 to-[#BB1600]/20' : 
            'bg-gradient-to-br from-[#006600]/10 via-[#EEEEEE]/5 to-[#BB1600]/10'
        } pointer-events-none z-0`}></div>
        
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <DialogHeader className="relative z-10">
          <DialogTitle className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : ''}`}>
            {translate("Welcome to CEKA 🇰🇪", language)}
          </DialogTitle>
          <DialogDescription className={`text-center ${isDarkMode ? 'text-gray-300' : ''}`}>
            {translate("Sign in to save your progress and access civic tools.", language)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 relative z-10">
          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3">
            <motion.button
              className={`flex items-center justify-center gap-2 w-full p-3 rounded-md border transition-colors ${
                isDarkMode ? 
                'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : 
                'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={handleGoogleSignIn}
              variants={socialButtonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className={`w-full ${isDarkMode ? 'border-t border-gray-600' : 'border-t border-gray-300'}`} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={`px-2 ${isDarkMode ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-foreground'}`}>
                {translate("Or", language)}
              </span>
            </div>
          </div>

          {/* Tabbed Forms */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className={`grid w-full grid-cols-2 relative z-20 ${isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'}`}>
              <TabsTrigger value="signin" className={isDarkMode ? 'data-[state=active]:bg-gray-600' : ''}>
                {translate("Sign In", language)}
              </TabsTrigger>
              <TabsTrigger value="signup" className={isDarkMode ? 'data-[state=active]:bg-gray-600' : ''}>
                {translate("Sign Up", language)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <InputField 
                  label="Email" 
                  value={email} 
                  onChange={setEmail} 
                  id="email"
                  isDarkMode={isDarkMode}
                />
                <InputField 
                  label="Password" 
                  value={password} 
                  onChange={setPassword} 
                  id="password" 
                  type="password"
                  isDarkMode={isDarkMode}
                />
                <Button 
                  type="submit" 
                  className={`w-full ${isDarkMode ? 
                    'bg-kenya-green hover:bg-kenya-green/80 text-white' : 
                    'bg-kenya-green hover:bg-kenya-green/90'}`} 
                  disabled={loading}
                >
                  {loading ? translate("Signing in...", language) : translate("Sign In", language)}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <InputField 
                  label="Full Name" 
                  value={fullName} 
                  onChange={setFullName} 
                  id="fullName"
                  isDarkMode={isDarkMode}
                />
                <InputField 
                  label="Username" 
                  value={username} 
                  onChange={setUsername} 
                  id="username"
                  isDarkMode={isDarkMode}
                />
                <InputField 
                  label="Email" 
                  value={email} 
                  onChange={setEmail} 
                  id="signupEmail"
                  isDarkMode={isDarkMode}
                />
                <InputField 
                  label="Password" 
                  value={password} 
                  onChange={setPassword} 
                  id="signupPassword" 
                  type="password"
                  isDarkMode={isDarkMode}
                />
                <Button 
                  type="submit" 
                  className={`w-full ${isDarkMode ? 
                    'bg-kenya-green hover:bg-kenya-green/80 text-white' : 
                    'bg-kenya-green hover:bg-kenya-green/90'}`} 
                  disabled={loading}
                >
                  {loading ? translate("Creating account...", language) : translate("Create Account", language)}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Skip for now button */}
        <DialogFooter className="justify-center mt-4 relative z-10">
          <button 
            onClick={() => onOpenChange(false)} 
            className={`text-sm hover:underline ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500'}`}
          >
            {translate("Skip for now", language)}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 🔁 Reusable input field helper with dark mode support
const InputField = ({
  label,
  value,
  onChange,
  id,
  type = 'text',
  isDarkMode = false
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  id: string;
  type?: string;
  isDarkMode?: boolean;
}) => {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={id} 
        className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : ''}`}
      >
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={type === 'password' ? 'current-password' : 'email'}
        className={`transition-all focus:ring-2 focus:ring-primary/30 ${
          isDarkMode ? 
          'bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400' : 
          'bg-white/70'
        }`}
      />
    </div>
  );
};

export default AuthModal;
