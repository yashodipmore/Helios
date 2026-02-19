"""
HELIOS AI - Hardware API Routes
REST endpoints for sensor and camera operations.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.hardware import sensor_manager, camera_manager
from app.hardware.sensor_interface import SensorType, PanelSensorData
from app.hardware.camera_interface import CameraType

router = APIRouter(prefix="/api/hardware", tags=["Hardware"])


# === Sensor Endpoints ===

@router.get("/sensors/status")
async def get_sensor_status():
    """Get sensor system status"""
    return {
        "mode": sensor_manager.mode.value,
        "initialized": sensor_manager.is_initialized,
        "adapter": str(sensor_manager.adapter) if sensor_manager.adapter else None
    }


@router.get("/sensors/panels", response_model=List[str])
async def list_panels():
    """Get list of all panel IDs"""
    return await sensor_manager.get_panel_ids()


@router.get("/sensors/panels/all")
async def get_all_panel_data():
    """Get sensor data for all panels"""
    panels = await sensor_manager.read_all_panels()
    return [p.to_dict() for p in panels]


@router.get("/sensors/panels/{panel_id}")
async def get_panel_data(panel_id: str):
    """Get sensor data for specific panel"""
    data = await sensor_manager.read_panel(panel_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    return data.to_dict()


@router.get("/sensors/panels/{panel_id}/{sensor_type}")
async def get_sensor_reading(
    panel_id: str,
    sensor_type: str
):
    """Get specific sensor reading for a panel"""
    try:
        st = SensorType(sensor_type)
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid sensor type: {sensor_type}. Valid types: {[s.value for s in SensorType]}"
        )
    
    reading = await sensor_manager.read_sensor(panel_id, st)
    if not reading:
        raise HTTPException(status_code=404, detail="Sensor reading not available")
    return reading.to_dict()


@router.get("/sensors/health")
async def get_sensor_health():
    """Get health status of all sensors"""
    health = await sensor_manager.check_health()
    return {k: v.value for k, v in health.items()}


# === Demo Control Endpoints (Mock Mode Only) ===

@router.post("/sensors/demo/fault")
async def inject_demo_fault(
    panel_id: str,
    fault_type: str,
    severity: float = 0.7
):
    """Inject a fault for demo purposes (mock mode only)"""
    success = sensor_manager.inject_fault(panel_id, fault_type, severity)
    if not success:
        raise HTTPException(
            status_code=400, 
            detail="Failed to inject fault. Check panel_id and fault_type."
        )
    return {"status": "ok", "message": f"Fault '{fault_type}' injected on {panel_id}"}


@router.delete("/sensors/demo/fault/{panel_id}")
async def clear_demo_fault(panel_id: str):
    """Clear a fault from a panel (mock mode only)"""
    success = sensor_manager.clear_fault(panel_id)
    return {"status": "ok", "cleared": success}


@router.get("/sensors/demo/faults")
async def get_demo_faults():
    """Get all active demo faults"""
    return sensor_manager.get_all_faults()


@router.post("/sensors/demo/weather")
async def set_demo_weather(
    cloud_cover: Optional[float] = None,
    ambient_temp: Optional[float] = None,
    humidity: Optional[float] = None
):
    """Set weather conditions for demo"""
    sensor_manager.set_weather(
        cloud_cover=cloud_cover,
        ambient_temp=ambient_temp,
        humidity=humidity
    )
    return {"status": "ok"}


# === Camera Endpoints ===

@router.get("/cameras/status")
async def get_camera_status():
    """Get camera system status"""
    status = await camera_manager.get_status()
    return {
        "mode": camera_manager.mode.value,
        "initialized": camera_manager.is_initialized,
        "camera_id": status.camera_id,
        "camera_type": status.camera_type.value,
        "is_online": status.is_online
    }


@router.get("/cameras/list")
async def list_cameras():
    """List all available cameras"""
    cameras = await camera_manager.list_cameras()
    return [
        {
            "camera_id": c.camera_id,
            "type": c.camera_type.value,
            "is_online": c.is_online,
            "firmware": c.firmware_version
        }
        for c in cameras
    ]


@router.post("/cameras/capture/thermal")
async def capture_thermal_image(panel_id: Optional[str] = None):
    """Capture thermal image"""
    image = await camera_manager.capture_thermal(panel_id)
    if not image:
        raise HTTPException(status_code=500, detail="Failed to capture thermal image")
    
    return {
        "panel_id": image.panel_id,
        "timestamp": image.timestamp.isoformat(),
        "resolution": f"{image.width}x{image.height}",
        "min_temp": image.min_temp,
        "max_temp": image.max_temp,
        "avg_temp": image.avg_temp,
        "metadata": image.metadata,
        "image_base64": image.to_base64() if image.image_data else None
    }


@router.post("/cameras/capture/visual")
async def capture_visual_image(panel_id: Optional[str] = None):
    """Capture visual image"""
    image = await camera_manager.capture_visual(panel_id)
    if not image:
        raise HTTPException(status_code=500, detail="Failed to capture visual image")
    
    return {
        "panel_id": image.panel_id,
        "timestamp": image.timestamp.isoformat(),
        "resolution": f"{image.width}x{image.height}",
        "metadata": image.metadata,
        "image_base64": image.to_base64() if image.image_data else None
    }


@router.post("/cameras/capture/el")
async def capture_el_image(panel_id: Optional[str] = None):
    """Capture electroluminescence image"""
    image = await camera_manager.capture_el(panel_id)
    if not image:
        raise HTTPException(status_code=500, detail="Failed to capture EL image")
    
    return {
        "panel_id": image.panel_id,
        "timestamp": image.timestamp.isoformat(),
        "resolution": f"{image.width}x{image.height}",
        "metadata": image.metadata,
        "image_base64": image.to_base64() if image.image_data else None
    }


@router.post("/cameras/analyze/thermal")
async def capture_and_analyze_thermal(panel_id: Optional[str] = None):
    """Capture thermal image and perform hotspot analysis"""
    image = await camera_manager.capture_thermal(panel_id)
    if not image or not image.temperature_data:
        raise HTTPException(status_code=500, detail="Failed to capture thermal image")
    
    # Analyze thermal data
    hotspots = camera_manager.find_hotspots(image.temperature_data)
    uniformity = camera_manager.calculate_uniformity(image.temperature_data)
    
    return {
        "panel_id": image.panel_id,
        "timestamp": image.timestamp.isoformat(),
        "temperature": {
            "min": image.min_temp,
            "max": image.max_temp,
            "avg": image.avg_temp,
            "uniformity": uniformity
        },
        "analysis": {
            "hotspot_count": len(hotspots),
            "hotspots": hotspots[:10],  # Limit to top 10
            "status": "critical" if len(hotspots) > 3 else "warning" if hotspots else "nominal"
        }
    }


# === Mode Switching ===

@router.post("/mode/sensors")
async def switch_sensor_mode(mode: str):
    """Switch sensor adapter mode"""
    from app.hardware.sensor_manager import AdapterMode
    
    mode_map = {
        "mock": AdapterMode.MOCK,
        "mqtt": AdapterMode.MQTT
    }
    
    if mode.lower() not in mode_map:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {mode}")
    
    success = await sensor_manager.switch_mode(mode_map[mode.lower()])
    return {"status": "ok" if success else "error", "mode": sensor_manager.mode.value}


@router.post("/mode/cameras")
async def switch_camera_mode(mode: str):
    """Switch camera adapter mode"""
    from app.hardware.camera_manager import CameraMode
    
    mode_map = {
        "mock": CameraMode.MOCK
    }
    
    if mode.lower() not in mode_map:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {mode}")
    
    success = await camera_manager.switch_mode(mode_map[mode.lower()])
    return {"status": "ok" if success else "error", "mode": camera_manager.mode.value}
