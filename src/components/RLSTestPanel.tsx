import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, User, UserX, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  getSignedUploadUrl,
  uploadFileWithSignedUrl,
  createProcessingJob,
  uploadFileDirectly,
  serverUpload,
  getUserProcessingJobs,
  getPublicProcessingJobs,
  ProcessingJob
} from '@/utils/storageUtils';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const RLSTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [testFile, setTestFile] = useState<File | null>(null);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const checkUserStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    addTestResult({
      test: 'User Authentication Status',
      status: user ? 'success' : 'warning',
      message: user ? `Authenticated as: ${user.email}` : 'Not authenticated (anonymous user)',
      details: user ? { id: user.id, email: user.email } : null
    });
  };

  const testDirectUpload = async () => {
    if (!testFile) {
      addTestResult({
        test: 'Direct Upload Test',
        status: 'error',
        message: 'No test file selected'
      });
      return;
    }

    try {
      if (!user) {
        addTestResult({
          test: 'Direct Upload Test',
          status: 'warning',
          message: 'Skipped - requires authentication'
        });
        return;
      }

      const filename = `test_uploads/direct_${Date.now()}_${testFile.name}`;
      const result = await uploadFileDirectly(testFile, filename);
      
      addTestResult({
        test: 'Direct Upload Test',
        status: result.error ? 'error' : 'success',
        message: result.error ? `Failed: ${result.error.message}` : 'Direct upload successful',
        details: result.data || result.error
      });
    } catch (error: any) {
      addTestResult({
        test: 'Direct Upload Test',
        status: 'error',
        message: error.message,
        details: error
      });
    }
  };

  const testSignedUrlUpload = async () => {
    if (!testFile) {
      addTestResult({
        test: 'Signed URL Upload Test',
        status: 'error',
        message: 'No test file selected'
      });
      return;
    }

    try {
      const signedUrlData = await getSignedUploadUrl(`test_uploads/signed_${Date.now()}_${testFile.name}`);
      await uploadFileWithSignedUrl(testFile, signedUrlData);
      
      addTestResult({
        test: 'Signed URL Upload Test',
        status: 'success',
        message: 'Signed URL upload successful',
        details: signedUrlData
      });
    } catch (error: any) {
      addTestResult({
        test: 'Signed URL Upload Test',
        status: 'error',
        message: error.message,
        details: error
      });
    }
  };

  const testServerUpload = async () => {
    if (!testFile) {
      addTestResult({
        test: 'Server Upload Test',
        status: 'error',
        message: 'No test file selected'
      });
      return;
    }

    try {
      const result = await serverUpload(testFile, `server_${Date.now()}_${testFile.name}`, {
        createJob: false // Don't create job for test
      });
      
      addTestResult({
        test: 'Server Upload Test',
        status: 'success',
        message: 'Server upload successful',
        details: result
      });
    } catch (error: any) {
      addTestResult({
        test: 'Server Upload Test',
        status: 'error',
        message: error.message,
        details: error
      });
    }
  };

  const testJobCreation = async () => {
    try {
      const job = await createProcessingJob({
        job_name: `test_job_${Date.now()}`,
        input_files: ['test_file.csv'],
        status: 'pending',
        progress: 0,
        current_step: 'Testing RLS job creation'
      });
      
      addTestResult({
        test: 'Processing Job Creation Test',
        status: 'success',
        message: 'Job created successfully',
        details: job
      });
    } catch (error: any) {
      addTestResult({
        test: 'Processing Job Creation Test',
        status: 'error',
        message: error.message,
        details: error
      });
    }
  };

  const testJobRetrieval = async () => {
    try {
      let jobs: ProcessingJob[] = [];
      
      if (user) {
        jobs = await getUserProcessingJobs();
        addTestResult({
          test: 'User Jobs Retrieval Test',
          status: 'success',
          message: `Retrieved ${jobs.length} user jobs`,
          details: jobs.slice(0, 3) // Show first 3 jobs
        });
      }
      
      const publicJobs = await getPublicProcessingJobs();
      addTestResult({
        test: 'Public Jobs Retrieval Test',
        status: 'success',
        message: `Retrieved ${publicJobs.length} public jobs`,
        details: publicJobs.slice(0, 3) // Show first 3 jobs
      });
    } catch (error: any) {
      addTestResult({
        test: 'Job Retrieval Test',
        status: 'error',
        message: error.message,
        details: error
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();

    try {
      await checkUserStatus();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testJobCreation();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testJobRetrieval();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (testFile) {
        await testSignedUrlUpload();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await testDirectUpload();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await testServerUpload();
      } else {
        addTestResult({
          test: 'Upload Tests',
          status: 'warning',
          message: 'Skipped - no test file provided'
        });
      }
      
      toast.success('All RLS tests completed');
    } catch (error) {
      toast.error('Error running tests');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          RLS & Upload Security Test Panel
        </CardTitle>
        <CardDescription>
          Test Row Level Security policies and upload methods to ensure proper access control
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user ? <User className="w-4 h-4 text-green-500" /> : <UserX className="w-4 h-4 text-gray-500" />}
              <span className="text-sm">
                {user ? `Authenticated: ${user.email}` : 'Anonymous User'}
              </span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="test-file">Test File (optional - for upload tests)</Label>
            <Input
              id="test-file"
              type="file"
              accept=".csv,.json,.txt"
              onChange={(e) => setTestFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Select a small test file to test upload methods
            </p>
          </div>
        </div>

        <Separator />

        {/* Test Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
          <Button variant="outline" onClick={checkUserStatus}>
            Check User Status
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold">Test Results</h3>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{result.test}</h4>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{result.message}</p>
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer hover:underline">Show Details</summary>
                          <pre className="mt-2 p-2 bg-black/5 rounded overflow-auto max-h-40">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Understanding the Tests</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Direct Upload:</strong> Uses client-side Supabase client with RLS policies</li>
            <li><strong>Signed URL Upload:</strong> Uses secure signed URLs, works for all users</li>
            <li><strong>Server Upload:</strong> Uses service_role key, bypasses RLS completely</li>
            <li><strong>Job Creation:</strong> Tests processing_jobs table RLS policies</li>
            <li><strong>Job Retrieval:</strong> Tests SELECT policies for user vs public jobs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RLSTestPanel;