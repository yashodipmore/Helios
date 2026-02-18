"""
HELIOS AI - Real-Time Sensor Data Simulation
Generates physics-based realistic sensor data for solar panel monitoring.

This service simulates what real IoT sensors would provide:
- IV curve measurements (voltage, current, power)
- Temperature sensors (cell temperature, ambient)
- Environmental sensors (irradiance, humidity)
- Calculated metrics (efficiency, performance ratio)

Technical basis:
- Uses standard PV performance equations
- Solar panel nominal specs: 369W STC rating
- Accounts for temperature coefficients
- Simulates real degradation patterns
"""
import math
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np


class SensorSimulator:
    """
    Physics-based solar panel sensor simulator.
    
    Panel Specifications (Standard 72-cell mono-Si):
    - Nominal Power (Pmax): 369W @ STC
    - Open Circuit Voltage (Voc): 48.2V
    - Short Circuit Current (Isc): 9.85A
    - Maximum Power Voltage (Vmp): 40.5V
    - Maximum Power Current (Imp): 9.11A
    - Temperature Coefficient (Pmax): -0.37%/°C
    - NOCT: 45°C
    """
    
    # Panel specifications (LONGi Hi-MO 5 369W)
    P_NOM = 369.0        # Watts @ STC
    V_OC = 48.2          # Open circuit voltage
    I_SC = 9.85          # Short circuit current
    V_MP = 40.5          # MPP voltage
    I_MP = 9.11          # MPP current
    TEMP_COEF_P = -0.0037  # Power temperature coefficient (%/°C as decimal)
    TEMP_COEF_V = -0.0027  # Voltage temperature coefficient
    NOCT = 45.0          # Nominal Operating Cell Temperature
    EFF_NOMINAL = 0.214  # 21.4% efficiency
    
    def __init__(self):
        self.current_hour = datetime.now().hour
        self.irradiance_profile = self._generate_daily_irradiance_profile()
    
    def generate_panel_reading(
        self,
        panel_id: str,
        status: str = "healthy",
        base_degradation: float = 0.0,
        custom_fault: Optional[str] = None
    ) -> Dict:
        """
        Generate realistic sensor reading for a panel.
        
        Args:
            panel_id: Panel identifier
            status: healthy/warning/critical
            base_degradation: Years of degradation (0.8%/year typical)
            custom_fault: Specific fault to simulate
        
        Returns:
            Dictionary with all sensor readings
        """
        # Get current environmental conditions
        hour = datetime.now().hour
        irradiance = self._get_irradiance(hour)
        ambient_temp = self._get_ambient_temperature(hour)
        
        # Calculate cell temperature (Ross model)
        cell_temp = ambient_temp + (irradiance / 800) * (self.NOCT - 20)
        
        # Base performance with temperature derating
        temp_factor = 1 + self.TEMP_COEF_P * (cell_temp - 25)
        irradiance_factor = irradiance / 1000  # STC is 1000 W/m²
        
        # Apply degradation and faults
        fault_factor, fault_details = self._apply_fault_model(status, custom_fault)
        degradation_factor = 1 - (base_degradation * 0.008)  # 0.8% per year
        
        # Final performance calculation
        performance_factor = temp_factor * irradiance_factor * fault_factor * degradation_factor
        
        # Calculate IV parameters with realistic variations
        noise = random.gauss(0, 0.01)  # 1% measurement noise
        
        voltage = self.V_MP * (1 + self.TEMP_COEF_V * (cell_temp - 25)) * (1 + noise)
        current = self.I_MP * irradiance_factor * fault_factor * (1 + noise)
        power = voltage * current
        efficiency = (power / (1.7 * irradiance)) * 100 if irradiance > 0 else 0  # 1.7m² panel area
        
        # Calculate performance ratio
        expected_power = self.P_NOM * temp_factor * irradiance_factor * degradation_factor
        performance_ratio = (power / expected_power * 100) if expected_power > 0 else 0
        
        return {
            "panel_id": panel_id,
            "timestamp": int(datetime.now().timestamp() * 1000),
            
            # Electrical measurements
            "voltage": round(max(0, voltage), 2),
            "current": round(max(0, current), 2),
            "power": round(max(0, power), 1),
            "efficiency": round(min(100, max(0, efficiency)), 1),
            
            # Temperature data
            "temperature": round(cell_temp, 1),
            "ambient_temperature": round(ambient_temp, 1),
            
            # Environmental data
            "irradiance": round(irradiance, 1),
            "humidity": random.randint(30, 70),
            
            # Performance metrics
            "performance_ratio": round(min(100, max(0, performance_ratio)), 1),
            "expected_power": round(expected_power, 1),
            "power_loss_percent": round(max(0, (1 - fault_factor) * 100), 1),
            
            # Status info
            "status": status,
            "fault_details": fault_details,
            
            # Additional metadata
            "daily_energy_kwh": round(self._estimate_daily_energy(performance_factor), 2),
            "soiling_index": round(random.uniform(0.85, 0.98), 2) if status == "healthy" else round(random.uniform(0.70, 0.85), 2),
        }
    
    def _apply_fault_model(self, status: str, custom_fault: Optional[str]) -> Tuple[float, Dict]:
        """Apply realistic fault models to performance."""
        if custom_fault:
            return self._custom_fault_factor(custom_fault)
        
        if status == "healthy":
            return 1.0, {"type": "none", "description": "Operating normally"}
        
        elif status == "warning":
            # Common warning-level faults
            fault_type = random.choice([
                "soiling",
                "partial_shading",
                "mild_degradation",
                "connection_resistance"
            ])
            
            if fault_type == "soiling":
                loss = random.uniform(0.08, 0.15)  # 8-15% loss
                return 1 - loss, {
                    "type": "soiling",
                    "description": f"Dust accumulation causing {loss*100:.1f}% power loss",
                    "recommended_action": "Schedule cleaning within 1 week"
                }
            elif fault_type == "partial_shading":
                loss = random.uniform(0.10, 0.20)
                return 1 - loss, {
                    "type": "partial_shading",
                    "description": f"Partial shading affecting {loss*100:.1f}% output",
                    "recommended_action": "Investigate obstruction source"
                }
            elif fault_type == "mild_degradation":
                loss = random.uniform(0.05, 0.12)
                return 1 - loss, {
                    "type": "cell_degradation",
                    "description": f"Early-stage cell degradation ({loss*100:.1f}% impact)",
                    "recommended_action": "Monitor for progression"
                }
            else:
                loss = random.uniform(0.03, 0.08)
                return 1 - loss, {
                    "type": "connection_resistance",
                    "description": f"Elevated series resistance ({loss*100:.1f}% loss)",
                    "recommended_action": "Inspect connectors and junction box"
                }
        
        else:  # critical
            fault_type = random.choice([
                "bypass_diode",
                "hot_spot",
                "delamination",
                "string_failure"
            ])
            
            if fault_type == "bypass_diode":
                loss = 0.33  # One string (1/3 of panel)
                return 1 - loss, {
                    "type": "bypass_diode_failure",
                    "description": "Bypass diode failure - 33% output loss (one string)",
                    "recommended_action": "IMMEDIATE: Replace bypass diode",
                    "severity_class": 3
                }
            elif fault_type == "hot_spot":
                loss = random.uniform(0.25, 0.40)
                return 1 - loss, {
                    "type": "hot_spot",
                    "description": f"Severe hot spot causing {loss*100:.1f}% power loss",
                    "recommended_action": "IMMEDIATE: Thermal inspection required",
                    "severity_class": 3
                }
            elif fault_type == "delamination":
                loss = random.uniform(0.20, 0.35)
                return 1 - loss, {
                    "type": "delamination",
                    "description": f"Encapsulant delamination with moisture ingress ({loss*100:.1f}% loss)",
                    "recommended_action": "Panel replacement recommended",
                    "severity_class": 2
                }
            else:
                loss = random.uniform(0.33, 0.66)  # 1-2 strings affected
                return 1 - loss, {
                    "type": "string_interconnect_failure",
                    "description": f"String interconnect failure ({loss*100:.1f}% output loss)",
                    "recommended_action": "URGENT: Repair interconnection",
                    "severity_class": 3
                }
    
    def _custom_fault_factor(self, fault: str) -> Tuple[float, Dict]:
        """Handle specific fault simulation requests."""
        faults = {
            "bypass_diode": (0.67, {"type": "bypass_diode_failure", "description": "Simulated bypass diode failure"}),
            "soiling": (0.88, {"type": "soiling", "description": "Simulated heavy soiling"}),
            "hot_spot": (0.70, {"type": "hot_spot", "description": "Simulated hot spot"}),
            "micro_crack": (0.92, {"type": "micro_crack", "description": "Simulated micro-crack"}),
            "pid": (0.75, {"type": "PID", "description": "Simulated Potential Induced Degradation"}),
        }
        return faults.get(fault, (1.0, {"type": "unknown", "description": fault}))
    
    def _get_irradiance(self, hour: int) -> float:
        """Get solar irradiance for given hour (W/m²)."""
        # Gaussian-like solar profile
        if hour < 6 or hour > 18:
            return 0
        
        peak_hour = 12.5
        sigma = 3.0
        peak_irradiance = 950  # W/m² at solar noon
        
        irradiance = peak_irradiance * math.exp(-((hour - peak_hour) ** 2) / (2 * sigma ** 2))
        
        # Add some cloud variability
        cloud_factor = random.uniform(0.85, 1.0)
        
        return max(0, irradiance * cloud_factor)
    
    def _get_ambient_temperature(self, hour: int) -> float:
        """Get ambient temperature for given hour (°C)."""
        # Daily temperature cycle for Maharashtra region
        min_temp = 22  # Pre-dawn minimum
        max_temp = 35  # Afternoon maximum
        peak_hour = 14.5
        
        # Sinusoidal-ish temperature profile
        temp_range = max_temp - min_temp
        temp = min_temp + temp_range * 0.5 * (1 + math.sin(math.pi * (hour - 6) / 12))
        
        if hour < 6 or hour > 18:
            temp = min_temp + random.uniform(-2, 2)
        
        return temp + random.uniform(-1, 1)
    
    def _generate_daily_irradiance_profile(self) -> List[float]:
        """Generate 24-hour irradiance profile."""
        return [self._get_irradiance(h) for h in range(24)]
    
    def _estimate_daily_energy(self, performance_factor: float) -> float:
        """Estimate daily energy production (kWh)."""
        # Integrate irradiance profile with performance
        total_wh = 0
        for hour in range(24):
            irr = self._get_irradiance(hour)
            power = self.P_NOM * (irr / 1000) * performance_factor * 0.85  # System efficiency
            total_wh += power  # 1 hour integration
        
        return total_wh / 1000  # Convert to kWh
    
    def generate_farm_statistics(self, panels: List[Dict]) -> Dict:
        """Calculate aggregate farm statistics from panel data."""
        if not panels:
            return {
                "totalPanels": 0,
                "healthyCount": 0,
                "warningCount": 0,
                "criticalCount": 0,
                "totalPowerKw": 0,
                "avgEfficiency": 0,
                "totalDailyEnergyKwh": 0,
                "performanceRatio": 0,
            }
        
        healthy = sum(1 for p in panels if p.get("status") == "healthy")
        warning = sum(1 for p in panels if p.get("status") == "warning")
        critical = sum(1 for p in panels if p.get("status") == "critical")
        
        total_power = sum(p.get("power", 0) for p in panels)
        efficiencies = [p.get("efficiency", 0) for p in panels if p.get("efficiency", 0) > 0]
        avg_eff = sum(efficiencies) / len(efficiencies) if efficiencies else 0
        
        total_energy = sum(p.get("daily_energy_kwh", 0) for p in panels)
        
        perf_ratios = [p.get("performance_ratio", 0) for p in panels if p.get("performance_ratio", 0) > 0]
        avg_pr = sum(perf_ratios) / len(perf_ratios) if perf_ratios else 0
        
        return {
            "totalPanels": len(panels),
            "healthyCount": healthy,
            "warningCount": warning,
            "criticalCount": critical,
            "totalPowerKw": round(total_power / 1000, 2),
            "avgEfficiency": round(avg_eff, 1),
            "totalDailyEnergyKwh": round(total_energy, 2),
            "performanceRatio": round(avg_pr, 1),
            "timestamp": int(datetime.now().timestamp() * 1000),
        }


# Singleton instance
sensor_simulator = SensorSimulator()
