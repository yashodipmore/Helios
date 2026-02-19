"""
HELIOS AI - Work Orders API
Manage maintenance work orders and tasks.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from enum import Enum
import uuid

router = APIRouter(prefix="/api/work-orders", tags=["Work Orders"])


class WorkOrderStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class WorkOrderPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class WorkOrderType(str, Enum):
    INSPECTION = "inspection"
    CLEANING = "cleaning"
    REPAIR = "repair"
    REPLACEMENT = "replacement"
    CALIBRATION = "calibration"


# In-memory storage (replace with database in production)
_work_orders: dict = {}


class CreateWorkOrderRequest(BaseModel):
    panel_id: str
    title: str
    description: Optional[str] = None
    work_type: WorkOrderType = WorkOrderType.INSPECTION
    priority: WorkOrderPriority = WorkOrderPriority.MEDIUM
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None


class UpdateWorkOrderRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[WorkOrderStatus] = None
    priority: Optional[WorkOrderPriority] = None
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None


@router.post("")
async def create_work_order(request: CreateWorkOrderRequest):
    """Create a new work order"""
    order_id = str(uuid.uuid4())[:8].upper()
    
    work_order = {
        "id": order_id,
        "panel_id": request.panel_id,
        "title": request.title,
        "description": request.description,
        "work_type": request.work_type.value,
        "priority": request.priority.value,
        "status": WorkOrderStatus.PENDING.value,
        "assigned_to": request.assigned_to,
        "due_date": request.due_date,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "completed_at": None,
        "notes": []
    }
    
    _work_orders[order_id] = work_order
    
    return {"status": "created", "work_order": work_order}


@router.get("")
async def list_work_orders(
    status: Optional[WorkOrderStatus] = None,
    priority: Optional[WorkOrderPriority] = None,
    panel_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    limit: int = Query(50, le=200)
):
    """List all work orders with optional filters"""
    orders = list(_work_orders.values())
    
    if status:
        orders = [o for o in orders if o["status"] == status.value]
    if priority:
        orders = [o for o in orders if o["priority"] == priority.value]
    if panel_id:
        orders = [o for o in orders if o["panel_id"] == panel_id]
    if assigned_to:
        orders = [o for o in orders if o["assigned_to"] == assigned_to]
    
    # Sort by priority and created_at
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    orders.sort(key=lambda x: (priority_order.get(x["priority"], 2), x["created_at"]))
    
    return {
        "count": len(orders),
        "work_orders": orders[:limit]
    }


@router.get("/{order_id}")
async def get_work_order(order_id: str):
    """Get a specific work order"""
    if order_id not in _work_orders:
        raise HTTPException(status_code=404, detail=f"Work order {order_id} not found")
    
    return _work_orders[order_id]


@router.put("/{order_id}")
async def update_work_order(order_id: str, request: UpdateWorkOrderRequest):
    """Update a work order"""
    if order_id not in _work_orders:
        raise HTTPException(status_code=404, detail=f"Work order {order_id} not found")
    
    order = _work_orders[order_id]
    
    if request.title:
        order["title"] = request.title
    if request.description:
        order["description"] = request.description
    if request.status:
        order["status"] = request.status.value
    if request.priority:
        order["priority"] = request.priority.value
    if request.assigned_to:
        order["assigned_to"] = request.assigned_to
    if request.due_date:
        order["due_date"] = request.due_date
    if request.notes:
        order["notes"].append({
            "text": request.notes,
            "added_at": datetime.utcnow().isoformat()
        })
    
    order["updated_at"] = datetime.utcnow().isoformat()
    
    return {"status": "updated", "work_order": order}


@router.post("/{order_id}/complete")
async def complete_work_order(order_id: str, notes: Optional[str] = None):
    """Mark a work order as completed"""
    if order_id not in _work_orders:
        raise HTTPException(status_code=404, detail=f"Work order {order_id} not found")
    
    order = _work_orders[order_id]
    order["status"] = WorkOrderStatus.COMPLETED.value
    order["completed_at"] = datetime.utcnow().isoformat()
    order["updated_at"] = datetime.utcnow().isoformat()
    
    if notes:
        order["notes"].append({
            "text": f"Completed: {notes}",
            "added_at": datetime.utcnow().isoformat()
        })
    
    return {"status": "completed", "work_order": order}


@router.post("/{order_id}/cancel")
async def cancel_work_order(order_id: str, reason: Optional[str] = None):
    """Cancel a work order"""
    if order_id not in _work_orders:
        raise HTTPException(status_code=404, detail=f"Work order {order_id} not found")
    
    order = _work_orders[order_id]
    order["status"] = WorkOrderStatus.CANCELLED.value
    order["updated_at"] = datetime.utcnow().isoformat()
    
    if reason:
        order["notes"].append({
            "text": f"Cancelled: {reason}",
            "added_at": datetime.utcnow().isoformat()
        })
    
    return {"status": "cancelled", "work_order": order}


@router.delete("/{order_id}")
async def delete_work_order(order_id: str):
    """Delete a work order"""
    if order_id not in _work_orders:
        raise HTTPException(status_code=404, detail=f"Work order {order_id} not found")
    
    del _work_orders[order_id]
    
    return {"status": "deleted", "order_id": order_id}


# === Panel Maintenance Endpoints ===

@router.post("/panels/{panel_id}/mark-maintenance")
async def mark_panel_maintenance(
    panel_id: str,
    work_type: WorkOrderType = WorkOrderType.INSPECTION,
    description: Optional[str] = None
):
    """Create a maintenance work order for a panel"""
    order_id = str(uuid.uuid4())[:8].upper()
    
    work_order = {
        "id": order_id,
        "panel_id": panel_id,
        "title": f"{work_type.value.title()} - Panel {panel_id}",
        "description": description or f"Scheduled {work_type.value} for panel {panel_id}",
        "work_type": work_type.value,
        "priority": WorkOrderPriority.MEDIUM.value,
        "status": WorkOrderStatus.PENDING.value,
        "assigned_to": None,
        "due_date": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "completed_at": None,
        "notes": []
    }
    
    _work_orders[order_id] = work_order
    
    return {
        "status": "maintenance_scheduled",
        "panel_id": panel_id,
        "work_order": work_order
    }


# === Statistics ===

@router.get("/stats/summary")
async def get_work_order_stats():
    """Get work order statistics"""
    orders = list(_work_orders.values())
    
    stats = {
        "total": len(orders),
        "by_status": {},
        "by_priority": {},
        "by_type": {},
        "overdue": 0
    }
    
    now = datetime.utcnow().isoformat()
    
    for order in orders:
        # By status
        status = order["status"]
        stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
        
        # By priority
        priority = order["priority"]
        stats["by_priority"][priority] = stats["by_priority"].get(priority, 0) + 1
        
        # By type
        work_type = order["work_type"]
        stats["by_type"][work_type] = stats["by_type"].get(work_type, 0) + 1
        
        # Overdue
        if order["due_date"] and order["due_date"] < now and order["status"] not in ["completed", "cancelled"]:
            stats["overdue"] += 1
    
    return stats
