import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIContextButtonProps {
    label: string;
    context: string;
    className?: string;
    variant?: 'outline' | 'ghost' | 'secondary' | 'premium';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const AIContextButton = ({ label, context, className, variant = 'premium', size = 'default' }: AIContextButtonProps) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Dispatch a custom event that GlobalAIAssistant will listen for
        const event = new CustomEvent('ceka-ai-trigger', {
            detail: {
                query: label === 'Summarize' ? `Summarize this legislative item for me: ${context}` : `Explain this article of the constitution: ${context}`,
                context: context
            }
        });
        window.dispatchEvent(event);
    };

    if (variant === 'premium') {
        return (
            <Button
                onClick={handleClick}
                size={size}
                className={cn(
                    "bg-kenya-green/10 dark:bg-kenya-green/20 hover:bg-kenya-green/20 dark:hover:bg-kenya-green/30 text-kenya-green dark:text-kenya-green border border-kenya-green/20 dark:border-kenya-green/30 font-bold gap-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm",
                    className
                )}
            >
                <Sparkles className="h-4 w-4 animate-pulse" />
                {label}
            </Button>
        );
    }

    return (
        <Button
            variant={variant as any}
            size={size}
            onClick={handleClick}
            className={cn("gap-2 font-bold", className)}
        >
            <Sparkles className="h-4 w-4" />
            {label}
        </Button>
    );
};

export default AIContextButton;
