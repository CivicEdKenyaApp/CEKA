import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check, RefreshCw, Heart, Map, BarChart3, Users, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Lazy load components for better performance
const DonationWidget = lazy(() => import('@/components/DonationWidget'));
const FacilityStatistics = lazy(() => import('@/components/FacilityStatistics'));
const AllocationAnalysis = lazy(() => import('@/components/AllocationAnalysis'));
const CountyComparison = lazy(() => import('@/components/CountyComparison'));

interface SHAmblesProps {
  className?: string;
}

const SHAmbles: React.FC<SHAmblesProps> = ({ className }) => {
  const [healthcareGeoJsonData, setHealthcareGeoJsonData] = useState<any>(null);
  const [kenyaBoundariesData, setKenyaBoundariesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // URLs for GeoJSON data (to be stored in Supabase)
  const healthcareGeoJsonUrl = 'https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/healthcare%20data/kenya_healthcare_enhanced.geojson?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mYmE5NTY4OC04ZWFmLTQwNzYtYTljZi0wNWU2OWQ3ZjRjOWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJoZWFsdGhjYXJlIGRhdGEva2VueWFfaGVhbHRoY2FyZV9lbmhhbmNlZC5nZW9qc29uIiwiaWF0IjoxNzU2MzQxMTY3LCJleHAiOjI1NDQ3NDExNjd9.J-jnvJx1Yk1jd5MH_ndiBhyBgfr_ZKrNrLoTs2WKC38';
  const kenyaBoundariesUrl = 'https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/sign/healthcare%20data/FULL%20CORRECTED%20-%20Kenya%20Counties%20Voters\'%20Data%20(1).geojson?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mYmE5NTY4OC04ZWFmLTQwNzYtYTljZi0wNWU2OWQ3ZjRjOWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJoZWFsdGhjYXJlIGRhdGEvRlVMTCBDT1JSRUNURUQgLSBLZW55YSBDb3VudGllcyBWb3RlcnMnIERhdGEgKDEpLmdlb2pzb24iLCJpYXQiOjE3NTYzNDA5NjQsImV4cCI6MjU0NDc0MDk2NH0.NCZ2eLL1gkR7uq0tQoJqFcn4VdM8rk4u799tYRtwn5I';

  useEffect(() => {
    fetchGeoJsonData();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (healthcareGeoJsonData && kenyaBoundariesData && mapContainerRef.current && !mapInitialized) {
      initializeMap();
    }
  }, [healthcareGeoJsonData, kenyaBoundariesData, mapInitialized]);

  const initializeMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    try {
      // Initialize Leaflet map centered on Kenya
      mapRef.current = L.map(mapContainerRef.current).setView([-0.0236, 37.9062], 6);
      
      // Add OpenStreetMap base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Add Kenya administrative boundaries
      const boundariesLayer = L.geoJSON(kenyaBoundariesData, {
        style: (feature) => ({
          fillColor: '#f0f0f0',
          weight: 2,
          opacity: 1,
          color: '#3388ff',
          fillOpacity: 0.1
        }),
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            const popupContent = `
              <div class="p-2">
                <h3 class="font-bold text-lg">${feature.properties.name || 'Administrative Area'}</h3>
                <p><strong>Type:</strong> ${feature.properties.admin_level || 'N/A'}</p>
                <p><strong>Facilities:</strong> ${feature.properties.facility_count || '0'}</p>
              </div>
            `;
            layer.bindPopup(popupContent);
          }
        }
      }).addTo(mapRef.current);

      // Add healthcare facilities layer
      const facilitiesLayer = L.geoJSON(healthcareGeoJsonData, {
        pointToLayer: (feature, latlng) => {
          // Custom markers based on facility type
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
            const popupContent = `
              <div class="p-2 min-w-[250px]">
                <h3 class="font-bold text-lg">${props.name || 'Unknown Facility'}</h3>
                <p><strong>Type:</strong> ${props.type || 'N/A'}</p>
                <p><strong>County:</strong> ${props.county || 'N/A'}</p>
                <p><strong>Constituency:</strong> ${props.constituency || 'N/A'}</p>
                <p><strong>Owner:</strong> ${props.owner || 'N/A'}</p>
                ${props.money_allocated ? `<p><strong>Allocation:</strong> KES ${props.money_allocated.toLocaleString()}</p>` : ''}
                ${props.allocation_period ? `<p><strong>Period:</strong> ${props.allocation_period}</p>` : ''}
              </div>
            `;
            layer.bindPopup(popupContent);
          }
        }
      }).addTo(mapRef.current);

      // Fit map to show all of Kenya with some padding
      mapRef.current.fitBounds(boundariesLayer.getBounds(), { padding: [20, 20] });
      
      // Add layer control
      const overlayMaps = {
        "Administrative Boundaries": boundariesLayer,
        "Healthcare Facilities": facilitiesLayer
      };
      
      L.control.layers(null, overlayMaps, { collapsed: false }).addTo(mapRef.current);
      
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
          legendHTML += `
            <div class="flex items-center mb-1">
              <div class="w-4 h-4 rounded-full mr-2" style="background-color:${item.color}; border:1px solid #000"></div>
              <span>${item.type}</span>
            </div>
          `;
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
      'Hospital': '#e53e3e',      // Red
      'Health Center': '#3182ce', // Blue
      'Dispensary': '#38a169',    // Green
      'Clinic': '#805ad5',        // Purple
      'Pharmacy': '#ed8936',      // Orange
      'Laboratory': '#718096',    // Gray
    };
    
    return typeColors[facilityType] || '#000000'; // Black for other/unknown
  };

  const fetchGeoJsonData = async () => {
    try {
      setLoading(true);
      
      // Fetch healthcare facilities data
      const healthcareResponse = await fetch(healthcareGeoJsonUrl);
      const healthcareData = await healthcareResponse.json();
      setHealthcareGeoJsonData(healthcareData);
      
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
    } finally {
      setLoading(false);
    }
  };

  const refreshMap = () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    setMapInitialized(false);
    setTimeout(() => fetchGeoJsonData(), 100);
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

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.classList.add('animate-fade-in');
          observer.unobserve(target);
        }
      });
    }, observerOptions);

    // Observe all sections with the 'lazy-section' class
    document.querySelectorAll('.lazy-section').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-kenya-green/10 to-kenya-red/10 ${className}`}>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-kenya-green to-kenya-red text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">SHAmbles</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Tracking Healthcare Facility Distribution and Resource Allocation in Kenya
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-kenya-green hover:bg-gray-100">
              <Map className="mr-2" /> Explore the Map
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              <BarChart3 className="mr-2" /> View Statistics
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Map Section */}
        <section className="mb-16 lazy-section opacity-0">
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-kenya-green to-kenya-red text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Map className="w-6 h-6 mr-2" />
                  Kenya Healthcare Facilities Map
                </div>
                <Button onClick={refreshMap} size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardTitle>
              <CardDescription className="text-white/90">
                Interactive map showing healthcare facilities across Kenya with allocation data
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kenya-green"></div>
                  <span className="ml-3">Loading healthcare data...</span>
                </div>
              ) : (
                <>
                  <div ref={mapContainerRef} className="w-full h-96 rounded-t-lg" />
                  <div className="p-6 bg-gray-50">
                    <h4 className="font-semibold text-kenya-green mb-3">Map Tools</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button onClick={openInGeoJsonIo} className="justify-start" disabled={!healthcareGeoJsonData}>
                        <ExternalLink className="w-4 h-4 mr-2" /> Open in GeoJSON.io
                      </Button>
                      <Button onClick={openDirectGeoJsonIo} variant="outline" className="justify-start">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open with URL
                      </Button>
                      <Button onClick={copyGeoJsonData} variant="secondary" className="justify-start">
                        <Copy className="w-4 h-4 mr-2" /> Copy GeoJSON Data
                      </Button>
                      <Button onClick={copyGeoJsonUrl} variant="secondary" className="justify-start">
                        <Copy className="w-4 h-4 mr-2" /> Copy Data URL
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Statistics Section */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading statistics...</div>}>
          <section className="mb-16 lazy-section opacity-0">
            <FacilityStatistics geoJsonData={healthcareGeoJsonData} />
          </section>
        </Suspense>

        {/* Allocation Analysis Section */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading allocation analysis...</div>}>
          <section className="mb-16 lazy-section opacity-0">
            <AllocationAnalysis geoJsonData={healthcareGeoJsonData} />
          </section>
        </Suspense>

        {/* County Comparison Section */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading county comparison...</div>}>
          <section className="mb-16 lazy-section opacity-0">
            <CountyComparison geoJsonData={healthcareGeoJsonData} />
          </section>
        </Suspense>

        {/* Call to Action Section */}
        <section className="text-center py-12 lazy-section opacity-0">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <AlertTriangle className="w-16 h-16 text-kenya-red mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-kenya-green mb-4">Help Us Improve Healthcare Transparency</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Your support helps us continue our mission of tracking healthcare resource allocation and ensuring equitable distribution across Kenya.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-kenya-green hover:bg-kenya-green/90">
                <Heart className="mr-2" /> Support Our Work
              </Button>
              <Button size="lg" variant="outline" className="border-kenya-red text-kenya-red hover:bg-kenya-red/10">
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Donation Widget */}
      <Suspense fallback={null}>
        <DonationWidget />
      </Suspense>
    </div>
  );
};

export default SHAmbles;
