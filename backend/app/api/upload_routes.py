"""
HELIOS AI - Image Upload & Analysis API Routes
Supports: Thermal images, Panel RGB photos, EL images
"""
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
import logging

from ..services.gemini_vision import gemini_vision, VisionAnalysisResult
from ..database.supabase_client import supabase_client

logger = logging.getLogger("helios")

router = APIRouter(prefix="/api/upload", tags=["Image Upload"])


class AnalysisResponse(BaseModel):
    """Response model for image analysis"""
    success: bool
    panel_id: Optional[str]
    analysis_type: str
    image_url: Optional[str]
    health_score: float
    confidence: float
    defects: list
    description: str
    recommendations: list
    timestamp: str


class ImageStorageService:
    """
    Store images to Supabase Storage or local filesystem.
    Falls back to local storage if Supabase is unavailable.
    """
    
    def __init__(self):
        self.storage_path = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads')
        os.makedirs(self.storage_path, exist_ok=True)
    
    async def store_image(
        self, 
        image_data: bytes, 
        filename: str,
        folder: str = "analysis"
    ) -> str:
        """
        Store image and return URL/path.
        
        Args:
            image_data: Raw image bytes
            filename: Original filename
            folder: Storage folder (thermal, panel, el)
            
        Returns:
            URL or path to stored image
        """
        # Generate unique filename
        ext = filename.split('.')[-1] if '.' in filename else 'jpg'
        unique_name = f"{folder}/{uuid.uuid4()}.{ext}"
        
        try:
            # Try Supabase storage first
            if supabase_client and hasattr(supabase_client, 'upload_image'):
                url = await supabase_client.upload_image(image_data, unique_name)
                if url:
                    return url
        except Exception as e:
            logger.warning(f"Supabase storage failed: {e}")
        
        # Fallback to local storage
        local_path = os.path.join(self.storage_path, unique_name)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        with open(local_path, 'wb') as f:
            f.write(image_data)
        
        logger.info(f"Image stored locally: {local_path}")
        return f"/uploads/{unique_name}"


# Service instance
image_storage = ImageStorageService()


@router.post("/thermal-image", response_model=AnalysisResponse)
async def upload_thermal_image(
    file: UploadFile = File(...),
    panel_id: Optional[str] = Form(None)
):
    """
    Upload and analyze a thermal image.
    
    - **file**: Thermal image file (JPEG, PNG)
    - **panel_id**: Optional panel identifier for context
    
    Returns thermal analysis with hotspot detection per IEC 62446-3.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read image data
    image_data = await file.read()
    
    if len(image_data) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")
    
    # Store image
    image_url = await image_storage.store_image(image_data, file.filename or "thermal.jpg", "thermal")
    
    # Analyze with Gemini Vision
    result: VisionAnalysisResult = await gemini_vision.analyze_thermal_image(
        image_data=image_data,
        panel_id=panel_id
    )
    
    # Save analysis result to database
    try:
        await supabase_client.save_analysis_result(
            panel_id=panel_id or "unknown",
            analysis_type="thermal",
            result=result.__dict__
        )
    except Exception as e:
        logger.warning(f"Failed to save analysis result: {e}")
    
    return AnalysisResponse(
        success=True,
        panel_id=panel_id,
        analysis_type="thermal",
        image_url=image_url,
        health_score=result.health_score,
        confidence=result.confidence,
        defects=result.defects,
        description=result.description,
        recommendations=result.recommendations,
        timestamp=datetime.utcnow().isoformat()
    )


@router.post("/panel-image", response_model=AnalysisResponse)
async def upload_panel_image(
    file: UploadFile = File(...),
    panel_id: Optional[str] = Form(None)
):
    """
    Upload and analyze an RGB panel image.
    
    - **file**: Panel photo (JPEG, PNG)
    - **panel_id**: Optional panel identifier
    
    Returns visual defect analysis including cracks, soiling, discoloration.
    """
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    image_data = await file.read()
    
    if len(image_data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")
    
    # Store image
    image_url = await image_storage.store_image(image_data, file.filename or "panel.jpg", "panel")
    
    # Analyze
    result = await gemini_vision.analyze_panel_image(
        image_data=image_data,
        panel_id=panel_id
    )
    
    # Save result
    try:
        await supabase_client.save_analysis_result(
            panel_id=panel_id or "unknown",
            analysis_type="visual",
            result=result.__dict__
        )
    except Exception as e:
        logger.warning(f"Failed to save analysis result: {e}")
    
    return AnalysisResponse(
        success=True,
        panel_id=panel_id,
        analysis_type="visual",
        image_url=image_url,
        health_score=result.health_score,
        confidence=result.confidence,
        defects=result.defects,
        description=result.description,
        recommendations=result.recommendations,
        timestamp=datetime.utcnow().isoformat()
    )


@router.post("/el-image", response_model=AnalysisResponse)
async def upload_el_image(
    file: UploadFile = File(...),
    panel_id: Optional[str] = Form(None)
):
    """
    Upload and analyze an Electroluminescence (EL) image.
    
    - **file**: EL image file (JPEG, PNG)
    - **panel_id**: Optional panel identifier
    
    Returns cell-level defect analysis including microcracks, inactive cells.
    """
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    image_data = await file.read()
    
    if len(image_data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")
    
    # Store image
    image_url = await image_storage.store_image(image_data, file.filename or "el.jpg", "el")
    
    # Analyze
    result = await gemini_vision.analyze_el_image(
        image_data=image_data,
        panel_id=panel_id
    )
    
    # Save result
    try:
        await supabase_client.save_analysis_result(
            panel_id=panel_id or "unknown",
            analysis_type="el",
            result=result.__dict__
        )
    except Exception as e:
        logger.warning(f"Failed to save analysis result: {e}")
    
    return AnalysisResponse(
        success=True,
        panel_id=panel_id,
        analysis_type="el",
        image_url=image_url,
        health_score=result.health_score,
        confidence=result.confidence,
        defects=result.defects,
        description=result.description,
        recommendations=result.recommendations,
        timestamp=datetime.utcnow().isoformat()
    )


@router.get("/history/{panel_id}")
async def get_analysis_history(panel_id: str, limit: int = 10):
    """
    Get analysis history for a specific panel.
    
    - **panel_id**: Panel identifier
    - **limit**: Maximum number of results (default: 10)
    """
    try:
        history = await supabase_client.get_analysis_history(panel_id, limit)
        return {"success": True, "panel_id": panel_id, "history": history}
    except Exception as e:
        logger.error(f"Failed to fetch history: {e}")
        return {"success": False, "panel_id": panel_id, "history": [], "error": str(e)}
