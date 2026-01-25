import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Bookmark, Smile, Loader2, Zap, Flame, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatReactionsProps {
    messageId: string;
}

export const ChatReactions = ({ messageId }: ChatReactionsProps) => {
    const { user, session } = useAuth();
    const [reactions, setReactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchReactions = useCallback(async () => {
        const { data, error } = await supabase
            .from('chat_reactions' as any)
            .select('*')
            .eq('message_id', messageId);

        if (data) setReactions(data);
    }, [messageId]);

    useEffect(() => {
        if (!session) return;
        fetchReactions();

        const channel = supabase
            .channel(`reactions:${messageId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_reactions',
                filter: `message_id=eq.${messageId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setReactions(prev => {
                        if (prev.find(r => r.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                } else if (payload.eventType === 'DELETE') {
                    setReactions(prev => prev.filter(r => r.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [messageId, session, fetchReactions]);

    const toggleReaction = async (emoji: string) => {
        if (!user || loading) return;
        setLoading(true);

        const existing = reactions.find(r => r.user_id === user.id && r.emoji === emoji);

        if (existing) {
            // Optimistic Update
            setReactions(prev => prev.filter(r => r.id !== existing.id));
            const { error } = await supabase
                .from('chat_reactions' as any)
                .delete()
                .eq('id', existing.id);
            if (error) {
                fetchReactions(); // Rollback
                console.error('Error removing reaction:', error);
            }
        } else {
            // Optimistic Update
            const tempId = Math.random().toString();
            setReactions(prev => [...prev, { id: tempId, message_id: messageId, user_id: user.id, emoji }]);

            const { error } = await supabase
                .from('chat_reactions' as any)
                .insert({
                    message_id: messageId,
                    user_id: user.id,
                    emoji: emoji
                });
            if (error) {
                fetchReactions(); // Rollback
                console.error('Error adding reaction:', error);
            }
        }
        setLoading(false);
    };

    const reactionCounts = reactions.reduce((acc: any, curr) => {
        acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
        return acc;
    }, {});

    const userReactions = reactions.filter(r => r.user_id === user?.id).map(r => r.emoji);

    const presets = [
        { type: '❤️', icon: Heart, activeClass: 'text-red-500 fill-red-500', bg: 'hover:bg-red-50 dark:hover:bg-red-950/20' },
        { type: '🔥', icon: Flame, activeClass: 'text-orange-500 fill-orange-500', bg: 'hover:bg-orange-50 dark:hover:bg-orange-950/20' },
        { type: '💡', icon: Lightbulb, activeClass: 'text-yellow-500 fill-yellow-500', bg: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/20' },
        { type: '✊', icon: Zap, activeClass: 'text-blue-500 fill-blue-500', bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/20' }
    ];

    return (
        <div className="flex flex-wrap items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
            <AnimatePresence>
                {presets.map((p) => {
                    const count = reactionCounts[p.type] || 0;
                    const isActive = userReactions.includes(p.type);

                    if (count === 0 && !isActive) return null;

                    return (
                        <motion.button
                            key={p.type}
                            layout
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleReaction(p.type)}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border shrink-0",
                                isActive
                                    ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-muted-foreground hover:border-slate-300 dark:hover:border-white/10"
                            )}
                        >
                            <p.icon className={cn("h-3.5 w-3.5", isActive && "stroke-[3px]")} />
                            {count > 0 && <span>{count}</span>}
                        </motion.button>
                    );
                })}
            </AnimatePresence>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground opacity-40 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-white/5">
                        <Smile className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="flex gap-1 p-1 rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-none shadow-2xl">
                    {presets.map(p => (
                        <Button
                            key={p.type}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
                            onClick={() => toggleReaction(p.type)}
                        >
                            <p.icon className={cn("h-4.5 w-4.5", userReactions.includes(p.type) ? p.activeClass : "text-slate-600 dark:text-slate-400")} />
                        </Button>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

// Simplified Imports for the Dropdown used above
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
