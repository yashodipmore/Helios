"""
Populate Firebase Realtime Database with 1000 solar panel records.
Run this script once to seed the database.

Usage: python -m scripts.populate_firebase
"""

import os
import sys
import json
import random
import time
import httpx

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL", "")

ROWS = list("ABCDEFGHIJ")  # 10 rows
PANELS_PER_ROW = 100       # 100 panels per row = 1000 total

DIAGNOSES_WARNING = [
    "Soiling detected (95% confidence)",
    "Performance degradation suspected",
    "Partial shading effect observed",
    "Minor cell mismatch detected",
    "PID symptoms observed",
    "Mild delamination suspected",
]

DIAGNOSES_CRITICAL = [
    "Hot spot detected - Bypass diode failure",
    "Severe micro-cracks found",
    "Junction box failure suspected",
    "String interconnect failure",
    "Critical PID degradation",
]


def generate_panel(row: str, position: int) -> dict:
    panel_id = f"{row}-{position:03d}"
    rand = random.random()

    if rand < 0.96:
        status = "healthy"
        voltage = round(random.uniform(39.5, 41.5), 1)
        current = round(random.uniform(8.5, 9.5), 1)
        temperature = round(random.uniform(48, 58), 1)
        efficiency = round(random.uniform(95, 99.5), 1)
        diagnosis = None
    elif rand < 0.99:
        status = "warning"
        voltage = round(random.uniform(37.0, 39.0), 1)
        current = round(random.uniform(7.5, 8.5), 1)
        temperature = round(random.uniform(59, 70), 1)
        efficiency = round(random.uniform(75, 90), 1)
        diagnosis = random.choice(DIAGNOSES_WARNING)
    else:
        status = "critical"
        voltage = round(random.uniform(30.0, 37.0), 1)
        current = round(random.uniform(5.0, 7.5), 1)
        temperature = round(random.uniform(71, 90), 1)
        efficiency = round(random.uniform(40, 70), 1)
        diagnosis = random.choice(DIAGNOSES_CRITICAL)

    power = round(voltage * current, 2)

    return {
        "id": panel_id,
        "row": row,
        "position": position,
        "status": status,
        "voltage": voltage,
        "current": current,
        "power": power,
        "temperature": temperature,
        "efficiency": efficiency,
        "diagnosis": diagnosis,
        "lastUpdate": int(time.time() * 1000),
    }


def generate_alerts(panels: dict) -> dict:
    alerts = {}
    alert_idx = 1
    for pid, panel in panels.items():
        if panel["status"] == "critical":
            alerts[f"alert-{alert_idx:03d}"] = {
                "panelId": pid,
                "severity": "critical",
                "message": panel.get("diagnosis", "Critical fault detected"),
                "timestamp": int(time.time() * 1000) - random.randint(0, 3600000),
                "resolved": False,
            }
            alert_idx += 1
        elif panel["status"] == "warning" and random.random() < 0.3:
            alerts[f"alert-{alert_idx:03d}"] = {
                "panelId": pid,
                "severity": "high",
                "message": panel.get("diagnosis", "Performance degradation detected"),
                "timestamp": int(time.time() * 1000) - random.randint(0, 7200000),
                "resolved": False,
            }
            alert_idx += 1
    return alerts


def compute_farm_stats(panels: dict) -> dict:
    panel_list = list(panels.values())
    healthy = sum(1 for p in panel_list if p["status"] == "healthy")
    warning = sum(1 for p in panel_list if p["status"] == "warning")
    critical = sum(1 for p in panel_list if p["status"] == "critical")
    total_power = sum(p["power"] for p in panel_list) / 1000
    avg_eff = sum(p["efficiency"] for p in panel_list) / len(panel_list)

    return {
        "totalPanels": len(panel_list),
        "healthyCount": healthy,
        "warningCount": warning,
        "criticalCount": critical,
        "totalPowerKw": round(total_power, 2),
        "avgEfficiency": round(avg_eff, 1),
        "lastUpdate": int(time.time() * 1000),
    }


def main():
    if not DATABASE_URL:
        print("ERROR: FIREBASE_DATABASE_URL not set in .env")
        sys.exit(1)

    print(f"Database URL: {DATABASE_URL}")
    print("Generating 1000 panels...")

    panels = {}
    for row in ROWS:
        for pos in range(1, PANELS_PER_ROW + 1):
            panel = generate_panel(row, pos)
            panels[panel["id"]] = panel

    status_counts = {}
    for p in panels.values():
        status_counts[p["status"]] = status_counts.get(p["status"], 0) + 1
    print(f"Status breakdown: {status_counts}")

    alerts = generate_alerts(panels)
    print(f"Generated {len(alerts)} alerts")

    farm_stats = compute_farm_stats(panels)
    print(f"Farm stats: {json.dumps(farm_stats, indent=2)}")

    # Upload to Firebase in batches
    full_data = {
        "panels": panels,
        "alerts": alerts,
        "farmStats": farm_stats,
    }

    print("\nUploading to Firebase...")
    url = f"{DATABASE_URL}/.json"
    resp = httpx.put(url, json=full_data, timeout=60)

    if resp.status_code == 200:
        print("SUCCESS! Data uploaded to Firebase.")
        print(f"  Panels: {len(panels)}")
        print(f"  Alerts: {len(alerts)}")
        print(f"  Total Power: {farm_stats['totalPowerKw']} kW")
    else:
        print(f"FAILED! Status: {resp.status_code}")
        print(resp.text)


if __name__ == "__main__":
    main()
