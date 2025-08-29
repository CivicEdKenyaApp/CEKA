import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Database, Map, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataUploadWizardProps {
  onClose: () => void;
  onJobCreated: (jobId: string) => void;
}

const DataUploadWizard: React.FC<DataUploadWizardProps> = ({ onClose, onJobCreated }) => {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  };

  const handleProcessData = async () => {
    setIsProcessing(true);
    
    // Simulate processing - in a real app, this would call your backend API
    setTimeout(() => {
      const jobId = `job_${Date.now()}`;
      onJobCreated(jobId);
      setIsProcessing(false);
      setStep(4);
    }, 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Process Healthcare Data
          </DialogTitle>
          <DialogDescription>
            Upload and process healthcare facility data to generate interactive visualizations and reports
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress indicator */}
          <div className="flex justify-between items-center mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  i < step ? "bg-kenya-green text-white" : 
                  i === step ? "bg-blue-600 text-white" : 
                  "bg-gray-200 text-gray-500"
                )}>
                  {i < step ? <CheckCircle className="h-5 w-5" /> : i}
                </div>
                <div className="text-xs mt-1 text-center">
                  {i === 1 && "Upload"}
                  {i === 2 && "Review"}
                  {i === 3 && "Process"}
                  {i === 4 && "Complete"}
                </div>
              </div>
            ))}
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop your files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".csv,.json,.geojson,.kml,.topojson,.wkt,.png,.pdf"
                />
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span>Select Files</span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: CSV, JSON, GeoJSON, KML, TopoJSON, WKT, PNG, PDF
                </p>
              </div>

              {files.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Selected Files:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={files.length === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                <h4 className="font-medium mb-2">Files to be processed:</h4>
                <ul className="text-sm">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center gap-2 py-1">
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <Database className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Your data will be processed and analyzed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Map className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Interactive maps will be generated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Comprehensive reports will be created</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Start Processing
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                {isProcessing ? (
                  <>
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Processing your data...</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This may take a few minutes depending on the size of your files
                    </p>
                    <Progress value={33} className="mt-6" />
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Processing Complete!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your data has been successfully processed
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={isProcessing ? undefined : () => setStep(4)}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'View Results'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg text-center dark:bg-green-900/20">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                  Processing Complete!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Your healthcare data has been successfully processed. You can now view the interactive visualizations and download the reports.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What's available:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Interactive map visualization
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Comprehensive analysis report
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Enhanced GeoJSON data
                  </li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={onClose}>
                  View Results
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataUploadWizard;
