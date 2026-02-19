"""
HELIOS AI - Camera Interface
Abstract base class for camera/imaging adapters.

Supports:
- Thermal cameras (FLIR, InfiRay, etc.)
- Visual cameras (inspection drones, fixed cameras)
- EL imaging systems
- Mock cameras (demo mode)
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any, List, Union
from enum import Enum
import base64


class CameraType(Enum):
    """Types of cameras supported"""
    THERMAL = "thermal"
    VISUAL = "visual"
    EL = "electroluminescence"
    MULTISPECTRAL = "multispectral"


class ImageFormat(Enum):
    """Image format types"""
    JPEG = "jpeg"
    PNG = "png"
    TIFF = "tiff"
    RAW = "raw"
    RADIOMETRIC = "radiometric"  # Thermal with temperature data


@dataclass
class CameraImage:
    """
    Captured image data structure.
    
    For thermal images, temperature_data contains the raw thermal values.
    For visual/EL images, it contains the image bytes.
    """
    panel_id: Optional[str]
    camera_type: CameraType
    timestamp: datetime = field(default_factory=datetime.utcnow)
    image_data: bytes = b""  # Image file bytes
    image_format: ImageFormat = ImageFormat.JPEG
    width: int = 0
    height: int = 0
    
    # Thermal-specific data
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None
    avg_temp: Optional[float] = None
    temperature_data: Optional[List[List[float]]] = None  # 2D temp array
    
    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_base64(self) -> str:
        """Convert image data to base64 string"""
        return base64.b64encode(self.image_data).decode("utf-8")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary (without raw image data)"""
        return {
            "panel_id": self.panel_id,
            "camera_type": self.camera_type.value,
            "timestamp": self.timestamp.isoformat(),
            "image_format": self.image_format.value,
            "width": self.width,
            "height": self.height,
            "min_temp": self.min_temp,
            "max_temp": self.max_temp,
            "avg_temp": self.avg_temp,
            "has_temperature_data": self.temperature_data is not None,
            "metadata": self.metadata
        }


@dataclass
class CameraStatus:
    """Camera health and configuration status"""
    camera_id: str
    camera_type: CameraType
    is_online: bool
    firmware_version: Optional[str] = None
    last_capture: Optional[datetime] = None
    error_message: Optional[str] = None
    config: Dict[str, Any] = field(default_factory=dict)


