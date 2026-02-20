# 🏗️ HELIOS AI - System Architecture

## Overview

HELIOS AI follows a **microservices-inspired architecture** with clear separation between frontend, backend, and AI services.

---

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["🌐 Client Layer"]
        Browser[Browser/Mobile]
        API_Client[API Clients]
    end

    subgraph Frontend["🖥️ Frontend Layer"]
        direction TB
        React[React 18 SPA]
        Zustand[Zustand State]
        FBClient[Firebase SDK]
    end

    subgraph Backend["⚡ Backend Layer"]
        direction TB
        FastAPI[FastAPI Server]
        Routes[API Router]
        Services[Service Layer]
    end

    subgraph AI["🧠 AI Engine"]
        direction TB
        AIService[AI Orchestrator]
        VirtualEL[Virtual EL Service]
        Thermal[Thermal Analysis]
        VisionAI[Vision AI]
        RootCause[Root Cause Engine]
    end

    subgraph External["☁️ External Services"]
        Groq[Groq Cloud<br/>LLaMA 3.3 70B]
        HF[HuggingFace<br/>BLIP/ViT]
        Firebase[(Firebase<br/>Realtime DB)]
        Supabase[(Supabase<br/>Storage)]
    end

    Browser --> React
    API_Client --> FastAPI
    React --> Zustand
    React --> FBClient
    FBClient --> Firebase
    React --> FastAPI
    FastAPI --> Routes
    Routes --> Services
    Services --> AIService
    AIService --> VirtualEL
    AIService --> Thermal
    AIService --> VisionAI
    AIService --> RootCause
    RootCause --> Groq
    VisionAI --> HF
    Services --> Firebase
    Services --> Supabase

    style Client fill:#E8E8E8,stroke:#333
    style Frontend fill:#61DAFB,stroke:#333,color:#000
    style Backend fill:#009688,stroke:#333,color:#fff
    style AI fill:#FFB800,stroke:#333,color:#000
    style External fill:#FF9500,stroke:#333,color:#fff
```

---

## Component Architecture

### Frontend Components

```mermaid
graph TB
    subgraph App["🎯 App.jsx"]
        Router[React Router]
    end

    subgraph Pages["📄 Pages"]
        Landing[LandingPage]
        Dashboard[Dashboard View]
    end

    subgraph Components["🧩 Components"]
        StatsCards[StatsCards<br/>KPI Display]
        PanelGrid[PanelGrid<br/>247 Panels]
        AlertPanel[AlertPanel<br/>Notifications]
        Modal[PanelDetailModal<br/>AI Analysis]
    end

    subgraph Services["🔌 Services"]
        APIService[api.js<br/>REST Client]
        FirebaseService[firebase.js<br/>Realtime Sync]
    end

    subgraph State["📦 State"]
        Zustand[useStore.js<br/>Global State]
    end

    Router --> Landing
    Router --> Dashboard
    Dashboard --> StatsCards
    Dashboard --> PanelGrid
    Dashboard --> AlertPanel
    PanelGrid --> Modal
    StatsCards --> Zustand
    PanelGrid --> Zustand
    AlertPanel --> Zustand
    Zustand --> APIService
    Zustand --> FirebaseService

    style App fill:#282C34,stroke:#61DAFB,color:#fff
    style Pages fill:#3B82F6,stroke:#333,color:#fff
    style Components fill:#22C55E,stroke:#333,color:#fff
    style Services fill:#F59E0B,stroke:#333,color:#000
    style State fill:#A78BFA,stroke:#333,color:#fff
```

### Backend Services

```mermaid
graph TB
    subgraph API["🌐 API Layer"]
        Router[routes.py]
    end

    subgraph Core["⚙️ Core Services"]
        AIService[ai_service.py<br/>Orchestrator]
    end

    subgraph Analysis["🔬 Analysis Services"]
        VirtualEL[virtual_el.py<br/>RGB→EL Generation]
        Thermal[thermal_analysis.py<br/>IEC 62446-3]
        VisionAI[vision_ai.py<br/>Defect Detection]
    end

    subgraph LLM["🧠 LLM Layer"]
        GroqClient[groq_client.py<br/>LLaMA 3.3 70B]
        HFClient[hf_client.py<br/>Vision Models]
    end

    subgraph Data["🗄️ Data Layer"]
        Firebase[firebase.py]
        Supabase[supabase_client.py]
    end

    Router --> AIService
    AIService --> VirtualEL
    AIService --> Thermal
    AIService --> VisionAI
    AIService --> GroqClient
    VisionAI --> HFClient
    AIService --> Firebase
    AIService --> Supabase

    style API fill:#009688,stroke:#333,color:#fff
    style Core fill:#FFB800,stroke:#333,color:#000
    style Analysis fill:#3B82F6,stroke:#333,color:#fff
    style LLM fill:#A78BFA,stroke:#333,color:#fff
    style Data fill:#EF4444,stroke:#333,color:#fff
