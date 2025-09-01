
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
import mimetypes

logger = logging.getLogger(__name__)

class FileHandler:
    @staticmethod
    def allowed_file(filename):
        if not filename or '.' not in filename:
            return False
        return filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']
    
    @staticmethod
    def save_uploaded_file(file):
        try:
            if file and file.filename and FileHandler.allowed_file(file.filename):
                filename = secure_filename(file.filename)
                if not filename:
                    logger.warning("Filename became empty after sanitization")
                    return None, None
                
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                # Save file with error handling
                try:
                    file.save(file_path)
                    
                    # Verify file was saved and has content
                    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                        logger.info(f"File saved successfully: {file_path}")
                        return file_path, unique_filename
                    else:
                        logger.error(f"File saved but is empty or doesn't exist: {file_path}")
                        return None, None
                        
                except Exception as save_error:
                    logger.error(f"Error saving file: {str(save_error)}")
                    return None, None
            else:
                logger.warning(f"File not allowed: {getattr(file, 'filename', 'No filename')}")
                return None, None
                
        except Exception as e:
            logger.error(f"Error in save_uploaded_file: {str(e)}")
            logger.error(traceback.format_exc())
            return None, None
    
    @staticmethod
    def detect_file_type(file_path):
        try:
            if not os.path.exists(file_path):
                logger.error(f"File does not exist: {file_path}")
                return 'unknown'
            
            extension = Path(file_path).suffix.lower()
            
            # Get MIME type
            mime_type, _ = mimetypes.guess_type(file_path)
            
            # Read first few bytes for content detection
            try:
                with open(file_path, 'rb') as f:
                    header = f.read(4096)  # Increased buffer size
            except Exception as e:
                logger.error(f"Could not read file header: {e}")
                header = b''
            
            # Try to detect based on extension and content
            if extension == '.csv' or mime_type == 'text/csv':
                try:
                    # Test if it's actually CSV
                    pd.read_csv(file_path, nrows=1, encoding='utf-8', on_bad_lines='skip')
                    return 'csv'
                except UnicodeDecodeError:
                    try:
                        pd.read_csv(file_path, nrows=1, encoding='latin-1', on_bad_lines='skip')
                        return 'csv'
                    except:
                        pass
                except:
                    pass
            
            if extension == '.json' or mime_type == 'application/json':
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        json.load(f)
                    return 'json'
                except UnicodeDecodeError:
                    try:
                        with open(file_path, 'r', encoding='latin-1') as f:
                            json.load(f)
                        return 'json'
                    except:
                        pass
                except:
                    pass
            
            if extension == '.geojson':
                try:
                    # Try as GeoJSON first
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if data.get('type') == 'FeatureCollection':
                            return 'geojson'
                except:
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
            
            if extension in ['.xlsx', '.xls'] or mime_type in ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']:
                try:
                    pd.read_excel(file_path, nrows=1)
                    return 'excel'
                except:
                    pass
            
            if extension == '.png' or mime_type == 'image/png':
                return 'png'
            
            if extension == '.pdf' or mime_type == 'application/pdf':
                return 'pdf'
            
            # Try to detect based on content
            if header:
                header_str = header.decode('utf-8', errors='ignore')
                
                # GeoJSON detection
                if ('FeatureCollection' in header_str or 
                    ('type' in header_str and 'geometry' in header_str)):
                    return 'geojson'
                
                # CSV detection
                if ',' in header_str and '\n' in header_str:
                    lines = header_str.split('\n')[:3]
                    if all(',' in line for line in lines if line.strip()):
                        return 'csv'
                
                # JSON detection
                if header_str.strip().startswith(('{', '[')):
                    return 'json'
                
                # WKT detection
                if header_str.startswith(('POINT', 'LINESTRING', 'POLYGON', 'MULTIPOINT', 'MULTILINESTRING', 'MULTIPOLYGON')):
                    return 'wkt'
            
            # Default fallback based on extension
            extension_map = {
                '.txt': 'csv',  # Assume text files are CSV
                '.tsv': 'csv',  # Tab-separated values
                '.dat': 'csv',  # Data files
            }
            
            if extension in extension_map:
                return extension_map[extension]
            
            logger.warning(f"Could not detect file type for: {file_path}, extension: {extension}, mime: {mime_type}")
            return 'unknown'
            
        except Exception as e:
            logger.error(f"Error detecting file type for {file_path}: {str(e)}")
            logger.error(traceback.format_exc())
            return 'unknown'
    
    @staticmethod
    def read_file(file_path, file_type):
        try:
            logger.info(f"Reading file: {file_path} as {file_type}")
            
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            if file_type == 'csv':
                # Try multiple encodings and separators
                encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
                separators = [',', ';', '\t', '|']
                
                for encoding in encodings:
                    for sep in separators:
                        try:
                            df = pd.read_csv(file_path, encoding=encoding, sep=sep, 
                                           low_memory=False, on_bad_lines='skip')
                            if len(df.columns) > 1:  # Valid CSV should have multiple columns
                                logger.info(f"Successfully read CSV with encoding={encoding}, sep='{sep}'")
                                return df
                        except Exception as e:
                            continue
                
                # Final attempt with basic parameters
                return pd.read_csv(file_path, encoding='utf-8', low_memory=False, on_bad_lines='skip')
            
            elif file_type == 'excel':
                try:
                    return pd.read_excel(file_path, engine='openpyxl')
                except:
                    return pd.read_excel(file_path, engine='xlrd')
            
            elif file_type == 'json':
                encodings = ['utf-8', 'latin-1', 'cp1252']
                for encoding in encodings:
                    try:
                        with open(file_path, 'r', encoding=encoding) as f:
                            return json.load(f)
                    except UnicodeDecodeError:
                        continue
                    except json.JSONDecodeError as e:
                        logger.error(f"JSON decode error: {e}")
                        raise
                raise UnicodeDecodeError("Could not decode file with any encoding")
            
            elif file_type == 'geojson':
                try:
                    return gpd.read_file(file_path)
                except Exception as e:
                    logger.warning(f"Failed to read as GeoPandas file, trying as JSON: {e}")
                    with open(file_path, 'r', encoding='utf-8') as f:
                        geojson_data = json.load(f)
                    return gpd.GeoDataFrame.from_features(geojson_data.get('features', []), crs="EPSG:4326")
            
            elif file_type == 'kml':
                return gpd.read_file(file_path, driver='KML')
            
            elif file_type == 'topojson':
                # Try ogr2ogr conversion first
                temp_geojson = file_path.replace('.topojson', '_converted.geojson')
                try:
                    result = subprocess.run(
                        ['ogr2ogr', '-f', 'GeoJSON', temp_geojson, file_path], 
                        check=True, capture_output=True, text=True, timeout=30
                    )
                    if os.path.exists(temp_geojson):
                        gdf = gpd.read_file(temp_geojson)
                        os.remove(temp_geojson)  # Clean up
                        return gdf
                except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as e:
                    logger.warning(f"ogr2ogr conversion failed: {e}")
                
                # Fallback: try to read as regular JSON
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            elif file_type == 'wkt':
                geometries = []
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line_num, line in enumerate(f, 1):
                        line = line.strip()
                        if line and not line.startswith('#'):  # Skip empty lines and comments
                            try:
                                geom = wkt.loads(line)
                                geometries.append(geom)
                            except Exception as e:
                                logger.warning(f"Failed to parse WKT line {line_num}: {line} - {e}")
                
                if not geometries:
                    raise ValueError("No valid WKT geometries found in file")
                
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
                    # Clean column names
                    data.columns = data.columns.astype(str)
                    data.columns = [col.strip() for col in data.columns]
                    
                    # Fix encoding issues in string columns
                    for col in data.columns:
                        if data[col].dtype == 'object':
                            try:
                                # Handle string columns
                                data[col] = data[col].astype(str)
                                # Remove non-printable characters but keep international chars
                                data[col] = data[col].str.replace(r'[\x00-\x1F\x7F]', '', regex=True)
                                # Replace common encoding issues
                                data[col] = data[col].str.replace('â€™', "'", regex=False)
                                data[col] = data[col].str.replace('â€œ', '"', regex=False)
                                data[col] = data[col].str.replace('â€', '"', regex=False)
                            except Exception as e:
                                logger.warning(f"Could not fix encoding for column {col}: {e}")
                    
                    # Handle missing values more intelligently
                    for col in data.columns:
                        if data[col].dtype == 'object':
                            # Replace various null representations
                            null_values = ['nan', 'NaN', 'null', 'NULL', 'None', 'n/a', 'N/A', '']
                            data[col] = data[col].replace(null_values, pd.NA)
                            data[col] = data[col].fillna('Unknown')
                        else:
                            # For numeric columns, keep as NaN for now
                            pass
                    
                    # Remove duplicate rows
                    initial_rows = len(data)
                    data = data.drop_duplicates()
                    if len(data) < initial_rows:
                        logger.info(f"Removed {initial_rows - len(data)} duplicate rows")
            
            elif file_type in ['geojson', 'kml', 'wkt']:
                if hasattr(data, 'geometry'):
                    # Remove null geometries
                    initial_features = len(data)
                    data = data[data.geometry.notnull()]
                    if len(data) < initial_features:
                        logger.info(f"Removed {initial_features - len(data)} features with null geometries")
                    
                    # Fix invalid geometries
                    if len(data) > 0:
                        invalid_mask = ~data.geometry.is_valid
                        if invalid_mask.any():
                            logger.info(f"Fixing {invalid_mask.sum()} invalid geometries")
                            try:
                                data.loc[invalid_mask, 'geometry'] = data.loc[invalid_mask, 'geometry'].buffer(0)
                            except Exception as e:
                                logger.warning(f"Could not fix invalid geometries: {e}")
                    
                    # Ensure CRS is set
                    if data.crs is None:
                        data.crs = "EPSG:4326"
                        logger.info("Set default CRS to EPSG:4326")
                    
                    # Clean attribute data
                    for col in data.columns:
                        if col != 'geometry' and data[col].dtype == 'object':
                            try:
                                data[col] = data[col].astype(str)
                                data[col] = data[col].str.replace(r'[\x00-\x1F\x7F]', '', regex=True)
                                data[col] = data[col].replace(['nan', 'NaN', 'null', 'NULL', 'None'], 'Unknown')
                            except Exception as e:
                                logger.warning(f"Could not clean column {col}: {e}")
            
            elif file_type == 'json':
                # For JSON, basic structure validation
                if isinstance(data, str):
                    try:
                        data = json.loads(data)
                    except json.JSONDecodeError:
                        logger.warning("Could not parse string as JSON")
            
            logger.info("Common issues fixed successfully")
            return data
            
        except Exception as e:
            logger.error(f"Error fixing common issues: {str(e)}")
            logger.error(traceback.format_exc())
            return data  # Return original data if fixing fails
    
    @staticmethod
    def get_file_info(file_path):
        """Get comprehensive file information"""
        try:
            path = Path(file_path)
            stat = path.stat()
            
            return {
                'name': path.name,
                'size': stat.st_size,
                'size_mb': round(stat.st_size / (1024 * 1024), 2),
                'modified': stat.st_mtime,
                'extension': path.suffix.lower(),
                'mime_type': mimetypes.guess_type(file_path)[0],
                'exists': path.exists(),
                'readable': os.access(file_path, os.R_OK)
            }
        except Exception as e:
            logger.error(f"Error getting file info: {e}")
            return {}
    
    @staticmethod
    def validate_file_size(file_path, max_size_mb=50):
        """Validate file size"""
        try:
            size_mb = os.path.getsize(file_path) / (1024 * 1024)
            return size_mb <= max_size_mb, size_mb
        except Exception as e:
            logger.error(f"Error validating file size: {e}")
            return False, 0
    
    @staticmethod
    def cleanup_temp_files(directory, max_age_hours=24):
        """Clean up old temporary files"""
        try:
            import time
            current_time = time.time()
            max_age_seconds = max_age_hours * 3600
            
            for file_path in Path(directory).glob('*'):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        file_path.unlink()
                        logger.info(f"Cleaned up old file: {file_path}")
                        
        except Exception as e:
            logger.error(f"Error cleaning up temp files: {e}")
