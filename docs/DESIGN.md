# 🎨 HELIOS AI - Design System

## Design Philosophy

HELIOS AI follows an **Enterprise-Grade Industrial Design** language, combining professional aesthetics with high-information density for solar farm operators.

---

## Brand Identity

### Logo

```
██╗  ██╗███████╗██╗     ██╗ ██████╗ ███████╗     █████╗ ██╗
██║  ██║██╔════╝██║     ██║██╔═══██╗██╔════╝    ██╔══██╗██║
███████║█████╗  ██║     ██║██║   ██║███████╗    ███████║██║
██╔══██║██╔══╝  ██║     ██║██║   ██║╚════██║    ██╔══██║██║
██║  ██║███████╗███████╗██║╚██████╔╝███████║    ██║  ██║██║
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝ ╚═════╝ ╚══════╝    ╚═╝  ╚═╝╚═╝
```

**HELIOS** - Named after the Greek god of the Sun, representing our mission to illuminate solar panel health through AI.

### Color Palette

```mermaid
graph LR
    subgraph Primary["🔵 Primary"]
        P1["#0EA5E9<br/>Sky Blue<br/>Primary Actions"]
        P2["#0284C7<br/>Sky 600<br/>Hover States"]
        P3["#0369A1<br/>Sky 700<br/>Active States"]
    end
    
    subgraph Status["🚦 Status Colors"]
        S1["#22C55E<br/>Green<br/>Healthy"]
        S2["#F59E0B<br/>Amber<br/>Warning"]
        S3["#EF4444<br/>Red<br/>Critical"]
    end
    
    subgraph Neutral["⬜ Neutrals"]
        N1["#0F172A<br/>Slate 900<br/>Background"]
        N2["#1E293B<br/>Slate 800<br/>Cards"]
        N3["#334155<br/>Slate 700<br/>Borders"]
    end
    
    style Primary fill:#0EA5E9,stroke:#333,color:#fff
    style Status fill:#F59E0B,stroke:#333,color:#000
    style Neutral fill:#1E293B,stroke:#333,color:#fff
```

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Hero Title | System UI | Bold (700) | 56-72px |
| Section Headers | System UI | Semi-bold (600) | 32-40px |
| Card Titles | System UI | Medium (500) | 18-20px |
| Body Text | System UI | Normal (400) | 14-16px |
| Labels/Captions | System UI | Medium (500) | 12px |
| Monospace (Data) | JetBrains Mono | Normal (400) | 14px |

---

## Component Library

### Status Indicators

```mermaid
graph LR
    subgraph Health["Panel Health Status"]
        H1[🟢 Healthy<br/>90-100%]
        H2[🟡 Warning<br/>70-89%]
        H3[🔴 Critical<br/>< 70%]
    end
    
    subgraph Severity["Alert Severity"]
        A1[🔴 Critical<br/>Immediate Action]
        A2[🟠 High<br/>24hr Response]
        A3[🟡 Medium<br/>7-day Schedule]
        A4[🔵 Low<br/>Monthly Review]
    end
```

### Card Designs

#### Metric Card
```
┌──────────────────────────────────────────┐
│  ⚡ Total Power                          │
│                                          │
│    62.45 kW                            │
│    ████████████████░░░░  78%            │
│    ▲ 5.2% from yesterday                │
└──────────────────────────────────────────┘
```

#### Panel Tile
```
┌────────────────────────────────────────┐
│  🟢 PNL-A01-001                       │
│  ─────────────────────────────        │
│  ⚡ 266.5W    🌡️ 45.2°C             │
│  ─────────────────────────────        │
│  Efficiency: ████████████ 96.5%       │
└────────────────────────────────────────┘
```

---

## Page Layouts

### Landing Page Structure

```mermaid
graph TB
    subgraph Hero["Hero Section"]
        Nav[Navigation Bar]
        HeroContent[Hero Title + CTA]
        Preview[Dashboard Preview Cards]
    end
    
    subgraph Features["Features Section"]
        F1[Virtual EL Imaging]
        F2[Thermal Analysis]
        F3[Root Cause AI]
        F4[Real-time Monitoring]
    end
    
    subgraph Tech["Technology Stack"]
        TechGrid[Tech Stack Icons]
    end
    
    subgraph CTA["Call to Action"]
        FinalCTA[Explore Dashboard Button]
    end
    
    Hero --> Features
    Features --> Tech
    Tech --> CTA
```

### Dashboard Layout

