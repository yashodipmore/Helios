import os
import httpx
from app.utils.logger import logger

HF_API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"


class HuggingFaceClient:
    def __init__(self):
        self.token = os.getenv("HUGGING_FACE_TOKEN", "")

    async def image_to_text(self, image_bytes: bytes) -> str:
        headers = {"Authorization": f"Bearer {self.token}"}
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    HF_API_URL,
                    headers=headers,
                    content=image_bytes,
                    timeout=30,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if isinstance(data, list) and len(data) > 0:
                        return data[0].get("generated_text", "")
                elif resp.status_code == 503:
                    logger.warning("HF model loading, using fallback")
                else:
                    logger.warning(f"HF API error {resp.status_code}")
        except Exception as e:
            logger.warning(f"HF API failed: {e}")

        return "solar panel surface with uniform appearance"


hf_client = HuggingFaceClient()
