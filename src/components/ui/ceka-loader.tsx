// CEKA Custom Loading Animation Component
// Premium loading states with Kenya-themed styling

import React from 'react';
import { motion } from 'framer-motion';

interface CEKALoaderProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    variant?: 'default' | 'pulse' | 'orbit' | 'bars';
}

export const CEKALoader: React.FC<CEKALoaderProps> = ({
    size = 'md',
    text = 'Loading...',
    variant = 'default'
}) => {
    const sizes = {
        sm: { wrapper: 'w-16 h-16', icon: 24, text: 'text-xs' },
        md: { wrapper: 'w-24 h-24', icon: 36, text: 'text-sm' },
        lg: { wrapper: 'w-32 h-32', icon: 48, text: 'text-base' }
    };

    const s = sizes[size];

    if (variant === 'bars') {
        return (
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex items-end gap-1 h-8">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 rounded-full"
                            style={{
                                background: `linear-gradient(to top, #16a34a, #dc2626)`,
                            }}
                            animate={{
                                height: ['12px', '32px', '12px'],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>
                {text && <p className={`${s.text} text-muted-foreground`}>{text}</p>}
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div className="flex flex-col items-center justify-center gap-4">
                <div className={`${s.wrapper} relative flex items-center justify-center`}>
                    <motion.div
                        className="absolute inset-0 rounded-full bg-kenya-green/20"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute inset-2 rounded-full bg-kenya-red/20"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <div className="relative z-10 font-bold text-lg">
                        <span className="text-kenya-green">C</span>
                        <span className="text-kenya-red">E</span>
                        <span className="text-black dark:text-white">K</span>
                        <span className="text-kenya-green">A</span>
                    </div>
                </div>
                {text && <p className={`${s.text} text-muted-foreground`}>{text}</p>}
            </div>
        );
    }

    if (variant === 'orbit') {
        return (
            <div className="flex flex-col items-center justify-center gap-4">
                <div className={`${s.wrapper} relative flex items-center justify-center`}>
                    {/* Orbiting dots */}
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                                backgroundColor: ['#16a34a', '#000000', '#dc2626'][i],
                            }}
                            animate={{
                                rotate: 360,
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                                delay: i * 0.3,
                            }}
                            initial={{
                                x: Math.cos((i * 2 * Math.PI) / 3) * 30,
                                y: Math.sin((i * 2 * Math.PI) / 3) * 30,
                            }}
                        />
                    ))}
                    {/* Center logo */}
                    <div className="relative z-10 font-bold">
                        <span className="text-kenya-green">⚖</span>
                    </div>
                </div>
                {text && <p className={`${s.text} text-muted-foreground`}>{text}</p>}
            </div>
        );
    }

    // Default spinner with Kenya colors
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${s.wrapper} relative`}>
                {/* Outer ring - Green */}
                <motion.div
                    className="absolute inset-0 rounded-full border-4 border-kenya-green/30"
                    style={{ borderTopColor: '#16a34a' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                {/* Middle ring - Black */}
                <motion.div
                    className="absolute inset-2 rounded-full border-4 border-black/20 dark:border-white/20"
                    style={{ borderTopColor: '#000000' }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                {/* Inner ring - Red */}
                <motion.div
                    className="absolute inset-4 rounded-full border-4 border-kenya-red/30"
                    style={{ borderTopColor: '#dc2626' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                {/* Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className="text-xs font-bold"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        CEKA
                    </motion.span>
                </div>
            </div>
            {text && (
                <motion.p
                    className={`${s.text} text-muted-foreground`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

// Skeleton loader for cards
export const CEKACardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/2 mb-4" />
        <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6" />
        </div>
    </div>
);

// Image placeholder with CEKA branding
export const CEKAImagePlaceholder: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`bg-gradient-to-br from-kenya-green/10 via-black/5 to-kenya-red/10 flex items-center justify-center ${className}`}>
        <CEKALoader size="sm" variant="pulse" text="" />
    </div>
);

// Full-page loading overlay
export const CEKAFullLoader: React.FC<{ message?: string }> = ({ message = 'Loading CEKA Platform...' }) => (
    <motion.div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <div className="text-center">
            <CEKALoader size="lg" variant="default" text={message} />
        </div>
    </motion.div>
);

export default CEKALoader;
