// Global AI Assistant FAB - positioned above donation button
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, X, Bot, Loader2, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

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
    const [isVisible, setIsVisible] = useState(false);

    const [isIdle, setIsIdle] = useState(false);
    const [showPulse, setShowPulse] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const queryRef = React.useRef(query);
    const usageRef = React.useRef(usage);
    const loadingRef = React.useRef(loading);

    const location = useLocation();

    // engagement effects
    useEffect(() => {
        const pulseTimer = setTimeout(() => {
            if (!isOpen) setShowPulse(true);
        }, 15000); // 15s delay

        const idleTimer = setTimeout(() => {
            if (!isOpen && !isHovering) setIsIdle(true);
        }, 45000); // 45s delay

        return () => {
            clearTimeout(pulseTimer);
            clearTimeout(idleTimer);
        };
    }, [isOpen, isHovering]);

    // Sync refs
    useEffect(() => { queryRef.current = query; }, [query]);
    useEffect(() => { usageRef.current = usage; }, [usage]);
    useEffect(() => { loadingRef.current = loading; }, [loading]);

    // Hide on pages that already have their own AI implementation
    const hiddenPaths = ['/constitution'];
    const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));

    useEffect(() => {
        setUsage(getUsageToday());

        const handleTrigger = (e: any) => {
            const { query: triggerQuery } = e.detail;
            setIsOpen(true);
            setQuery(triggerQuery);
            // Pass directly to avoid state lag
            setTimeout(() => {
                handleSend(triggerQuery);
            }, 50);
        };

        const visibilityTimer = setTimeout(() => {
            setIsVisible(true);
        }, 5000);

        window.addEventListener('ceka-ai-trigger', handleTrigger);
        return () => {
            window.removeEventListener('ceka-ai-trigger', handleTrigger);
            clearTimeout(visibilityTimer);
        };
    }, []);

    useEffect(() => {
        const handleSendNow = () => {
            handleSend();
        };
        document.addEventListener('ceka-ai-send-now', handleSendNow);
        return () => document.removeEventListener('ceka-ai-send-now', handleSendNow);
    }, []); // No deps needed with refs

    const handleSend = async (overrideQuery?: string) => {
        const activeQuery = overrideQuery !== undefined ? overrideQuery : queryRef.current;

        if (!activeQuery.trim() || loadingRef.current) return;

        if (usageRef.current >= MAX_MESSAGES_PER_DAY) {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `You've reached your daily limit of ${MAX_MESSAGES_PER_DAY} AI queries. Come back tomorrow! 🇰🇪`
            }]);
            return;
        }

        const userMsg = activeQuery;
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

            if (data.error) {
                console.error('AI Strategy Error:', data.message, data.diagnostic);
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: `I'm currently recalibrating. Diagnosis: ${data.message}. Please try again shortly.`
                }]);
                return;
            }

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
        <div
            className={cn(
                "fixed z-50 transition-all duration-1000 ease-out",
                !isVisible && !isOpen && "opacity-0 translate-y-20 pointer-events-none"
            )}
            style={{
                zIndex: 50,
                bottom: isOpen ? 'auto' : '204px',
                right: isOpen ? 'auto' : '2rem',
                ...(isOpen ? {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                } : {})
            }}
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-80 bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px]"
                    >
                        <div className="bg-gradient-to-r from-kenya-green/10 to-primary/10 p-4 border-b border-white/10 dark:border-gray-700/10">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg flex items-center text-slate-800 dark:text-white">
                                    <div className="relative mr-3">
                                        <Bot className="h-6 w-6 text-kenya-green drop-shadow-sm" />
                                        <div className="absolute inset-0 bg-kenya-green/20 blur-sm rounded-full" />
                                    </div>
                                    CEKA AI
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                        {MAX_MESSAGES_PER_DAY - usage} left
                                    </span>
                                    <button
                                        className="relative group rounded-full p-2 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-300 backdrop-blur-sm"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="h-4 w-4 text-slate-500 dark:text-gray-400 group-hover:text-kenya-red transition-colors" />
                                        <div className="absolute inset-0 rounded-full bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 green-scrollbar">
                            {messages.length === 0 && (
                                <div className="text-center py-8 space-y-4">
                                    <div className="h-16 w-16 rounded-2xl bg-kenya-green/10 flex items-center justify-center mx-auto animate-float">
                                        <Sparkles className="h-8 w-8 text-kenya-green" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">Your Civic Assistant</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Ask about legislation or the Constitution</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['What is Article 43?', 'Explain Finance Bill'].map(q => (
                                            <button
                                                key={q}
                                                onClick={() => {
                                                    setQuery(q);
                                                    handleSend(q);
                                                }}
                                                className="text-xs px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-kenya-green/10 hover:border-kenya-green/20 transition-all hover:scale-105 backdrop-blur-sm"
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
                                    <div className={`max-w-[90%] p-3 rounded-2xl text-xs md:text-sm shadow-lg backdrop-blur-md ${m.role === 'user'
                                        ? 'bg-kenya-green text-white rounded-tr-none'
                                        : 'bg-white/10 dark:bg-gray-800/20 border border-white/20 dark:border-white/10 text-slate-800 dark:text-white rounded-tl-none'
                                        }`}>
                                        <div className="prose prose-sm dark:prose-invert prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1 prose-li:my-0.5 whitespace-pre-wrap break-words max-w-full overflow-hidden leading-snug">
                                            <ReactMarkdown>
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 dark:bg-gray-800/20 border border-white/20 dark:border-white/10 p-3 rounded-2xl rounded-tl-none shadow-lg backdrop-blur-md">
                                        <Loader2 className="h-4 w-4 animate-spin text-kenya-green" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10 dark:border-gray-700/10 bg-white/5 dark:bg-black/20">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ask about Kenya law..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    className="h-10 text-sm rounded-xl border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 focus:ring-kenya-green/50 placeholder:text-slate-400"
                                    disabled={usage >= MAX_MESSAGES_PER_DAY}
                                />
                                <Button
                                    onClick={() => handleSend()}
                                    size="icon"
                                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-kenya-green to-primary hover:from-primary hover:to-kenya-green text-white shrink-0 shadow-lg hover:scale-105 transition-all"
                                    disabled={loading || usage >= MAX_MESSAGES_PER_DAY}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.div
                    onMouseEnter={() => {
                        setIsHovering(true);
                        setIsIdle(false);
                    }}
                    onMouseLeave={() => setIsHovering(false)}
                    className="relative group cursor-pointer"
                    onClick={() => {
                        setIsOpen(true);
                        setShowPulse(false);
                    }}
                >
                    <div className="relative w-48 h-12 flex items-center">
                        <div
                            className={`absolute right-12 top-0 h-12 flex items-center transition-all duration-500 ease-out ${isHovering
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-4 pointer-events-none'
                                }`}
                        >
                            <div
                                className={`absolute inset-0 rounded-full transition-all duration-500 ease-out ${isHovering
                                    ? 'bg-black/20 backdrop-blur-sm scale-100'
                                    : 'bg-black/0 backdrop-blur-none scale-75'
                                    }`}
                            />
                            <span
                                className={`relative px-4 py-2 text-white font-semibold text-sm whitespace-nowrap transition-all duration-500 ease-out drop-shadow-lg ${isHovering
                                    ? 'opacity-100 scale-100'
                                    : 'opacity-0 scale-90'
                                    }`}
                            >
                                Ask CEKA AI
                            </span>
                        </div>
                        <div
                            className={`absolute right-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ease-out shadow-2xl ${isHovering || showPulse
                                ? 'bg-gradient-to-br from-kenya-green via-primary to-kenya-green shadow-kenya-green/50 scale-110'
                                : 'bg-gradient-to-br from-kenya-green to-primary shadow-kenya-green/40 scale-100'
                                }`}
                        >
                            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                            <HelpCircle
                                className={`relative z-10 transition-all duration-300 ease-out ${isHovering
                                    ? 'h-6 w-6 text-white drop-shadow-lg'
                                    : 'h-5 w-5 text-white/90'
                                    }`}
                            />
                            {showPulse && !isHovering && (
                                <div className="absolute inset-0 rounded-full bg-kenya-green animate-ping opacity-20" />
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default GlobalAIAssistant;