class CameraInterface(ABC):
    """
    Abstract base class for camera adapters.
    
    Implement this interface to add new camera sources:
    - MockCameraAdapter: Simulated images for demos
    - FLIRAdapter: FLIR thermal cameras
    - DroneAdapter: DJI/inspection drone cameras
    - IPCameraAdapter: Generic IP cameras
    
    Example:
        class MyCameraAdapter(CameraInterface):
            async def connect(self) -> bool:
                # Connect to camera
                return True
            
            async def capture_thermal(self, panel_id: str) -> CameraImage:
                # Capture thermal image
                pass
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize camera adapter.
        
        Args:
            config: Adapter-specific configuration
        """
        self.config = config or {}
        self._connected = False
        self._last_error: Optional[str] = None
        self._camera_id = config.get("camera_id", "default") if config else "default"
    
    @property
    def is_connected(self) -> bool:
        """Check if adapter is connected"""
        return self._connected
    
    @property
    def last_error(self) -> Optional[str]:
        """Get last error message"""
        return self._last_error
    
    @abstractmethod
    async def connect(self) -> bool:
        """
        Connect to camera(s).
        
        Returns:
            True if connection successful
        """
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Disconnect from camera(s)."""
        pass
    
    @abstractmethod
    async def capture_thermal(
        self, 
        panel_id: Optional[str] = None
    ) -> Optional[CameraImage]:
        """
        Capture thermal image.
        
        Args:
            panel_id: Optional panel identifier for targeting
            
        Returns:
            CameraImage with thermal data, or None if unavailable
        """
        pass
    
    @abstractmethod
    async def capture_visual(
        self, 
        panel_id: Optional[str] = None
    ) -> Optional[CameraImage]:
        """
        Capture visual (RGB) image.
        
        Args:
            panel_id: Optional panel identifier for targeting
            
        Returns:
            CameraImage with visual data
        """
        pass
    
    @abstractmethod
    async def capture_el(
        self, 
        panel_id: Optional[str] = None
    ) -> Optional[CameraImage]:
        """
        Capture electroluminescence image.
        
        Note: EL imaging requires special equipment and
        controlled conditions (darkness, reverse bias).
        
        Args:
            panel_id: Optional panel identifier
            
        Returns:
            CameraImage with EL data
        """
        pass
    
    @abstractmethod
    async def get_status(self) -> CameraStatus:
        """
        Get camera status and configuration.
        
        Returns:
            CameraStatus with current state
        """
        pass
    
    @abstractmethod
    async def list_cameras(self) -> List[CameraStatus]:
        """
        List all available cameras.
        
        Returns:
            List of CameraStatus for each camera
        """
        pass
    
    async def capture_multi(
        self,
        camera_types: List[CameraType],
        panel_id: Optional[str] = None
    ) -> Dict[CameraType, Optional[CameraImage]]:
        """
        Capture multiple image types.
        Default implementation captures sequentially.
        
        Args:
            camera_types: List of camera types to capture
            panel_id: Optional panel identifier
            
        Returns:
            Dictionary mapping camera types to captured images
        """
        results = {}
        
        capture_methods = {
            CameraType.THERMAL: self.capture_thermal,
            CameraType.VISUAL: self.capture_visual,
            CameraType.EL: self.capture_el,
        }
        
        for cam_type in camera_types:
            method = capture_methods.get(cam_type)
            if method:
                try:
                    results[cam_type] = await method(panel_id)
                except Exception as e:
                    self._last_error = str(e)
                    results[cam_type] = None
        
        return results
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(id={self._camera_id}, connected={self._connected})"


# === Thermal Image Utilities ===

class ThermalAnalyzer:
    """
    Utilities for analyzing thermal image data.
    Used to detect hotspots and anomalies.
    """
    
    @staticmethod
    def find_hotspots(
        temp_data: List[List[float]],
        threshold_delta: float = 10.0
    ) -> List[Dict[str, Any]]:
        """
        Find hotspots in thermal data.
        
        Args:
            temp_data: 2D array of temperature values
            threshold_delta: Temperature difference to flag as hotspot
            
        Returns:
            List of hotspot locations and info
        """
        if not temp_data or not temp_data[0]:
            return []
        
        hotspots = []
        height = len(temp_data)
        width = len(temp_data[0])
        
        # Calculate average temperature
        all_temps = [t for row in temp_data for t in row]
        avg_temp = sum(all_temps) / len(all_temps)
        
        # Find cells significantly above average
        for y in range(height):
            for x in range(width):
                temp = temp_data[y][x]
                if temp - avg_temp > threshold_delta:
                    hotspots.append({
                        "x": x,
                        "y": y,
                        "temperature": temp,
                        "delta": temp - avg_temp,
                        "severity": "high" if temp - avg_temp > threshold_delta * 1.5 else "medium"
                    })
        
        return hotspots
    
    @staticmethod
    def calculate_uniformity(temp_data: List[List[float]]) -> float:
        """
        Calculate temperature uniformity (0-1).
        Higher values indicate more uniform temperature distribution.
        """
        if not temp_data or not temp_data[0]:
            return 0.0
        
        all_temps = [t for row in temp_data for t in row]
        avg_temp = sum(all_temps) / len(all_temps)
        
        if avg_temp == 0:
            return 1.0
        
        variance = sum((t - avg_temp) ** 2 for t in all_temps) / len(all_temps)
        std_dev = variance ** 0.5
        
        # Normalize: lower std_dev = higher uniformity
        # At 0°C std_dev = 1.0, at 10°C std_dev = ~0.5
        uniformity = max(0, 1 - (std_dev / 20))
        
        return round(uniformity, 3)
