import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Users } from 'lucide-react';
import { CEKALoader } from '@/components/ui/ceka-loader';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  user_id: string;
  room_id: string;
  content: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface OnlineUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  online_at: string;
}

const CommunityChat = () => {
  const { session, user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const roomId = 'general';

  // Fetch initial messages
  useEffect(() => {
    if (!session) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          user_id,
          room_id,
          content,
          created_at
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat messages',
          variant: 'destructive'
        });
      } else {
        // Fetch profiles for each message
        const userIds = [...new Set(data?.map(m => m.user_id) || [])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const messagesWithProfiles = data?.map(m => ({
          ...m,
          profile: profileMap.get(m.user_id) || { full_name: 'Unknown', avatar_url: null }
        })) || [];

        setMessages(messagesWithProfiles);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [session, toast]);

  // Subscribe to new messages
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;

          // Fetch profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMsg.user_id)
            .maybeSingle();

          setMessages(prev => [...prev, {
            ...newMsg,
            profile: profile || { full_name: 'Unknown', avatar_url: null }
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, roomId]);

  // Subscribe to presence (online users)
  useEffect(() => {
    if (!session || !user) return;

    const presenceChannel = supabase.channel('community_presence');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: OnlineUser[] = [];

        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (!users.find(u => u.id === presence.id)) {
              users.push({
                id: presence.id,
                full_name: presence.full_name,
                avatar_url: presence.avatar_url,
                online_at: presence.online_at
              });
            }
          });
        });

        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Fetch current user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

          await presenceChannel.track({
            id: user.id,
            full_name: profile?.full_name || 'Anonymous',
            avatar_url: profile?.avatar_url,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [session, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        room_id: roomId,
        content: newMessage.trim()
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  if (!session) {
    return (
      <Card className="h-[600px] flex flex-col items-center justify-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Join the Conversation</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-sm">
          Sign in to participate in community discussions and connect with other members.
        </p>
        <Button asChild>
          <Link to="/auth">Sign In to Chat</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-4 gap-4 h-[600px]">
      {/* Chat Messages */}
      <Card className="lg:col-span-3 flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Community Chat
            </CardTitle>
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {onlineUsers.length} online
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollRef}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <CEKALoader variant="ios" size="md" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-2" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.user_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.profile?.avatar_url || ''} />
                        <AvatarFallback>
                          {message.profile?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col ${isOwn ? 'items-end' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.profile?.full_name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), 'HH:mm')}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg px-3 py-2 max-w-md ${isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                            }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-3">
          <div className="w-full">
            <form onSubmit={sendMessage} className="flex gap-2 w-full">
              <Input
                id="chat-input"
                name="message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                maxLength={1000}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || !newMessage.trim()}>
                {sending ? (
                  <CEKALoader variant="ios" size="sm" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardFooter>
      </Card>

      {/* Online Users Sidebar */}
      <Card className="hidden lg:flex flex-col">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            Online Members
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-3">
            {onlineUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No one else is online
              </p>
            ) : (
              <div className="space-y-2">
                {onlineUsers.map((onlineUser) => (
                  <div
                    key={onlineUser.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={onlineUser.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {onlineUser.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <span className="text-sm truncate">
                      {onlineUser.full_name || 'Anonymous'}
                      {onlineUser.id === user?.id && (
                        <span className="text-xs text-muted-foreground ml-1">(you)</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityChat;
