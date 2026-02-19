"""
HELIOS AI - Time-Series Data Operations
Handles historical data storage and retrieval for panels.
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
import os
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_supabase: Optional[Client] = None

def get_supabase() -> Optional[Client]:
    """Get or create Supabase client"""
    global _supabase
    if _supabase is None and SUPABASE_URL and SUPABASE_KEY:
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase


@dataclass
class PanelReading:
    """Single panel sensor reading"""
    panel_id: str
    timestamp: datetime
    voltage: Optional[float] = None
    current: Optional[float] = None
    power: Optional[float] = None
    temperature: Optional[float] = None
    efficiency: Optional[float] = None
    irradiance: Optional[float] = None
    status: str = "nominal"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "panel_id": self.panel_id,
            "timestamp": self.timestamp.isoformat(),
            "voltage": self.voltage,
            "current": self.current,
            "power": self.power,
            "temperature": self.temperature,
            "efficiency": self.efficiency,
            "irradiance": self.irradiance,
            "status": self.status
        }


@dataclass  
class AlertRecord:
    """Alert history record"""
    panel_id: str
    severity: str
    message: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "panel_id": self.panel_id,
            "severity": self.severity,
            "message": self.message,
            "created_at": self.created_at.isoformat(),
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolved_by": self.resolved_by
        }


class TimeSeriesDB:
    """
    Time-series data operations for HELIOS.
    Uses Supabase for persistent storage with in-memory fallback.
    """
    
    def __init__(self):
        self._supabase = get_supabase()
        # In-memory storage fallback (for demo/testing)
        self._readings_cache: List[PanelReading] = []
        self._alerts_cache: List[AlertRecord] = []
        self._analysis_cache: List[Dict[str, Any]] = []
        self._max_cache_size = 10000
    
    # === Panel Readings ===
    
    async def save_reading(self, reading: PanelReading) -> bool:
        """Save a panel reading to storage"""
        try:
            if self._supabase:
                self._supabase.table("panel_readings").insert(reading.to_dict()).execute()
            else:
                # In-memory fallback
                self._readings_cache.append(reading)
                if len(self._readings_cache) > self._max_cache_size:
                    self._readings_cache = self._readings_cache[-self._max_cache_size:]
            return True
        except Exception as e:
            print(f"Error saving reading: {e}")
            return False
    
    async def save_readings_batch(self, readings: List[PanelReading]) -> bool:
        """Save multiple readings efficiently"""
        try:
            if self._supabase:
                data = [r.to_dict() for r in readings]
                self._supabase.table("panel_readings").insert(data).execute()
            else:
                self._readings_cache.extend(readings)
                if len(self._readings_cache) > self._max_cache_size:
                    self._readings_cache = self._readings_cache[-self._max_cache_size:]
            return True
        except Exception as e:
            print(f"Error saving readings batch: {e}")
            return False
    
    async def get_panel_history(
        self,
        panel_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get historical readings for a panel"""
        try:
            if self._supabase:
                query = self._supabase.table("panel_readings")\
                    .select("*")\
                    .eq("panel_id", panel_id)\
                    .order("timestamp", desc=True)\
                    .limit(limit)
                
                if start_time:
                    query = query.gte("timestamp", start_time.isoformat())
                if end_time:
                    query = query.lte("timestamp", end_time.isoformat())
                
                result = query.execute()
                return result.data
            else:
                # In-memory fallback
                filtered = [r for r in self._readings_cache if r.panel_id == panel_id]
                if start_time:
                    filtered = [r for r in filtered if r.timestamp >= start_time]
                if end_time:
                    filtered = [r for r in filtered if r.timestamp <= end_time]
                filtered.sort(key=lambda x: x.timestamp, reverse=True)
                return [r.to_dict() for r in filtered[:limit]]
        except Exception as e:
            print(f"Error getting panel history: {e}")
            return []
    
    async def get_power_trend(
        self,
        period_days: int = 7,
        panel_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get power generation trend over time"""
        try:
            start_time = datetime.utcnow() - timedelta(days=period_days)
            
            if self._supabase:
                query = self._supabase.table("panel_readings")\
                    .select("timestamp, power, panel_id")\
                    .gte("timestamp", start_time.isoformat())\
                    .order("timestamp", desc=False)
                
                if panel_id:
                    query = query.eq("panel_id", panel_id)
                
                result = query.execute()
                return self._aggregate_by_hour(result.data, "power")
            else:
                # In-memory fallback with mock data
                return self._generate_mock_trend(period_days, "power")
        except Exception as e:
            print(f"Error getting power trend: {e}")
            return self._generate_mock_trend(period_days, "power")
    
    async def get_efficiency_trend(
        self,
        period_days: int = 30,
        panel_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get efficiency trend over time"""
        try:
            start_time = datetime.utcnow() - timedelta(days=period_days)
            
            if self._supabase:
                query = self._supabase.table("panel_readings")\
                    .select("timestamp, efficiency, panel_id")\
                    .gte("timestamp", start_time.isoformat())\
                    .order("timestamp", desc=False)
                
                if panel_id:
                    query = query.eq("panel_id", panel_id)
                
                result = query.execute()
                return self._aggregate_by_day(result.data, "efficiency")
            else:
                return self._generate_mock_trend(period_days, "efficiency")
        except Exception as e:
            print(f"Error getting efficiency trend: {e}")
            return self._generate_mock_trend(period_days, "efficiency")
    
    # === Alerts ===
    
    async def save_alert(self, alert: AlertRecord) -> bool:
        """Save an alert to history"""
        try:
            if self._supabase:
                self._supabase.table("alert_history").insert(alert.to_dict()).execute()
            else:
                self._alerts_cache.append(alert)
            return True
        except Exception as e:
            print(f"Error saving alert: {e}")
            return False
    
    async def get_alerts_history(
        self,
        panel_id: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get alert history"""
        try:
            if self._supabase:
                query = self._supabase.table("alert_history")\
                    .select("*")\
                    .order("created_at", desc=True)\
                    .limit(limit)
                
                if panel_id:
                    query = query.eq("panel_id", panel_id)
                if severity:
                    query = query.eq("severity", severity)
                
                result = query.execute()
                return result.data
            else:
                filtered = list(self._alerts_cache)
                if panel_id:
                    filtered = [a for a in filtered if a.panel_id == panel_id]
                if severity:
                    filtered = [a for a in filtered if a.severity == severity]
                filtered.sort(key=lambda x: x.created_at, reverse=True)
                return [a.to_dict() for a in filtered[:limit]]
        except Exception as e:
            print(f"Error getting alerts history: {e}")
            return []
    
    async def resolve_alert(
        self,
        alert_id: str,
        resolved_by: str
    ) -> bool:
        """Mark an alert as resolved"""
        try:
            if self._supabase:
                self._supabase.table("alert_history")\
                    .update({
                        "resolved_at": datetime.utcnow().isoformat(),
                        "resolved_by": resolved_by
                    })\
                    .eq("id", alert_id)\
                    .execute()
            return True
        except Exception as e:
            print(f"Error resolving alert: {e}")
            return False
    
    # === Analysis History ===
    
    async def save_analysis(
        self,
        panel_id: str,
        analysis_type: str,
        result: Dict[str, Any],
        confidence: float
    ) -> bool:
        """Save AI analysis result"""
        try:
            data = {
                "panel_id": panel_id,
                "analysis_type": analysis_type,
                "result": result,
                "confidence": confidence,
                "created_at": datetime.utcnow().isoformat()
            }
            
            if self._supabase:
                self._supabase.table("analysis_history").insert(data).execute()
            else:
                self._analysis_cache.append(data)
            return True
        except Exception as e:
            print(f"Error saving analysis: {e}")
            return False
    
    async def get_analysis_history(
        self,
        panel_id: Optional[str] = None,
        analysis_type: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get AI analysis history"""
        try:
            if self._supabase:
                query = self._supabase.table("analysis_history")\
                    .select("*")\
                    .order("created_at", desc=True)\
                    .limit(limit)
                
                if panel_id:
                    query = query.eq("panel_id", panel_id)
                if analysis_type:
                    query = query.eq("analysis_type", analysis_type)
                
                result = query.execute()
                return result.data
            else:
                filtered = list(self._analysis_cache)
                if panel_id:
                    filtered = [a for a in filtered if a.get("panel_id") == panel_id]
                if analysis_type:
                    filtered = [a for a in filtered if a.get("analysis_type") == analysis_type]
                return filtered[:limit]
        except Exception as e:
            print(f"Error getting analysis history: {e}")
            return []
    
    # === Aggregation Helpers ===
    
    def _aggregate_by_hour(
        self,
        data: List[Dict],
        field: str
    ) -> List[Dict[str, Any]]:
        """Aggregate data points by hour"""
        from collections import defaultdict
        
        hourly = defaultdict(list)
        for item in data:
            ts = datetime.fromisoformat(item["timestamp"].replace("Z", "+00:00"))
            hour_key = ts.strftime("%Y-%m-%d %H:00")
            if item.get(field) is not None:
                hourly[hour_key].append(item[field])
        
        result = []
        for hour, values in sorted(hourly.items()):
            result.append({
                "timestamp": hour,
                "avg": sum(values) / len(values),
                "min": min(values),
                "max": max(values),
                "count": len(values)
            })
        
        return result
    
    def _aggregate_by_day(
        self,
        data: List[Dict],
        field: str
    ) -> List[Dict[str, Any]]:
        """Aggregate data points by day"""
        from collections import defaultdict
        
        daily = defaultdict(list)
        for item in data:
            ts = datetime.fromisoformat(item["timestamp"].replace("Z", "+00:00"))
            day_key = ts.strftime("%Y-%m-%d")
            if item.get(field) is not None:
                daily[day_key].append(item[field])
        
        result = []
        for day, values in sorted(daily.items()):
            result.append({
                "date": day,
                "avg": sum(values) / len(values),
                "min": min(values),
                "max": max(values),
                "count": len(values)
            })
        
        return result
    
    def _generate_mock_trend(
        self,
        days: int,
        metric: str
    ) -> List[Dict[str, Any]]:
        """Generate mock trend data for demo"""
        import random
        import math
        
        result = []
        now = datetime.utcnow()
        
        for i in range(days * 24):  # Hourly data
            timestamp = now - timedelta(hours=days*24 - i)
            hour = timestamp.hour
            
            # Simulate diurnal pattern
            if 6 <= hour <= 18:
                solar_factor = math.sin(math.pi * (hour - 6) / 12)
            else:
                solar_factor = 0
            
            if metric == "power":
                base = 8000 * solar_factor  # Peak 8kW
                value = base * random.uniform(0.85, 1.0)
            elif metric == "efficiency":
                value = 85 + random.uniform(-3, 3) if solar_factor > 0 else 0
            else:
                value = random.uniform(0, 100)
            
            result.append({
                "timestamp": timestamp.isoformat(),
                "value": round(value, 2),
                "metric": metric
            })
        
        return result


# Global instance
timeseries_db = TimeSeriesDB()
