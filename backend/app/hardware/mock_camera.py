"""
HELIOS AI - Mock Camera Adapter
Provides simulated camera images for demos and development.

Generates:
- Synthetic thermal images with realistic hotspots
- Placeholder visual images
- Simulated EL images
"""

import random
import math
from datetime import datetime
from typing import Optional, Dict, Any, List
import asyncio

from .camera_interface import (
    CameraInterface,
    CameraImage,
    CameraStatus,
    CameraType,
    ImageFormat,
    ThermalAnalyzer
)


class MockCameraAdapter(CameraInterface):
    """
    Generates simulated camera images for demonstration.
    
    Features:
    - Realistic thermal gradients with hotspot simulation
    - Panel fault visualization
    - Configurable image resolution
    - Integration with mock sensor faults
    
    Usage:
        adapter = MockCameraAdapter({
            "thermal_resolution": (320, 240),
            "visual_resolution": (1920, 1080),
            "fault_panels": ["A-0102", "A-0304"]  # Panels with simulated faults
        })
        await adapter.connect()
        image = await adapter.capture_thermal("A-0102")
    """
    
    DEFAULT_CONFIG = {
        "thermal_resolution": (320, 240),
        "visual_resolution": (1920, 1080),
        "el_resolution": (640, 480),
        "ambient_temp": 30.0,
        "panel_base_temp": 45.0,
        "fault_panels": [],  # List of panel IDs with faults
        "hotspot_probability": 0.1,
    }
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.config = {**self.DEFAULT_CONFIG, **(config or {})}
        self._cameras = {}
    
    async def connect(self) -> bool:
        """Initialize mock camera system"""
        try:
            # Register available cameras
            self._cameras = {
                "thermal-1": {
                    "type": CameraType.THERMAL,
                    "resolution": self.config["thermal_resolution"],
                    "online": True
                },
                "visual-1": {
                    "type": CameraType.VISUAL,
                    "resolution": self.config["visual_resolution"],
                    "online": True
                },
                "el-1": {
                    "type": CameraType.EL,
                    "resolution": self.config["el_resolution"],
                    "online": True
                }
            }
            
            self._connected = True
            return True
            
        except Exception as e:
            self._last_error = str(e)
            return False
    
    async def disconnect(self) -> None:
        """Disconnect mock cameras"""
        self._cameras.clear()
        self._connected = False
    
    def _generate_thermal_data(
        self,
        panel_id: Optional[str],
        width: int,
        height: int
    ) -> List[List[float]]:
        """Generate realistic thermal temperature data"""
        base_temp = self.config["panel_base_temp"]
        ambient = self.config["ambient_temp"]
        
        # Create base thermal gradient (cooler edges, warmer center)
        data = []
        center_x, center_y = width // 2, height // 2
        max_dist = math.sqrt(center_x**2 + center_y**2)
        
        for y in range(height):
            row = []
            for x in range(width):
                # Distance from center
                dist = math.sqrt((x - center_x)**2 + (y - center_y)**2)
                dist_factor = 1 - (dist / max_dist) * 0.3
                
                # Base temperature with gradient
                temp = base_temp * dist_factor
                
                # Add noise
                temp += random.uniform(-1, 1)
                
                row.append(round(temp, 1))
            data.append(row)
        
        # Check if this panel should have a fault/hotspot
        has_fault = panel_id in self.config.get("fault_panels", [])
        has_random_hotspot = random.random() < self.config["hotspot_probability"]
        
        if has_fault or has_random_hotspot:
            # Add hotspot
            hotspot_x = random.randint(width // 4, 3 * width // 4)
            hotspot_y = random.randint(height // 4, 3 * height // 4)
            hotspot_radius = random.randint(10, 30)
            hotspot_intensity = random.uniform(10, 25)  # Degrees above base
            
            for y in range(max(0, hotspot_y - hotspot_radius), 
                          min(height, hotspot_y + hotspot_radius)):
                for x in range(max(0, hotspot_x - hotspot_radius),
                              min(width, hotspot_x + hotspot_radius)):
                    dist = math.sqrt((x - hotspot_x)**2 + (y - hotspot_y)**2)
                    if dist < hotspot_radius:
                        # Gaussian-like falloff
                        falloff = 1 - (dist / hotspot_radius)
                        data[y][x] += hotspot_intensity * falloff
        
        return data
    
    def _generate_mock_image_bytes(
        self,
        width: int,
        height: int,
        image_type: str
    ) -> bytes:
        """
        Generate placeholder image bytes.
        
        In production, this would be actual image data.
        For demo, we return a minimal valid JPEG/PNG.
        """
        # Return minimal 1x1 JPEG as placeholder
        # In real implementation, generate actual thermal visualization
        minimal_jpeg = bytes([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
            0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
            0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
            0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
            0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
            0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
            0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
            0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
            0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
            0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
            0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34,
            0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
            0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4,
            0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
            0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
            0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF,
            0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
            0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04,
            0x00, 0x00, 0x01, 0x7D, 0x01, 0x02, 0x03, 0x00,
            0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
            0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32,
            0x81, 0x91, 0xA1, 0x08, 0x23, 0x42, 0xB1, 0xC1,
            0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
            0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A,
            0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x34, 0x35,
            0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00,
            0x3F, 0x00, 0xFB, 0xD5, 0xFF, 0xD9
        ])
        
        return minimal_jpeg
    
    async def capture_thermal(
        self,
        panel_id: Optional[str] = None
    ) -> Optional[CameraImage]:
        """Capture simulated thermal image"""
        if not self._connected:
            return None
        
        width, height = self.config["thermal_resolution"]
        
        # Generate thermal data
        temp_data = self._generate_thermal_data(panel_id, width, height)
        
        # Calculate statistics
        all_temps = [t for row in temp_data for t in row]
        min_temp = min(all_temps)
        max_temp = max(all_temps)
        avg_temp = sum(all_temps) / len(all_temps)
        
        # Simulate capture delay
        await asyncio.sleep(0.1)
        
        return CameraImage(
            panel_id=panel_id,
            camera_type=CameraType.THERMAL,
            timestamp=datetime.utcnow(),
            image_data=self._generate_mock_image_bytes(width, height, "thermal"),
            image_format=ImageFormat.JPEG,
            width=width,
            height=height,
            min_temp=round(min_temp, 1),
            max_temp=round(max_temp, 1),
            avg_temp=round(avg_temp, 1),
            temperature_data=temp_data,
            metadata={
                "source": "mock",
                "camera_id": "thermal-1",
                "emissivity": 0.95,
                "ambient_temp": self.config["ambient_temp"],
                "uniformity": ThermalAnalyzer.calculate_uniformity(temp_data),
                "hotspots": ThermalAnalyzer.find_hotspots(temp_data)
            }
        )
    
    async def capture_visual(
        self,
        panel_id: Optional[str] = None
    ) -> Optional[CameraImage]:
        """Capture simulated visual image"""
        if not self._connected:
            return None
        
        width, height = self.config["visual_resolution"]
        
        await asyncio.sleep(0.05)
        
        return CameraImage(
            panel_id=panel_id,
            camera_type=CameraType.VISUAL,
            timestamp=datetime.utcnow(),
            image_data=self._generate_mock_image_bytes(width, height, "visual"),
            image_format=ImageFormat.JPEG,
            width=width,
            height=height,
            metadata={
                "source": "mock",
                "camera_id": "visual-1",
                "exposure": "auto",
                "iso": 100
            }
        )
    
    async def capture_el(
        self,
        panel_id: Optional[str] = None
    ) -> Optional[CameraImage]:
        """Capture simulated EL image"""
        if not self._connected:
            return None
        
        width, height = self.config["el_resolution"]
        
        await asyncio.sleep(0.2)  # EL capture is slower
        
        # Check for faults to simulate in EL
        has_fault = panel_id in self.config.get("fault_panels", [])
        
        return CameraImage(
            panel_id=panel_id,
            camera_type=CameraType.EL,
            timestamp=datetime.utcnow(),
            image_data=self._generate_mock_image_bytes(width, height, "el"),
            image_format=ImageFormat.PNG,
            width=width,
            height=height,
            metadata={
                "source": "mock",
                "camera_id": "el-1",
                "exposure_time": 5000,  # ms
                "has_defects": has_fault,
                "defect_types": ["crack", "inactive_cell"] if has_fault else []
            }
        )
    
    async def get_status(self) -> CameraStatus:
        """Get primary camera status"""
        return CameraStatus(
            camera_id="thermal-1",
            camera_type=CameraType.THERMAL,
            is_online=self._connected,
            firmware_version="MOCK-1.0.0",
            last_capture=datetime.utcnow(),
            config=self.config
        )
    
    async def list_cameras(self) -> List[CameraStatus]:
        """List all mock cameras"""
        if not self._connected:
            return []
        
        cameras = []
        for cam_id, cam_info in self._cameras.items():
            cameras.append(CameraStatus(
                camera_id=cam_id,
                camera_type=cam_info["type"],
                is_online=cam_info["online"],
                firmware_version="MOCK-1.0.0",
                config={"resolution": cam_info["resolution"]}
            ))
        
        return cameras
    
    # === Demo Control Methods ===
    
    def set_fault_panels(self, panel_ids: List[str]) -> None:
        """Set which panels should show faults"""
        self.config["fault_panels"] = panel_ids
    
    def add_fault_panel(self, panel_id: str) -> None:
        """Add a panel to fault list"""
        if panel_id not in self.config["fault_panels"]:
            self.config["fault_panels"].append(panel_id)
    
    def remove_fault_panel(self, panel_id: str) -> None:
        """Remove a panel from fault list"""
        if panel_id in self.config["fault_panels"]:
            self.config["fault_panels"].remove(panel_id)
    
    def set_ambient_temp(self, temp: float) -> None:
        """Set ambient temperature for simulation"""
        self.config["ambient_temp"] = temp
