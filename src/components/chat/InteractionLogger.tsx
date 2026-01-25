import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

interface InteractionLoggerProps {
    targetId: string;
    targetType: 'message' | 'resource' | 'bill' | 'blog';
    metadata?: any;
}

export const InteractionLogger = ({ targetId, targetType, metadata = {} }: InteractionLoggerProps) => {
    const { user } = useAuth();
    const startTime = useRef<number>(Date.now());
    const hasLoggedInitial = useRef(false);

    useEffect(() => {
        if (!targetId || hasLoggedInitial.current) return;

        // Log Interaction event
        const logInteraction = async (action: string, extra: any = {}) => {
            let activeUserId = null;

            // Safety: Verify profile row exists before linking user_id to interaction
            if (user?.id) {
                const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
                if (profile) activeUserId = profile.id;
            }

            await supabase.from('chat_interactions' as any).insert({
                user_id: activeUserId,
                target_id: targetId,
                target_type: targetType,
                action_type: action,
                metadata: {
                    ...metadata,
                    ...extra,
                    ua: navigator.userAgent
                }
            });
        };

        logInteraction('view');
        hasLoggedInitial.current = true;

        // Detect Copy event (Interest indicator)
        const handleCopy = () => logInteraction('copy');

        // Detect Screenshot (approximate)
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen') logInteraction('screenshot');
        };

        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('copy', handleCopy);

        return () => {
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('copy', handleCopy);

            // Log dwell time on unmount
            const duration = Math.floor((Date.now() - startTime.current) / 1000);
            if (duration > 1) {
                supabase.from('chat_interactions' as any).insert({
                    user_id: user?.id || null,
                    target_id: targetId,
                    target_type: targetType,
                    action_type: 'dwell',
                    metadata: { ...metadata, seconds: duration }
                });
            }
        };
    }, [targetId, user?.id, targetType, metadata]);

    return null; // Silent logger
};
