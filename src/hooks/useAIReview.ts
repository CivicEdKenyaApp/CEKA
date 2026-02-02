import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GeneratedArticle {
    id: string;
    topic_id: string;
    title: string;
    excerpt: string;
    content: string;
    status: 'draft' | 'submitted' | 'approved' | 'published' | 'rejected';
    meta_description?: string;
    seo_keywords: string[];
    review_notes?: string;
    created_at: string;
    tone_id?: string;
}

export function useAIReview() {
    const [drafts, setDrafts] = useState<GeneratedArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchDrafts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('generated_articles')
                .select('*')
                .in('status', ['draft', 'submitted'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDrafts(data || []);
        } catch (err: any) {
            console.error('Error fetching AI drafts:', err);
            toast({
                title: "Error",
                description: "Failed to load AI drafts",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const approveArticle = async (id: string) => {
        try {
            // First, update the generated article status
            const { error } = await supabase
                .from('generated_articles')
                .update({ status: 'approved' })
                .eq('id', id);

            if (error) throw error;

            // Optional: Move to blog table or just rely on a view. 
            // For now, let's assume BlogManagement still uses the 'posts' table.
            // We can add logic to 'promote' this to a real blog post.

            toast({
                title: "Approved",
                description: "Article ready for final publication"
            });

            fetchDrafts();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            });
        }
    };

    const rejectArticle = async (id: string, notes: string) => {
        try {
            const { error } = await supabase
                .from('generated_articles')
                .update({ status: 'rejected', review_notes: notes })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Rejected",
                description: "Article moved to rejected state"
            });

            fetchDrafts();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            });
        }
    };

    const promoteToBlogPost = async (article: GeneratedArticle) => {
        try {
            const slug = article.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            const { error: blogError } = await supabase
                .from('blog_posts')
                .insert([{
                    title: article.title,
                    slug,
                    content: article.content,
                    excerpt: article.excerpt,
                    status: 'published',
                    published_at: new Date().toISOString(),
                    meta_description: article.meta_description,
                    seo_keywords: article.seo_keywords,
                    author: 'CEKA AI'
                }]);

            if (blogError) throw blogError;

            const { error: updateError } = await supabase
                .from('generated_articles')
                .update({ status: 'published' })
                .eq('id', article.id);

            if (updateError) throw updateError;

            toast({
                title: "Published",
                description: "Article is now live on the blog!"
            });

            fetchDrafts();
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Failed to publish blog post: " + err.message,
                variant: "destructive"
            });
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, []);

    return {
        drafts,
        loading,
        fetchDrafts,
        approveArticle,
        rejectArticle,
        promoteToBlogPost
    };
}
