
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
    Users,
    Plus,
    Trash2,
    MapPin,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    Clock3,
    Edit2,
    Save,
    X as CloseIcon,
    RefreshCw
} from 'lucide-react';
import { CEKALoader } from '@/components/ui/ceka-loader';
import { motion, AnimatePresence } from 'framer-motion';

interface VolunteerOpportunity {
    id: string;
    title: string;
    description: string;
    organization: string;
    location: string;
    commitment: string;
    date: string;
    type: string;
    status: 'open' | 'pending' | 'approved' | 'rejected' | 'closed';
    created_at: string;
    updated_at: string;
}

const EMPTY_FORM: Partial<VolunteerOpportunity> = {
    title: '',
    description: '',
    organization: '',
    location: '',
    commitment: 'One-time',
    date: '',
    type: 'Volunteer',
    status: 'open'
};

const VolunteerManager = () => {
    const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<VolunteerOpportunity>>(EMPTY_FORM);
    const { toast } = useToast();

    useEffect(() => {
        loadOpportunities();
    }, []);

    const loadOpportunities = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('volunteer_opportunities' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOpportunities(data || []);
        } catch (error) {
            console.error('Error loading opportunities:', error);
            toast({
                title: "Error",
                description: "Failed to load opportunities",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.organization || !form.location) {
            toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        try {
            setSaving(true);

            if (editingId) {
                // Update existing
                const { error } = await supabase
                    .from('volunteer_opportunities' as any)
                    .update({
                        title: form.title,
                        description: form.description,
                        organization: form.organization,
                        location: form.location,
                        commitment: form.commitment,
                        date: form.date,
                        type: form.type,
                        status: form.status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingId);

                if (error) throw error;
                toast({ title: "Success", description: "Opportunity updated successfully" });
            } else {
                // Create new
                const { error } = await supabase
                    .from('volunteer_opportunities' as any)
                    .insert({
                        title: form.title,
                        description: form.description,
                        organization: form.organization,
                        location: form.location,
                        commitment: form.commitment,
                        date: form.date,
                        type: form.type,
                        status: form.status || 'open'
                    });

                if (error) throw error;
                toast({ title: "Success", description: "New opportunity created!" });
            }

            resetForm();
            loadOpportunities();
        } catch (error) {
            console.error('Save error:', error);
            toast({ title: "Error", description: "Failed to save opportunity", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (opp: VolunteerOpportunity) => {
        setForm({
            title: opp.title,
            description: opp.description,
            organization: opp.organization,
            location: opp.location,
            commitment: opp.commitment,
            date: opp.date,
            type: opp.type,
            status: opp.status
        });
        setEditingId(opp.id);
        setShowEditor(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this opportunity?')) return;

        try {
            const { error } = await supabase
                .from('volunteer_opportunities' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Deleted", description: "Opportunity removed successfully" });
            loadOpportunities();
        } catch (error) {
            console.error('Delete error:', error);
            toast({ title: "Error", description: "Failed to delete opportunity", variant: "destructive" });
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('volunteer_opportunities' as any)
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Status Updated", description: `Opportunity marked as ${status}` });
            loadOpportunities();
        } catch (error) {
            console.error('Status update error:', error);
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowEditor(false);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            open: 'bg-blue-100 text-blue-800',
            approved: 'bg-kenya-green text-white',
            pending: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800',
            closed: 'bg-gray-100 text-gray-600'
        };
        return <Badge className={styles[status] || 'bg-gray-100'}>{status}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <CEKALoader variant="scanning" size="lg" text="Syncing Volunteer Database..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Volunteer Opportunity Control</h2>
                    <p className="text-sm text-muted-foreground">Manage service-learning and community engagement listings</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadOpportunities} className="gap-1">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button onClick={() => { resetForm(); setShowEditor(true); }} className="gap-2">
                        <Plus className="h-4 w-4" /> Create New
                    </Button>
                </div>
            </div>

            {/* Editor Panel */}
            <AnimatePresence>
                {showEditor && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-primary/30 bg-primary/5">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle>{editingId ? 'Edit Opportunity' : 'Create New Opportunity'}</CardTitle>
                                    <Button size="icon" variant="ghost" onClick={resetForm}>
                                        <CloseIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Title *</Label>
                                            <Input
                                                value={form.title || ''}
                                                onChange={e => setForm({ ...form, title: e.target.value })}
                                                placeholder="e.g. Youth Voter Registration Drive"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Organization *</Label>
                                            <Input
                                                value={form.organization || ''}
                                                onChange={e => setForm({ ...form, organization: e.target.value })}
                                                placeholder="e.g. Kenya Electoral Commission"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Location *</Label>
                                            <Input
                                                value={form.location || ''}
                                                onChange={e => setForm({ ...form, location: e.target.value })}
                                                placeholder="e.g. Nairobi, Remote, Multiple Locations"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Input
                                                type="date"
                                                value={form.date || ''}
                                                onChange={e => setForm({ ...form, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Commitment</Label>
                                            <Select
                                                value={form.commitment || 'One-time'}
                                                onValueChange={v => setForm({ ...form, commitment: v })}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="One-time">One-time</SelectItem>
                                                    <SelectItem value="Weekly">Weekly</SelectItem>
                                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                                                    <SelectItem value="Flexible">Flexible</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select
                                                value={form.type || 'Volunteer'}
                                                onValueChange={v => setForm({ ...form, type: v })}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                                                    <SelectItem value="Internship">Internship</SelectItem>
                                                    <SelectItem value="Fieldwork">Fieldwork</SelectItem>
                                                    <SelectItem value="Remote">Remote</SelectItem>
                                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select
                                                value={form.status || 'open'}
                                                onValueChange={v => setForm({ ...form, status: v as any })}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="pending">Pending Review</SelectItem>
                                                    <SelectItem value="approved">Approved</SelectItem>
                                                    <SelectItem value="closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={form.description || ''}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            placeholder="Describe the opportunity, responsibilities, and impact..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={saving} className="gap-2">
                                            {saving ? <CEKALoader variant="ios" size="sm" /> : <Save className="h-4 w-4" />}
                                            {editingId ? 'Update' : 'Create'} Opportunity
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Opportunities List */}
            <div className="grid gap-4">
                <AnimatePresence>
                    {opportunities.length === 0 ? (
                        <Card className="py-12 text-center">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No volunteer opportunities yet.</p>
                            <Button className="mt-4" onClick={() => setShowEditor(true)}>
                                <Plus className="h-4 w-4 mr-2" /> Create First Opportunity
                            </Button>
                        </Card>
                    ) : (
                        opportunities.map((opp) => (
                            <motion.div
                                key={opp.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                layout
                            >
                                <Card className={`transition-all ${opp.status === 'pending' ? 'border-yellow-300 bg-yellow-50/5' : ''}`}>
                                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                                        <div className="space-y-1 flex-1">
                                            <CardTitle className="text-lg">{opp.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-primary">{opp.organization}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {opp.location}</span>
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(opp.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4" /> {opp.commitment || 'Flexible'}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" /> {opp.date || 'TBD'}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" /> {opp.type || 'Volunteer'}
                                            </div>
                                        </div>

                                        {opp.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                {opp.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 pt-4 border-t flex-wrap">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(opp)} className="gap-1">
                                                <Edit2 className="h-3 w-3" /> Edit
                                            </Button>

                                            {opp.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-kenya-green hover:bg-kenya-green/90 gap-1"
                                                        onClick={() => handleStatusChange(opp.id, 'approved')}
                                                    >
                                                        <CheckCircle className="h-3 w-3" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleStatusChange(opp.id, 'rejected')}
                                                        className="gap-1"
                                                    >
                                                        <XCircle className="h-3 w-3" /> Reject
                                                    </Button>
                                                </>
                                            )}

                                            {opp.status === 'open' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(opp.id, 'closed')}
                                                    className="gap-1"
                                                >
                                                    <Clock3 className="h-3 w-3" /> Close
                                                </Button>
                                            )}

                                            {opp.status === 'closed' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(opp.id, 'open')}
                                                    className="gap-1"
                                                >
                                                    <RefreshCw className="h-3 w-3" /> Reopen
                                                </Button>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive ml-auto"
                                                onClick={() => handleDelete(opp.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VolunteerManager;
