// Intel Service - Legislative Intelligence Pipeline Management
// Handles CORS-safe communication with Edge Functions

import { supabase } from '@/integrations/supabase/client';

export interface ScraperSource {
    id: string;
    name: string;
    url: string;
    is_active: boolean;
    last_scraped_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProcessingJob {
    id: string;
    source_id?: string;
    job_type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    total_items?: number;
    processed_items?: number;
    error_message?: string;
    started_at?: string;
    completed_at?: string;
    created_at: string;
    // Extra metadata
    logs?: string[];
    metadata?: Record<string, any>;
}

export interface PipelineConfig {
    type: 'bills' | 'gazette' | 'healthcare' | 'custom';
    targetUrl?: string;
    options?: Record<string, any>;
}

class IntelService {
    private corsHeaders = {
        'Content-Type': 'application/json'
    };

    // Get all scraper sources
    async getSources(): Promise<ScraperSource[]> {
        try {
            const { data, error } = await supabase
                .from('scraper_sources' as any)
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching sources:', error);
                return this.getMockSources();
            }

            return (data as unknown as ScraperSource[]) || this.getMockSources();
        } catch (error) {
            console.error('Error fetching sources:', error);
            return this.getMockSources();
        }
    }

    // Get recent jobs
    async getJobs(limit: number = 10): Promise<ProcessingJob[]> {
        try {
            const { data, error } = await supabase
                .from('processing_jobs' as any)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching jobs:', error);
                return this.getMockJobs();
            }

            return (data as unknown as ProcessingJob[]) || this.getMockJobs();
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return this.getMockJobs();
        }
    }

    // Get pipeline scripts list
    async getPipelineScripts(): Promise<string[]> {
        try {
            const { data, error } = await supabase.functions.invoke('manage-intel', {
                body: { action: 'list-scripts' }
            });

            if (error) {
                console.error('Error loading scripts:', error);
                return ['bills_pipeline.py', 'gazette_pipeline.py', 'healthcare_pipeline.py'];
            }

            return data?.scripts || ['bills_pipeline.py', 'gazette_pipeline.py', 'healthcare_pipeline.py'];
        } catch (error) {
            console.error('Error loading scripts:', error);
            return ['bills_pipeline.py', 'gazette_pipeline.py', 'healthcare_pipeline.py'];
        }
    }

    // Get script content
    async getScriptContent(name: string): Promise<string> {
        try {
            const { data, error } = await supabase.functions.invoke('manage-intel', {
                body: { action: 'get-script', name }
            });

            if (error) {
                console.error('Error loading script content:', error);
                return this.getMockScriptContent(name);
            }

            return data?.content || this.getMockScriptContent(name);
        } catch (error) {
            console.error('Error loading script content:', error);
            return this.getMockScriptContent(name);
        }
    }

    // Save script content
    async saveScriptContent(name: string, content: string): Promise<void> {
        try {
            const { error } = await supabase.functions.invoke('manage-intel', {
                body: { action: 'save-script', name, content }
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving script:', error);
            throw new Error('Failed to save script. Check Edge Function deployment.');
        }
    }

    // Trigger pipeline
    async triggerPipeline(config: PipelineConfig): Promise<{ jobId: string }> {
        try {
            // Create job record locally first
            const { data, error: jobError } = await supabase
                .from('processing_jobs' as any)
                .insert({
                    job_type: `${config.type}_crawl`,
                    status: 'pending',
                    progress: 0,
                    metadata: {
                        data_type: config.type,
                        target_url: config.targetUrl || 'INTERNAL://PIPELINE',
                        crawl_start: new Date().toISOString()
                    }
                })
                .select('id')
                .single();

            if (jobError) {
                console.error('Error creating job:', jobError);
                throw new Error('Failed to create job record');
            }

            const job = data as unknown as { id: string };

            // Try to trigger edge function (may fail due to CORS in dev)
            try {
                await supabase.functions.invoke('manage-intel', {
                    body: { action: 'trigger-pipeline', type: config.type, jobId: job.id }
                });
            } catch (edgeFnError) {
                console.warn('Edge function trigger failed, job created for manual processing:', edgeFnError);
            }

            return { jobId: job.id };
        } catch (error) {
            console.error('Error triggering pipeline:', error);
            throw error;
        }
    }

    // Rerun a job
    async rerunJob(jobId: string): Promise<void> {
        try {
            // Get original job
            const { data, error: fetchError } = await supabase
                .from('processing_jobs' as any)
                .select('*')
                .eq('id', jobId)
                .single();

            if (fetchError) throw fetchError;

            const originalJob = data as unknown as ProcessingJob;

            // Create new job based on original
            const { error: createError } = await supabase
                .from('processing_jobs' as any)
                .insert({
                    job_type: originalJob.job_type,
                    source_id: originalJob.source_id,
                    status: 'pending',
                    progress: 0,
                    metadata: {
                        ...(originalJob.metadata || {}),
                        rerun_of: jobId,
                        crawl_start: new Date().toISOString()
                    }
                });

            if (createError) throw createError;

            // Try edge function
            try {
                await supabase.functions.invoke('manage-intel', {
                    body: { action: 'rerun-job', jobId }
                });
            } catch (edgeFnError) {
                console.warn('Edge function rerun failed, job queued for manual processing');
            }
        } catch (error) {
            console.error('Error rerunning job:', error);
            throw error;
        }
    }

    // Update source
    async updateSource(id: string, updates: Partial<ScraperSource>): Promise<void> {
        const { error } = await supabase
            .from('scraper_sources' as any)
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    }

    // Delete source
    async deleteSource(id: string): Promise<void> {
        const { error } = await supabase
            .from('scraper_sources' as any)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // Mock data for when tables/functions don't exist
    private getMockSources(): ScraperSource[] {
        return [
            {
                id: 'src-1',
                name: 'Kenya Gazette',
                url: 'http://kenyalaw.org/kenya_gazette/',
                is_active: true,
                last_scraped_at: new Date(Date.now() - 86400000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'src-2',
                name: 'National Assembly Bills',
                url: 'http://www.parliament.go.ke/the-national-assembly/house-business/bills',
                is_active: true,
                last_scraped_at: new Date(Date.now() - 172800000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'src-3',
                name: 'The Senate Bills',
                url: 'http://www.parliament.go.ke/the-senate/house-business/bills',
                is_active: true,
                last_scraped_at: new Date(Date.now() - 259200000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
    }

    private getMockJobs(): ProcessingJob[] {
        return [
            {
                id: 'job-1',
                job_type: 'bills_crawl',
                status: 'processing',
                progress: 5,
                created_at: new Date().toISOString(),
                metadata: { data_type: 'bills', target_url: 'INTERNAL://PIPELINE' }
            },
            {
                id: 'job-2',
                job_type: 'gazette_crawl',
                status: 'completed',
                progress: 100,
                created_at: new Date(Date.now() - 3600000).toISOString(),
                completed_at: new Date().toISOString(),
                metadata: { data_type: 'gazette', target_url: 'INTERNAL://PIPELINE' }
            }
        ];
    }

    private getMockScriptContent(name: string): string {
        return `# ${name}
# Pipeline script for CEKA Intelligence System
# This script handles automated data collection and processing

import asyncio
import aiohttp
from bs4 import BeautifulSoup

async def main():
    # Pipeline logic here
    print("Starting ${name.replace('.py', '')} pipeline...")
    
    # TODO: Implement actual scraping logic
    # 1. Fetch target URLs
    # 2. Parse HTML content
    # 3. Extract relevant data
    # 4. Store in Supabase
    
    print("Pipeline complete!")

if __name__ == "__main__":
    asyncio.run(main())
`;
    }
}

export const intelService = new IntelService();
export default intelService;
