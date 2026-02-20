# ⚙️ HELIOS AI - Implementation Guide

## Overview

This document provides comprehensive implementation details for the HELIOS AI platform, including AI pipeline architecture, algorithm explanations, and code flow diagrams.

---

## AI Analysis Pipeline

### Full Analysis Flow

```mermaid
flowchart TB
    subgraph Input["📥 Input Layer"]
        PanelID[Panel ID]
        Telemetry[Real-time Telemetry]
        ImageData[RGB Image Data]
    end
    
    subgraph Preprocessing["🔧 Preprocessing"]
        DataFetch[Fetch Panel Data<br/>from Firebase]
        ImagePrep[Image Preparation<br/>Resize, Normalize]
    end
    
    subgraph ParallelAnalysis["⚡ Parallel Analysis Phase"]
        direction TB
        VirtualEL[Virtual EL<br/>Generation]
        ThermalAnalysis[Thermal<br/>Analysis]
        VisionAI[Vision AI<br/>Defect Detection]
    end
    
    subgraph DataEnrichment["📊 Data Enrichment"]
        Merge[Merge All Results]
        Context[Build Analysis<br/>Context String]
    end
    
    subgraph RootCause["🧠 Root Cause Analysis"]
        LLMPrompt[Construct<br/>Expert Prompt]
        GroqAPI[Groq API Call<br/>LLaMA 3.3 70B]
        ParseResponse[Parse Structured<br/>Response]
    end
    
    subgraph Output["📤 Output Layer"]
        Result[FullAnalysisResult]
        Database[Save to Database]
        Response[API Response]
    end
    
    PanelID --> DataFetch
    Telemetry --> DataFetch
    ImageData --> ImagePrep
    
    DataFetch --> VirtualEL
    ImagePrep --> VirtualEL
    DataFetch --> ThermalAnalysis
    ImagePrep --> ThermalAnalysis
    ImagePrep --> VisionAI
    
    VirtualEL --> Merge
    ThermalAnalysis --> Merge
    VisionAI --> Merge
    
    Merge --> Context
    Context --> LLMPrompt
    LLMPrompt --> GroqAPI
    GroqAPI --> ParseResponse
    
    ParseResponse --> Result
    Result --> Database
    Result --> Response
    
    style Input fill:#3B82F6,stroke:#333,color:#fff
    style Preprocessing fill:#F59E0B,stroke:#333,color:#000
    style ParallelAnalysis fill:#22C55E,stroke:#333,color:#fff
    style DataEnrichment fill:#8B5CF6,stroke:#333,color:#fff
    style RootCause fill:#FFB800,stroke:#333,color:#000
    style Output fill:#EF4444,stroke:#333,color:#fff
```

---

## Virtual EL Imaging

### Algorithm Overview

Virtual Electroluminescence (EL) imaging generates EL-like diagnostic images from standard RGB photographs.

```mermaid
sequenceDiagram
    participant RGB as RGB Image
    participant PP as Preprocessing
    participant FE as Feature Extraction
    participant GAN as GAN Model
    participant AP as Anomaly Detection
    participant OUT as EL Output
    
    RGB->>PP: Input Image
    Note over PP: Resize to 224x224<br/>Normalize [0,1]
    PP->>FE: Preprocessed Image
    Note over FE: Extract spatial features<br/>Edge detection
    FE->>GAN: Feature Map
    Note over GAN: Generate EL-like<br/>luminescence map
    GAN->>AP: Synthetic EL
    Note over AP: Detect dark regions<br/>(microcracks, inactive)
    AP->>OUT: Defect Map + Score
```

### Implementation Code

```python
class VirtualELService:
    """Generates virtual EL images from RGB photographs."""
    
    def __init__(self):
        self.model_name = "facebook/detr-resnet-50"
        self.processor = None
        self.model = None
    
    async def generate_virtual_el(
        self, 
        panel_id: str, 
        image_data: Optional[bytes] = None
    ) -> VirtualELResult:
        """
        Generate virtual EL image and detect defects.
        
        Args:
            panel_id: Panel identifier
            image_data: Optional RGB image bytes
            
        Returns:
            VirtualELResult with defects and health score
        """
        # Step 1: Simulate EL characteristics
        el_characteristics = self._simulate_el_response(panel_id)
        
        # Step 2: Detect anomalies
        defects = self._detect_anomalies(el_characteristics)
        
        # Step 3: Calculate health score
        health_score = self._calculate_health(defects)
        
        return VirtualELResult(
            defects=defects,
            overall_health=health_score,
            el_image_url=f"generated/el/{panel_id}.png"
        )
```

