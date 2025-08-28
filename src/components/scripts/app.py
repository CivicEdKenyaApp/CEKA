from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import json
import os
import uuid
from datetime import datetime
import numpy as np
from werkzeug.utils import secure_filename
import requests
import threading

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'user_uploads'
PROCESSED_FOLDER = 'processed_data'
ALLOWED_EXTENSIONS = {'csv', 'json', 'geojson'}
KENYA_GEOJSON_URL = "https://cajrvemigxghnfmyopiy.supabase.co/storage/v1/object/public/healthcare%20data/kenya_healthcare_enhanced.geojson"  # Update this URL

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def fetch_kenya_geojson():
    """Fetch Kenya GeoJSON from the hosted URL"""
    try:
        response = requests.get(KENYA_GEOJSON_URL)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Kenya GeoJSON: {e}")
        # Return an empty GeoJSON as fallback
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

def process_uploaded_data(session_id, file_path, data_type):
    """Process uploaded data through the full pipeline"""
    try:
        # Create session directory
        session_dir = os.path.join(app.config['PROCESSED_FOLDER'], session_id)
        os.makedirs(session_dir, exist_ok=True)
        
        # Load the uploaded data
        file_ext = file_path.rsplit('.', 1)[1].lower()
        
        if file_ext == 'csv':
            df = pd.read_csv(file_path)
        elif file_ext in ['json', 'geojson']:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Handle different JSON structures
            if isinstance(data, dict) and 'features' in data:
                # GeoJSON format
                features = data['features']
                records = []
                for feature in features:
                    properties = feature.get('properties', {})
                    geometry = feature.get('geometry', {})
                    
                    if geometry.get('type') == 'Point' and 'coordinates' in geometry:
                        properties['longitude'] = geometry['coordinates'][0]
                        properties['latitude'] = geometry['coordinates'][1]
                    
                    records.append(properties)
                df = pd.DataFrame(records)
            elif isinstance(data, list):
                df = pd.DataFrame(data)
            else:
                df = pd.DataFrame([data])
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
        
        # Standardize column names
        column_mapping = {
            'Facility_N': 'name', 'facility_name': 'name', 'FacilityName': 'name',
            'Type': 'type', 'facility_type': 'type',
            'Owner': 'owner', 'facility_owner': 'owner',
            'County': 'county', 'County_Name': 'county',
            'Sub_County': 'subcounty', 'SubCounty': 'subcounty',
            'Division': 'division',
            'Location': 'location',
            'Sub_Locati': 'sub_location', 'SubLocation': 'sub_location',
            'Constituen': 'constituency', 'Constituency': 'constituency',
            'Nearest_To': 'nearest_to', 'NearestTo': 'nearest_to',
            'Latitude': 'latitude', 'lat': 'latitude',
            'Longitude': 'longitude', 'lon': 'longitude', 'lng': 'longitude'
        }
        
        df.rename(columns=column_mapping, inplace=True)
        
        # Clean text fields
        text_columns = df.select_dtypes(include=['object']).columns
        for col in text_columns:
            df[col] = df[col].astype(str).str.strip().replace('nan', np.nan).replace('None', np.nan)
        
        # Standardize facility types
        if 'type' in df.columns:
            type_mapping = {
                'hosp': 'Hospital', 'hospital': 'Hospital',
                'disp': 'Dispensary', 'dispensary': 'Dispensary',
                'health centre': 'Health Center', 'health center': 'Health Center',
                'clinic': 'Clinic', 
                'medical': 'Medical Center', 'medical center': 'Medical Center',
                'pharmacy': 'Pharmacy',
                'laboratory': 'Laboratory', 'lab': 'Laboratory',
                'maternity': 'Maternity',
                'nursing': 'Nursing Home', 'nursing home': 'Nursing Home',
            }
            
            df['type'] = df['type'].str.lower().replace(type_mapping).str.title()
        
        # Clean coordinate data
        coord_columns = ['latitude', 'longitude']
        for col in coord_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).str.replace('[^\d\.\-]', '', regex=True)
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Standardize county names
        if 'county' in df.columns:
            df['county'] = df['county'].str.title().replace({
                'Nairobi': 'Nairobi County',
                'Mombasa': 'Mombasa County',
                'Kisumu': 'Kisumu County',
                'Nakuru': 'Nakuru County',
            })
        
        # Save cleaned data
        cleaned_file = os.path.join(session_dir, "cleaned_data.csv")
        df.to_csv(cleaned_file, index=False, encoding='utf-8')
        
        # Merge with Kenya GeoJSON if coordinates available
        if 'latitude' in df.columns and 'longitude' in df.columns:
            # Fetch Kenya GeoJSON from hosted URL
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
                        "session_id": session_id
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
        
        # Generate reports
        report = {
            "session_id": session_id,
            "processed_date": datetime.now().isoformat(),
            "data_type": data_type,
            "total_records": len(df),
            "facilities_with_coordinates": df[['latitude', 'longitude']].notna().all(axis=1).sum() if 'latitude' in df.columns and 'longitude' in df.columns else 0,
            "by_type": {},
            "by_county": {},
            "by_constituency": {},
            "by_owner": {},
            "missing_data": {}
        }
        
        # Count by type
        if 'type' in df.columns:
            type_counts = df['type'].value_counts()
            report['by_type'] = {str(k): int(v) for k, v in type_counts.to_dict().items()}
        
        # Count by county
        if 'county' in df.columns:
            county_counts = df['county'].value_counts()
            report['by_county'] = {str(k): int(v) for k, v in county_counts.to_dict().items()}
        
        # Count by constituency
        if 'constituency' in df.columns:
            constituency_counts = df['constituency'].value_counts()
            report['by_constituency'] = {str(k): int(v) for k, v in constituency_counts.to_dict().items()}
        
        # Count by owner
        if 'owner' in df.columns:
            owner_counts = df['owner'].value_counts()
            report['by_owner'] = {str(k): int(v) for k, v in owner_counts.to_dict().items()}
        
        # Missing data analysis
        for col in df.columns:
            missing = int(df[col].isna().sum())
            report['missing_data'][col] = {
                'missing_count': missing,
                'missing_percentage': round(missing / len(df) * 100, 1) if len(df) > 0 else 0
            }
        
        # Convert numpy types
        report = convert_numpy_types(report)
        
        # Save report
        report_path = os.path.join(session_dir, "analysis_report.json")
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Create a text summary
        summary_path = os.path.join(session_dir, "summary_report.txt")
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write(f"DATA ANALYSIS REPORT - {data_type.upper()}\n")
            f.write("=========================================\n\n")
            f.write(f"Report generated: {report['processed_date']}\n")
            f.write(f"Session ID: {session_id}\n")
            f.write(f"Total records: {report['total_records']}\n")
            f.write(f"Records with coordinates: {report['facilities_with_coordinates']}\n\n")
            
            f.write("RECORDS BY TYPE:\n")
            f.write("----------------\n")
            for record_type, count in report['by_type'].items():
                f.write(f"{record_type}: {count}\n")
            
            f.write("\nRECORDS BY COUNTY:\n")
            f.write("------------------\n")
            for county, count in report['by_county'].items():
                f.write(f"{county}: {count}\n")
            
            f.write("\nMISSING DATA ANALYSIS:\n")
            f.write("----------------------\n")
            for col, stats in report['missing_data'].items():
                f.write(f"{col}: {stats['missing_count']} ({stats['missing_percentage']}%)\n")
        
        return {
            "success": True,
            "session_id": session_id,
            "message": "Data processed successfully",
            "report": report,
            "files": {
                "cleaned_data": cleaned_file,
                "combined_geojson": combined_geojson_path if 'latitude' in df.columns and 'longitude' in df.columns else None,
                "analysis_report": report_path,
                "summary_report": summary_path
            }
        }
    
    except Exception as e:
        return {
            "success": False,
            "session_id": session_id,
            "message": f"Error processing data: {str(e)}"
        }

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and processing"""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    data_type = request.form.get('data_type', 'unknown')
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file and allowed_file(file.filename):
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_{filename}")
        file.save(file_path)
        
        # Process data in background thread
        def process_task():
            result = process_uploaded_data(session_id, file_path, data_type)
            # Store result in session directory for retrieval
            result_path = os.path.join(app.config['PROCESSED_FOLDER'], session_id, "process_result.json")
            with open(result_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
        
        # Start processing in background
        thread = threading.Thread(target=process_task)
        thread.start()
        
        return jsonify({
            "session_id": session_id,
            "message": "File uploaded successfully. Processing started.",
            "status_url": f"/api/status/{session_id}"
        }), 202
    
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/status/<session_id>')
def get_status(session_id):
    """Get processing status for a session"""
    result_path = os.path.join(app.config['PROCESSED_FOLDER'], session_id, "process_result.json")
    
    if os.path.exists(result_path):
        with open(result_path, 'r', encoding='utf-8') as f:
            result = json.load(f)
        return jsonify(result)
    else:
        return jsonify({
            "session_id": session_id,
            "status": "processing",
            "message": "Data is still being processed"
        }), 202

@app.route('/api/download/<session_id>/<file_type>')
def download_file(session_id, file_type):
    """Download processed files"""
    file_type_map = {
        "cleaned": "cleaned_data.csv",
        "geojson": "combined_data.geojson",
        "report": "analysis_report.json",
        "summary": "summary_report.txt"
    }
    
    if file_type not in file_type_map:
        return jsonify({"error": "Invalid file type"}), 400
    
    file_path = os.path.join(app.config['PROCESSED_FOLDER'], session_id, file_type_map[file_type])
    
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    
    return send_file(file_path, as_attachment=True)

@app.route('/api/datasets')
def list_datasets():
    """List all processed datasets"""
    datasets = []
    
    for session_id in os.listdir(app.config['PROCESSED_FOLDER']):
        session_path = os.path.join(app.config['PROCESSED_FOLDER'], session_id)
        result_path = os.path.join(session_path, "process_result.json")
        
        if os.path.exists(result_path):
            with open(result_path, 'r', encoding='utf-8') as f:
                result = json.load(f)
            
            if result.get('success'):
                datasets.append({
                    "session_id": session_id,
                    "data_type": result.get('report', {}).get('data_type', 'unknown'),
                    "processed_date": result.get('report', {}).get('processed_date', ''),
                    "total_records": result.get('report', {}).get('total_records', 0),
                    "has_geojson": os.path.exists(os.path.join(session_path, "combined_data.geojson"))
                })
    
    return jsonify({"datasets": datasets})

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
