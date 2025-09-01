
import pandas as pd
import geopandas as gpd
import json
import os
import logging
import traceback
from datetime import datetime
from pathlib import Path
from flask import current_app

from .file_handler import FileHandler
from .geo_analyzer import GeoAnalyzer
from .report_generator import ReportGenerator
from .visualization_engine import VisualizationEngine

logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self):
        self.supported_formats = ['csv', 'json', 'geojson', 'kml', 'topojson', 'wkt', 'excel', 'png', 'pdf']
        
    def process_file(self, file_path, file_type):
        """Main file processing method"""
        try:
            logger.info(f"Processing file: {file_path} of type: {file_type}")
            
            if file_type not in self.supported_formats:
                return {
                    'success': False,
                    'error': f'Unsupported file type: {file_type}'
                }
            
            # Read the file
            raw_data = FileHandler.read_file(file_path, file_type)
            
            # Fix common issues
            cleaned_data = FileHandler.fix_common_issues(raw_data, file_type)
            
            # Process based on file type
            if file_type in ['csv', 'excel']:
                return self._process_tabular_data(cleaned_data, file_path, file_type)
            elif file_type in ['json']:
                return self._process_json_data(cleaned_data, file_path)
            elif file_type in ['geojson', 'kml', 'topojson', 'wkt']:
                return self._process_geospatial_data(cleaned_data, file_path, file_type)
            elif file_type in ['png', 'pdf']:
                return self._process_image_pdf(cleaned_data, file_path, file_type)
            else:
                return {
                    'success': False,
                    'error': f'Processing not implemented for {file_type}'
                }
                
        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'success': False,
                'error': f'Failed to process file: {str(e)}'
            }
    
    def _process_tabular_data(self, data, file_path, file_type):
        """Process CSV and Excel files"""
        try:
            logger.info(f"Processing tabular data with {len(data)} rows")
            
            # Basic statistics
            stats = {
                'total_rows': len(data),
                'total_columns': len(data.columns),
                'columns': list(data.columns),
                'dtypes': {col: str(dtype) for col, dtype in data.dtypes.items()},
                'null_counts': data.isnull().sum().to_dict(),
                'memory_usage': data.memory_usage(deep=True).sum()
            }
            
            # Check if this could be geospatial data
            geo_columns = self._detect_geo_columns(data)
            if geo_columns:
                logger.info(f"Detected potential geo columns: {geo_columns}")
                try:
                    gdf = self._convert_to_geodataframe(data, geo_columns)
                    if gdf is not None:
                        return self._process_geospatial_data(gdf, file_path, 'csv_with_geo')
                except Exception as e:
                    logger.warning(f"Failed to convert to GeoDataFrame: {e}")
            
            # Save processed data
            output_path = self._save_processed_data(data, file_path, 'processed_tabular')
            
            # Generate reports
            report_path = self._generate_tabular_report(data, stats, file_path)
            
            return {
                'success': True,
                'data': {
                    'type': 'tabular',
                    'statistics': stats,
                    'sample_data': data.head(10).to_dict('records'),
                    'file_info': {
                        'original_path': str(file_path),
                        'processed_path': str(output_path)
                    }
                },
                'report_path': report_path
            }
            
        except Exception as e:
            logger.error(f"Error processing tabular data: {str(e)}")
            raise
    
    def _process_json_data(self, data, file_path):
        """Process JSON files"""
        try:
            logger.info("Processing JSON data")
            
            # Analyze JSON structure
            structure_info = self._analyze_json_structure(data)
            
            # Check if it's GeoJSON
            if self._is_geojson(data):
                logger.info("Detected GeoJSON format")
                # Convert to GeoDataFrame and process as geospatial
                try:
                    if isinstance(data, dict):
                        gdf = gpd.GeoDataFrame.from_features(data.get('features', []))
                    else:
                        gdf = gpd.GeoDataFrame.from_features(data)
                    return self._process_geospatial_data(gdf, file_path, 'geojson')
                except Exception as e:
                    logger.warning(f"Failed to process as GeoJSON: {e}")
            
            # Save processed data
            output_path = self._save_processed_data(data, file_path, 'processed_json')
            
            # Generate basic report
            report_path = self._generate_json_report(data, structure_info, file_path)
            
            return {
                'success': True,
                'data': {
                    'type': 'json',
                    'structure': structure_info,
                    'sample_data': self._get_json_sample(data),
                    'file_info': {
                        'original_path': str(file_path),
                        'processed_path': str(output_path)
                    }
                },
                'report_path': report_path
            }
            
        except Exception as e:
            logger.error(f"Error processing JSON data: {str(e)}")
            raise
    
    def _process_geospatial_data(self, gdf, file_path, file_type):
        """Process geospatial data"""
        try:
            logger.info(f"Processing geospatial data with {len(gdf)} features")
            
            # Ensure CRS is set
            if gdf.crs is None:
                gdf.crs = "EPSG:4326"
                logger.info("Set default CRS to EPSG:4326")
            
            # Basic geospatial statistics
            geo_stats = {
                'total_features': len(gdf),
                'geometry_types': gdf.geometry.type.value_counts().to_dict(),
                'crs': str(gdf.crs),
                'bounds': gdf.total_bounds.tolist(),
                'columns': list(gdf.columns),
                'has_valid_geometries': gdf.geometry.is_valid.all()
            }
            
            # Perform spatial analysis
            spatial_analysis = GeoAnalyzer.perform_spatial_analysis(gdf, gdf)
            
            # Save processed data
            output_path = self._save_processed_geodata(gdf, file_path)
            
            # Generate comprehensive report
            report_path, summary_path = ReportGenerator.generate_comprehensive_report(
                gdf, gdf, spatial_analysis, current_app.config['REPORTS_DIR']
            )
            
            # Create visualizations
            viz_path = VisualizationEngine.create_interactive_map(
                gdf, gdf, str(current_app.config['VISUALIZATIONS_DIR'] / 'interactive_map.html')
            )
            
            heatmap_path = VisualizationEngine.create_heatmap(
                gdf[gdf.geometry.type == 'Point'], 
                str(current_app.config['VISUALIZATIONS_DIR'] / 'facility_heatmap.html')
            )
            
            return {
                'success': True,
                'data': {
                    'type': 'geospatial',
                    'statistics': geo_stats,
                    'spatial_analysis': spatial_analysis,
                    'sample_features': self._get_geospatial_sample(gdf),
                    'file_info': {
                        'original_path': str(file_path),
                        'processed_path': str(output_path)
                    }
                },
                'report_path': report_path,
                'visualization_path': viz_path,
                'analysis': spatial_analysis
            }
            
        except Exception as e:
            logger.error(f"Error processing geospatial data: {str(e)}")
            raise
    
    def _process_image_pdf(self, file_path, original_path, file_type):
        """Process image and PDF files"""
        try:
            logger.info(f"Processing {file_type} file")
            
            # For now, just return file info
            # Future: implement OCR, image analysis, etc.
            file_stats = Path(file_path).stat()
            
            return {
                'success': True,
                'data': {
                    'type': file_type,
                    'file_info': {
                        'original_path': str(original_path),
                        'processed_path': str(file_path),
                        'size': file_stats.st_size,
                        'modified': file_stats.st_mtime
                    },
                    'message': f'{file_type.upper()} file received. Advanced processing will be implemented in future updates.'
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing {file_type}: {str(e)}")
            raise
    
    def process_json_data(self, json_data):
        """Process JSON data directly from API request"""
        try:
            logger.info("Processing JSON data from API request")
            
            # Create temporary file
            temp_path = current_app.config['UPLOAD_FOLDER'] / f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=2)
            
            # Process the temporary file
            result = self.process_file(temp_path, 'json')
            
            # Clean up temporary file
            if temp_path.exists():
                temp_path.unlink()
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing JSON data: {str(e)}")
            return {
                'success': False,
                'error': f'Failed to process JSON data: {str(e)}'
            }
    
    def _detect_geo_columns(self, df):
        """Detect potential geographic columns"""
        geo_indicators = {
            'latitude': ['lat', 'latitude', 'y', 'coord_y', 'lat_y'],
            'longitude': ['lon', 'lng', 'longitude', 'x', 'coord_x', 'lon_x', 'lng_x'],
            'geometry': ['geometry', 'geom', 'wkt', 'shape']
        }
        
        detected = {}
        for col in df.columns:
            col_lower = col.lower()
            for geo_type, indicators in geo_indicators.items():
                if any(indicator in col_lower for indicator in indicators):
                    detected[geo_type] = col
                    break
        
        return detected
    
    def _convert_to_geodataframe(self, df, geo_columns):
        """Convert DataFrame to GeoDataFrame"""
        try:
            if 'geometry' in geo_columns:
                # Direct geometry column
                from shapely import wkt
                df['geometry'] = df[geo_columns['geometry']].apply(wkt.loads)
                return gpd.GeoDataFrame(df, geometry='geometry', crs="EPSG:4326")
            
            elif 'latitude' in geo_columns and 'longitude' in geo_columns:
                # Lat/Lon columns
                return gpd.GeoDataFrame(
                    df, 
                    geometry=gpd.points_from_xy(df[geo_columns['longitude']], df[geo_columns['latitude']]),
                    crs="EPSG:4326"
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Error converting to GeoDataFrame: {e}")
            return None
    
    def _analyze_json_structure(self, data):
        """Analyze JSON data structure"""
        if isinstance(data, dict):
            return {
                'type': 'object',
                'keys': list(data.keys()),
                'total_keys': len(data.keys()),
                'nested_levels': self._count_nested_levels(data)
            }
        elif isinstance(data, list):
            return {
                'type': 'array',
                'length': len(data),
                'item_types': list(set(type(item).__name__ for item in data[:100])),
                'sample_keys': list(data[0].keys()) if data and isinstance(data[0], dict) else []
            }
        else:
            return {
                'type': type(data).__name__,
                'value_sample': str(data)[:100]
            }
    
    def _is_geojson(self, data):
        """Check if data is GeoJSON format"""
        return (isinstance(data, dict) and 
                data.get('type') == 'FeatureCollection' and 
                'features' in data)
    
    def _count_nested_levels(self, obj, level=0):
        """Count maximum nesting levels in JSON"""
        if isinstance(obj, dict):
            return max([self._count_nested_levels(v, level + 1) for v in obj.values()] + [level])
        elif isinstance(obj, list) and obj:
            return max([self._count_nested_levels(item, level + 1) for item in obj[:10]] + [level])
        else:
            return level
    
    def _get_json_sample(self, data, max_items=5):
        """Get sample of JSON data"""
        if isinstance(data, dict):
            return {k: v for k, v in list(data.items())[:max_items]}
        elif isinstance(data, list):
            return data[:max_items]
        else:
            return data
    
    def _get_geospatial_sample(self, gdf, max_features=5):
        """Get sample of geospatial features"""
        sample_gdf = gdf.head(max_features)
        features = []
        
        for _, row in sample_gdf.iterrows():
            feature = {
                'type': 'Feature',
                'geometry': row.geometry.__geo_interface__ if row.geometry else None,
                'properties': {k: v for k, v in row.items() if k != 'geometry'}
            }
            features.append(feature)
        
        return {
            'type': 'FeatureCollection',
            'features': features
        }
    
    def _save_processed_data(self, data, original_path, suffix):
        """Save processed data"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{Path(original_path).stem}_{suffix}_{timestamp}.json"
        output_path = current_app.config['PROCESSED_DIR'] / filename
        
        if isinstance(data, pd.DataFrame):
            data.to_json(output_path, orient='records', indent=2)
        else:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str)
        
        logger.info(f"Saved processed data to: {output_path}")
        return output_path
    
    def _save_processed_geodata(self, gdf, original_path):
        """Save processed geospatial data"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{Path(original_path).stem}_processed_{timestamp}.geojson"
        output_path = current_app.config['PROCESSED_DIR'] / filename
        
        gdf.to_file(output_path, driver='GeoJSON')
        logger.info(f"Saved processed geodata to: {output_path}")
        return output_path
    
    def _generate_tabular_report(self, df, stats, original_path):
        """Generate report for tabular data"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_filename = f"tabular_report_{timestamp}.json"
        report_path = current_app.config['REPORTS_DIR'] / report_filename
        
        report = {
            'generated_date': datetime.now().isoformat(),
            'original_file': str(original_path),
            'statistics': stats,
            'data_quality': {
                'completeness': ((len(df) * len(df.columns)) - df.isnull().sum().sum()) / (len(df) * len(df.columns)) * 100,
                'null_percentage': df.isnull().sum().sum() / (len(df) * len(df.columns)) * 100
            }
        }
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        
        return str(report_path)
    
    def _generate_json_report(self, data, structure_info, original_path):
        """Generate report for JSON data"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_filename = f"json_report_{timestamp}.json"
        report_path = current_app.config['REPORTS_DIR'] / report_filename
        
        report = {
            'generated_date': datetime.now().isoformat(),
            'original_file': str(original_path),
            'structure_analysis': structure_info,
            'size_info': {
                'estimated_size_mb': len(str(data)) / (1024 * 1024)
            }
        }
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        
        return str(report_path)
