import pandas as pd
import json
from datetime import datetime
import os

def generate_report():
    data_dir = "parsed_data"
    facilities_file = os.path.join(data_dir, "facilities_cleaned.csv")
    
    if not os.path.exists(facilities_file):
        print("No cleaned facilities data found. Run clean_data.py first.")
        return
    
    df = pd.read_csv(facilities_file)
    
    report = {
        "generated_date": datetime.now().isoformat(),
        "total_facilities": len(df),
        "facilities_with_coordinates": df[['latitude', 'longitude']].notna().all(axis=1).sum(),
        "facilities_with_allocation_data": df['money_allocated'].notna().sum(),
        "total_allocation_amount": float(df['money_allocated'].sum()),
        "average_allocation": float(df['money_allocated'].mean()),
        "median_allocation": float(df['money_allocated'].median()),
        "by_type": {},
        "by_county": {},
        "by_constituency": {},
        "by_ward": {},
        "allocation_by_type": {},
        "allocation_by_county": {},
        "allocation_by_constituency": {},
        "allocation_by_period": {},
        "missing_data": {},
        "top_facilities_by_allocation": [],
        "administrative_coverage": {}
    }
    
    # Count by type
    if 'type' in df.columns:
        report['by_type'] = df['type'].value_counts().to_dict()
    
    # Count by county
    if 'county' in df.columns:
        report['by_county'] = df['county'].value_counts().to_dict()
    
    # Count by constituency
    if 'constituency' in df.columns:
        report['by_constituency'] = df['constituency'].value_counts().to_dict()
    
    # Count by ward
    if 'ward' in df.columns:
        report['by_ward'] = df['ward'].value_counts().to_dict()
    
    # Allocation by type
    if 'type' in df.columns and 'money_allocated' in df.columns:
        allocation_by_type = df.groupby('type')['money_allocated'].sum()
        report['allocation_by_type'] = allocation_by_type.to_dict()
    
    # Allocation by county
    if 'county' in df.columns and 'money_allocated' in df.columns:
        allocation_by_county = df.groupby('county')['money_allocated'].sum()
        report['allocation_by_county'] = allocation_by_county.to_dict()
    
    # Allocation by constituency
    if 'constituency' in df.columns and 'money_allocated' in df.columns:
        allocation_by_constituency = df.groupby('constituency')['money_allocated'].sum()
        report['allocation_by_constituency'] = allocation_by_constituency.to_dict()
    
    # Allocation by period
    if 'allocation_period' in df.columns and 'money_allocated' in df.columns:
        allocation_by_period = df.groupby('allocation_period')['money_allocated'].sum()
        report['allocation_by_period'] = allocation_by_period.to_dict()
    
    # Top facilities by allocation
    if 'money_allocated' in df.columns and 'name' in df.columns:
        top_facilities = df.nlargest(10, 'money_allocated')[['name', 'type', 'county', 'money_allocated']]
        report['top_facilities_by_allocation'] = top_facilities.to_dict('records')
    
    # Administrative coverage
    admin_levels = ['county', 'constituency', 'ward']
    for level in admin_levels:
        if level in df.columns:
            coverage = df[level].nunique()
            total_with_data = df[level].notna().sum()
            report['administrative_coverage'][level] = {
                'unique_values': coverage,
                'coverage_percentage': round(total_with_data / len(df) * 100, 1)
            }
    
    # Missing data analysis
    for col in df.columns:
        missing = df[col].isna().sum()
        report['missing_data'][col] = {
            'missing_count': missing,
            'missing_percentage': round(missing / len(df) * 100, 1) if len(df) > 0 else 0
        }
    
    # Save report
    report_file = os.path.join(data_dir, "analysis_report.json")
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    # Also create a text summary
    summary_file = os.path.join(data_dir, "summary_report.txt")
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write("HEALTHCARE FACILITIES ANALYSIS REPORT\n")
        f.write("=====================================\n\n")
        f.write(f"Report generated: {report['generated_date']}\n")
        f.write(f"Total facilities: {report['total_facilities']}\n")
        f.write(f"Facilities with coordinates: {report['facilities_with_coordinates']}\n")
        f.write(f"Facilities with allocation data: {report['facilities_with_allocation_data']}\n")
        f.write(f"Total allocation amount: KES {report['total_allocation_amount']:,.2f}\n")
        f.write(f"Average allocation: KES {report['average_allocation']:,.2f}\n")
        f.write(f"Median allocation: KES {report['median_allocation']:,.2f}\n\n")
        
        f.write("FACILITIES BY TYPE:\n")
        f.write("-------------------\n")
        for facility_type, count in report['by_type'].items():
            f.write(f"{facility_type}: {count}\n")
        
        f.write("\nFACILITIES BY COUNTY:\n")
        f.write("---------------------\n")
        for county, count in report['by_county'].items():
            f.write(f"{county}: {count}\n")
        
        f.write("\nALLOCATION BY TYPE:\n")
        f.write("-------------------\n")
        for facility_type, amount in report['allocation_by_type'].items():
            f.write(f"{facility_type}: KES {amount:,.2f}\n")
        
        f.write("\nALLOCATION BY COUNTY:\n")
        f.write("---------------------\n")
        for county, amount in report['allocation_by_county'].items():
            f.write(f"{county}: KES {amount:,.2f}\n")
        
        f.write("\nTOP 10 FACILITIES BY ALLOCATION:\n")
        f.write("--------------------------------\n")
        for i, facility in enumerate(report['top_facilities_by_allocation'], 1):
            f.write(f"{i}. {facility['name']} ({facility['type']}, {facility['county']}): KES {facility['money_allocated']:,.2f}\n")
        
        f.write("\nADMINISTRATIVE COVERAGE:\n")
        f.write("------------------------\n")
        for level, stats in report['administrative_coverage'].items():
            f.write(f"{level.title()}: {stats['unique_values']} unique values, {stats['coverage_percentage']}% coverage\n")
        
        f.write("\nMISSING DATA ANALYSIS:\n")
        f.write("----------------------\n")
        for col, stats in report['missing_data'].items():
            f.write(f"{col}: {stats['missing_count']} ({stats['missing_percentage']}%)\n")
    
    print(f"Report saved to {report_file} and {summary_file}")
    
    # Create a quick executive summary
    exec_summary_file = os.path.join(data_dir, "executive_summary.txt")
    with open(exec_summary_file, 'w', encoding='utf-8') as f:
        f.write("EXECUTIVE SUMMARY\n")
        f.write("================\n\n")
        f.write(f"Total healthcare facilities analyzed: {report['total_facilities']}\n")
        f.write(f"Total allocation amount: KES {report['total_allocation_amount']:,.2f}\n")
        f.write(f"Average allocation per facility: KES {report['average_allocation']:,.2f}\n\n")
        
        if report['by_type']:
            most_common_type = max(report['by_type'].items(), key=lambda x: x[1])
            f.write(f"Most common facility type: {most_common_type[0]} ({most_common_type[1]} facilities)\n")
        
        if report['by_county']:
            county_most_facilities = max(report['by_county'].items(), key=lambda x: x[1])
            f.write(f"County with most facilities: {county_most_facilities[0]} ({county_most_facilities[1]} facilities)\n")
        
        if report['allocation_by_county']:
            county_most_allocation = max(report['allocation_by_county'].items(), key=lambda x: x[1])
            f.write(f"County with highest allocation: {county_most_allocation[0]} (KES {county_most_allocation[1]:,.2f})\n")
        
        if report['top_facilities_by_allocation']:
            top_facility = report['top_facilities_by_allocation'][0]
            f.write(f"Facility with highest allocation: {top_facility['name']} (KES {top_facility['money_allocated']:,.2f})\n")
    
    print(f"Executive summary saved to {exec_summary_file}")

if __name__ == "__main__":
    generate_report()