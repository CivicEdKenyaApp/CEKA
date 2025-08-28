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

const DataProcessor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [dataType, setDataType] = useState('healthcare');
  const [uploadStatus, setUploadStatus] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [map, setMap] = useState(null);
  const [mapLayers, setMapLayers] = useState({});
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    const mapInstance = L.map('map').setView([-0.0236, 37.9062], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);
    
    setMap(mapInstance);
    loadKenyaGeoJSON(mapInstance);
    loadDatasets();
    
    return () => {
      mapInstance.remove();
    };
  }, []);

  const loadKenyaGeoJSON = async (mapInstance) => {
    try {
      const response = await axios.get('/api/kenya-geojson');
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
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleCrawlUrlChange = (event) => {
    setCrawlUrl(event.target.value);
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
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSessionId(response.data.session_id);
      setUploadStatus('File uploaded. Processing started...');

      const checkStatus = async () => {
        try {
          const statusResponse = await axios.get(`/api/status/${response.data.session_id}`);
          
          if (statusResponse.data.status === 'processing' || statusResponse.data.status === 'crawling') {
            setUploadStatus(statusResponse.data.message);
            setTimeout(checkStatus, 2000);
          } else if (statusResponse.data.success) {
            setUploadStatus('Processing completed successfully!');
            setProcessing(false);
            loadDatasets();
            
            if (statusResponse.data.files && statusResponse.data.files.combined_geojson) {
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

  const handleCrawl = async () => {
    if (!crawlUrl) {
      alert('Please enter a URL to crawl');
      return;
    }

    setCrawling(true);
    setUploadStatus('Starting crawl...');

    try {
      const response = await axios.post('/api/crawl', {
        url: crawlUrl,
        depth: 2,
        max_pages: 100
      });

      setSessionId(response.data.session_id);
      setUploadStatus('Crawling started. Processing will begin once completed.');

      const checkStatus = async () => {
        try {
          const statusResponse = await axios.get(`/api/status/${response.data.session_id}`);
          
          if (statusResponse.data.status === 'crawling') {
            setUploadStatus(`Crawling: ${statusResponse.data.message}`);
            setTimeout(checkStatus, 2000);
          } else if (statusResponse.data.status === 'processing') {
            setUploadStatus('Crawling completed. Processing data...');
            setTimeout(checkStatus, 2000);
          } else if (statusResponse.data.success) {
            setUploadStatus('Crawling and processing completed successfully!');
            setCrawling(false);
            loadDatasets();
            
            if (statusResponse.data.files && statusResponse.data.files.combined_geojson) {
              addDatasetToMap(response.data.session_id);
            }
          } else {
            setUploadStatus(`Error: ${statusResponse.data.message}`);
            setCrawling(false);
          }
        } catch (error) {
          setUploadStatus('Error checking status');
          setCrawling(false);
        }
      };

      setTimeout(checkStatus, 2000);
    } catch (error) {
      setUploadStatus('Crawl failed');
      setCrawling(false);
    }
  };

  const addDatasetToMap = async (sessionId) => {
    try {
      const response = await axios.get(`/api/geojson/${sessionId}`);
      
      if (mapLayers[sessionId]) {
        map.removeLayer(mapLayers[sessionId]);
      }
      
      const newLayer = L.geoJSON(response.data, {
        pointToLayer: (feature, latlng) => {
          const type = feature.properties.type || 'Other';
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
      }).addTo(map);
      
      setMapLayers(prev => ({ ...prev, [sessionId]: newLayer }));
      
    } catch (error) {
      console.error('Error adding dataset to map:', error);
    }
  };

  const getColorForType = (type) => {
    const colorMap = {
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
      const response = await axios.get('/api/datasets');
      setDatasets(response.data.datasets || []);
      
      for (const dataset of response.data.datasets || []) {
        if (dataset.has_geojson) {
          addDatasetToMap(dataset.session_id);
        }
      }
    } catch (error) {
      console.error('Error loading datasets:', error);
      setDatasets([]);
    }
  };

  const downloadFile = async (sessionId, fileType) => {
    try {
      const response = await axios.get(`/api/download/${sessionId}/${fileType}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extensions = {
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
      
      <div className="tabs">
        <button 
          className={activeTab === 'upload' ? 'active' : ''} 
          onClick={() => setActiveTab('upload')}
        >
          Upload Data
        </button>
        <button 
          className={activeTab === 'crawl' ? 'active' : ''} 
          onClick={() => setActiveTab('crawl')}
        >
          Crawl Website
        </button>
      </div>
      
      {activeTab === 'upload' && (
        <div className="upload-section">
          <h3>Upload Data File</h3>
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
        </div>
      )}
      
      {activeTab === 'crawl' && (
        <div className="crawl-section">
          <h3>Crawl Website for Data</h3>
          <div>
            <input 
              type="text" 
              placeholder="Enter website URL to crawl" 
              value={crawlUrl}
              onChange={handleCrawlUrlChange}
              style={{ width: '300px', padding: '8px' }}
            />
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
          <button onClick={handleCrawl} disabled={crawling}>
            {crawling ? 'Crawling...' : 'Start Crawling'}
          </button>
        </div>
      )}
      
      <div className="status-section">
        <h4>Status:</h4>
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
          {datasets && datasets.map(dataset => (
            <div key={dataset.session_id} className="dataset-item">
              <h4>{dataset.data_type} - {new Date(dataset.processed_date).toLocaleString()}</h4>
              <p>Records: {dataset.total_records}</p>
              <div className="dataset-actions">
                <label>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    onChange={(e) => toggleLayerVisibility(dataset.session_id, e.target.checked)}
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
                <button onClick={() => downloadFile(dataset.session_id, 'map')}>
                  Download Map
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
