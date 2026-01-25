import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatRepliesProps {
    messageId: string;
    room_id: string;
}

export const ChatReplies = ({ messageId, room_id }: ChatRepliesProps) => {
    const { user, session } = useAuth();
    const [replies, setReplies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [sending, setSending] = useState(false);

    const fetchReplies = async () => {
        setLoading(true);
        const { data, error } = await (supabase
            .from('chat_messages')
            .select(`
                *,
                profile:profiles!user_id (id, full_name, avatar_url, username)
            `)
            .eq('parent_id', messageId)
            .order('created_at', { ascending: true }) as any);

        if (!error && data) setReplies(data);
        setLoading(false);
    };

    useEffect(() => {
        if (!session) return;

        // Always listen for counter updates or new replies to update the toggle button
        const channel = supabase
            .channel(`thread:${messageId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `parent_id=eq.${messageId}`
            }, async (payload) => {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, username')
                    .eq('id', payload.new.user_id)
                    .single();

                setReplies(prev => {
                    if (prev.find(r => r.id === payload.new.id)) return prev;
                    return [...prev, { ...payload.new, profile }];
                });
            })
            .subscribe();

        if (isExpanded) fetchReplies();

        return () => { supabase.removeChannel(channel); };
    }, [messageId, isExpanded, session, fetchReplies]);

    const sendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !user || sending) return;

        setSending(true);
        const content = replyContent.trim();
        setReplyContent('');

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                room_id: room_id,
                content: content,
                parent_id: messageId
            });

        if (error) {
            setReplyContent(content); // Rollback
            console.error('Thread Insertion Error:', error);
        } else if (!isExpanded) {
            setIsExpanded(true);
        }
        setSending(false);
    };

    return (
        <div className="mt-2.5 w-full">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "h-8 text-[11px] font-bold uppercase tracking-wider gap-2 p-0 px-3 rounded-xl transition-all",
                        replies.length > 0 ? "text-primary hover:bg-primary/5" : "text-muted-foreground/60 hover:text-primary"
                    )}
                >
                    <MessageCircle className="h-3.5 w-3.5" />
                    {replies.length > 0 ? `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}` : 'Start Thread'}
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-l-2 border-slate-100 dark:border-white/5 ml-4 pl-4 pt-4 space-y-5"
                    >
                        {loading && replies.length === 0 ? (
                            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary/30" /></div>
                        ) : (
                            replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3 group animate-in fade-in slide-in-from-left-2 duration-400">
                                    <Avatar className="h-7 w-7 rounded-lg shrink-0 shadow-sm border border-white dark:border-white/10 mt-1">
                                        <AvatarImage src={reply.profile?.avatar_url} />
                                        <AvatarFallback className="text-[10px] uppercase font-bold">{reply.profile?.full_name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">
                                                {reply.profile?.full_name || 'Anonymous'}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">
                                                {format(new Date(reply.created_at), 'HH:mm')}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none inline-block max-w-[95%]">
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                                {reply.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        <form onSubmit={sendReply} className="flex gap-3 items-center pt-2 group-focus-within:opacity-100 transition-opacity">
                            <Avatar className="h-7 w-7 rounded-lg shrink-0 opacity-60">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback className="text-[10px]">{user?.email?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="relative flex-1">
                                <Input
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Add to discourse..."
                                    className="h-10 rounded-2xl text-[13px] bg-white dark:bg-black/20 border-slate-100 dark:border-white/5 pr-12 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                                />
                                <div className="absolute right-1 top-1">
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!replyContent.trim() || sending}
                                        className={cn(
                                            "h-8 w-8 rounded-xl shadow-lg transition-all",
                                            replyContent.trim() ? "bg-primary text-white scale-100" : "bg-slate-200 dark:bg-white/10 text-slate-400 scale-90"
                                        )}
                                    >
                                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
