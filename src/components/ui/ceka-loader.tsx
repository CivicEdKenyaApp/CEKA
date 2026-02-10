// CEKA Custom Loading Animation Component
// Premium loading states with Deep iOS-inspired styling & Kenya branding
// Highly optimized for performance (GPU-accelerated) and accessibility

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface CEKALoaderProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    variant?: 'default' | 'pulse' | 'orbit' | 'bars' | 'ios';
    showProgressMessages?: boolean;
}

// Brand Colors
const COLORS = {
    green: '#16a34a',
    red: '#dc2626',
    black: '#000000',
    white: '#ffffff',
};

const PROGRESS_MESSAGES = [
    "Loading CEKA Platform...",
    "Gathering civic insights...",
    "Preparing educational cards...",
    "You'll be there shortly...",
    "Loading...",
    "Crunching our code...",
    "Almost there...",
    "Revising our pages...",
    "Granting you access...",
];

export const CEKALoader: React.FC<CEKALoaderProps> = ({
    size = 'md',
    text,
    variant = 'default',
    showProgressMessages = false
}) => {
    const [messageIndex, setMessageIndex] = useState(0);
    const { theme } = useTheme();

    const logoSrc = theme === 'dark' ? '/logo-white.png' : '/logo-colored.png';

    useEffect(() => {
        if (!showProgressMessages) return;
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [showProgressMessages]);

    const displayMessage = text || (showProgressMessages ? PROGRESS_MESSAGES[messageIndex] : null);

    const sizes = {
        xs: { wrapper: 'w-8 h-8', icon: 16, text: 'text-[10px]' },
        sm: { wrapper: 'w-16 h-16', icon: 24, text: 'text-xs' },
        md: { wrapper: 'w-24 h-24', icon: 36, text: 'text-sm' },
        lg: { wrapper: 'w-32 h-32', icon: 48, text: 'text-base' },
        xl: { wrapper: 'w-48 h-48', icon: 64, text: 'text-lg' }
    };

    const s = sizes[size];

    // High-end spring for iOS feel
    const iosSpring = { type: "spring", stiffness: 300, damping: 30, mass: 1 };

    // Accessibility Wrapper
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div
            className="flex flex-col items-center justify-center gap-4"
            role="status"
            aria-busy="true"
        >
            {children}
            {displayMessage && (
                <AnimatePresence mode="wait">
                    <motion.p
                        key={displayMessage}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`${s.text} font-medium text-muted-foreground tracking-tight text-center max-w-[200px]`}
                        style={{ willChange: 'opacity, transform' }}
                    >
                        {displayMessage}
                    </motion.p>
                </AnimatePresence>
            )}
            <span className="sr-only">Loading...</span>
        </div>
    );

    if (variant === 'ios') {
        const segments = 12;
        return (
            <Wrapper>
                <div className={`${s.wrapper} relative flex items-center justify-center`}>
                    {[...Array(segments)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-current rounded-full"
                            style={{
                                width: '10%',
                                height: '28%',
                                top: '36%',
                                left: '45%',
                                transformOrigin: 'center -100%',
                                borderRadius: '1rem',
                                color: i % 4 === 0 ? COLORS.green : (i % 4 === 2 ? COLORS.red : COLORS.black),
                                opacity: 0.2
                            }}
                            animate={{
                                opacity: [0.2, 1, 0.2],
                                transform: `rotate(${i * (360 / segments)}deg) translateY(-80%)`,
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * (0.8 / segments),
                                ease: "linear"
                            }}
                        />
                    ))}
                </div>
            </Wrapper>
        );
    }

    if (variant === 'bars') {
        return (
            <Wrapper>
                <div className="flex items-end gap-1.5 h-10">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2.5 rounded-full"
                            style={{
                                background: `linear-gradient(to bottom, ${COLORS.red}, ${COLORS.black}, ${COLORS.green})`,
                                willChange: 'transform',
                            }}
                            animate={{
                                scaleY: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>
            </Wrapper>
        );
    }

    if (variant === 'pulse') {
        return (
            <Wrapper>
                <div className={`${s.wrapper} relative flex items-center justify-center`}>
                    <motion.div
                        className="absolute inset-0 rounded-full bg-kenya-green/10"
                        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{ willChange: 'transform, opacity' }}
                    />
                    <motion.div
                        className="absolute inset-0 rounded-full border border-kenya-red/20"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
                        style={{ willChange: 'transform, opacity' }}
                    />
                    <div className="relative z-10 flex items-center justify-center">
                        <img
                            src={logoSrc}
                            alt="CEKA"
                            className={cn(
                                "object-contain transition-all duration-500",
                                size === 'xs' ? 'h-4' : size === 'sm' ? 'h-6' : size === 'md' ? 'h-10' : size === 'lg' ? 'h-14' : 'h-20'
                            )}
                        />
                    </div>
                </div>
            </Wrapper>
        );
    }

    if (variant === 'orbit') {
        return (
            <Wrapper>
                <div className={`${s.wrapper} relative flex items-center justify-center`}>
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ rotateZ: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{ perspective: 1000, willChange: 'transform' }}
                    >
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="absolute"
                                style={{
                                    transform: `rotateZ(${i * 120}deg) translateY(-35px)`
                                }}
                            >
                                <motion.div
                                    className="w-4 h-4 rounded-full blur-[1px]"
                                    style={{
                                        backgroundColor: [COLORS.green, COLORS.black, COLORS.red][i],
                                        boxShadow: `0 0 10px ${[COLORS.green, COLORS.black, COLORS.red][i]}40`
                                    }}
                                    animate={{ scale: [0.8, 1.2, 0.8] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                                />
                            </div>
                        ))}
                    </motion.div>
                    <div className="relative z-10 flex items-center justify-center scale-75">
                        <img
                            src={logoSrc}
                            alt="CEKA"
                            className={cn(
                                "object-contain",
                                size === 'xs' ? 'h-3' : size === 'sm' ? 'h-5' : size === 'md' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-16'
                            )}
                        />
                    </div>
                </div>
            </Wrapper>
        );
    }

    // Default Triple Ring - Highly Refined
    return (
        <Wrapper>
            <div className={`${s.wrapper} relative flex items-center justify-center`}>
                <motion.div
                    className="absolute inset-0 rounded-full border-[3px] border-kenya-green/10"
                    style={{ borderTopColor: COLORS.green, willChange: 'transform' }}
                    animate={{ rotateZ: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute inset-3 rounded-full border-[3px] border-black/5 dark:border-white/5"
                    style={{ borderTopColor: COLORS.black, willChange: 'transform' }}
                    animate={{ rotateZ: -360 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute inset-6 rounded-full border-[3px] border-kenya-red/10"
                    style={{ borderTopColor: COLORS.red, willChange: 'transform' }}
                    animate={{ rotateZ: 360 }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <img
                        src={logoSrc}
                        alt="CEKA"
                        className={cn(
                            "object-contain",
                            size === 'xs' ? 'h-3' : size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-10' : 'h-14'
                        )}
                    />
                </motion.div>
            </div>
        </Wrapper>
    );
};

export const CEKACardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-card rounded-2xl p-6 shadow-sm border border-border/40 ${className}`}>
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-muted rounded-full" />
            <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded-full w-3/4" />
                <div className="h-3 bg-muted rounded-full w-1/2" />
            </div>
        </div>
        <div className="space-y-3">
            <div className="h-3 bg-muted rounded-full w-full" />
            <div className="h-3 bg-muted rounded-full w-full" />
            <div className="h-3 bg-muted rounded-full w-5/6" />
        </div>
        <div className="mt-8 h-10 bg-muted rounded-xl w-full" />
    </div>
);

export const CEKAImagePlaceholder: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br from-kenya-green/5 via-background to-kenya-red/5 flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 backdrop-blur-[2px] opacity-20" />
        <CEKALoader size="xs" variant="pulse" text="" />
    </div>
);

export const CEKAFullLoader: React.FC<{ message?: string }> = ({ message }) => (
    <AnimatePresence>
        <motion.div
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-2xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
            <motion.div
                className="p-12 rounded-[40px] bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/10 shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.5, ease: "circOut" }}
            >
                <CEKALoader size="lg" variant="default" text={message} showProgressMessages={!message} />
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

export default CEKALoader;
