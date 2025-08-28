import React, { useRef, useCallback } from 'react';

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
}

const FileUploader = React.forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onFilesSelected }, ref) => {
    const dropAreaRef = useRef<HTMLDivElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropAreaRef.current) {
        dropAreaRef.current.classList.add('drag-over');
      }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropAreaRef.current) {
        dropAreaRef.current.classList.remove('drag-over');
      }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropAreaRef.current) {
        dropAreaRef.current.classList.remove('drag-over');
      }
      
      const { files } = e.dataTransfer;
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
    }, [onFilesSelected]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(e.target.files);
      }
    };

    return (
      <div className="file-uploader">
        <div 
          ref={dropAreaRef}
          className="drop-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-content">
            <svg className="upload-icon" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <h3>Drag & Drop Files Here</h3>
            <p>Supported formats: CSV, JSON, GeoJSON, KML, TopoJSON, WKT, PNG, PDF</p>
            <button 
              className="btn-primary"
              onClick={() => (ref as React.RefObject<HTMLInputElement>)?.current?.click()}
            >
              Browse Files
            </button>
          </div>
        </div>
        <input
          ref={ref}
          type="file"
          multiple
          accept=".csv,.json,.geojson,.kml,.topojson,.wkt,.png,.pdf"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }
);

FileUploader.displayName = 'FileUploader';

export default FileUploader;