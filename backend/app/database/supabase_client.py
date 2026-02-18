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
