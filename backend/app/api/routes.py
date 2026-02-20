import time
from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.database.firebase import firebase_client
from app.services.ai_service import ai_service
from app.services.chatbot_service import chatbot_service
from app.services.email_service import email_service
from app.utils.image_processing import generate_thermal_image
from app.utils.logger import logger

router = APIRouter()


# ─── Pydantic Models ─────────────────────────────────────
class ChatMessage(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None


class ChatResponse(BaseModel):
    response: str
    critical_panels: List[Dict]
    error: bool = False


class EmailAlertRequest(BaseModel):
    panel_id: str
    diagnosis: str
    power: float = 0
    temperature: float = 0
    zone: str = "Unknown"
    priority: str = "critical"
    estimated_cost: float = 0
    recommended_action: str = ""


# ─── Health ──────────────────────────────────────────────
@router.get("/")
async def health_check():
    return {"status": "online", "version": "1.0.0", "service": "HELIOS AI Backend"}


# ─── Panels ─────────────────────────────────────────────
@router.get("/api/panels")
async def get_all_panels(status: str = None, limit: int = 1000):
    panels = await firebase_client.get_all_panels()
    if status:
        panels = [p for p in panels if p.get("status") == status]
    return panels[:limit]


@router.get("/api/panels/{panel_id}")
async def get_panel(panel_id: str):
    panel = await firebase_client.get_panel(panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    return panel


@router.put("/api/panels/{panel_id}")
async def update_panel(panel_id: str, updates: dict):
    panel = await firebase_client.get_panel(panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    result = await firebase_client.update_panel(panel_id, updates)
    return {"message": "Panel updated", "panel_id": panel_id}


# ─── Alerts ──────────────────────────────────────────────
@router.get("/api/alerts")
async def get_alerts():
    return await firebase_client.get_all_alerts()


@router.post("/api/alerts")
async def create_alert(alert: dict):
    alert["timestamp"] = int(time.time() * 1000)
    alert["resolved"] = False
    result = await firebase_client.create_alert(alert)
    return {"message": "Alert created", "data": result}


@router.post("/api/alerts/{alert_id}/clear")
async def clear_alert(alert_id: str):
    """Clear/resolve an alert"""
    result = await firebase_client.update_alert(alert_id, {"resolved": True, "resolved_at": int(time.time() * 1000)})
    return {"message": "Alert cleared", "alert_id": alert_id}


@router.post("/api/panels/{panel_id}/clear-alert")
async def clear_panel_alert(panel_id: str):
    """Clear all alerts for a specific panel"""
    panel = await firebase_client.get_panel(panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    
    # Update panel status
    await firebase_client.update_panel(panel_id, {"status": "healthy", "alerts": []})
    return {"message": "Alerts cleared", "panel_id": panel_id}


# ─── Farm Statistics ─────────────────────────────────────
@router.get("/api/stats/farm-overview")
async def get_farm_stats():
    stats = await firebase_client.get_farm_stats()
    if stats:
        return stats

    # Compute from panels if farmStats not in DB
    panels = await firebase_client.get_all_panels()
    if not panels:
        return {
            "totalPanels": 0,
            "healthyCount": 0,
            "warningCount": 0,
            "criticalCount": 0,
            "totalPowerKw": 0,
            "avgEfficiency": 0,
        }

    healthy = sum(1 for p in panels if p.get("status") == "healthy")
    warning = sum(1 for p in panels if p.get("status") == "warning")
    critical = sum(1 for p in panels if p.get("status") == "critical")
    total_power = sum(p.get("power", 0) for p in panels) / 1000
    efficiencies = [p.get("efficiency", 0) for p in panels if p.get("efficiency")]
    avg_eff = sum(efficiencies) / len(efficiencies) if efficiencies else 0

    return {
        "totalPanels": len(panels),
        "healthyCount": healthy,
        "warningCount": warning,
        "criticalCount": critical,
        "totalPowerKw": round(total_power, 2),
        "avgEfficiency": round(avg_eff, 1),
    }


# ─── AI Analysis ────────────────────────────────────────
@router.post("/api/demo/analyze-panel/{panel_id}")
async def demo_analyze_panel(panel_id: str):
    panel = await firebase_client.get_panel(panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")

    try:
        result = await ai_service.full_analysis(panel_id)
        return result.model_dump()
    except Exception as e:
        logger.error(f"Analysis failed for {panel_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/api/analyze/virtual-el")
async def analyze_virtual_el(panel_id: str):
    from app.utils.image_processing import generate_virtual_el
    result = generate_virtual_el()
    return {
        "panel_id": panel_id,
        "image_url": f"data:image/png;base64,{result['image_base64']}" if result["image_base64"] else None,
        "defects_detected": result["defects_detected"],
        "defect_count": result["defect_count"],
        "confidence": result["confidence"],
    }


@router.post("/api/analyze/thermal-diagnosis")
async def analyze_thermal_diagnosis(panel_id: str):
    panel = await firebase_client.get_panel(panel_id)
    temp = panel.get("temperature", 52.0) if panel else 52.0
    from app.utils.image_processing import analyze_thermal
    result = analyze_thermal(temperature=temp)
    return {"panel_id": panel_id, **result}


@router.post("/api/analyze/root-cause")
async def analyze_root_cause(panel_id: str):
    panel = await firebase_client.get_panel(panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    from app.services.groq_client import groq_client
    result = await groq_client.analyze_root_cause(panel)
    return {"panel_id": panel_id, **result}


# ─── Advanced AI Endpoints ──────────────────────────────
@router.post("/api/ai/virtual-el/{panel_id}")
async def generate_virtual_el(panel_id: str):
    """
    Generate Virtual EL image using AI (HELIOS Innovation #1).
    Eliminates need for panel shutdown, darkness, and expensive cameras.
    """
    panel = await firebase_client.get_panel(panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    
    from app.services.virtual_el import virtual_el_service
    result = await virtual_el_service.generate_virtual_el(panel_data=panel)
    return {
        "panel_id": panel_id,
        "innovation": "Virtual EL Imaging",
        "description": "RGB to EL translation using AI - No panel shutdown required",
        **result
    }


@router.post("/api/ai/thermal-analysis/{panel_id}")
async def analyze_thermal_ai(panel_id: str):
    """
    AI-powered thermal analysis (IEC 62446-3 compliant).
    Uses Vision-Language model for intelligent diagnostics.
    """
    panel = await firebase_client.get_panel(panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    
    from app.services.thermal_analysis import thermal_service
    result = await thermal_service.analyze_thermal(panel_data=panel, use_vision_ai=True)
    return {
        "panel_id": panel_id,
        "iec_compliant": True,
        **result
    }


@router.post("/api/ai/vision-analysis/{panel_id}")
async def vision_language_analysis(panel_id: str):
    """
    Vision-Language Model analysis (HELIOS Innovation #2).
    Provides natural language explanations - Explainable AI.
    """
    panel = await firebase_client.get_panel(panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    
    from app.services.vision_ai import vision_ai
    from app.services.virtual_el import virtual_el_service
    
    # Generate image first
    el_result = await virtual_el_service.generate_virtual_el(panel_data=panel)
    
    # Analyze with Vision AI
    vision_result = await vision_ai.analyze_panel_image(
        el_result.get("image_base64", ""),
        analysis_type="visual"
    )
    
    # Generate natural language report
    report = await vision_ai.generate_natural_language_report(panel, vision_result)
    
    return {
        "panel_id": panel_id,
        "innovation": "Explainable AI",
        "description": "Vision-Language model provides operator-friendly diagnostics",
        "analysis": vision_result,
        "natural_language_report": report
    }


# ─── Real-Time Sensor Simulation ────────────────────────
@router.get("/api/sensors/{panel_id}/live")
async def get_live_sensor_data(panel_id: str):
    """
    Get real-time sensor readings (simulated for demo).
    In production, this would connect to actual IoT sensors.
    """
    panel = await firebase_client.get_panel(panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    
    from app.services.sensor_simulator import sensor_simulator
    reading = sensor_simulator.generate_panel_reading(
        panel_id=panel_id,
        status=panel.get("status", "healthy")
    )
    return reading


@router.get("/api/sensors/farm/live")
async def get_live_farm_data():
    """Get real-time farm-wide sensor data."""
    panels = await firebase_client.get_all_panels()
    
    from app.services.sensor_simulator import sensor_simulator
    
    readings = []
    for panel in panels:
        reading = sensor_simulator.generate_panel_reading(
            panel_id=panel.get("id", "unknown"),
            status=panel.get("status", "healthy")
        )
        readings.append(reading)
    
    stats = sensor_simulator.generate_farm_statistics(readings)
    return {
        "farm_stats": stats,
        "panel_count": len(readings),
        "panels": readings[:10]  # Return first 10 for preview
    }


# ─── Thermal Image Generation ───────────────────────────
@router.get("/api/panels/{panel_id}/thermal-image")
async def get_thermal_image(panel_id: str):
    panel = await firebase_client.get_panel(panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    
    from app.services.thermal_analysis import thermal_service
    result = await thermal_service.analyze_thermal(panel_data=panel, use_vision_ai=False)
    
    return {
        "panel_id": panel_id,
        "image_url": result.get("image_url"),
        "temperature": result.get("max_temperature_celsius"),
        "severity": result.get("severity"),
        "hot_spots": result.get("hot_spots_detected"),
    }


# ─── System Info ────────────────────────────────────────
@router.get("/api/system/capabilities")
async def get_system_capabilities():
    """Return HELIOS AI system capabilities for hackathon demo."""
    return {
        "name": "HELIOS AI",
        "version": "1.0.0",
        "tagline": "GenAI-Powered Oracle for Predictive Solar Farm Management",
        "innovations": [
            {
                "id": 1,
                "name": "Virtual EL Imaging",
                "description": "Generate EL-equivalent images from RGB photos using conditional GANs",
                "benefits": [
                    "No panel shutdown required",
                    "No complete darkness needed",
                    "Eliminates need for ₹5-10 lakh InGaAs cameras",
                    "96% faster detection"
                ],
                "endpoint": "/api/ai/virtual-el/{panel_id}"
            },
            {
                "id": 2,
                "name": "Explainable AI Diagnostics",
                "description": "Vision-Language Model provides natural language diagnostic explanations",
                "benefits": [
                    "Operator-friendly reports",
                    "70% reduction in training time",
                    "Transparent AI decision-making"
                ],
                "endpoint": "/api/ai/vision-analysis/{panel_id}"
            },
            {
                "id": 3,
                "name": "Multi-Modal Root Cause Analysis",
                "description": "LLM synthesizes electrical, visual, thermal, and environmental data",
                "benefits": [
                    "Prevents wrong diagnosis (#1 industry problem)",
                    "97% cost reduction vs traditional methods",
                    "Actionable recommendations with cost estimates"
                ],
                "endpoint": "/api/demo/analyze-panel/{panel_id}"
            }
        ],
        "ai_models": {
            "llm": "Groq LLaMA 3.3 70B Versatile",
            "image_analysis": "Advanced Computer Vision Pipeline (OpenCV + CLAHE)",
            "image_generation": "Physics-based Synthetic Generation"
        },
        "standards_compliance": [
            "IEC 62446-3 (Thermal Inspection)",
            "IEC 61215 (EL Imaging Reference)"
        ],
        "team": "Yashodip More, Tejas Patil, Jaykumar Girase, Komal Kumavat",
        "institution": "R.C. Patel Institute of Technology, Shirpur"
    }


# ─── Chatbot ─────────────────────────────────────────────
@router.post("/api/chat", response_model=ChatResponse)
async def chat_with_helios(chat_req: ChatMessage):
    """
    Chat with HELIOS AI Assistant about solar panel health and diagnostics.
    The assistant has full context of all panels in the farm.
    """
    result = await chatbot_service.chat(
        message=chat_req.message,
        conversation_history=chat_req.conversation_history
    )
    return ChatResponse(**result)


@router.get("/api/chat/summary")
async def get_chat_summary():
    """
    Get a quick summary of farm status for chat initialization.
    Returns critical panel count and basic metrics.
    """
    return await chatbot_service.get_quick_summary()


@router.get("/api/chat/panel/{panel_id}")
async def get_panel_for_chat(panel_id: str):
    """Get detailed panel info formatted for chat context."""
    detail = await chatbot_service.get_panel_detail(panel_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    return {"panel_id": panel_id, "detail": detail}


# ─── Email Alerts ────────────────────────────────────────
@router.post("/api/alerts/email")
async def send_email_alert(req: EmailAlertRequest):
    """
    Send critical panel alert via email.
    Requires SMTP configuration via environment variables:
    - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    - EMAIL_FROM, ALERT_EMAILS (comma-separated recipients)
    """
    if not email_service.is_configured():
        raise HTTPException(
            status_code=503, 
            detail="Email service not configured. Set SMTP environment variables."
        )
    
    success = await email_service.send_critical_alert(
        panel_id=req.panel_id,
        diagnosis=req.diagnosis,
        power=req.power,
        temperature=req.temperature,
        zone=req.zone,
        priority=req.priority,
        estimated_cost=req.estimated_cost,
        recommended_action=req.recommended_action
    )
    
    if success:
        return {"message": "Email alert sent successfully", "panel_id": req.panel_id}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email alert")


@router.post("/api/alerts/email/daily-summary")
async def send_daily_summary_email():
    """Send daily summary email with all panel statistics."""
    if not email_service.is_configured():
        raise HTTPException(
            status_code=503, 
            detail="Email service not configured"
        )
    
    panels = await firebase_client.get_all_panels()
    if not panels:
        raise HTTPException(status_code=404, detail="No panels found")
    
    critical = [p for p in panels if p.get("status") == "critical"]
    warning = [p for p in panels if p.get("status") == "warning"]
    healthy = [p for p in panels if p.get("status") == "healthy"]
    
    total_power = sum(p.get("power", 0) for p in panels) / 1000
    avg_eff = sum(p.get("efficiency", 0) for p in panels) / len(panels) if panels else 0
    
    success = await email_service.send_daily_summary(
        total_panels=len(panels),
        healthy_count=len(healthy),
        warning_count=len(warning),
        critical_count=len(critical),
        total_power_kw=total_power,
        avg_efficiency=avg_eff,
        critical_panels=critical
    )
    
    if success:
        return {"message": "Daily summary email sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send summary email")


@router.get("/api/alerts/email/status")
async def get_email_service_status():
    """Check if email service is configured."""
    return {
        "configured": email_service.is_configured(),
        "smtp_host": email_service.smtp_host,
        "recipients_count": len([r for r in email_service.alert_recipients if r])
    }

