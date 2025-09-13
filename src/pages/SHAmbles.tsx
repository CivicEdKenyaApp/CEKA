import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ExternalLink, Map, Image, BarChart3, Filter, Grid3X3, List, 
  ChevronDown, ChevronUp, Expand, Shrink, ZoomIn, ZoomOut, 
  RefreshCw, Copy, Check, Heart, AlertTriangle, Users, Download, 
  Share, Eye, Upload, FileText, Database, Clock, CheckCircle, 
  XCircle, Play, Pause, Settings, HelpCircle, Info,
  Plus,
  Minus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '@/components/layout/Navbar';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Lazy load components for better performance
const DonationWidget = lazy(() => import('@/components/DonationWidget'));
const DataUploadWizard = lazy(() => import('@/components/DataUploadWizard'));
const ProcessingStatus = lazy(() => import('@/components/ProcessingStatus'));
const FacilityStatistics = lazy(() => import('@/components/FacilityStatistics'));
const AllocationAnalysis = lazy(() => import('@/components/AllocationAnalysis'));
const CountyComparison = lazy(() => import('@/components/CountyComparison'));
const DataProcessor = lazy(() => import('@/components/DataProcessor'));

interface Visualizer {
  id: number;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  display_order: number;
  geo_json_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  job_name: string;
  current_step: string | null;
  input_files: any;
  input_urls: any;
  output_files: any;
  error_message: string | null;
  processing_logs: any;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  user_id: string | null;
}

// URLs for GeoJSON data
const healthcareGeoJsonUrl = 'https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/healthcare%20data/kenya_healthcare_enhanced.geojson?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mYmE5NTY4OC04ZWFmLTQwNzYtYTljZi0wNWU2OWQ3ZjRjOWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJoZWFsdGhjYXJlIGRhdGEva2VueWFfaGVhbHRoY2FyZV9lbmhhbmNlZC5nZW9qc29uIiwiaWF0IjoxNzU2NTcxMzg2LCJleHAiOjI1NDQ5NzEzODZ9.t4eQD9V4uoU4rtXQvlNWS-IzvCInQOKseILJVdg3At0';
const kenyaBoundariesUrl = 'https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/healthcare%20data/FULL%20CORRECTED%20-%20Kenya%20Counties%20Voter%20Data.geojson?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mYmE5NTY4OC04ZWFmLTQwNzYtYTljZi0wNWU2OWQ3ZjRjOWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJoZWFsdGhjYXJlIGRhdGEvRlVMTCBDT1JSRUNURUQgLSBLZW55YSBDb3VudGllcyBWb3RlciBEYXRhLmdlb2pzb24iLCJpYXQiOjE3NTY1NzE0MzEsImV4cCI6MjU0NDk3MTQzMX0.lrSlSF3u75j38Obc2lQS7BggpnBSmC2f4-GvEZ_73-A';

