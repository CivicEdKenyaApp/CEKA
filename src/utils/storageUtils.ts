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
 * Enhanced error handling for Supabase operations
 */
class StorageError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Get signed upload URL for file uploads with enhanced error handling
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
  try {
    if (!filename || filename.includes('..') || filename.includes('/../')) {
      throw new StorageError('Invalid filename', 'INVALID_FILENAME');
    }

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
      throw new StorageError(
        error.message || 'Failed to get upload URL',
        error.code,
        error
      );
    }

    if (!data) {
      throw new StorageError('No data returned from signed URL function');
    }

    return data;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(
      'Unexpected error getting signed URL',
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Upload file using signed URL with retry mechanism
 * This bypasses RLS and works for both authenticated and anonymous users
 */
export async function uploadFileWithSignedUrl(
  file: File, 
  signedUrlData: SignedUrlResponse,
  options: {
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<void> {
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(signedUrlData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'Authorization': `Bearer ${signedUrlData.token}`
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText} (${response.status})`);
      }

      return; // Success
    } catch (error) {
      lastError = error as Error;
      console.warn(`Upload attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }

  throw new StorageError(
    `Upload failed after ${maxRetries} attempts`,
    'UPLOAD_FAILED',
    lastError
  );
}

/**
 * Create processing job with enhanced validation
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
  try {
    // Validate job data
    if (!jobData.job_name || jobData.job_name.trim().length === 0) {
      throw new StorageError('Job name is required', 'INVALID_JOB_DATA');
    }

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const jobToCreate = {
      job_name: jobData.job_name.trim(),
      input_files: jobData.input_files || [],
      input_urls: jobData.input_urls || [],
      status: jobData.status || 'pending',
      progress: Math.max(0, Math.min(100, jobData.progress || 0)),
      current_step: jobData.current_step || 'Job created',
      user_id: userId, // Let RLS handle null for anonymous users
      processing_logs: [{
        timestamp: new Date().toISOString(),
        event: 'job_created',
        message: 'Processing job created successfully',
        user_id: userId
      }]
    };

    const { data, error } = await supabase
      .from('processing_jobs')
      .insert([jobToCreate])
      .select()
      .single();

    if (error) {
      console.error('Database error creating job:', error);
      throw new StorageError(
        'Failed to create processing job',
        error.code,
        error
      );
    }

    return data as ProcessingJob;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(
      'Unexpected error creating processing job',
      'JOB_CREATION_FAILED',
      error
    );
  }
}

/**
 * Upload file directly using Supabase client with RLS compliance
 * For authenticated users only
 */
export async function uploadFileDirectly(
  file: File,
  path: string,
  bucket: string = 'processed-data',
  options: {
    upsert?: boolean;
    cacheControl?: string;
  } = {}
): Promise<{ data: any; error: any }> {
  try {
    const { data: user, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user.user) {
      throw new StorageError(
        'User must be authenticated for direct uploads',
        'AUTH_REQUIRED',
        authError
      );
    }

    // Validate path for security
    if (!path.startsWith('uploads/')) {
      throw new StorageError(
        'Direct uploads must use uploads/ directory',
        'INVALID_PATH'
      );
    }

    const result = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options.cacheControl || '3600',
        upsert: options.upsert || false
      });

    if (result.error) {
      throw new StorageError(
        result.error.message,
        'STORAGE_ERROR',
        result.error
      );
    }

    return result;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(
      'Unexpected error during direct upload',
      'DIRECT_UPLOAD_FAILED',
      error
    );
  }
}

/**
 * Server-side upload using edge function with improved error handling
 * Bypasses RLS completely for system processes
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
  try {
    // Validate file size (limit to 10MB for server uploads)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new StorageError(
        `File size exceeds limit of ${maxSize} bytes`,
        'FILE_TOO_LARGE'
      );
    }

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
        jobName: options.jobName || `server_upload_${Date.now()}`
      }
    });

    if (error) {
      throw new StorageError(
        error.message || 'Server upload failed',
        error.code,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(
      'Unexpected error during server upload',
      'SERVER_UPLOAD_FAILED',
      error
    );
  }
}

/**
 * Get user's processing jobs with pagination and filtering
 */
