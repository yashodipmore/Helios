from pydantic import BaseModel
from typing import Optional


class VirtualELResult(BaseModel):
    image_url: Optional[str] = None
    defects_detected: bool
    defect_count: int = 0
    confidence: float
    processing_time: float


class ThermalDiagnosisResult(BaseModel):
    diagnosis: str
    severity: str
    confidence: float
    hot_spots: int = 0
    max_temperature: Optional[float] = None
    processing_time: float


class RootCauseResult(BaseModel):
    root_cause: str
    confidence: float
    reasoning: str
    action: str
    priority: str
    estimated_cost: int
    processing_time: float


class FullAnalysisResult(BaseModel):
    panel_id: str
    virtual_el: VirtualELResult
    thermal_diagnosis: ThermalDiagnosisResult
    root_cause_analysis: RootCauseResult
    total_time_seconds: float
