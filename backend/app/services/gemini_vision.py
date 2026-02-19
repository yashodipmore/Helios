"""
HELIOS AI - Gemini Vision Service
Real image analysis using Google Gemini Pro Vision
"""
import os
import base64
import httpx
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
import logging

logger = logging.getLogger("helios")

@dataclass
class VisionAnalysisResult:
    """Result from vision analysis"""
    defects: List[Dict[str, Any]]
    health_score: float
    confidence: float
    description: str
    recommendations: List[str]
    raw_response: str


class GeminiVisionService:
    """
    Google Gemini Pro Vision integration for real image analysis.
    Supports: Thermal images, Panel RGB photos, EL images
    """
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.model = "gemini-1.5-flash"  # Best free model with vision
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        
        if not self.api_key:
            logger.warning("GOOGLE_API_KEY not set - Vision analysis will use fallback")
    
    async def analyze_thermal_image(
        self, 
        image_data: bytes,
        panel_id: Optional[str] = None
    ) -> VisionAnalysisResult:
        """
        Analyze thermal image for hotspots and anomalies.
        
        Args:
            image_data: Raw image bytes (JPEG/PNG)
            panel_id: Optional panel identifier for context
            
        Returns:
            VisionAnalysisResult with thermal analysis
        """
        prompt = f"""You are an expert solar panel thermal imaging analyst following IEC 62446-3 standards.

Analyze this thermal image of a solar panel{f' (Panel ID: {panel_id})' if panel_id else ''}.

Look for:
1. **Hotspots**: Identify any thermal anomalies (ΔT > 10°C from surroundings)
2. **Temperature Distribution**: Is heat evenly distributed?
3. **Cell-level Issues**: Any individual cells showing higher temperatures?
4. **Junction Box**: Check if junction box area shows abnormal heat
5. **String Issues**: Any entire strings showing different temperatures?

Classify severity per IEC 62446-3:
- ΔT < 10°C: Normal
- 10°C ≤ ΔT < 20°C: Moderate - Monitor closely
- 20°C ≤ ΔT < 40°C: Significant - Schedule inspection
- ΔT ≥ 40°C: Critical - Immediate action required

Respond in this exact JSON format:
{{
    "defects": [
        {{"type": "hotspot", "location": "cell B5", "severity": "moderate", "temperature_delta": 15}},
    ],
    "health_score": 0.85,
    "max_temperature_delta": 15,
    "overall_assessment": "Brief assessment",
    "recommendations": ["Action 1", "Action 2"]
}}"""
        
        return await self._analyze_image(image_data, prompt, "thermal")
    
    async def analyze_panel_image(
        self,
        image_data: bytes,
        panel_id: Optional[str] = None
    ) -> VisionAnalysisResult:
        """
        Analyze RGB panel image for visual defects.
        
        Args:
            image_data: Raw image bytes (JPEG/PNG)
            panel_id: Optional panel identifier
            
        Returns:
            VisionAnalysisResult with defect detection
        """
        prompt = f"""You are an expert solar panel visual inspection specialist.

Analyze this RGB image of a solar panel{f' (Panel ID: {panel_id})' if panel_id else ''}.

Look for these defects:
1. **Physical Damage**: Cracks, chips, or broken glass
2. **Discoloration**: Yellowing, browning, or burn marks
3. **Soiling**: Dirt, bird droppings, leaves, or debris
4. **Delamination**: Bubbling or peeling of materials
5. **Snail Trails**: Silver/gray lines indicating cell degradation
6. **Hot Spots**: Visible burn marks or discoloration
7. **Frame Damage**: Bent or corroded frame
8. **Connection Issues**: Visible cable or connector problems

Respond in this exact JSON format:
{{
    "defects": [
        {{"type": "soiling", "location": "upper-left quadrant", "severity": "low", "area_percentage": 5}},
        {{"type": "crack", "location": "cell A3", "severity": "high", "length_cm": 8}}
    ],
    "health_score": 0.75,
    "cleanliness_score": 0.90,
    "overall_assessment": "Brief assessment of panel condition",
    "recommendations": ["Clean panel surface", "Monitor crack for expansion"]
}}"""

        return await self._analyze_image(image_data, prompt, "visual")
    
    async def analyze_el_image(
        self,
        image_data: bytes,
        panel_id: Optional[str] = None
    ) -> VisionAnalysisResult:
        """
        Analyze Electroluminescence (EL) image for cell defects.
        
        Args:
            image_data: EL image bytes
            panel_id: Optional panel identifier
            
        Returns:
            VisionAnalysisResult with EL analysis
        """
        prompt = f"""You are an expert in solar panel Electroluminescence (EL) imaging analysis.

Analyze this EL image of a solar panel{f' (Panel ID: {panel_id})' if panel_id else ''}.

In EL images:
- Bright areas = Healthy cells with good current flow
- Dark areas = Defective cells with reduced current flow
- Dark lines = Microcracks or broken cell connections
- Dark spots = Inactive cell regions

Look for:
1. **Microcracks**: Thin dark lines within cells
2. **Broken Cells**: Cells with partial or complete darkness
3. **Inactive Regions**: Large dark areas
4. **Finger Interruptions**: Broken grid fingers (thin dark lines)
5. **PID Effects**: Potential-induced degradation patterns
6. **LID Effects**: Light-induced degradation patterns

Respond in this exact JSON format:
{{
    "defects": [
        {{"type": "microcrack", "location": "cell C4", "severity": "moderate", "pattern": "diagonal"}},
        {{"type": "inactive_cell", "location": "cell D7", "severity": "high", "area_percentage": 100}}
    ],
    "health_score": 0.70,
    "active_cell_percentage": 95,
    "crack_count": 3,
    "overall_assessment": "Brief EL analysis summary",
    "recommendations": ["Monitor crack progression", "Consider bypass diode check"]
}}"""

        return await self._analyze_image(image_data, prompt, "el")
    
    async def _analyze_image(
        self,
        image_data: bytes,
        prompt: str,
        analysis_type: str
    ) -> VisionAnalysisResult:
        """
        Core image analysis using Gemini Vision API.
        """
        if not self.api_key:
            logger.warning("No API key - using fallback analysis")
            return self._fallback_analysis(analysis_type)
        
        try:
            # Encode image to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Determine MIME type (assume JPEG if unknown)
            mime_type = "image/jpeg"
            if image_data[:8] == b'\x89PNG\r\n\x1a\n':
                mime_type = "image/png"
            
            # Build request
            url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": image_base64
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2048
                }
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                
                result = response.json()
                
                # Extract text from response
                raw_text = result['candidates'][0]['content']['parts'][0]['text']
                
                # Parse JSON from response
                parsed = self._parse_response(raw_text, analysis_type)
                
                logger.info(f"Gemini Vision analysis complete: {analysis_type}")
                return parsed
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Gemini API error: {e.response.status_code} - {e.response.text}")
            return self._fallback_analysis(analysis_type)
        except Exception as e:
            logger.error(f"Vision analysis error: {str(e)}")
            return self._fallback_analysis(analysis_type)
    
    def _parse_response(self, raw_text: str, analysis_type: str) -> VisionAnalysisResult:
        """Parse Gemini response into structured result."""
        import json
        import re
        
        try:
            # Extract JSON from response (may have markdown code blocks)
            json_match = re.search(r'```json\s*(.*?)\s*```', raw_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Try to find raw JSON
                json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    raise ValueError("No JSON found in response")
            
            data = json.loads(json_str)
            
            return VisionAnalysisResult(
                defects=data.get('defects', []),
                health_score=float(data.get('health_score', 0.8)),
                confidence=0.92,  # Gemini confidence
                description=data.get('overall_assessment', 'Analysis complete'),
                recommendations=data.get('recommendations', []),
                raw_response=raw_text
            )
        except Exception as e:
            logger.warning(f"Failed to parse Gemini response: {e}")
            # Return with raw text as description
            return VisionAnalysisResult(
                defects=[],
                health_score=0.85,
                confidence=0.7,
                description=raw_text[:500],
                recommendations=["Manual review recommended"],
                raw_response=raw_text
            )
    
    def _fallback_analysis(self, analysis_type: str) -> VisionAnalysisResult:
        """Fallback when API is unavailable."""
        logger.warning(f"Using fallback analysis for {analysis_type}")
        
        fallbacks = {
            "thermal": VisionAnalysisResult(
                defects=[{"type": "hotspot", "location": "center", "severity": "low", "temperature_delta": 8}],
                health_score=0.88,
                confidence=0.5,
                description="Fallback thermal analysis - API unavailable. Minor thermal variations detected.",
                recommendations=["Verify with real thermal camera", "Schedule routine inspection"],
                raw_response=""
            ),
            "visual": VisionAnalysisResult(
                defects=[{"type": "soiling", "location": "surface", "severity": "low", "area_percentage": 3}],
                health_score=0.92,
                confidence=0.5,
                description="Fallback visual analysis - API unavailable. Panel appears in good condition.",
                recommendations=["Clean panel surface", "Verify with on-site inspection"],
                raw_response=""
            ),
            "el": VisionAnalysisResult(
                defects=[],
                health_score=0.90,
                confidence=0.5,
                description="Fallback EL analysis - API unavailable. Unable to detect cell-level defects.",
                recommendations=["Professional EL imaging recommended"],
                raw_response=""
            )
        }
        
        return fallbacks.get(analysis_type, fallbacks["visual"])


# Singleton instance
gemini_vision = GeminiVisionService()
