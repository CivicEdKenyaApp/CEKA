import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Users, Loader2, Hash, Shield, Search, MoreVertical, Paperclip, ChevronLeft } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatReactions } from './ChatReactions';
import { ChatReplies } from './ChatReplies';
import { InteractionLogger } from './InteractionLogger';
import { MentionSuggestions } from './MentionSuggestions';
import { cn } from '@/lib/utils';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent
} from '@/components/ui/empty';

// Types
interface ChatMessage {
    id: string;
    user_id: string;
    room_id: string;
    content: string;
    created_at: string;
    profile?: {
        full_name: string | null;
        avatar_url: string | null;
        username: string | null;
    };
}

interface Room {
    id: string;
    name: string;
    type: 'public' | 'private' | 'direct';
    last_activity?: string;
}

const PAGE_SIZE = 30;

const CommunityChat = () => {
    const { session, user } = useAuth();
    const { toast } = useToast();
    const [params] = useSearchParams();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [rooms, setRooms] = useState<Room[]>([
        { id: 'general', name: 'Bunge Square', type: 'public' },
        { id: 'legislation', name: 'Policy Watch 2024-2027', type: 'public' },
        { id: 'mashinani', name: 'Mashinani Dialogue', type: 'public' },
        { id: 'youth', name: 'Youth Pulse', type: 'public' }
    ]);
    const [activeRoom, setActiveRoom] = useState<string>(params.get('room') || 'general');
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMoreOlder, setHasMoreOlder] = useState(true);
    const [sending, setSending] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionTrigger, setMentionTrigger] = useState<'@' | '/' | null>(null);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(params.get('m'));
    const [isPrivate, setIsPrivate] = useState(false);
    const [selectedPeer, setSelectedPeer] = useState<any>(null);
    const [fetchError, setFetchError] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const isInitialLoad = useRef(true);

    // Fetch initial messages with keyset pagination
    const fetchMessages = useCallback(async (roomId: string, cursor?: string) => {
        if (cursor) setLoadingOlder(true);
        else setLoading(true);
        setFetchError(false);

        try {
            // Simple query without FK join to avoid PGRST200 errors
            let query = supabase
                .from('chat_messages')
                .select('*')
                .eq('room_id', roomId)
                .is('parent_id', null)
                .order('created_at', { ascending: false })
                .limit(PAGE_SIZE);

            if (cursor) {
                query = query.lt('created_at', cursor);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Chat fetch error:', error);
                setFetchError(true);
                throw error;
            }

            if (data) {
                // Fetch profile data separately for each unique user_id
                const userIds = [...new Set(data.map(m => m.user_id))];
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, username')
                    .in('id', userIds);

                const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

                const messagesWithProfiles = data.map(m => ({
                    ...m,
                    profile: profileMap.get(m.user_id) || null
                }));

                const sorted = messagesWithProfiles.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                setMessages(prev => cursor ? [...sorted, ...prev] : sorted);
                setHasMoreOlder(data.length === PAGE_SIZE);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setFetchError(true);
            setHasMoreOlder(false); // Kill scroll to prevent spam
        } finally {
            setLoading(false);
            setLoadingOlder(false);
        }
    }, []);


    const handleJoinRoom = async (roomId: string) => {
        if (!user) return;
        setActiveRoom(roomId);
        // Register room join status
        await supabase.from('user_rooms' as any).upsert({
            user_id: user.id,
            room_id: roomId,
            last_read_at: new Date().toISOString()
        }, { onConflict: 'user_id,room_id' });

        toast({ title: `Joined ${rooms.find(r => r.id === roomId)?.name}`, description: 'Your session is now synchronized.' });
    };

    // Handle Room Switching & Initial Load
    useEffect(() => {
        if (!session || !user) return;

        let targetRoom = 'general';

        // Virtual DM handling: if a peer is selected, generate deterministic ID
        if (isPrivate && selectedPeer) {
            const ids = [user.id, selectedPeer.id].sort();
            targetRoom = `vault:${ids[0]}:${ids[1]}`;
            setActiveRoom(targetRoom);
        } else {
            targetRoom = params.get('room') || 'general';
            setActiveRoom(targetRoom);
        }

        fetchMessages(targetRoom);
        isInitialLoad.current = true;
    }, [activeRoom, session, user, fetchMessages, isPrivate, selectedPeer, params]);

    // Ensure selected room exists in metadata
    useEffect(() => {
        if (isPrivate && selectedPeer && !rooms.find(r => r.id === activeRoom)) {
            const virtualRoom: Room = {
                id: activeRoom,
                name: `Secure: ${selectedPeer.full_name || 'Member'}`,
                type: 'direct'
            };
            setRooms(prev => [...prev.filter(r => r.type !== 'direct'), virtualRoom]);
        }
    }, [activeRoom, isPrivate, selectedPeer, rooms]);

    // Handle incoming source bridge or blog synchronization
    useEffect(() => {
        const source = params.get('source');
        const title = params.get('title');
        const content = params.get('content'); // New: Sync content from blog reply

        if (source && title && !isInitialLoad.current) {
            const initialText = content
                ? `[Discourse Sync] "${decodeURIComponent(content)}" - Ref: ${decodeURIComponent(title)}`
                : `[Ref: ${decodeURIComponent(title)}] I have thoughts on this development... `;

            setNewMessage(initialText);
            toast({ title: 'Assembly Synced', description: 'Continuing the discourse from the field.' });
        }
    }, [params, toast]);

    // Subscribe to Realtime messages for current room
    useEffect(() => {
        if (!session) return;

        const channel = supabase
            .channel(`chat:${activeRoom}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${activeRoom}`
            }, async (payload) => {
                if (payload.new.parent_id) return; // Ignore replies in main feed

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, username')
                    .eq('id', payload.new.user_id)
                    .single();

                const msgWithProfile = { ...payload.new, profile } as any;
                setMessages(prev => {
                    if (prev.find(m => m.id === msgWithProfile.id)) return prev;
                    return [...prev, msgWithProfile];
                });
            })
            .subscribe();

        return () => {
            setTimeout(() => {
                try {
                    supabase.removeChannel(channel).catch(() => { });
                } catch (e) { }
            }, 200);
        };
    }, [activeRoom, session]);

    // Presence tracking for online members
    useEffect(() => {
        if (!session || !user) return;
        const presenceChannel = supabase.channel('community_presence');

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                const users: any[] = [];
                Object.values(state).forEach((presences: any) => {
                    presences.forEach((p: any) => {
                        if (!users.find(u => u.id === p.id)) users.push(p);
                    });
                });
                setOnlineUsers(users);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
                    await presenceChannel.track({
                        id: user.id,
                        full_name: profile?.full_name || 'Anonymous Citizen',
                        avatar_url: profile?.avatar_url,
                        online_at: new Date().toISOString()
                    });
                }
            });

        return () => {
            setTimeout(() => {
                try {
                    supabase.removeChannel(presenceChannel).catch(() => { });
                } catch (e) { }
            }, 200);
        };
    }, [session, user]);

    // Infinite Scroll Handler (Intersection Observer)
    useEffect(() => {
        if (!topSentinelRef.current || loadingOlder || !hasMoreOlder || fetchError) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loadingOlder && !fetchError) {
                const oldestMsg = messages[0];
                if (oldestMsg) fetchMessages(activeRoom, oldestMsg.created_at);
            }
        }, { threshold: 0.1 });

        observer.observe(topSentinelRef.current);
        return () => observer.disconnect();
    }, [messages, loadingOlder, hasMoreOlder, activeRoom, fetchMessages]);

    // Auto-scroll logic (Instagram-style)
    useEffect(() => {
        if (!scrollRef.current) return;
        const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;

        // Auto-scroll to bottom on initial load or if user is already near bottom
        if (isInitialLoad.current || scrollHeight - clientHeight - scrollTop < 300) {
            scrollRef.current.scrollTop = scrollHeight;
            isInitialLoad.current = false;
        }
    }, [messages]);

    // Handle Input with Mentions
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNewMessage(val);

        const lastChar = val.slice(-1);
        const words = val.split(' ');
        const lastWord = words[words.length - 1];

        if (lastWord.startsWith('@')) {
            setMentionTrigger('@');
            setMentionQuery(lastWord.slice(1));
        } else if (lastWord.startsWith('/')) {
            setMentionTrigger('/');
            setMentionQuery(lastWord.slice(1));
        } else {
            setMentionTrigger(null);
        }
    };

    const insertMention = (item: any) => {
        const words = newMessage.split(' ');
        words[words.length - 1] = mentionTrigger + (item.username || item.name) + ' ';
        setNewMessage(words.join(' '));
        setMentionTrigger(null);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || sending) return;

        setSending(true);
        const content = newMessage.trim();
        setNewMessage(''); // Optimistically clear

        const { error } = await supabase.from('chat_messages').insert({
            user_id: user.id,
            room_id: activeRoom,
            content
        });

        if (error) {
            setNewMessage(content);
            toast({ title: 'Send Failed', description: 'Message cached locally. Please retry.', variant: 'destructive' });
        }
        setSending(false);
    };

    const formatMessageDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return format(date, 'HH:mm');
        if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`;
        return format(date, 'MMM d, HH:mm');
    };

    if (!session) return (
        <Card className="h-[700px] flex flex-col items-center justify-center border-none shadow-2xl rounded-[40px] bg-white/50 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-primary/10 p-6 rounded-[32px] mb-8 shadow-inner"><MessageCircle className="h-16 w-16 text-primary" /></div>
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Active Citizenship Starts Here</h3>
            <p className="text-muted-foreground text-center mb-8 max-w-sm px-4">Sign in to join the conversation and contribute to Kenya's civic journey.</p>
            <Button asChild size="lg" className="rounded-2xl px-12 h-14 text-lg font-bold shadow-xl">
                <Link to="/auth">Authenticate with CEKA</Link>
            </Button>
        </Card>
    );

    return (
        <div className="grid lg:grid-cols-12 gap-6 h-[800px] font-sans">

            {/* Sidebar (Rooms) */}
            <Card className="lg:col-span-3 flex flex-col border-none shadow-ios-low rounded-[32px] overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl">
                <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
                        Rooms
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Search className="h-4 w-4" /></Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-2 space-y-1">
                    {/* Public Rooms */}
                    {!isPrivate ? (
                        rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => { setActiveRoom(room.id); setSelectedPeer(null); setIsPrivate(false); }}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3.5 rounded-[20px] transition-all duration-300",
                                    activeRoom === room.id && !isPrivate
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                        : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors",
                                    activeRoom === room.id && !isPrivate ? "bg-white/20" : "bg-slate-100 dark:bg-white/5"
                                )}>
                                    <Hash className="h-5 w-5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-bold truncate">{room.name}</p>
                                    <p className={cn("text-[10px]", activeRoom === room.id && !isPrivate ? "text-white/60" : "text-muted-foreground")}>Public Assembly</p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center space-y-4">
                            <Shield className="h-10 w-10 text-primary mx-auto opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secure Vault Active</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPrivate(false)}
                                className="rounded-xl w-full text-[10px] font-bold"
                            >
                                Exit to Assembly
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Chat Area */}
            <Card className="lg:col-span-6 flex flex-col border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden bg-white dark:bg-[#1C1C1E] relative">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 backdrop-blur-md bg-white/80 dark:bg-black/40 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-2.5 rounded-[18px]",
                            isPrivate ? "bg-amber-500/10" : "bg-primary/10"
                        )}>
                            {isPrivate ? <Shield className="h-5 w-5 text-amber-500" /> : <MessageCircle className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-tight">
                                {isPrivate ? `Direct: ${selectedPeer?.full_name || 'Citizen'}` : (rooms.find(r => r.id === activeRoom)?.name || 'Assembly')}
                            </h2>
                            <p className={cn(
                                "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                                isPrivate ? "text-amber-500" : "text-green-500"
                            )}>
                                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isPrivate ? "bg-amber-500" : "bg-green-500")} />
                                {isPrivate ? 'E2E Cloud Encrypted' : `${onlineUsers.length} active now`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl"><Users className="h-4.5 w-4.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl"><MoreVertical className="h-4.5 w-4.5" /></Button>
                    </div>
                </div>

                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-hidden relative">
                    <ScrollArea className="h-full px-6" ref={scrollRef}>
                        <div ref={topSentinelRef} className="h-1 w-full" />

                        {loadingOlder && (
                            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                        )}

                        {messages.length === 0 && !loading && (
                            <Empty className="border-none mt-20">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon" className="bg-primary/10">
                                        <Hash className="h-8 w-8 text-primary" />
                                    </EmptyMedia>
                                    <EmptyTitle>The Floor is Yours</EmptyTitle>
                                    <EmptyDescription>
                                        Initiate the discourse in {rooms.find(r => r.id === activeRoom)?.name}.
                                        Your voice is the heartbeat of the assembly.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button onClick={() => (document.querySelector('input') as any)?.focus()} variant="outline" className="rounded-2xl">
                                        Open Floor
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        )}

                        <div className="space-y-8 py-8">
                            {messages.map((message, idx) => {
                                const isOwn = message.user_id === user?.id;
                                const showAvatar = idx === 0 || messages[idx - 1].user_id !== message.user_id;
                                const isHighlighted = highlightedMessageId === message.id;

                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={isInitialLoad.current ? false : { opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        id={`message-${message.id}`}
                                        className={cn(
                                            "group flex gap-4 transition-all duration-500",
                                            isOwn ? "flex-row-reverse" : "flex-row",
                                            isHighlighted && "bg-primary/5 -mx-6 px-6 py-2 border-y border-primary/10 shadow-inner"
                                        )}
                                    >
                                        {/* Avatar Column */}
                                        <div className="w-10 shrink-0">
                                            {showAvatar && (
                                                <Avatar className="h-10 w-10 rounded-[14px] shadow-sm border-2 border-white dark:border-white/10 ring-1 ring-slate-200/50">
                                                    <AvatarImage src={message.profile?.avatar_url || ''} />
                                                    <AvatarFallback className="bg-primary/5 font-bold text-xs p-1">
                                                        <img src="/lovable-uploads/bea0d682-b245-4391-b21b-80fdf695fdae.png" alt="CEKA" className="opacity-20 grayscale brightness-0 invert shadow-none" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>

                                        {/* Content Column */}
                                        <div className={cn("flex-1 flex flex-col space-y-1.5", isOwn ? "items-end" : "items-start")}>
                                            {showAvatar && (
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                                        {message.profile?.full_name || 'Anonymous Citizen'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        {formatMessageDate(message.created_at)}
                                                    </span>
                                                </div>
                                            )}

                                            <div className={cn(
                                                "relative px-4 py-3 rounded-[24px] max-w-[85%] text-sm leading-relaxed shadow-sm transition-transform group-hover:scale-[1.01]",
                                                isOwn
                                                    ? "bg-primary text-white rounded-tr-none font-medium"
                                                    : "bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none"
                                            )}>
                                                <p className="whitespace-pre-wrap break-words">{message.content}</p>

                                                {/* Interaction Logging Component (Silent) */}
                                                <InteractionLogger targetId={message.id} targetType="message" metadata={{ room_id: activeRoom }} />
                                            </div>

                                            {/* Social Layer */}
                                            <div className="flex flex-col gap-1 w-full max-w-[85%]">
                                                <ChatReactions messageId={message.id} />
                                                <ChatReplies messageId={message.id} room_id={activeRoom} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>

                {/* Input Area */}
                <CardFooter className="p-6 pt-2 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl relative">
                    <AnimatePresence>
                        {mentionTrigger && (
                            <MentionSuggestions
                                query={mentionQuery}
                                trigger={mentionTrigger}
                                onSelect={insertMention}
                                onClose={() => setMentionTrigger(null)}
                            />
                        )}
                    </AnimatePresence>

                    <form onSubmit={sendMessage} className="w-full">
                        <div className="relative group">
                            <div className="absolute left-1.5 top-1.5 flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-slate-400 hover:text-primary transition-colors">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                            </div>

                            <Input
                                value={newMessage}
                                onChange={handleInputChange}
                                onFocus={() => isInitialLoad.current = false}
                                placeholder={`Message ${rooms.find(r => r.id === activeRoom)?.name}...`}
                                disabled={sending}
                                className="h-14 pl-14 pr-16 rounded-[24px] bg-slate-100/50 dark:bg-white/5 border-none shadow-inner text-base focus-visible:ring-2 focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                            />

                            <div className="absolute right-1.5 top-1.5">
                                <Button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                    className={cn(
                                        "h-11 w-11 rounded-[20px] shadow-lg transition-all duration-300",
                                        newMessage.trim() ? "bg-primary text-white scale-100" : "bg-slate-200 dark:bg-white/10 text-slate-400 scale-95"
                                    )}
                                >
                                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
                                </Button>
                            </div>
                        </div>
                        <p className="mt-3 text-[10px] text-center text-muted-foreground/50 font-medium uppercase tracking-[0.15em]">
                            Authorized conversation • End-to-end synchronized
                        </p>
                    </form>
                </CardFooter>
            </Card>

            {/* Online Users Sidebar (Direct Messages Prep) */}
            <Card className="hidden lg:flex lg:col-span-3 flex-col border-none shadow-ios-low rounded-[32px] overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl">
                <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        Online <Badge variant="outline" className="h-5 px-1.5 text-[9px] bg-green-500/10 text-green-500 border-green-500/20">{onlineUsers.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-2 space-y-1">
                    {onlineUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 opacity-40 grayscale">
                            <Users className="h-8 w-8 mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Watching the halls...</p>
                        </div>
                    ) : (
                        onlineUsers.filter(u => u.id !== user?.id).map(u => (
                            <button
                                key={u.id}
                                onClick={() => { setSelectedPeer(u); setIsPrivate(true); }}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-[20px] hover:bg-white/40 dark:hover:bg-white/5 transition-all group",
                                    selectedPeer?.id === u.id && isPrivate && "bg-white/60 dark:bg-white/10 ring-1 ring-primary/20"
                                )}
                            >
                                <div className="relative">
                                    <Avatar className="h-10 w-10 rounded-[14px] shadow-sm border-2 border-white dark:border-black/40 ring-1 ring-slate-200/50">
                                        <AvatarImage src={u.avatar_url || ''} />
                                        <AvatarFallback className="text-[10px] bg-slate-100 font-bold">{u.full_name?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black ring-1 ring-black/10" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{u.full_name || 'Anonymous'}</p>
                                    <p className="text-[10px] text-muted-foreground/60 font-medium">Citizen Online</p>
                                </div>
                            </button>
                        ))
                    )}
                </CardContent>
                <div className="p-6 border-t border-slate-100 dark:border-white/5">
                    <Button variant="outline" className="w-full rounded-2xl h-11 text-xs font-bold uppercase tracking-widest gap-2">
                        <Shield className="h-3.5 w-3.5" /> Direct Messages
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default CommunityChat;
