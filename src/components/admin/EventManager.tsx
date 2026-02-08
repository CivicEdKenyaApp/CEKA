
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
    Calendar,
    Plus,
    Trash2,
    Clock,
    MapPin,
    ExternalLink,
    Mail,
    Users,
    Edit2,
    Save,
    X,
    Sparkles,
    CheckCircle2,
    RefreshCw,
    Scale,
    CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CivicEvent {
    id: string;
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    category: string;
    icon_name: string;
    external_link: string;
    is_newsletter: boolean;
    created_at: string;
    updated_at: string;
}

const EMPTY_FORM = {
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    category: 'event',
    icon_name: 'Calendar',
    external_link: '',
    is_newsletter: false
};

const EventManager = () => {
    const [events, setEvents] = useState<CivicEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const { toast } = useToast();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('civic_events' as any)
                .select('*')
                .order('event_date', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
            toast({
                title: "Error",
                description: "Failed to load events. Check RLS policies.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.event_date) {
            toast({ title: "Validation Error", description: "Title and date are required", variant: "destructive" });
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title: form.title,
                description: form.description,
                event_date: form.event_date,
                start_time: form.start_time,
                end_time: form.end_time,
                category: form.category,
                icon_name: form.icon_name,
                external_link: form.external_link,
                is_newsletter: form.is_newsletter,
                updated_at: new Date().toISOString()
            };

            if (editingId) {
                // Update existing
                const { error } = await supabase
                    .from('civic_events' as any)
                    .update(payload)
                    .eq('id', editingId);

                if (error) throw error;
                toast({ title: "Success", description: "Event updated successfully" });
            } else {
                // Create new
                const { error } = await supabase
                    .from('civic_events' as any)
                    .insert(payload);

                if (error) throw error;
                toast({ title: "Success", description: "Event created and committed to timeline!" });
            }

            resetForm();
            loadEvents();
        } catch (error: any) {
            console.error('Save error:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to save event. Check RLS policies.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (event: CivicEvent) => {
        setForm({
            title: event.title,
            description: event.description || '',
            event_date: event.event_date,
            start_time: event.start_time || '09:00',
            end_time: event.end_time || '17:00',
            category: event.category || 'event',
            icon_name: event.icon_name || 'Calendar',
            external_link: event.external_link || '',
            is_newsletter: event.is_newsletter || false
        });
        setEditingId(event.id);
        setShowEditor(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this event from the timeline?')) return;

        try {
            const { error } = await supabase
                .from('civic_events' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Event Removed", description: "Operation cleared from calendar." });
            loadEvents();
        } catch (error: any) {
            console.error('Delete error:', error);
            toast({ title: "Error", description: error.message || "Failed to delete event", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowEditor(false);
    };

    const getCategoryBadge = (cat: string) => {
        const badges: Record<string, JSX.Element> = {
            newsletter: <Badge className="bg-blue-500 gap-1"><Mail className="h-3 w-3" />Newsletter</Badge>,
            volunteer_op: <Badge className="bg-kenya-green gap-1"><Users className="h-3 w-3" />Volunteer</Badge>,
            legislative: <Badge className="bg-amber-500 gap-1"><Scale className="h-3 w-3" />Legislative</Badge>,
            event: <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" />Event</Badge>
        };
        return badges[cat] || badges.event;
    };

    if (loading && events.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Syncing with Calendar...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Civic Calendar Control</h2>
                    <p className="text-sm text-muted-foreground">Orchestrate events, newsletters, and strategic operations</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadEvents} className="gap-1">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    {!showEditor && (
                        <Button onClick={() => { resetForm(); setShowEditor(true); }} className="gap-2 rounded-xl h-11">
                            <Plus className="h-4 w-4" /> Schedule Operation
                        </Button>
                    )}
                </div>
            </div>

            {/* Editor Panel */}
            <AnimatePresence>
                {showEditor && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-2 border-primary/20 bg-primary/5 rounded-[2rem]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle>{editingId ? 'Refine Event' : 'New Strategic Event'}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={resetForm}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Campaign/Event Title *</Label>
                                            <Input
                                                value={form.title}
                                                onChange={e => setForm({ ...form, title: e.target.value })}
                                                placeholder="e.g. Community Human Rights Workshop"
                                                className="rounded-xl h-11"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Context/Category</Label>
                                            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                                                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="event">General Event</SelectItem>
                                                    <SelectItem value="newsletter">Email Newsletter</SelectItem>
                                                    <SelectItem value="volunteer_op">Volunteer Opportunity</SelectItem>
                                                    <SelectItem value="legislative">Legislative Deadline</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Deployment Date *</Label>
                                            <Input
                                                type="date"
                                                value={form.event_date}
                                                onChange={e => setForm({ ...form, event_date: e.target.value })}
                                                className="rounded-xl h-11"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Start Time</Label>
                                            <Input
                                                type="time"
                                                value={form.start_time}
                                                onChange={e => setForm({ ...form, start_time: e.target.value })}
                                                className="rounded-xl h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Time</Label>
                                            <Input
                                                type="time"
                                                value={form.end_time}
                                                onChange={e => setForm({ ...form, end_time: e.target.value })}
                                                className="rounded-xl h-11"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Strategic Intelligence (Description)</Label>
                                        <Textarea
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            placeholder="Outline the goals and context of this event..."
                                            className="rounded-2xl min-h-[100px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>External Action Link (Optional)</Label>
                                            <Input
                                                value={form.external_link}
                                                onChange={e => setForm({ ...form, external_link: e.target.value })}
                                                placeholder="https://..."
                                                className="rounded-xl h-11"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 pt-6">
                                            <Checkbox
                                                id="is_newsletter"
                                                checked={form.is_newsletter}
                                                onCheckedChange={(checked) => setForm({ ...form, is_newsletter: !!checked })}
                                            />
                                            <Label htmlFor="is_newsletter" className="cursor-pointer flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-blue-500" />
                                                Mark as Scheduled Newsletter
                                            </Label>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button type="submit" disabled={saving} className="flex-1 rounded-xl h-12 gap-2 font-bold shadow-xl shadow-primary/20">
                                            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            {editingId ? 'Update Event' : 'Commit to Timeline'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl h-12 px-8 border-2">
                                            Abort
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Events List */}
            <div className="space-y-4">
                {events.length === 0 ? (
                    <Card className="py-20 text-center border-2 border-dashed">
                        <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No operations scheduled on the horizon.</p>
                        <Button className="mt-4" onClick={() => setShowEditor(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Schedule First Event
                        </Button>
                    </Card>
                ) : (
                    <AnimatePresence>
                        {events.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all group bg-white dark:bg-slate-900 overflow-hidden relative">
                                    <div className={cn(
                                        "absolute top-0 left-0 w-1 h-full",
                                        event.category === 'newsletter' ? 'bg-blue-500' :
                                            event.category === 'volunteer_op' ? 'bg-kenya-green' :
                                                event.category === 'legislative' ? 'bg-amber-500' : 'bg-primary'
                                    )} />
                                    <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="text-center min-w-[60px] p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                                                <div className="text-[10px] uppercase font-bold text-slate-400">
                                                    {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                                                </div>
                                                <div className="text-xl font-black">
                                                    {new Date(event.event_date).getDate()}
                                                </div>
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-lg">{event.title}</h3>
                                                    {getCategoryBadge(event.category)}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" /> {event.start_time || '09:00'} - {event.end_time || '17:00'}
                                                    </span>
                                                    {event.is_newsletter && (
                                                        <span className="flex items-center gap-1 text-blue-500">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Scheduled Email
                                                        </span>
                                                    )}
                                                    {event.external_link && (
                                                        <a
                                                            href={event.external_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-primary hover:underline"
                                                        >
                                                            <ExternalLink className="h-3 w-3" /> Link
                                                        </a>
                                                    )}
                                                </div>
                                                {event.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                        {event.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(event)} className="rounded-xl gap-2 border-2">
                                                <Edit2 className="h-3.5 w-3.5" /> Edit
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(event.id)} className="rounded-xl text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default EventManager;
