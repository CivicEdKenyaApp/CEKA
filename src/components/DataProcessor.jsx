import React, { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Base URL for API depending on environment
const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5000'  // Flask dev server
    : 'https://ceka-production.up.railway.app'; // Flask prod server


const DataProcessor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataType, setDataType] = useState('healthcare');
  const [uploadStatus, setUploadStatus] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [map, setMap] = useState(null);
  const [mapLayers, setMapLayers] = useState({});

  useEffect(() => {
    // Initialize map
    const mapInstance = L.map('map').setView([-0.0236, 37.9062], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    setMap(mapInstance);

    // Load Kenya GeoJSON
    loadKenyaGeoJSON(mapInstance);

    // Load datasets
    loadDatasets();

    // Clean up on component unmount
    return () => {
      mapInstance.remove();
    };
  }, []);

  const loadKenyaGeoJSON = async (mapInstance) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/kenya-geojson`);
      const kenyaLayer = L.geoJSON(response.data, {
        style: {
          color: '#3388ff',
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.1,
        },
      }).addTo(mapInstance);

      setMapLayers((prev) => ({ ...prev, kenya: kenyaLayer }));
    } catch (error) {
      console.error('Error loading Kenya GeoJSON:', error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDataTypeChange = (event) => {
    setDataType(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setProcessing(true);
    setUploadStatus('Uploading file...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('data_type', dataType);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSessionId(response.data.session_id);
      setUploadStatus('File uploaded. Processing started...');

      // Poll for status updates
      const checkStatus = async () => {
        try {
          const statusResponse = await axios.get(
            `${API_BASE_URL}/api/status/${response.data.session_id}`
          );

          if (statusResponse.data.status === 'processing') {
            setTimeout(checkStatus, 2000); // Check again after 2 seconds
          } else if (statusResponse.data.success) {
            setUploadStatus('Processing completed successfully!');
            setProcessing(false);
            loadDatasets(); // Refresh dataset list

            // Add the new dataset to the map
            if (statusResponse.data.files.combined_geojson) {
              addDatasetToMap(response.data.session_id);
            }
          } else {
            setUploadStatus(`Error: ${statusResponse.data.message}`);
            setProcessing(false);
          }
        } catch (error) {
          setUploadStatus('Error checking status');
          setProcessing(false);
        }
      };

      setTimeout(checkStatus, 2000);
    } catch (error) {
      setUploadStatus('Upload failed');
      setProcessing(false);
    }
  };

  const addDatasetToMap = async (sessionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/geojson/${sessionId}`);

      // Remove existing layer for this dataset if it exists
      if (mapLayers[sessionId]) {
        map.removeLayer(mapLayers[sessionId]);
      }

      // Create a new layer for this dataset
      const newLayer = L.geoJSON(response.data, {
        pointToLayer: (feature, latlng) => {
          const type = feature.properties.type || 'Other';
          const color = getColorForType(type);

          return L.marker(latlng, {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            }),
          });
        },
        onEachFeature: (feature, layer) => {
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
        },
      }).addTo(map);

      setMapLayers((prev) => ({ ...prev, [sessionId]: newLayer }));
    } catch (error) {
      console.error('Error adding dataset to map:', error);
    }
  };

  const getColorForType = (type) => {
    const colorMap = {
      Hospital: 'red',
      'Health Center': 'blue',
      Dispensary: 'green',
      Clinic: 'purple',
      Pharmacy: 'orange',
      Laboratory: 'gray',
      Other: 'black',
    };

    return colorMap[type] || 'black';
  };

  const loadDatasets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/datasets`);
      setDatasets(response.data.datasets);

      for (const dataset of response.data.datasets) {
        if (dataset.has_geojson) {
          addDatasetToMap(dataset.session_id);
        }
      }
    } catch (error) {
      console.error('Error loading datasets:', error);
    }
  };

  const downloadFile = async (sessionId, fileType) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/download/${sessionId}/${fileType}`,
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const extensions = {
        cleaned: 'csv',
        geojson: 'geojson',
        report: 'json',
        summary: 'txt',
      };

      link.setAttribute('download', `processed_data.${extensions[fileType]}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const toggleLayerVisibility = (sessionId, visible) => {
    if (mapLayers[sessionId]) {
      if (visible) {
        map.addLayer(mapLayers[sessionId]);
      } else {
        map.removeLayer(mapLayers[sessionId]);
      }
    }
  };

  return (
    <div className="data-processor">
      <h2>Kenya Healthcare Data Processing</h2>

      <div className="upload-section">
        <h3>Upload New Data</h3>
        <div>
          <input type="file" onChange={handleFileChange} />
        </div>
        <div>
          <label>
            Data Type:
            <select value={dataType} onChange={handleDataTypeChange}>
              <option value="healthcare">Healthcare Facilities</option>
              <option value="education">Education Institutions</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <button onClick={handleUpload} disabled={processing}>
          {processing ? 'Processing...' : 'Upload and Process'}
        </button>
        <p>{uploadStatus}</p>
      </div>

      <div className="map-section">
        <h3>Interactive Map</h3>
        <div id="map" style={{ height: '500px', width: '100%' }}></div>
      </div>

      <div className="datasets-section">
        <h3>Processed Datasets</h3>
        <button onClick={loadDatasets}>Refresh List</button>

        <div className="datasets-list">
          {datasets.map((dataset) => (
            <div key={dataset.session_id} className="dataset-item">
              <h4>
                {dataset.data_type} -{' '}
                {new Date(dataset.processed_date).toLocaleString()}
              </h4>
              <p>Records: {dataset.total_records}</p>
              <div className="dataset-actions">
                <label>
                  <input
                    type="checkbox"
                    defaultChecked
                    onChange={(e) =>
                      toggleLayerVisibility(dataset.session_id, e.target.checked)
                    }
                  />
                  Show on Map
                </label>
                <button onClick={() => downloadFile(dataset.session_id, 'cleaned')}>
                  Download Cleaned Data
                </button>
                {dataset.has_geojson && (
                  <button onClick={() => downloadFile(dataset.session_id, 'geojson')}>
                    Download GeoJSON
                  </button>
                )}
                <button onClick={() => downloadFile(dataset.session_id, 'report')}>
                  Download Report
                </button>
                <button onClick={() => downloadFile(dataset.session_id, 'summary')}>
                  Download Summary
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataProcessor;
