"""
HELIOS AI - Solar Panel Chatbot Service
Provides context-aware conversation about solar panel health and diagnostics.
"""
import os
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.utils.logger import logger
from app.database.firebase import firebase_client

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

CHATBOT_SYSTEM_PROMPT = """You are HELIOS AI Assistant, an expert solar energy consultant and diagnostic specialist for a solar farm monitoring platform.

You have COMPLETE ACCESS to all solar panel data in the farm. Your capabilities:

1. **Panel Health Analysis**: You know the status, efficiency, temperature, voltage, current, and power output of every panel.
2. **Critical Alert Management**: You can identify critical panels that need immediate attention.
3. **Diagnostic Expertise**: You understand solar panel faults like hot spots, micro-cracks, PID, soiling, bypass diode failures.
4. **Maintenance Recommendations**: You provide specific, actionable maintenance advice with cost estimates.
5. **Performance Optimization**: You can suggest ways to improve overall farm efficiency.

Response Guidelines:
- Be conversational but professional
- When discussing panels, reference specific panel IDs and their metrics
- For critical issues, emphasize urgency and recommended actions
- Provide cost estimates when suggesting repairs (in INR)
- Use simple language, avoid excessive technical jargon unless asked
- When user asks about specific panels, give detailed analysis
- Proactively mention critical panels that need attention
- Support both English and Hindi (respond in the same language as user)

Current Farm Context will be provided with each message."""


