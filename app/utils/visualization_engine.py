import folium
from folium.plugins import MarkerCluster, HeatMap, FeatureGroupSubGroup
import json
import os
from flask import current_app

class VisualizationEngine:
    @staticmethod
    def create_interactive_map(geojson_data, facilities_data, output_path):
        """Create an interactive Folium map"""
        # Create a map centered on Kenya
        kenya_center = [-0.0236, 37.9062]
        m = folium.Map(location=kenya_center, zoom_start=6, tiles='OpenStreetMap')
        
        # Create feature groups for different administrative levels
        county_group = folium.FeatureGroup(name='County Boundaries', show=True)
        constituency_group = folium.FeatureGroup(name='Constituency Boundaries', show=False)
        ward_group = folium.FeatureGroup(name='Ward Boundaries', show=False)
        facilities_group = folium.FeatureGroup(name='Healthcare Facilities', show=True)
        
        # Create a marker cluster for facilities
        marker_cluster = MarkerCluster().add_to(facilities_group)
        
        # Color mapping for facility types
        type_colors = {
            'Hospital': 'red',
            'Health Center': 'blue',
            'Dispensary': 'green',
            'Clinic': 'purple',
            'Pharmacy': 'orange',
            'Laboratory': 'gray',
            'Other': 'black'
        }
        
        # Add facilities to the map
        for _, facility in facilities_data.iterrows():
            facility_type = facility.get('type', 'Other')
            color = type_colors.get(facility_type, 'black')
            
            popup_content = f"""
            <div style="width:250px;">
                <h4>{facility.get('name', 'Unknown')}</h4>
                <p><strong>Type:</strong> {facility_type}</p>
                <p><strong>County:</strong> {facility.get('county', 'N/A')}</p>
                <p><strong>Constituency:</strong> {facility.get('constituency', 'N/A')}</p>
                <p><strong>Ward:</strong> {facility.get('ward', 'N/A')}</p>
                <p><strong>Owner:</strong> {facility.get('owner', 'N/A')}</p>
            </div>
            """
            
            folium.Marker(
                [facility.geometry.y, facility.geometry.x],
                popup=folium.Popup(popup_content, max_width=300),
                tooltip=facility.get('name', 'Unknown'),
                icon=folium.Icon(color=color, icon='medkit', prefix='fa')
            ).add_to(marker_cluster)
        
        # Add administrative boundaries with styling based on facility count
        for _, admin_area in geojson_data.iterrows():
            props = admin_area.get('properties', {})
            facility_count = props.get("facility_count", 0)
            
            # Determine color based on facility count
            if facility_count > 0:
                fill_color = 'green' if facility_count > 10 else 'orange' if facility_count > 5 else 'red'
            else:
                fill_color = 'gray'
            
            # Create popup content
            admin_name = props.get('name', props.get('COUNTY', props.get('CONSTITUENCY', props.get('WARD', 'Unknown'))))
            admin_level = 'county' if 'COUNTY' in props else 'constituency' if 'CONSTITUENCY' in props else 'ward'
            
            popup_content = f"""
            <div style="width:250px;">
                <h4>{admin_name}</h4>
                <p><strong>Admin Level:</strong> {admin_level.title()}</p>
                <p><strong>Facility Count:</strong> {facility_count}</p>
            </div>
            """
            
            # Style function for administrative boundaries
            style_function = lambda x: {
                'fillColor': fill_color,
                'color': 'black',
                'weight': 2,
                'fillOpacity': 0.5
            }
            
            # Add to appropriate feature group
            geojson = folium.GeoJson(
                admin_area.__geo_interface__,
                style_function=style_function,
                popup=folium.Popup(popup_content, max_width=300)
            )
            
            if admin_level == 'county':
                geojson.add_to(county_group)
            elif admin_level == 'constituency':
                geojson.add_to(constituency_group)
            elif admin_level == 'ward':
                geojson.add_to(ward_group)
        
        # Add all feature groups to the map
        county_group.add_to(m)
        constituency_group.add_to(m)
        ward_group.add_to(m)
        facilities_group.add_to(m)
        
        # Add layer control
        folium.LayerControl().add_to(m)
        
        # Add legend
        legend_html = '''
        <div style="position: fixed; bottom: 50px; left: 50px; width: 180px; height: 220px; 
                    border:2px solid grey; z-index: 9999; font-size: 14px; background-color: white; padding: 10px;">
            <h4>Legend</h4>
            <p><i style="background: red; width: 15px; height: 15px; display: inline-block;"></i> Hospital</p>
            <p><i style="background: blue; width: 15px; height: 15px; display: inline-block;"></i> Health Center</p>
            <p><i style="background: green; width: 15px; height: 15px; display: inline-block;"></i> Dispensary</p>
            <p><i style="background: purple; width: 15px; height: 15px; display: inline-block;"></i> Clinic</p>
            <p><i style="background: orange; width: 15px; height: 15px; display: inline-block;"></i> Pharmacy</p>
            <p><i style="background: gray; width: 15px; height: 15px; display: inline-block;"></i> Laboratory</p>
            <p><i style="background: black; width: 15px; height: 15px; display: inline-block;"></i> Other</p>
        </div>
        '''
        m.get_root().html.add_child(folium.Element(legend_html))
        
        # Save map
        m.save(output_path)
        return output_path
    
    @staticmethod
    def create_heatmap(facilities_data, output_path):
        """Create a heatmap of facility density"""
        kenya_center = [-0.0236, 37.9062]
        m = folium.Map(location=kenya_center, zoom_start=6, tiles='OpenStreetMap')
        
        # Extract coordinates for heatmap
        heat_data = [[point.geometry.y, point.geometry.x] for _, point in facilities_data.iterrows()]
        
        # Add heatmap
        HeatMap(heat_data).add_to(m)
        
        # Save map
        m.save(output_path)
        return output_path