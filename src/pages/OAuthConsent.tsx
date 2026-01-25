import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ShieldAlert, Check, X, Loader2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const OAuthConsent = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const scope = searchParams.get('scope') || 'profile email';
    const state = searchParams.get('state');

    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authorizing, setAuthorizing] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate(`/auth?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }

        const fetchAppDetails = async () => {
            if (!clientId) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('third_party_apps' as any)
                    .select('*')
                    .eq('client_id', clientId)
                    .single();

                if (error || !data) throw new Error('App not found');
                setApp(data);
            } catch (err) {
                console.error('OAuth error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppDetails();
    }, [clientId, user, navigate]);

    const handleApprove = async () => {
        setAuthorizing(true);
        // Simulate OAuth Code Generation
        setTimeout(() => {
            const code = btoa(JSON.stringify({ u: user?.id, t: Date.now() }));
            const finalUrl = `${redirectUri}?code=${code}${state ? `&state=${state}` : ''}`;

            toast({
                title: "Access Granted",
                description: `Successfully authorized ${app?.name || 'Third Party App'}.`,
                className: "bg-kenya-green text-white font-bold"
            });

            window.location.href = finalUrl;
        }, 1500);
    };

    const handleDeny = () => {
        if (redirectUri) {
            window.location.href = `${redirectUri}?error=access_denied${state ? `&state=${state}` : ''}`;
        } else {
            navigate('/');
        }
    };

    if (loading) return (
        <Layout>
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground animate-pulse">Establishing Secure Handshake...</p>
            </div>
        </Layout>
    );

    if (!app || !clientId || !redirectUri) return (
        <Layout>
            <div className="container py-20 flex flex-col items-center">
                <div className="h-20 w-20 rounded-3xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-6">
                    <ShieldAlert className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-black mb-2 text-center">Invalid Security Request</h1>
                <p className="text-muted-foreground text-center max-w-xs mb-8">This OAuth request is missing critical parameters or the application is unregistered.</p>
                <Button onClick={() => navigate('/')} variant="outline" className="rounded-2xl h-12 px-8">Back to Safety</Button>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="container py-12 md:py-20 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-none shadow-ios-high rounded-[40px] overflow-hidden bg-white/70 dark:bg-black/40 backdrop-blur-2xl">
                        <div className="h-32 bg-gradient-to-br from-primary/10 via-background to-transparent relative flex items-center justify-center">
                            <div className="h-20 w-20 rounded-3xl bg-white dark:bg-[#1C1C1E] shadow-xl flex items-center justify-center border border-white/20">
                                <span className="text-3xl font-black text-primary">{app.name.charAt(0)}</span>
                            </div>
                            <div className="absolute -bottom-4 right-1/2 translate-x-1/2 h-8 w-8 rounded-full bg-kenya-green flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-black">
                                <Check className="h-4 w-4 stroke-[4px]" />
                            </div>
                        </div>

                        <CardHeader className="pt-8 text-center px-8">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <ShieldCheck className="h-4 w-4 text-kenya-green" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-kenya-green">Verified Integration</span>
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight">{app.name}</CardTitle>
                            <CardDescription className="text-sm font-medium pt-1">Requests access to your CEKA identity</CardDescription>
                        </CardHeader>

                        <CardContent className="px-8 pb-8">
                            <div className="space-y-6">
                                <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">This app will be able to:</p>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3">
                                            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5"><Check className="h-3 w-3 text-blue-500" /></div>
                                            <span className="text-sm font-bold">View your full name and avatar</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5"><Check className="h-3 w-3 text-blue-500" /></div>
                                            <span className="text-sm font-bold">View your primary email address</span>
                                        </li>
                                        {scope.includes('write') && (
                                            <li className="flex items-start gap-3">
                                                <div className="h-5 w-5 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5"><Check className="h-3 w-3 text-orange-500" /></div>
                                                <span className="text-sm font-bold text-orange-600">Interact with chat on your behalf</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl">
                                    <Info className="h-5 w-5 text-primary shrink-0" />
                                    <p className="text-[11px] font-medium leading-relaxed">
                                        By authorizing, you agree to share your data with <span className="font-bold">{app.name}</span>. You can revoke this anytime in CEKA Settings.
                                    </p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3 px-8 pb-10">
                            <Button
                                onClick={handleApprove}
                                disabled={authorizing}
                                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                            >
                                {authorizing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Authorize Application'}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleDeny}
                                disabled={authorizing}
                                className="w-full h-12 rounded-xl text-muted-foreground hover:text-foreground font-bold"
                            >
                                Cancel and Return
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </Layout>
    );
};

export default OAuthConsent;
