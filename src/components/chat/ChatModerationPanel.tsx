/**
 * ChatModerationPanel - Admin moderation controls for chat
 * 
 * Features:
 * - Ban/unban users
 * - Mute users (temporary)
 * - Delete messages
 * - View moderation history
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Ban,
    VolumeX,
    Trash2,
    Clock,
    AlertTriangle,
    CheckCircle,
    X,
    Loader2,
    History,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ModerationAction {
    id: string;
    action_type: 'ban' | 'mute' | 'delete' | 'warn';
    target_user_id: string;
    moderator_id: string;
    reason: string;
    duration_minutes?: number;
    created_at: string;
    expires_at?: string;
    is_active: boolean;
    target_user?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

interface ChatModerationPanelProps {
    messageId?: string;
    targetUserId: string;
    targetUserName: string;
    targetUserAvatar?: string;
    roomId: string;
    onClose?: () => void;
}

export const ChatModerationPanel: React.FC<ChatModerationPanelProps> = ({
    messageId,
    targetUserId,
    targetUserName,
    targetUserAvatar,
    roomId,
    onClose,
}) => {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [actionType, setActionType] = useState<'mute' | 'ban' | 'warn'>('warn');
    const [duration, setDuration] = useState<'15' | '60' | '1440' | 'permanent'>('60');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<ModerationAction[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Fetch moderation history for user
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch without FK join to avoid PGRST200 errors
                const { data } = await supabase
                    .from('chat_moderation_actions' as any)
                    .select('*')
                    .eq('target_user_id', targetUserId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (data) {
                    setHistory(data as unknown as ModerationAction[]);
                }
            } catch (err) {
                console.warn('Error fetching moderation history:', err);
                setHistory([]);
            }
        };

        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, targetUserId]);


    const handleDeleteMessage = async () => {
        if (!messageId) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('chat_messages')
                .delete()
                .eq('id', messageId);

            if (error) throw error;

            toast({
                title: 'Message deleted',
                description: 'The message has been removed from the chat.',
            });

            onClose?.();
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: 'Failed to delete',
                description: 'Could not delete the message. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModerationAction = async () => {
        if (!reason.trim()) {
            toast({
                title: 'Reason required',
                description: 'Please provide a reason for this moderation action.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const durationMinutes = duration === 'permanent' ? null : parseInt(duration);
            const expiresAt = durationMinutes
                ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
                : null;

            // Get current user as moderator
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Insert moderation action
            const { error: actionError } = await supabase
                .from('chat_moderation_actions' as any)
                .insert({
                    action_type: actionType,
                    target_user_id: targetUserId,
                    moderator_id: user.id,
                    room_id: roomId,
                    message_id: messageId,
                    reason: reason.trim(),
                    duration_minutes: durationMinutes,
                    expires_at: expiresAt,
                    is_active: true,
                });

            if (actionError) throw actionError;

            // If banning, update user's chat permissions
            if (actionType === 'ban') {
                await supabase
                    .from('chat_room_members' as any)
                    .upsert({
                        user_id: targetUserId,
                        room_id: roomId,
                        is_banned: true,
                        banned_at: new Date().toISOString(),
                        ban_expires_at: expiresAt,
                    }, { onConflict: 'user_id,room_id' });
            }

            // If muting, update mute status
            if (actionType === 'mute') {
                await supabase
                    .from('chat_room_members' as any)
                    .upsert({
                        user_id: targetUserId,
                        room_id: roomId,
                        is_muted: true,
                        muted_at: new Date().toISOString(),
                        mute_expires_at: expiresAt,
                    }, { onConflict: 'user_id,room_id' });
            }

            toast({
                title: `User ${actionType === 'ban' ? 'banned' : actionType === 'mute' ? 'muted' : 'warned'}`,
                description: `${targetUserName} has been ${actionType === 'ban' ? 'banned from' : actionType === 'mute' ? 'muted in' : 'warned in'} this room.`,
            });

            setIsOpen(false);
            onClose?.();
        } catch (error) {
            console.error('Moderation error:', error);
            toast({
                title: 'Action failed',
                description: 'Could not complete the moderation action.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Shield className="h-3.5 w-3.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                    {messageId && (
                        <>
                            <DropdownMenuItem
                                onClick={handleDeleteMessage}
                                className="text-red-500 focus:text-red-500 rounded-xl"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem onClick={() => { setActionType('warn'); setIsOpen(true); }} className="rounded-xl">
                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                        Warn User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setActionType('mute'); setIsOpen(true); }} className="rounded-xl">
                        <VolumeX className="h-4 w-4 mr-2 text-orange-500" />
                        Mute User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setActionType('ban'); setIsOpen(true); }} className="text-red-500 focus:text-red-500 rounded-xl">
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setShowHistory(true); setIsOpen(true); }} className="rounded-xl">
                        <History className="h-4 w-4 mr-2" />
                        View History
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Moderation Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="rounded-3xl max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={targetUserAvatar} />
                                <AvatarFallback>
                                    <User className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-left">{targetUserName}</DialogTitle>
                                <DialogDescription className="text-left">
                                    {showHistory ? 'Moderation history' : `Take action against this user`}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {showHistory ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {history.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No moderation history</p>
                            ) : (
                                history.map((action) => (
                                    <div
                                        key={action.id}
                                        className={cn(
                                            "p-3 rounded-2xl border",
                                            action.is_active ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" : "bg-muted"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={action.action_type === 'ban' ? 'destructive' : 'secondary'}>
                                                {action.action_type}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                                            </span>
                                            {action.is_active && (
                                                <Badge variant="outline" className="text-red-500 border-red-500">
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm">{action.reason}</p>
                                        {action.expires_at && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Expires: {new Date(action.expires_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Action Type */}
                            <div className="space-y-2">
                                <Label>Action Type</Label>
                                <RadioGroup
                                    value={actionType}
                                    onValueChange={(v) => setActionType(v as typeof actionType)}
                                    className="flex gap-2"
                                >
                                    <div className={cn(
                                        "flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border cursor-pointer transition-colors",
                                        actionType === 'warn' && "bg-amber-50 border-amber-300 dark:bg-amber-950"
                                    )}>
                                        <RadioGroupItem value="warn" id="warn" />
                                        <Label htmlFor="warn" className="cursor-pointer">Warn</Label>
                                    </div>
                                    <div className={cn(
                                        "flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border cursor-pointer transition-colors",
                                        actionType === 'mute' && "bg-orange-50 border-orange-300 dark:bg-orange-950"
                                    )}>
                                        <RadioGroupItem value="mute" id="mute" />
                                        <Label htmlFor="mute" className="cursor-pointer">Mute</Label>
                                    </div>
                                    <div className={cn(
                                        "flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border cursor-pointer transition-colors",
                                        actionType === 'ban' && "bg-red-50 border-red-300 dark:bg-red-950"
                                    )}>
                                        <RadioGroupItem value="ban" id="ban" />
                                        <Label htmlFor="ban" className="cursor-pointer">Ban</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Duration (for mute/ban) */}
                            {actionType !== 'warn' && (
                                <div className="space-y-2">
                                    <Label>Duration</Label>
                                    <RadioGroup
                                        value={duration}
                                        onValueChange={(v) => setDuration(v as typeof duration)}
                                        className="grid grid-cols-4 gap-2"
                                    >
                                        {[
                                            { value: '15', label: '15 min' },
                                            { value: '60', label: '1 hour' },
                                            { value: '1440', label: '24 hours' },
                                            { value: 'permanent', label: 'Permanent' },
                                        ].map((opt) => (
                                            <div
                                                key={opt.value}
                                                className={cn(
                                                    "flex items-center justify-center p-2 rounded-xl border text-xs cursor-pointer transition-colors",
                                                    duration === opt.value && "bg-primary text-white border-primary"
                                                )}
                                            >
                                                <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                                                <Label htmlFor={opt.value} className="cursor-pointer text-xs">{opt.label}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}

                            {/* Reason */}
                            <div className="space-y-2">
                                <Label>Reason (required)</Label>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Explain why this action is being taken..."
                                    className="rounded-2xl resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => { setShowHistory(false); setIsOpen(false); }}
                            className="rounded-2xl"
                        >
                            Cancel
                        </Button>
                        {!showHistory && (
                            <Button
                                onClick={handleModerationAction}
                                disabled={isSubmitting || !reason.trim()}
                                className={cn(
                                    "rounded-2xl",
                                    actionType === 'ban' && "bg-red-500 hover:bg-red-600",
                                    actionType === 'mute' && "bg-orange-500 hover:bg-orange-600",
                                    actionType === 'warn' && "bg-amber-500 hover:bg-amber-600"
                                )}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        {actionType === 'ban' && <Ban className="h-4 w-4 mr-2" />}
                                        {actionType === 'mute' && <VolumeX className="h-4 w-4 mr-2" />}
                                        {actionType === 'warn' && <AlertTriangle className="h-4 w-4 mr-2" />}
                                        {actionType.charAt(0).toUpperCase() + actionType.slice(1)} User
                                    </>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ChatModerationPanel;
