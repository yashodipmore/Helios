# 🚀 HELIOS AI - Software Completion Plan

## Mission: Make Software 100% Production-Ready
> "Sirf hardware plug karo - software ready hai!"

---

## 📋 Executive Summary

| Category | Current Status | Target Status |
|----------|---------------|---------------|
| Vision AI | ❌ Broken (wrong model) | ✅ Working with real image analysis |
| Image Upload | ❌ Missing | ✅ Upload thermal/RGB images |
| Sensor Interface | ❌ Hardcoded simulator | ✅ Pluggable adapter pattern |
| Historical Data | ❌ No time-series | ✅ Full history storage |
| API Completeness | ⚠️ 70% | ✅ 100% documented & tested |
| Hardware Abstraction | ❌ Missing | ✅ Clean interface for IoT |

---

## 🎯 Phase 1: Core AI Fixes (Priority: 🔴 HIGH)

### 1.1 Fix Vision AI Model
**Problem**: Using `llama-3.3-70b-versatile` which is TEXT-only model
**Solution**: Use proper vision-capable models

```
┌─────────────────────────────────────────────────────┐
│              VISION AI OPTIONS                       │
├─────────────────────────────────────────────────────┤
│  Option A: Google Gemini Pro Vision (FREE tier)     │
│  Option B: OpenAI GPT-4 Vision ($$$)                │
│  Option C: Claude 3 Vision ($$$)                    │
│  Option D: HuggingFace BLIP-2 (FREE, local)         │
│  Option E: Groq Llava (FREE, when available)        │
├─────────────────────────────────────────────────────┤
│  RECOMMENDED: Gemini Pro Vision (FREE + Good)       │
└─────────────────────────────────────────────────────┘
```

**Files to Modify**:
- `backend/app/services/vision_ai.py` - New vision model integration
- `backend/app/.env` - Add GOOGLE_API_KEY

**ENV Required**:
```env
GOOGLE_API_KEY=<gemini-api-key>  # FREE from ai.google.dev
```

---

### 1.2 Image Upload API
**Problem**: No way to upload real thermal/panel images
**Solution**: Create proper image upload endpoints

```
NEW ENDPOINTS:
┌────────────────────────────────────────────────────────────┐
│  POST /api/upload/thermal-image                            │
│  ├── Input: multipart/form-data (image file)               │
│  ├── Process: Save to Supabase Storage                     │
│  └── Output: { imageUrl, analysisResult }                  │
├────────────────────────────────────────────────────────────┤
│  POST /api/upload/panel-image                              │
│  ├── Input: multipart/form-data (image file)               │
│  ├── Process: Vision AI analysis                           │
│  └── Output: { defects[], healthScore, recommendations }   │
├────────────────────────────────────────────────────────────┤
│  POST /api/upload/el-image                                 │
│  ├── Input: multipart/form-data (EL image)                 │
│  └── Output: { cracks[], hotspots[], degradation% }        │
└────────────────────────────────────────────────────────────┘
```

**Files to Create**:
- `backend/app/api/upload_routes.py` - Upload endpoints
- `backend/app/services/image_storage.py` - Supabase storage

**Files to Modify**:
- `backend/app/main.py` - Register upload router

---

## 🎯 Phase 2: Hardware Abstraction Layer (Priority: 🔴 HIGH)

### 2.1 Sensor Interface Architecture
**Problem**: Direct coupling to simulator
**Solution**: Abstract interface pattern

```
                    ┌─────────────────────────┐
                    │   SensorInterface       │ ← Abstract Base
                    │   (Protocol/ABC)        │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ MockAdapter   │     │ MQTTAdapter   │     │ ModbusAdapter │
│ (Demo Data)   │     │ (IoT Sensors) │     │ (Industrial)  │
└───────────────┘     └───────────────┘     └───────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   SensorManager         │
                    │   (Factory Pattern)     │
                    └─────────────────────────┘
```

**Files to Create**:
- `backend/app/hardware/sensor_interface.py` - Abstract interface
- `backend/app/hardware/mock_adapter.py` - Current simulator refactored
- `backend/app/hardware/mqtt_adapter.py` - MQTT for IoT sensors
- `backend/app/hardware/modbus_adapter.py` - Industrial Modbus protocol
- `backend/app/hardware/sensor_manager.py` - Factory & manager

**Config**:
```env
SENSOR_MODE=mock          # Options: mock, mqtt, modbus, http
MQTT_BROKER=localhost     # For MQTT sensors
MQTT_PORT=1883
MODBUS_HOST=192.168.1.100 # For Modbus devices
```

---

### 2.2 Camera Interface Architecture
**Problem**: Synthetic images only
**Solution**: Same pattern for cameras

```
                    ┌─────────────────────────┐
                    │   CameraInterface       │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ MockCamera    │     │ RTSPCamera    │     │ USBCamera     │
│ (Synthetic)   │     │ (IP Cameras)  │     │ (Local)       │
└───────────────┘     └───────────────┘     └───────────────┘
```

