
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Clock,
    MapPin,
    ExternalLink,
    Edit2,
    Save,
    X,
    Link as LinkIcon,
    Mail,
    Users,
    Download,
    Share2,
    CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { adminService } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Event {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    category: string | null;
    external_link: string | null;
    is_newsletter: boolean;
}

interface EventDetailModalProps {
    event: Event | null;
    isOpen: boolean;
    onClose: () => void;
    isAdmin?: boolean;
    onUpdate?: () => void;
}

const EventDetailModal = ({ event, isOpen, onClose, isAdmin, onUpdate }: EventDetailModalProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);
    const { toast } = useToast();

    if (!event) return null;

    const handleEdit = () => {
        setEditForm({ ...event });
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            await adminService.saveCivicEvent(editForm);
            toast({ title: "Event Synchronized", description: "The changes are now live." });
            setIsEditing(false);
            onUpdate?.();
        } catch (error) {
            toast({ title: "Save Failed", variant: "destructive" });
        }
    };

    const getGoogleCalendarUrl = () => {
        const start = event.event_date.replace(/-/g, '') + 'T' + (event.start_time?.replace(/:/g, '') || '090000') + 'Z';
        const end = event.event_date.replace(/-/g, '') + 'T' + (event.end_time?.replace(/:/g, '') || '170000') + 'Z';
        const title = encodeURIComponent(event.title);
        const details = encodeURIComponent(event.description || '');
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&sf=true&output=xml`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-ios-high p-0 overflow-hidden bg-white dark:bg-slate-900">
                {!isEditing ? (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className={cn(
                            "h-32 w-full flex items-center justify-center relative",
                            event.category === 'newsletter' ? "bg-blue-600" :
                                event.category === 'volunteer_op' ? "bg-kenya-green" : "bg-primary"
                        )}>
                            <div className="absolute inset-0 bg-black/10" />
                            <Calendar className="h-12 w-12 text-white/50 relative z-10" />
                            {isAdmin && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="absolute top-4 right-4 rounded-full bg-white/20 backdrop-blur-md text-white border-none shadow-lg"
                                    onClick={handleEdit}
                                >
                                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                                    Inline Edit
                                </Button>
                            )}
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="rounded-full px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest border-none">
                                        {event.category || 'Event'}
                                    </Badge>
                                    {event.is_newsletter && (
                                        <Badge className="rounded-full px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border-none">
                                            Weekly Newsletter
                                        </Badge>
                                    )}
                                </div>
                                <h2 className="text-2xl font-black tracking-tight leading-tight">{event.title}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</p>
                                    <div className="flex items-center gap-2 text-sm font-bold">
                                        <Clock className="h-4 w-4 text-primary" />
                                        {format(new Date(event.event_date), 'PPP')}<br />
                                        {event.start_time || '09:00'} - {event.end_time || '17:00'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</p>
                                    <div className="flex items-center gap-2 text-sm font-bold">
                                        {event.category === 'newsletter' ? <Mail className="h-4 w-4 text-blue-500" /> : <Users className="h-4 w-4 text-kenya-green" />}
                                        {event.category === 'volunteer_op' ? 'In-Person Engagement' : 'Digital Briefing'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligence Brief</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {event.description || 'No detailed briefing available for this strategic operation.'}
                                </p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button asChild className="flex-1 rounded-2xl h-14 bg-slate-900 hover:bg-black text-white gap-2 font-bold shadow-xl">
                                    <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-5 w-5" />
                                        Sync G-Cal
                                    </a>
                                </Button>
                                {event.external_link && (
                                    <Button asChild variant="outline" className="flex-1 rounded-2xl h-14 border-2 font-bold gap-2">
                                        <a href={event.external_link} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-5 w-5" />
                                            Action Link
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black">Strategic Repositioning</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400">Operation Title</label>
                                <Input
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    className="rounded-xl h-11"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Target Date</label>
                                    <Input
                                        type="date"
                                        value={editForm.event_date}
                                        onChange={e => setEditForm({ ...editForm, event_date: e.target.value })}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
                                    <Input
                                        value={editForm.category}
                                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400">Intelligence Brief</label>
                                <Textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    className="rounded-2xl min-h-[120px]"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button onClick={handleSave} className="flex-1 rounded-2xl h-14 bg-kenya-green hover:bg-kenya-green/90 text-white font-bold gap-2">
                                    <Save className="h-5 w-5" />
                                    Commit Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EventDetailModal;
