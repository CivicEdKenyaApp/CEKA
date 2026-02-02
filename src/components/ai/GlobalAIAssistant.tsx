// Global AI Assistant FAB - positioned above donation button
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, X, Bot, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Rate limiting per user session
const MAX_MESSAGES_PER_DAY = 20;
const RATE_LIMIT_KEY = 'ceka_ai_usage';

const getUsageToday = (): number => {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return 0;
    const { count, date } = JSON.parse(stored);
    if (date !== new Date().toDateString()) return 0;
    return count;
};

const incrementUsage = () => {
    const count = getUsageToday() + 1;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
        count,
        date: new Date().toDateString()
    }));
    return count;
};

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const GlobalAIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState(0);
    const location = useLocation();

    // Hide on pages that already have their own AI implementation
    const hiddenPaths = ['/constitution'];
    const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));

    useEffect(() => {
        setUsage(getUsageToday());

        const handleTrigger = (e: any) => {
            const { query: triggerQuery } = e.detail;
            setIsOpen(true);
            setQuery(triggerQuery);
            // We use a small timeout to let the state update before sending
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('ceka-ai-send-now'));
            }, 100);
        };

        window.addEventListener('ceka-ai-trigger', handleTrigger);
        return () => window.removeEventListener('ceka-ai-trigger', handleTrigger);
    }, []);

    useEffect(() => {
        const handleSendNow = () => {
            handleSend();
        };
        document.addEventListener('ceka-ai-send-now', handleSendNow);
        return () => document.removeEventListener('ceka-ai-send-now', handleSendNow);
    }, [query, usage, loading]); // Dependencies for handleSend capture

    const handleSend = async () => {
        if (!query.trim() || loading) return;

        if (usage >= MAX_MESSAGES_PER_DAY) {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `You've reached your daily limit of ${MAX_MESSAGES_PER_DAY} AI queries. Come back tomorrow! 🇰🇪`
            }]);
            return;
        }

        const userMsg = query;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setQuery('');
        setLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('ceka-ai-assistant', {
                body: {
                    query: userMsg,
                    context: location.pathname
                }
            });

            if (error) throw error;

            const newUsage = incrementUsage();
            setUsage(newUsage);

            setMessages(prev => [...prev, {
                role: 'ai',
                content: data.answer || "I couldn't process that request. Please try again."
            }]);
        } catch (err) {
            console.error('AI Assistant error:', err);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "I'm having trouble connecting. Please try again in a moment."
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (shouldHide) return null;

    return (
        // Repositioned to bottom-32 on mobile to clear the donation widget (bottom-6)
        // Smaller size on mobile (h-12 w-12) for better aesthetics
        <div className="fixed bottom-32 right-4 z-50 md:bottom-8 md:right-24">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[350px] max-w-[85vw] md:w-[380px]"
                    >
                        <Card className="border-none shadow-2xl overflow-hidden h-[450px] md:h-[480px] flex flex-col bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl">
                            <CardHeader className="bg-gradient-to-r from-kenya-green to-primary p-3 md:p-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs md:text-sm font-black tracking-widest uppercase flex items-center gap-2 text-white">
                                    <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                                    CEKA AI
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] md:text-[10px] text-white/70">{MAX_MESSAGES_PER_DAY - usage} left</span>
                                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 h-7 w-7 md:h-8 md:w-8">
                                        <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-black/20">
                                {messages.length === 0 && (
                                    <div className="text-center py-6 md:py-8 space-y-4">
                                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-kenya-green/10 flex items-center justify-center mx-auto">
                                            <Bot className="h-6 w-6 md:h-8 md:w-8 text-kenya-green" />
                                        </div>
                                        <div>
                                            <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-white">Your Civic Assistant</p>
                                            <p className="text-[10px] md:text-xs text-slate-500 mt-1">Ask about legislation or the Constitution</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {['What is Article 43?', 'Explain Finance Bill'].map(q => (
                                                <button
                                                    key={q}
                                                    onClick={() => setQuery(q)}
                                                    className="text-[10px] md:text-xs px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-kenya-green/10 hover:border-kenya-green/20 transition-colors"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {messages.map((m, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[88%] p-3 rounded-2xl text-xs md:text-sm ${m.role === 'user'
                                            ? 'bg-kenya-green text-white rounded-tr-none'
                                            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-tl-none'
                                            }`}>
                                            {m.content}
                                        </div>
                                    </motion.div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-2xl rounded-tl-none">
                                            <Loader2 className="h-4 w-4 animate-spin text-kenya-green" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <div className="p-3 md:p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black/40">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ask something..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        className="h-10 text-sm rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                                        disabled={usage >= MAX_MESSAGES_PER_DAY}
                                    />
                                    <Button
                                        onClick={handleSend}
                                        size="icon"
                                        className="h-10 w-10 md:h-10 md:w-10 rounded-xl bg-kenya-green hover:bg-kenya-green/90 text-white shrink-0"
                                        disabled={loading || usage >= MAX_MESSAGES_PER_DAY}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-12 w-12 md:h-14 md:w-14 rounded-full shadow-2xl transition-all duration-300 ${isOpen
                    ? 'bg-kenya-red rotate-45'
                    : 'bg-gradient-to-br from-kenya-green to-primary hover:scale-110 hover:shadow-kenya-green/30'
                    }`}
            >
                {isOpen ? <X className="h-5 w-5 md:h-6 md:w-6 text-white" /> : <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />}
            </Button>
        </div>
    );
};

export default GlobalAIAssistant;
