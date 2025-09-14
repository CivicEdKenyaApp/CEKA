# Comprehensive RLS and Storage Implementation Guide

## Overview

This implementation provides a complete solution for Supabase Row Level Security (RLS) and storage issues, including:

- **Processing Jobs RLS**: Complete RLS policies for authenticated and anonymous users
- **Multiple Upload Methods**: Direct, signed URL, and server-side uploads
- **Edge Functions**: Comprehensive backend functionality
- **Security Testing**: Built-in RLS testing panel

## Database Schema Updates

### 1. Processing Jobs RLS Policies

The following RLS policies have been implemented:

```sql
-- Enable RLS on processing_jobs
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

-- Authenticated users: insert only when user_id = auth.uid()
CREATE POLICY "processing_jobs_insert_authenticated" ON public.processing_jobs
    FOR INSERT TO authenticated
    WITH CHECK ((user_id IS NOT NULL AND user_id = auth.uid()));

-- Anonymous users: allow insert only if user_id IS NULL
CREATE POLICY "processing_jobs_insert_anon" ON public.processing_jobs
    FOR INSERT TO anon
    WITH CHECK (user_id IS NULL);

-- Authenticated users: select their own jobs
CREATE POLICY "processing_jobs_select_owner" ON public.processing_jobs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Anonymous users can view jobs without user_id (public jobs)
CREATE POLICY "processing_jobs_select_public" ON public.processing_jobs
    FOR SELECT TO anon
    USING (user_id IS NULL);

-- Service role can manage all jobs (bypass RLS)
CREATE POLICY "service_role_manage_processing_jobs" ON public.processing_jobs
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
```

### 2. Automatic Timestamp Updates

```sql
-- Trigger function for automatic updated_at
CREATE OR REPLACE FUNCTION public.update_processing_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for processing_jobs
CREATE TRIGGER update_processing_jobs_updated_at
    BEFORE UPDATE ON public.processing_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_processing_jobs_updated_at();
```

## Upload Methods

### 1. Signed URL Upload (Recommended)

**Best for**: Both authenticated and anonymous users
**Security**: Uses signed URLs with expiration
**RLS**: Bypasses storage RLS through signed URLs

```typescript
// Example usage
const signedUrlData = await getSignedUploadUrl('my-file.csv');
await uploadFileWithSignedUrl(file, signedUrlData);
```

### 2. Direct Upload

**Best for**: Authenticated users only
**Security**: Respects RLS policies
**RLS**: Full RLS enforcement

```typescript
// Example usage (requires authentication)
const result = await uploadFileDirectly(file, 'uploads/my-file.csv');
```

### 3. Server Upload

**Best for**: System processes, trusted operations
**Security**: Uses service_role key (server-side only)
**RLS**: Completely bypasses RLS

```typescript
// Example usage (bypasses all RLS)
const result = await serverUpload(file, 'my-file.csv', {
  createJob: true,
  jobName: 'System Upload'
});
```

## Edge Functions

### Created Functions:

1. **get-signed-upload-url**: Generates secure signed URLs for uploads
2. **create-processing-job**: Creates jobs with proper RLS handling
3. **server-upload**: Server-side upload with service_role access
4. **kenya-geojson**: Serves Kenya geographical data
5. **process-datasets**: Handles dataset processing
6. **upload-data**: Handles file uploads with job creation
7. **process-url**: Web crawling functionality
8. **job-status**: Real-time job status monitoring
9. **download-file**: Secure file downloads

## Security Features

### RLS Testing Panel

Access via `/shambles` → Security Tests tab:

- **User Authentication Status**: Checks current auth state
- **Direct Upload Test**: Tests authenticated user uploads
- **Signed URL Test**: Tests signed URL uploads (works for all users)
- **Server Upload Test**: Tests server-side bypass uploads
- **Job Creation Test**: Tests processing_jobs RLS policies
- **Job Retrieval Test**: Tests SELECT policies

### Upload Method Selection

The DataProcessor component includes a dropdown to select upload method:

- **Signed URL**: Default, works for everyone
- **Direct Upload**: Authenticated users only
- **Server Upload**: System-level, bypasses all RLS

## Storage Configuration

### Bucket Setup

**processed-data bucket**:
- **Type**: Private (recommended)
- **Access**: Via signed URLs or service_role
- **Path restrictions**: Anonymous uploads restricted to `uploads/` path

### Alternative: Public Bucket

If you prefer a simpler setup:
1. Set `processed-data` bucket to **Public** in Supabase Dashboard
2. Anonymous users can upload directly
3. Less secure but simpler

## Usage Examples

### Authenticated User Upload

```typescript
// Check authentication
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  // Direct upload (respects RLS)
  const uploadResult = await uploadFileDirectly(file, filename);
  
  // Create job
  const job = await createProcessingJob({
    job_name: 'My Processing Job',
    input_files: [uploadResult.data.path]
  });
}
```

### Anonymous User Upload

```typescript
// Use signed URL method
const signedUrlData = await getSignedUploadUrl(filename);
await uploadFileWithSignedUrl(file, signedUrlData);

// Create anonymous job
const job = await createProcessingJob({
  job_name: 'Anonymous Processing Job',
  input_files: [signedUrlData.path]
});
```

### Server-Side Processing

```typescript
// Server-side upload (bypasses all RLS)
const result = await serverUpload(file, filename, {
  createJob: true,
  jobName: 'System Processing Job'
});

// Job is created with user_id: null
console.log('Job created:', result.job);
```

## Troubleshooting

### Common Issues

1. **"new row violates row-level security policy"**
   - Solution: Use signed URL upload or ensure user is authenticated
   - Check: Verify user_id matches auth.uid() for authenticated operations

2. **"must be owner of table objects"**
   - Expected: Cannot directly modify storage.objects table
   - Solution: Use signed URLs or contact Supabase support

3. **Anonymous upload failures**
   - Solution: Verify filename starts with 'uploads/' for anonymous users
   - Alternative: Use server upload method

### Testing Your Implementation

1. **Run Security Tests**: Visit `/shambles` → Security Tests
2. **Test Different Scenarios**:
   - Authenticated user uploads
   - Anonymous user uploads
   - Job creation and retrieval
   - File downloads

3. **Monitor Logs**: Check Supabase logs for RLS violations

## Security Best Practices

1. **Never expose service_role key client-side**
2. **Use signed URLs for controlled access**
3. **Monitor anonymous uploads with appropriate restrictions**
4. **Regularly audit RLS policies**
5. **Use the security test panel to verify implementations**

## Dashboard Configuration

### Required Supabase Dashboard Steps:

1. **Storage → Buckets → processed-data**:
   - Verify bucket exists
   - Set to Private (recommended) or Public (simpler)

2. **Authentication → URL Configuration**:
   - Set Site URL to your domain
   - Add redirect URLs for authentication

3. **Database → SQL Editor**:
   - Run the provided RLS policies if not already applied

## Implementation Status

✅ **Processing Jobs RLS**: Complete with all policies
✅ **Upload Methods**: All three methods implemented
✅ **Edge Functions**: Complete backend functionality  
✅ **Security Testing**: Built-in test panel
✅ **Error Handling**: Comprehensive error handling
✅ **Documentation**: Complete implementation guide

## Next Steps

1. Test the implementation thoroughly using the security test panel
2. Configure your production environment with appropriate bucket settings
3. Monitor logs for any RLS violations
4. Consider adding additional monitoring and alerting for uploads

This implementation provides a production-ready solution for handling both authenticated and anonymous users with proper security controls and comprehensive testing capabilities.