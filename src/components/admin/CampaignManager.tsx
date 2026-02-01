
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
    Megaphone,
    Plus,
    Trash2,
    ExternalLink,
    Image as ImageIcon,
    Layout,
    ToggleLeft,
    ToggleRight,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CampaignManager = () => {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [form, setForm] = useState<any>({
        title: '',
        description: '',
        image_url: '',
        target_url: '',
        section_target: 'home_hero',
        is_active: true
    });
    const { toast } = useToast();

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const data = await adminService.getCampaigns();
            setCampaigns(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load campaigns", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.saveCampaign(form);
            toast({ title: "Success", description: "Campaign saved successfully." });
            setShowEditor(false);
            setForm({ title: '', description: '', image_url: '', target_url: '', section_target: 'home_hero', is_active: true });
            loadCampaigns();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save campaign", variant: "destructive" });
        }
    };

    const toggleCampaign = async (campaign: any) => {
        try {
            await adminService.saveCampaign({ ...campaign, is_active: !campaign.is_active });
            loadCampaigns();
        } catch (error) {
            toast({ title: "Error", description: "Failed to toggle campaign", variant: "destructive" });
        }
    };

    if (loading) return <div className="text-center py-10">Loading campaigns...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Campaign Control</h2>
                    <p className="text-sm text-muted-foreground">Manage in-app ad spots and strategic initiatives</p>
                </div>
                <Button onClick={() => setShowEditor(!showEditor)} className="gap-2">
                    {showEditor ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showEditor ? 'Cancel' : 'Create Campaign'}
                </Button>
            </div>

            <AnimatePresence>
                {showEditor && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-primary/20 bg-primary/5">
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Campaign Title</Label>
                                            <Input
                                                value={form.title}
                                                onChange={e => setForm({ ...form, title: e.target.value })}
                                                required
                                                placeholder="e.g. Constitutional Quiz 2026"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Target Section</Label>
                                            <Select
                                                value={form.section_target}
                                                onValueChange={v => setForm({ ...form, section_target: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="home_hero">Home Hero</SelectItem>
                                                    <SelectItem value="home_mid">Home Mid-Page</SelectItem>
                                                    <SelectItem value="blog_sidebar">Blog Sidebar</SelectItem>
                                                    <SelectItem value="constitution_footer">Constitution Footer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            placeholder="Brief call to action..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Image URL (Optional)</Label>
                                            <Input
                                                value={form.image_url}
                                                onChange={e => setForm({ ...form, image_url: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Target Link (External or Relative)</Label>
                                            <Input
                                                value={form.target_url}
                                                onChange={e => setForm({ ...form, target_url: e.target.value })}
                                                required
                                                placeholder="/quizzes or https://..."
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full">Activate Campaign</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {campaigns.map((camp) => (
                    <Card key={camp.id} className={`${!camp.is_active ? 'opacity-60 grayscale' : 'border-l-4 border-kenya-red'}`}>
                        <CardContent className="p-4 flex gap-4">
                            <div className="w-32 h-32 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                                {camp.image_url ? (
                                    <img src={camp.image_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Megaphone className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <Badge className="absolute top-1 left-1 scale-75 origin-top-left" variant="outline">
                                    {camp.section_target}
                                </Badge>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="flex items-start justify-between">
                                    <h4 className="font-bold text-lg">{camp.title}</h4>
                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => toggleCampaign(camp)}
                                        >
                                            {camp.is_active ? <ToggleRight className="text-kenya-green" /> : <ToggleLeft />}
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-2">
                                    {camp.description}
                                </p>
                                <div className="mt-auto flex items-center justify-between">
                                    <a href={camp.target_url} target="_blank" className="text-xs text-primary flex items-center gap-1 hover:underline">
                                        <ExternalLink className="h-3 w-3" /> {camp.target_url}
                                    </a>
                                    <span className="text-[10px] text-muted-foreground uppercase">
                                        Started {new Date(camp.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default CampaignManager;
