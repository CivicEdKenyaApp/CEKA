import geopandas as gpd
import pandas as pd
from flask import current_app

class GeoAnalyzer:
    @staticmethod
    def calculate_summary_statistics(gdf, admin_levels=['county', 'subcounty', 'constituency', 'ward']):
        """Calculate summary statistics for administrative levels"""
        summaries = {}
        
        for level in admin_levels:
            if level in gdf.columns:
                level_counts = gdf[level].value_counts().reset_index()
                level_counts.columns = [level, 'facility_count']
                summaries[level] = level_counts.to_dict('records')
        
        return summaries
    
    @staticmethod
    def enhance_with_statistics(geojson_data, summaries):
        """Enhance GeoJSON with statistical information"""
        enhanced_features = []
        
        for feature in geojson_data.iterfeatures():
            props = feature.get("properties", {})
            
            # Add facility counts to administrative boundaries
            admin_name = props.get("name") or props.get("COUNTY") or props.get("CONSTITUENCY") or props.get("WARD")
            
            if admin_name:
                # Add county facility count
                if 'county' in summaries:
                    county_match = [item for item in summaries['county'] if item['county'] == admin_name]
                    if county_match:
                        props["facility_count"] = county_match[0]['facility_count']
                
                # Add constituency facility count
                if 'constituency' in summaries:
                    constituency_match = [item for item in summaries['constituency'] if item['constituency'] == admin_name]
                    if constituency_match:
                        props["constituency_facility_count"] = constituency_match[0]['facility_count']
                
                # Add ward facility count
                if 'ward' in summaries:
                    ward_match = [item for item in summaries['ward'] if item['ward'] == admin_name]
                    if ward_match:
                        props["ward_facility_count"] = ward_match[0]['facility_count']
            
            feature["properties"] = props
            enhanced_features.append(feature)
        
        return gpd.GeoDataFrame.from_features(enhanced_features, crs=geojson_data.crs)
    
    @staticmethod
    def perform_spatial_analysis(geojson_data, facility_data):
        """Perform various spatial analyses"""
        results = {}
        
        # Count facilities per administrative area
        if 'county' in geojson_data.columns:
            results['facilities_per_county'] = GeoAnalyzer.count_points_in_polygons(
                facility_data, geojson_data, 'county'
            )
        
        # Calculate density
        results['density_analysis'] = GeoAnalyzer.calculate_density(
            facility_data, geojson_data
        )
        
        # Nearest facility analysis
        results['nearest_facility'] = GeoAnalyzer.nearest_facility_analysis(
            facility_data
        )
        
        return results
    
    @staticmethod
    def count_points_in_polygons(points_gdf, polygons_gdf, admin_field):
        """Count points in each polygon"""
        joined = gpd.sjoin(points_gdf, polygons_gdf, how="inner", predicate="within")
        counts = joined[admin_field].value_counts().reset_index()
        counts.columns = [admin_field, 'count']
        return counts.to_dict('records')
    
    @staticmethod
    def calculate_density(points_gdf, polygons_gdf):
        """Calculate facility density per administrative area"""
        density_results = []
        
        for _, polygon in polygons_gdf.iterrows():
            # Count points in this polygon
            points_in_polygon = points_gdf[points_gdf.within(polygon.geometry)]
            count = len(points_in_polygon)
            
            # Calculate area in square kilometers
            area_km2 = polygon.geometry.area * 10**4
            
            # Calculate density
            density = count / area_km2 if area_km2 > 0 else 0
            
            density_results.append({
                'admin_name': polygon.get('name', 'Unknown'),
                'facility_count': count,
                'area_km2': area_km2,
                'density': density
            })
        
        return density_results
    
    @staticmethod
    def nearest_facility_analysis(facilities_gdf):
        """Analyze distances to nearest facilities"""
        # This is a simplified version - in production you might use more efficient methods
        results = []
        
        for _, facility in facilities_gdf.iterrows():
            # Calculate distance to all other facilities
            distances = facilities_gdf.distance(facility.geometry)
            # Remove self-distance
            distances = distances[distances > 0]
            
            if len(distances) > 0:
                min_distance = distances.min()
                results.append({
                    'facility_name': facility.get('name', 'Unknown'),
                    'nearest_facility_distance': min_distance
                })
        
        return results