import os
import sys
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_file, session, redirect, url_for
import uuid
import threading

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Import your custom modules
from utils.file_handler import FileHandler
from utils.data_processor import DataProcessor
from utils.geo_analyzer import GeoAnalyzer
from utils.visualization_engine import VisualizationEngine
from utils.report_generator import ReportGenerator

# Set up absolute paths
BASE_DIR = Path(__file__).parent
TEMPLATE_DIR = BASE_DIR / 'templates'
STATIC_DIR = BASE_DIR / 'static'

app = Flask(__name__,
            template_folder=str(TEMPLATE_DIR),
            static_folder=str(STATIC_DIR))

# Configure app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-please-change-in-production')
app.config['UPLOAD_FOLDER'] = str(BASE_DIR / 'uploads')
app.config['PROCESSED_DIR'] = str(BASE_DIR / 'processed_data')
app.config['REPORTS_DIR'] = str(BASE_DIR / 'processed_data' / 'reports')
app.config['VISUALIZATIONS_DIR'] = str(BASE_DIR / 'processed_data' / 'visualizations')

# Create directories if they don't exist
for directory in [app.config['UPLOAD_FOLDER'], app.config['PROCESSED_DIR'],
                  app.config['REPORTS_DIR'], app.config['VISUALIZATIONS_DIR']]:
    Path(directory).mkdir(exist_ok=True, parents=True)

# Store processing jobs
processing_jobs = {}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['GET', 'POST'])
def upload_files():
    if request.method == 'POST':
        if 'files' not in request.files:
            return render_template('upload.html', error='No files selected')

        files = request.files.getlist('files')
        if not files or all(file.filename == '' for file in files):
            return render_template('upload.html', error='No files selected')

        # Create a job ID
        job_id = str(uuid.uuid4())
        session['job_id'] = job_id

        # Start processing in background thread
        thread = threading.Thread(target=process_files, args=(job_id, files))
        thread.daemon = True
        thread.start()

        return redirect(url_for('processing', job_id=job_id))

    return render_template('upload.html')


@app.route('/processing/<job_id>')
def processing(job_id):
    return render_template('processing.html', job_id=job_id)


@app.route('/status/<job_id>')
def job_status(job_id):
    if job_id in processing_jobs:
        return jsonify(processing_jobs[job_id])
    return jsonify({'status': 'unknown'})


@app.route('/results/<job_id>')
def results(job_id):
    if job_id not in processing_jobs or processing_jobs[job_id]['status'] != 'completed':
        return redirect(url_for('index'))

    job_data = processing_jobs[job_id]
    return render_template('results.html',
                           job_id=job_id,
                           results=job_data['results'],
                           map_path=job_data.get('map_path'),
                           heatmap_path=job_data.get('heatmap_path'),
                           report_path=job_data.get('report_path'))


@app.route('/download/<job_id>/<file_type>')
def download_file(job_id, file_type):
    if job_id not in processing_jobs:
        return "Job not found", 404

    job_data = processing_jobs[job_id]
    file_path = None

    if file_type == 'map' and 'map_path' in job_data:
        file_path = job_data['map_path']
    elif file_type == 'heatmap' and 'heatmap_path' in job_data:
        file_path = job_data['heatmap_path']
    elif file_type == 'report' and 'report_path' in job_data:
        file_path = job_data['report_path']
    elif file_type == 'geojson' and 'geojson_path' in job_data:
        file_path = job_data['geojson_path']

    if file_path and os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)

    return "File not found", 404


def process_files(job_id, files):
    try:
        processing_jobs[job_id] = {'status': 'processing', 'progress': 0}

        # Step 1: Process uploaded files
        processing_jobs[job_id]['progress'] = 10
        processing_jobs[job_id]['message'] = 'Processing uploaded files'

        processor = DataProcessor()
        results = processor.process_uploaded_files(files)

        if not results['success']:
            processing_jobs[job_id]['status'] = 'failed'
            processing_jobs[job_id]['error'] = 'Failed to process files'
            processing_jobs[job_id]['details'] = results['failed']
            return

        # Step 2: Extract Kenya GeoJSON and facility data
        processing_jobs[job_id]['progress'] = 30
        processing_jobs[job_id]['message'] = 'Extracting spatial data'

        kenya_geojson = None
        facility_data = None

        for filename, data_info in results['processed_data'].items():
            if data_info['type'] in ['geojson', 'kml', 'topojson']:
                kenya_geojson = data_info['data']
            elif data_info['type'] == 'csv' and 'latitude' in data_info['data'].columns and 'longitude' in data_info['data'].columns:
                facility_data = data_info['data']

        if kenya_geojson is None or facility_data is None:
            processing_jobs[job_id]['status'] = 'failed'
            processing_jobs[job_id]['error'] = 'Could not find both Kenya GeoJSON and facility data'
            return

        # Step 3: Merge data
        processing_jobs[job_id]['progress'] = 50
        processing_jobs[job_id]['message'] = 'Merging spatial data'

        combined_data = processor.merge_geospatial_data(kenya_geojson, facility_data)

        # Step 4: Calculate statistics
        processing_jobs[job_id]['progress'] = 60
        processing_jobs[job_id]['message'] = 'Calculating statistics'

        analyzer = GeoAnalyzer()
        summaries = analyzer.calculate_summary_statistics(facility_data)
        enhanced_data = analyzer.enhance_with_statistics(combined_data, summaries)
        spatial_analysis = analyzer.perform_spatial_analysis(kenya_geojson, facility_data)

        # Step 5: Generate visualizations
        processing_jobs[job_id]['progress'] = 70
        processing_jobs[job_id]['message'] = 'Generating visualizations'

        visualization_dir = os.path.join(app.config['VISUALIZATIONS_DIR'], job_id)
        Path(visualization_dir).mkdir(exist_ok=True, parents=True)

        viz_engine = VisualizationEngine()
        map_path = viz_engine.create_interactive_map(
            enhanced_data,
            facility_data,
            os.path.join(visualization_dir, 'interactive_map.html')
        )
        heatmap_path = viz_engine.create_heatmap(
            facility_data,
            os.path.join(visualization_dir, 'heatmap.html')
        )

        # Step 6: Generate reports
        processing_jobs[job_id]['progress'] = 80
        processing_jobs[job_id]['message'] = 'Generating reports'

        report_dir = os.path.join(app.config['REPORTS_DIR'], job_id)
        Path(report_dir).mkdir(exist_ok=True, parents=True)

        report_gen = ReportGenerator()
        json_report_path, text_report_path = report_gen.generate_comprehensive_report(
            enhanced_data, facility_data, spatial_analysis, report_dir
        )

        # Step 7: Save enhanced GeoJSON
        geojson_path = os.path.join(report_dir, 'enhanced_data.geojson')
        enhanced_data.to_file(geojson_path, driver='GeoJSON')

        # Update job status
        processing_jobs[job_id]['status'] = 'completed'
        processing_jobs[job_id]['progress'] = 100
        processing_jobs[job_id]['message'] = 'Processing complete'
        processing_jobs[job_id]['results'] = {
            'successful_files': results['success'],
            'failed_files': results['failed'],
            'facility_count': len(facility_data),
            'administrative_areas': len(kenya_geojson)
        }
        processing_jobs[job_id]['map_path'] = map_path
        processing_jobs[job_id]['heatmap_path'] = heatmap_path
        processing_jobs[job_id]['report_path'] = json_report_path
        processing_jobs[job_id]['geojson_path'] = geojson_path

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error processing job {job_id}: {error_details}")
        processing_jobs[job_id]['status'] = 'failed'
        processing_jobs[job_id]['error'] = str(e)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
