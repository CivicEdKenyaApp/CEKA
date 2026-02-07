import { supabase } from "@/integrations/supabase/client";

export interface ScraperSource {
    id: string;
    name: string;
    url: string;
    status: string;
    selector_config?: any;
    frequency_hours?: number;
    last_scraped_at: string | null;
}

export interface ProcessingJob {
    id: string;
    job_name: string;
    status: string;
    progress: number;
    current_step: string;
    error_message?: string;
    processing_logs?: any;
    created_at: string;
    completed_at?: string;
}

export const intelService = {
    /**
     * SCRAPER SOURCE MANAGEMENT
     */
    async getSources(): Promise<ScraperSource[]> {
        const { data, error } = await supabase
            .from('scraper_sources')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async updateSource(id: string, updates: Partial<ScraperSource>): Promise<void> {
        const { error } = await supabase
            .from('scraper_sources')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteSource(id: string): Promise<void> {
        const { error } = await supabase
            .from('scraper_sources')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * JOB MANAGEMENT
     */
    async getJobs(limit = 10): Promise<ProcessingJob[]> {
        const { data, error } = await supabase
            .from('processing_jobs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    async rerunJob(jobId: string): Promise<{ job_id: string }> {
        const { data, error } = await supabase.functions.invoke('manage-intel', {
            body: { action: 'rerun-job', jobId }
        });

        if (error) throw error;
        return data;
    },

    /**
     * PIPELINE CODE MANAGEMENT
     */
    async getPipelineScripts(): Promise<string[]> {
        const { data, error } = await supabase.functions.invoke('manage-intel', {
            body: { action: 'list-scripts' }
        });

        if (error) throw error;
        return data.scripts || [];
    },

    async getScriptContent(filename: string): Promise<string> {
        const { data, error } = await supabase.functions.invoke('manage-intel', {
            body: { action: 'get-script', filename }
        });

        if (error) throw error;
        return data.content || '';
    },

    async saveScriptContent(filename: string, content: string): Promise<void> {
        const { error } = await supabase.functions.invoke('manage-intel', {
            body: { action: 'save-script', filename, content }
        });

        if (error) throw error;
    },

    /**
     * PIPELINE EXECUTION
     */
    async triggerPipeline(params: { type: string, pages?: number }): Promise<any> {
        const { data, error } = await supabase.functions.invoke('process-url', {
            body: {
                url: 'INTERNAL://PIPELINE',
                data_type: params.type,
                options: { max_pages: params.pages || 3 }
            }
        });

        if (error) throw error;
        return data;
    }
};
