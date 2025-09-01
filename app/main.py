
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import logging
import traceback
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from utils.file_handler import FileHandler
from utils.data_processor import DataProcessor
from utils.geo_analyzer import GeoAnalyzer
from utils.report_generator import ReportGenerator
from utils.visualization_engine import VisualizationEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enhanced CORS configuration for all origins and methods
    CORS(app, 
         origins=['*'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
         supports_credentials=True,
         expose_headers=['Content-Disposition'])
    
    # Initialize configuration
    Config.init_app(app)
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'CEKA Backend is running',
            'version': '1.0.0'
        })
    
    # Kenya GeoJSON endpoint
    @app.route('/api/kenya-geojson', methods=['GET'])
    def get_kenya_geojson():
        try:
            logger.info("Fetching Kenya GeoJSON data")
            # Try to serve from local file first
            geojson_path = app.config['PROCESSED_DIR'] / 'kenya_healthcare_enhanced.geojson'
            
            if geojson_path.exists():
                return send_file(geojson_path, mimetype='application/json')
            else:
                # Return default Kenya boundaries if enhanced file doesn't exist
                return jsonify({
                    "type": "FeatureCollection",
                    "features": []
                })
        except Exception as e:
            logger.error(f"Error serving Kenya GeoJSON: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({'error': f'Failed to load Kenya GeoJSON: {str(e)}'}), 500
    
    # Datasets endpoint
    @app.route('/api/datasets', methods=['GET'])
    def get_datasets():
        try:
            logger.info("Fetching datasets")
            datasets_dir = app.config['PROCESSED_DIR']
            datasets = []
            
            if datasets_dir.exists():
                for file_path in datasets_dir.glob('*.json'):
                    if file_path.name != 'kenya_healthcare_enhanced.geojson':
                        datasets.append({
                            'name': file_path.stem,
                            'filename': file_path.name,
                            'size': file_path.stat().st_size,
                            'modified': file_path.stat().st_mtime
                        })
            
            return jsonify({
                'datasets': datasets,
                'count': len(datasets)
            })
        except Exception as e:
            logger.error(f"Error fetching datasets: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({'error': f'Failed to fetch datasets: {str(e)}'}), 500
    
    # File upload endpoint
    @app.route('/api/upload', methods=['POST', 'OPTIONS'])
    def upload_file():
        if request.method == 'OPTIONS':
            return jsonify({'status': 'ok'})
            
        try:
            logger.info("Processing file upload")
            
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            # Save uploaded file
            file_path, unique_filename = FileHandler.save_uploaded_file(file)
            if not file_path:
                return jsonify({'error': 'Failed to save file'}), 400
            
            # Detect file type
            file_type = FileHandler.detect_file_type(file_path)
            logger.info(f"Detected file type: {file_type}")
            
            # Process the file
            processor = DataProcessor()
            result = processor.process_file(file_path, file_type)
            
            if result['success']:
                return jsonify({
                    'success': True,
                    'message': 'File processed successfully',
                    'filename': unique_filename,
                    'file_type': file_type,
                    'data': result['data'],
                    'report_path': result.get('report_path'),
                    'visualization_path': result.get('visualization_path')
                })
            else:
                return jsonify({
                    'success': False,
                    'error': result['error']
                }), 400
                
        except Exception as e:
            logger.error(f"Error processing upload: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({'error': f'Failed to process file: {str(e)}'}), 500
    
    # Process data endpoint
    @app.route('/api/process', methods=['POST'])
    def process_data():
        try:
            logger.info("Processing data request")
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            processor = DataProcessor()
            result = processor.process_json_data(data)
            
            if result['success']:
                return jsonify({
                    'success': True,
                    'message': 'Data processed successfully',
                    'data': result['data'],
                    'analysis': result.get('analysis'),
                    'report_path': result.get('report_path')
                })
            else:
                return jsonify({
                    'success': False,
                    'error': result['error']
                }), 400
                
        except Exception as e:
            logger.error(f"Error processing data: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({'error': f'Failed to process data: {str(e)}'}), 500
    
    # Get processed data
    @app.route('/api/data/<filename>', methods=['GET'])
    def get_processed_data(filename):
        try:
            file_path = app.config['PROCESSED_DIR'] / filename
            if file_path.exists():
                return send_file(file_path, as_attachment=True)
            else:
                return jsonify({'error': 'File not found'}), 404
        except Exception as e:
            logger.error(f"Error serving file: {str(e)}")
            return jsonify({'error': f'Failed to serve file: {str(e)}'}), 500
    
    # Get reports
    @app.route('/api/reports/<filename>', methods=['GET'])
    def get_report(filename):
        try:
            file_path = app.config['REPORTS_DIR'] / filename
            if file_path.exists():
                return send_file(file_path, as_attachment=True)
            else:
                return jsonify({'error': 'Report not found'}), 404
        except Exception as e:
            logger.error(f"Error serving report: {str(e)}")
            return jsonify({'error': f'Failed to serve report: {str(e)}'}), 500
    
    # Get visualizations
    @app.route('/api/visualizations/<filename>', methods=['GET'])
    def get_visualization(filename):
        try:
            file_path = app.config['VISUALIZATIONS_DIR'] / filename
            if file_path.exists():
                return send_file(file_path)
            else:
                return jsonify({'error': 'Visualization not found'}), 404
        except Exception as e:
            logger.error(f"Error serving visualization: {str(e)}")
            return jsonify({'error': f'Failed to serve visualization: {str(e)}'}), 500
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

# Create the Flask app
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting CEKA Backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
