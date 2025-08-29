import pandas as pd
import geopandas as gpd
import numpy as np
from flask import current_app
from .file_handler import FileHandler

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
                
            except Exception as e:
                current_app.logger.error(f"Error processing file {file.filename}: {str(e)}")
                results['failed'].append({'file': file.filename, 'error': str(e)})
        
        return results
    
    @staticmethod
    def merge_geospatial_data(geojson_data, facility_data):
        """Merge Kenya GeoJSON with healthcare facility data"""
        try:
            # Convert facility data to GeoDataFrame if it's not already
            if not isinstance(facility_data, gpd.GeoDataFrame):
                geometry = gpd.points_from_xy(facility_data.longitude, facility_data.latitude)
                facility_gdf = gpd.GeoDataFrame(
                    facility_data, 
                    geometry=geometry,
                    crs="EPSG:4326"
                )
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
                combined_features = combined_features.append(
                    gpd.GeoDataFrame.from_features([feature], crs=geojson_data.crs),
                    ignore_index=True
                )
            
            return combined_features
            
        except Exception as e:
            current_app.logger.error(f"Error merging geospatial data: {str(e)}")
            raise