---

## Thermal Analysis

### IEC 62446-3 Compliance

```mermaid
graph TB
    subgraph Input["📷 Input"]
        ThermalImage[Thermal Image<br/>or Telemetry]
    end
    
    subgraph Processing["🔬 Processing"]
        Segmentation[Cell Segmentation]
        TempMap[Temperature Mapping]
        DeltaT[ΔT Calculation]
    end
    
    subgraph Thresholds["📊 IEC 62446-3 Thresholds"]
        T1["ΔT < 10°C<br/>✅ Normal"]
        T2["10°C ≤ ΔT < 20°C<br/>⚠️ Moderate"]
        T3["20°C ≤ ΔT < 40°C<br/>🔶 Significant"]
        T4["ΔT ≥ 40°C<br/>🔴 Critical"]
    end
    
    subgraph Output["📤 Output"]
        Classification[Severity Classification]
        Recommendations[Action Recommendations]
    end
    
    ThermalImage --> Segmentation
    Segmentation --> TempMap
    TempMap --> DeltaT
    
    DeltaT --> T1
    DeltaT --> T2
    DeltaT --> T3
    DeltaT --> T4
    
    T1 --> Classification
    T2 --> Classification
    T3 --> Classification
    T4 --> Classification
    
    Classification --> Recommendations
    
    style Thresholds fill:#F59E0B,stroke:#333,color:#000
```

### Hotspot Detection Algorithm

```python
def _classify_thermal_anomaly(self, temperature: float, ambient: float = 25.0) -> dict:
    """
    Classify thermal anomaly per IEC 62446-3 standards.
    
    ΔT Thresholds:
    - < 10°C: Normal operation
    - 10-20°C: Moderate - monitor closely
    - 20-40°C: Significant - schedule inspection
    - ≥ 40°C: Critical - immediate action
    """
    delta_t = temperature - ambient
    
    if delta_t < 10:
        return {"severity": "normal", "action": "none"}
    elif delta_t < 20:
        return {"severity": "moderate", "action": "monitor"}
    elif delta_t < 40:
        return {"severity": "significant", "action": "schedule_inspection"}
    else:
        return {"severity": "critical", "action": "immediate"}
```

---

## Root Cause Analysis Engine

### Multi-Modal Fusion

```mermaid
flowchart LR
    subgraph Inputs["📥 Multi-Modal Inputs"]
        EL[Virtual EL<br/>Defects]
        Thermal[Thermal<br/>Hotspots]
        Electrical[Electrical<br/>Deviations]
        Vision[Vision AI<br/>Detections]
    end
    
    subgraph Context["📝 Context Building"]
        Template[Expert Prompt<br/>Template]
        Enrich[Data Enrichment]
    end
    
    subgraph LLM["🧠 LLaMA 3.3 70B"]
        Reasoning[Multi-Step<br/>Reasoning]
        Knowledge[Domain<br/>Knowledge]
    end
    
    subgraph Output["📤 Structured Output"]
        RootCause[Primary Cause]
        Factors[Contributing<br/>Factors]
        Actions[Recommended<br/>Actions]
    end
    
    EL --> Template
    Thermal --> Template
    Electrical --> Template
    Vision --> Template
    
    Template --> Enrich
    Enrich --> Reasoning
    Reasoning --> Knowledge
    Knowledge --> RootCause
    Knowledge --> Factors
    Knowledge --> Actions
    
    style LLM fill:#FFB800,stroke:#333,color:#000
```

### Expert System Prompt

```python
ROOT_CAUSE_PROMPT = """
You are an expert solar panel diagnostic AI with deep knowledge of:
- Photovoltaic cell physics and degradation mechanisms
- Thermal imaging analysis per IEC 62446-3
- Electroluminescence (EL) imaging interpretation
- Common failure modes: PID, LID, hotspots, microcracks

PANEL DIAGNOSTIC DATA:
{enriched_panel_data}

VIRTUAL EL ANALYSIS:
{virtual_el_results}

THERMAL ANALYSIS:
{thermal_results}

Provide:
1. PRIMARY ROOT CAUSE with confidence %
2. CONTRIBUTING FACTORS (list)
3. IMPACT ASSESSMENT (current loss, degradation trajectory)
4. PRIORITIZED ACTIONS with timelines

Format as structured JSON.
"""
```

