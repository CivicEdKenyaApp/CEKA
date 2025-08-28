import pandas as pd
import folium
import os
from folium.plugins import MarkerCluster
import matplotlib.pyplot as plt
import seaborn as sns

def create_facility_map():
    data_dir = "parsed_data"
    facilities_file = os.path.join(data_dir, "facilities_cleaned.csv")
    
    if not os.path.exists(facilities_file):
        print("No cleaned facilities data found. Run clean_data.py first.")
        return
    
    df = pd.read_csv(facilities_file)
    
    # Check if we have coordinates
    if 'latitude' not in df.columns or 'longitude' not in df.columns:
        print("No coordinate data available for mapping.")
        return
    
    # Filter out records without coordinates
    geo_df = df.dropna(subset=['latitude', 'longitude'])
    
    if geo_df.empty:
        print("No records with valid coordinates.")
        return
    
    # Create a map
    kenya_center = [-0.0236, 37.9062]  # Approximate center of Kenya
    m = folium.Map(location=kenya_center, zoom_start=6)
    
    # Add markers with different colors based on facility type
    marker_cluster = MarkerCluster().add_to(m)
    
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
    
    for idx, row in geo_df.iterrows():
        facility_type = row.get('type', 'Other')
        color = type_colors.get(facility_type, 'black')
        
        popup_text = f"<b>{row.get('name', 'Unknown')}</b><br>"
        if 'type' in row and pd.notna(row['type']):
            popup_text += f"Type: {row['type']}<br>"
        if 'county' in row and pd.notna(row['county']):
            popup_text += f"County: {row['county']}<br>"
        if 'constituency' in row and pd.notna(row['constituency']):
            popup_text += f"Constituency: {row['constituency']}<br>"
        if 'money_allocated' in row and pd.notna(row['money_allocated']):
            popup_text += f"Allocation: KES {row['money_allocated']:,.2f}<br>"
        if 'allocation_period' in row and pd.notna(row['allocation_period']):
            popup_text += f"Period: {row['allocation_period']}<br>"
        
        folium.Marker(
            [row['latitude'], row['longitude']],
            popup=popup_text,
            tooltip=row.get('name', 'Unknown'),
            icon=folium.Icon(color=color, icon='medkit', prefix='fa')
        ).add_to(marker_cluster)
    
    # Add legend
    legend_html = '''
    <div style="position: fixed; 
                bottom: 50px; left: 50px; width: 150px; height: 180px; 
                border:2px solid grey; z-index:9999; font-size:14px;
                background-color:white;
                ">
    <b>Facility Types</b><br>
    '''
    for facility_type, color in type_colors.items():
        legend_html += f'<i style="background:{color}; width: 15px; height: 15px; display: inline-block;"></i> {facility_type}<br>'
    
    legend_html += '</div>'
    
    m.get_root().html.add_child(folium.Element(legend_html))
    
    # Save map
    map_file = os.path.join(data_dir, "facilities_map.html")
    m.save(map_file)
    print(f"Map saved to {map_file}")
    
    # Create distribution by county
    if 'county' in df.columns:
        county_counts = df['county'].value_counts()
        
        plt.figure(figsize=(12, 8))
        county_counts.plot(kind='bar')
        plt.title('Healthcare Facilities by County')
        plt.xlabel('County')
        plt.ylabel('Number of Facilities')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        
        chart_file = os.path.join(data_dir, "county_distribution.png")
        plt.savefig(chart_file)
        print(f"Chart saved to {chart_file}")
    
    # Create allocation by facility type
    if 'type' in df.columns and 'money_allocated' in df.columns:
        allocation_by_type = df.groupby('type')['money_allocated'].sum().sort_values(ascending=False)
        
        plt.figure(figsize=(12, 8))
        allocation_by_type.plot(kind='bar')
        plt.title('Total Allocation by Facility Type')
        plt.xlabel('Facility Type')
        plt.ylabel('Total Allocation (KES)')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        
        chart_file = os.path.join(data_dir, "allocation_by_type.png")
        plt.savefig(chart_file)
        print(f"Chart saved to {chart_file}")

if __name__ == "__main__":
    create_facility_map()