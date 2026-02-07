/**
 * Accessibility Context
 * 
 * Provides global accessibility settings that can be consumed throughout the app.
 * Manages text scaling, high contrast mode, and autoplay preferences.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
    textScale: number;
    highContrast: boolean;
    autoplayMedia: boolean;
    reducedMotion: boolean;
}

interface AccessibilityContextValue extends AccessibilitySettings {
    setTextScale: (scale: number) => void;
    setHighContrast: (enabled: boolean) => void;
    setAutoplayMedia: (enabled: boolean) => void;
    setReducedMotion: (enabled: boolean) => void;
    resetToDefaults: () => void;
}

const defaultSettings: AccessibilitySettings = {
    textScale: 100,
    highContrast: false,
    autoplayMedia: false,
    reducedMotion: false
};

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
    TEXT_SCALE: 'ceka_text_size',
    HIGH_CONTRAST: 'ceka_high_contrast',
    AUTOPLAY_MEDIA: 'ceka_autoplay_media',
    REDUCED_MOTION: 'ceka_reduced_motion'
};

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        if (typeof window === 'undefined') return defaultSettings;

        return {
            textScale: parseInt(localStorage.getItem(STORAGE_KEYS.TEXT_SCALE) || '100', 10),
            highContrast: localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST) === 'true',
            autoplayMedia: localStorage.getItem(STORAGE_KEYS.AUTOPLAY_MEDIA) === 'true',
            reducedMotion: localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION) === 'true' ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
    });

    // Apply text scale
    useEffect(() => {
        document.documentElement.style.setProperty('--text-scale', `${settings.textScale / 100}`);
        document.documentElement.style.fontSize = `${settings.textScale}%`;
        localStorage.setItem(STORAGE_KEYS.TEXT_SCALE, settings.textScale.toString());
    }, [settings.textScale]);

    // Apply high contrast
    useEffect(() => {
        if (settings.highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
        localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, settings.highContrast.toString());
    }, [settings.highContrast]);

    // Store autoplay preference
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.AUTOPLAY_MEDIA, settings.autoplayMedia.toString());
        window.dispatchEvent(new CustomEvent('autoplaySettingChange', { detail: { autoplay: settings.autoplayMedia } }));
    }, [settings.autoplayMedia]);

    // Apply reduced motion
    useEffect(() => {
        if (settings.reducedMotion) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
        localStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, settings.reducedMotion.toString());
    }, [settings.reducedMotion]);

    const setTextScale = (scale: number) => {
        setSettings(prev => ({ ...prev, textScale: Math.min(150, Math.max(80, scale)) }));
    };

    const setHighContrast = (enabled: boolean) => {
        setSettings(prev => ({ ...prev, highContrast: enabled }));
    };

    const setAutoplayMedia = (enabled: boolean) => {
        setSettings(prev => ({ ...prev, autoplayMedia: enabled }));
    };

    const setReducedMotion = (enabled: boolean) => {
        setSettings(prev => ({ ...prev, reducedMotion: enabled }));
    };

    const resetToDefaults = () => {
        setSettings(defaultSettings);
    };

    return (
        <AccessibilityContext.Provider
            value={{
                ...settings,
                setTextScale,
                setHighContrast,
                setAutoplayMedia,
                setReducedMotion,
                resetToDefaults
            }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = (): AccessibilityContextValue => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};

export default AccessibilityContext;
