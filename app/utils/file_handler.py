import os
import uuid
import magic
import pandas as pd
import geopandas as gpd
from flask import current_app
from werkzeug.utils import secure_filename
from pathlib import Path
import json
import subprocess
from shapely import wkt
from shapely.geometry import shape
import re

class FileHandler:
    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']
    
    @staticmethod
    def save_uploaded_file(file):
        if file and FileHandler.allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            return file_path, unique_filename
        return None, None
    
    @staticmethod
    def detect_file_type(file_path):
        mime = magic.Magic(mime=True)
        file_type = mime.from_file(file_path)
        extension = Path(file_path).suffix.lower()
        
        # Read first few bytes for content detection
        with open(file_path, 'rb') as f:
            header = f.read(2048)
        
        # CSV detection
        if extension == '.csv' or 'text/csv' in file_type or 'text/plain' in file_type:
            try:
                # Try to read as CSV to verify
                pd.read_csv(file_path, nrows=1)
                return 'csv'
            except:
                pass
        
        # JSON detection
        if extension == '.json' or 'application/json' in file_type:
            try:
                with open(file_path, 'r') as f:
                    json.load(f)
                return 'json'
            except:
                pass
        
        # GeoJSON detection
        if extension == '.geojson' or 'geo+json' in file_type:
            try:
                gpd.read_file(file_path)
                return 'geojson'
            except:
                pass
        
        # KML detection
        if extension == '.kml' or 'application/vnd.google-earth.kml+xml' in file_type:
            try:
                gpd.read_file(file_path, driver='KML')
                return 'kml'
            except:
                pass
        
        # TopoJSON detection
        if extension == '.topojson' or 'topojson' in file_type:
            return 'topojson'
        
        # WKT detection
        if extension == '.wkt' or header.decode('utf-8', errors='ignore').startswith(('POINT', 'LINESTRING', 'POLYGON')):
            return 'wkt'
        
        # PNG detection
        if extension == '.png' or 'image/png' in file_type:
            return 'png'
        
        # PDF detection
        if extension == '.pdf' or 'application/pdf' in file_type:
            return 'pdf'
        
        return 'unknown'
    
    @staticmethod
    def read_file(file_path, file_type):
        try:
            if file_type == 'csv':
                return pd.read_csv(file_path)
            elif file_type == 'json':
                with open(file_path, 'r') as f:
                    return json.load(f)
            elif file_type == 'geojson':
                return gpd.read_file(file_path)
            elif file_type == 'kml':
                return gpd.read_file(file_path, driver='KML')
            elif file_type == 'topojson':
                # Convert TopoJSON to GeoJSON first
                temp_geojson = file_path.replace('.topojson', '.geojson')
                subprocess.run(['ogr2ogr', '-f', 'GeoJSON', temp_geojson, file_path], check=True)
                return gpd.read_file(temp_geojson)
            elif file_type == 'wkt':
                geometries = []
                with open(file_path, 'r') as f:
                    for line in f:
                        geometries.append(wkt.loads(line.strip()))
                return gpd.GeoDataFrame(geometry=geometries)
            elif file_type in ['png', 'pdf']:
                return file_path  # Return path for later processing
        except Exception as e:
            current_app.logger.error(f"Error reading file {file_path}: {str(e)}")
            raise
    
    @staticmethod
    def fix_common_issues(data, file_type):
        if file_type == 'csv':
            # Fix encoding issues
            for col in data.columns:
                if data[col].dtype == 'object':
                    try:
                        data[col] = data[col].str.encode('utf-8', 'ignore').str.decode('utf-8')
                    except:
                        pass
            
            # Fix missing values
            data.fillna('Unknown', inplace=True)
            
        elif file_type in ['geojson', 'kml']:
            # Fix geometry issues
            data = data[data.geometry.notnull()]
            
            # Fix invalid geometries
            for idx, geom in data.geometry.items():
                if not geom.is_valid:
                    data.loc[idx, 'geometry'] = geom.buffer(0)
        
        return data