import { supabase } from '@/integrations/supabase/client';

export interface SignedUrlResponse {
  uploadUrl: string;
  token: string;
  path: string;
  filename: string;
}

export interface ProcessingJob {
  id: string;
  job_name: string;
  user_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  current_step?: string;
  input_files: string[];
  input_urls: string[];
  output_files?: any;
  processing_logs?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  expires_at?: string;
}

/**
 * Get signed upload URL for file uploads
 * Works for both authenticated and anonymous users
 */
export async function getSignedUploadUrl(
  filename: string, 
  bucket: string = 'processed-data',
  options: {
    contentType?: string;
    expiresIn?: number;
  } = {}
): Promise<SignedUrlResponse> {
  const { data, error } = await supabase.functions.invoke('get-signed-upload-url', {
    body: {
      filename,
      bucket,
      contentType: options.contentType || 'application/octet-stream',
      expiresIn: options.expiresIn || 300
    }
  });

  if (error) {
    console.error('Error getting signed upload URL:', error);
    throw error;
  }

  return data;
}

/**
 * Upload file using signed URL
 * This bypasses RLS and works for both authenticated and anonymous users
 */
export async function uploadFileWithSignedUrl(
  file: File, 
  signedUrlData: SignedUrlResponse
): Promise<void> {
  const response = await fetch(signedUrlData.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
}

/**
 * Create processing job
 * Handles both authenticated and anonymous users with proper RLS
 */
export async function createProcessingJob(jobData: {
  job_name: string;
  input_files?: string[];
  input_urls?: string[];
  status?: string;
  progress?: number;
  current_step?: string;
}): Promise<ProcessingJob> {
  const { data, error } = await supabase.functions.invoke('create-processing-job', {
    body: jobData
  });

  if (error) {
    console.error('Error creating processing job:', error);
    throw error;
  }

  return data.job;
}

/**
 * Upload file directly using Supabase client (for authenticated users)
 * This method respects RLS policies
 */
export async function uploadFileDirectly(
  file: File,
  path: string,
  bucket: string = 'processed-data'
): Promise<{ data: any; error: any }> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User must be authenticated for direct uploads');
  }

  return await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
}

/**
 * Server-side upload using edge function (bypasses RLS completely)
 * Useful for system processes or when you need guaranteed upload success
 */
export async function serverUpload(
  file: File,
  filename: string,
  options: {
    bucket?: string;
    createJob?: boolean;
    jobName?: string;
  } = {}
): Promise<{ upload: any; job?: ProcessingJob }> {
  // Convert file to base64
  const fileBuffer = await file.arrayBuffer();
  const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

  const { data, error } = await supabase.functions.invoke('server-upload', {
    body: {
      filename,
      fileData: base64Data,
      bucket: options.bucket || 'processed-data',
      contentType: file.type,
      createJob: options.createJob !== false,
      jobName: options.jobName
    }
  });

  if (error) {
    console.error('Error in server upload:', error);
    throw error;
  }

  return data;
}

/**
 * Get user's processing jobs (authenticated users only)
 */
export async function getUserProcessingJobs(): Promise<ProcessingJob[]> {
  const { data, error } = await supabase
    .from('processing_jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user processing jobs:', error);
    throw error;
  }

  return (data || []) as ProcessingJob[];
}

/**
 * Get public processing jobs (for anonymous users)
 */
export async function getPublicProcessingJobs(): Promise<ProcessingJob[]> {
  const { data, error } = await supabase
    .from('processing_jobs')
    .select('*')
    .is('user_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public processing jobs:', error);
    throw error;
  }

  return (data || []) as ProcessingJob[];
}

/**
 * Update processing job (authenticated users can only update their own jobs)
 */
export async function updateProcessingJob(
  jobId: string,
  updates: Partial<ProcessingJob>
): Promise<ProcessingJob> {
  const { data, error } = await supabase
    .from('processing_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    console.error('Error updating processing job:', error);
    throw error;
  }

  return data as ProcessingJob;
}

/**
 * Delete processing job (authenticated users can only delete their own jobs)
 */
export async function deleteProcessingJob(jobId: string): Promise<void> {
  const { error } = await supabase
    .from('processing_jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    console.error('Error deleting processing job:', error);
    throw error;
  }
}