**Files to Create**:
- `backend/app/hardware/camera_interface.py`
- `backend/app/hardware/mock_camera.py`
- `backend/app/hardware/rtsp_camera.py` - IP camera support
- `backend/app/hardware/usb_camera.py` - USB webcam support

---

## 🎯 Phase 3: Historical Data & Analytics (Priority: 🟡 MEDIUM)

### 3.1 Time-Series Data Storage
**Solution**: Use Supabase with proper schema

```sql
-- Panel Readings History
CREATE TABLE panel_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id VARCHAR(20) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    voltage DECIMAL(6,2),
    current DECIMAL(6,2),
    power DECIMAL(8,2),
    temperature DECIMAL(5,2),
    efficiency DECIMAL(5,2),
    irradiance DECIMAL(6,2),
    status VARCHAR(20)
);

-- Create index for time-series queries
CREATE INDEX idx_readings_panel_time ON panel_readings(panel_id, timestamp DESC);

-- Alerts History
CREATE TABLE alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id VARCHAR(20),
    severity VARCHAR(20),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(100)
);

-- AI Analysis History
CREATE TABLE analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id VARCHAR(20),
    analysis_type VARCHAR(50),
    result JSONB,
    confidence DECIMAL(4,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Files to Create**:
- `backend/app/database/timeseries.py` - Time-series operations
- `backend/app/api/history_routes.py` - Historical data endpoints

**New Endpoints**:
```
GET /api/panels/{id}/history?start=2026-01-01&end=2026-02-19
GET /api/analytics/power-trend?period=7d
GET /api/analytics/efficiency-trend?period=30d
GET /api/alerts/history
```

---

## 🎯 Phase 4: API Completion (Priority: 🟡 MEDIUM)

### 4.1 Fix Hardcoded Defaults
| Endpoint | Issue | Fix |
|----------|-------|-----|
| `/api/demo/analyze-virtual-el` | Default panel_id | Make required |
| `/api/demo/analyze-thermal` | Default panel_id | Make required |

### 4.2 Add Missing Endpoints
```
POST /api/panels/{id}/mark-maintenance
POST /api/panels/{id}/clear-alert
POST /api/work-orders/create
GET  /api/work-orders
PUT  /api/work-orders/{id}/complete
```

---

## 🎯 Phase 5: Frontend Completion (Priority: 🟡 MEDIUM)

### 5.1 Image Upload UI
- Drag & drop image upload
- Camera capture (mobile)
- Preview before analysis

### 5.2 Real Analytics Charts
- Fetch from historical API
- Remove fake `Math.random()` data

### 5.3 Settings Persistence
- Save to localStorage
- Sync with backend

---

## 📦 Required Environment Variables

```env
# ===== AI SERVICES =====
GROQ_API_KEY=gsk_xxx                    # Already have
GOOGLE_API_KEY=xxx                       # NEW - For Gemini Vision

# ===== DATABASE =====
FIREBASE_DATABASE_URL=https://xxx.firebaseio.com   # Already have
SUPABASE_URL=https://xxx.supabase.co               # Already have
SUPABASE_KEY=xxx                                    # Already have

# ===== HARDWARE CONFIG =====
SENSOR_MODE=mock                         # mock | mqtt | modbus
CAMERA_MODE=mock                         # mock | rtsp | usb

# Optional (for real hardware)
MQTT_BROKER=localhost
MQTT_PORT=1883
MODBUS_HOST=192.168.1.100
RTSP_URL=rtsp://camera-ip:554/stream
```

---

## 📅 Implementation Order

```
Day 1: Phase 1 (Vision AI + Image Upload)
├── Fix vision_ai.py with Gemini
├── Create upload endpoints
└── Test with real images

Day 2: Phase 2 (Hardware Abstraction)
├── Create sensor interface
├── Refactor simulator to MockAdapter
├── Create MQTT & Modbus stubs
└── Create camera interfaces

Day 3: Phase 3 (Historical Data)
├── Supabase schema migration
├── Time-series API
└── Fix frontend charts

Day 4: Phase 4 & 5 (Polish)
├── Fix all API defaults
├── Add missing endpoints
├── Frontend image upload UI
└── Settings persistence

Day 5: Testing & Demo
├── End-to-end testing
├── Demo preparation
└── Documentation update
```

---

## 🎤 Hackathon Presentation Points

After completion, you can say:

> "HELIOS AI is **100% software complete**. 
> The system currently runs on simulated sensor data for demonstration.
> **When real hardware is connected:**
> - Change ONE config value: `SENSOR_MODE=mqtt`
> - Sensors will stream real data via MQTT
> - All AI analysis will work on REAL data
> - No code changes required!"

---

## ✅ Success Criteria

- [ ] Upload real thermal image → Get real AI analysis
- [ ] Upload real panel photo → Get real defect detection
- [ ] Sensor interface fully abstracted
- [ ] Camera interface fully abstracted
- [ ] Historical data API working
- [ ] All analytics charts pulling real data
- [ ] Settings persisted
- [ ] All API endpoints complete
- [ ] Demo mode toggleable via config

---

*Plan Created: 19 February 2026*
*Ready for Implementation: YES*
