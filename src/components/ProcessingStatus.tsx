import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Clock, CheckCircle, XCircle, RefreshCw, FileText, Map, BarChart3, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProcessingJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  results?: {
    successful_files: string[];
    failed_files: { file: string; error: string }[];
    facility_count: number;
    administrative_areas: number;
  };
  map_path?: string;
  heatmap_path?: string;
  report_path?: string;
  geojson_path?: string;
  created_at: string;
}

interface ProcessingStatusProps {
  jobs: ProcessingJob[];
  selectedJob: ProcessingJob | null;
  onSelectJob: (job: ProcessingJob) => void;
  onDownload: (jobId: string, fileType: string) => void;
  onClose: () => void;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  jobs,
  selectedJob,
  onSelectJob,
  onDownload,
  onClose
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Data Processing Status</DialogTitle>
          <DialogDescription>
            View the status of your data processing jobs and download the results
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Job list */}
          <div className="md:col-span-1 space-y-2">
            <h3 className="font-medium text-sm mb-2">Processing Jobs</h3>
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No processing jobs found</p>
            ) : (
              <div className="space-y-2">
                {jobs.map(job => (
                  <div
                    key={job.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedJob?.id === job.id ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                    )}
                    onClick={() => onSelectJob(job)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Job {job.id.slice(-6)}</span>
                      {job.status === 'processing' && <Clock className="h-4 w-4 text-blue-500" />}
                      {job.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {job.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(job.created_at)}
                    </div>
                    {job.status === 'processing' && (
                      <Progress value={job.progress} className="mt-2 h-1" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job details */}
          <div className="md:col-span-2">
            {selectedJob ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Job Details</h3>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    selectedJob.status === 'processing' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                    selectedJob.status === 'completed' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  )}>
                    {selectedJob.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-sm space-y-2">
                  <div><strong>Job ID:</strong> {selectedJob.id}</div>
                  <div><strong>Started:</strong> {formatDate(selectedJob.created_at)}</div>
                  <div><strong>Status:</strong> {selectedJob.message}</div>
                </div>

                {selectedJob.status === 'processing' && (
                  <Progress value={selectedJob.progress} className="w-full" />
                )}

                {selectedJob.status === 'completed' && selectedJob.results && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-3 rounded-lg dark:bg-green-900/20">
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Processing Results</h4>
                      <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <div><strong>Successful files:</strong> {selectedJob.results.successful_files.length}</div>
                        <div><strong>Facilities processed:</strong> {selectedJob.results.facility_count.toLocaleString()}</div>
                        <div><strong>Administrative areas:</strong> {selectedJob.results.administrative_areas}</div>
                        {selectedJob.results.failed_files.length > 0 && (
                          <div className="text-amber-700 dark:text-amber-300">
                            <strong>Failed files:</strong> {selectedJob.results.failed_files.length}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Download Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => onDownload(selectedJob.id, 'map')}
                        >
                          <Map className="h-4 w-4 mr-2" />
                          Interactive Map
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => onDownload(selectedJob.id, 'heatmap')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Heatmap
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => onDownload(selectedJob.id, 'report')}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analysis Report
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => onDownload(selectedJob.id, 'geojson')}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          GeoJSON Data
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedJob.status === 'failed' && (
                  <div className="bg-red-50 p-3 rounded-lg dark:bg-red-900/20">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Processing Failed</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {selectedJob.message || 'An unknown error occurred during processing.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Select a job to view details</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingStatus;
