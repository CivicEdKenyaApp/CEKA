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
    analysis_score?: number;
    verification_metrics?: any;
}

export function useAIReview() {
    const [drafts, setDrafts] = useState<GeneratedArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchDrafts = async () => {
        try {
            setLoading(true);
            const { data, error } = await (supabase.from('generated_articles' as any) as any)
                .select('*')
                .in('status', ['draft', 'submitted'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDrafts((data as any) || []);
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
            const { error } = await (supabase.from('generated_articles' as any) as any)
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
            const { error } = await (supabase.from('generated_articles' as any) as any)
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
            setLoading(true);

            // 1. Generate a URL-friendly slug
            let slug = article.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            // Ensure slug uniqueness (simple append)
            const { data: existing } = await supabase
                .from('blog_posts')
                .select('slug')
                .eq('slug', slug)
                .single();

            if (existing) {
                slug = `${slug}-${Date.now().toString().slice(-4)}`;
            }

            // 2. Prepare the Payload (FULL MAPPING)
            const blogPostPayload = {
                title: article.title,
                slug: slug,
                content: article.content, // preserving HTML
                excerpt: article.excerpt,
                status: 'published',
                published_at: new Date().toISOString(),
                author: 'CEKA', // Default author for AI content
                // Map SEO keywords to tags if possible, or just leave as null if schema differs
                tags: article.seo_keywords || [],
                // We'll trust the DB to handle missing fields gracefully or add them if schema allows
                // For now, mapping known fields from our schema check
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // 3. Insert into Live Table
            const { error: blogError } = await supabase
                .from('blog_posts')
                .insert([blogPostPayload]);

            if (blogError) throw blogError;

            // 4. Update the Draft Status to 'published'
            const { error: updateError } = await (supabase.from('generated_articles' as any) as any)
                .update({ status: 'published' })
                .eq('id', article.id);

            if (updateError) throw updateError;

            toast({
                title: "🚀 WE ARE LIVE!",
                description: `Article published successfully to /blog/${slug}`,
                className: "bg-green-500 text-white border-none"
            });

            fetchDrafts();
        } catch (err: any) {
            console.error("Publishing Error:", err);
            toast({
                title: "Publishing Failed",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const bulkPublishApproved = async () => {
        try {
            setLoading(true);
            const approvedDrafts = drafts.filter(d => d.status === 'draft' || d.status === 'submitted');

            if (approvedDrafts.length === 0) {
                toast({ title: "Operation Aborted", description: "No approved drafts available for bulk publishing." });
                return;
            }

            toast({ title: "Bulk Sync Initiated", description: `Processing ${approvedDrafts.length} articles...` });

            for (const article of approvedDrafts) {
                await promoteToBlogPost(article);
            }

            toast({
                title: "Invasion Successful",
                description: `Successfully pushed ${approvedDrafts.length} articles to live production.`
            });

            fetchDrafts();
        } catch (err: any) {
            toast({
                title: "Bulk Sync Failed",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
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
        promoteToBlogPost,
        bulkPublishApproved
    };
}
