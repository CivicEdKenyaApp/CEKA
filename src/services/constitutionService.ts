import { supabase } from '@/integrations/supabase/client';

export interface ConstitutionChapter {
    id: number;
    chapter_number: number;
    title_en: string;
    title_sw: string | null;
    created_at: string;
}

export interface ConstitutionSection {
    id: number;
    chapter_id: number;
    article_number: number;
    title_en: string;
    title_sw: string | null;
    content_en: string;
    content_sw: string | null;
    annotations: any | null;
    media_status: 'quarantined' | 'approved' | 'rejected';
    created_at: string;
}

export class ConstitutionService {
    /**
     * Fetch all chapters
     */
    static async getChapters(): Promise<ConstitutionChapter[]> {
        const { data, error } = await supabase
            .from('constitution_chapters')
            .select('*')
            .order('chapter_number', { ascending: true });

        if (error) {
            console.error('Error fetching chapters:', error);
            return [];
        }
        return data;
    }

    /**
     * Fetch sections for a specific chapter
     */
    static async getSectionsByChapter(chapterId: number): Promise<ConstitutionSection[]> {
        const { data, error } = await supabase
            .from('constitution_sections')
            .select('*')
            .eq('chapter_id', chapterId)
            .eq('media_status', 'approved')
            .order('article_number', { ascending: true });

        if (error) {
            console.error('Error fetching sections:', error);
            return [];
        }
        return data;
    }

    /**
     * Search constitution across all fields
     */
    static async searchConstitution(query: string) {
        const { data, error } = await supabase
            .from('constitution_sections')
            .select(`
        *,
        constitution_chapters (
          title_en,
          title_sw,
          chapter_number
        )
      `)
            .or(`content_en.ilike.%${query}%,content_sw.ilike.%${query}%,title_en.ilike.%${query}%,title_sw.ilike.%${query}%`)
            .eq('media_status', 'approved')
            .limit(20);

        if (error) {
            console.error('Error searching constitution:', error);
            return [];
        }
        return data;
    }
}

export const constitutionService = ConstitutionService;
