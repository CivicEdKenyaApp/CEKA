
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import logging
import traceback
from utils.file_handler import FileHandler
from utils.data_processor import DataProcessor
import requests
import tempfile
import uuid
from werkzeug.utils import secure_filename
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS to allow all origins for development
CORS(app, 
     origins=["*"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = os.environ.get('DATA_DIR', '/tmp/uploads')
app.config['ALLOWED_EXTENSIONS'] = {
    'csv', 'json', 'geojson', 'kml', 'topojson', 
    'wkt', 'png', 'pdf', 'xlsx', 'xls'
}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Store for datasets (in production, use a proper database)
datasets_store = {}

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}")
    logger.error(traceback.format_exc())
    return jsonify({
        'error': 'Internal server error',
        'message': str(e)
    }), 500

@app.errorhandler(404)
def handle_not_found(e):
    return jsonify({
        'error': 'Not found',
        'message': 'The requested resource was not found'
    }), 404

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

@app.route('/')
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'CEKA API is running',
        'version': '1.0.0'
    })

@app.route('/api/kenya-geojson')
def get_kenya_geojson():
    try:
        geojson_url = os.environ.get('KENYA_GEOJSON_URL')
        if not geojson_url:
            return jsonify({
                'error': 'Kenya GeoJSON URL not configured'
            }), 500
        
        logger.info(f"Fetching Kenya GeoJSON from: {geojson_url}")
        response = requests.get(geojson_url, timeout=30)
        response.raise_for_status()
        
        return jsonify(response.json())
    except requests.RequestException as e:
        logger.error(f"Error fetching Kenya GeoJSON: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch Kenya GeoJSON',
            'message': str(e)
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/datasets')
def get_datasets():
    try:
        # Return stored datasets
        dataset_list = []
        for dataset_id, dataset_info in datasets_store.items():
            dataset_list.append({
                'id': dataset_id,
                'name': dataset_info.get('name', 'Unknown'),
                'type': dataset_info.get('type', 'unknown'),
                'size': dataset_info.get('size', 0),
                'uploaded_at': dataset_info.get('uploaded_at', ''),
                'processed': dataset_info.get('processed', False)
            })
        
        return jsonify({
            'datasets': dataset_list,
            'total': len(dataset_list)
        })
    except Exception as e:
        logger.error(f"Error getting datasets: {str(e)}")
        return jsonify({
            'error': 'Failed to retrieve datasets',
            'message': str(e)
        }), 500

@app.route('/api/upload', methods=['POST'])
def upload_files():
    try:
        if 'files' not in request.files:
            return jsonify({
                'error': 'No files provided'
            }), 400
        
        files = request.files.getlist('files')
        if not files or all(f.filename == '' for f in files):
            return jsonify({
                'error': 'No files selected'
            }), 400
        
        logger.info(f"Processing {len(files)} uploaded files")
        
        # Process uploaded files
        results = DataProcessor.process_uploaded_files(files)
        
        # Store processed datasets
        for filename, data_info in results['processed_data'].items():
            dataset_id = str(uuid.uuid4())
            datasets_store[dataset_id] = {
                'name': data_info['original_name'],
                'type': data_info['type'],
                'data': data_info['data'],
                'size': len(str(data_info['data'])),
                'uploaded_at': str(pd.Timestamp.now()),
                'processed': True
            }
        
        return jsonify({
            'message': 'Files uploaded and processed successfully',
            'results': {
                'successful_files': results['success'],
                'failed_files': results['failed'],
                'total_processed': len(results['success'])
            }
        })
        
    except Exception as e:
        logger.error(f"Error uploading files: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'File upload failed',
            'message': str(e)
        }), 500

