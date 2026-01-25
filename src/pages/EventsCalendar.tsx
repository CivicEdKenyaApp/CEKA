
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import gsap from 'gsap';
import { createEvent as createIcs } from 'ics';

interface CivicEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  color?: string;
}

const EventsCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CivicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const flourishRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  useEffect(() => {
    if (flourishRef.current) {
      gsap.fromTo(flourishRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [selectedDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentMonth).toISOString();
      const end = endOfMonth(currentMonth).toISOString();

      const { data, error } = await supabase
        .from('civic_events')
        .select('*')
        .gte('event_date', start)
        .lte('event_date', end);

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDateEvents = events.filter(event =>
    isSameDay(new Date(event.event_date), selectedDate)
  );

  useEffect(() => {
    // Stagger animation for event cards
    if (!loading && selectedDateEvents.length > 0) {
      gsap.fromTo(".event-card",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loading, selectedDateEvents.length, selectedDate]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const downloadIcs = (event: CivicEvent) => {
    const date = new Date(event.event_date);
    const [hours, minutes] = (event.start_time || '09:00').split(':').map(Number);

    const icsEvent = {
      start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), hours, minutes] as [number, number, number, number, number],
      duration: { hours: 1 },
      title: event.title,
      description: event.description,
      location: 'Kenya',
      url: window.location.href,
      categories: [event.category || 'Civic'],
    };

    createIcs(icsEvent, (error, value) => {
      if (error) return console.error(error);
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const getGoogleCalendarUrl = (event: CivicEvent) => {
    const dateStr = format(new Date(event.event_date), 'yyyyMMdd');
    const startTime = (event.start_time || '09:00').replace(':', '') + '00';
    const endTime = (event.end_time || '10:00').replace(':', '') + '00';

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${dateStr}T${startTime}Z/${dateStr}T${endTime}Z&details=${encodeURIComponent(event.description)}&location=Kenya`;
  };

  return (
    <Layout>
      <div className="container py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gradient-gold">Events Calendar</h1>
            <p className="text-muted-foreground mt-1">Join our civic engagement activities across Kenya</p>
          </div>

          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-2xl border border-border/50 backdrop-blur-sm">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-xl hover:bg-background shadow-sm transition-all">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="px-4 font-semibold min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl hover:bg-background shadow-sm transition-all">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-7 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-4 bg-card rounded-3xl border border-border/50 shadow-ios-high overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border/30 bg-muted/10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {daysInMonth.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const hasEvents = events.some(e => isSameDay(new Date(e.event_date), day));

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative aspect-square p-2 border-r border-b border-border/20 transition-all duration-300
                      flex flex-col items-center justify-center group
                      ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                      ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}
                    `}
                  >
                    <span
                      className={`
                        z-10 text-sm font-medium transition-colors
                        ${isSelected ? 'text-primary' : 'text-foreground'}
                        ${isSameDay(day, new Date()) && !isSelected ? 'bg-kenya-red text-white w-7 h-7 flex items-center justify-center rounded-full' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </span>

                    {isSelected && (
                      <div
                        ref={flourishRef}
                        className="absolute bottom-2 w-6 h-1 bg-primary rounded-full origin-center"
                      />
                    )}

                    {hasEvents && !isSelected && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-kenya-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Details */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {format(selectedDate, 'EEEE, MMM do')}
              </h2>
              {selectedDateEvents.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-none">
                  {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'Event' : 'Events'}
                </Badge>
              )}
            </div>

            <div className="space-y-4 min-h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                </div>
              ) : selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event, idx) => (
                  <Card key={event.id} className="event-card overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all group rounded-2xl opacity-0">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-primary border-primary/20">
                          {event.category || 'Civic'}
                        </Badge>
                        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                          {event.start_time || 'All Day'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-8 rounded-xl gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                          onClick={() => downloadIcs(event)}
                        >
                          <Download className="h-3 w-3" />
                          iCalendar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-8 rounded-xl gap-1.5 hover:bg-blue-500/5 hover:text-blue-500 hover:border-blue-500/30"
                          asChild
                        >
                          <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                            Google Calendar
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="bg-muted/10 rounded-3xl border border-dashed border-border/50 p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mb-4">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-bold text-lg">No Events Scheduled</h3>
                  <p className="text-sm text-muted-foreground max-w-[200px] mt-2">
                    Check back later for activities on this date.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventsCalendar;
