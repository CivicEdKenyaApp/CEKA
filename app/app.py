import os
import uuid
import json
import time
import logging
import threading
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import pandas as pd
import numpy as np
import requests
from io import StringIO
import subprocess
import tempfile
import shutil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS to allow all origins
CORS(
    app,
    resources={r"/api/*": {"origins": "https://civicedkenya.vercel.app"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Configuration
UPLOAD_FOLDER = 'user_uploads'
PROCESSED_FOLDER = 'processed_data'
SCRIPTS_FOLDER = 'scripts'
ALLOWED_EXTENSIONS = {'csv', 'json', 'geojson', 'xlsx', 'xls', 'txt'}
KENYA_GEOJSON_URL = "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/healthcare%20data/kenya_healthcare_enhanced.geojson"

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['SCRIPTS_FOLDER'] = SCRIPTS_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# In-memory storage for jobs (in production, use a database)
jobs = {}
datasets = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def fetch_kenya_geojson():
    """Fetch Kenya GeoJSON from the hosted URL"""
    try:
        response = requests.get(KENYA_GEOJSON_URL)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching Kenya GeoJSON: {e}")
        return {"type": "FeatureCollection", "features": []}

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj

def run_processing_pipeline(job_id, input_path, data_type, file_format):
    """Run the complete processing pipeline"""
    try:
        # Create session directory
        session_dir = os.path.join(app.config['PROCESSED_FOLDER'], job_id)
        os.makedirs(session_dir, exist_ok=True)
        
        # Step 1: Clean the data
        clean_script = os.path.join(app.config['SCRIPTS_FOLDER'], 'clean_data.py')
        cleaned_file = os.path.join(session_dir, "facilities_cleaned.csv")
        
        subprocess.run([
            'python', clean_script,
            '--input', input_path,
            '--output', cleaned_file
        ], check=True)
        
        # Step 2: Generate reports
        report_script = os.path.join(app.config['SCRIPTS_FOLDER'], 'generate_report.py')
        report_dir = os.path.join(session_dir, "reports")
        os.makedirs(report_dir, exist_ok=True)
        
        subprocess.run([
            'python', report_script,
            '--input', cleaned_file,
            '--output', report_dir
        ], check=True)
        
        # Step 3: Create map visualization
        map_script = os.path.join(app.config['SCRIPTS_FOLDER'], 'create_map.py')
        map_file = os.path.join(session_dir, "facilities_map.html")
        
        subprocess.run([
            'python', map_script,
            '--input', cleaned_file,
            '--output', map_file
        ], check=True)
        
        # Step 4: Advanced analysis
        analysis_script = os.path.join(app.config['SCRIPTS_FOLDER'], 'analyze_distribution.py')
        analysis_dir = os.path.join(session_dir, "analysis")
        os.makedirs(analysis_dir, exist_ok=True)
        
        subprocess.run([
            'python', analysis_script,
            '--input', cleaned_file,
            '--output', analysis_dir
        ], check=True)
        
        # Merge with Kenya GeoJSON if coordinates available
        df = pd.read_csv(cleaned_file)
        if 'latitude' in df.columns and 'longitude' in df.columns:
            kenya_geojson = fetch_kenya_geojson()
            
            # Convert facilities to GeoJSON features
            facilities_with_coords = df.dropna(subset=['latitude', 'longitude'])
            facility_features = []
            
            for _, row in facilities_with_coords.iterrows():
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [float(row['longitude']), float(row['latitude'])]
                    },
                    "properties": {
                        "name": row.get('name', 'Unknown'),
                        "type": row.get('type', 'Unknown'),
                        "county": row.get('county', 'Unknown'),
                        "subcounty": row.get('subcounty', 'Unknown'),
                        "constituency": row.get('constituency', 'Unknown'),
                        "ward": row.get('ward', 'Unknown'),
                        "owner": row.get('owner', 'Unknown'),
                        "data_source": data_type,
                        "session_id": job_id
                    }
                }
                facility_features.append(feature)
            
            # Create combined GeoJSON
            combined_geojson = {
                "type": "FeatureCollection",
                "features": kenya_geojson.get("features", []) + facility_features
            }
            
            # Save combined GeoJSON
            combined_geojson_path = os.path.join(session_dir, "combined_data.geojson")
            with open(combined_geojson_path, 'w', encoding='utf-8') as f:
                json.dump(combined_geojson, f, indent=2, ensure_ascii=False)
        
        # Load and return the report
        report_path = os.path.join(report_dir, "analysis_report.json")
        with open(report_path, 'r', encoding='utf-8') as f:
            report = json.load(f)
        
        # Add session info to report
        report['session_id'] = job_id
        report['processed_date'] = datetime.now().isoformat()
        report['data_type'] = data_type
        
        # Save updated report
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Create dataset entry
        datasets[job_id] = {
            "session_id": job_id,
            "data_type": data_type,
            "processed_date": report['processed_date'],
            "total_records": report['total_records'],
            "has_geojson": 'latitude' in df.columns and 'longitude' in df.columns
        }
        
        return {
            "success": True,
            "session_id": job_id,
            "message": "Data processed successfully",
            "report": report,
            "results": {
                "successful_files": [os.path.basename(input_path)],
                "failed_files": [],
                "facility_count": report['total_records'],
                "administrative_areas": len(report.get('by_county', {}))
            }
        }
    
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}")
        return {
            "success": False,
            "session_id": job_id,
            "message": f"Error processing data: {str(e)}",
            "results": {
                "successful_files": [],
                "failed_files": [os.path.basename(input_path)],
                "facility_count": 0,
                "administrative_areas": 0
            }
        }

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and processing"""
    if 'files' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['files']
    data_type = request.form.get('data_type', 'healthcare')
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file and allowed_file(file.filename):
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{job_id}_{filename}")
        file.save(file_path)
        
        # Get file format
        file_format = filename.rsplit('.', 1)[1].lower()
        
        # Create job entry
        jobs[job_id] = {
            "id": job_id,
            "status": "processing",
            "progress": 0,
            "message": "Starting processing",
            "created_at": datetime.now().isoformat(),
            "results": None
        }
        
        # Process data in background thread
        def process_task():
            try:
                # Update job status
                jobs[job_id]["progress"] = 25
                jobs[job_id]["message"] = "Cleaning data"
                
                # Run processing pipeline
                result = run_processing_pipeline(job_id, file_path, data_type, file_format)
                
                # Update job with results
                jobs[job_id]["status"] = "completed" if result["success"] else "failed"
                jobs[job_id]["progress"] = 100
                jobs[job_id]["message"] = result["message"]
                jobs[job_id]["results"] = result["results"]
                
                # Store result in session directory
                result_path = os.path.join(app.config['PROCESSED_FOLDER'], job_id, "process_result.json")
                with open(result_path, 'w', encoding='utf-8') as f:
                    json.dump(result, f, indent=2, ensure_ascii=False)
                    
            except Exception as e:
                logger.error(f"Error in processing task: {str(e)}")
                jobs[job_id]["status"] = "failed"
                jobs[job_id]["message"] = f"Processing error: {str(e)}"
                jobs[job_id]["results"] = {
                    "successful_files": [],
                    "failed_files": [filename],
                    "facility_count": 0,
                    "administrative_areas": 0
                }
        
        # Start processing in background
        thread = threading.Thread(target=process_task)
        thread.start()
        
        return jsonify({
            "job_id": job_id,
            "message": "File uploaded successfully. Processing started.",
            "status_url": f"/api/status/{job_id}"
        }), 202
    
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/process-url', methods=['POST'])
def process_url():
    """Initiate website crawling and processing"""
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"error": "No URL provided"}), 400
    
    url = data['url']
    data_type = data.get('data_type', 'healthcare')
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    # Create job entry
    jobs[job_id] = {
        "id": job_id,
        "status": "processing",
        "progress": 0,
        "message": "Starting URL processing",
        "created_at": datetime.now().isoformat(),
        "results": None
    }
    
    # Start processing in background thread
    def process_url_task():
        try:
            # Update job status
            jobs[job_id]["progress"] = 10
            jobs[job_id]["message"] = "Downloading data from URL"
            
            # Download data from URL
            response = requests.get(url)
            response.raise_for_status()
            
            # Determine file type from content type or URL
            content_type = response.headers.get('content-type', '')
            if 'json' in content_type:
                file_format = 'json'
                content = response.json()
            elif 'csv' in content_type:
                file_format = 'csv'
                content = response.text
            else:
                # Try to infer from URL
                if url.endswith('.json'):
                    file_format = 'json'
                    content = response.json()
                elif url.endswith('.csv'):
                    file_format = 'csv'
                    content = response.text
                else:
                    # Default to trying JSON, then CSV
                    try:
                        content = response.json()
                        file_format = 'json'
                    except:
                        content = response.text
                        file_format = 'csv'
            
            # Save downloaded data to temporary file
            temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], "temp")
            os.makedirs(temp_dir, exist_ok=True)
            
            temp_file = os.path.join(temp_dir, f"{job_id}_downloaded_data.{file_format}")
            
            if file_format == 'json':
                with open(temp_file, 'w', encoding='utf-8') as f:
                    json.dump(content, f, indent=2, ensure_ascii=False)
            else:  # CSV
                with open(temp_file, 'w', encoding='utf-8') as f:
                    f.write(content)
            
            # Update job status
            jobs[job_id]["progress"] = 50
            jobs[job_id]["message"] = "Processing downloaded data"
            
            # Run processing pipeline
            result = run_processing_pipeline(job_id, temp_file, data_type, file_format)
            
            # Update job with results
            jobs[job_id]["status"] = "completed" if result["success"] else "failed"
            jobs[job_id]["progress"] = 100
            jobs[job_id]["message"] = result["message"]
            jobs[job_id]["results"] = result["results"]
            
            # Clean up temporary file
            try:
                os.remove(temp_file)
            except:
                pass
                
        except Exception as e:
            logger.error(f"Error processing URL: {str(e)}")
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["message"] = f"URL processing error: {str(e)}"
            jobs[job_id]["results"] = {
                "successful_files": [],
                "failed_files": [url],
                "facility_count": 0,
                "administrative_areas": 0
            }
    
    thread = threading.Thread(target=process_url_task)
    thread.start()
    
    return jsonify({
        "job_id": job_id,
        "message": "URL processing started.",
        "status_url": f"/api/status/{job_id}"
    }), 202

@app.route('/api/status/<job_id>')
def get_status(job_id):
    """Get processing status for a job"""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    job = jobs[job_id]
    return jsonify({
        "id": job_id,
        "status": job["status"],
        "progress": job["progress"],
        "message": job["message"],
        "results": job["results"],
        "created_at": job["created_at"]
    })

@app.route('/api/jobs')
def get_jobs():
    """Get all processing jobs"""
    job_list = []
    for job_id, job in jobs.items():
        job_list.append({
            "id": job_id,
            "status": job["status"],
            "progress": job["progress"],
            "message": job["message"],
            "created_at": job["created_at"]
        })
    
    return jsonify({"jobs": job_list})

@app.route('/api/datasets')
def get_datasets():
    """Get all processed datasets"""
    dataset_list = []
    for dataset_id, dataset in datasets.items():
        dataset_list.append(dataset)
    
    return jsonify({"datasets": dataset_list})

@app.route('/api/download/<session_id>/<file_type>')
def download_file(session_id, file_type):
    """Download processed files"""
    file_type_map = {
        "cleaned": "facilities_cleaned.csv",
        "geojson": "combined_data.geojson",
        "report": "reports/analysis_report.json",
        "summary": "reports/summary_report.txt",
        "map": "facilities_map.html"
    }
    
    if file_type not in file_type_map:
        return jsonify({"error": "Invalid file type"}), 400
    
    file_path = os.path.join(app.config['PROCESSED_FOLDER'], session_id, file_type_map[file_type])
    
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    
    return send_file(file_path, as_attachment=True)

@app.route('/api/geojson/<session_id>')
def get_geojson(session_id):
    """Get GeoJSON for a specific dataset"""
    geojson_path = os.path.join(app.config['PROCESSED_FOLDER'], session_id, "combined_data.geojson")
    
    if not os.path.exists(geojson_path):
        return jsonify({"error": "GeoJSON not found"}), 404
    
    with open(geojson_path, 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)
    
    return jsonify(geojson_data)

@app.route('/api/combined_geojson')
def get_combined_geojson():
    """Get combined GeoJSON of all datasets"""
    # Fetch Kenya base GeoJSON
    kenya_geojson = fetch_kenya_geojson()
    all_features = kenya_geojson.get('features', [])
    
    # Add features from all datasets
    for session_id in os.listdir(app.config['PROCESSED_FOLDER']):
        geojson_path = os.path.join(app.config['PROCESSED_FOLDER'], session_id, "combined_data.geojson")
        
        if os.path.exists(geojson_path):
            with open(geojson_path, 'r', encoding='utf-8') as f:
                session_geojson = json.load(f)
            
            # Add only the point features (not the Kenya base)
            for feature in session_geojson.get('features', []):
                if feature.get('geometry', {}).get('type') == 'Point':
                    all_features.append(feature)
    
    combined_geojson = {
        "type": "FeatureCollection",
        "features": all_features
    }
    
    return jsonify(combined_geojson)

@app.route('/api/kenya-geojson')
def kenya_geojson():
    """Direct endpoint to get Kenya GeoJSON"""
    kenya_geojson = fetch_kenya_geojson()
    return jsonify(kenya_geojson)

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
