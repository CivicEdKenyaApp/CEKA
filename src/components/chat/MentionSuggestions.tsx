import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Hash, FileText, User, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MentionSuggestionsProps {
    query: string;
    trigger: '@' | '/';
    onSelect: (item: any) => void;
    onClose: () => void;
}

interface MentionItem {
    id: string;
    name?: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    type: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export const MentionSuggestions = ({ query, trigger, onSelect, onClose }: MentionSuggestionsProps) => {
    const [results, setResults] = useState<MentionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const searchItems = async () => {
            setLoading(true);
            try {
                if (trigger === '@') {
                    // Search Users & Profiles
                    const { data: users } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url, username')
                        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
                        .limit(5);

                    setResults(users?.map(u => ({ 
                        id: u.id, 
                        full_name: u.full_name,
                        username: u.username,
                        avatar_url: u.avatar_url,
                        type: 'user', 
                        icon: User 
                    })) || []);
                } else if (trigger === '/') {
                    // Search Commands and Resources
                    const internalCommands: MentionItem[] = [
                        { id: 'poll', name: 'Create Poll', description: 'Start a community poll', type: 'command', icon: Zap },
                        { id: 'link', name: 'Link Resource', description: 'Embed a file or doc', type: 'command', icon: FileText }
                    ];

                    // Search resources instead of campaigns
                    const { data: resources } = await supabase
                        .from('resources')
                        .select('id, title')
                        .ilike('title', `%${query}%`)
                        .limit(3);

                    const combined: MentionItem[] = [
                        ...internalCommands.filter(c => c.name?.toLowerCase().includes(query.toLowerCase())),
                        ...(resources?.map(r => ({ 
                            id: r.id, 
                            name: r.title, 
                            type: 'resource', 
                            icon: Hash 
                        })) || [])
                    ];

                    setResults(combined);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (query || trigger === '/') {
            const timer = setTimeout(searchItems, 200);
            return () => clearTimeout(timer);
        }
    }, [query, trigger]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                setSelectedIndex(prev => (prev + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
                if (results[selectedIndex]) onSelect(results[selectedIndex]);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [results, selectedIndex, onSelect, onClose]);

    if (results.length === 0 && !loading) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 w-full mb-3 z-[1002]"
        >
            <Card className="border-none shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[24px] overflow-hidden bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-3xl border border-white/20 dark:border-white/10">
                <CardContent className="p-1.5 space-y-1">
                    {loading && results.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground animate-pulse">Searching the CEKA ecosystem...</div>
                    ) : (
                        results.map((item, idx) => {
                            const IconComponent = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onSelect(item)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all duration-200",
                                        selectedIndex === idx ? "bg-primary text-white shadow-lg" : "hover:bg-slate-100 dark:hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
                                        selectedIndex === idx ? "bg-white/20" : "bg-slate-100 dark:bg-white/5 text-muted-foreground"
                                    )}>
                                        {IconComponent ? <IconComponent className="h-4 w-4" /> : item.avatar_url ? (
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={item.avatar_url} />
                                                <AvatarFallback className="text-[10px]">{item.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        ) : <Hash className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold truncate">{item.name || item.full_name}</span>
                                            {item.type && (
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] uppercase tracking-tighter h-4 px-1 border-none",
                                                    selectedIndex === idx ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {item.type}
                                                </Badge>
                                            )}
                                        </div>
                                        {item.description && (
                                            <p className={cn(
                                                "text-[10px] truncate",
                                                selectedIndex === idx ? "text-white/70" : "text-muted-foreground"
                                            )}>
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};
