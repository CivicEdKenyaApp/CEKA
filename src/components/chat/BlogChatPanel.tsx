/**
 * BlogChatPanel - "Continue in Room" Feature
 * 
 * Bridges blog posts to chat discussions:
 * - Auto-creates or joins existing chat room for blog post
 * - Links initial message back to the blog post
 * - Shows recent discussion activity
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, ArrowRight, ExternalLink, ChevronRight } from 'lucide-react';
import { CEKALoader } from '@/components/ui/ceka-loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
}

interface ChatRoom {
    id: string;
    name: string;
    type: string;
    message_count?: number;
    last_activity?: string;
}

interface RecentMessage {
    id: string;
    content: string;
    created_at: string;
    profile?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

interface BlogChatPanelProps {
    blogPost: BlogPost;
    className?: string;
}

export const BlogChatPanel: React.FC<BlogChatPanelProps> = ({ blogPost, className }) => {
    const { user, session } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
    const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
    const [participantCount, setParticipantCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    // Generate room ID from blog slug
    const roomId = `blog-${blogPost.slug}`;

    // Check if room exists and fetch recent activity
    useEffect(() => {
        const fetchRoomData = async () => {
            setIsLoading(true);
            try {
                // Check if room exists
                const { data: roomData } = await supabase
                    .from('chat_rooms')
                    .select('*')
                    .eq('id', roomId)
                    .single();

                if (roomData) {
                    setChatRoom({
                        ...roomData,
                        type: roomData.room_type || 'public'
                    });

                    // Fetch recent messages without FK join
                    const { data: messagesData } = await supabase
                        .from('chat_messages')
                        .select('id, content, created_at, user_id')
                        .eq('room_id', roomId)
                        .order('created_at', { ascending: false })
                        .limit(3);

                    if (messagesData && messagesData.length > 0) {
                        // Fetch profiles separately
                        const userIds = [...new Set(messagesData.map(m => m.user_id))];
                        const { data: profiles } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url')
                            .in('id', userIds);

                        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
                        const messagesWithProfiles = messagesData.map(m => ({
                            ...m,
                            profile: profileMap.get(m.user_id) || null
                        }));
                        setRecentMessages(messagesWithProfiles as RecentMessage[]);
                    }

                    // Count unique participants
                    const { count } = await supabase
                        .from('chat_messages')
                        .select('user_id', { count: 'exact', head: true })
                        .eq('room_id', roomId);

                    setParticipantCount(count || 0);
                }
            } catch (error) {
                console.error('Error fetching room data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();
    }, [roomId]);


    // Create room if it doesn't exist and join
    const handleJoinDiscussion = async () => {
        if (!session || !user) {
            toast({
                title: 'Sign in required',
                description: 'Please sign in to join the discussion.',
                variant: 'destructive',
            });
            navigate('/auth');
            return;
        }

        setIsJoining(true);
        try {
            // Create room if it doesn't exist
            if (!chatRoom) {
                const { error: createError } = await supabase
                    .from('chat_rooms')
                    .insert({
                        id: roomId,
                        name: `Discussion: ${blogPost.title}`,
                        type: 'public',
                        description: `Chat discussion for the blog post "${blogPost.title}"`,
                        created_by: user.id,
                    });

                if (createError && !createError.message.includes('duplicate')) {
                    throw createError;
                }

                // Post initial linking message
                await supabase.from('chat_messages').insert({
                    user_id: user.id,
                    room_id: roomId,
                    content: `📰 **This discussion is linked to the blog post:** [${blogPost.title}](/blog/${blogPost.slug})\n\nFeel free to share your thoughts and continue the conversation here!`,
                });
            }

            // Navigate to community chat with room selected
            navigate(`/community?room=${roomId}&source=blog&title=${encodeURIComponent(blogPost.title)}`);
        } catch (error) {
            console.error('Error joining discussion:', error);
            toast({
                title: 'Failed to join',
                description: 'Could not join the discussion. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsJoining(false);
        }
    };

    if (isLoading) {
        return (
            <Card className={cn("p-4 rounded-3xl border-0 bg-white/80 dark:bg-white/5 backdrop-blur-xl", className)}>
                <div className="flex items-center justify-center py-4">
                    <CEKALoader variant="ios" size="sm" />
                </div>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "p-5 rounded-3xl border-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 backdrop-blur-xl",
            className
        )}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">Continue in Room</h3>
                        {chatRoom && (
                            <Badge variant="secondary" className="rounded-full">
                                <Users className="h-3 w-3 mr-1" />
                                {participantCount} participants
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                        {chatRoom
                            ? 'Join the live discussion about this post'
                            : 'Start a community discussion about this post'
                        }
                    </p>

                    {/* Recent Messages Preview */}
                    {recentMessages.length > 0 && (
                        <div className="space-y-2 mb-4 p-3 rounded-2xl bg-white/50 dark:bg-black/20">
                            {recentMessages.map((msg) => (
                                <div key={msg.id} className="flex items-start gap-2">
                                    <Avatar className="h-6 w-6 shrink-0">
                                        <AvatarImage src={msg.profile?.avatar_url || ''} />
                                        <AvatarFallback className="text-[10px]">
                                            {msg.profile?.full_name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs line-clamp-1">
                                            <span className="font-semibold">{msg.profile?.full_name || 'Anonymous'}</span>
                                            <span className="text-muted-foreground ml-1">{msg.content}</span>
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Button */}
                    <Button
                        onClick={handleJoinDiscussion}
                        disabled={isJoining}
                        className="w-full rounded-2xl h-12 font-bold bg-primary hover:bg-primary/90"
                    >
                        {isJoining ? (
                            <CEKALoader variant="ios" size="sm" />
                        ) : (
                            <>
                                {chatRoom ? 'Join Discussion' : 'Start Discussion'}
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default BlogChatPanel;