```

---

## AI Analysis Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant AI as AI Service
    participant VEL as Virtual EL
    participant TH as Thermal
    participant VA as Vision AI
    participant LLM as Groq LLM
    participant DB as Firebase

    U->>FE: Click "Run AI Analysis"
    FE->>BE: POST /api/demo/analyze-panel/{id}
    BE->>DB: Fetch Panel Data
    DB-->>BE: Panel Telemetry
    
    BE->>AI: full_analysis(panel_id)
    
    par Parallel Processing
        AI->>VEL: generate_virtual_el()
        VEL-->>AI: EL Image + Defects
    and
        AI->>TH: analyze_thermal()
        TH->>VA: Vision Analysis
        VA-->>TH: Hotspot Detection
        TH-->>AI: Thermal Diagnosis
    end
    
    AI->>AI: Enrich Panel Data
    AI->>LLM: analyze_root_cause()
    
    Note over LLM: Multi-modal fusion<br/>Electrical + Thermal + Visual
    
    LLM-->>AI: Root Cause + Action
    AI->>DB: Save Results (async)
    AI-->>BE: FullAnalysisResult
    BE-->>FE: JSON Response
    FE-->>U: Display Results
```

---

## Data Models

```mermaid
erDiagram
    PANEL {
        string id PK "PNL-A01-001"
        int row "1-12"
        int position "1-24"
        string status "healthy|warning|critical"
        float voltage "V"
        float current "A"
        float power "W"
        float temperature "°C"
        float efficiency "%"
        string diagnosis "AI diagnosis"
        timestamp lastUpdated
    }
    
    ALERT {
        string alertId PK
        string panelId FK
        string severity "critical|high|medium|low"
        string message
        string type "thermal|electrical|efficiency"
        boolean resolved
        timestamp timestamp
    }
    
    ANALYSIS_RESULT {
        string id PK
        string panelId FK
        json virtual_el "EL analysis results"
        json thermal_diagnosis "Thermal results"
        json root_cause "LLM analysis"
        float total_time_seconds
        timestamp created_at
    }
    
    FARM_STATS {
        int totalPanels
        int healthyCount
        int warningCount
        int criticalCount
        float totalPowerKw
        float avgEfficiency
    }
    
    PANEL ||--o{ ALERT : generates
    PANEL ||--o{ ANALYSIS_RESULT : has
```

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Production["🚀 Production Environment"]
        subgraph Vercel["Vercel Edge"]
            FE[React Frontend<br/>Static Assets]
        end
        
        subgraph Railway["Railway/Render"]
            BE[FastAPI Backend<br/>Python 3.11]
        end
        
        subgraph Cloud["Cloud Services"]
            FB[(Firebase<br/>Realtime DB)]
            SB[(Supabase<br/>PostgreSQL)]
        end
        
        subgraph AI["AI APIs"]
            GROQ[Groq Cloud]
            HF[HuggingFace]
        end
    end
    
    subgraph Users["👥 Users"]
        Browser[Web Browser]
        Mobile[Mobile Device]
    end
    
    Browser --> FE
    Mobile --> FE
    FE --> BE
    BE --> FB
    BE --> SB
    BE --> GROQ
    BE --> HF
    
    style Vercel fill:#000,stroke:#fff,color:#fff
    style Railway fill:#0B0D0E,stroke:#fff,color:#fff
    style Cloud fill:#FF9500,stroke:#333
    style AI fill:#FFB800,stroke:#333
```

---

## Security Architecture

```mermaid
flowchart LR
    subgraph Client["Client"]
        Browser[Browser]
    end
    
    subgraph Edge["Edge/CDN"]
        WAF[Web Application<br/>Firewall]
        CDN[CDN Cache]
    end
    
    subgraph API["API Gateway"]
        CORS[CORS Middleware]
        RateLimit[Rate Limiting]
        Auth[API Key Auth]
    end
    
    subgraph Backend["Backend"]
        Validation[Input Validation]
        Sanitization[Data Sanitization]
        Services[Business Logic]
    end
    
    subgraph Data["Data Layer"]
        Encryption[Encryption at Rest]
        Firebase[(Firebase)]
    end
    
    Browser --> WAF
    WAF --> CDN
    CDN --> CORS
    CORS --> RateLimit
    RateLimit --> Auth
    Auth --> Validation
    Validation --> Sanitization
    Sanitization --> Services
    Services --> Encryption
    Encryption --> Firebase
    
    style Edge fill:#EF4444,stroke:#333,color:#fff
    style API fill:#F59E0B,stroke:#333,color:#000
    style Backend fill:#22C55E,stroke:#333,color:#fff
    style Data fill:#3B82F6,stroke:#333,color:#fff
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18.3 | UI Framework |
| **State** | Zustand | Global State Management |
| **Styling** | Tailwind CSS 4.1 | Utility-First CSS |
| **Animation** | Framer Motion | UI Animations |
| **Backend** | FastAPI | REST API Framework |
| **Runtime** | Python 3.11 | Backend Language |
| **LLM** | Groq (LLaMA 3.3 70B) | Root Cause Analysis |
| **Vision** | HuggingFace (BLIP) | Image Understanding |
| **Database** | Firebase Realtime | Panel Telemetry |
| **Storage** | Supabase | AI Results Archive |
| **Build** | Vite | Frontend Build Tool |

---

## Scaling Considerations

1. **Horizontal Scaling**: Backend can be deployed across multiple instances
2. **Caching**: Firebase provides built-in caching for read operations
3. **Async Processing**: AI analysis runs asynchronously to prevent blocking
4. **Rate Limiting**: Groq API calls are rate-limited to manage costs
5. **CDN**: Static assets served via CDN for global performance

---

*Last Updated: February 2026*
]]>