### Groq API Integration

```mermaid
sequenceDiagram
    participant AS as AI Service
    participant GC as Groq Client
    participant API as Groq API
    participant LLM as LLaMA 3.3 70B
    
    AS->>GC: analyze_root_cause(data)
    GC->>GC: Build prompt template
    GC->>GC: Add system message
    
    GC->>API: POST /chat/completions
    Note over API: Headers:<br/>Authorization: Bearer {key}
    
    API->>LLM: Forward request
    Note over LLM: Model: llama-3.3-70b-versatile<br/>Temperature: 0.3<br/>Max Tokens: 2048
    
    LLM-->>API: Generated response
    API-->>GC: JSON response
    
    GC->>GC: Parse response
    GC->>GC: Extract structured data
    GC-->>AS: RootCauseResult
```

---

## Database Schema

### Firebase Realtime Database Structure

```mermaid
graph TB
    subgraph Root["Firebase Root"]
        Panels["/panels"]
        Alerts["/alerts"]
        Stats["/stats"]
        Analysis["/analysis_results"]
    end
    
    subgraph PanelSchema["Panel Document"]
        PID["id: string"]
        PRow["row: number"]
        PPos["position: number"]
        PStatus["status: enum"]
        PVoltage["voltage: float"]
        PCurrent["current: float"]
        PTemp["temperature: float"]
    end
    
    Panels --> PanelSchema
    
    style Root fill:#FF9500,stroke:#333
```

### Data Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant FB as Firebase SDK
    participant DB as Firebase DB
    participant BE as Backend
    
    Note over FE,DB: Initial Data Load
    FE->>FB: onValue('/panels')
    FB->>DB: Subscribe
    DB-->>FB: Initial snapshot
    FB-->>FE: Panel data
    
    Note over FE,DB: Real-time Updates
    DB->>FB: Data changed
    FB->>FE: onValue callback
    FE->>FE: Update Zustand store
    FE->>FE: Re-render components
    
    Note over FE,BE: AI Analysis
    FE->>BE: POST /analyze-panel
    BE->>DB: Fetch panel data
    BE->>BE: Run AI pipeline
    BE->>DB: Save results
    BE-->>FE: Analysis response
```

---

## State Management

### Zustand Store Architecture

```mermaid
graph TB
    subgraph Store["useStore.js"]
        direction TB
        State[State]
        Actions[Actions]
    end
    
    subgraph StateSlices["State Slices"]
        Panels["panels[]"]
        Alerts["alerts[]"]
        Stats["farmStats{}"]
        Loading["loading flags"]
        Selected["selectedPanel"]
    end
    
    subgraph ActionSlices["Actions"]
        FetchPanels["fetchPanels()"]
        FetchAlerts["fetchAlerts()"]
        SetSelected["setSelectedPanel()"]
        RunAnalysis["runAIAnalysis()"]
    end
    
    Store --> StateSlices
    Store --> ActionSlices
    
    FetchPanels --> Panels
    FetchAlerts --> Alerts
    SetSelected --> Selected
    
    style Store fill:#A78BFA,stroke:#333,color:#fff
```

### Store Implementation

```javascript
// store/useStore.js
import { create } from 'zustand';

