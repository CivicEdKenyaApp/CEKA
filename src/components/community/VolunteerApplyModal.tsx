import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { CEKALoader } from '@/components/ui/ceka-loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { translate } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface VolunteerApplyModalProps {
    opportunity: any;
    isOpen: boolean;
    onClose: () => void;
}

export const VolunteerApplyModal = ({ opportunity, isOpen, onClose }: VolunteerApplyModalProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [motivation, setMotivation] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [progress, setProgress] = useState(0);
    const { language } = useLanguage();

    const handleSubmit = async () => {
        if (!user) {
            toast({ title: "Identification Required", description: "Please sign in to volunteer for the commons.", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        setProgress(10);

        try {
            // Artificial 'Calming' Delay for Node Propagation
            const progressTimer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressTimer);
                        return 90;
                    }
                    return prev + 5;
                });
            }, 100);

            const { error } = await supabase.from('volunteer_applications').insert({
                user_id: user.id,
                opportunity_id: opportunity.id,
                message: motivation,
                status: 'pending'
            });

            if (error) throw error;

            // Log Interaction
            await supabase.from('chat_interactions' as any).insert({
                user_id: user.id,
                target_id: opportunity.id,
                target_type: 'volunteer_opp',
                action_type: 'apply'
            });

            setProgress(100);
            setSuccess(true);
            toast({ title: "Application Transmitted", description: "The CEKA admin team has received your request." });

            // Auto-close after 3s
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setMotivation('');
                setProgress(0);
            }, 3000);

        } catch (err: any) {
            toast({ title: "Transmission Failed", description: err.message, variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[40px] border-none shadow-ios-high overflow-hidden bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl px-8 py-10">
                <AnimatePresence mode="wait">
                    {!success ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-8"
                        >
                            <DialogHeader>
                                <div className="h-16 w-16 bg-primary/10 rounded-[22px] flex items-center justify-center mb-6">
                                    <ShieldCheck className="h-8 w-8 text-primary" />
                                </div>
                                <DialogTitle className="text-3xl font-black tracking-tight">{opportunity.title}</DialogTitle>
                                <DialogDescription className="text-base font-medium text-muted-foreground pt-2">
                                    Apply to join <span className="text-primary font-bold">{opportunity.organization}</span> and contribute to Kenyan civic growth.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-kenya-green animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Requirements Check</span>
                                    </div>
                                    <p className="text-xs font-medium">By applying, you confirm availability for: <span className="font-bold">{opportunity.commitment_type}</span></p>
                                </div>

                                <div className="grid gap-4 pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="motivation" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Why do you want to volunteer?</Label>
                                        <Textarea
                                            id="motivation"
                                            name="motivation"
                                            placeholder="Describe your motivation and relevant experience..."
                                            className="min-h-[150px] rounded-[24px] bg-slate-100/50 dark:bg-black/20 border-none shadow-inner p-5 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                                            value={motivation}
                                            onChange={(e) => setMotivation(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="flex-col gap-4 pt-4">
                                {submitting && (
                                    <div className="w-full space-y-2 mb-2 animate-in fade-in duration-500">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-primary">
                                            <span>Sovereign Transmission in Progress...</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-1.5" />
                                        <p className="text-[10px] text-muted-foreground italic text-center">Calming system nodes for secure propagation...</p>
                                    </div>
                                )}
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || !motivation.trim()}
                                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                                >
                                    {submitting ? <CEKALoader variant="ios" size="sm" /> : 'Transmit Application'}
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 flex flex-col items-center text-center"
                        >
                            <div className="h-24 w-24 bg-kenya-green/10 rounded-[32px] flex items-center justify-center mb-8">
                                <CheckCircle2 className="h-12 w-12 text-kenya-green" />
                            </div>
                            <h3 className="text-3xl font-black mb-3">Submission Success</h3>
                            <p className="text-muted-foreground max-w-xs font-medium mb-10">Your application has been logged in the CEKA Audit Grid. An admin will review and respond via your registered email.</p>

                            <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
                                <Mail className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Notification Pending</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};