export async function getUserProcessingJobs(
  options: {
    limit?: number;
    offset?: number;
    status?: string[];
  } = {}
): Promise<{ jobs: ProcessingJob[]; count: number }> {
  try {
    let query = supabase
      .from('processing_jobs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options.status && options.status.length > 0) {
      query = query.in('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new StorageError(
        error.message || 'Failed to fetch user jobs',
        error.code,
        error
      );
    }

    return {
      jobs: (data || []) as ProcessingJob[],
      count: count || 0
    };
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(
      'Unexpected error fetching user jobs',
      'FETCH_JOBS_FAILED',
      error
    );
  }
}

/**
 * Get public processing jobs with enhanced filtering
 */
export async function getPublicProcessingJobs(
  options: {
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ jobs: ProcessingJob[]; count: number }> {
  try {
    let query = supabase
      .from('processing_jobs')
      .select('*', { count: 'exact' })
      .is('user_id', null)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new StorageError(
        error.message || 'Failed to fetch public jobs',
        error.code,
        error
      );
    }

    return {
      jobs: (data || []) as ProcessingJob[],
      count: count || 0
    };
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(
      'Unexpected error fetching public jobs',
      'FETCH_PUBLIC_JOBS_FAILED',
      error
    );
  }
}

/**
 * Update processing job with validation and audit logging
 */
export async function updateProcessingJob(
  jobId: string,
  updates: Partial<ProcessingJob>
): Promise<ProcessingJob> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    // Add audit log entry
    const updatedJob = {
      ...updates,
      updated_at: new Date().toISOString(),
      processing_logs: [
        ...(updates.processing_logs || []),
        {
          timestamp: new Date().toISOString(),
          event: 'job_updated',
          message: `Job updated by ${userId ? 'user' : 'system'}`,
          user_id: userId,
          changes: Object.keys(updates)
        }
      ]
    };

    const { data: jobData, error } = await supabase
      .from('processing_jobs')
      .update(updatedJob)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      throw new StorageError(
        error.message || 'Failed to update job',
        error.code,
        error
      );
    }

    return jobData as ProcessingJob;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(
      'Unexpected error updating job',
      'UPDATE_JOB_FAILED',
      error
    );
  }
}

/**
 * Delete processing job with existence check and proper error handling
 */
export async function deleteProcessingJob(jobId: string): Promise<void> {
  try {
    // First check if job exists
    const { data: existingJob, error: fetchError } = await supabase
      .from('processing_jobs')
      .select('id')
      .eq('id', jobId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Not found
        throw new StorageError('Job not found', 'JOB_NOT_FOUND');
      }
      throw new StorageError(
        fetchError.message || 'Failed to fetch job',
        fetchError.code,
        fetchError
      );
    }

    const { error } = await supabase
      .from('processing_jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      throw new StorageError(
        error.message || 'Failed to delete job',
        error.code,
        error
      );
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(
      'Unexpected error deleting job',
      'DELETE_JOB_FAILED',
      error
    );
  }
}

/**
 * Utility to check storage bucket permissions
 */
export async function checkBucketPermissions(
  bucket: string = 'processed-data'
): Promise<{ canRead: boolean; canWrite: boolean }> {
  try {
    // Test write permission
    const testContent = new Blob(['test'], { type: 'text/plain' });
    const testPath = `test_${Date.now()}.txt`;

    const { error: writeError } = await supabase.storage
      .from(bucket)
      .upload(testPath, testContent);

    // Test read permission
    let canRead = false;
    if (!writeError) {
      const { error: readError } = await supabase.storage
        .from(bucket)
        .download(testPath);

      canRead = !readError;

      // Clean up test file
      await supabase.storage
        .from(bucket)
        .remove([testPath]);
    }

    return {
      canWrite: !writeError,
      canRead
    };
  } catch (error) {
    console.error('Error checking bucket permissions:', error);
    return {
      canRead: false,
      canWrite: false
    };
  }
}
