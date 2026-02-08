// Event Manager Component - Civic Calendar Control
// Full CRUD with direct Supabase integration

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Plus, Trash2, Edit2, X, Clock, MapPin, ExternalLink,
    Mail, RefreshCw, CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CivicEvent {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    category: string;
    icon_name: string | null;
    external_link: string | null;
    is_newsletter: boolean;
    created_at: string;
}

const EVENT_CATEGORIES = [
    { value: 'general', label: 'General Event' },
    { value: 'parliament', label: 'Parliament Session' },
    { value: 'election', label: 'Election' },
    { value: 'protest', label: 'Civic Action' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'newsletter', label: 'Email Newsletter' },
    { value: 'webinar', label: 'Webinar/Training' },
    { value: 'meeting', label: 'Community Meeting' }
];

const EventManager = () => {
    const [events, setEvents] = useState<CivicEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        event_date: '',
        start_time: '',
        end_time: '',
        category: 'general',
        icon_name: '',
        external_link: '',
        is_newsletter: false
    });
    const { toast } = useToast();

    // Load events
    const loadEvents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('civic_events')
                .select('*')
                .order('event_date', { ascending: true });

            if (error) throw error;
            setEvents((data as unknown as CivicEvent[]) || []);
        } catch (error) {
            console.error('Error loading events:', error);
            toast({ title: 'Error', description: 'Failed to load events', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    // Reset form
    const resetForm = () => {
        setForm({
            title: '',
            description: '',
            event_date: '',
            start_time: '',
            end_time: '',
            category: 'general',
            icon_name: '',
            external_link: '',
            is_newsletter: false
        });
        setEditingId(null);
        setShowForm(false);
    };

    // Edit event
    const startEdit = (event: CivicEvent) => {
        setForm({
            title: event.title,
            description: event.description || '',
            event_date: event.event_date,
            start_time: event.start_time || '',
            end_time: event.end_time || '',
            category: event.category || 'general',
            icon_name: event.icon_name || '',
            external_link: event.external_link || '',
            is_newsletter: event.is_newsletter
        });
        setEditingId(event.id);
        setShowForm(true);
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.event_date) {
            toast({ title: 'Validation Error', description: 'Title and date are required', variant: 'destructive' });
            return;
        }

        try {
            setSaving(true);

            const eventData = {
                title: form.title,
                description: form.description || null,
                event_date: form.event_date,
                start_time: form.start_time || null,
                end_time: form.end_time || null,
                category: form.category,
                icon_name: form.icon_name || null,
                external_link: form.external_link || null,
                is_newsletter: form.is_newsletter
            };

            if (editingId) {
                const { error } = await supabase
                    .from('civic_events')
                    .update(eventData)
                    .eq('id', editingId);

                if (error) throw error;
                toast({ title: 'Updated', description: 'Event updated successfully' });
            } else {
                const { error } = await supabase
                    .from('civic_events')
                    .insert(eventData);

                if (error) throw error;
                toast({ title: 'Created', description: 'Event created successfully' });
            }

            resetForm();
            await loadEvents();
        } catch (error: any) {
            console.error('Error saving event:', error);
            toast({ title: 'Error', description: error.message || 'Failed to save event', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    // Delete event
    const deleteEvent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const { error } = await supabase
                .from('civic_events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: 'Deleted', description: 'Event deleted successfully' });
            await loadEvents();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
        }
    };

    // Format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Format time
    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    // Get category color
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            general: 'bg-gray-500/10 text-gray-600',
            parliament: 'bg-blue-500/10 text-blue-600',
            election: 'bg-purple-500/10 text-purple-600',
            protest: 'bg-orange-500/10 text-orange-600',
            deadline: 'bg-red-500/10 text-red-600',
            newsletter: 'bg-emerald-500/10 text-emerald-600',
            webinar: 'bg-cyan-500/10 text-cyan-600',
            meeting: 'bg-amber-500/10 text-amber-600'
        };
        return colors[category] || colors.general;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Civic Calendar Control</h2>
                    <p className="text-muted-foreground text-sm">
                        Orchestrate events, newsletters, and opportunities
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadEvents} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="gap-2 rounded-xl"
                    >
                        {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {showForm ? 'Cancel' : 'New Strategic Event'}
                    </Button>
                </div>
            </div>

            {/* Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <Label>Campaign/Event Title *</Label>
                                            <Input
                                                value={form.title}
                                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                placeholder="Monthly Newsletter - February"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Context/Category</Label>
                                            <Select
                                                value={form.category}
                                                onValueChange={(v) => setForm({ ...form, category: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EVENT_CATEGORIES.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Deployment Date *</Label>
                                            <Input
                                                type="date"
                                                value={form.event_date}
                                                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Start Time</Label>
                                            <Input
                                                type="time"
                                                value={form.start_time}
                                                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label>End Time</Label>
                                            <Input
                                                type="time"
                                                value={form.end_time}
                                                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Strategic Intelligence (Description)</Label>
                                        <Textarea
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Monthly CEKA Newsletter Drop"
                                            className="min-h-[80px]"
                                        />
                                    </div>

                                    <div>
                                        <Label>External Action Link (Optional)</Label>
                                        <Input
                                            value={form.external_link}
                                            onChange={(e) => setForm({ ...form, external_link: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="newsletter"
                                            checked={form.is_newsletter}
                                            onCheckedChange={(checked) => setForm({ ...form, is_newsletter: !!checked })}
                                        />
                                        <Label htmlFor="newsletter" className="cursor-pointer">
                                            Mark as Scheduled Newsletter
                                        </Label>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={saving} className="rounded-xl">
                                            {saving ? 'Saving...' : editingId ? 'Update Event' : 'Commit to Timeline'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">
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
            <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Scheduled Operations
                    </CardTitle>
                    <CardDescription>{events.length} events on the horizon</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {events.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No operations scheduled on the horizon.
                        </p>
                    ) : (
                        events.map((event) => (
                            <div
                                key={event.id}
                                className="p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">{event.title}</h4>
                                            {event.is_newsletter && (
                                                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    Newsletter
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(event.event_date)}
                                            </span>
                                            {event.start_time && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(event.start_time)}
                                                    {event.end_time && ` - ${formatTime(event.end_time)}`}
                                                </span>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground">{event.description}</p>
                                        )}
                                        <Badge variant="outline" className={`text-xs ${getCategoryColor(event.category)}`}>
                                            {EVENT_CATEGORIES.find(c => c.value === event.category)?.label || event.category}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {event.external_link && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                asChild
                                            >
                                                <a href={event.external_link} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => startEdit(event)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => deleteEvent(event.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EventManager;
