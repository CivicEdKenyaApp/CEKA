
#!/usr/bin/env python3
import os
import sys
import subprocess
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def ensure_directories():
    """Ensure all required directories exist"""
    directories = [
        'user_uploads',
        'processed_data',
        'processed_data/reports',
        'processed_data/visualizations'
    ]
    
    for directory in directories:
        path = Path(directory)
        path.mkdir(parents=True, exist_ok=True)
        logger.info(f"Ensured directory exists: {path}")

def check_system_dependencies():
    """Check for system dependencies"""
    try:
        # Check for GDAL/OGR
        result = subprocess.run(['ogr2ogr', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            logger.info("GDAL/OGR is available")
        else:
            logger.warning("GDAL/OGR not available - some geospatial features may not work")
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        logger.warning("GDAL/OGR not available - some geospatial features may not work")

def setup_environment():
    """Setup environment variables and configuration"""
    # Set default environment variables if not present
    defaults = {
        'FLASK_ENV': 'production',
        'PYTHONPATH': os.getcwd(),
        'UPLOAD_FOLDER': 'user_uploads',
        'MAX_CONTENT_LENGTH': '52428800',  # 50MB
    }
    
    for key, value in defaults.items():
        if key not in os.environ:
            os.environ[key] = value
            logger.info(f"Set environment variable: {key}={value}")

def main():
    """Main startup routine"""
    logger.info("Starting CEKA Backend setup...")
    
    try:
        ensure_directories()
        check_system_dependencies()
        setup_environment()
        
        logger.info("CEKA Backend setup completed successfully")
        
        # Import and start the app
        from main import app
        port = int(os.environ.get('PORT', 5000))
        
        logger.info(f"Starting Flask application on port {port}")
        app.run(host='0.0.0.0', port=port, debug=False)
        
    except Exception as e:
        logger.error(f"Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