const useStore = create((set, get) => ({
  // State
  panels: [],
  alerts: [],
  farmStats: null,
  selectedPanel: null,
  loading: {
    panels: false,
    alerts: false,
    analysis: false
  },
  
  // Actions
  fetchPanels: async () => {
    set({ loading: { ...get().loading, panels: true }});
    const panels = await api.getPanels();
    set({ panels, loading: { ...get().loading, panels: false }});
  },
  
  runAIAnalysis: async (panelId) => {
    set({ loading: { ...get().loading, analysis: true }});
    const result = await api.analyzePanel(panelId);
    // Update panel in store
    const panels = get().panels.map(p => 
      p.id === panelId ? { ...p, ...result } : p
    );
    set({ panels, loading: { ...get().loading, analysis: false }});
    return result;
  }
}));
```

---

## Error Handling Strategy

```mermaid
flowchart TB
    subgraph Errors["Error Types"]
        Network[Network Errors]
        API[API Errors]
        AI[AI Service Errors]
        DB[Database Errors]
    end
    
    subgraph Handlers["Error Handlers"]
        Retry[Retry Logic<br/>3 attempts]
        Fallback[Fallback Data]
        Logger[Error Logging]
        UserNotify[User Notification]
    end
    
    subgraph Recovery["Recovery Actions"]
        Cache[Use Cached Data]
        Graceful[Graceful Degradation]
        Alert[Alert Operator]
    end
    
    Network --> Retry
    API --> Retry
    Retry -->|Success| Continue((Continue))
    Retry -->|Failed| Fallback
    
    AI --> Logger
    Logger --> Fallback
    
    DB --> Cache
    
    Fallback --> Graceful
    Graceful --> UserNotify
    
    style Handlers fill:#F59E0B,stroke:#333,color:#000
    style Recovery fill:#22C55E,stroke:#333,color:#fff
```

---

## Performance Optimizations

### Parallel Processing

```python
async def full_analysis(self, panel_id: str) -> FullAnalysisResult:
    """Run complete AI analysis with parallel processing."""
    
    # Parallel execution of independent analyses
    virtual_el_task = asyncio.create_task(
        self._virtual_el_analysis(panel_id)
    )
    thermal_task = asyncio.create_task(
        self._thermal_analysis(panel_id)
    )
    
    # Await both results
    virtual_el_result, thermal_result = await asyncio.gather(
        virtual_el_task,
        thermal_task
    )
    
    # Sequential: Root cause needs results from above
    root_cause = await self._root_cause_analysis(
        panel_id,
        virtual_el_result,
        thermal_result
    )
    
    return FullAnalysisResult(
        virtual_el=virtual_el_result,
        thermal=thermal_result,
        root_cause=root_cause
    )
```

### React Optimizations

```javascript
// Memoized panel grid for 247 panels
const MemoizedPanelTile = memo(PanelTile, (prev, next) => 
  prev.panel.status === next.panel.status &&
  prev.panel.lastUpdated === next.panel.lastUpdated
);

// Virtual scrolling for large panel lists
import { FixedSizeGrid } from 'react-window';

const PanelGrid = ({ panels }) => (
  <FixedSizeGrid
    columnCount={12}
    rowCount={Math.ceil(panels.length / 12)}
    columnWidth={100}
    rowHeight={80}
  >
    {({ columnIndex, rowIndex, style }) => (
      <MemoizedPanelTile 
        panel={panels[rowIndex * 12 + columnIndex]}
        style={style}
      />
    )}
  </FixedSizeGrid>
);
```

---

## Testing Strategy

```mermaid
graph TB
    subgraph Unit["🧪 Unit Tests"]
        AITests[AI Service Tests]
        UtilTests[Utility Tests]
        ComponentTests[Component Tests]
    end
    
    subgraph Integration["🔗 Integration Tests"]
        APITests[API Endpoint Tests]
        DBTests[Database Tests]
    end
    
    subgraph E2E["🎯 E2E Tests"]
        FlowTests[User Flow Tests]
        AnalysisTests[Analysis Pipeline]
    end
    
    subgraph Tools["🛠️ Test Tools"]
        Pytest[pytest + pytest-asyncio]
        Jest[Jest + RTL]
        Cypress[Cypress]
    end
    
    Pytest --> Unit
    Pytest --> Integration
    Jest --> ComponentTests
    Cypress --> E2E
    
    style Unit fill:#22C55E,stroke:#333,color:#fff
    style Integration fill:#F59E0B,stroke:#333,color:#000
    style E2E fill:#3B82F6,stroke:#333,color:#fff
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Firebase credentials set
- [ ] Groq API key active
- [ ] CORS origins updated for production
- [ ] Database rules configured
- [ ] Rate limiting enabled
- [ ] Error logging active
- [ ] Health check endpoint responding
- [ ] SSL certificates valid
- [ ] CDN configured for static assets

---

*Implementation Guide v1.0 | Last Updated: February 2026*
]]>
