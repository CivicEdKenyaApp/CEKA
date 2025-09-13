import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const sessionId = pathParts[pathParts.length - 2];
      const fileType = pathParts[pathParts.length - 1];

      if (!sessionId || !fileType) {
        return new Response(
          JSON.stringify({ error: 'Session ID and file type are required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Fetch job data to get file paths
      const { data: job, error: jobError } = await supabaseClient
        .from('processing_jobs')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (jobError || !job) {
        return new Response(
          JSON.stringify({ error: 'Job not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (!job.output_files) {
        return new Response(
          JSON.stringify({ error: 'No output files available' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Map file type to file path
      let filePath = '';
      let contentType = 'application/octet-stream';
      let fileName = 'download';

      switch (fileType) {
        case 'cleaned':
          filePath = job.output_files.cleaned_path || '';
          contentType = 'text/csv';
          fileName = 'cleaned_data.csv';
          break;
        case 'geojson':
          filePath = job.output_files.geojson_path || '';
          contentType = 'application/geo+json';
          fileName = 'processed_data.geojson';
          break;
        case 'report':
          filePath = job.output_files.report_path || '';
          contentType = 'application/json';
          fileName = 'analysis_report.json';
          break;
        case 'summary':
          filePath = job.output_files.summary_path || '';
          contentType = 'text/plain';
          fileName = 'summary.txt';
          break;
        case 'map':
          filePath = job.output_files.map_path || '';
          contentType = 'text/html';
          fileName = 'interactive_map.html';
          break;
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid file type' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
      }

      if (!filePath) {
        // Generate mock content for demonstration
        let mockContent = '';
        
        switch (fileType) {
          case 'cleaned':
            mockContent = generateMockCSV(job);
            break;
          case 'geojson':
            mockContent = generateMockGeoJSON(job);
            break;
          case 'report':
            mockContent = generateMockReport(job);
            break;
          case 'summary':
            mockContent = generateMockSummary(job);
            break;
          case 'map':
            mockContent = generateMockMap(job);
            break;
        }

        return new Response(mockContent, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${fileName}"`
          },
        });
      }

      // Try to fetch actual file from storage
      const { data: file, error: fileError } = await supabaseClient.storage
        .from('processed-data')
        .download(filePath);

      if (fileError) {
        console.error('Error downloading file:', fileError);
        return new Response(
          JSON.stringify({ error: 'File not found or cannot be accessed' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(file, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`
        },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in download-file function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateMockCSV(job: any): string {
  const headers = 'id,name,type,county,constituency,latitude,longitude,owner,allocation\n';
  const rows = [];
  
  const types = ['Hospital', 'Health Center', 'Dispensary', 'Clinic', 'Pharmacy'];
  const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  const owners = ['Public', 'Private', 'NGO', 'Faith-based'];
  
  for (let i = 1; i <= 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const county = counties[Math.floor(Math.random() * counties.length)];
    const owner = owners[Math.floor(Math.random() * owners.length)];
    const lat = -1.5 + Math.random() * 3;
    const lng = 36 + Math.random() * 6;
    const allocation = Math.floor(Math.random() * 10000000) + 1000000;
    
    rows.push(`${i},${type} ${i},${type},${county},${county} Central,${lat.toFixed(6)},${lng.toFixed(6)},${owner},${allocation}`);
  }
  
  return headers + rows.join('\n');
}

function generateMockGeoJSON(job: any): string {
  const features = [];
  
  for (let i = 1; i <= 20; i++) {
    features.push({
      type: 'Feature',
      properties: {
        id: i,
        name: `Healthcare Facility ${i}`,
        type: ['Hospital', 'Health Center', 'Dispensary'][Math.floor(Math.random() * 3)],
        county: ['Nairobi', 'Mombasa', 'Kisumu'][Math.floor(Math.random() * 3)],
        owner: ['Public', 'Private', 'NGO'][Math.floor(Math.random() * 3)]
      },
      geometry: {
        type: 'Point',
        coordinates: [36 + Math.random() * 6, -1.5 + Math.random() * 3]
      }
    });
  }
  
  return JSON.stringify({
    type: 'FeatureCollection',
    features: features
  }, null, 2);
}

function generateMockReport(job: any): string {
  return JSON.stringify({
    report_id: job.id,
    generated_at: new Date().toISOString(),
    job_name: job.job_name,
    summary: {
      total_facilities: job.output_files?.total_records || 50,
      counties_covered: 5,
      facility_types: {
        hospitals: 12,
        health_centers: 18,
        dispensaries: 15,
        clinics: 3,
        pharmacies: 2
      },
      ownership_distribution: {
        public: 30,
        private: 15,
        ngo: 3,
        faith_based: 2
      }
    },
    data_quality: {
      completeness: 0.95,
      accuracy: 0.92,
      consistency: 0.88
    },
    recommendations: [
      'Increase data collection in rural areas',
      'Standardize facility naming conventions',
      'Verify GPS coordinates for 5% of facilities'
    ]
  }, null, 2);
}

function generateMockSummary(job: any): string {
  return `Healthcare Data Processing Summary
========================================

Job ID: ${job.id}
Job Name: ${job.job_name}
Processed: ${new Date().toLocaleString()}

Results:
- Total facilities processed: ${job.output_files?.total_records || 50}
- Counties covered: 5
- Data quality score: 92%

Processing completed successfully.
Generated files:
- Cleaned dataset (CSV)
- GeoJSON spatial data
- Interactive map visualization
- Detailed analysis report
`;
}

function generateMockMap(job: any): string {
  return `<!DOCTYPE html>
<html>
<head>
    <title>Healthcare Facilities Map - ${job.job_name}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
    <div id="map" style="width: 100%; height: 100vh;"></div>
    <script>
        var map = L.map('map').setView([-0.0236, 37.9062], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        // Sample facilities
        var facilities = [
            {name: "Nairobi Hospital", coords: [-1.2921, 36.8219], type: "Hospital"},
            {name: "Mombasa Health Center", coords: [-4.0435, 39.6682], type: "Health Center"},
            {name: "Kisumu Dispensary", coords: [-0.0917, 34.7680], type: "Dispensary"}
        ];
        
        facilities.forEach(function(facility) {
            L.marker(facility.coords)
                .addTo(map)
                .bindPopup("<b>" + facility.name + "</b><br>Type: " + facility.type);
        });
    </script>
</body>
</html>`;
}