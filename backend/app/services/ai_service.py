"""
HELIOS AI - Comprehensive AI Analysis Service
Orchestrates all AI components for multi-modal solar panel diagnostics.

This is the core intelligence layer that combines:
1. Virtual EL Generation (RGB → EL via AI)
2. Thermal Image Analysis (IEC 62446-3 compliant)
3. Vision-Language Model Analysis (Explainable AI)
4. LLM Root Cause Analysis (Multi-modal Fusion)
"""
import time
import asyncio
from typing import Optional, Dict, Any

from app.services.virtual_el import virtual_el_service
from app.services.thermal_analysis import thermal_service
from app.services.vision_ai import vision_ai
from app.services.groq_client import groq_client
from app.database.firebase import firebase_client
from app.database.supabase_client import save_ai_result
from app.models.diagnosis import VirtualELResult, ThermalDiagnosisResult, RootCauseResult, FullAnalysisResult
from app.utils.logger import logger


class AIService:
    """
    HELIOS AI Core Analysis Engine
    
    Implements the three breakthrough innovations:
    1. Virtual EL Imaging - Generate EL from RGB
    2. Explainable AI Diagnostics - Vision-Language model
    3. Multi-Modal Root Cause Analysis - LLM synthesis
    """
    
    async def full_analysis(self, panel_id: str, include_images: bool = True) -> FullAnalysisResult:
        """Execute complete multi-modal AI analysis pipeline."""
        total_start = time.time()
        logger.info(f"Starting full AI analysis for panel {panel_id}")
        
        panel_data = await firebase_client.get_panel(panel_id)
        if not panel_data:
            raise ValueError(f"Panel {panel_id} not found")
        
        # PHASE 1: Parallel image analysis
        el_task = asyncio.create_task(self._virtual_el_analysis(panel_data, include_images))
        thermal_task = asyncio.create_task(self._thermal_analysis(panel_data, include_images))
        el_result, thermal_result = await asyncio.gather(el_task, thermal_task)
        
        # PHASE 2: Root cause analysis with enriched data
        enriched_data = self._enrich_panel_data(panel_data, el_result, thermal_result)
        root_cause = await self._root_cause_analysis(enriched_data)
        
        total_time = round(time.time() - total_start, 2)
        
        result = FullAnalysisResult(
            panel_id=panel_id,
            virtual_el=el_result,
            thermal_diagnosis=thermal_result,
            root_cause_analysis=root_cause,
            total_time_seconds=total_time,
        )
        
        # Background tasks
        asyncio.create_task(self._save_results(panel_id, result))
        asyncio.create_task(self._update_panel_status(panel_id, root_cause))
        
        return result
    
    async def _virtual_el_analysis(self, panel_data: dict, include_image: bool = True) -> VirtualELResult:
        """Generate and analyze Virtual EL image using AI."""
        start = time.time()
        
        try:
            result = await virtual_el_service.generate_virtual_el(
                rgb_image_base64=None,
                panel_data=panel_data
            )
            elapsed = round(time.time() - start, 2)
            
            return VirtualELResult(
                image_url=result.get("image_url") if include_image else None,
                defects_detected=result.get("defects_detected", False),
                defect_count=result.get("defect_count", 0),
                confidence=result.get("confidence", 0.85),
                processing_time=elapsed,
            )
        except Exception as e:
            logger.error(f"Virtual EL analysis failed: {e}")
            return VirtualELResult(
                image_url=None,
                defects_detected=False,
                defect_count=0,
                confidence=0.5,
                processing_time=round(time.time() - start, 2),
            )
    
    async def _thermal_analysis(self, panel_data: dict, include_image: bool = True) -> ThermalDiagnosisResult:
        """Perform thermal image analysis (IEC 62446-3 compliant)."""
        start = time.time()
        
        try:
            result = await thermal_service.analyze_thermal(
                thermal_image_base64=None,
                panel_data=panel_data,
                use_vision_ai=True
            )
            elapsed = round(time.time() - start, 2)
            
            return ThermalDiagnosisResult(
                diagnosis=result.get("diagnosis", "Analysis unavailable"),
                severity=result.get("severity", "unknown"),
                confidence=result.get("confidence", 0.5),
                hot_spots=result.get("hot_spots_detected", 0),
                max_temperature=result.get("max_temperature_celsius", panel_data.get("temperature", 52)),
                processing_time=elapsed,
            )
        except Exception as e:
            logger.error(f"Thermal analysis failed: {e}")
            temp = panel_data.get("temperature", 52)
            return ThermalDiagnosisResult(
                diagnosis=f"Analysis error at {temp}°C",
                severity="unknown",
                confidence=0.5,
                hot_spots=0,
                max_temperature=temp,
                processing_time=round(time.time() - start, 2),
            )
    
    async def _root_cause_analysis(self, panel_data: dict) -> RootCauseResult:
        """LLM-powered multi-modal root cause analysis."""
        start = time.time()
        
        try:
            result = await groq_client.analyze_root_cause(panel_data)
            elapsed = round(time.time() - start, 2)
            
            return RootCauseResult(
                root_cause=result.get("root_cause", "Analysis unavailable"),
                confidence=result.get("confidence", 0.5),
                reasoning=result.get("reasoning", ""),
                action=result.get("action", "Manual inspection recommended"),
                priority=result.get("priority", "medium"),
                estimated_cost=result.get("estimated_cost", 0),
                processing_time=elapsed,
            )
        except Exception as e:
            logger.error(f"Root cause analysis failed: {e}")
            return RootCauseResult(
                root_cause="Analysis failed",
                confidence=0.3,
                reasoning=str(e),
                action="Manual inspection required",
                priority="medium",
                estimated_cost=0,
                processing_time=round(time.time() - start, 2),
            )
    
    def _enrich_panel_data(self, panel_data: dict, el_result: VirtualELResult, thermal_result: ThermalDiagnosisResult) -> dict:
        """Enrich panel data with analysis results for LLM."""
        enriched = panel_data.copy()
        
        if el_result.defects_detected:
            enriched["el_result"] = f"DEFECTS DETECTED: {el_result.defect_count} anomalies. Confidence: {el_result.confidence:.0%}"
        else:
            enriched["el_result"] = f"No defects detected. Confidence: {el_result.confidence:.0%}"
        
        enriched["thermal_result"] = f"{thermal_result.diagnosis} Hot spots: {thermal_result.hot_spots}, Max: {thermal_result.max_temperature}°C"
        
        return enriched
    
    async def _save_results(self, panel_id: str, result: FullAnalysisResult):
        """Save analysis results to Supabase."""
        try:
            await save_ai_result(
                panel_id=panel_id,
                analysis_type="full_multimodal_analysis",
                result_data=result.model_dump(),
                confidence=result.root_cause_analysis.confidence,
            )
        except Exception as e:
            logger.warning(f"Failed to save results: {e}")
    
    async def _update_panel_status(self, panel_id: str, root_cause: RootCauseResult):
        """Update panel status in Firebase."""
        try:
            status_map = {"critical": "critical", "high": "warning", "medium": "warning", "low": "healthy"}
            new_status = status_map.get(root_cause.priority, "healthy")
            
            await firebase_client.update_panel(panel_id, {
                "diagnosis": f"{root_cause.root_cause} ({int(root_cause.confidence * 100)}% confidence)",
                "status": new_status,
                "lastUpdate": int(time.time() * 1000),
            })
        except Exception as e:
            logger.warning(f"Failed to update panel status: {e}")


ai_service = AIService()
