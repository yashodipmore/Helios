import os
from app.utils.logger import logger

supabase_client = None


def get_supabase():
    global supabase_client
    if supabase_client:
        return supabase_client
    try:
        from supabase import create_client

        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        if url and key:
            supabase_client = create_client(url, key)
            logger.info("Supabase client ready")
        else:
            logger.warning("Supabase credentials missing, skipping")
    except Exception as e:
        logger.warning(f"Supabase init skipped: {e}")
    return supabase_client


async def save_ai_result(panel_id: str, analysis_type: str, result_data: dict, confidence: float):
    client = get_supabase()
    if not client:
        return None
    try:
        resp = client.table("ai_results").insert({
            "panel_id": panel_id,
            "analysis_type": analysis_type,
            "result_data": result_data,
            "confidence": confidence,
        }).execute()
        return resp.data
    except Exception as e:
        logger.warning(f"Supabase save skipped: {e}")
        return None


async def save_work_order(panel_id: str, issue_type: str, priority: str, diagnosis: str, action: str, cost: int):
    client = get_supabase()
    if not client:
        return None
    try:
        resp = client.table("work_orders").insert({
            "panel_id": panel_id,
            "issue_type": issue_type,
            "priority": priority,
            "diagnosis": diagnosis,
            "action_required": action,
            "estimated_cost": cost,
        }).execute()
        return resp.data
    except Exception as e:
        logger.warning(f"Supabase work order skipped: {e}")
        return None


async def save_analysis_result(panel_id: str, analysis_type: str, result: dict):
    """Save image analysis result to Supabase."""
    client = get_supabase()
    if not client:
        logger.warning("Supabase not available - analysis result not saved")
        return None
    try:
        resp = client.table("analysis_history").insert({
            "panel_id": panel_id,
            "analysis_type": analysis_type,
            "health_score": result.get("health_score", 0),
            "confidence": result.get("confidence", 0),
            "defects": result.get("defects", []),
            "description": result.get("description", ""),
            "recommendations": result.get("recommendations", []),
        }).execute()
        logger.info(f"Analysis result saved for panel {panel_id}")
        return resp.data
    except Exception as e:
        logger.warning(f"Failed to save analysis result: {e}")
        return None


async def get_analysis_history(panel_id: str, limit: int = 10):
    """Get analysis history for a panel."""
    client = get_supabase()
    if not client:
        return []
    try:
        resp = client.table("analysis_history").select("*").eq(
            "panel_id", panel_id
        ).order("created_at", desc=True).limit(limit).execute()
        return resp.data or []
    except Exception as e:
        logger.warning(f"Failed to fetch analysis history: {e}")
        return []


async def upload_image(image_data: bytes, path: str) -> str:
    """Upload image to Supabase Storage."""
    client = get_supabase()
    if not client:
        return None
    try:
        # Upload to storage bucket
        resp = client.storage.from_("helios-images").upload(
            path=path,
            file=image_data,
            file_options={"content-type": "image/jpeg"}
        )
        # Get public URL
        url = client.storage.from_("helios-images").get_public_url(path)
        logger.info(f"Image uploaded to Supabase: {path}")
        return url
    except Exception as e:
        logger.warning(f"Supabase image upload failed: {e}")
        return None


class SupabaseClientWrapper:
    """Wrapper class for Supabase operations."""
    
    async def save_analysis_result(self, panel_id: str, analysis_type: str, result: dict):
        return await save_analysis_result(panel_id, analysis_type, result)
    
    async def get_analysis_history(self, panel_id: str, limit: int = 10):
        return await get_analysis_history(panel_id, limit)
    
    async def upload_image(self, image_data: bytes, path: str) -> str:
        return await upload_image(image_data, path)
    
    async def save_work_order(self, panel_id: str, issue_type: str, priority: str, diagnosis: str, action: str, cost: int):
        return await save_work_order(panel_id, issue_type, priority, diagnosis, action, cost)


# Create singleton instance
supabase_client = SupabaseClientWrapper()
