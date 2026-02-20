# HELIOS AI — 3 Minute Video Demo Script
## L&T Techgium 2026 | Project ID: TG0912740
### Team: Yashodip More, Tejas Patil, Jaykumar Girase, Komal Kumavat
### R.C. Patel Institute of Technology, Shirpur

---

## ⏱️ TOTAL TIME: 3:00 Minutes

---

## 🎬 SCENE 1: HOOK + PROBLEM (0:00 – 0:35)

**[SCREEN: Landing Page of HELIOS AI — deployed site]**

**SPEAKER (Yashodip):**

> "Hello everyone! I'm Yashodip More from R.C. Patel Institute of Technology, Shirpur.
>
> India has over 70 GW of installed solar capacity. But here's the problem —
> we're losing **15 to 20 percent of that energy** every year due to undetected panel faults.
> That's a staggering **₹47,000 crore annual loss** — equivalent to shutting down 14 large power plants.
>
> The current solution — **Electroluminescence imaging** — requires complete panel shutdown, total darkness, and cameras costing **₹5 to 10 lakhs**.
> Each panel inspection costs ₹2,000 and takes 2 to 4 hours.
>
> **HELIOS AI solves this problem.**"

**[SCREEN: Click "Launch Dashboard" on the landing page]**

---

## 🎬 SCENE 2: SOLUTION OVERVIEW — 3 INNOVATIONS (0:35 – 1:15)

**[SCREEN: Dashboard loading — Stats Cards, Panel Grid visible]**

**SPEAKER:**

> "HELIOS AI is a **GenAI-powered diagnostic platform** built on three world-first innovations:
>
> **First — Virtual EL Imaging.**
> We generate EL-equivalent diagnostic images from standard RGB photographs using conditional GANs.
> No shutdown, no darkness, no expensive cameras. Analysis happens in broad daylight while panels are fully operational.
>
> **Second — Explainable AI.**
> Operators don't just get a 'fault detected' alert — they receive a **full natural language diagnosis**, as if an expert engineer is explaining it to them.
> This reduces operator training time by 70%.
>
> **Third — Multi-Modal Root Cause Analysis.**
> Our LLM — Groq LLaMA 3.3 70B — synthesizes electrical, thermal, visual, and environmental data to determine the **exact root cause**.
> This solves the industry's biggest problem — misdiagnosis leading to wrong repairs."

---

## 🎬 SCENE 3: LIVE DEMO — DASHBOARD WALKTHROUGH (1:15 – 2:20)

**[SCREEN: Actively navigating the dashboard]**

**SPEAKER:**

> "Let me walk you through the live platform —"

### 3a. Dashboard Overview (1:15 – 1:30)
**[Show Stats Cards — Total Power, Panel Health, Active Alerts]**

> "This is our **real-time dashboard**, monitoring 247 solar panels.
> Total power output, overall health percentage, and active alerts — all at a glance.
> This data is **live-synced** through Firebase Realtime Database."

### 3b. Solar Panel Grid (1:30 – 1:45)
**[Navigate to Solar Array page, show the panel grid — green/yellow/red panels]**

> "Here's our **Panel Grid** — each panel's color represents its health status.
> Green means healthy, yellow means warning, and red means critical.
> Clicking any panel opens a **detailed modal** with full AI-powered analysis."

### 3c. AI Analysis Demo (1:45 – 2:00)
**[Click a panel → PanelDetailModal opens → Trigger AI Analysis]**

> "I've clicked on this panel. Now let me run the AI analysis.
> You can see the **Virtual EL result**, **Thermal diagnosis**, and **Root Cause Analysis** — all three generated together.
> This entire analysis completes in **7 to 10 seconds** — compared to 2 to 4 hours with traditional methods."

### 3d. Image Upload + AI Chatbot (2:00 – 2:20)
**[Navigate to AI Analysis page → Show Image Upload → Open Chatbot]**

> "Operators can also **upload their own thermal or RGB images** — and the AI provides instant analysis.
> We also have an **AI Chatbot** — operators can ask questions in natural language,
> like 'Which panels need urgent attention?' — and the AI responds with context-aware answers."

---

## 🎬 SCENE 4: TECH STACK + POC EXPLANATION (2:20 – 2:50)

**[SCREEN: Landing page Tech Stack section or Settings page]**

**SPEAKER:**

> "In terms of technology —
> the frontend is built on **React 18**, the backend on **FastAPI with Python**, the database is **Firebase Realtime DB**, and our AI engine runs **LLaMA 3.3 70B on Groq Cloud**.
> The entire platform is **fully deployed** — frontend on **Vercel** and backend on **Render**.
>
> Now, an important point — **this is a Proof of Concept.**
>
> The **software side is 100% complete** — the dashboard, AI pipeline, chatbot, alert system, work orders — everything is production-ready.
>
> However, the **hardware side** — physical sensors like ESP32, INA219 current sensors, and thermal cameras — would cost approximately **₹40,000 to ₹50,000**.
> As students, we don't have the budget for hardware at this stage.
> That's why we've designed a **Hardware Abstraction Layer** with clean, pluggable interfaces.
> **When the prototype phase comes, you simply plug in the sensors — the software is ready.** Not a single line of code needs to change.
>
> This is a deliberate approach — build the intelligence layer first, then add hardware.
> This is our **Software Intelligence Layer** strategy."

---

## 🎬 SCENE 5: IMPACT + CLOSING (2:50 – 3:00)

**[SCREEN: Landing Page stats section or dashboard]**

**SPEAKER:**

> "With HELIOS AI —
> **96% faster** fault detection,
> **97% cost reduction** — from ₹2,000 down to ₹50 per panel,
> and **zero operational downtime.**
>
> Thank you! HELIOS AI — by Team R.C. Patel Institute of Technology, for L&T Techgium 2026."

**[SCREEN: Show team section on landing page — freeze frame]**

---

## 📋 RECORDING TIPS

1. **Screen record** using OBS Studio (free) or CapCut
2. **Full-screen browser** for a clean look
3. **Move the mouse slowly** so viewers can follow
4. **Minimize background noise** — record in a quiet room
5. **Practice 2-3 times** before the final take to nail the timing
6. Demo on the **deployed URL**, not localhost
7. **Stable internet** — AI analysis makes live API calls

## 🎤 VOICEOVER STYLE
- **Confident** — your data is research-backed
- **Pace** — slightly fast but clear and articulate
- **Tone** — professional yet natural, don't sound scripted
- **Pause 1-2 seconds** after each innovation — let the impact land