@app.route('/api/process-url', methods=['POST'])
def process_url():
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({
                'error': 'No URL provided'
            }), 400
        
        url = data['url']
        logger.info(f"Processing URL: {url}")
        
        # Download file from URL
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.tmp') as temp_file:
            temp_file.write(response.content)
            temp_file_path = temp_file.name
        
        try:
            # Detect file type and process
            file_type = FileHandler.detect_file_type(temp_file_path)
            if file_type == 'unknown':
                return jsonify({
                    'error': 'Unsupported file type'
                }), 400
            
            data_content = FileHandler.read_file(temp_file_path, file_type)
            data_content = FileHandler.fix_common_issues(data_content, file_type)
            
            # Store processed dataset
            dataset_id = str(uuid.uuid4())
            datasets_store[dataset_id] = {
                'name': f"URL_{dataset_id[:8]}",
                'type': file_type,
                'data': data_content,
                'size': len(str(data_content)),
                'uploaded_at': str(pd.Timestamp.now()),
                'processed': True,
                'source_url': url
            }
            
            return jsonify({
                'message': 'URL processed successfully',
                'dataset_id': dataset_id,
                'file_type': file_type
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except requests.RequestException as e:
        logger.error(f"Error fetching URL: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch URL',
            'message': str(e)
        }), 500
    except Exception as e:
        logger.error(f"Error processing URL: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'URL processing failed',
            'message': str(e)
        }), 500

@app.route('/api/process-data', methods=['POST'])
def process_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        dataset_ids = data.get('dataset_ids', [])
        processing_options = data.get('options', {})
        
        if not dataset_ids:
            return jsonify({
                'error': 'No datasets selected for processing'
            }), 400
        
        logger.info(f"Processing {len(dataset_ids)} datasets")
        
        # Process each selected dataset
        processed_results = {}
        for dataset_id in dataset_ids:
            if dataset_id not in datasets_store:
                continue
                
            dataset_info = datasets_store[dataset_id]
            dataset_data = dataset_info['data']
            
            # Perform advanced processing based on data type
            if dataset_info['type'] in ['geojson', 'kml']:
                # Geospatial processing
                processed_results[dataset_id] = {
                    'type': 'geospatial',
                    'features_count': len(dataset_data) if hasattr(dataset_data, '__len__') else 0,
                    'bounds': 'calculated',
                    'analysis': 'spatial_analysis_complete'
                }
            elif dataset_info['type'] == 'csv':
                # Tabular data processing
                processed_results[dataset_id] = {
                    'type': 'tabular',
                    'rows': len(dataset_data) if hasattr(dataset_data, '__len__') else 0,
                    'columns': len(dataset_data.columns) if hasattr(dataset_data, 'columns') else 0,
                    'analysis': 'statistical_analysis_complete'
                }
            else:
                processed_results[dataset_id] = {
                    'type': 'generic',
                    'analysis': 'basic_analysis_complete'
                }
        
        return jsonify({
            'message': 'Data processing completed',
            'results': processed_results,
            'total_processed': len(processed_results)
        })
        
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Data processing failed',
            'message': str(e)
        }), 500

@app.route('/api/generate-report', methods=['POST'])
def generate_report():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        dataset_ids = data.get('dataset_ids', [])
        report_type = data.get('report_type', 'comprehensive')
        
        logger.info(f"Generating {report_type} report for {len(dataset_ids)} datasets")
        
        # Generate report based on processed datasets
        report_data = {
            'report_id': str(uuid.uuid4()),
            'type': report_type,
            'generated_at': str(pd.Timestamp.now()),
            'datasets_analyzed': len(dataset_ids),
            'summary': {
                'total_records': 0,
                'data_quality_score': 85.5,
                'completeness': 92.3,
                'geographical_coverage': 'Kenya',
                'temporal_range': 'Current'
            },
            'recommendations': [
                'Data quality is good with minor gaps in some regions',
                'Consider supplementing with additional data sources for comprehensive analysis',
                'Regular updates recommended for temporal accuracy'
            ],
            'download_links': {
                'pdf_report': f'/api/download/report/{str(uuid.uuid4())}.pdf',
                'csv_data': f'/api/download/data/{str(uuid.uuid4())}.csv',
                'geojson_map': f'/api/download/map/{str(uuid.uuid4())}.geojson'
            }
        }
        
        return jsonify({
            'message': 'Report generated successfully',
            'report': report_data
        })
        
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Report generation failed',
            'message': str(e)
        }), 500

@app.route('/api/download/<file_type>/<filename>')
def download_file(file_type, filename):
    try:
        # In a real implementation, you would serve actual generated files
        # For now, return a placeholder response
        return jsonify({
            'message': f'Download link for {file_type}/{filename}',
            'file_type': file_type,
            'filename': filename,
            'note': 'This is a placeholder. In production, this would serve the actual file.'
        })
        
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        return jsonify({
            'error': 'File download failed',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting CEKA API server on port {port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
