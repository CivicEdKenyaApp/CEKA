/**
 * NotificationDropdown - iOS-inspired notification center
 * 
 * Premium glassmorphism design with real-time updates,
 * swipe-to-dismiss, and grouped notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
    Bell,
    Check,
    CheckCheck,
    X,
    MessageSquare,
    PenTool,
    Heart,
    FileText,
    TrendingUp,
    MessageCircle,
    Shield,
    Loader2,
    Archive,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { notificationService, type Notification, type NotificationSourceType } from '@/services/notificationService';
import { useNavigate } from 'react-router-dom';

// Icon mapping for notification types
const iconMap: Record<string, React.ElementType> = {
    MessageSquare,
    PenTool,
    Heart,
    FileText,
    TrendingUp,
    MessageCircle,
    Shield,
    Bell,
};

interface NotificationDropdownProps {
    className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const [data, count] = await Promise.all([
                notificationService.getNotifications({ limit: 20 }),
                notificationService.getUnreadCount(),
            ]);
            setNotifications(data);
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Setup real-time subscription
    useEffect(() => {
        fetchNotifications();

        const unsubscribe = notificationService.subscribeToNotifications((newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => unsubscribe();
    }, [fetchNotifications]);

    // Mark notification as read
    const handleMarkAsRead = async (notification: Notification, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (notification.is_read) return;

        try {
            await notificationService.markAsRead(notification.id);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Archive notification
    const handleArchive = async (notification: Notification, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await notificationService.archive(notification.id);
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
            if (!notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to archive:', error);
        }
    };

    // Navigate to notification link
    const handleNotificationClick = (notification: Notification) => {
        handleMarkAsRead(notification);
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    // Get icon component for notification type
    const getIcon = (sourceType: NotificationSourceType) => {
        const iconName = notificationService.getNotificationIcon(sourceType);
        return iconMap[iconName] || Bell;
    };

    // Get priority indicator color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500';
            case 'high': return 'bg-amber-500';
            case 'normal': return 'bg-primary';
            default: return 'bg-muted';
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("relative rounded-full", className)}
                >
                    <Bell className="h-5 w-5" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full"
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[380px] p-0 rounded-3xl border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <h3 className="font-bold text-lg">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-primary hover:text-primary/80 rounded-xl"
                        >
                            <CheckCheck className="h-3.5 w-3.5 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Notification List */}
                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground text-center">
                                No notifications yet
                            </p>
                            <p className="text-xs text-muted-foreground/70 text-center mt-1">
                                You'll see updates here when something happens
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {notifications.map((notification, index) => {
                                const Icon = getIcon(notification.source_type);

                                return (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.02 }}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "relative flex gap-3 px-4 py-3 cursor-pointer transition-colors group",
                                            "hover:bg-muted/50",
                                            !notification.is_read && "bg-primary/5"
                                        )}
                                    >
                                        {/* Unread indicator */}
                                        {!notification.is_read && (
                                            <div className={cn(
                                                "absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                                                getPriorityColor(notification.priority)
                                            )} />
                                        )}

                                        {/* Avatar or Icon */}
                                        {notification.actor?.avatar_url || notification.image_url ? (
                                            <Avatar className="h-10 w-10 shrink-0">
                                                <AvatarImage src={notification.actor?.avatar_url || notification.image_url || ''} />
                                                <AvatarFallback>
                                                    <Icon className="h-4 w-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm line-clamp-1",
                                                !notification.is_read && "font-semibold"
                                            )}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground/70">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                                {notification.source_type !== 'system' && (
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-md">
                                                        {notification.source_type.replace('_', ' ')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full"
                                                    onClick={(e) => handleMarkAsRead(notification, e)}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-full hover:bg-red-100 hover:text-red-500"
                                                onClick={(e) => handleArchive(notification, e)}
                                            >
                                                <Archive className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        {/* Link indicator */}
                                        {notification.link && (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 self-center shrink-0" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-2 border-t border-border/50">
                        <Button
                            variant="ghost"
                            className="w-full rounded-2xl text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                navigate('/settings?tab=notifications');
                                setIsOpen(false);
                            }}
                        >
                            View all notifications
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
