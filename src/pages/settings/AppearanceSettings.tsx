
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Sun, Moon, Laptop, Eye } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

const AppearanceSettings = () => {
    const { theme, toggleTheme } = useTheme();
    const { language } = useLanguage();
    const [textSize, setTextSize] = React.useState(100);
    const [highContrast, setHighContrast] = React.useState(false);
    const [autoplayMedia, setAutoplayMedia] = React.useState(false);

    return (
        <div className="space-y-6">
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
                        <Slider
                            id="text-size"
                            min={80}
                            max={150}
                            step={10}
                            value={[textSize]}
                            onValueChange={(values) => setTextSize(values[0])}
                            className="py-4"
                        />
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
        </div>
    );
};

export default AppearanceSettings;
