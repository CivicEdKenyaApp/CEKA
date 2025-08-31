import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Globe, Database, Map, Download, RefreshCw, Eye, EyeOff, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Base URL for API depending on environment
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:5000' // Flask dev server
  : 'https://ceka-production.up.railway.app'; // Flask prod server

interface ProcessedDataset {
  session_id: string;
  data_type: string;
  processed_date: string;
  total_records: number;
  has_geojson: boolean;
  status?: string;
  progress?: number;
}

interface ProcessingJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  created_at: string;
  results?: {
    successful_files: string[];
    failed_files: string[];
    facility_count: number;
    administrative_areas: number;
  };
}

const DataProcessor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [dataType, setDataType] = useState('healthcare');
  const [uploadStatus, setUploadStatus] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [datasets, setDatasets] = useState<ProcessedDataset[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapLayers, setMapLayers] = useState<Record<string, L.Layer>>({});
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize map
    if (mapContainerRef.current && !map) {
      const mapInstance = L.map(mapContainerRef.current).setView([-0.0236, 37.9062], 6);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);
      
      setMap(mapInstance);
      loadKenyaGeoJSON(mapInstance);
    }
    
    // Load datasets and processing jobs
    loadDatasets();
    loadProcessingJobs();
    
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  const loadKenyaGeoJSON = async (mapInstance: L.Map) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/kenya-geojson`);
      const kenyaLayer = L.geoJSON(response.data, {
        style: {
          color: '#3388ff',
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.1
        }
      }).addTo(mapInstance);
      
      setMapLayers(prev => ({ ...prev, kenya: kenyaLayer }));
    } catch (error) {
      console.error('Error loading Kenya GeoJSON:', error);
      toast({
        title: "Error",
        description: "Failed to load Kenya base map",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleCrawlUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCrawlUrl(event.target.value);
  };

  const handleDataTypeChange = (value: string) => {
    setDataType(value);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setUploadStatus('Uploading file...');

    const formData = new FormData();
    formData.append('files', selectedFile);
    formData.append('data_type', dataType);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSessionId(response.data.job_id || '');
      setUploadStatus('File uploaded. Processing started...');
      
      // Add to processing jobs
      const newJob: ProcessingJob = {
        id: response.data.job_id || `job-${Date.now()}`,
        status: 'processing',
        progress: 0,
        message: 'Processing uploaded file',
        created_at: new Date().toISOString()
      };
      
      setProcessingJobs(prev => [newJob, ...prev]);
      
      // Poll for status updates
      pollJobStatus(newJob.id);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed');
      setProcessing(false);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCrawl = async () => {
    if (!crawlUrl) {
      toast({
        title: "Error",
        description: "Please enter a URL to crawl",
        variant: "destructive",
      });
      return;
    }

    setCrawling(true);
    setUploadStatus('Starting crawl...');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/process-url`, {
        url: crawlUrl,
        data_type: dataType
      });

      setSessionId(response.data.job_id || '');
      setUploadStatus('Crawling started. Processing will begin once completed.');
      
      // Add to processing jobs
      const newJob: ProcessingJob = {
        id: response.data.job_id || `job-${Date.now()}`,
        status: 'processing',
        progress: 0,
        message: 'Crawling website for data',
        created_at: new Date().toISOString()
      };
      
      setProcessingJobs(prev => [newJob, ...prev]);
      
      // Poll for status updates
      pollJobStatus(newJob.id);
      
    } catch (error) {
      console.error('Crawl error:', error);
      setUploadStatus('Crawl failed');
      setCrawling(false);
      toast({
        title: "Crawl Failed",
        description: "Failed to start crawling. Please check the URL and try again.",
        variant: "destructive",
      });
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const checkStatus = async () => {
      try {
        const statusResponse = await axios.get(`${API_BASE_URL}/api/status/${jobId}`);
        const jobData = statusResponse.data;
        
        // Update job in state
        setProcessingJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, ...jobData } : job
        ));
        
        if (jobData.status === 'processing') {
          // Check again after 2 seconds
          setTimeout(checkStatus, 2000);
        } else if (jobData.status === 'completed') {
          setUploadStatus('Processing completed successfully!');
          setProcessing(false);
          setCrawling(false);
          loadDatasets(); // Refresh dataset list
          
          // Add the new dataset to the map if it has GeoJSON
          if (jobData.results && jobData.results.geojson_url) {
            addDatasetToMap(jobId, jobData.results.geojson_url);
          }
          
          toast({
            title: "Processing Complete",
            description: "Your data has been successfully processed.",
          });
        } else if (jobData.status === 'failed') {
          setUploadStatus(`Error: ${jobData.message}`);
          setProcessing(false);
          setCrawling(false);
          toast({
            title: "Processing Failed",
            description: jobData.message || "An error occurred during processing.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setUploadStatus('Error checking status');
        setProcessing(false);
        setCrawling(false);
      }
    };

    setTimeout(checkStatus, 2000);
  };

  const addDatasetToMap = async (sessionId: string, geojsonUrl: string) => {
    try {
      const response = await axios.get(geojsonUrl);
      
      // Remove existing layer for this dataset if it exists
      if (mapLayers[sessionId] && map) {
        map.removeLayer(mapLayers[sessionId]);
      }
      
      // Create a new layer for this dataset
      const newLayer = L.geoJSON(response.data, {
        pointToLayer: (feature, latlng) => {
          // Custom markers based on facility type
          const type = feature.properties?.type || 'Other';
          const color = getColorForType(type);
          
          return L.marker(latlng, {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
          });
        },
        onEachFeature: (feature, layer) => {
          // Popup content
          const props = feature.properties;
          const popupContent = `
            <div>
              <h3>${props.name || 'Unknown'}</h3>
              <p><strong>Type:</strong> ${props.type || 'N/A'}</p>
              <p><strong>County:</strong> ${props.county || 'N/A'}</p>
              <p><strong>Constituency:</strong> ${props.constituency || 'N/A'}</p>
              <p><strong>Data Source:</strong> ${props.data_source || 'N/A'}</p>
            </div>
          `;
          
          layer.bindPopup(popupContent);
        }
      });
      
      if (map) {
        newLayer.addTo(map);
      }
      
      // Store the layer reference
      setMapLayers(prev => ({ ...prev, [sessionId]: newLayer }));
      
    } catch (error) {
      console.error('Error adding dataset to map:', error);
      toast({
        title: "Map Error",
        description: "Failed to add dataset to map",
        variant: "destructive",
      });
    }
  };

  const getColorForType = (type: string): string => {
    const colorMap: Record<string, string> = {
      'Hospital': 'red',
      'Health Center': 'blue',
      'Dispensary': 'green',
      'Clinic': 'purple',
      'Pharmacy': 'orange',
      'Laboratory': 'gray',
      'Other': 'black'
    };
    
    return colorMap[type] || 'black';
  };

  const loadDatasets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/datasets`);
      setDatasets(response.data.datasets || []);
      
      // Add all datasets to the map
      for (const dataset of response.data.datasets) {
        if (dataset.has_geojson) {
          addDatasetToMap(dataset.session_id, `${API_BASE_URL}/api/geojson/${dataset.session_id}`);
        }
      }
    } catch (error) {
      console.error('Error loading datasets:', error);
      toast({
        title: "Error",
        description: "Failed to load datasets",
        variant: "destructive",
      });
    }
  };

  const loadProcessingJobs = async () => {
    try {
      // In a real implementation, you would fetch jobs from the API
      // For now, we'll use the local state only
    } catch (error) {
      console.error('Error loading processing jobs:', error);
    }
  };

  const downloadFile = async (sessionId: string, fileType: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/download/${sessionId}/${fileType}`, {
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set appropriate file extension
      const extensions: Record<string, string> = {
        'cleaned': 'csv',
        'geojson': 'geojson',
        'report': 'json',
        'summary': 'txt',
        'map': 'html'
      };
      
      link.setAttribute('download', `processed_data.${extensions[fileType]}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Download Started",
        description: "Your file download has started.",
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleLayerVisibility = (sessionId: string, visible: boolean) => {
    if (mapLayers[sessionId] && map) {
      if (visible) {
        map.addLayer(mapLayers[sessionId]);
      } else {
        map.removeLayer(mapLayers[sessionId]);
      }
    }
  };

  const removeJob = (jobId: string) => {
    setProcessingJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kenya Healthcare Data Processor</h1>
        <Button onClick={loadDatasets} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
          <TabsTrigger value="process">Processing Status</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Input Methods</CardTitle>
              <CardDescription>
                Upload your healthcare data files or provide a website URL to crawl for data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File Upload Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    File Upload
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="file">Select Data File</Label>
                    <Input 
                      id="file" 
                      type="file" 
                      onChange={handleFileChange}
                      accept=".csv,.json,.geojson,.xlsx,.xls"
                    />
                    <p className="text-sm text-muted-foreground">
                      Supported formats: CSV, JSON, GeoJSON, Excel
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataType">Data Type</Label>
                    <Select value={dataType} onValueChange={handleDataTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthcare">Healthcare Facilities</SelectItem>
                        <SelectItem value="education">Education Institutions</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleUpload} 
                    disabled={processing || !selectedFile}
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload and Process
                      </>
                    )}
                  </Button>
                </div>

                {/* Website Crawling Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Website Crawling
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="crawlUrl">Website URL</Label>
                    <Input 
                      id="crawlUrl" 
                      type="url" 
                      placeholder="https://example.com/healthcare-facilities" 
                      value={crawlUrl}
                      onChange={handleCrawlUrlChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter a URL to crawl for healthcare facility data
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crawlDataType">Data Type</Label>
                    <Select value={dataType} onValueChange={handleDataTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthcare">Healthcare Facilities</SelectItem>
                        <SelectItem value="education">Education Institutions</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleCrawl} 
                    disabled={crawling || !crawlUrl}
                    className="w-full"
                  >
                    {crawling ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Crawling...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Start Crawling
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {uploadStatus && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{uploadStatus}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive Map */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Map</CardTitle>
              <CardDescription>
                Visualize processed healthcare facilities data on an interactive map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={mapContainerRef} className="w-full h-96 rounded-lg border" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-6">
          {/* Processing Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Jobs</CardTitle>
              <CardDescription>
                Monitor the status of your data processing jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processingJobs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No processing jobs found</p>
              ) : (
                <div className="space-y-4">
                  {processingJobs.map(job => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          <span className="font-medium">Job {job.id.slice(-6)}</span>
                          <Badge 
                            variant={
                              job.status === 'completed' ? 'default' :
                              job.status === 'processing' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeJob(job.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatDate(job.created_at)}
                      </p>
                      
                      <p className="text-sm mb-3">{job.message}</p>
                      
                      {job.status === 'processing' && (
                        <Progress value={job.progress} className="h-2" />
                      )}
                      
                      {job.status === 'completed' && job.results && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm">
                            <strong>Successful files:</strong> {job.results.successful_files.length}
                          </p>
                          <p className="text-sm">
                            <strong>Facilities processed:</strong> {job.results.facility_count.toLocaleString()}
                          </p>
                          <p className="text-sm">
                            <strong>Administrative areas:</strong> {job.results.administrative_areas}
                          </p>
                          
                          {job.results.failed_files.length > 0 && (
                            <p className="text-sm text-destructive">
                              <strong>Failed files:</strong> {job.results.failed_files.length}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processed Datasets */}
          <Card>
            <CardHeader>
              <CardTitle>Processed Datasets</CardTitle>
              <CardDescription>
                Access and manage your processed healthcare datasets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {datasets.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No processed datasets found</p>
              ) : (
                <div className="space-y-4">
                  {datasets.map(dataset => (
                    <div key={dataset.session_id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{dataset.data_type} Dataset</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(dataset.processed_date)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {dataset.total_records.toLocaleString()} records
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button 
                          size="sm" 
                          onClick={() => toggleLayerVisibility(
                            dataset.session_id, 
                            !mapLayers[dataset.session_id]?.getAttribution?.()
                          )}
                        >
                          {mapLayers[dataset.session_id]?.getAttribution?.() ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Hide on Map
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Show on Map
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadFile(dataset.session_id, 'cleaned')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Cleaned Data
                        </Button>
                        
                        {dataset.has_geojson && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadFile(dataset.session_id, 'geojson')}
                          >
                            <Map className="h-4 w-4 mr-1" />
                            GeoJSON
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadFile(dataset.session_id, 'report')}
                        >
                          <Database className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataProcessor;
