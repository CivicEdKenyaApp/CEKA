import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VisualizationProps {
  dataPath?: string;
}

interface GeoJsonData {
  type: string;
  features: any[];
}

const Visualization: React.FC<VisualizationProps> = ({ dataPath }) => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataPath) {
      loadGeoJsonData(dataPath);
    }
  }, [dataPath]);

  const loadGeoJsonData = async (path: string) => {
    try {
      setLoading(true);
      // In a real implementation, we would fetch from Supabase storage
      // For now, we'll use a mock function
      const data = await fetchGeoJsonData(path);
      setGeoJsonData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load visualization data');
      console.error('Error loading GeoJSON:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeoJsonData = async (path: string): Promise<GeoJsonData> => {
    // This would be replaced with actual Supabase storage fetch
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "Sample Point" },
              geometry: {
                type: "Point",
                coordinates: [36.8219, -1.2921]
              }
            }
          ]
        });
      }, 1000);
    });
  };

  if (loading) {
    return (
      <div className="visualization-container">
        <div className="loading">Loading visualization...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visualization-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="visualization-container">
      <h3>Data Visualization</h3>
      <div className="map-container">
        <MapContainer
          center={[-1.2921, 36.8219]}
          zoom={6}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {geoJsonData && (
            <GeoJSON
              data={geoJsonData}
              onEachFeature={(feature, layer) => {
                if (feature.properties) {
                  layer.bindPopup(`
                    <div>
                      <h4>${feature.properties.name || 'Unnamed Feature'}</h4>
                      <pre>${JSON.stringify(feature.properties, null, 2)}</pre>
                    </div>
                  `);
                }
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Visualization;