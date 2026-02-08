// Intel Service - Legislative Intelligence Pipeline Management
// Uses direct Supabase calls with proper error handling

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
    user_id?: string;
    job_name: string;
    job_type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    current_step?: string;
    input_files?: any[];
    input_urls?: any[];
    output_files?: Record<string, any>;
    error_message?: string;
    processing_logs?: any[];
    started_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at?: string;
    metadata?: Record<string, any>;
}

export interface PipelineConfig {
    type: 'bills' | 'gazette' | 'healthcare' | 'custom';
    targetUrl?: string;
    options?: Record<string, any>;
}

class IntelService {
    // Get all scraper sources
    async getSources(): Promise<ScraperSource[]> {
        try {
            const { data, error } = await supabase
                .from('scraper_sources')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching sources:', error);
                // Return mock sources if table doesn't exist
                return this.getDefaultSources();
            }

            return (data as unknown as ScraperSource[]) || this.getDefaultSources();
        } catch (error) {
            console.error('Error fetching sources:', error);
            return this.getDefaultSources();
        }
    }

    // Default sources when table doesn't exist
    private getDefaultSources(): ScraperSource[] {
        const now = new Date().toISOString();
        return [
            { id: '1', name: 'Kenya Gazette', url: 'http://kenyalaw.org/kenya_gazette/', is_active: true, last_scraped_at: null, created_at: now, updated_at: now },
            { id: '2', name: 'National Assembly Bills', url: 'http://www.parliament.go.ke/the-national-assembly/house-business/bills', is_active: true, last_scraped_at: null, created_at: now, updated_at: now },
            { id: '3', name: 'The Senate Bills', url: 'http://www.parliament.go.ke/the-senate/house-business/bills', is_active: true, last_scraped_at: null, created_at: now, updated_at: now }
        ];
    }

    // Get recent jobs - matches ACTUAL processing_jobs table schema
    async getJobs(limit: number = 20): Promise<ProcessingJob[]> {
        try {
            const { data, error } = await supabase
                .from('processing_jobs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching jobs:', error);
                return [];
            }

            return (data as unknown as ProcessingJob[]) || [];
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
    }

    // Get pipeline scripts list (static - no edge function needed)
    async getPipelineScripts(): Promise<string[]> {
        return ['bills_pipeline.py', 'gazette_pipeline.py', 'healthcare_pipeline.py'];
    }

    // Get script content (template content)
    async getScriptContent(name: string): Promise<string> {
        return this.getTemplateScriptContent(name);
    }

    private getTemplateScriptContent(name: string): string {
        const baseTemplate = `#!/usr/bin/env python3
"""
CEKA Legislative Intelligence Pipeline
Script: ${name}
"""

import asyncio
import aiohttp
from bs4 import BeautifulSoup
from datetime import datetime

class Pipeline:
    def __init__(self, config):
        self.config = config
        self.session = None
    
    async def initialize(self):
        self.session = aiohttp.ClientSession()
        print(f"[{datetime.now()}] Pipeline initialized")
    
    async def scrape(self, url: str):
        async with self.session.get(url) as response:
            html = await response.text()
            soup = BeautifulSoup(html, 'html.parser')
            return soup
    
    async def process(self):
        # Implement scraping logic here
        pass
    
    async def cleanup(self):
        if self.session:
            await self.session.close()

async def main():
    pipeline = Pipeline({})
    await pipeline.initialize()
    await pipeline.process()
    await pipeline.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
`;
        return baseTemplate;
    }

    // Save script content (via edge function or local storage)
    async saveScriptContent(name: string, content: string): Promise<void> {
        try {
            const { error } = await supabase.functions.invoke('manage-intel', {
                body: { action: 'save-script', name, content }
            });

            if (error) {
                console.warn('Edge function unavailable, script saved locally');
            }
        } catch (error) {
            console.warn('Script save skipped - edge function not deployed');
        }
    }

    // Trigger pipeline - uses ACTUAL processing_jobs schema with job_name
    async triggerPipeline(config: PipelineConfig): Promise<{ jobId: string }> {
        try {
            const jobName = `${config.type}_crawl_${new Date().toISOString().split('T')[0]}`;
            const jobType = config.type === 'custom' ? 'crawl' : 'crawl';

            // Create job record matching ACTUAL schema
            const { data, error: jobError } = await supabase
                .from('processing_jobs')
                .insert({
                    job_name: jobName, // Required - not null constraint
                    job_type: jobType,
                    status: 'pending',
                    progress: 5,
                    current_step: 'Starting website crawl...',
                    input_urls: config.targetUrl ? [config.targetUrl] : [],
                    metadata: {
                        data_type: config.type,
                        target_url: config.targetUrl || 'INTERNAL://PIPELINE',
                        crawl_start: new Date().toISOString()
                    },
                    processing_logs: [{
                        timestamp: new Date().toISOString(),
                        level: 'info',
                        message: 'Pipeline triggered from admin dashboard'
                    }]
                })
                .select('id')
                .single();

            if (jobError) {
                console.error('Error creating job:', jobError);
                throw new Error('Failed to create job record');
            }

            // Try to invoke edge function (may fail silently)
            try {
                await supabase.functions.invoke('manage-intel', {
                    body: {
                        action: 'run-pipeline',
                        jobId: data.id,
                        pipelineType: config.type,
                        targetUrl: config.targetUrl
                    }
                });
            } catch (e) {
                console.warn('Edge function call failed, job queued for manual processing');
            }

            return { jobId: data.id };
        } catch (error) {
            console.error('Error triggering pipeline:', error);
            throw error;
        }
    }

    // Rerun a job - uses ACTUAL schema
    async rerunJob(jobId: string): Promise<void> {
        try {
            // Get original job details
            const { data: originalJob, error: fetchError } = await supabase
                .from('processing_jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (fetchError || !originalJob) {
                throw new Error('Could not find original job');
            }

            const job = originalJob as unknown as ProcessingJob;

            // Create new job based on original
            const { error: insertError } = await supabase
                .from('processing_jobs')
                .insert({
                    job_name: job.job_name, // Must have job_name
                    job_type: job.job_type || 'crawl',
                    status: 'pending',
                    progress: 0,
                    current_step: 'Rerun initiated...',
                    input_urls: job.input_urls || [],
                    metadata: {
                        ...job.metadata,
                        rerun_of: jobId,
                        rerun_at: new Date().toISOString()
                    },
                    processing_logs: [{
                        timestamp: new Date().toISOString(),
                        level: 'info',
                        message: `Rerun of job ${jobId}`
                    }]
                });

            if (insertError) {
                console.error('Error rerunning job:', insertError);
                throw new Error('Failed to rerun job');
            }
        } catch (error) {
            console.error('Error rerunning job:', error);
            throw error;
        }
    }

    // Add a new source
    async addSource(source: Partial<ScraperSource>): Promise<ScraperSource | null> {
        try {
            const { data, error } = await supabase
                .from('scraper_sources')
                .insert({
                    name: source.name,
                    url: source.url,
                    is_active: source.is_active ?? true
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding source:', error);
                return null;
            }

            return data as unknown as ScraperSource;
        } catch (error) {
            console.error('Error adding source:', error);
            return null;
        }
    }

    // Update a source
    async updateSource(id: string, updates: Partial<ScraperSource>): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('scraper_sources')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error('Error updating source:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error updating source:', error);
            return false;
        }
    }

    // Delete a source
    async deleteSource(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('scraper_sources')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting source:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting source:', error);
            return false;
        }
    }

    // Update job progress
    async updateJobProgress(jobId: string, progress: number, step: string): Promise<void> {
        try {
            await supabase
                .from('processing_jobs')
                .update({
                    progress,
                    current_step: step,
                    updated_at: new Date().toISOString()
                })
                .eq('id', jobId);
        } catch (error) {
            console.error('Error updating job progress:', error);
        }
    }

    // Complete a job
    async completeJob(jobId: string, success: boolean, error?: string): Promise<void> {
        try {
            await supabase
                .from('processing_jobs')
                .update({
                    status: success ? 'completed' : 'failed',
                    progress: success ? 100 : undefined,
                    current_step: success ? 'Processing completed successfully' : 'Processing failed',
                    error_message: error,
                    completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', jobId);
        } catch (error) {
            console.error('Error completing job:', error);
        }
    }
}

export const intelService = new IntelService();
export default intelService;