```mermaid
graph TB
    subgraph Header["Header Bar"]
        Logo[HELIOS Logo]
        Search[Search]
        Profile[User Profile]
    end
    
    subgraph Main["Main Content"]
        direction TB
        Stats[Stats Cards Row<br/>4 KPI Cards]
        PanelGrid[Panel Grid<br/>247 Panels]
    end
    
    subgraph Sidebar["Right Sidebar"]
        Alerts[Alert Panel<br/>Live Notifications]
    end
    
    Header --> Main
    Main --> Sidebar
```

---

## Animation Guidelines

### Timing Functions

```css
/* Standard easing curves */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);  /* General UI */
--ease-out: cubic-bezier(0, 0, 0.2, 1);        /* Elements entering */
--ease-in: cubic-bezier(0.4, 0, 1, 1);         /* Elements exiting */
--spring: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Bouncy */
```

### Duration Standards

| Animation Type | Duration |
|----------------|----------|
| Micro (hover states) | 150ms |
| Standard (transitions) | 300ms |
| Elaborate (modals) | 400ms |
| Complex (page transitions) | 500ms |

### Framer Motion Presets

```javascript
// Fade In Up
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// Stagger Children
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Scale on Hover
const scaleHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};
```

---

## Visual Effects

### Glassmorphism

```css
/* Glass card effect */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

### Gradients

```mermaid
graph LR
    subgraph Gradients["Key Gradients"]
        G1["Primary CTA<br/>from-sky-500 to-blue-600"]
        G2["Success<br/>from-green-500 to-emerald-600"]
        G3["Warning<br/>from-amber-500 to-orange-600"]
        G4["Critical<br/>from-red-500 to-rose-600"]
        G5["Background<br/>from-slate-900 to-slate-950"]
    end
    
    style G1 fill:#0EA5E9,stroke:#333,color:#fff
    style G2 fill:#22C55E,stroke:#333,color:#fff
    style G3 fill:#F59E0B,stroke:#333,color:#000
    style G4 fill:#EF4444,stroke:#333,color:#fff
    style G5 fill:#0F172A,stroke:#333,color:#fff
```

### Glow Effects

```css
/* Status glow */
.healthy-glow { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
.warning-glow { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
.critical-glow { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }

/* Pulsing critical indicator */
@keyframes critical-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.6); }
}
```

---

## Responsive Breakpoints

```mermaid
graph LR
    Mobile["📱 Mobile<br/>< 640px"]
    Tablet["📱 Tablet<br/>640-1024px"]
    Desktop["🖥️ Desktop<br/>1024-1440px"]
    Large["🖥️ Large<br/>> 1440px"]
    
    Mobile --> Tablet --> Desktop --> Large
    
    style Mobile fill:#3B82F6,stroke:#333,color:#fff
    style Tablet fill:#8B5CF6,stroke:#333,color:#fff
    style Desktop fill:#22C55E,stroke:#333,color:#fff
    style Large fill:#F59E0B,stroke:#333,color:#000
```

### Grid System

| Screen | Columns | Panel Grid |
|--------|---------|------------|
| Mobile | 1 | 2 panels/row |
| Tablet | 2 | 4 panels/row |
| Desktop | 3 | 8 panels/row |
| Large | 4 | 12 panels/row |

---

## Accessibility

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 for text
- **Focus States**: Visible focus rings on all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Proper ARIA labels and roles
- **Reduced Motion**: Respects `prefers-reduced-motion`

### Color Blind Safe Palette

```mermaid
graph LR
    subgraph Standard["Standard View"]
        S1[🟢 Green]
        S2[🟡 Amber]
        S3[🔴 Red]
    end
    
    subgraph Alternative["Color Blind Mode"]
        A1[✓ Check Mark]
        A2[⚠ Caution Icon]
        A3[✕ X Mark]
    end
    
    S1 --> A1
    S2 --> A2
    S3 --> A3
```

---

## Icon System

Using **Heroicons** and **Lucide React** for consistent iconography:

| Category | Icons |
|----------|-------|
| Navigation | `Home`, `Menu`, `Search`, `Settings` |
| Status | `CheckCircle`, `AlertTriangle`, `XCircle` |
| Energy | `Zap`, `Sun`, `Battery`, `Thermometer` |
| Actions | `Play`, `Refresh`, `Download`, `Share` |
| Data | `TrendingUp`, `TrendingDown`, `Activity` |

---

## Dark Mode (Default)

HELIOS AI primarily uses a dark theme for:
1. **Reduced Eye Strain**: Operators monitoring 24/7
2. **Better Data Visibility**: High contrast for metrics
3. **Energy Efficiency**: Lower power on OLED displays
4. **Professional Aesthetic**: Industrial monitoring standard

---

*Design System Version: 1.0 | Last Updated: February 2026*
]]>
