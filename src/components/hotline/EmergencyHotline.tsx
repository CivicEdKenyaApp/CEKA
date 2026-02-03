
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Phone,
    Copy,
    UserPlus,
    Share2,
    ShieldAlert,
    Search,
    CheckCircle2,
    ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Hotline {
    name: string;
    phone: string;
    description: string;
    organization: string;
}

const hotlines: Hotline[] = [
    {
        name: "Law Society of Kenya (LSK)",
        phone: "0800720434",
        description: "Legal representation and advocacy for justice.",
        organization: "LSK"
    },
    {
        name: "Defenders Coalition",
        phone: "0716200100",
        description: "Protection and support for human rights defenders.",
        organization: "Defenders Coalition"
    },
    {
        name: "Independent Medico-Legal Unit (IMLU)",
        phone: "0706162795",
        description: "Holistic support for victims of torture and police brutality.",
        organization: "IMLU"
    },
    {
        name: "Kenya National Commission on Human Rights (KNCHR)",
        phone: "0800720627",
        description: "State organ for human rights protection.",
        organization: "KNCHR"
    },
    {
        name: "Amnesty International Kenya",
        phone: "0759464346",
        description: "Global movement protecting human rights in Kenya.",
        organization: "Amnesty"
    },
    {
        name: "Civic Freedoms Forum (CFF)",
        phone: "0728303864",
        description: "Safeguarding civic space and assembly rights.",
        organization: "CFF"
    },
    {
        name: "Kenya Human Rights Commission (KHRC)",
        phone: "0728606583",
        description: "Grassroots human rights advocacy and monitoring.",
        organization: "KHRC"
    }
];

const EmergencyHotline = () => {
    const { toast } = useToast();

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: `${label} has been copied to your clipboard.`,
            duration: 2000,
        });
    };

    const generateVCard = (hotline: Hotline) => {
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${hotline.name}
ORG:${hotline.organization}
TEL;TYPE=CELL,VOICE:${hotline.phone}
NOTE:CEKA Emergency Hotline - Legal Support
END:VCARD`;

        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${hotline.organization.replace(/\s+/g, '_')}_Emergency.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Contact Downloaded",
            description: `Saving ${hotline.organization} to your device...`,
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-kenya-red/10 flex items-center justify-center">
                    <ShieldAlert className="h-6 w-6 text-kenya-red animate-pulse" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Emergency Legal Hotlines</h2>
                    <p className="text-slate-500 text-sm">Save these somewhere. We hope it doesn't come in handy.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotlines.map((hotline, idx) => (
                    <motion.div
                        key={hotline.phone}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="rounded-[2rem] border-none shadow-ios-high hover:shadow-2xl transition-all group overflow-hidden bg-white dark:bg-slate-900">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="outline" className="rounded-full px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider">
                                        {hotline.organization}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full hover:bg-kenya-green/10 text-slate-400 hover:text-kenya-green transition-colors"
                                        onClick={() => copyToClipboard(hotline.phone, hotline.name)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-kenya-green transition-colors">
                                        {hotline.name}
                                    </h3>
                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        {hotline.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <Button
                                        asChild
                                        className="flex-1 rounded-2xl bg-kenya-green hover:bg-primary text-white shadow-lg shadow-kenya-green/20 h-11"
                                    >
                                        <a href={`tel:${hotline.phone}`}>
                                            <Phone className="h-4 w-4 mr-2" />
                                            {hotline.phone}
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-2xl border-slate-200 dark:border-slate-800 h-11 px-3"
                                        onClick={() => generateVCard(hotline)}
                                        title="Add to Contacts"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Sharing Section */}
            <Card className="rounded-[2.5rem] border-none shadow-ios-high bg-gradient-to-br from-slate-900 to-slate-800 text-white mt-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-kenya-red/10 blur-[100px] -mr-32 -mt-32" />
                <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            Spread the Protection
                            <Share2 className="h-5 w-5 text-kenya-red" />
                        </h3>
                        <p className="text-slate-300">
                            Share this hotline list with your family and circles. In times of crisis,
                            immediate access to legal support can save lives.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10 px-8 h-12">
                            Download All (CSV)
                        </Button>
                        <Button className="rounded-2xl bg-white text-slate-900 hover:bg-slate-100 px-8 h-12 font-bold">
                            Share Contact Hub
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmergencyHotline;

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" }) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variant === "outline" ? "text-foreground border-slate-200" : "bg-primary text-primary-foreground",
            className
        )}>
            {children}
        </span>
    );
}
