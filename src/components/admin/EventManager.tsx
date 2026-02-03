
import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const EventManager = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const { toast } = useToast();

    const [form, setForm] = useState({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        category: 'event',
        icon_name: 'Calendar',
        external_link: '',
        is_newsletter: false
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await adminService.getCivicEvents();
            setEvents(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load events",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...form,
                id: editingEvent?.id
            };
            await adminService.saveCivicEvent(payload);
            toast({
                title: editingEvent ? "Event Updated" : "Event Created",
                description: "The calendar has been synchronized."
            });
            setShowEditor(false);
            setEditingEvent(null);
            loadEvents();
        } catch (error) {
            toast({
                title: "Save Failed",
                description: "There was an error saving the event.",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this event?")) return;
        try {
            await adminService.deleteCivicEvent(id);
            toast({ title: "Event Removed" });
            loadEvents();
        } catch (error) {
            toast({ title: "Delete Failed", variant: "destructive" });
        }
    };

    const startEditing = (event: any) => {
        setEditingEvent(event);
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
        setShowEditor(true);
    };

    const getCategoryBadge = (cat: string) => {
        switch (cat) {
            case 'newsletter': return <Badge className="bg-blue-500 gap-1"><Mail className="h-3 w-3" /> Newsletter</Badge>;
            case 'volunteer_op': return <Badge className="bg-kenya-green gap-1"><Users className="h-3 w-3" /> Volunteer</Badge>;
            case 'legislative': return <Badge className="bg-amber-500 gap-1"><Clock className="h-3 w-3" /> Legislative</Badge>;
            default: return <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" /> Event</Badge>;
        }
    };

    if (loading && events.length === 0) return <div className="text-center py-10">Syncing with Calendar...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Civic Calendar Control</h2>
                    <p className="text-sm text-muted-foreground">Orchestrate events, newsletters, and opportunities</p>
                </div>
                {!showEditor && (
                    <Button onClick={() => { setEditingEvent(null); setShowEditor(true); }} className="gap-2 rounded-xl h-11">
                        <Plus className="h-4 w-4" />
                        Schedule Operation
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {showEditor && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="border-2 border-primary/20 bg-primary/5 rounded-[2rem] overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle>{editingEvent ? 'Refine Event' : 'New Strategic Event'}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setShowEditor(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Campaign/Event Title</Label>
                                        <Input
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g. Community Human Rights Workshop"
                                            className="rounded-xl h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Context/Category</Label>
                                        <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                                            <SelectTrigger className="rounded-xl h-11">
                                                <SelectValue />
                                            </SelectTrigger>
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
                                        <Label>Deployment Date</Label>
                                        <Input
                                            type="date"
                                            value={form.event_date}
                                            onChange={e => setForm({ ...form, event_date: e.target.value })}
                                            className="rounded-xl h-11"
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
                                        placeholder="Outline the goals and details of this event..."
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
                                    <div className="flex items-center gap-2 pt-8">
                                        <input
                                            type="checkbox"
                                            id="is_newsletter"
                                            checked={form.is_newsletter}
                                            onChange={e => setForm({ ...form, is_newsletter: e.target.checked })}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="is_newsletter" className="cursor-pointer">Mark as Scheduled Newsletter</Label>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button onClick={handleSave} className="flex-1 rounded-xl h-12 gap-2 font-bold shadow-xl shadow-primary/20">
                                        <Save className="h-4 w-4" />
                                        Commit to Timeline
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowEditor(false)} className="rounded-xl h-12 px-8 border-2">
                                        Abort
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4">
                {events.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No operations scheduled on the horizon.</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all group bg-white dark:bg-slate-900 overflow-hidden relative">
                                <div className={cn(
                                    "absolute top-0 left-0 w-1 h-full",
                                    event.category === 'newsletter' ? 'bg-blue-500' :
                                        event.category === 'volunteer_op' ? 'bg-kenya-green' : 'bg-primary'
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
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{event.title}</h3>
                                                {getCategoryBadge(event.category)}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {event.start_time} - {event.end_time}</span>
                                                {event.is_newsletter && <span className="flex items-center gap-1 text-blue-500"><CheckCircle2 className="h-3.5 w-3.5" /> Scheduled Email</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" className="rounded-xl gap-2 border-2" onClick={() => startEditing(event)}>
                                            <Edit2 className="h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="ghost" className="rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleDelete(event.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EventManager;
