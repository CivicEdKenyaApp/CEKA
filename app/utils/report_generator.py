import json
import pandas as pd
from datetime import datetime
import os
from flask import current_app

class ReportGenerator:
    @staticmethod
    def generate_comprehensive_report(geojson_data, facilities_data, spatial_analysis, output_dir):
        """Generate comprehensive analysis report"""
        report = {
            "generated_date": datetime.now().isoformat(),
            "total_facilities": len(facilities_data),
            "facilities_with_coordinates": facilities_data.geometry.notna().sum(),
            "by_type": {},
            "by_county": {},
            "by_constituency": {},
            "by_ward": {},
            "by_owner": {},
            "administrative_coverage": {},
            "spatial_analysis": spatial_analysis,
            "geojson_stats": {
                "total_features": len(geojson_data),
                "administrative_features": len(geojson_data[geojson_data.geometry.type.isin(['Polygon', 'MultiPolygon'])]),
                "facility_features": len(geojson_data[geojson_data.geometry.type == 'Point'])
            }
        }
        
        # Count by type
        if 'type' in facilities_data.columns:
            type_counts = facilities_data['type'].value_counts().to_dict()
            report['by_type'] = {str(k): int(v) for k, v in type_counts.items()}
        
        # Count by county
        if 'county' in facilities_data.columns:
            county_counts = facilities_data['county'].value_counts().to_dict()
            report['by_county'] = {str(k): int(v) for k, v in county_counts.items()}
        
        # Count by constituency
        if 'constituency' in facilities_data.columns:
            constituency_counts = facilities_data['constituency'].value_counts().to_dict()
            report['by_constituency'] = {str(k): int(v) for k, v in constituency_counts.items()}
        
        # Count by ward
        if 'ward' in facilities_data.columns:
            ward_counts = facilities_data['ward'].value_counts().to_dict()
            report['by_ward'] = {str(k): int(v) for k, v in ward_counts.items()}
        
        # Count by owner
        if 'owner' in facilities_data.columns:
            owner_counts = facilities_data['owner'].value_counts().to_dict()
            report['by_owner'] = {str(k): int(v) for k, v in owner_counts.items()}
        
        # Administrative coverage
        admin_levels = ['county', 'subcounty', 'constituency', 'ward']
        for level in admin_levels:
            if level in facilities_data.columns:
                coverage = facilities_data[level].nunique()
                total_with_data = facilities_data[level].notna().sum()
                report['administrative_coverage'][level] = {
                    'unique_values': int(coverage),
                    'coverage_percentage': round(total_with_data / len(facilities_data) * 100, 1) if len(facilities_data) > 0 else 0
                }
        
        # Save JSON report
        json_report_path = os.path.join(output_dir, "comprehensive_analysis_report.json")
        with open(json_report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Create text summary
        text_report_path = os.path.join(output_dir, "comprehensive_summary_report.txt")
        with open(text_report_path, 'w', encoding='utf-8') as f:
            f.write("KENYA HEALTHCARE FACILITIES COMPREHENSIVE ANALYSIS REPORT\n")
            f.write("=========================================================\n\n")
            f.write(f"Report generated: {report['generated_date']}\n")
            f.write(f"Total facilities: {report['total_facilities']}\n")
            f.write(f"Facilities with coordinates: {report['facilities_with_coordinates']}\n")
            f.write(f"GeoJSON features: {report['geojson_stats']['total_features']} "
                   f"({report['geojson_stats']['administrative_features']} administrative, "
                   f"{report['geojson_stats']['facility_features']} facilities)\n\n")
            
            f.write("FACILITIES BY TYPE:\n")
            f.write("-------------------\n")
            for facility_type, count in report['by_type'].items():
                f.write(f"{facility_type}: {count}\n")
            
            f.write("\nFACILITIES BY COUNTY:\n")
            f.write("---------------------\n")
            for county, count in report['by_county'].items():
                f.write(f"{county}: {count}\n")
            
            f.write("\nFACILITIES BY CONSTITUENCY:\n")
            f.write("---------------------------\n")
            for constituency, count in report['by_constituency'].items():
                f.write(f"{constituency}: {count}\n")
            
            f.write("\nFACILITIES BY OWNER:\n")
            f.write("---------------------\n")
            for owner, count in report['by_owner'].items():
                f.write(f"{owner}: {count}\n")
            
            f.write("\nADMINISTRATIVE COVERAGE:\n")
            f.write("------------------------\n")
            for level, stats in report['administrative_coverage'].items():
                f.write(f"{level.title()}: {stats['unique_values']} unique values, {stats['coverage_percentage']}% coverage\n")
        
        return json_report_path, text_report_path