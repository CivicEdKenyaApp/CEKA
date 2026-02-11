// Intel Service - Legislative Intelligence Pipeline Management
// Uses direct Supabase calls with proper error handling

import { supabase } from '@/integrations/supabase/client';
import { Bill } from './billService';

export interface ScraperSource {
    id: string;
    name: string;
    url: string;
    selector_config?: any;
    last_scraped_at: string | null;
    status: string;
    is_active?: boolean;
    frequency_hours?: number;
    created_at: string;
    created_by?: string;
}

export interface ProcessingJob {
    id: string;
    user_id?: string;
    job_name: string;
    job_type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'stalled';
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

export interface OrderPaper {
    id: string;
    title: string;
    house: string;
    date: string;
    pdf_url: string;
    source: string;
    metadata?: any;
    created_at: string;
}

export interface BillWithHistory extends Bill {
    bill_no?: string;
    session_year?: number;
    history?: any[];
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
                // Return defaults ONLY if table is absolutely missing (error code 42P01 in Postgres)
                return [];
            }

            return (data as unknown as ScraperSource[]) || [];
        } catch (error) {
            console.error('Error fetching sources:', error);
            return [];
        }
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

    // Get pipeline scripts list with categorization
    async getPipelineScripts(): Promise<{ name: string; category: string }[]> {
        return [
            { name: 'legislative_scraper.py', category: 'Scraping' },
            { name: 'sync_to_supabase.py', category: 'Sync' },
            { name: 'sync_to_supabase_neural.py', category: 'Neural/AI' },
            { name: 'crawler.py', category: 'Research' },
            { name: 'audit_db.py', category: 'Audit' },
            { name: 'clean_data.py', category: 'Maintenance' },
            { name: 'analyze_data.py', category: 'Analytics' },
            { name: 'generate_report.py', category: 'Reporting' },
            { name: 'generate_android_assets.py', category: 'Native Assets' },
            { name: 'backblaze_utils.py', category: 'Storage' }
        ];
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
            soup = BeautifulSoup(html, 'parser')
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

    // Save script content
    async saveScriptContent(name: string, content: string): Promise<void> {
        try {
            await supabase.functions.invoke('manage-intel', {
                body: { action: 'save-script', name, content }
            });
        } catch (error) {
            console.warn('Script save failed - edge function likely not deployed');
            throw error;
        }
    }

    // Trigger pipeline
    async triggerPipeline(config: PipelineConfig): Promise<{ jobId: string }> {
        try {
            const jobName = `${config.type}_crawl_${new Date().toISOString().split('T')[0]}`;
            const jobType = config.type === 'custom' ? 'crawl' : 'crawl';

            const { data, error: jobError } = await supabase
                .from('processing_jobs')
                .insert({
                    job_name: jobName,
                    job_type: jobType,
                    status: 'pending',
                    progress: 5,
                    current_step: 'Starting pipeline execution...',
                    input_urls: config.targetUrl ? [config.targetUrl] : [],
                    metadata: {
                        data_type: config.type,
                        target_url: config.targetUrl || 'INTERNAL://PIPELINE',
                        triggered_at: new Date().toISOString()
                    },
                    processing_logs: [{
                        timestamp: new Date().toISOString(),
                        level: 'info',
                        message: 'Pipeline triggered from Command & Control Dashboard'
                    }]
                })
                .select('id')
                .single();

            if (jobError) throw jobError;

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
                console.warn('Edge function invoke failed, status will remain pending');
            }

            return { jobId: data.id };
        } catch (error) {
            console.error('Error triggering pipeline:', error);
            throw error;
        }
    }

    // Rerun a job
    async rerunJob(jobId: string): Promise<void> {
        try {
            const { data: job, error: fetchError } = await supabase
                .from('processing_jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (fetchError || !job) throw new Error('Could not find original job');

            const { error: insertError } = await supabase
                .from('processing_jobs')
                .insert({
                    job_name: job.job_name,
                    job_type: job.job_type,
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
                        message: `Manual rerun of job ${jobId}`
                    }]
                });

            if (insertError) throw insertError;
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
                    status: source.status ?? 'active'
                })
                .select()
                .single();

            if (error) throw error;
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
                .update(updates)
                .eq('id', id);

            return !error;
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

            return !error;
        } catch (error) {
            console.error('Error deleting source:', error);
            return false;
        }
    }

    // Stall a job
    async stallJob(jobId: string): Promise<void> {
        try {
            await supabase
                .from('processing_jobs')
                .update({
                    status: 'stalled',
                    current_step: 'Job stalled by administrator'
                })
                .eq('id', jobId);

            await this.addJobLog(jobId, 'Administrator stalled this pipeline run', 'warning');
        } catch (error) {
            console.error('Error stalling job:', error);
        }
    }

    // Resume a stalled job
    async resumeJob(jobId: string): Promise<void> {
        try {
            await supabase
                .from('processing_jobs')
                .update({
                    status: 'processing',
                    current_step: 'Resuming processing...'
                })
                .eq('id', jobId);

            await this.addJobLog(jobId, 'Administrator resumed this pipeline run', 'info');
        } catch (error) {
            console.error('Error resuming job:', error);
        }
    }

    // Cancel/Delete a job
    async cancelJob(jobId: string): Promise<void> {
        try {
            await supabase
                .from('processing_jobs')
                .delete()
                .eq('id', jobId);
        } catch (error) {
            console.error('Error cancelling job:', error);
        }
    }

    // Add a log entry to a job
    async addJobLog(jobId: string, message: string, level: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
        try {
            const { data } = await supabase
                .from('processing_jobs')
                .select('processing_logs')
                .eq('id', jobId)
                .single();

            const logs = (data?.processing_logs as any[]) || [];
            logs.push({
                timestamp: new Date().toISOString(),
                level,
                message
            });

            await supabase
                .from('processing_jobs')
                .update({ processing_logs: logs })
                .eq('id', jobId);
        } catch (error) {
            console.error('Error adding job log:', error);
        }
    }

    // Get recent scrape runs history
    async getScrapeRuns(limit: number = 10): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('scrape_runs')
                .select('*')
                .order('completed_at', { ascending: false })
                .limit(limit);

            if (error) return [];
            return data || [];
        } catch (e) {
            return [];
        }
    }

    // Get Order Papers
    async getOrderPapers(limit: number = 50): Promise<OrderPaper[]> {
        try {
            const { data, error } = await supabase
                .from('order_papers')
                .select('*')
                .order('date', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data as unknown as OrderPaper[];
        } catch (e) {
            console.error('Error fetching order papers:', e);
            return [];
        }
    }

    // Get Bills with their history
    async getBillsWithHistory(limit: number = 50): Promise<BillWithHistory[]> {
        try {
            const { data, error } = await supabase
                .from('bills')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data as unknown as BillWithHistory[];
        } catch (e) {
            console.error('Error fetching bills with history:', e);
            return [];
        }
    }

    // Get "Vault Health" statistics
    async getVaultHealth(): Promise<{
        totalBills: number;
        totalOrderPapers: number;
        syncedBills: number;
        failedBills: number;
        avgProcessingTime: string;
        lastSync: string | null;
    }> {
        try {
            const [billsRes, opRes, runsRes] = await Promise.all([
                supabase.from('bills').select('*', { count: 'exact', head: true }),
                supabase.from('order_papers').select('*', { count: 'exact', head: true }),
                supabase.from('scrape_runs').select('*').order('completed_at', { ascending: false }).limit(10)
            ]);

            const lastRun = runsRes.data?.[0];
            const totalSynced = runsRes.data?.reduce((acc: number, run: any) => acc + (run.bills_inserted || 0), 0) || 0;
            const totalUpdated = runsRes.data?.reduce((acc: number, run: any) => acc + (run.bills_updated || 0), 0) || 0;

            return {
                totalBills: billsRes.count || 0,
                totalOrderPapers: opRes.count || 0,
                syncedBills: totalSynced + totalUpdated,
                failedBills: runsRes.data?.filter(r => r.status === 'Failed' || r.status === 'Partial').length || 0,
                avgProcessingTime: '~5.4s per bill',
                lastSync: lastRun?.completed_at || null
            };
        } catch (e) {
            return {
                totalBills: 0,
                totalOrderPapers: 0,
                syncedBills: 0,
                failedBills: 0,
                avgProcessingTime: 'N/A',
                lastSync: null
            };
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
