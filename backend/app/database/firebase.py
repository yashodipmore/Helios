import os
from app.utils.logger import logger


class FirebaseClient:
    def __init__(self):
        self.database_url = os.getenv("FIREBASE_DATABASE_URL", "")
        self.api_key = os.getenv("FIREBASE_API_KEY", "")
        logger.info(f"FirebaseClient ready: {self.database_url}")

    async def _request(self, path: str, method: str = "GET", data=None):
        import httpx
        url = f"{self.database_url}/{path}.json"
        async with httpx.AsyncClient() as client:
            if method == "GET":
                resp = await client.get(url, timeout=10)
            elif method == "PUT":
                resp = await client.put(url, json=data, timeout=10)
            elif method == "PATCH":
                resp = await client.patch(url, json=data, timeout=10)
            elif method == "POST":
                resp = await client.post(url, json=data, timeout=10)
            elif method == "DELETE":
                resp = await client.delete(url, timeout=10)
            else:
                raise ValueError(f"Unknown method: {method}")

            if resp.status_code >= 400:
                logger.error(f"Firebase error {resp.status_code}: {resp.text}")
                return None
            return resp.json()

    async def get_all_panels(self):
        data = await self._request("panels")
        if not data:
            return []
        panels = []
        for panel_id, panel_data in data.items():
            panel_data["id"] = panel_id
            panels.append(panel_data)
        return panels

    async def get_panel(self, panel_id: str):
        data = await self._request(f"panels/{panel_id}")
        if data:
            data["id"] = panel_id
        return data

    async def update_panel(self, panel_id: str, updates: dict):
        return await self._request(f"panels/{panel_id}", method="PATCH", data=updates)

    async def get_all_alerts(self):
        data = await self._request("alerts")
        if not data:
            return []
        alerts = []
        for alert_id, alert_data in data.items():
            alert_data["alertId"] = alert_id
            alerts.append(alert_data)
        return alerts

    async def create_alert(self, alert: dict):
        return await self._request("alerts", method="POST", data=alert)

    async def get_farm_stats(self):
        data = await self._request("farmStats")
        return data

    async def update_farm_stats(self, stats: dict):
        return await self._request("farmStats", method="PUT", data=stats)

    async def set_panel(self, panel_id: str, data: dict):
        return await self._request(f"panels/{panel_id}", method="PUT", data=data)


firebase_client = FirebaseClient()
