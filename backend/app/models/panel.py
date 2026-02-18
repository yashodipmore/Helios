from pydantic import BaseModel
from typing import Optional
from enum import Enum


class PanelStatus(str, Enum):
    healthy = "healthy"
    warning = "warning"
    critical = "critical"


class Panel(BaseModel):
    id: str
    row: str
    position: int
    status: PanelStatus
    voltage: float
    current: float
    power: float
    temperature: float
    efficiency: float
    diagnosis: Optional[str] = None
    lastUpdate: Optional[int] = None


class PanelUpdate(BaseModel):
    voltage: Optional[float] = None
    current: Optional[float] = None
    power: Optional[float] = None
    temperature: Optional[float] = None
    status: Optional[PanelStatus] = None
    diagnosis: Optional[str] = None


class Alert(BaseModel):
    panelId: str
    severity: str
    message: str
    timestamp: int
    resolved: bool = False


class FarmStats(BaseModel):
    totalPanels: int
    healthyCount: int
    warningCount: int
    criticalCount: int
    totalPowerKw: float
    avgEfficiency: float
    lastUpdate: Optional[int] = None
