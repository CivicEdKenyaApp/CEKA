import React, { useState, useEffect } from 'react';

interface ReportViewerProps {
  reportPath?: string;
}

interface ReportData {
  title: string;
  generated_date: string;
  summary: any;
  details: any;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ reportPath }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (reportPath) {
      loadReportData(reportPath);
    }
  }, [reportPath]);

  const loadReportData = async (path: string) => {
    try {
      setLoading(true);
      // In a real implementation, we would fetch from Supabase storage
      const data = await fetchReportData(path);
      setReportData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load report data');
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (path: string): Promise<ReportData> => {
    // This would be replaced with actual Supabase storage fetch
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          title: "Data Processing Report",
          generated_date: new Date().toISOString(),
          summary: {
            total_files: 3,
            processed_files: 3,
            errors: 0,
            processing_time: "15 seconds"
          },
          details: {
            file_types: {
              csv: 1,
              geojson: 1,
              json: 1
            },
            data_quality: {
              valid_records: 150,
              invalid_records: 2
            }
          }
        });
      }, 1000);
    });
  };

  const downloadReport = () => {
    // Implementation for downloading the report
    console.log('Downloading report...');
  };

  if (loading) {
    return (
      <div className="report-viewer">
        <div className="loading">Loading report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-viewer">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="report-viewer">
      <div className="report-header">
        <h3>{reportData?.title}</h3>
        <button className="btn-secondary" onClick={downloadReport}>
          Download Report
        </button>
      </div>

      <div className="report-meta">
        <p>Generated on: {new Date(reportData?.generated_date || '').toLocaleString()}</p>
      </div>

      <div className="report-tabs">
        <button 
          className={activeTab === 'summary' ? 'active' : ''}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
      </div>

      <div className="report-content">
        {activeTab === 'summary' && (
          <div className="summary-section">
            <h4>Processing Summary</h4>
            <div className="summary-grid">
              {reportData?.summary && Object.entries(reportData.summary).map(([key, value]) => (
                <div key={key} className="summary-item">
                  <span className="summary-key">{key.replace(/_/g, ' ')}:</span>
                  <span className="summary-value">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="details-section">
            <h4>Detailed Report</h4>
            <pre>{JSON.stringify(reportData?.details, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;