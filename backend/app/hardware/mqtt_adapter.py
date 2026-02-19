"""
HELIOS AI - MQTT Sensor Adapter
Connects to real IoT sensors via MQTT protocol.

Supports:
- Standard MQTT brokers (Mosquitto, HiveMQ, etc.)
- AWS IoT Core
- Azure IoT Hub
- Custom IoT gateways

This adapter is a STUB for future hardware integration.
When real sensors are available, implement the connection logic.
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from dataclasses import dataclass

from .sensor_interface import (
    SensorInterface,
    SensorReading,
    PanelSensorData,
    SensorType,
    SensorStatus
)


@dataclass
class MQTTConfig:
    """MQTT connection configuration"""
    broker_host: str = "localhost"
    broker_port: int = 1883
    username: Optional[str] = None
    password: Optional[str] = None
    use_tls: bool = False
    ca_cert: Optional[str] = None
    client_cert: Optional[str] = None
    client_key: Optional[str] = None
    topic_prefix: str = "helios/sensors"
    qos: int = 1
    keepalive: int = 60
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MQTTConfig":
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


class MQTTSensorAdapter(SensorInterface):
    """
    Connects to real IoT sensors via MQTT messaging.
    
    Topic Structure:
    - helios/sensors/{panel_id}/temperature
    - helios/sensors/{panel_id}/irradiance
    - helios/sensors/{panel_id}/voltage
    - helios/sensors/{panel_id}/current
    - helios/sensors/{panel_id}/status
    
    Message Format (JSON):
    {
        "value": 45.2,
        "unit": "°C",
        "timestamp": "2025-01-15T10:30:00Z",
        "quality": 0.98
    }
    
    Usage:
        adapter = MQTTSensorAdapter({
            "broker_host": "mqtt.example.com",
            "broker_port": 8883,
            "use_tls": True,
            "username": "helios",
            "password": "secret"
        })
        await adapter.connect()
        data = await adapter.read_all_panels()
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize MQTT adapter"""
        super().__init__(config)
        
        self.mqtt_config = MQTTConfig.from_dict(config or {})
        self._client = None  # Will be aiomqtt client
        self._sensor_cache: Dict[str, Dict[str, SensorReading]] = {}
        self._panel_registry: Dict[str, Dict[str, Any]] = {}
        self._last_update: Dict[str, datetime] = {}
        self._cache_timeout = timedelta(seconds=30)
    
    async def connect(self) -> bool:
        """
        Connect to MQTT broker.
        
        NOTE: This is a stub implementation.
        For production, install aiomqtt: pip install aiomqtt
        
        Example implementation:
        ```python
        import aiomqtt
        
        self._client = aiomqtt.Client(
            hostname=self.mqtt_config.broker_host,
            port=self.mqtt_config.broker_port,
            username=self.mqtt_config.username,
            password=self.mqtt_config.password,
        )
        await self._client.__aenter__()
        await self._subscribe_all()
        self._connected = True
        return True
        ```
        """
        try:
            # Check if aiomqtt is available
            try:
                import aiomqtt
                
                # Create client configuration
                client_params = {
                    "hostname": self.mqtt_config.broker_host,
                    "port": self.mqtt_config.broker_port,
                    "keepalive": self.mqtt_config.keepalive,
                }
                
                if self.mqtt_config.username:
                    client_params["username"] = self.mqtt_config.username
                    client_params["password"] = self.mqtt_config.password
                
                # TLS configuration
                if self.mqtt_config.use_tls:
                    import ssl
                    ssl_context = ssl.create_default_context()
                    if self.mqtt_config.ca_cert:
                        ssl_context.load_verify_locations(self.mqtt_config.ca_cert)
                    if self.mqtt_config.client_cert:
                        ssl_context.load_cert_chain(
                            self.mqtt_config.client_cert,
                            self.mqtt_config.client_key
                        )
                    client_params["tls_context"] = ssl_context
                
                self._client = aiomqtt.Client(**client_params)
                await self._client.__aenter__()
                
                # Subscribe to sensor topics
                await self._subscribe_all()
                
                # Start message listener
                asyncio.create_task(self._message_listener())
                
                self._connected = True
                return True
                
            except ImportError:
                # aiomqtt not installed - return stub mode
                self._last_error = "aiomqtt not installed. Install with: pip install aiomqtt"
                print(f"MQTT Adapter: {self._last_error}")
                print("Running in stub mode - no real sensor data")
                
                # Still mark as "connected" for development
                self._connected = True
                return True
                
        except Exception as e:
            self._last_error = f"MQTT connection failed: {str(e)}"
            self._connected = False
            return False
    
    async def disconnect(self) -> None:
        """Disconnect from MQTT broker"""
        if self._client:
            try:
                await self._client.__aexit__(None, None, None)
            except Exception:
                pass
        self._client = None
        self._connected = False
        self._sensor_cache.clear()
    
    async def _subscribe_all(self) -> None:
        """Subscribe to all sensor topics"""
        if not self._client:
            return
        
        topic = f"{self.mqtt_config.topic_prefix}/#"
        await self._client.subscribe(topic, qos=self.mqtt_config.qos)
    
    async def _message_listener(self) -> None:
        """Background task to listen for MQTT messages"""
        if not self._client:
            return
        
        try:
            async for message in self._client.messages:
                await self._process_message(message)
        except Exception as e:
            self._last_error = f"Message listener error: {str(e)}"
    
    async def _process_message(self, message: Any) -> None:
        """Process incoming MQTT message"""
        try:
            topic = str(message.topic)
            payload = json.loads(message.payload.decode())
            
            # Parse topic: helios/sensors/{panel_id}/{sensor_type}
            parts = topic.split("/")
            if len(parts) < 4:
                return
            
            panel_id = parts[2]
            sensor_type_str = parts[3]
            
            # Map sensor type
            sensor_type_map = {
                "temperature": SensorType.TEMPERATURE,
                "irradiance": SensorType.IRRADIANCE,
                "voltage": SensorType.VOLTAGE,
                "current": SensorType.CURRENT,
                "power": SensorType.POWER,
                "humidity": SensorType.HUMIDITY,
                "dust": SensorType.DUST,
            }
            
            sensor_type = sensor_type_map.get(sensor_type_str)
            if not sensor_type:
                return
            
            # Create sensor reading
            reading = SensorReading(
                panel_id=panel_id,
                sensor_type=sensor_type,
                value=float(payload.get("value", 0)),
                unit=payload.get("unit", ""),
                timestamp=datetime.fromisoformat(
                    payload.get("timestamp", datetime.utcnow().isoformat())
                ),
                quality=float(payload.get("quality", 1.0)),
                metadata=payload.get("metadata", {})
            )
            
            # Cache the reading
            if panel_id not in self._sensor_cache:
                self._sensor_cache[panel_id] = {}
            
            self._sensor_cache[panel_id][sensor_type] = reading
            self._last_update[panel_id] = datetime.utcnow()
            
            # Register panel if new
            if panel_id not in self._panel_registry:
                self._panel_registry[panel_id] = {
                    "discovered_at": datetime.utcnow(),
                    "sensors": set()
                }
            self._panel_registry[panel_id]["sensors"].add(sensor_type)
            
        except Exception as e:
            self._last_error = f"Message processing error: {str(e)}"
    
    async def read_sensor(
        self, 
        panel_id: str, 
        sensor_type: SensorType
    ) -> Optional[SensorReading]:
        """Read cached sensor value"""
        if not self._connected:
            return None
        
        panel_cache = self._sensor_cache.get(panel_id, {})
        reading = panel_cache.get(sensor_type)
        
        if reading:
            # Check if cache is stale
            last_update = self._last_update.get(panel_id, datetime.min)
            if datetime.utcnow() - last_update > self._cache_timeout:
                reading.quality *= 0.5  # Reduce quality for stale data
        
        return reading
    
    async def read_panel(self, panel_id: str) -> Optional[PanelSensorData]:
        """Read all cached sensors for a panel"""
        if not self._connected or panel_id not in self._sensor_cache:
            # Return None for stub mode with no cached data
            return None
        
        cache = self._sensor_cache[panel_id]
        
        # Extract values from cache
        def get_value(sensor_type: SensorType) -> Optional[float]:
            reading = cache.get(sensor_type)
            return reading.value if reading else None
        
        # Build panel data
        data = PanelSensorData(
            panel_id=panel_id,
            timestamp=datetime.utcnow(),
            temperature=get_value(SensorType.TEMPERATURE),
            irradiance=get_value(SensorType.IRRADIANCE),
            voltage=get_value(SensorType.VOLTAGE),
            current=get_value(SensorType.CURRENT),
            power=get_value(SensorType.POWER),
            humidity=get_value(SensorType.HUMIDITY),
            dust_level=get_value(SensorType.DUST),
        )
        
        # Calculate efficiency if we have power and irradiance
        if data.power and data.irradiance and data.irradiance > 0:
            panel_area = 2.0  # Assume 2m² panel
            data.efficiency = (data.power / (data.irradiance * panel_area)) * 100
        
        # Generate alerts based on readings
        data.alerts = self._generate_alerts(data)
        data.status = self._determine_status(data.alerts)
        
        return data
    
    def _generate_alerts(self, data: PanelSensorData) -> List[str]:
        """Generate alerts from sensor data"""
        alerts = []
        
        if data.temperature and data.temperature > 75:
            alerts.append("CRITICAL: Panel temperature exceeds 75°C")
        elif data.temperature and data.temperature > 65:
            alerts.append("WARNING: High panel temperature")
        
        if data.dust_level and data.dust_level > 70:
            alerts.append("WARNING: High dust level, cleaning recommended")
        
        return alerts
    
    def _determine_status(self, alerts: List[str]) -> str:
        """Determine status from alerts"""
        if any("CRITICAL" in a for a in alerts):
            return "critical"
        elif any("WARNING" in a for a in alerts):
            return "warning"
        return "nominal"
    
    async def read_all_panels(self) -> List[PanelSensorData]:
        """Read all panels from cache"""
        if not self._connected:
            return []
        
        results = []
        for panel_id in self._sensor_cache:
            data = await self.read_panel(panel_id)
            if data:
                results.append(data)
        
        return results
    
    async def get_panel_ids(self) -> List[str]:
        """Get list of discovered panel IDs"""
        return list(self._panel_registry.keys())
    
    async def check_health(self) -> Dict[str, SensorStatus]:
        """Check health of all sensors based on update recency"""
        health = {}
        now = datetime.utcnow()
        
        for panel_id in self._panel_registry:
            last_update = self._last_update.get(panel_id, datetime.min)
            age = now - last_update
            
            if age < timedelta(seconds=30):
                health[panel_id] = SensorStatus.ONLINE
            elif age < timedelta(minutes=5):
                health[panel_id] = SensorStatus.DEGRADED
            else:
                health[panel_id] = SensorStatus.OFFLINE
        
        return health
    
    # === Publishing Methods (for sensor simulation or forwarding) ===
    
    async def publish_reading(self, reading: SensorReading) -> bool:
        """Publish a sensor reading to MQTT (for testing)"""
        if not self._client:
            return False
        
        try:
            topic = f"{self.mqtt_config.topic_prefix}/{reading.panel_id}/{reading.sensor_type.value}"
            payload = json.dumps(reading.to_dict())
            
            await self._client.publish(
                topic, 
                payload.encode(),
                qos=self.mqtt_config.qos
            )
            return True
            
        except Exception as e:
            self._last_error = f"Publish error: {str(e)}"
            return False


# === AWS IoT Core Adapter (Future) ===

class AWSIoTAdapter(MQTTSensorAdapter):
    """
    AWS IoT Core adapter stub.
    
    Extends MQTT adapter with AWS-specific authentication
    and shadow document support.
    
    TODO: Implement when AWS IoT integration is needed
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.aws_config = {
            "endpoint": config.get("endpoint") if config else None,
            "client_id": config.get("client_id", "helios-backend"),
            "thing_name": config.get("thing_name", "helios-gateway"),
        }
    
    async def connect(self) -> bool:
        """Connect to AWS IoT Core"""
        # TODO: Implement AWS IoT specific connection
        # Uses X.509 certificates for authentication
        self._last_error = "AWS IoT adapter not yet implemented"
        return False


# === Azure IoT Hub Adapter (Future) ===

class AzureIoTAdapter(SensorInterface):
    """
    Azure IoT Hub adapter stub.
    
    Uses Azure IoT SDK for device-to-cloud messaging.
    
    TODO: Implement when Azure IoT integration is needed
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.azure_config = {
            "connection_string": config.get("connection_string") if config else None,
            "hub_name": config.get("hub_name"),
        }
    
    async def connect(self) -> bool:
        self._last_error = "Azure IoT adapter not yet implemented"
        return False
    
    async def disconnect(self) -> None:
        pass
    
    async def read_sensor(self, panel_id: str, sensor_type: SensorType) -> Optional[SensorReading]:
        return None
    
    async def read_panel(self, panel_id: str) -> Optional[PanelSensorData]:
        return None
    
    async def read_all_panels(self) -> List[PanelSensorData]:
        return []
    
    async def get_panel_ids(self) -> List[str]:
        return []
    
    async def check_health(self) -> Dict[str, SensorStatus]:
        return {}
