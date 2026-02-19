"""
HELIOS AI - Sensor Manager
Factory pattern for sensor adapter selection and management.

This is the main entry point for sensor operations.
Automatically selects appropriate adapter based on configuration.
"""

import os
from typing import Optional, Dict, Any, List, Type
from enum import Enum
import asyncio

from .sensor_interface import (
    SensorInterface,
    SensorReading,
    PanelSensorData,
    SensorType,
    SensorStatus
)
from .mock_adapter import MockSensorAdapter
from .mqtt_adapter import MQTTSensorAdapter


class AdapterMode(Enum):
    """Available sensor adapter modes"""
    MOCK = "mock"           # Demo/development mode
    MQTT = "mqtt"           # Real sensors via MQTT
    AUTO = "auto"           # Auto-detect based on environment


class SensorManager:
    """
    Factory and manager for sensor adapters.
    
    Handles:
    - Adapter selection based on environment/config
    - Connection lifecycle management
    - Adapter switching at runtime
    - Unified interface for all sensor operations
    
    Usage:
        # Using global singleton
        from app.hardware import sensor_manager
        
        await sensor_manager.initialize()
        data = await sensor_manager.read_all_panels()
        
        # Or create custom instance
        manager = SensorManager(mode=AdapterMode.MQTT, config={...})
        await manager.initialize()
    """
    
    # Adapter registry
    ADAPTERS: Dict[AdapterMode, Type[SensorInterface]] = {
        AdapterMode.MOCK: MockSensorAdapter,
        AdapterMode.MQTT: MQTTSensorAdapter,
    }
    
    def __init__(
        self,
        mode: AdapterMode = AdapterMode.AUTO,
        config: Dict[str, Any] = None
    ):
        """
        Initialize sensor manager.
        
        Args:
            mode: Adapter mode (MOCK, MQTT, or AUTO)
            config: Adapter-specific configuration
        """
        self._mode = mode
        self._config = config or {}
        self._adapter: Optional[SensorInterface] = None
        self._initialized = False
    
    @property
    def mode(self) -> AdapterMode:
        """Current adapter mode"""
        return self._mode
    
    @property
    def is_initialized(self) -> bool:
        """Check if manager is initialized"""
        return self._initialized and self._adapter is not None
    
    @property
    def adapter(self) -> Optional[SensorInterface]:
        """Get current adapter instance"""
        return self._adapter
    
    def _detect_mode(self) -> AdapterMode:
        """
        Auto-detect appropriate adapter mode based on environment.
        
        Checks:
        1. HELIOS_SENSOR_MODE environment variable
        2. MQTT_BROKER_HOST for MQTT availability
        3. Falls back to MOCK for development
        """
        # Check explicit mode setting
        env_mode = os.environ.get("HELIOS_SENSOR_MODE", "").lower()
        if env_mode == "mqtt":
            return AdapterMode.MQTT
        elif env_mode == "mock":
            return AdapterMode.MOCK
        
        # Check for MQTT configuration
        mqtt_host = os.environ.get("MQTT_BROKER_HOST")
        if mqtt_host:
            return AdapterMode.MQTT
        
        # Default to mock for development
        return AdapterMode.MOCK
    
    async def initialize(self, force_mode: AdapterMode = None) -> bool:
        """
        Initialize the sensor manager and connect adapter.
        
        Args:
            force_mode: Override configured mode
            
        Returns:
            True if initialization successful
        """
        # Determine mode
        if force_mode:
            self._mode = force_mode
        elif self._mode == AdapterMode.AUTO:
            self._mode = self._detect_mode()
        
        # Get adapter class
        adapter_class = self.ADAPTERS.get(self._mode)
        if not adapter_class:
            raise ValueError(f"Unknown adapter mode: {self._mode}")
        
        # Build configuration
        config = self._build_config()
        
        # Create and connect adapter
        self._adapter = adapter_class(config)
        success = await self._adapter.connect()
        
        if success:
            self._initialized = True
            print(f"SensorManager initialized in {self._mode.value} mode")
        else:
            print(f"SensorManager failed to initialize: {self._adapter.last_error}")
        
        return success
    
    def _build_config(self) -> Dict[str, Any]:
        """Build adapter configuration from environment and provided config"""
        config = dict(self._config)
        
        if self._mode == AdapterMode.MQTT:
            # MQTT configuration from environment
            config.setdefault("broker_host", os.environ.get("MQTT_BROKER_HOST", "localhost"))
            config.setdefault("broker_port", int(os.environ.get("MQTT_BROKER_PORT", "1883")))
            config.setdefault("username", os.environ.get("MQTT_USERNAME"))
            config.setdefault("password", os.environ.get("MQTT_PASSWORD"))
            config.setdefault("use_tls", os.environ.get("MQTT_USE_TLS", "").lower() == "true")
            config.setdefault("topic_prefix", os.environ.get("MQTT_TOPIC_PREFIX", "helios/sensors"))
        
        elif self._mode == AdapterMode.MOCK:
            # Mock configuration
            config.setdefault("panel_count", int(os.environ.get("MOCK_PANEL_COUNT", "24")))
            config.setdefault("fault_probability", float(os.environ.get("MOCK_FAULT_PROB", "0.05")))
        
        return config
    
    async def shutdown(self) -> None:
        """Shutdown manager and disconnect adapter"""
        if self._adapter:
            await self._adapter.disconnect()
        self._adapter = None
        self._initialized = False
    
    async def switch_mode(self, new_mode: AdapterMode) -> bool:
        """
        Switch to a different adapter mode at runtime.
        
        Args:
            new_mode: New adapter mode
            
        Returns:
            True if switch successful
        """
        if new_mode == self._mode and self._initialized:
            return True
        
        # Disconnect current adapter
        await self.shutdown()
        
        # Initialize with new mode
        return await self.initialize(force_mode=new_mode)
    
    # === Delegated Sensor Operations ===
    
    async def read_sensor(
        self,
        panel_id: str,
        sensor_type: SensorType
    ) -> Optional[SensorReading]:
        """Read a single sensor value"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.read_sensor(panel_id, sensor_type)
    
    async def read_panel(self, panel_id: str) -> Optional[PanelSensorData]:
        """Read all sensors for a panel"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.read_panel(panel_id)
    
    async def read_all_panels(self) -> List[PanelSensorData]:
        """Read sensor data for all panels"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.read_all_panels()
    
    async def read_batch(
        self,
        panel_ids: List[str]
    ) -> Dict[str, PanelSensorData]:
        """Read sensor data for multiple panels"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.read_batch(panel_ids)
    
    async def get_panel_ids(self) -> List[str]:
        """Get list of all panel IDs"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.get_panel_ids()
    
    async def check_health(self) -> Dict[str, SensorStatus]:
        """Check health status of all sensors"""
        if not self._adapter:
            await self.initialize()
        return await self._adapter.check_health()
    
    # === Mock-specific Control (for demos) ===
    
    def inject_fault(
        self,
        panel_id: str,
        fault_type: str,
        severity: float = 0.7
    ) -> bool:
        """Inject a fault (mock mode only)"""
        if isinstance(self._adapter, MockSensorAdapter):
            return self._adapter.inject_fault(panel_id, fault_type, severity)
        return False
    
    def clear_fault(self, panel_id: str) -> bool:
        """Clear a fault (mock mode only)"""
        if isinstance(self._adapter, MockSensorAdapter):
            return self._adapter.clear_fault(panel_id)
        return False
    
    def set_weather(self, **kwargs) -> None:
        """Set weather conditions (mock mode only)"""
        if isinstance(self._adapter, MockSensorAdapter):
            self._adapter.set_weather(**kwargs)
    
    def get_all_faults(self) -> Dict[str, Dict[str, Any]]:
        """Get all active faults (mock mode only)"""
        if isinstance(self._adapter, MockSensorAdapter):
            return self._adapter.get_all_faults()
        return {}


# === Global Singleton ===

# Default sensor manager instance
# Can be reconfigured before first use
sensor_manager = SensorManager(mode=AdapterMode.AUTO)


# === Convenience Functions ===

async def get_sensor_data(panel_id: str) -> Optional[PanelSensorData]:
    """Convenience function to get sensor data for a panel"""
    return await sensor_manager.read_panel(panel_id)


async def get_all_sensor_data() -> List[PanelSensorData]:
    """Convenience function to get all sensor data"""
    return await sensor_manager.read_all_panels()


async def init_sensors(mode: str = "auto") -> bool:
    """
    Initialize sensor system.
    
    Args:
        mode: "mock", "mqtt", or "auto"
        
    Returns:
        True if successful
    """
    mode_map = {
        "mock": AdapterMode.MOCK,
        "mqtt": AdapterMode.MQTT,
        "auto": AdapterMode.AUTO
    }
    return await sensor_manager.initialize(
        force_mode=mode_map.get(mode.lower(), AdapterMode.AUTO)
    )
