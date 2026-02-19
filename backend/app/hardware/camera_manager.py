"""
HELIOS AI - Camera Manager
Factory pattern for camera adapter selection and management.

This is the main entry point for camera/imaging operations.
"""

import os
from typing import Optional, Dict, Any, List, Type
from enum import Enum
import asyncio

from .camera_interface import (
    CameraInterface,
    CameraImage,
    CameraStatus,
    CameraType,
    ThermalAnalyzer
)
from .mock_camera import MockCameraAdapter


class CameraMode(Enum):
    """Available camera adapter modes"""
    MOCK = "mock"       # Demo/development mode  
    FLIR = "flir"       # FLIR thermal cameras (future)
    IP = "ip"           # Generic IP cameras (future)
    AUTO = "auto"       # Auto-detect


class CameraManager:
    """
    Factory and manager for camera adapters.
    
    Handles:
    - Adapter selection based on environment/config
    - Connection lifecycle management
    - Unified interface for all camera operations
    
    Usage:
        from app.hardware import camera_manager
        
        await camera_manager.initialize()
        image = await camera_manager.capture_thermal("A-0101")
        
        # Analyze thermal data
        hotspots = camera_manager.find_hotspots(image.temperature_data)
    """
    
    # Adapter registry
    ADAPTERS: Dict[CameraMode, Type[CameraInterface]] = {
        CameraMode.MOCK: MockCameraAdapter,
        # Future adapters:
        # CameraMode.FLIR: FLIRCameraAdapter,
        # CameraMode.IP: IPCameraAdapter,
    }
    
    def __init__(
        self,
        mode: CameraMode = CameraMode.AUTO,
        config: Dict[str, Any] = None
    ):
        """
        Initialize camera manager.
        
        Args:
            mode: Camera mode (MOCK, FLIR, IP, or AUTO)
            config: Adapter-specific configuration
        """
        self._mode = mode
        self._config = config or {}
        self._adapter: Optional[CameraInterface] = None
        self._initialized = False
    
    @property
    def mode(self) -> CameraMode:
        """Current camera mode"""
        return self._mode
    
    @property
    def is_initialized(self) -> bool:
        """Check if manager is initialized"""
        return self._initialized and self._adapter is not None
    
    @property
    def adapter(self) -> Optional[CameraInterface]:
        """Get current adapter instance"""
        return self._adapter
    
    def _detect_mode(self) -> CameraMode:
        """Auto-detect appropriate camera mode"""
        env_mode = os.environ.get("HELIOS_CAMERA_MODE", "").lower()
        
        if env_mode == "flir":
            return CameraMode.FLIR
        elif env_mode == "ip":
            return CameraMode.IP
        elif env_mode == "mock":
            return CameraMode.MOCK
        
        # Check for FLIR SDK
        # if os.path.exists("/opt/flir/sdk"):
        #     return CameraMode.FLIR
        
        # Default to mock
        return CameraMode.MOCK
    
    async def initialize(self, force_mode: CameraMode = None) -> bool:
        """
        Initialize camera manager and connect adapter.
        
        Args:
            force_mode: Override configured mode
            
        Returns:
            True if initialization successful
        """
        if force_mode:
            self._mode = force_mode
        elif self._mode == CameraMode.AUTO:
            self._mode = self._detect_mode()
        
        adapter_class = self.ADAPTERS.get(self._mode)
        if not adapter_class:
            # Fallback to mock if adapter not available
            print(f"Camera adapter {self._mode.value} not available, using mock")
            adapter_class = MockCameraAdapter
            self._mode = CameraMode.MOCK
        
        config = self._build_config()
        self._adapter = adapter_class(config)
        success = await self._adapter.connect()
        
        if success:
            self._initialized = True
            print(f"CameraManager initialized in {self._mode.value} mode")
        else:
            print(f"CameraManager failed to initialize: {self._adapter.last_error}")
        
        return success
    
    def _build_config(self) -> Dict[str, Any]:
        """Build adapter configuration"""
        config = dict(self._config)
        
        if self._mode == CameraMode.MOCK:
            # Get fault panels from environment or use defaults
            fault_panels = os.environ.get("MOCK_FAULT_PANELS", "").split(",")
            fault_panels = [p.strip() for p in fault_panels if p.strip()]
            config.setdefault("fault_panels", fault_panels)
        
        return config
    
    async def shutdown(self) -> None:
        """Shutdown manager and disconnect adapter"""
        if self._adapter:
            await self._adapter.disconnect()
        self._adapter = None
        self._initialized = False
    
    async def switch_mode(self, new_mode: CameraMode) -> bool:
        """Switch to different camera mode at runtime"""
        if new_mode == self._mode and self._initialized:
            return True
        
        await self.shutdown()
        return await self.initialize(force_mode=new_mode)
    
    # === Delegated Camera Operations ===
    
    async def capture_thermal(
        self,
        panel_id: Optional[str] = None
    ) -> Optional[CameraImage]:
        """Capture thermal image"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.capture_thermal(panel_id)
    
    async def capture_visual(
        self,
        panel_id: Optional[str] = None
    ) -> Optional[CameraImage]:
        """Capture visual image"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.capture_visual(panel_id)
    
    async def capture_el(
        self,
        panel_id: Optional[str] = None
    ) -> Optional[CameraImage]:
        """Capture EL image"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.capture_el(panel_id)
    
    async def capture_multi(
        self,
        camera_types: List[CameraType],
        panel_id: Optional[str] = None
    ) -> Dict[CameraType, Optional[CameraImage]]:
        """Capture multiple image types"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.capture_multi(camera_types, panel_id)
    
    async def get_status(self) -> CameraStatus:
        """Get camera status"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.get_status()
    
    async def list_cameras(self) -> List[CameraStatus]:
        """List all available cameras"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.list_cameras()
    
    # === Analysis Utilities ===
    
    def find_hotspots(
        self,
        temp_data: List[List[float]],
        threshold_delta: float = 10.0
    ) -> List[Dict[str, Any]]:
        """Find hotspots in thermal data"""
        return ThermalAnalyzer.find_hotspots(temp_data, threshold_delta)
    
    def calculate_uniformity(
        self,
        temp_data: List[List[float]]
    ) -> float:
        """Calculate temperature uniformity"""
        return ThermalAnalyzer.calculate_uniformity(temp_data)
    
    # === Mock-specific Control ===
    
    def set_fault_panels(self, panel_ids: List[str]) -> None:
        """Set fault panels (mock mode only)"""
        if isinstance(self._adapter, MockCameraAdapter):
            self._adapter.set_fault_panels(panel_ids)
    
    def add_fault_panel(self, panel_id: str) -> None:
        """Add fault panel (mock mode only)"""
        if isinstance(self._adapter, MockCameraAdapter):
            self._adapter.add_fault_panel(panel_id)


# === Global Singleton ===

camera_manager = CameraManager(mode=CameraMode.AUTO)


# === Convenience Functions ===

async def capture_thermal_image(
    panel_id: Optional[str] = None
) -> Optional[CameraImage]:
    """Convenience function to capture thermal image"""
    return await camera_manager.capture_thermal(panel_id)


async def capture_panel_images(
    panel_id: str
) -> Dict[CameraType, Optional[CameraImage]]:
    """Capture all image types for a panel"""
    return await camera_manager.capture_multi(
        [CameraType.THERMAL, CameraType.VISUAL],
        panel_id
    )


async def init_cameras(mode: str = "auto") -> bool:
    """
    Initialize camera system.
    
    Args:
        mode: "mock", "flir", "ip", or "auto"
        
    Returns:
        True if successful
    """
    mode_map = {
        "mock": CameraMode.MOCK,
        "flir": CameraMode.FLIR,
        "ip": CameraMode.IP,
        "auto": CameraMode.AUTO
    }
    return await camera_manager.initialize(
        force_mode=mode_map.get(mode.lower(), CameraMode.AUTO)
    )
