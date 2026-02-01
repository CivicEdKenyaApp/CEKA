
import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VolunteerManager = () => {
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadOpportunities();
    }, []);

    const loadOpportunities = async () => {
        try {
            setLoading(true);
            const data = await adminService.getVolunteerOpportunities();
            setOpportunities(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load opportunities",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, status: any) => {
        try {
            await adminService.updateVolunteerStatus(id, status);
            toast({ title: "Status Updated", description: `Opportunity marked as ${status}.` });
            loadOpportunities();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-kenya-green">Approved</Badge>;
            case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            case 'closed': return <Badge variant="outline">Closed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) return <div className="text-center py-10">Loading opportunities...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Volunteer Opportunity Control</h2>
                    <p className="text-sm text-muted-foreground">Manage service-learning and community engagement listings</p>
                </div>
                <Button onClick={() => setShowEditor(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create New
                </Button>
            </div>

            <div className="grid gap-6">
                <AnimatePresence>
                    {opportunities.map((opp) => (
                        <motion.div
                            key={opp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                        >
                            <Card className={`${opp.status === 'pending' ? 'border-yellow-200 bg-yellow-50/10' : ''}`}>
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">{opp.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <span className="font-bold text-primary">{opp.organization}</span>
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
                                            <Clock className="h-4 w-4" /> {opp.commitment}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" /> {opp.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" /> {opp.type}
                                        </div>
                                    </div>
                                    <p className="text-sm line-clamp-2 text-muted-foreground mb-4">
                                        {opp.description}
                                    </p>

                                    <div className="flex items-center gap-2 pt-4 border-t">
                                        <Button size="sm" variant="outline" className="gap-2">
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
                                                    className="gap-1"
                                                    onClick={() => handleStatusChange(opp.id, 'rejected')}
                                                >
                                                    <XCircle className="h-3 w-3" /> Reject
                                                </Button>
                                            </>
                                        )}

                                        {opp.status === 'approved' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-muted-foreground gap-1"
                                                onClick={() => handleStatusChange(opp.id, 'closed')}
                                            >
                                                <Clock3 className="h-3 w-3" /> Close
                                            </Button>
                                        )}

                                        <Button size="sm" variant="ghost" className="text-destructive ml-auto">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VolunteerManager;
