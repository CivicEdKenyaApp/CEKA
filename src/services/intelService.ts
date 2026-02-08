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
    logs?: string[];
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
                .from('scraper_sources' as any)
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching sources:', error);
                return [];
            }

            return (data as unknown as ScraperSource[]) || [];
        } catch (error) {
            console.error('Error fetching sources:', error);
            return [];
        }
    }

    // Get recent jobs
    async getJobs(limit: number = 20): Promise<ProcessingJob[]> {
        try {
            const { data, error } = await supabase
                .from('processing_jobs' as any)
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

    // Get pipeline scripts list (from edge function or default)
    async getPipelineScripts(): Promise<string[]> {
        // Return default scripts - edge function may not be available
        return ['bills_pipeline.py', 'gazette_pipeline.py', 'healthcare_pipeline.py'];
    }

    // Get script content
    async getScriptContent(name: string): Promise<string> {
        // Return template script content
        return this.getTemplateScriptContent(name);
    }

    // Save script content (via edge function)
    async saveScriptContent(name: string, content: string): Promise<void> {
        try {
            const { error } = await supabase.functions.invoke('manage-intel', {
                body: { action: 'save-script', name, content }
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving script:', error);
            throw new Error('Failed to save script. Edge Function may not be deployed.');
        }
    }

    // Trigger pipeline
    async triggerPipeline(config: PipelineConfig): Promise<{ jobId: string }> {
        try {
            // Create job record in Supabase
            const { data, error: jobError } = await supabase
                .from('processing_jobs' as any)
                .insert({
                    job_name: `Intel Pipeline: ${config.type.toUpperCase()}`,
                    job_type: config.type === 'custom' ? 'crawl' : `${config.type}_crawl`,
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

    // Create source
    async createSource(source: Omit<ScraperSource, 'id' | 'created_at' | 'updated_at'>): Promise<ScraperSource> {
        const { data, error } = await supabase
            .from('scraper_sources' as any)
            .insert(source)
            .select()
            .single();

        if (error) throw error;
        return data as unknown as ScraperSource;
    }

    // Update job status
    async updateJobStatus(jobId: string, status: ProcessingJob['status'], progress?: number): Promise<void> {
        const updates: any = { status };
        if (progress !== undefined) updates.progress = progress;
        if (status === 'completed') updates.completed_at = new Date().toISOString();
        if (status === 'processing' && !updates.started_at) updates.started_at = new Date().toISOString();

        const { error } = await supabase
            .from('processing_jobs' as any)
            .update(updates)
            .eq('id', jobId);

        if (error) throw error;
    }

    // Template script content
    private getTemplateScriptContent(name: string): string {
        return `# ${name}
# CEKA Legislative Intelligence Pipeline
# Automated data collection and processing

import asyncio
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict, Any
import json

# Configuration
BASE_URLS = {
    'bills': 'http://www.parliament.go.ke/the-national-assembly/house-business/bills',
    'gazette': 'http://kenyalaw.org/kenya_gazette/',
    'healthcare': 'https://www.health.go.ke/policies/'
}

async def fetch_page(session: aiohttp.ClientSession, url: str) -> str:
    """Fetch a single page and return HTML content."""
    async with session.get(url) as response:
        return await response.text()

async def parse_content(html: str) -> List[Dict[str, Any]]:
    """Parse HTML and extract relevant data."""
    soup = BeautifulSoup(html, 'html.parser')
    items = []
    
    # Add parsing logic specific to ${name.replace('.py', '')}
    # Example: Find all document links
    for link in soup.find_all('a', href=True):
        if '.pdf' in link['href'] or 'document' in link.get('class', []):
            items.append({
                'title': link.get_text(strip=True),
                'url': link['href'],
                'type': '${name.replace('_pipeline.py', '')}'
            })
    
    return items

async def store_results(items: List[Dict[str, Any]]) -> None:
    """Store extracted data in the database."""
    # Implement Supabase insertion logic
    print(f"Storing {len(items)} items...")
    
async def main():
    """Main pipeline execution."""
    print(f"Starting ${name.replace('.py', '')} pipeline...")
    
    async with aiohttp.ClientSession() as session:
        # Fetch and parse content
        url = BASE_URLS.get('${name.replace('_pipeline.py', '')}', '')
        if url:
            html = await fetch_page(session, url)
            items = await parse_content(html)
            await store_results(items)
            print(f"Pipeline complete! Processed {len(items)} items.")
        else:
            print("No URL configured for this pipeline.")

if __name__ == "__main__":
    asyncio.run(main())
`;
    }
}

export const intelService = new IntelService();
export default intelService;
