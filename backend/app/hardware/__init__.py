"""
HELIOS AI - Hardware Abstraction Layer
Provides pluggable interfaces for sensors and cameras.

Usage:
    from app.hardware import sensor_manager, camera_manager
    
    # Get sensor data (uses configured adapter)
    data = await sensor_manager.read_panel("A-001")
    
    # Capture thermal image
    image = await camera_manager.capture_thermal("A-001")
"""

from .sensor_interface import SensorInterface, SensorReading
from .camera_interface import CameraInterface, CameraImage
from .sensor_manager import sensor_manager
from .camera_manager import camera_manager

__all__ = [
    "SensorInterface",
    "SensorReading", 
    "CameraInterface",
    "CameraImage",
    "sensor_manager",
    "camera_manager"
]
