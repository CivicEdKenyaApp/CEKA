
import pandas as pd
import geopandas as gpd
import numpy as np
from flask import current_app
from .file_handler import FileHandler
import logging
import traceback

logger = logging.getLogger(__name__)

class DataProcessor:
    @staticmethod
    def process_uploaded_files(files):
        results = {
            'success': [],
            'failed': [],
            'processed_data': {}
        }
        
        for file in files:
            try:
                logger.info(f"Processing file: {file.filename}")
                
                file_path, filename = FileHandler.save_uploaded_file(file)
                if not file_path:
                    results['failed'].append({'file': file.filename, 'error': 'Invalid file type'})
                    continue
                
                file_type = FileHandler.detect_file_type(file_path)
                if file_type == 'unknown':
                    results['failed'].append({'file': file.filename, 'error': 'Unknown file type'})
                    continue
                
                data = FileHandler.read_file(file_path, file_type)
                data = FileHandler.fix_common_issues(data, file_type)
                
                # Store processed data
                results['processed_data'][filename] = {
                    'data': data,
                    'type': file_type,
                    'original_name': file.filename
                }
                results['success'].append(file.filename)
                
                logger.info(f"Successfully processed file: {file.filename}")
                
            except Exception as e:
                error_msg = f"Error processing file {file.filename}: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                results['failed'].append({'file': file.filename, 'error': str(e)})
        
        return results
    
    @staticmethod
    def merge_geospatial_data(geojson_data, facility_data):
        """Merge Kenya GeoJSON with healthcare facility data"""
        try:
            logger.info("Starting geospatial data merge")
            
            # Convert facility data to GeoDataFrame if it's not already
            if not isinstance(facility_data, gpd.GeoDataFrame):
                if hasattr(facility_data, 'longitude') and hasattr(facility_data, 'latitude'):
                    geometry = gpd.points_from_xy(facility_data.longitude, facility_data.latitude)
                    facility_gdf = gpd.GeoDataFrame(
                        facility_data, 
                        geometry=geometry,
                        crs="EPSG:4326"
                    )
                else:
                    logger.warning("Facility data does not have longitude/latitude columns")
                    return geojson_data
            else:
                facility_gdf = facility_data
            
            # Ensure both have the same CRS
            if geojson_data.crs != facility_gdf.crs:
                facility_gdf = facility_gdf.to_crs(geojson_data.crs)
            
            # Perform spatial join to add administrative information to facilities
            facilities_with_admin = gpd.sjoin(
                facility_gdf, 
                geojson_data, 
                how="left", 
                predicate="within"
            )
            
            # Create combined GeoJSON
            combined_features = geojson_data.copy()
            
            # Add facility points
            for _, facility in facilities_with_admin.iterrows():
                feature = {
                    "type": "Feature",
                    "geometry": facility.geometry.__geo_interface__,
                    "properties": {
                        "name": facility.get('name', 'Unknown'),
                        "type": facility.get('type', 'Unknown'),
                        "county": facility.get('county', 'Unknown'),
                        "subcounty": facility.get('subcounty', 'Unknown'),
                        "constituency": facility.get('constituency', 'Unknown'),
                        "ward": facility.get('ward', 'Unknown'),
                        "owner": facility.get('owner', 'Unknown'),
                        "feature_type": "healthcare_facility"
                    }
                }
                
                # Use pd.concat instead of deprecated append
                new_gdf = gpd.GeoDataFrame.from_features([feature], crs=geojson_data.crs)
                combined_features = pd.concat([combined_features, new_gdf], ignore_index=True)
            
            logger.info("Geospatial data merge completed successfully")
            return combined_features
            
        except Exception as e:
            error_msg = f"Error merging geospatial data: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise

    @staticmethod
    def analyze_data_quality(data, data_type):
        """Analyze data quality and return metrics"""
        try:
            quality_metrics = {
                'completeness': 0,
                'consistency': 0,
                'accuracy': 0,
                'overall_score': 0,
                'issues': []
            }
            
            if data_type == 'csv' and hasattr(data, 'isnull'):
                # Calculate completeness for CSV data
                total_cells = data.size
                missing_cells = data.isnull().sum().sum()
                quality_metrics['completeness'] = ((total_cells - missing_cells) / total_cells) * 100
                
                # Check for consistency issues
                inconsistencies = 0
                for column in data.select_dtypes(include=['object']).columns:
                    unique_values = data[column].nunique()
                    if unique_values > len(data) * 0.8:  # Too many unique values
                        inconsistencies += 1
                        quality_metrics['issues'].append(f"High cardinality in column: {column}")
                
                quality_metrics['consistency'] = max(0, 100 - (inconsistencies * 10))
                quality_metrics['accuracy'] = 90  # Placeholder - would need domain-specific rules
                
            elif data_type in ['geojson', 'kml'] and hasattr(data, 'geometry'):
                # Analyze geospatial data quality
                invalid_geometries = (~data.geometry.is_valid).sum()
                total_features = len(data)
                
                quality_metrics['completeness'] = ((total_features - invalid_geometries) / total_features) * 100
                quality_metrics['consistency'] = 95  # Assuming spatial data is generally consistent
                quality_metrics['accuracy'] = 85   # Placeholder
                
                if invalid_geometries > 0:
                    quality_metrics['issues'].append(f"{invalid_geometries} invalid geometries found")
            
            # Calculate overall score
            quality_metrics['overall_score'] = (
                quality_metrics['completeness'] * 0.4 +
                quality_metrics['consistency'] * 0.3 +
                quality_metrics['accuracy'] * 0.3
            )
            
            return quality_metrics
            
        except Exception as e:
            logger.error(f"Error analyzing data quality: {str(e)}")
            return {
                'completeness': 0,
                'consistency': 0,
                'accuracy': 0,
                'overall_score': 0,
                'issues': [f"Error during analysis: {str(e)}"]
            }

    @staticmethod
    def generate_summary_statistics(data, data_type):
        """Generate summary statistics for the data"""
        try:
            summary = {
                'total_records': 0,
                'data_type': data_type,
                'columns': [],
                'numeric_summary': {},
                'categorical_summary': {}
            }
            
            if data_type == 'csv' and hasattr(data, 'shape'):
                summary['total_records'] = len(data)
                summary['columns'] = list(data.columns) if hasattr(data, 'columns') else []
                
                # Numeric columns summary
                numeric_cols = data.select_dtypes(include=[np.number]).columns
                for col in numeric_cols:
                    summary['numeric_summary'][col] = {
                        'mean': float(data[col].mean()),
                        'median': float(data[col].median()),
                        'std': float(data[col].std()),
                        'min': float(data[col].min()),
                        'max': float(data[col].max()),
                        'null_count': int(data[col].isnull().sum())
                    }
                
                # Categorical columns summary
                categorical_cols = data.select_dtypes(include=['object']).columns
                for col in categorical_cols:
                    value_counts = data[col].value_counts().head(10)
                    summary['categorical_summary'][col] = {
                        'unique_values': int(data[col].nunique()),
                        'null_count': int(data[col].isnull().sum()),
                        'top_values': dict(value_counts)
                    }
                    
            elif data_type in ['geojson', 'kml'] and hasattr(data, '__len__'):
                summary['total_records'] = len(data)
                if hasattr(data, 'columns'):
                    summary['columns'] = list(data.columns)
                
                # Calculate spatial bounds if possible
                try:
                    bounds = data.total_bounds
                    summary['spatial_bounds'] = {
                        'minx': float(bounds[0]),
                        'miny': float(bounds[1]),
                        'maxx': float(bounds[2]),
                        'maxy': float(bounds[3])
                    }
                except:
                    summary['spatial_bounds'] = None
                    
            return summary
            
        except Exception as e:
            logger.error(f"Error generating summary statistics: {str(e)}")
            return {
                'total_records': 0,
                'data_type': data_type,
                'columns': [],
                'error': str(e)
            }
