# Import key classes and functions for easier access
from .file_handler import FileHandler
from .data_processor import DataProcessor
from .geo_analyzer import GeoAnalyzer
from .visualization_engine import VisualizationEngine
from .report_generator import ReportGenerator

# Package metadata
__version__ = "1.0.0"
__author__ = "Kenya Healthcare Data Processing System"
__description__ = "Utilities for processing and analyzing healthcare facility data in Kenya"

# Define what gets imported with "from utils import *"
__all__ = [
    'FileHandler',
    'DataProcessor', 
    'GeoAnalyzer',
    'VisualizationEngine',
    'ReportGenerator'
]