class ChatbotService:
    """Handles chat interactions with solar panel context."""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = "llama-3.3-70b-versatile"
        
    async def get_farm_context(self) -> str:
        """Build comprehensive farm context for chat."""
        try:
            panels = await firebase_client.get_all_panels()
            if not panels:
                return "No panels found in the system."
            
            # Calculate statistics
            total = len(panels)
            healthy = [p for p in panels if p.get("status") == "healthy"]
            warning = [p for p in panels if p.get("status") == "warning"]
            critical = [p for p in panels if p.get("status") == "critical"]
            
            total_power = sum(p.get("power", 0) for p in panels) / 1000  # kW
            avg_efficiency = sum(p.get("efficiency", 0) for p in panels) / total if total else 0
            avg_temp = sum(p.get("temperature", 0) for p in panels) / total if total else 0
            
            context = f"""
═══════════════════════════════════════════════════════
SOLAR FARM LIVE STATUS - {datetime.now().strftime('%Y-%m-%d %H:%M')}
═══════════════════════════════════════════════════════

📊 FARM OVERVIEW:
- Total Panels: {total}
- Healthy: {len(healthy)} ({round(len(healthy)/total*100, 1)}%)
- Warning: {len(warning)} ({round(len(warning)/total*100, 1)}%)
- Critical: {len(critical)} ({round(len(critical)/total*100, 1)}%)
- Total Power Output: {round(total_power, 2)} kW
- Average Efficiency: {round(avg_efficiency, 1)}%
- Average Temperature: {round(avg_temp, 1)}°C
"""
            
            # Add critical panels detail
            if critical:
                context += "\n🚨 CRITICAL PANELS (Require Immediate Attention):\n"
                for p in critical[:5]:  # Top 5 critical
                    context += f"""
  Panel {p.get('id', 'Unknown')} ({p.get('zone', 'Unknown Zone')}):
    - Power: {p.get('power', 0)}W (Target: 369W)
    - Efficiency: {p.get('efficiency', 0)}%
    - Temperature: {p.get('temperature', 0)}°C
    - Diagnosis: {p.get('diagnosis', 'Pending analysis')}
"""
            
            # Add warning panels summary
            if warning:
                context += f"\n⚠️ WARNING PANELS ({len(warning)} total):\n"
                for p in warning[:3]:  # Top 3 warnings
                    context += f"  - {p.get('id')}: {p.get('diagnosis', 'Performance degradation')}\n"
            
            # Add some healthy panels context
            if healthy:
                best_panel = max(healthy, key=lambda x: x.get("efficiency", 0))
                context += f"\n✅ BEST PERFORMING PANEL:\n"
                context += f"  - {best_panel.get('id')}: {best_panel.get('efficiency', 0)}% efficiency, {best_panel.get('power', 0)}W output\n"
            
            return context
            
        except Exception as e:
            logger.error(f"Failed to get farm context: {e}")
            return "Unable to load farm data. Please try again."
    
    async def get_panel_detail(self, panel_id: str) -> Optional[str]:
        """Get detailed info for a specific panel."""
        try:
            panel = await firebase_client.get_panel(panel_id)
            if not panel:
                return None
                
            return f"""
PANEL DETAIL: {panel_id}
═══════════════════════════
Zone: {panel.get('zone', 'Unknown')}
Status: {panel.get('status', 'Unknown').upper()}
Voltage: {panel.get('voltage', 0)}V
Current: {panel.get('current', 0)}A
Power: {panel.get('power', 0)}W
Temperature: {panel.get('temperature', 0)}°C
Efficiency: {panel.get('efficiency', 0)}%
Last Diagnosis: {panel.get('diagnosis', 'None')}
Last Updated: {panel.get('lastUpdated', 'Unknown')}
"""
        except Exception as e:
            logger.error(f"Failed to get panel detail: {e}")
            return None
    
    async def chat(
        self, 
        message: str, 
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Process a chat message with full farm context.
        
        Args:
            message: User's message
            conversation_history: List of previous messages [{"role": "user/assistant", "content": "..."}]
            
        Returns:
            Dict with response, critical_panels, and any alerts
        """
        if not self.api_key:
            logger.error("GROQ_API_KEY not configured")
            return {
                "response": "I'm currently unavailable. Please configure the AI API key.",
                "critical_panels": [],
                "error": True
            }
        
        try:
            # Get current farm context
            farm_context = await self.get_farm_context()
            
            # Check if user is asking about specific panel
            panel_mentions = self._extract_panel_ids(message)
            panel_details = ""
            for pid in panel_mentions:
                detail = await self.get_panel_detail(pid)
                if detail:
                    panel_details += detail + "\n"
            
            # Build messages
            messages = [
                {"role": "system", "content": CHATBOT_SYSTEM_PROMPT},
                {"role": "system", "content": f"CURRENT FARM DATA:\n{farm_context}"}
            ]
            
            if panel_details:
                messages.append({
                    "role": "system", 
                    "content": f"USER IS ASKING ABOUT THESE PANELS:\n{panel_details}"
                })
            
            # Add conversation history (last 10 messages)
            if conversation_history:
                messages.extend(conversation_history[-10:])
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Call Groq API
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1024,
            }
            
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    GROQ_API_URL, 
                    headers=headers, 
                    json=payload, 
                    timeout=30
                )
                
                if resp.status_code == 200:
                    data = resp.json()
                    response_text = data["choices"][0]["message"]["content"]
                    
                    # Get critical panels for potential email alerts
                    panels = await firebase_client.get_all_panels()
                    critical_panels = [
                        {"id": p.get("id"), "diagnosis": p.get("diagnosis")}
                        for p in panels if p.get("status") == "critical"
                    ]
                    
                    return {
                        "response": response_text,
                        "critical_panels": critical_panels,
                        "error": False
                    }
                else:
                    logger.error(f"Groq API error: {resp.status_code} - {resp.text}")
                    return {
                        "response": "I'm having trouble connecting to my AI backend. Please try again in a moment.",
                        "critical_panels": [],
                        "error": True
                    }
                    
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return {
                "response": "An error occurred while processing your message. Please try again.",
                "critical_panels": [],
                "error": True
            }
    
    def _extract_panel_ids(self, text: str) -> List[str]:
        """Extract panel IDs mentioned in the text."""
        import re
        # Match patterns like "SP-001", "SP001", "panel SP-001", etc.
        pattern = r'[Ss][Pp]-?\d{3}'
        matches = re.findall(pattern, text.upper())
        # Normalize to SP-XXX format
        return [f"SP-{m[-3:]}" for m in matches]
    
    async def get_quick_summary(self) -> Dict[str, Any]:
        """Get a quick farm summary for chat initialization."""
        try:
            panels = await firebase_client.get_all_panels()
            if not panels:
                return {"summary": "No panels configured", "critical_count": 0}
            
            critical = [p for p in panels if p.get("status") == "critical"]
            warning = [p for p in panels if p.get("status") == "warning"]
            
            return {
                "total_panels": len(panels),
                "critical_count": len(critical),
                "warning_count": len(warning),
                "critical_panels": [
                    {
                        "id": p.get("id"),
                        "diagnosis": p.get("diagnosis"),
                        "power": p.get("power"),
                        "zone": p.get("zone")
                    } 
                    for p in critical
                ],
                "avg_efficiency": round(
                    sum(p.get("efficiency", 0) for p in panels) / len(panels), 1
                ) if panels else 0
            }
        except Exception as e:
            logger.error(f"Quick summary error: {e}")
            return {"summary": "Error loading data", "critical_count": 0}


# Singleton instance
chatbot_service = ChatbotService()
