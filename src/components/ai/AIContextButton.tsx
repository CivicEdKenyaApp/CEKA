import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIContextButtonProps {
    label: string;
    context: string;
    className?: string;
    variant?: 'outline' | 'ghost' | 'secondary' | 'premium';
}

const AIContextButton = ({ label, context, className, variant = 'premium' }: AIContextButtonProps) => {
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
                className={cn(
                    "bg-gradient-to-r from-kenya-green/10 to-primary/10 hover:from-kenya-green/20 hover:to-primary/20 text-primary border-none font-bold gap-2 rounded-xl transition-all hover:scale-105 active:scale-95",
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
            onClick={handleClick}
            className={cn("gap-2 font-bold", className)}
        >
            <Sparkles className="h-4 w-4" />
            {label}
        </Button>
    );
};

export default AIContextButton;
