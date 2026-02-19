"""
HELIOS AI - Sensor Interface
Abstract base class for all sensor adapters.

Supports:
- Mock data (demo/development)
- MQTT IoT sensors (production)
- Modbus industrial sensors (future)
- REST API sensors (cloud)
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
import asyncio


class SensorType(Enum):
    """Types of sensors supported by HELIOS"""
    TEMPERATURE = "temperature"
    IRRADIANCE = "irradiance"
    VOLTAGE = "voltage"
    CURRENT = "current"
    POWER = "power"
    HUMIDITY = "humidity"
    DUST = "dust"
    WIND_SPEED = "wind_speed"


class SensorStatus(Enum):
    """Sensor health status"""
    ONLINE = "online"
    OFFLINE = "offline"
    DEGRADED = "degraded"
    ERROR = "error"
    CALIBRATING = "calibrating"


@dataclass
class SensorReading:
    """Standard sensor reading data structure"""
    panel_id: str
    sensor_type: SensorType
    value: float
    unit: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    quality: float = 1.0  # 0.0 to 1.0, data quality indicator
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "panel_id": self.panel_id,
            "sensor_type": self.sensor_type.value,
            "value": self.value,
            "unit": self.unit,
            "timestamp": self.timestamp.isoformat(),
            "quality": self.quality,
            "metadata": self.metadata
        }


@dataclass
class PanelSensorData:
    """Complete sensor data for a single panel"""
    panel_id: str
    timestamp: datetime
    temperature: Optional[float] = None  # Celsius
    irradiance: Optional[float] = None   # W/m²
    voltage: Optional[float] = None      # Volts
    current: Optional[float] = None      # Amps
    power: Optional[float] = None        # Watts
    efficiency: Optional[float] = None   # Percentage
    dust_level: Optional[float] = None   # 0-100 percentage
    humidity: Optional[float] = None     # Percentage
    status: str = "nominal"
    alerts: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "panel_id": self.panel_id,
            "timestamp": self.timestamp.isoformat(),
            "temperature": self.temperature,
            "irradiance": self.irradiance,
            "voltage": self.voltage,
            "current": self.current,
            "power": self.power,
            "efficiency": self.efficiency,
            "dust_level": self.dust_level,
            "humidity": self.humidity,
            "status": self.status,
            "alerts": self.alerts
        }


class SensorInterface(ABC):
    """
    Abstract base class for sensor adapters.
    
    Implement this interface to add new sensor sources:
    - MockSensorAdapter: Simulated data for demos
    - MQTTSensorAdapter: Real IoT sensors via MQTT
    - ModbusSensorAdapter: Industrial Modbus sensors
    - RESTSensorAdapter: Cloud-based sensor APIs
    
    Example:
        class MySensorAdapter(SensorInterface):
            async def connect(self) -> bool:
                # Connect to sensor source
                return True
            
            async def read_sensor(self, panel_id: str, sensor_type: SensorType) -> SensorReading:
                # Read single sensor value
                pass
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the sensor adapter.
        
        Args:
            config: Adapter-specific configuration dictionary
        """
        self.config = config or {}
        self._connected = False
        self._last_error: Optional[str] = None
    
    @property
    def is_connected(self) -> bool:
        """Check if adapter is connected to sensor source"""
        return self._connected
    
    @property
    def last_error(self) -> Optional[str]:
        """Get last error message"""
        return self._last_error
    
    @abstractmethod
    async def connect(self) -> bool:
        """
        Connect to the sensor source.
        
        Returns:
            True if connection successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Disconnect from the sensor source."""
        pass
    
    @abstractmethod
    async def read_sensor(
        self, 
        panel_id: str, 
        sensor_type: SensorType
    ) -> Optional[SensorReading]:
        """
        Read a single sensor value.
        
        Args:
            panel_id: The panel identifier
            sensor_type: Type of sensor to read
            
        Returns:
            SensorReading if successful, None if unavailable
        """
        pass
    
    @abstractmethod
    async def read_panel(self, panel_id: str) -> Optional[PanelSensorData]:
        """
        Read all sensors for a specific panel.
        
        Args:
            panel_id: The panel identifier
            
        Returns:
            PanelSensorData with all available readings
        """
        pass
    
    @abstractmethod
    async def read_all_panels(self) -> List[PanelSensorData]:
        """
        Read sensor data for all registered panels.
        
        Returns:
            List of PanelSensorData for all panels
        """
        pass
    
    @abstractmethod
    async def get_panel_ids(self) -> List[str]:
        """
        Get list of all panel IDs known to this adapter.
        
        Returns:
            List of panel ID strings
        """
        pass
    
    @abstractmethod
    async def check_health(self) -> Dict[str, SensorStatus]:
        """
        Check health status of all sensors.
        
        Returns:
            Dictionary mapping sensor/panel IDs to their status
        """
        pass
    
    async def read_batch(
        self, 
        panel_ids: List[str]
    ) -> Dict[str, PanelSensorData]:
        """
        Read sensor data for multiple panels.
        Default implementation calls read_panel for each.
        Override for optimized batch reading.
        
        Args:
            panel_ids: List of panel identifiers
            
        Returns:
            Dictionary mapping panel IDs to their data
        """
        results = {}
        tasks = [self.read_panel(pid) for pid in panel_ids]
        readings = await asyncio.gather(*tasks, return_exceptions=True)
        
        for pid, reading in zip(panel_ids, readings):
            if isinstance(reading, Exception):
                self._last_error = str(reading)
                results[pid] = None
            else:
                results[pid] = reading
        
        return results
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(connected={self._connected})"


class SensorCalibration:
    """
    Sensor calibration data and utilities.
    Used to adjust raw sensor readings for accuracy.
    """
    
    def __init__(
        self,
        offset: float = 0.0,
        scale: float = 1.0,
        min_value: Optional[float] = None,
        max_value: Optional[float] = None
    ):
        self.offset = offset
        self.scale = scale
        self.min_value = min_value
        self.max_value = max_value
    
    def apply(self, raw_value: float) -> float:
        """Apply calibration to raw sensor value"""
        calibrated = (raw_value * self.scale) + self.offset
        
        if self.min_value is not None:
            calibrated = max(calibrated, self.min_value)
        if self.max_value is not None:
            calibrated = min(calibrated, self.max_value)
        
        return calibrated
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SensorCalibration":
        """Create calibration from dictionary"""
        return cls(
            offset=data.get("offset", 0.0),
            scale=data.get("scale", 1.0),
            min_value=data.get("min_value"),
            max_value=data.get("max_value")
        )


# Type hints for adapter factory
AdapterType = type[SensorInterface]
