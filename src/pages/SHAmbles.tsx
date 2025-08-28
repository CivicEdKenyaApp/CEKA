import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Map, Image, BarChart3, Filter, Grid3X3, List, ChevronDown, ChevronUp, Expand, Shrink, ZoomIn, ZoomOut, RefreshCw, Copy, Check, Heart, AlertTriangle, Users, Download, Share, Eye } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '@/components/layout/Navbar';

// Lazy load components for better performance
const FacilityStatistics = lazy(() => import('@/components/FacilityStatistics'));
const AllocationAnalysis = lazy(() => import('@/components/AllocationAnalysis'));
const CountyComparison = lazy(() => import('@/components/CountyComparison'));
const DonationWidget = lazy(() => import('@/components/DonationWidget'));

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
}

interface FacilityStats {
  total_facilities: number;
  facilities_with_coords: number;
  counties_count: number;
  subcounties_count: number;
  constituencies_count: number;
  operational_facilities: number;
  facility_types: Record<string, number>;
  ownership_types: Record<string, number>;
}

interface HealthFacility {
  FID: number;
  OBJECTID?: number;
  name: string | null;
  type: string | null;
  owner: string | null;
  county: string | null;
  subcounty: string | null;
  division: string | null;
  location: string | null;
  sub_location: string | null;
  constituency: string | null;
  nearest_to: string | null;
  latitude: number | null;
  longitude: number | null;
}

