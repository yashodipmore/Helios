"""
HELIOS AI - Mock Sensor Adapter
Provides simulated sensor data for demos and development.

This adapter generates realistic solar panel sensor data with:
- Diurnal patterns (day/night cycles)
- Weather effects (clouds, temperature)
- Fault injection (for testing alerts)
- Configurable panel count and layout
"""

import random
import math
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import asyncio

from .sensor_interface import (
    SensorInterface,
    SensorReading,
    PanelSensorData,
    SensorType,
    SensorStatus,
    SensorCalibration
)


class MockSensorAdapter(SensorInterface):
    """
    Generates realistic simulated sensor data for demonstrations.
    
    Features:
    - Realistic diurnal irradiance patterns
    - Temperature variation based on time and irradiance
    - Random fault injection for testing
    - Configurable panel grid layout
    - Dust accumulation simulation
    
    Usage:
        adapter = MockSensorAdapter({
            "panel_count": 24,
            "rows": 4,
            "cols": 6,
            "location": {"lat": 19.076, "lon": 72.877},  # Mumbai
            "fault_probability": 0.05
        })
        await adapter.connect()
        data = await adapter.read_all_panels()
    """
    
    # Panel configuration
    DEFAULT_CONFIG = {
        "panel_count": 24,
        "rows": 4,
        "cols": 6,
        "panel_prefix": "A",
        "location": {"lat": 19.076, "lon": 72.877, "timezone": "Asia/Kolkata"},
        "panel_specs": {
            "rated_power": 400,  # Watts
            "rated_voltage": 40.5,  # Volts (Vmp)
            "rated_current": 9.88,  # Amps (Imp)
            "temp_coefficient": -0.35,  # %/°C
            "efficiency_max": 21.5  # Percentage
        },
        "fault_probability": 0.05,  # 5% chance of fault per panel
        "dust_accumulation_rate": 0.5,  # % per day
        "simulation_speed": 1.0  # 1.0 = real-time
    }
    
    # Fault definitions for realistic simulation
    FAULT_TYPES = [
        {"type": "hotspot", "temp_increase": 15, "power_reduction": 0.3},
        {"type": "crack", "power_reduction": 0.2, "current_variance": 0.15},
        {"type": "shading", "power_reduction": 0.4, "voltage_reduction": 0.1},
        {"type": "delamination", "power_reduction": 0.15, "efficiency_loss": 0.1},
        {"type": "soiling", "power_reduction": 0.25, "dust_level": 80},
        {"type": "pid", "power_reduction": 0.35, "voltage_reduction": 0.2},
    ]
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize mock adapter with optional configuration"""
        super().__init__(config)
        
        # Merge with defaults
        self.config = {**self.DEFAULT_CONFIG, **(config or {})}
        
        # Initialize panel state
        self._panels: Dict[str, Dict[str, Any]] = {}
        self._faults: Dict[str, Dict[str, Any]] = {}
        self._start_time = datetime.now()
        self._weather_state = self._generate_weather()
        
    async def connect(self) -> bool:
        """Initialize mock sensor connection"""
        try:
            # Generate panel IDs
            self._generate_panels()
            
            # Inject some initial faults for demo
            self._inject_random_faults()
            
            self._connected = True
            return True
        except Exception as e:
            self._last_error = str(e)
            return False
    
    async def disconnect(self) -> None:
        """Disconnect from mock sensors"""
        self._connected = False
        self._panels.clear()
        self._faults.clear()
    
    def _generate_panels(self) -> None:
        """Generate panel configuration"""
        rows = self.config["rows"]
        cols = self.config["cols"]
        prefix = self.config["panel_prefix"]
        
        for row in range(rows):
            for col in range(cols):
                panel_id = f"{prefix}-{row+1:02d}{col+1:02d}"
                self._panels[panel_id] = {
                    "row": row,
                    "col": col,
                    "installed_date": datetime.now() - timedelta(days=random.randint(30, 365)),
                    "dust_level": random.uniform(0, 30),  # Initial dust level
                    "age_factor": random.uniform(0.95, 1.0),  # Slight degradation
                    "orientation": random.uniform(-5, 5),  # Tilt variance
                }
    
    def _generate_weather(self) -> Dict[str, Any]:
        """Generate current weather conditions"""
        # Simulate weather patterns
        cloud_cover = random.uniform(0, 0.5)  # 0-50% clouds (bias towards sunny for demo)
        
        return {
            "cloud_cover": cloud_cover,
            "ambient_temp": random.uniform(25, 35),  # °C
            "humidity": random.uniform(40, 80),  # %
            "wind_speed": random.uniform(0, 15),  # km/h
            "dust_factor": random.uniform(0.8, 1.0),  # Air quality
        }
    
    def _inject_random_faults(self) -> None:
        """Inject random faults for realistic simulation"""
        fault_probability = self.config["fault_probability"]
        
        for panel_id in self._panels:
            if random.random() < fault_probability:
                fault = random.choice(self.FAULT_TYPES)
                self._faults[panel_id] = {
                    **fault,
                    "severity": random.uniform(0.5, 1.0),
                    "detected_at": datetime.now()
                }
    
    def _calculate_solar_position(self) -> Dict[str, float]:
        """Calculate approximate sun position based on time"""
        now = datetime.now()
        hour = now.hour + now.minute / 60.0
        
        # Simplified solar position calculation
        # Sunrise at 6 AM, sunset at 6 PM (approximate)
        if hour < 6 or hour > 18:
            return {"altitude": 0, "azimuth": 0, "is_day": False}
        
        # Solar altitude (0 at sunrise/sunset, 90 at noon)
        solar_noon = 12.0
        hours_from_noon = abs(hour - solar_noon)
        altitude = 90 * (1 - hours_from_noon / 6.0)
        altitude = max(0, altitude)
        
        # Solar azimuth (simplified)
        azimuth = (hour - 6) * 15  # 15 degrees per hour
        
        return {"altitude": altitude, "azimuth": azimuth, "is_day": True}
    
    def _calculate_irradiance(self) -> float:
        """Calculate current irradiance based on sun position and weather"""
        solar = self._calculate_solar_position()
        
        if not solar["is_day"]:
            return 0.0
        
        # Base irradiance at solar noon on clear day
        max_irradiance = 1000.0  # W/m²
        
        # Adjust for sun altitude
        altitude_factor = math.sin(math.radians(solar["altitude"]))
        
        # Adjust for cloud cover
        cloud_factor = 1 - (self._weather_state["cloud_cover"] * 0.7)
        
        # Calculate final irradiance
        irradiance = max_irradiance * altitude_factor * cloud_factor
        
        # Add realistic noise
        irradiance *= random.uniform(0.95, 1.05)
        
        return max(0, irradiance)
    
    def _calculate_panel_temperature(self, irradiance: float) -> float:
        """Calculate panel temperature based on irradiance and ambient"""
        ambient = self._weather_state["ambient_temp"]
        
        # NOCT-based temperature model
        # Panel temp = Ambient + (NOCT - 20) * (G / 800)
        noct = 45  # Nominal Operating Cell Temperature
        temp_rise = (noct - 20) * (irradiance / 800)
        
        panel_temp = ambient + temp_rise
        
        # Wind cooling effect
        wind = self._weather_state["wind_speed"]
        wind_cooling = min(wind * 0.3, 5)  # Max 5°C cooling
        panel_temp -= wind_cooling
        
        # Add noise
        panel_temp += random.uniform(-1, 1)
        
        return panel_temp
    
    def _calculate_power_output(
        self, 
        panel_id: str,
        irradiance: float, 
        temperature: float
    ) -> Dict[str, float]:
        """Calculate panel electrical output"""
        specs = self.config["panel_specs"]
        panel = self._panels.get(panel_id, {})
        fault = self._faults.get(panel_id)
        
        if irradiance <= 0:
            return {"voltage": 0, "current": 0, "power": 0, "efficiency": 0}
        
        # Base calculations
        irradiance_ratio = irradiance / 1000.0
        
        # Temperature derating
        stc_temp = 25  # Standard Test Condition temp
        temp_delta = temperature - stc_temp
        temp_factor = 1 + (specs["temp_coefficient"] / 100 * temp_delta)
        
        # Age and dust effects
        age_factor = panel.get("age_factor", 1.0)
        dust_level = panel.get("dust_level", 0)
        dust_factor = 1 - (dust_level / 100 * 0.25)  # Max 25% loss from dust
        
        # Calculate base power
        power = specs["rated_power"] * irradiance_ratio * temp_factor * age_factor * dust_factor
        
        # Apply fault effects
        if fault:
            power *= (1 - fault.get("power_reduction", 0) * fault.get("severity", 1))
        
        # Calculate voltage and current
        voltage = specs["rated_voltage"] * (1 - 0.004 * max(0, temp_delta))  # Slight voltage drop with temp
        if fault and "voltage_reduction" in fault:
            voltage *= (1 - fault["voltage_reduction"] * fault["severity"])
        
        current = power / voltage if voltage > 0 else 0
        
        # Efficiency
        panel_area = 2.0  # m² (approximate for 400W panel)
        efficiency = (power / (irradiance * panel_area)) * 100 if irradiance > 0 else 0
        efficiency = min(efficiency, specs["efficiency_max"])
        
        return {
            "voltage": round(voltage, 2),
            "current": round(current, 2),
            "power": round(power, 1),
            "efficiency": round(efficiency, 1)
        }
    
    def _generate_alerts(
        self, 
        panel_id: str, 
        temperature: float, 
        power_data: Dict[str, float]
    ) -> List[str]:
        """Generate alerts based on panel conditions"""
        alerts = []
        fault = self._faults.get(panel_id)
        panel = self._panels.get(panel_id, {})
        
        # Temperature alerts
        if temperature > 75:
            alerts.append("CRITICAL: Panel temperature exceeds 75°C")
        elif temperature > 65:
            alerts.append("WARNING: High panel temperature (>65°C)")
        
        # Dust alerts
        dust = panel.get("dust_level", 0)
        if dust > 70:
            alerts.append("CRITICAL: Heavy soiling detected, cleaning required")
        elif dust > 40:
            alerts.append("WARNING: Moderate soiling, schedule cleaning")
        
        # Fault-based alerts
        if fault:
            fault_type = fault["type"]
            severity = "CRITICAL" if fault["severity"] > 0.7 else "WARNING"
            
            alert_messages = {
                "hotspot": f"{severity}: Hotspot detected, possible cell failure",
                "crack": f"{severity}: Possible micro-crack detected",
                "shading": f"WARNING: Partial shading detected",
                "delamination": f"{severity}: Delamination detected",
                "soiling": f"WARNING: Excessive soiling reducing output",
                "pid": f"{severity}: Potential Induced Degradation detected",
            }
            alerts.append(alert_messages.get(fault_type, f"{severity}: Anomaly detected"))
        
        # Output alerts
        specs = self.config["panel_specs"]
        if power_data["power"] < specs["rated_power"] * 0.5 and power_data["power"] > 0:
            if not any("shading" in a.lower() for a in alerts):
                alerts.append("WARNING: Power output below 50% of rated capacity")
        
        return alerts
    
    def _determine_status(
        self, 
        panel_id: str, 
        alerts: List[str]
    ) -> str:
        """Determine overall panel status"""
        if not alerts:
            return "nominal"
        
        critical_count = sum(1 for a in alerts if "CRITICAL" in a)
        warning_count = sum(1 for a in alerts if "WARNING" in a)
        
        if critical_count > 0:
            return "critical"
        elif warning_count > 1:
            return "warning"
        elif warning_count == 1:
            return "attention"
        
        return "nominal"
    
    async def read_sensor(
        self, 
        panel_id: str, 
        sensor_type: SensorType
    ) -> Optional[SensorReading]:
        """Read a single sensor value"""
        if not self._connected or panel_id not in self._panels:
            return None
        
        irradiance = self._calculate_irradiance()
        temperature = self._calculate_panel_temperature(irradiance)
        power_data = self._calculate_power_output(panel_id, irradiance, temperature)
        
        value_map = {
            SensorType.TEMPERATURE: (temperature, "°C"),
            SensorType.IRRADIANCE: (irradiance, "W/m²"),
            SensorType.VOLTAGE: (power_data["voltage"], "V"),
            SensorType.CURRENT: (power_data["current"], "A"),
            SensorType.POWER: (power_data["power"], "W"),
            SensorType.HUMIDITY: (self._weather_state["humidity"], "%"),
            SensorType.DUST: (self._panels[panel_id].get("dust_level", 0), "%"),
            SensorType.WIND_SPEED: (self._weather_state["wind_speed"], "km/h"),
        }
        
        if sensor_type not in value_map:
            return None
        
        value, unit = value_map[sensor_type]
        
        return SensorReading(
            panel_id=panel_id,
            sensor_type=sensor_type,
            value=round(value, 2),
            unit=unit,
            quality=random.uniform(0.95, 1.0),  # Simulated data quality
            metadata={"source": "mock", "weather": self._weather_state}
        )
    
    async def read_panel(self, panel_id: str) -> Optional[PanelSensorData]:
        """Read all sensors for a panel"""
        if not self._connected or panel_id not in self._panels:
            return None
        
        # Calculate current conditions
        irradiance = self._calculate_irradiance()
        temperature = self._calculate_panel_temperature(irradiance)
        power_data = self._calculate_power_output(panel_id, irradiance, temperature)
        panel = self._panels[panel_id]
        
        # Generate alerts
        alerts = self._generate_alerts(panel_id, temperature, power_data)
        status = self._determine_status(panel_id, alerts)
        
        return PanelSensorData(
            panel_id=panel_id,
            timestamp=datetime.utcnow(),
            temperature=round(temperature, 1),
            irradiance=round(irradiance, 1),
            voltage=power_data["voltage"],
            current=power_data["current"],
            power=power_data["power"],
            efficiency=power_data["efficiency"],
            dust_level=round(panel.get("dust_level", 0), 1),
            humidity=round(self._weather_state["humidity"], 1),
            status=status,
            alerts=alerts
        )
    
    async def read_all_panels(self) -> List[PanelSensorData]:
        """Read sensor data for all panels"""
        if not self._connected:
            return []
        
        # Update weather occasionally for more realism
        if random.random() < 0.1:
            self._weather_state = self._generate_weather()
        
        results = []
        for panel_id in self._panels:
            data = await self.read_panel(panel_id)
            if data:
                results.append(data)
        
        return results
    
    async def get_panel_ids(self) -> List[str]:
        """Get list of all panel IDs"""
        return list(self._panels.keys())
    
    async def check_health(self) -> Dict[str, SensorStatus]:
        """Check health of all simulated sensors"""
        health = {}
        
        for panel_id in self._panels:
            if panel_id in self._faults:
                fault = self._faults[panel_id]
                if fault["severity"] > 0.8:
                    health[panel_id] = SensorStatus.ERROR
                else:
                    health[panel_id] = SensorStatus.DEGRADED
            else:
                health[panel_id] = SensorStatus.ONLINE
        
        return health
    
    # === Demo Control Methods ===
    
    def inject_fault(
        self, 
        panel_id: str, 
        fault_type: str, 
        severity: float = 0.7
    ) -> bool:
        """Manually inject a fault for demo purposes"""
        if panel_id not in self._panels:
            return False
        
        fault_def = next(
            (f for f in self.FAULT_TYPES if f["type"] == fault_type), 
            None
        )
        
        if not fault_def:
            return False
        
        self._faults[panel_id] = {
            **fault_def,
            "severity": min(1.0, max(0.0, severity)),
            "detected_at": datetime.now()
        }
        
        return True
    
    def clear_fault(self, panel_id: str) -> bool:
        """Clear a fault from a panel"""
        if panel_id in self._faults:
            del self._faults[panel_id]
            return True
        return False
    
    def set_weather(
        self, 
        cloud_cover: float = None,
        ambient_temp: float = None,
        humidity: float = None
    ) -> None:
        """Manually set weather conditions for demo"""
        if cloud_cover is not None:
            self._weather_state["cloud_cover"] = min(1.0, max(0.0, cloud_cover))
        if ambient_temp is not None:
            self._weather_state["ambient_temp"] = ambient_temp
        if humidity is not None:
            self._weather_state["humidity"] = min(100, max(0, humidity))
    
    def get_fault_info(self, panel_id: str) -> Optional[Dict[str, Any]]:
        """Get fault information for a panel"""
        return self._faults.get(panel_id)
    
    def get_all_faults(self) -> Dict[str, Dict[str, Any]]:
        """Get all active faults"""
        return dict(self._faults)
