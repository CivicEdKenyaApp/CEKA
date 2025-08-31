import pandas as pd
import numpy as np
import re
import os
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import time
import requests
from io import StringIO

def download_csv(url):
    """Download CSV from URL"""
    response = requests.get(url)
    response.raise_for_status()
    return StringIO(response.text)

def clean_facility_data(csv_url=None):
    """Clean facility data from a URL or local file"""
    # Load data
    data_dir = "parsed_data"
    
    if csv_url:
        print(f"Downloading data from {csv_url}")
        df = pd.read_csv(download_csv(csv_url))
    else:
        facilities_file = os.path.join(data_dir, "facilities.csv")
        if not os.path.exists(facilities_file):
            print("No facilities data found. Run parse_data.py first.")
            return
        df = pd.read_csv(facilities_file)
    
    # Clean text fields
    text_columns = df.select_dtypes(include=['object']).columns
    for col in text_columns:
        df[col] = df[col].astype(str).str.strip().replace('nan', np.nan).replace('None', np.nan)
    
    # Standardize facility types
    if 'type' in df.columns:
        type_mapping = {
            'hosp': 'Hospital', 'disp': 'Dispensary', 
            'health centre': 'Health Center', 'health center': 'Health Center',
            'clinic': 'Clinic', 'medical': 'Medical Center', 
            'pharmacy': 'Pharmacy', 'laboratory': 'Laboratory',
            'maternity': 'Maternity', 'nursing': 'Nursing Home',
        }
        df['type'] = df['type'].str.lower().replace(type_mapping).str.title()
    
    # Clean and standardize money allocation
    if 'money_allocated' in df.columns:
        def clean_money_value(value):
            if pd.isna(value):
                return np.nan
            # Remove currency symbols and commas
            value = re.sub(r'[^\d.]', '', str(value))
            try:
                return float(value)
            except:
                return np.nan
        
        df['money_allocated'] = df['money_allocated'].apply(clean_money_value)
    
    # Extract coordinates from various formats
    coord_columns = ['coordinates', 'latitude', 'longitude']
    for col in coord_columns:
        if col in df.columns:
            # Clean coordinate values
            df[col] = df[col].astype(str).str.replace('[^\d\.\-]', '', regex=True)
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # If we have coordinates column but not separate lat/lon, try to split
    if 'coordinates' in df.columns and ('latitude' not in df.columns or 'longitude' not in df.columns):
        def split_coords(coord_str):
            if pd.isna(coord_str):
                return np.nan, np.nan
            # Handle various coordinate formats
            if isinstance(coord_str, str):
                # Try to split by comma
                parts = coord_str.split(',')
                if len(parts) == 2:
                    try:
                        return float(parts[0].strip()), float(parts[1].strip())
                    except:
                        pass
            return np.nan, np.nan
        
        coords = df['coordinates'].apply(split_coords)
        df['latitude'] = coords.apply(lambda x: x[0])
        df['longitude'] = coords.apply(lambda x: x[1])
    
    # Standardize county names
    if 'county' in df.columns:
        df['county'] = df['county'].str.title().replace({
            'Nairobi': 'Nairobi County',
            'Mombasa': 'Mombasa County',
            'Kisumu': 'Kisumu County',
            'Nakuru': 'Nakuru County',
        })
    
    # Standardize allocation period
    if 'allocation_period' in df.columns:
        def clean_allocation_period(period):
            if pd.isna(period):
                return np.nan
            # Extract year from various formats
            year_match = re.search(r'20\d{2}', str(period))
            if year_match:
                return f"FY{year_match.group()}"
            
            # Handle other formats
            period = str(period).lower()
            if 'q1' in period or 'quarter1' in period:
                return "Q1"
            elif 'q2' in period or 'quarter2' in period:
                return "Q2"
            elif 'q3' in period or 'quarter3' in period:
                return "Q3"
            elif 'q4' in period or 'quarter4' in period:
                return "Q4"
            elif 'annual' in period or 'year' in period:
                return "Annual"
            
            return period.title()
        
        df['allocation_period'] = df['allocation_period'].apply(clean_allocation_period)
    
    # Save cleaned data
    os.makedirs(data_dir, exist_ok=True)
    cleaned_file = os.path.join(data_dir, "facilities_cleaned.csv")
    df.to_csv(cleaned_file, index=False, encoding='utf-8')
    
    print(f"Cleaned data saved to {cleaned_file}")
    print(f"Data shape: {df.shape}")
    print("\nMissing values per column:")
    print(df.isnull().sum())
    
    return df

if __name__ == "__main__":
    # Example usage with URL:
    # clean_facility_data("https://example.com/facilities.csv")
    
    # Or with local file:
    clean_facility_data()
