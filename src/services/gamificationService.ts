import { supabase } from '@/integrations/supabase/client';

export type PointAction =
    | 'quiz_pass'
    | 'perfect_quiz'
    | 'chapter_read'
    | 'profile_complete'
    | 'resource_published'
    | 'volunteer_signup';

const SCORING_MAP: Record<PointAction, number> = {
    quiz_pass: 100,
    perfect_quiz: 150,
    chapter_read: 10,
    profile_complete: 25,
    resource_published: 50,
    volunteer_signup: 30
};

export class GamificationService {
    /**
     * Award points to a user for a specific action
     */
    static async awardPoints(userId: string, action: PointAction, metadata: any = {}): Promise<number | null> {
        try {
            const amount = SCORING_MAP[action];

            const { data, error } = await supabase.rpc('add_user_points', {
                p_user_id: userId,
                p_amount: amount,
                p_action: action,
                p_description: `Earned points for ${action.replace('_', ' ')}`,
                p_metadata: metadata
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error awarding points:', error);
            return null;
        }
    }

    /**
     * Get current user's points and rank
     */
    static async getUserStats(userId: string) {
        const { data, error } = await supabase
            .from('user_points')
            .select('*, rank')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching user stats:', error);
            return null;
        }
        return data;
    }

    /**
     * Get top ranked users
     */
    static async getLeaderboard(limit = 10) {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .limit(limit);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
        return data;
    }

    /**
     * Get points history for a user
     */
    static async getPointsHistory(userId: string, limit = 20) {
        const { data, error } = await supabase
            .from('points_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching points history:', error);
            return [];
        }
        return data;
    }
}

export const gamificationService = GamificationService;
