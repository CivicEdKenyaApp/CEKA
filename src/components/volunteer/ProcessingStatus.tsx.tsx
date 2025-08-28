import React from 'react';
import { FileInfo } from './DataProcessor';

interface ProcessingStatusProps {
  currentStep: number;
  totalSteps: number;
  files: FileInfo[];
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  currentStep,
  totalSteps,
  files
}) => {
  const steps = [
    'Uploading files',
    'Processing data',
    'Generating visualization',
    'Creating report',
    'Finalizing'
  ];

  const processingFiles = files.filter(f => f.status === 'processing');
  const completedFiles = files.filter(f => f.status === 'completed');
  const errorFiles = files.filter(f => f.status === 'error');

  return (
    <div className="processing-status">
      <h2>Processing Data</h2>
      
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Step {currentStep} of {totalSteps}: {steps[currentStep - 1]}
        </div>
      </div>

      <div className="files-progress">
        <h3>File Processing Status</h3>
        <div className="files-list">
          {files.map(file => (
            <div key={file.id} className="file-progress-item">
              <span className="file-name">{file.name}</span>
              <span className={`status status-${file.status}`}>
                {file.status}
              </span>
              {file.message && (
                <span className="file-message">{file.message}</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="progress-summary">
          <p>Total: {files.length} | Processing: {processingFiles.length} | 
            Completed: {completedFiles.length} | Errors: {errorFiles.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;