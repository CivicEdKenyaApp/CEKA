
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const SignupWithVerification = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();

  // Helper to check if user is verified
  const checkVerificationStatus = async () => {
    try {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) {
        setMessage('Unable to check verification status.');
        return false;
      }
      const verified = userData?.user?.email_confirmed_at !== null;
      return verified;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  };

  // Sign up a user
  const handleSignup = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setMessage('Account exists. Attempting to resend verification email...');
          await handleResend();
        } else {
          setMessage(error.message);
          toast({
            title: "Sign Up Error",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        setMessage('Verification email sent! Check your inbox and spam folder.');
        toast({
          title: "Success",
          description: "Verification email sent! Check your inbox.",
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResend = async () => {
    if (resendCooldown > 0) {
      setMessage(`Please wait ${resendCooldown} seconds before resending.`);
      return;
    }

    if (!email) {
      setMessage('Please enter your email address first.');
      return;
    }

    setLoading(true);

    try {
      const verified = await checkVerificationStatus();
      if (verified) {
        setMessage('This email is already verified. Please log in.');
        toast({
          title: "Already Verified",
          description: "This email is already verified. Please log in.",
        });
        setLoading(false);
        return;
      }

      // Use Supabase's resend method for verification
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        toast({
          title: "Resend Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setMessage('Verification email resent! Check your inbox and spam folder.');
        toast({
          title: "Email Sent",
          description: "Verification email resent! Check your inbox.",
        });

        // Start cooldown
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          onClick={handleSignup}
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing Up...
            </>
          ) : (
            'Sign Up'
          )}
        </Button>

        <Button
          onClick={handleResend}
          variant="outline"
          className="w-full"
          disabled={resendCooldown > 0 || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            `Resend Verification Email ${resendCooldown > 0 ? `(${resendCooldown})` : ''}`
          )}
        </Button>

        {message && (
          <div className="text-sm text-center p-3 rounded bg-muted">
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignupWithVerification;
