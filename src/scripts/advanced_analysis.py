import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns
import os

def analyze_facility_distribution():
    data_dir = "parsed_data"
    facilities_file = os.path.join(data_dir, "facilities_cleaned.csv")
    
    if not os.path.exists(facilities_file):
        print("No cleaned facilities data found. Run clean_data.py first.")
        return
    
    df = pd.read_csv(facilities_file)
    
    # 1. Facility type distribution
    if 'type' in df.columns:
        plt.figure(figsize=(12, 8))
        type_counts = df['type'].value_counts()
        type_counts.plot(kind='pie', autopct='%1.1f%%')
        plt.title('Distribution of Facility Types')
        plt.ylabel('')
        plt.tight_layout()
        plt.savefig(os.path.join(data_dir, "type_distribution.png"))
        plt.close()
    
    # 2. Allocation analysis
    if 'money_allocated' in df.columns:
        # Allocation distribution
        plt.figure(figsize=(12, 8))
        allocation_data = df[df['money_allocated'] > 0]['money_allocated']
        plt.hist(allocation_data, bins=50, edgecolor='black')
        plt.title('Distribution of Allocation Amounts')
        plt.xlabel('Allocation Amount (KES)')
        plt.ylabel('Frequency')
        plt.yscale('log')  # Use log scale for better visualization
        plt.tight_layout()
        plt.savefig(os.path.join(data_dir, "allocation_distribution.png"))
        plt.close()
        
        # Top 10 facilities by allocation
        if len(df) > 0:
            top_allocations = df.nlargest(10, 'money_allocated')[['name', 'type', 'county', 'money_allocated']]
            top_allocations_file = os.path.join(data_dir, "top_allocations.csv")
            top_allocations.to_csv(top_allocations_file, index=False)
            print(f"Top allocations saved to {top_allocations_file}")
    
    # 3. Geographic clustering (if coordinates available)
    if 'latitude' in df.columns and 'longitude' in df.columns:
        geo_df = df.dropna(subset=['latitude', 'longitude'])
        
        if len(geo_df) > 10:  # Only cluster if we have enough points
            # Normalize coordinates
            coords = geo_df[['latitude', 'longitude']].values
            scaler = StandardScaler()
            coords_scaled = scaler.fit_transform(coords)
            
            # Perform clustering
            dbscan = DBSCAN(eps=0.3, min_samples=3)
            clusters = dbscan.fit_predict(coords_scaled)
            
            geo_df['cluster'] = clusters
            
            # Plot clusters
            plt.figure(figsize=(12, 8))
            scatter = plt.scatter(geo_df['longitude'], geo_df['latitude'], 
                                 c=geo_df['cluster'], cmap='viridis', alpha=0.6)
            plt.colorbar(scatter, label='Cluster ID')
            plt.title('Geographic Clusters of Healthcare Facilities')
            plt.xlabel('Longitude')
            plt.ylabel('Latitude')
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            plt.savefig(os.path.join(data_dir, "geographic_clusters.png"))
            plt.close()
            
            # Save clusters
            cluster_file = os.path.join(data_dir, "facilities_with_clusters.csv")
            geo_df.to_csv(cluster_file, index=False)
            print(f"Cluster data saved to {cluster_file}")
            
            # Analyze cluster characteristics
            if 'cluster' in geo_df.columns and 'money_allocated' in geo_df.columns:
                cluster_stats = geo_df.groupby('cluster').agg({
                    'money_allocated': ['count', 'sum', 'mean', 'median'],
                    'type': lambda x: x.mode().iloc[0] if not x.mode().empty else 'Unknown'
                }).round(2)
                
                cluster_stats.columns = ['facility_count', 'total_allocation', 'avg_allocation', 'median_allocation', 'most_common_type']
                cluster_stats_file = os.path.join(data_dir, "cluster_statistics.csv")
                cluster_stats.to_csv(cluster_stats_file)
                print(f"Cluster statistics saved to {cluster_stats_file}")
    
    # 4. Correlation analysis (if numerical data exists)
    numerical_cols = df.select_dtypes(include=[np.number]).columns
    if len(numerical_cols) > 1:
        plt.figure(figsize=(12, 10))
        corr_matrix = df[numerical_cols].corr()
        sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0, fmt='.2f')
        plt.title('Correlation Matrix of Numerical Variables')
        plt.tight_layout()
        plt.savefig(os.path.join(data_dir, "correlation_matrix.png"))
        plt.close()
    
    # 5. Time-based analysis (if allocation period available)
    if 'allocation_period' in df.columns and 'money_allocated' in df.columns:
        # Extract year from allocation period
        def extract_year(period):
            if pd.isna(period):
                return np.nan
            year_match = re.search(r'20\d{2}', str(period))
            return int(year_match.group()) if year_match else np.nan
        
        df['allocation_year'] = df['allocation_period'].apply(extract_year)
        
        if df['allocation_year'].notna().any():
            yearly_allocation = df.groupby('allocation_year')['money_allocated'].sum()
            
            plt.figure(figsize=(12, 8))
            yearly_allocation.plot(kind='bar')
            plt.title('Total Allocation by Year')
            plt.xlabel('Year')
            plt.ylabel('Total Allocation (KES)')
            plt.tight_layout()
            plt.savefig(os.path.join(data_dir, "allocation_by_year.png"))
            plt.close()
    
    # 6. Facility density by administrative regions
    admin_levels = ['county', 'constituency', 'ward']
    for level in admin_levels:
        if level in df.columns:
            plt.figure(figsize=(12, 8))
            level_counts = df[level].value_counts().head(20)  # Top 20 only
            level_counts.plot(kind='bar')
            plt.title(f'Facility Distribution by {level.title()}')
            plt.xlabel(level.title())
            plt.ylabel('Number of Facilities')
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            plt.savefig(os.path.join(data_dir, f"facilities_by_{level}.png"))
            plt.close()
            
            # Also show allocation by this administrative level if available
            if 'money_allocated' in df.columns:
                allocation_by_level = df.groupby(level)['money_allocated'].sum().sort_values(ascending=False).head(20)
                
                plt.figure(figsize=(12, 8))
                allocation_by_level.plot(kind='bar')
                plt.title(f'Allocation by {level.title()}')
                plt.xlabel(level.title())
                plt.ylabel('Total Allocation (KES)')
                plt.xticks(rotation=45, ha='right')
                plt.tight_layout()
                plt.savefig(os.path.join(data_dir, f"allocation_by_{level}.png"))
                plt.close()

if __name__ == "__main__":
    analyze_facility_distribution()