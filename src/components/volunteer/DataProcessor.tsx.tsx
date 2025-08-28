import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from '../../lib/supabase/client';
import FileUploader from './FileUploader';
import ProcessingStatus from './ProcessingStatus';
import Visualization from './Visualization';
import ReportViewer from './ReportViewer';
import { processDataPipeline } from '../../utils/dataPipeline';
import './DataProcessor.css';

interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
}

interface ProcessingResult {
  success: boolean;
  geojsonPath?: string;
  reportPath?: string;
  visualizationPath?: string;
  errors?: string[];
}

const DataProcessor: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (selectedFiles: FileList) => {
    const newFiles: FileInfo[] = [];
    
    Array.from(selectedFiles).forEach(file => {
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type || file.name.split('.').pop() || 'unknown',
        size: file.size,
        status: 'pending'
      });
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const startProcessing = async () => {
    setProcessing(true);
    setCurrentStep(1);
    
    try {
      // Upload files to Supabase storage
      const uploadedPaths = await uploadFilesToStorage();
      
      // Process the data
      setCurrentStep(2);
      const processingResult = await processDataPipeline(uploadedPaths);
      
      setCurrentStep(3);
      setResults(processingResult);
      
      // Update file statuses
      setFiles(prev => prev.map(file => ({
        ...file,
        status: processingResult.success ? 'completed' : 'error',
        message: processingResult.errors?.join(', ')
      })));
    } catch (error) {
      console.error('Processing error:', error);
      setResults({
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'error',
        message: 'Processing failed'
      })));
    } finally {
      setProcessing(false);
      setCurrentStep(4);
    }
  };

  const uploadFilesToStorage = async (): Promise<string[]> => {
    const paths: string[] = [];
    
    for (const fileInfo of files) {
      const file = await getFileByName(fileInfo.name);
      if (!file) continue;
      
      const timestamp = new Date().getTime();
      const filePath = `uploads/${timestamp}_${fileInfo.name}`;
      
      const { error } = await supabase.storage
        .from('data-processing')
        .upload(filePath, file);
      
      if (error) {
        throw new Error(`Failed to upload ${fileInfo.name}: ${error.message}`);
      }
      
      paths.push(filePath);
      
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileInfo.id ? { ...f, status: 'processing' } : f
      ));
    }
    
    return paths;
  };

  const getFileByName = async (name: string): Promise<File | null> => {
    // This would need access to the original File objects
    // In a real implementation, we'd store these in state
    return null;
  };

  const resetProcessor = () => {
    setFiles([]);
    setProcessing(false);
    setResults(null);
    setCurrentStep(0);
  };

  return (
    <div className="data-processor-container">
      <div className="processor-header">
        <h1>GeoJSON Integration & Visualization System</h1>
        <p>Upload and process geospatial data in multiple formats</p>
      </div>

      {!processing && files.length === 0 && (
        <FileUploader 
          onFilesSelected={handleFilesSelected}
          ref={fileInputRef}
        />
      )}

      {files.length > 0 && !processing && !results && (
        <div className="files-section">
          <h2>Selected Files</h2>
          <div className="files-list">
            {files.map(file => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                  <span className={`status status-${file.status}`}>
                    {file.status}
                  </span>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeFile(file.id)}
                  disabled={processing}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={startProcessing}
              disabled={processing}
            >
              Start Processing
            </button>
            <button 
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
            >
              Add More Files
            </button>
          </div>
        </div>
      )}

      {processing && (
        <ProcessingStatus 
          currentStep={currentStep}
          totalSteps={4}
          files={files}
        />
      )}

      {results && (
        <div className="results-section">
          <h2>Processing Results</h2>
          {results.success ? (
            <>
              <div className="success-message">
                <h3>Processing Completed Successfully!</h3>
                <p>Your data has been processed and is ready for visualization.</p>
              </div>
              <div className="result-actions">
                <Visualization dataPath={results.visualizationPath} />
                <ReportViewer reportPath={results.reportPath} />
                <button className="btn-secondary" onClick={resetProcessor}>
                  Process New Data
                </button>
              </div>
            </>
          ) : (
            <div className="error-message">
              <h3>Processing Failed</h3>
              <p>{results.errors?.join(', ')}</p>
              <button className="btn-primary" onClick={resetProcessor}>
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default DataProcessor;