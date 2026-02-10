import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Sun, Moon, Laptop, Eye, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { CEKALoader } from '@/components/ui/ceka-loader';

// Local storage keys
const STORAGE_KEYS = {
    TEXT_SIZE: 'ceka_text_size',
    HIGH_CONTRAST: 'ceka_high_contrast',
    AUTOPLAY_MEDIA: 'ceka_autoplay_media'
};

const AppearanceSettings = () => {
    const { theme, toggleTheme } = useTheme();
    const { language } = useLanguage();
    const { toast } = useToast();
    const { session } = useAuth();

    // Load from localStorage with defaults
    const [textSize, setTextSize] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.TEXT_SIZE);
        return stored ? parseInt(stored, 10) : 100;
    });

    const [highContrast, setHighContrast] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST);
        return stored === 'true';
    });

    const [autoplayMedia, setAutoplayMedia] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.AUTOPLAY_MEDIA);
        return stored === 'true';
    });

    const [saving, setSaving] = useState(false);

    // Apply text size to document
    useEffect(() => {
        document.documentElement.style.setProperty('--text-scale', `${textSize / 100}`);
        document.documentElement.style.fontSize = `${textSize}%`;
        localStorage.setItem(STORAGE_KEYS.TEXT_SIZE, textSize.toString());
    }, [textSize]);

    // Apply high contrast mode
    useEffect(() => {
        if (highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
        localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, highContrast.toString());
    }, [highContrast]);

    // Store autoplay preference
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.AUTOPLAY_MEDIA, autoplayMedia.toString());
        // Dispatch custom event for video components to listen to
        window.dispatchEvent(new CustomEvent('autoplaySettingChange', { detail: { autoplay: autoplayMedia } }));
    }, [autoplayMedia]);

    // Sync preferences to Supabase profiles table
    const syncToDatabase = async () => {
        if (!session?.user?.id) return;

        setSaving(true);
        try {
            const { error } = await (supabase
                .from('profiles' as any) as any)
                .upsert({
                    id: session.user.id,
                    preferences: {
                        text_size: textSize,
                        high_contrast: highContrast,
                        autoplay_media: autoplayMedia,
                        theme: theme
                    },
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            toast({
                title: translate("Settings saved", language),
                description: translate("Your appearance preferences have been updated.", language),
            });
        } catch (err: any) {
            console.error('Failed to sync preferences:', err);
        } finally {
            setSaving(false);
        }
    };

    // Load preferences from database on mount
    useEffect(() => {
        const loadFromDatabase = async () => {
            if (!session?.user?.id) return;

            try {
                const { data, error } = await (supabase
                    .from('profiles' as any) as any)
                    .select('preferences')
                    .eq('id', session.user.id)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                if (data?.preferences) {
                    const prefs = data.preferences as any;
                    if (prefs.text_size) setTextSize(prefs.text_size);
                    if (prefs.high_contrast !== undefined) setHighContrast(prefs.high_contrast);
                    if (prefs.autoplay_media !== undefined) setAutoplayMedia(prefs.autoplay_media);
                }
            } catch (err) {
                console.error('Failed to load preferences:', err);
            }
        };

        loadFromDatabase();
    }, [session]);

    // Auto-sync after changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            syncToDatabase();
        }, 1500);

        return () => clearTimeout(timer);
    }, [textSize, highContrast, autoplayMedia]);

    return (
        <div className="space-y-6">
            {/* Saving indicator */}
            {saving && (
                <div className="fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <CEKALoader variant="ios" size="sm" />
                    <span className="text-xs font-medium">{translate("Saving...", language)}</span>
                </div>
            )}

            <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Sun className="h-5 w-5 text-amber-500" />
                        {translate("Theme", language)}
                    </CardTitle>
                    <CardDescription>
                        {translate("Choose how CEKA looks on your device.", language)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <RadioGroup defaultValue={theme} className="grid grid-cols-3 gap-4">
                        <div>
                            <RadioGroupItem
                                value="light"
                                id="theme-light"
                                className="peer sr-only"
                                onClick={() => theme !== 'light' && toggleTheme()}
                            />
                            <Label
                                htmlFor="theme-light"
                                className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-muted bg-slate-50 dark:bg-slate-800 p-4 hover:bg-accent cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                            >
                                <Sun className="h-6 w-6" />
                                <span className="text-xs font-bold uppercase tracking-wider">{translate("Light", language)}</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem
                                value="dark"
                                id="theme-dark"
                                className="peer sr-only"
                                onClick={() => theme !== 'dark' && toggleTheme()}
                            />
                            <Label
                                htmlFor="theme-dark"
                                className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-muted bg-slate-50 dark:bg-slate-800 p-4 hover:bg-accent cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                            >
                                <Moon className="h-6 w-6" />
                                <span className="text-xs font-bold uppercase tracking-wider">{translate("Dark", language)}</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem
                                value="system"
                                id="theme-system"
                                className="peer sr-only"
                            />
                            <Label
                                htmlFor="theme-system"
                                className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-muted bg-slate-50 dark:bg-slate-800 p-4 hover:bg-accent cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                            >
                                <Laptop className="h-6 w-6" />
                                <span className="text-xs font-bold uppercase tracking-wider">{translate("System", language)}</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        {translate("Accessibility", language)}
                    </CardTitle>
                    <CardDescription>
                        {translate("Adjust visual settings for better readability.", language)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="text-size" className="font-bold">{translate("Text Size", language)}</Label>
                            <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{textSize}%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-muted-foreground">A</span>
                            <Slider
                                id="text-size"
                                min={80}
                                max={150}
                                step={10}
                                value={[textSize]}
                                onValueChange={(values) => setTextSize(values[0])}
                                className="flex-1"
                            />
                            <span className="text-lg font-medium text-muted-foreground">A</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {translate("This will scale all text across the site.", language)}
                        </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                        <div className="space-y-0.5">
                            <Label htmlFor="high-contrast" className="font-bold">{translate("High Contrast", language)}</Label>
                            <p className="text-xs text-muted-foreground">{translate("Increase contrast for better readability", language)}</p>
                        </div>
                        <Switch
                            id="high-contrast"
                            checked={highContrast}
                            onCheckedChange={setHighContrast}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                        <div className="space-y-0.5">
                            <Label htmlFor="autoplay-media" className="font-bold">{translate("Autoplay Media", language)}</Label>
                            <p className="text-xs text-muted-foreground">{translate("Automatically play videos and animations", language)}</p>
                        </div>
                        <Switch
                            id="autoplay-media"
                            checked={autoplayMedia}
                            onCheckedChange={setAutoplayMedia}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="rounded-[2.5rem] border-none shadow-ios-high overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{translate("Preview", language)}</p>
                    <p className="text-base font-medium" style={{ fontSize: `calc(1rem * ${textSize / 100})` }}>
                        {translate("This is how your text will appear across the site.", language)}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default AppearanceSettings;