const SHAmbles: React.FC = () => {
  const [visualizers, setVisualizers] = useState<Visualizer[]>([]);
  const [facilityStats, setFacilityStats] = useState<FacilityStats | null>(null);
  const [healthFacilities, setHealthFacilities] = useState<HealthFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [zoomLevels, setZoomLevels] = useState<Record<number, number>>({});
  const [healthcareGeoJsonData, setHealthcareGeoJsonData] = useState<any>(null);
  const [kenyaBoundariesData, setKenyaBoundariesData] = useState<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if ((healthcareGeoJsonData || healthFacilities.length > 0) && kenyaBoundariesData && mapContainerRef.current && !mapInitialized) {
      initializeMap();
    }
  }, [healthcareGeoJsonData, kenyaBoundariesData, mapInitialized, healthFacilities]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch visualizers
      const { data: visualizersData, error: visualizersError } = await supabase
        .from('visualizers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (visualizersError) throw visualizersError;
      setVisualizers(visualizersData || []);

      // Fetch health facilities data
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('health_facilities')
        .select('*')
        .limit(10000); // Limit to prevent overfetching but ensure we get enough data

      if (facilitiesError) throw facilitiesError;
      
      if (facilitiesData) {
        setHealthFacilities(facilitiesData);
        
        const uniqueCounties = new Set(facilitiesData.map(f => f.county).filter(Boolean));
        const uniqueSubcounties = new Set(facilitiesData.map(f => f.subcounty).filter(Boolean));
        const uniqueConstituencies = new Set(facilitiesData.map(f => f.constituency).filter(Boolean));
        const facilitiesWithCoords = facilitiesData.filter(f => f.latitude !== null && f.longitude !== null).length;
        const operationalFacilities = facilitiesData.filter(f => f.operational_status === 'Operational').length;

        // Count facility types
        const facilityTypes: Record<string, number> = {};
        facilitiesData.forEach(f => {
          const type = f.type || 'Unknown';
          facilityTypes[type] = (facilityTypes[type] || 0) + 1;
        });

        // Count ownership types
        const ownershipTypes: Record<string, number> = {};
        facilitiesData.forEach(f => {
          const owner = f.owner || 'Unknown';
          ownershipTypes[owner] = (ownershipTypes[owner] || 0) + 1;
        });

        setFacilityStats({
          total_facilities: facilitiesData.length,
          facilities_with_coords: facilitiesWithCoords,
          counties_count: uniqueCounties.size,
          subcounties_count: uniqueSubcounties.size,
          constituencies_count: uniqueConstituencies.size,
          operational_facilities: operationalFacilities,
          facility_types: facilityTypes,
          ownership_types: ownershipTypes
        });

        // Convert facilities data to GeoJSON format for the map
        const geoJsonData = convertToGeoJSON(facilitiesData);
        setHealthcareGeoJsonData(geoJsonData);
      }

      // Try to fetch Kenya boundaries data
      try {
        const boundariesResponse = await fetch('https://raw.githubusercontent.com/CodeForAfrica/kenya-geojson/master/counties.geojson');
        const boundariesData = await boundariesResponse.json();
        setKenyaBoundariesData(boundariesData);
      } catch (e) {
        console.log('Could not load boundaries data, using default');
      }
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

  const convertToGeoJSON = (facilities: HealthFacility[]): any => {
    return {
      type: 'FeatureCollection',
      features: facilities
        .filter(f => f.latitude !== null && f.longitude !== null)
        .map(facility => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [facility.longitude, facility.latitude]
          },
          properties: {
            name: facility.name,
            type: facility.type,
            owner: facility.owner,
            county: facility.county,
            constituency: facility.constituency,
            // Add other properties as needed
          }
        }))
    };
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
        L.geoJSON(kenyaBoundariesData, {
          style: () => ({
            fillColor: '#f0f0f0',
            weight: 2,
            opacity: 1,
            color: '#3388ff',
            fillOpacity: 0.1
          }),
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const popupContent = `<div class="p-2"><h3 class="font-bold text-lg">${feature.properties.name || 'Administrative Area'}</h3><p><strong>Type:</strong> ${feature.properties.admin_level || 'N/A'}</p></div>`;
              layer.bindPopup(popupContent);
            }
          }
        }).addTo(mapRef.current);
      }
      
      // Add healthcare facilities layer
      if (healthcareGeoJsonData) {
        L.geoJSON(healthcareGeoJsonData, {
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
              const popupContent = `<div class="p-2 min-w-[250px]"><h3 class="font-bold text-lg">${props.name || 'Unknown Facility'}</h3><p><strong>Type:</strong> ${props.type || 'N/A'}</p><p><strong>County:</strong> ${props.county || 'N/A'}</p><p><strong>Constituency:</strong> ${props.constituency || 'N/A'}</p><p><strong>Owner:</strong> ${props.owner || 'N/A'}</p></div>`;
              layer.bindPopup(popupContent);
            }
          }
        }).addTo(mapRef.current);
      }
      
      // Add legend
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend bg-white p-3 rounded shadow-md dark:bg-gray-800 dark:text-white');
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
      initializeMap();
    }, 100);
  };

  const copyGeoJsonUrl = async () => {
    const leafletVisualizer = visualizers.find(v => v.type === 'leaflet');
    if (!leafletVisualizer?.geo_json_url) return;
    
    try {
      await navigator.clipboard.writeText(leafletVisualizer.geo_json_url);
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

  const categories = ['all', ...new Set(visualizers.map(v => v.category))].filter(Boolean) as string[];
  const filteredVisualizers = activeTab === 'all' ? visualizers : visualizers.filter(v => v.category === activeTab);

  const renderVisualizer = (visualizer: Visualizer) => {
    const zoomLevel = zoomLevels[visualizer.id] || 100;
    const isExpanded = expandedCards.has(visualizer.id);
    
    switch (visualizer.type) {
      case 'leaflet':
        return (
          <div className="relative group">
            <div className="w-full border rounded-lg overflow-hidden bg-muted/20 transition-all duration-300 dark:bg-gray-800/50" style={{ height: isExpanded ? '600px' : '400px' }}>
              <div ref={mapContainerRef} className="w-full h-full" />
              {!mapInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm dark:bg-gray-900/70">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading map...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm dark:bg-gray-800" onClick={refreshMap}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm dark:bg-gray-800" onClick={copyGeoJsonUrl}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm dark:bg-gray-800" onClick={() => toggleCardExpansion(visualizer.id)}>
                {isExpanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      case 'interactive':
      case 'map':
        return (
          <div className="relative group">
            <div className="w-full h-96 border rounded-lg overflow-hidden bg-muted/20 transition-all duration-300 dark:bg-gray-800/50" style={{ height: isExpanded ? '500px' : '384px' }}>
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
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm dark:bg-gray-800" onClick={() => adjustZoom(visualizer.id, 'out')}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm dark:bg-gray-800" onClick={() => adjustZoom(visualizer.id, 'in')}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm dark:bg-gray-800" onClick={() => toggleCardExpansion(visualizer.id)}>
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
              className={cn("w-full h-auto rounded-lg transition-all duration-300 object-contain dark:bg-gray-800", isExpanded ? "max-h-[500px]" : "max-h-96")} 
              loading="lazy" 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
            />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm dark:bg-gray-800" onClick={() => adjustZoom(visualizer.id, 'out')}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm dark:bg-gray-800" onClick={() => adjustZoom(visualizer.id, 'in')}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm dark:bg-gray-800" onClick={() => toggleCardExpansion(visualizer.id)}>
                {isExpanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-64 bg-muted/20 rounded-lg flex items-center justify-center dark:bg-gray-800">
            <p className="text-muted-foreground dark:text-gray-400">Unsupported visualizer type</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64 dark:bg-gray-700" />
              <Skeleton className="h-5 w-96 dark:bg-gray-700" />
            </div>
            <Skeleton className="h-10 w-32 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 dark:backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-full dark:bg-gray-700" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full rounded-lg dark:bg-gray-700" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                SHAmbles: Healthcare Facility Visualization
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl dark:text-gray-400">
                Interactive visualizations and comprehensive analysis of Kenya's healthcare infrastructure
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <Grid3X3 className="h-4 w-4" /> Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <List className="h-4 w-4" /> List
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          {facilityStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm dark:bg-gray-800/80 dark:backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{facilityStats.total_facilities.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Total Facilities</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm dark:bg-gray-800/80 dark:backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{facilityStats.operational_facilities.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Operational</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm dark:bg-gray-800/80 dark:backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{facilityStats.facilities_with_coords.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">With Coordinates</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm dark:bg-gray-800/80 dark:backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{facilityStats.counties_count}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Counties</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm dark:bg-gray-800/80 dark:backdrop-blur-sm col-span-2 md:col-span-1">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{facilityStats.constituencies_count}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Constituencies</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-white/80 backdrop-blur-sm border dark:bg-gray-800/80 dark:backdrop-blur-sm dark:border-gray-700">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category} 
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200"
                  >
                    {category === 'all' ? 'All' : category}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                <Filter className="h-4 w-4" />
                <span>{filteredVisualizers.length} visualizations</span>
              </div>
            </div>
            
            <TabsContent value={activeTab} className="space-y-6 mt-0">
              {/* Data Quality Report */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden dark:bg-gray-800/80 dark:backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <BarChart3 className="h-5 w-5" /> Data Quality & Analysis Report
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Comprehensive analysis of Kenya's healthcare facility data integrity and distribution patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 text-lg text-slate-700 dark:text-gray-300">Data Integrity Assessment</h3>
                      <p className="text-slate-600 mb-3 dark:text-gray-400">
                        The healthcare facilities dataset represents one of the most comprehensive collections of Kenyan healthcare infrastructure, meticulously compiled from authoritative sources with rigorous quality validation processes.
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <span>100% completeness for critical fields: name, type, ownership, and geographic coordinates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <span>Minimal data gaps in secondary administrative divisions (under 9% missingness)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <span>Precise geographic coordinates enabling accurate spatial analysis for all facilities</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 text-lg text-slate-700 dark:text-gray-300">Key Distribution Insights</h3>
                      <p className="text-slate-600 mb-3 dark:text-gray-400">
                        The analysis reveals significant patterns in healthcare infrastructure distribution across Kenya's diverse regions and administrative boundaries.
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Urban concentration with Nairobi County leading at 883 facilities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Dispensaries (4,608) and Medical Clinics (3,179) constitute the majority of facilities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Significant public sector involvement with Ministry of Health operating 45.3% of facilities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Complete coverage across all 47 counties enables comprehensive regional analysis</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics Components */}
              <Suspense fallback={
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-gray-800/80 dark:backdrop-blur-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-48 dark:bg-gray-700" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full dark:bg-gray-700" />
                  </CardContent>
                </Card>
              }>
                <FacilityStatistics data={healthFacilities} />
                <AllocationAnalysis data={healthFacilities} />
                <CountyComparison data={healthFacilities} />
              </Suspense>

              {/* Visualizations Grid */}
              <div className={cn("gap-6", viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col")}>
                {filteredVisualizers.map((visualizer) => {
                  const isExpanded = expandedCards.has(visualizer.id);
                  return (
                    <Card 
                      key={visualizer.id} 
                      className={cn(
                        "overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-300 dark:bg-gray-800/80 dark:backdrop-blur-sm",
                        isExpanded && "md:col-span-2 md:row-span-2"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-gray-200">
                            {visualizer.type === 'leaflet' && <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                            {visualizer.type === 'interactive' && <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />}
                            {visualizer.type === 'map' && <Map className="h-5 w-5 text-green-600 dark:text-green-400" />}
                            {visualizer.type === 'image' && <Image className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                            {visualizer.title}
                          </CardTitle>
                          <Button variant="ghost" size="icon" className="h-8 w-8 dark:hover:bg-gray-700" onClick={() => toggleCardExpansion(visualizer.id)}>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                        <CardDescription className="dark:text-gray-400">{visualizer.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {renderVisualizer(visualizer)}
                        <div className="mt-4 p-4 bg-slate-50/50 rounded-lg border border-slate-100 dark:bg-gray-700/50 dark:border-gray-600">
                          <h4 className="font-medium mb-2 text-slate-700 flex items-center gap-2 dark:text-gray-300">
                            <BarChart3 className="h-4 w-4" /> Analytical Interpretation
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-gray-400">
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
                          <Button variant="outline" className="w-full mt-4 gap-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white" asChild>
                            <a href={visualizer.url} target="_blank" rel="noopener noreferrer">
                              Open in new tab <ExternalLink className="h-4 w-4" />
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

          {/* Call to Action Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden text-center dark:bg-gray-800/80 dark:backdrop-blur-sm">
            <CardContent className="p-8">
              <AlertTriangle className="w-16 h-16 text-kenya-red mx-auto mb-4 dark:text-red-500" />
              <h2 className="text-3xl font-bold text-kenya-green mb-4 dark:text-green-600">Help Us Improve Healthcare Transparency</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto dark:text-gray-400">
                Your support helps us continue our mission of tracking healthcare resource allocation and ensuring equitable distribution across Kenya.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-kenya-green hover:bg-kenya-green/90 dark:bg-green-700 dark:hover:bg-green-600">
                  <Heart className="mr-2" /> Support Our Work
                </Button>
                <Button size="lg" variant="outline" className="border-kenya-red text-kenya-red hover:bg-kenya-red/10 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-500/10">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Floating Donation Widget */}
        <Suspense fallback={null}>
          <DonationWidget />
        </Suspense>
      </div>
    </>
  );
};

export default SHAmbles;