const SHAmbles: React.FC = () => {
  const [visualizers, setVisualizers] = useState<Visualizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [zoomLevels, setZoomLevels] = useState<Record<number, number>>({});
  const [healthcareGeoJsonData, setHealthcareGeoJsonData] = useState<any>(null);
  const [kenyaBoundariesData, setKenyaBoundariesData] = useState<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [showProcessingStatus, setShowProcessingStatus] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [mapLayers, setMapLayers] = useState<Record<string, L.Layer>>({});
  const [showDataProcessor, setShowDataProcessor] = useState(false);
  
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dataProcessorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    fetchProcessingJobs();
    fetchGeoJsonData();
    
    // Set up real-time subscription for processing jobs
    const processingJobsSubscription = supabase
      .channel('processing_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'processing_jobs'
        },
        (payload) => {
          fetchProcessingJobs(); // Refresh jobs on any change
        }
      )
      .subscribe();
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      processingJobsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (healthcareGeoJsonData && kenyaBoundariesData && mapContainerRef.current && !mapInitialized) {
      initializeMap();
    }
  }, [healthcareGeoJsonData, kenyaBoundariesData, mapInitialized]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch visualizers from Supabase
      const { data: visualizersData, error: visualizersError } = await supabase
        .from('visualizers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (visualizersError) throw visualizersError;
      setVisualizers(visualizersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGeoJsonData = async () => {
    try {
      // Fetch healthcare facilities data
      const healthcareResponse = await fetch(healthcareGeoJsonUrl);
      const healthcareData = await healthcareResponse.json();
      setHealthcareGeoJsonData(healthcareData);
      setAnalysisData(healthcareData);

      // Fetch Kenya boundaries data
      const boundariesResponse = await fetch(kenyaBoundariesUrl);
      const boundariesData = await boundariesResponse.json();
      setKenyaBoundariesData(boundariesData);
    } catch (error) {
      console.error('Error fetching GeoJSON data:', error);
      toast({
        title: "Error",
        description: "Failed to load healthcare data",
        variant: "destructive",
      });
    }
  };

  const fetchProcessingJobs = async () => {
    try {
      const { data: jobs, error } = await supabase
        .from('processing_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProcessingJobs((jobs || []) as any);
    } catch (error) {
      console.error('Error fetching processing jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load processing jobs",
        variant: "destructive",
      });
    }
  };

  const initializeMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    try {
      // Initialize Leaflet map centered on Kenya
      mapRef.current = L.map(mapContainerRef.current).setView([-0.0236, 37.9062], 6);
      
      // Add OpenStreetMap base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Add Kenya administrative boundaries if available
      if (kenyaBoundariesData) {
        const boundariesLayer = L.geoJSON(kenyaBoundariesData, {
          style: () => ({
            fillColor: '#f0f0f0',
            weight: 2,
            opacity: 1,
            color: '#3388ff',
            fillOpacity: 0.1
          }),
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const popupContent = `<div class="p-2"><h3 class="font-bold text-lg">${feature.properties.name || 'Administrative Area'}</h3><p><strong>Type:</strong> ${feature.properties.admin_level || 'N/A'}</p><p><strong>Facilities:</strong> ${feature.properties.facility_count || '0'}</p></div>`;
              layer.bindPopup(popupContent);
            }
          }
        }).addTo(mapRef.current);
        setMapLayers(prev => ({ ...prev, boundaries: boundariesLayer }));
      }

      // Add healthcare facilities layer
      if (healthcareGeoJsonData) {
        const facilitiesLayer = L.geoJSON(healthcareGeoJsonData, {
          pointToLayer: (feature, latlng) => {
            const facilityType = feature.properties?.type || 'Other';
            const markerColor = getMarkerColor(facilityType);
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: markerColor,
              color: '#000',
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            });
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const props = feature.properties;
              const popupContent = `<div class="p-2 min-w-[250px]"><h3 class="font-bold text-lg">${props.name || 'Unknown Facility'}</h3><p><strong>Type:</strong> ${props.type || 'N/A'}</p><p><strong>County:</strong> ${props.county || 'N/A'}</p><p><strong>Constituency:</strong> ${props.constituency || 'N/A'}</p><p><strong>Owner:</strong> ${props.owner || 'N/A'}</p>${props.money_allocated ? `<p><strong>Allocation:</strong> KES ${props.money_allocated.toLocaleString()}</p>` : ''}${props.allocation_period ? `<p><strong>Period:</strong> ${props.allocation_period}</p>` : ''}</div>`;
              layer.bindPopup(popupContent);
            }
          }
        }).addTo(mapRef.current);
        setMapLayers(prev => ({ ...prev, facilities: facilitiesLayer }));
      }

      // Add legend
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend bg-white p-3 rounded shadow-md');
        const facilityTypes = [
          { type: 'Hospital', color: getMarkerColor('Hospital') },
          { type: 'Health Center', color: getMarkerColor('Health Center') },
          { type: 'Dispensary', color: getMarkerColor('Dispensary') },
          { type: 'Clinic', color: getMarkerColor('Clinic') },
          { type: 'Pharmacy', color: getMarkerColor('Pharmacy') },
          { type: 'Other', color: getMarkerColor('Other') }
        ];
        
        let legendHTML = '<h4 class="font-bold mb-2">Facility Types</h4>';
        facilityTypes.forEach(item => {
          legendHTML += `<div class="flex items-center mb-1"><div class="w-4 h-4 rounded-full mr-2" style="background-color: ${item.color}; border: 1px solid #000"></div><span>${item.type}</span></div>`;
        });
        
        div.innerHTML = legendHTML;
        return div;
      };
      legend.addTo(mapRef.current);
      
      setMapInitialized(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "Failed to initialize healthcare facilities map",
        variant: "destructive",
      });
    }
  };

  const getMarkerColor = (facilityType: string): string => {
    const typeColors: Record<string, string> = {
      'Hospital': '#e53e3e',
      'Health Center': '#3182ce',
      'Dispensary': '#38a169',
      'Clinic': '#805ad5',
      'Pharmacy': '#ed8936',
      'Laboratory': '#718096',
    };
    return typeColors[facilityType] || '#000000';
  };

  const toggleCardExpansion = (id: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const adjustZoom = (id: number, direction: 'in' | 'out') => {
    setZoomLevels(prev => ({
      ...prev,
      [id]: Math.min(200, Math.max(50, (prev[id] || 100) + (direction === 'in' ? 10 : -10)))
    }));
  };

  const refreshMap = () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    setMapInitialized(false);
    setTimeout(() => {
      fetchGeoJsonData();
    }, 100);
  };

  const copyGeoJsonUrl = async () => {
    try {
      await navigator.clipboard.writeText(healthcareGeoJsonUrl);
      toast({
        title: "URL Copied",
        description: "Healthcare data URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const openInGeoJsonIo = () => {
    if (!healthcareGeoJsonData) return;
    try {
      const jsonString = JSON.stringify(healthcareGeoJsonData);
      const b64Data = btoa(unescape(encodeURIComponent(jsonString)));
      const geoJsonIoUrl = `https://geojson.io/#data=data:application/json;base64,${b64Data}&map=6/-0.0236/37.9062`;
      window.open(geoJsonIoUrl, '_blank');
      toast({
        title: "Opening GeoJSON.io",
        description: "Healthcare facilities data is being loaded in GeoJSON.io",
      });
    } catch (error) {
      console.error('Error opening GeoJSON.io:', error);
      openDirectGeoJsonIo();
    }
  };

  const openDirectGeoJsonIo = () => {
    const encodedUrl = encodeURIComponent(healthcareGeoJsonUrl);
    const geoJsonIoUrl = `https://geojson.io/#data=data:text/x-url,${encodedUrl}&map=6/-0.0236/37.9062`;
    window.open(geoJsonIoUrl, '_blank');
    toast({
      title: "Opening GeoJSON.io",
      description: "Loading healthcare data directly from URL",
    });
  };

  const copyGeoJsonData = async () => {
    if (!healthcareGeoJsonData) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(healthcareGeoJsonData, null, 2));
      toast({
        title: "Data Copied",
        description: "Healthcare GeoJSON data copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy data to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleNewJobCreated = async (jobData: { name: string; files: string[]; urls: string[] }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: job, error } = await supabase
        .from('processing_jobs')
        .insert([
          {
            job_name: jobData.name,
            input_files: jobData.files,
            input_urls: jobData.urls,
            status: 'pending',
            progress: 0,
            user_id: user?.id || null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Job Created",
        description: "Your data processing job has been queued",
      });

      setShowProcessingStatus(true);
      setSelectedJob(job as ProcessingJob);
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: "Failed to create processing job",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async (jobId: string, fileType: string) => {
    try {
      const job = processingJobs.find(j => j.id === jobId);
      if (!job || !job.output_files) return;
      
      let filePath = '';
      let fileName = '';
      
      switch (fileType) {
        case 'map':
          filePath = job.output_files.map_path || '';
          fileName = 'interactive_map.html';
          break;
        case 'heatmap':
          filePath = job.output_files.heatmap_path || '';
          fileName = 'heatmap.html';
          break;
        case 'report':
          filePath = job.output_files.report_path || '';
          fileName = 'analysis_report.json';
          break;
        case 'geojson':
          filePath = job.output_files.geojson_path || '';
          fileName = 'enhanced_data.geojson';
          break;
      }
      
      if (!filePath) {
        toast({
          title: "Download Error",
          description: "File not available for download",
          variant: "destructive",
        });
        return;
      }
      
      // Get a signed URL for the file
      const { data: { signedUrl }, error } = await supabase.storage
        .from('processed-data')
        .createSignedUrl(filePath, 60); // 60 seconds expiration
      
      if (error) throw error;
      
      // Trigger download
      const link = document.createElement('a');
      link.href = signedUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Download Started",
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const toggleLayerVisibility = (layerKey: string, visible: boolean) => {
    if (mapRef.current && mapLayers[layerKey]) {
      if (visible) {
        mapRef.current.addLayer(mapLayers[layerKey]);
      } else {
        mapRef.current.removeLayer(mapLayers[layerKey]);
      }
    }
  };

  const scrollToDataProcessor = () => {
    setShowDataProcessor(true);
    setTimeout(() => {
      if (dataProcessorRef.current) {
        dataProcessorRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const categories = ['all', ...new Set(visualizers.map(v => v.category))].filter(Boolean) as string[];
  const filteredVisualizers = activeTab === 'all' ? visualizers : visualizers.filter(v => v.category === activeTab);

  const renderVisualizer = (visualizer: Visualizer) => {
    const zoomLevel = zoomLevels[visualizer.id] || 100;
    const isExpanded = expandedCards.has(visualizer.id);
    
    switch (visualizer.type) {
      case 'leaflet':
        return (
          <div className="relative group">
            <div className="w-full border rounded-lg overflow-hidden bg-muted/20 transition-all duration-300" style={{ height: isExpanded ? '600px' : '400px' }}>
              <div ref={mapContainerRef} className="w-full h-full" />
              {!mapInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading map...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={refreshMap}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={copyGeoJsonUrl}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={() => toggleCardExpansion(visualizer.id)}>
                {isExpanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            </div>
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-md">
              <h4 className="text-sm font-semibold mb-2">Map Layers</h4>
              <div className="space-y-1">
                <label className="flex items-center text-xs">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    onChange={(e) => toggleLayerVisibility('facilities', e.target.checked)}
                    className="mr-2"
                  />
                  Healthcare Facilities
                </label>
                <label className="flex items-center text-xs">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    onChange={(e) => toggleLayerVisibility('boundaries', e.target.checked)}
                    className="mr-2"
                  />
                  Administrative Boundaries
                </label>
              </div>
            </div>
          </div>
        );
      case 'interactive':
      case 'map':
        return (
          <div className="relative group">
            <div className="w-full h-96 border rounded-lg overflow-hidden bg-muted/20 transition-all duration-300" style={{ height: isExpanded ? '500px' : '384px' }}>
              <iframe 
                src={visualizer.url} 
                title={visualizer.title}
                className="w-full h-full border-0 transition-all duration-300"
                loading="lazy"
                allowFullScreen
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: '0 0' }}
              />
            </div>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={() => adjustZoom(visualizer.id, 'out')}>
                <Minus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={() => adjustZoom(visualizer.id, 'in')}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={() => toggleCardExpansion(visualizer.id)}>
                {isExpanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="relative group">
            <img 
              src={visualizer.url} 
              alt={visualizer.title}
              className={cn(
                "w-full h-auto rounded-lg transition-all duration-300 object-contain",
                isExpanded ? "max-h-[500px]" : "max-h-96"
              )}
              loading="lazy"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
            />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={() => adjustZoom(visualizer.id, 'out')}>
                <Minus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={() => adjustZoom(visualizer.id, 'in')}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={() => toggleCardExpansion(visualizer.id)}>
                {isExpanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Unsupported visualizer type</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                SHAmbles: Healthcare Facility Visualization
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl dark:text-slate-400">
                Interactive visualizations and comprehensive analysis of Kenya's healthcare infrastructure
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={scrollToDataProcessor}
                className="bg-kenya-green hover:bg-kenya-green/90 dark:bg-green-600 dark:hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Process Data
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setViewMode('grid')}
                className="gap-2 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setViewMode('list')}
                className="gap-2 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>

          {/* Processing Status Bar */}
          {processingJobs.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-slate-800/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900/30">
                      <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Data Processing</h3>
                      <p className="text-sm text-muted-foreground dark:text-slate-400">
                        {processingJobs.length} job{processingJobs.length !== 1 ? 's' : ''} in progress or completed
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowProcessingStatus(true)}
                    className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-white/80 backdrop-blur-sm border dark:bg-slate-800/80 dark:border-slate-700">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100"
                  >
                    {category === 'all' ? 'All' : category}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-400">
                <Filter className="h-4 w-4" />
                <span>{filteredVisualizers.length} visualizations</span>
              </div>
            </div>

            <TabsContent value={activeTab} className="space-y-6 mt-0">
              {/* Visualizations Grid */}
              <div className={cn("gap-6", viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col")}>
                {filteredVisualizers.map((visualizer) => {
                  const isExpanded = expandedCards.has(visualizer.id);
                  return (
                    <Card 
                      key={visualizer.id} 
                      className={cn(
                        "overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-300 dark:bg-slate-800/80 dark:text-slate-100",
                        isExpanded && "md:col-span-2 md:row-span-2"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                            {visualizer.type === 'leaflet' && <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                            {visualizer.type === 'interactive' && <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />}
                            {visualizer.type === 'map' && <Map className="h-5 w-5 text-green-600 dark:text-green-400" />}
                            {visualizer.type === 'image' && <Image className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                            {visualizer.title}
                          </CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 dark:text-slate-400 dark:hover:bg-slate-700"
                            onClick={() => toggleCardExpansion(visualizer.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                        <CardDescription className="dark:text-slate-400">
                          {visualizer.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {renderVisualizer(visualizer)}
                        <div className="mt-4 p-4 bg-slate-50/50 rounded-lg border border-slate-100 dark:bg-slate-700/50 dark:border-slate-600">
                          <h4 className="font-medium mb-2 text-slate-700 flex items-center gap-2 dark:text-slate-200">
                            <BarChart3 className="h-4 w-4" />
                            Analytical Interpretation
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {visualizer.type === 'leaflet' && "This interactive map provides a comprehensive view of healthcare facility distribution across Kenya. Each point represents a healthcare facility, color-coded by type. The map reveals significant disparities in healthcare access between urban and rural areas, with clear clustering around population centers."}
                            {visualizer.type === 'interactive' && "This interactive visualization allows for deep exploration of healthcare facility distribution patterns. Use the filtering options to examine specific facility types, ownership models, or geographic regions. The map reveals significant urban-rural disparities and identifies both healthcare service hubs and underserved areas."}
                            {visualizer.type === 'map' && "This comprehensive mapping solution provides multiple perspectives on healthcare infrastructure distribution. The layered approach allows for comparative analysis across administrative boundaries, revealing how healthcare access correlates with political and geographic divisions."}
                            {visualizer.type === 'image' && visualizer.title.includes('County') && "The county-level analysis reveals stark disparities in healthcare infrastructure investment. Urban counties show significantly higher facility density, while remote regions demonstrate limited access. This visualization highlights the need for targeted infrastructure development in underserved areas."}
                            {visualizer.type === 'image' && visualizer.title.includes('Constituency') && "Constituency-level data provides insights into the relationship between political representation and healthcare access. This visualization reveals patterns that may inform resource allocation decisions and policy development aimed at equitable healthcare distribution."}
                            {visualizer.type === 'image' && visualizer.title.includes('Ownership') && "The ownership distribution illustrates Kenya's mixed healthcare economy. The significant Ministry of Health presence demonstrates substantial public investment, while private and faith-based providers fill critical gaps. This mixed model represents both challenges and opportunities for healthcare system coordination."}
                            {visualizer.type === 'image' && visualizer.title.includes('Subcounty') && "Subcounty analysis provides granular insights often missed in broader examinations. This visualization reveals hyper-local patterns of healthcare access, identifying specific communities with limited services despite being in otherwise well-served counties."}
                            {visualizer.type === 'image' && visualizer.title.includes('Geographic Clusters') && "Cluster analysis identifies both service hubs and healthcare deserts. The visualization reveals patterns of healthcare facility aggregation that correlate with population density, transportation infrastructure, and historical development patterns, highlighting areas needing targeted intervention."}
                          </p>
                        </div>
                        {visualizer.type !== 'image' && visualizer.type !== 'leaflet' && (
                          <Button 
                            variant="outline" 
                            className="w-full mt-4 gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            asChild
                          >
                            <a href={visualizer.url} target="_blank" rel="noopener noreferrer">
                              Open in new tab
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Analysis Sections */}
          {healthcareGeoJsonData && (
            <div className="space-y-8">
              {/* Facility Statistics */}
              <Suspense fallback={
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-slate-800/80">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              }>
                <FacilityStatistics />
              </Suspense>

              {/* Allocation Analysis */}
              <Suspense fallback={
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-slate-800/80">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              }>
                <AllocationAnalysis />
              </Suspense>

              {/* County Comparison */}
              <Suspense fallback={
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-slate-800/80">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              }>
                <CountyComparison />
              </Suspense>
            </div>
          )}

          {/* Data Processor Section */}
          <div ref={dataProcessorRef}>
            <Suspense fallback={
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-slate-800/80">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            }>
              {showDataProcessor && <DataProcessor />}
            </Suspense>
          </div>

          {/* Call to Action Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden text-center dark:bg-slate-800/80 dark:text-slate-100">
            <CardContent className="p-8">
              <AlertTriangle className="w-16 h-16 text-kenya-red mx-auto mb-4 dark:text-red-400" />
              <h2 className="text-3xl font-bold text-kenya-green mb-4 dark:text-green-500">Help Us Improve Healthcare Transparency</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto dark:text-slate-400">
                Your support helps us continue our mission of tracking healthcare resource allocation and ensuring equitable distribution across Kenya.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-kenya-green hover:bg-kenya-green/90 dark:bg-green-600 dark:hover:bg-green-700"
                  onClick={() => window.open('https://ko-fi.com/civiceducationke', '_blank')}
                >
                  <Heart className="mr-2" />
                  Support Our Work
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-kenya-red text-kenya-red hover:bg-kenya-red/10 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/10"
                  onClick={scrollToDataProcessor}
                >
                  <Upload className="mr-2" />
                  Upload Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Floating Donation Widget */}
        <Suspense fallback={null}>
          <DonationWidget />
        </Suspense>

        {/* Data Upload Wizard Modal */}
        <Suspense fallback={null}>
          {showUploadWizard && (
            <DataUploadWizard 
              onClose={() => setShowUploadWizard(false)}
              onJobCreated={handleNewJobCreated as any}
            />
          )}
        </Suspense>

        {/* Processing Status Modal */}
        <Suspense fallback={null}>
          {showProcessingStatus && (
            <ProcessingStatus 
              jobs={processingJobs as any}
              selectedJob={selectedJob as any}
              onSelectJob={setSelectedJob as any}
              onDownload={downloadFile}
              onClose={() => setShowProcessingStatus(false)}
            />
          )}
        </Suspense>
      </div>
    </>
  );
};

export default SHAmbles;
