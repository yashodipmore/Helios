"""
HELIOS AI - History API Routes
Endpoints for historical data and analytics.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.database.timeseries import timeseries_db, PanelReading, AlertRecord

router = APIRouter(prefix="/api/history", tags=["History"])


# === Panel History ===

@router.get("/panels/{panel_id}")
async def get_panel_history(
    panel_id: str,
    start: Optional[str] = Query(None, description="Start date ISO format"),
    end: Optional[str] = Query(None, description="End date ISO format"),
    limit: int = Query(100, le=1000)
):
    """Get historical sensor readings for a panel"""
    start_time = datetime.fromisoformat(start) if start else None
    end_time = datetime.fromisoformat(end) if end else None
    
    history = await timeseries_db.get_panel_history(
        panel_id=panel_id,
        start_time=start_time,
        end_time=end_time,
        limit=limit
    )
    
    return {
        "panel_id": panel_id,
        "count": len(history),
        "start": start,
        "end": end,
        "readings": history
    }


# === Analytics ===

@router.get("/analytics/power-trend")
async def get_power_trend(
    period: str = Query("7d", description="Period: 1d, 7d, 30d, 90d"),
    panel_id: Optional[str] = None
):
    """Get power generation trend over time"""
    period_days = _parse_period(period)
    
    trend = await timeseries_db.get_power_trend(
        period_days=period_days,
        panel_id=panel_id
    )
    
    return {
        "metric": "power",
        "period": period,
        "period_days": period_days,
        "panel_id": panel_id,
        "data": trend
    }


@router.get("/analytics/efficiency-trend")
async def get_efficiency_trend(
    period: str = Query("30d", description="Period: 7d, 30d, 90d, 365d"),
    panel_id: Optional[str] = None
):
    """Get efficiency trend over time"""
    period_days = _parse_period(period)
    
    trend = await timeseries_db.get_efficiency_trend(
        period_days=period_days,
        panel_id=panel_id
    )
    
    return {
        "metric": "efficiency",
        "period": period,
        "period_days": period_days,
        "panel_id": panel_id,
        "data": trend
    }


@router.get("/analytics/summary")
async def get_analytics_summary(
    period: str = Query("7d", description="Period for summary")
):
    """Get aggregated analytics summary"""
    period_days = _parse_period(period)
    
    # Get trends
    power_trend = await timeseries_db.get_power_trend(period_days)
    efficiency_trend = await timeseries_db.get_efficiency_trend(period_days)
    
    # Calculate summary stats
    power_values = [p.get("value", p.get("avg", 0)) for p in power_trend if p.get("value", p.get("avg", 0)) > 0]
    efficiency_values = [e.get("value", e.get("avg", 0)) for e in efficiency_trend if e.get("value", e.get("avg", 0)) > 0]
    
    return {
        "period": period,
        "power": {
            "total_kwh": sum(power_values) / 1000 if power_values else 0,
            "avg_kw": sum(power_values) / len(power_values) / 1000 if power_values else 0,
            "peak_kw": max(power_values) / 1000 if power_values else 0,
        },
        "efficiency": {
            "avg": sum(efficiency_values) / len(efficiency_values) if efficiency_values else 0,
            "min": min(efficiency_values) if efficiency_values else 0,
            "max": max(efficiency_values) if efficiency_values else 0,
        },
        "data_points": len(power_trend)
    }


# === Alerts History ===

@router.get("/alerts")
async def get_alerts_history(
    panel_id: Optional[str] = None,
    severity: Optional[str] = Query(None, description="Filter by severity: critical, warning, info"),
    limit: int = Query(50, le=500)
):
    """Get alert history"""
    alerts = await timeseries_db.get_alerts_history(
        panel_id=panel_id,
        severity=severity,
        limit=limit
    )
    
    return {
        "count": len(alerts),
        "filters": {
            "panel_id": panel_id,
            "severity": severity
        },
        "alerts": alerts
    }


class ResolveAlertRequest(BaseModel):
    resolved_by: str


@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    request: ResolveAlertRequest
):
    """Mark an alert as resolved"""
    success = await timeseries_db.resolve_alert(
        alert_id=alert_id,
        resolved_by=request.resolved_by
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to resolve alert")
    
    return {"status": "resolved", "alert_id": alert_id}


# === Analysis History ===

@router.get("/analysis")
async def get_analysis_history(
    panel_id: Optional[str] = None,
    analysis_type: Optional[str] = Query(None, description="Filter: thermal, visual, el"),
    limit: int = Query(20, le=100)
):
    """Get AI analysis history"""
    history = await timeseries_db.get_analysis_history(
        panel_id=panel_id,
        analysis_type=analysis_type,
        limit=limit
    )
    
    return {
        "count": len(history),
        "analysis": history
    }


# === Helper Functions ===

def _parse_period(period: str) -> int:
    """Parse period string to days"""
    period = period.lower().strip()
    
    if period.endswith("d"):
        return int(period[:-1])
    elif period.endswith("w"):
        return int(period[:-1]) * 7
    elif period.endswith("m"):
        return int(period[:-1]) * 30
    elif period.endswith("y"):
        return int(period[:-1]) * 365
    else:
        try:
            return int(period)
        except ValueError:
            return 7  # Default 7 days
