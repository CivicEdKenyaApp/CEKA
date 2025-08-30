
import os
import uuid
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
import logging
import traceback
import tempfile

logger = logging.getLogger(__name__)

class FileHandler:
    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']
    
    @staticmethod
    def save_uploaded_file(file):
        try:
            if file and FileHandler.allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                file.save(file_path)
                logger.info(f"File saved: {file_path}")
                return file_path, unique_filename
            else:
                logger.warning(f"File not allowed: {file.filename}")
                return None, None
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            logger.error(traceback.format_exc())
            return None, None
    
    @staticmethod
    def detect_file_type(file_path):
        try:
            extension = Path(file_path).suffix.lower()
            
            # Read first few bytes for content detection
            with open(file_path, 'rb') as f:
                header = f.read(2048)
            
            # Try to detect based on extension first
            if extension == '.csv':
                try:
                    pd.read_csv(file_path, nrows=1)
                    return 'csv'
                except:
                    pass
            
            if extension == '.json':
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        json.load(f)
                    return 'json'
                except:
                    pass
            
            if extension == '.geojson':
                try:
                    gpd.read_file(file_path)
                    return 'geojson'
                except:
                    pass
            
            if extension == '.kml':
                try:
                    gpd.read_file(file_path, driver='KML')
                    return 'kml'
                except:
                    pass
            
            if extension == '.topojson':
                return 'topojson'
            
            if extension == '.wkt':
                return 'wkt'
            
            if extension in ['.xlsx', '.xls']:
                try:
                    pd.read_excel(file_path, nrows=1)
                    return 'excel'
                except:
                    pass
            
            if extension == '.png':
                return 'png'
            
            if extension == '.pdf':
                return 'pdf'
            
            # Try to detect based on content
            header_str = header.decode('utf-8', errors='ignore')
            
            if 'FeatureCollection' in header_str or 'geometry' in header_str:
                return 'geojson'
            
            if header_str.startswith(('POINT', 'LINESTRING', 'POLYGON')):
                return 'wkt'
            
            # Default fallback
            logger.warning(f"Could not detect file type for: {file_path}")
            return 'unknown'
            
        except Exception as e:
            logger.error(f"Error detecting file type for {file_path}: {str(e)}")
            return 'unknown'
    
    @staticmethod
    def read_file(file_path, file_type):
        try:
            logger.info(f"Reading file: {file_path} as {file_type}")
            
            if file_type == 'csv':
                return pd.read_csv(file_path, encoding='utf-8', low_memory=False)
            
            elif file_type == 'excel':
                return pd.read_excel(file_path)
            
            elif file_type == 'json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            elif file_type == 'geojson':
                return gpd.read_file(file_path)
            
            elif file_type == 'kml':
                return gpd.read_file(file_path, driver='KML')
            
            elif file_type == 'topojson':
                # Convert TopoJSON to GeoJSON first
                temp_geojson = file_path.replace('.topojson', '.geojson')
                try:
                    subprocess.run(['ogr2ogr', '-f', 'GeoJSON', temp_geojson, file_path], 
                                 check=True, capture_output=True, text=True)
                    return gpd.read_file(temp_geojson)
                except subprocess.CalledProcessError as e:
                    logger.error(f"Failed to convert TopoJSON: {e}")
                    # Fallback: try to read as regular JSON
                    with open(file_path, 'r', encoding='utf-8') as f:
                        return json.load(f)
            
            elif file_type == 'wkt':
                geometries = []
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line:
                            try:
                                geometries.append(wkt.loads(line))
                            except Exception as e:
                                logger.warning(f"Failed to parse WKT line: {line}")
                return gpd.GeoDataFrame(geometry=geometries, crs="EPSG:4326")
            
            elif file_type in ['png', 'pdf']:
                # Return file path for later processing
                return file_path
            
            else:
                logger.error(f"Unsupported file type: {file_type}")
                raise ValueError(f"Unsupported file type: {file_type}")
                
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    @staticmethod
    def fix_common_issues(data, file_type):
        try:
            logger.info(f"Fixing common issues for {file_type} data")
            
            if file_type in ['csv', 'excel']:
                if hasattr(data, 'columns'):
                    # Fix encoding issues
                    for col in data.columns:
                        if data[col].dtype == 'object':
                            try:
                                # Handle string columns
                                data[col] = data[col].astype(str)
                                # Remove non-printable characters
                                data[col] = data[col].str.replace(r'[^\x20-\x7E]', '', regex=True)
                            except Exception as e:
                                logger.warning(f"Could not fix encoding for column {col}: {e}")
                    
                    # Fill missing values with 'Unknown' for object columns
                    object_cols = data.select_dtypes(include=['object']).columns
                    data[object_cols] = data[object_cols].fillna('Unknown')
                    
                    # Fill missing values with 0 for numeric columns
                    numeric_cols = data.select_dtypes(include=['number']).columns
                    data[numeric_cols] = data[numeric_cols].fillna(0)
            
            elif file_type in ['geojson', 'kml']:
                if hasattr(data, 'geometry'):
                    # Remove null geometries
                    data = data[data.geometry.notnull()]
                    
                    # Fix invalid geometries
                    invalid_mask = ~data.geometry.is_valid
                    if invalid_mask.any():
                        logger.info(f"Fixing {invalid_mask.sum()} invalid geometries")
                        data.loc[invalid_mask, 'geometry'] = data.loc[invalid_mask, 'geometry'].buffer(0)
                    
                    # Ensure CRS is set
                    if data.crs is None:
                        data.crs = "EPSG:4326"
                        logger.info("Set default CRS to EPSG:4326")
            
            logger.info("Common issues fixed successfully")
            return data
            
        except Exception as e:
            logger.error(f"Error fixing common issues: {str(e)}")
            logger.error(traceback.format_exc())
            return data  # Return original data if fixing fails
