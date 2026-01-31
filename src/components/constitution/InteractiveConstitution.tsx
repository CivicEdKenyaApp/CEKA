import React, { useState, useEffect } from 'react';
import {
    ConstitutionService,
    ConstitutionChapter,
    ConstitutionSection
} from '@/services/constitutionService';
import { gamificationService } from '@/services/gamificationService';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Book,
    ChevronRight,
    ChevronDown,
    Languages,
    Trophy,
    Loader2,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const InteractiveConstitution = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [chapters, setChapters] = useState<ConstitutionChapter[]>([]);
    const [activeChapter, setActiveChapter] = useState<number | null>(null);
    const [sections, setSections] = useState<ConstitutionSection[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLanguageSwahili, setIsLanguageSwahili] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

    // Track progress to award points
    const [readCount, setReadCount] = useState(0);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            const data = await ConstitutionService.getChapters();
            setChapters(data);
            if (data.length > 0) {
                handleChapterClick(data[0].id);
            }
            setLoading(false);
        };
        fetchInitialData();
    }, []);

    const handleChapterClick = async (chapterId: number) => {
        if (activeChapter === chapterId) return;
        setLoading(true);
        setActiveChapter(chapterId);
        const data = await ConstitutionService.getSectionsByChapter(chapterId);
        setSections(data);
        setSearchQuery('');
        setSearchResults([]);
        setLoading(false);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);
        const outcomes = await ConstitutionService.searchConstitution(searchQuery);
        setSearchResults(outcomes);
        setActiveChapter(null);
        setLoading(false);
    };

    const toggleSection = (sectionId: number) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
            handleProgress(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const handleProgress = async (sectionId: number) => {
        if (!user) return;

        // Award points every 5 sections read
        const newCount = readCount + 1;
        setReadCount(newCount);

        if (newCount % 5 === 0) {
            const total = await gamificationService.awardPoints(user.id, 'chapter_read', { sectionId });
            if (total) {
                toast({
                    title: "Civic Milestone! 🏆",
                    description: `You've read 5 sections! +10 Points awarded. Total: ${total}`,
                    variant: "default",
                });
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and Language Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/30 p-4 rounded-xl border">
                <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search the Constitution..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background"
                    />
                </form>

                <div className="flex gap-2">
                    <Button
                        variant={isLanguageSwahili ? "outline" : "default"}
                        size="sm"
                        onClick={() => setIsLanguageSwahili(false)}
                        className="gap-2"
                    >
                        English
                    </Button>
                    <Button
                        variant={isLanguageSwahili ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsLanguageSwahili(true)}
                        className="gap-2"
                    >
                        <Languages className="h-4 w-4" />
                        Kiswahili
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chapters Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-4">Chapters</h3>
                    <div className="space-y-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                        {chapters.map((chapter) => (
                            <Button
                                key={chapter.id}
                                variant={activeChapter === chapter.id ? "default" : "ghost"}
                                className={`w-full justify-start text-left h-auto py-3 px-3 transition-colors ${activeChapter === chapter.id ? 'bg-primary shadow-lg shadow-primary/20' : ''}`}
                                onClick={() => handleChapterClick(chapter.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="font-bold shrink-0 opacity-50">{chapter.chapter_number}</span>
                                    <span className="text-xs font-medium leading-tight">
                                        {isLanguageSwahili && chapter.title_sw ? chapter.title_sw : chapter.title_en}
                                    </span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="animate-pulse">Loading Constitution content...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {searchResults.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                        Found {searchResults.length} matches for "{searchQuery}"
                                    </div>
                                    {searchResults.map((result) => (
                                        <ConstitutionItem
                                            key={result.id}
                                            section={result}
                                            isSwahili={isLanguageSwahili}
                                            isExpanded={expandedSections.has(result.id)}
                                            onToggle={() => toggleSection(result.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sections.map((section) => (
                                        <ConstitutionItem
                                            key={section.id}
                                            section={section}
                                            isSwahili={isLanguageSwahili}
                                            isExpanded={expandedSections.has(section.id)}
                                            onToggle={() => toggleSection(section.id)}
                                        />
                                    ))}
                                    {sections.length === 0 && !loading && (
                                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                            <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                            <p className="text-muted-foreground">This chapter content is coming soon.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Gamification Progress Bar (Mini) */}
            {user && (
                <div className="fixed bottom-20 right-8 z-40">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-primary text-white p-3 rounded-full shadow-2xl flex items-center gap-3"
                    >
                        <Trophy className="h-5 w-5" />
                        <div className="pr-2">
                            <p className="text-[10px] uppercase font-bold opacity-80 leading-none">Reading Streaks</p>
                            <p className="text-xs font-black">{readCount % 5}/5 to Bonus</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const ConstitutionItem = ({ section, isSwahili, isExpanded, onToggle }: any) => {
    const content = isSwahili && section.content_sw ? section.content_sw : section.content_en;
    const title = isSwahili && section.title_sw ? section.title_sw : section.title_en;

    return (
        <Card className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'border-primary shadow-md' : 'hover:border-primary/50'}`}>
            <CardHeader
                className="p-4 cursor-pointer flex flex-row items-center justify-between gap-4"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="h-8 w-8 rounded-full p-0 flex items-center justify-center font-bold text-primary border-primary/20 shrink-0">
                        {section.article_number === 0 ? 'P' : section.article_number}
                    </Badge>
                    <CardTitle className="text-base md:text-lg font-bold leading-tight">
                        {title}
                    </CardTitle>
                </div>
                {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
            </CardHeader>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <CardContent className="px-6 pb-6 pt-2 border-t bg-slate-50/50 dark:bg-white/5">
                            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {content}
                            </div>
                            <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold">
                                    Cite Article
                                </Button>
                                <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold text-primary">
                                    Share
                                </Button>
                            </div>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default InteractiveConstitution;
