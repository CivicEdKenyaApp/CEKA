
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    MapPin,
    ExternalLink,
    Mail,
    Users,
    Bell,
    MoreHorizontal,
    Share2,
    Download,
    CheckCircle2,
    Sparkles,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import EventDetailModal from './EventDetailModal';

interface Event {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    category: string | null;
    color: string | null;
    icon_name: string | null;
    external_link: string | null;
    is_newsletter: boolean;
}

interface EventCalendarProps {
    view?: 'tiny' | 'mini' | 'medium' | 'large';
    onEventClick?: (event: Event) => void;
    isAdmin?: boolean;
}

const EventCalendar = ({ view = 'medium', onEventClick, isAdmin = false }: EventCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchEvents();
    }, [currentMonth]);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from('civic_events')
                .select('*')
                .gte('event_date', start)
                .lte('event_date', end);

            if (error) throw error;
            setEvents((data as any[]) || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEventClick = (event: Event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
        onEventClick?.(event);
    };

    const getGoogleCalendarUrl = (event: Event) => {
        const start = event.event_date.replace(/-/g, '') + 'T' + (event.start_time?.replace(/:/g, '') || '090000') + 'Z';
        const end = event.event_date.replace(/-/g, '') + 'T' + (event.end_time?.replace(/:/g, '') || '170000') + 'Z';
        const title = encodeURIComponent(event.title);
        const details = encodeURIComponent(event.description || '');
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&sf=true&output=xml`;
    };

    const dayEvents = (day: Date) => {
        return events.filter(e => isSameDay(new Date(e.event_date), day));
    };

    const renderTiny = () => {
        const nextEvent = events.find(e => new Date(e.event_date) >= new Date()) || events[0];
        if (!nextEvent) return null;
        return (
            <div
                className="flex items-center gap-2 bg-kenya-green/10 text-kenya-green px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                onClick={() => handleEventClick(nextEvent)}
            >
                <CalendarIcon className="h-3 w-3" />
                <span>Next: {nextEvent.title} • {format(new Date(nextEvent.event_date), 'MMM d')}</span>
            </div>
        );
    };

    const renderMini = () => {
        const upcoming = events.filter(e => new Date(e.event_date) >= new Date()).slice(0, 3);
        return (
            <div className="space-y-3">
                {upcoming.map(event => (
                    <div key={event.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => handleEventClick(event)}>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center text-[8px] font-bold">
                            <span className="text-slate-400">{format(new Date(event.event_date), 'MMM')}</span>
                            <span className="text-sm">{format(new Date(event.event_date), 'd')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold truncate group-hover:text-kenya-green transition-colors">{event.title}</h4>
                            <p className="text-[10px] text-slate-500">{event.start_time || 'All Day'}</p>
                        </div>
                    </div>
                ))}
                {upcoming.length === 0 && <p className="text-[10px] text-slate-400 text-center py-2">No upcoming ops.</p>}
            </div>
        );
    };

    const renderMedium = () => {
        const days = eachDayOfInterval({
            start: startOfWeek(startOfMonth(currentMonth)),
            end: endOfWeek(endOfMonth(currentMonth))
        });

        return (
            <Card className="rounded-[2rem] border-none shadow-ios-high dark:bg-slate-950/50 backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-lg font-black">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 border-t dark:border-white/10">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                            <div key={day} className="py-2 text-center text-[10px] font-black text-slate-400">{day}</div>
                        ))}
                        {days.map((day, idx) => {
                            const eventsToday = dayEvents(day);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        "min-h-[80px] p-1 border-t border-r last:border-r-0 dark:border-white/10 transition-colors",
                                        !isCurrentMonth && "bg-slate-50/50 dark:bg-white/5 opacity-30"
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={cn(
                                            "text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full",
                                            isToday && "bg-kenya-red text-white"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    <div className="mt-1 space-y-1">
                                        {eventsToday.slice(0, 2).map(event => (
                                            <div
                                                key={event.id}
                                                className={cn(
                                                    "text-[8px] p-1 rounded-lg truncate cursor-pointer font-bold",
                                                    event.category === 'newsletter' ? "bg-blue-500/10 text-blue-500" :
                                                        event.category === 'volunteer_op' ? "bg-kenya-green/10 text-kenya-green" :
                                                            "bg-primary/10 text-primary"
                                                )}
                                                onClick={() => handleEventClick(event)}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {eventsToday.length > 2 && <div className="text-[7px] text-center text-slate-400">+{eventsToday.length - 2} more</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderLarge = () => {
        return (
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {renderMedium()}
                </div>
                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-ios-high p-6 bg-white dark:bg-slate-900">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Sync Options
                        </h3>
                        <div className="space-y-4">
                            <Button className="w-full rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white gap-3 justify-start px-6">
                                <Mail className="h-5 w-5" />
                                <span>Sync with Google Calendar</span>
                            </Button>
                            <Button className="w-full rounded-2xl h-14 bg-slate-900 hover:bg-black text-white gap-3 justify-start px-6">
                                <CalendarIcon className="h-5 w-5" />
                                <span>Add to Apple Calendar</span>
                            </Button>
                            <Button variant="outline" className="w-full rounded-2xl h-14 gap-3 justify-start px-6 border-2 font-bold">
                                <Download className="h-5 w-5" />
                                <span>Download iCal (.ics)</span>
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-ios-high p-6 bg-kenya-green/5 dark:bg-kenya-green/10 border border-kenya-green/20">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-kenya-green" />
                            Service Opportunities
                        </h3>
                        <p className="text-xs text-slate-500 mb-6">
                            Participate in civic engagement and volunteer work. Earn badges and recognition for your community impact.
                        </p>
                        <Button className="w-full rounded-2xl h-12 bg-kenya-green hover:bg-kenya-green/90 text-white font-bold">
                            Join Current Operations
                        </Button>
                    </Card>
                </div>
            </div>
        );
    };

    return (
        <>
            {view === 'tiny' && renderTiny()}
            {view === 'mini' && renderMini()}
            {view === 'medium' && renderMedium()}
            {view === 'large' && renderLarge()}

            <EventDetailModal
                event={selectedEvent}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isAdmin={isAdmin}
                onUpdate={fetchEvents}
            />
        </>
    );
};

export default EventCalendar;
