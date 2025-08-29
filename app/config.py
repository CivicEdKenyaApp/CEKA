import os
from pathlib import Path

class Config:
    # Base directory
    BASE_DIR = Path(__file__).parent
    
    # Upload settings
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    ALLOWED_EXTENSIONS = {'csv', 'json', 'geojson', 'kml', 'topojson', 'wkt', 'png', 'pdf'}
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size
    
    # Processing directories
    PROCESSED_DIR = BASE_DIR / 'processed_data'
    REPORTS_DIR = PROCESSED_DIR / 'reports'
    VISUALIZATIONS_DIR = PROCESSED_DIR / 'visualizations'
    
    # Create directories if they don't exist
    for directory in [UPLOAD_FOLDER, PROCESSED_DIR, REPORTS_DIR, VISUALIZATIONS_DIR]:
        directory.mkdir(exist_ok=True)
    
    # Database settings (if needed)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + str(BASE_DIR / 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Secret key for session management
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-please-change-in-production'
    
    # Railway-specific settings
    @staticmethod
    def init_app(app):
        # Ensure upload directories exist
        for directory in [Config.UPLOAD_FOLDER, Config.PROCESSED_DIR, 
                         Config.REPORTS_DIR, Config.VISUALIZATIONS_DIR]:
            directory.mkdir(exist_ok=True)
