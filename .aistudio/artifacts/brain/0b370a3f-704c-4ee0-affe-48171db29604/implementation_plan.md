# Awaaz (آواز) — Civic Reporting for Peshawar, KP

A mobile-first civic reporting progressive web app empowering citizens of Peshawar, Khyber Pakhtunkhwa to report local municipal issues (garbage, broken roads, water pipelines, electricity hazards, traffic gridlock, safety risks) via voice notes in Pashto, Urdu, or English, camera photos, and GPS. An integrated Gemini multimodal intelligence backend automatically classifies, transcribes, estimates severity (1–5), routes to relevant provincial departments, and produces bilingual English/Urdu summaries.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification:
> - **Admin Map Interface**: Visual map toggle with side-by-side coordinates, interactive Peshawar district zones, and severity-colored markers.
> - **Pre-seeded Demonstrations**: Includes authentic Peshawar sample complaints across Hayatabad, Saddar, University Town, and Qissa Khwani.
> - **Audio Review Experience**: Clean audio playback player with duration timer, waveform visualizer, and delete/replace controls.

- **Confirmed Decision 1**: One-shot multimodal Gemini analysis via server-side endpoint (`/api/analyze-report`) processing image, voice recording, and optional notes in a single structured JSON schema call.
- **Confirmed Decision 2**: Local storage persistence with initial realistic Peshawar civic reports, allowing instant offline/local testing while tracking live user-submitted complaints.
- **Confirmed Decision 3**: Urdu and English dual-script display with prominent Urdu Nastaliq-friendly typographic styling alongside crisp English summaries.

---

## 1. Overview & Core Concept

- **What It Does**: Awaaz ("Voice") allows citizens on mobile devices to effortlessly snap a photo of a civic hazard, hold a microphone button to speak in their native tongue (Pashto, Urdu, or English), capture their GPS coordinates (with Peshawar landmark fallbacks), and submit. Gemini's multimodal engine parses the photo and speech audio simultaneously, transcribing spoken complaints, gauging risk severity, and assigning the report to appropriate departments (WSSP, PDA, PESCO, Traffic Police Peshawar, Rescue 1122).
- **Target Audience / Persona**: Peshawar residents, commuters, shopkeepers, and local council representatives across urban and rural union councils of Peshawar District.
- **Key Value**: Eliminates administrative friction and language barriers—citizens who cannot easily write formal complaint letters can simply speak into their phone and take a picture.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Citizen Report Tab**:
   - Camera trigger (live capture or gallery upload) with instant thumbnail preview and retake.
   - Hold-to-record microphone button with live recording timer, pulsating visual ring, and playback control (play, pause, delete/re-record).
   - Optional text description for extra context.
   - GPS location banner: Auto-detects device coordinates with reverse-geocoding approximation for Peshawar areas (or manual dropdown selector for well-known Peshawar zones: Hayatabad, Saddar, University Town, Gulbahar, Kohat Road, City Circular Road, Ring Road).
   - Submit action button with active state & multi-step AI analysis loader ("Listening to audio...", "Analyzing hazard in photo...", "Generating bilingual dispatch...").
   - Instant confirmation card displaying category chip, severity badge (1–5), detected language, transcribed audio text, assigned municipal department, and bilingual English/Urdu summaries.
2. **My Complaints Tab**:
   - Chronological list of user-submitted complaints.
   - Status indicators (`Received`, `Assigned`, `Resolved`) with status timeline tracker.
   - Detailed complaint dialog showing the original photo, audio player, timestamp, GPS coordinates, and department routing.
3. **Admin Dashboard Tab**:
   - Executive metric cards: Total Complaints, High Priority (Severity 4-5 / Emergencies), In Progress / Assigned, and Resolved.
   - Filter bar: Filter by Category (Waste, Road, Water, Electricity, Traffic, Safety) and Status.
   - Priority queue table/cards sorted by severity with quick status updater (`Received` → `Assigned` → `Resolved`).
   - Visual Map View: Peshawar zone map visualization with color-coded pins (Red: 5, Orange: 4, Amber: 3, Blue: 2, Green: 1) and toggle between interactive spatial pin view and zone summary.

### Visual Identity & Theme
- **Color Palette**:
  - Primary Teal: `#0D9488` (Teal 600) & `#115E59` (Teal 800) representing civic trust, clean public infrastructure, and KP greenery.
  - Accent Terracotta / Orange: `#EA580C` (Orange 600) & `#F97316` (Orange 500) for alerts, critical action items, and Peshawar's historic brickwork.
  - Background & Surfaces: Crisp daylight light mode (`#F8FAFC` slate-50) with clean white elevated rounded cards (`rounded-2xl` and `rounded-3xl`), subtle slate borders (`border-slate-200/80`), and warm dark mode support.
- **Typography & Hierarchy**:
  - Modern sans-serif (`Inter`, system sans) paired with high-legibility Urdu script rendering for `summary_urdu` (`Noto Nastaliq Urdu`, `system-ui`, RTL layout).
  - Clear visual contrast for outdoor mobile readability.
- **Thumb-Zone Mobile Ergonomics**:
  - Bottom navigation bar anchoring Report, My Complaints, and Admin tabs with $48\text{px}$ touch targets.
  - Primary hold-to-record mic button placed comfortably in the lower natural reach zone.

---

## 3. Key Product Decisions & Trade-Offs

- **Server-Side Gemini 3.8 Flash Multimodal Call**:
  - *Chosen Approach*: Route the request through an Express backend endpoint `/api/analyze-report` that accepts `photoBase64`, `audioBase64` (`audio/webm` or `audio/wav`), and `text`. It calls `ai.models.generateContent` with `model: "gemini-3.8-flash"`, passing both inline media parts and a structured JSON schema.
  - *Why*: Securely isolates `process.env.GEMINI_API_KEY` on the server as mandated, avoiding client leaks. Multimodal ingestion allows Gemini to cross-reference what is visible in the photo with what the citizen said in Pashto or Urdu.
- **Pashto, Urdu, & English Multilingual Prompting**:
  - *Chosen Approach*: Provide explicit Peshawar domain instructions in the Gemini system instruction: recognizing local vernacular, Peshawar landmark references (e.g., Khyber Teaching Hospital, Edwards College, Lady Reading Hospital, Ring Road, Bacha Khan Chowk), and escalating hazard severity if adjacent to schools, hospitals, or congested bazaars.
- **Dual Map Presentation in Admin View**:
  - *Chosen Approach*: A responsive visual coordinate map canvas displaying Peshawar's geographical layout, zones, and severity pins, accompanied by a side-by-side coordinate details list and quick filter toggle.
  - *Why*: Gives admins immediate visual triage of cluster hotspots across Peshawar without third-party API key dependencies.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Awaaz Client (Mobile PWA)                    │
│                                                                 │
│  ┌─────────────────┐  ┌────────────────────┐  ┌──────────────┐  │
│  │   Report Tab    │  │ My Complaints Tab  │  │  Admin Tab   │  │
│  │ Camera + Voice  │  │ Status Tracking    │  │ Priority Q   │  │
│  │ + GPS Location  │  │ Timeline & Detail  │  │ + Visual Map │  │
│  └────────┬────────┘  └─────────▲──────────┘  └──────▲───────┘  │
│           │                     │                    │          │
│           ▼                     │                    │          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ LocalStorage Civic Store (Complaints, Pre-seeded Peshawar)│  │
│  └──────────────────────────────┬────────────────────────────┘  │
└─────────────────────────────────┼───────────────────────────────┘
                                  │ POST /api/analyze-report
                                  │ (photoBase64, audioBase64, text, gps)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│               Node.js / Express Server (server.ts)              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Gemini 3.8 Flash Multimodal Inference                     │  │
│  │ - System Prompt: Peshawar Civic Triage                    │  │
│  │ - Multimodal: [Image Part, Audio Part, Text Part]         │  │
│  │ - Output: Strict JSON Schema (Category, Severity, Urdu...)│  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Multimodal Schema Output
```json
{
  "category": "waste | road | water | electricity | traffic | safety | other",
  "severity": 1,
  "summary": "One sentence summary in English",
  "summary_urdu": "ایک جملے کا اردو خلاصہ",
  "department": "WSSP | PDA | PESCO | Traffic Police | Rescue 1122",
  "language_detected": "Pashto | Urdu | English",
  "transcript": "Transcribed spoken audio or synthesized complaint context",
  "is_emergency": false
}
```

### Complaint Entity Model
- `id`: Unique UUID
- `timestamp`: ISO timestamp
- `photoUrl`: Data URL or image reference
- `audioUrl`: Data URL for recorded voice note
- `userText`: Optional user-entered text
- `location`: `{ latitude: number, longitude: number, areaName: string, address: string }`
- `aiAnalysis`: Structured Gemini output
- `status`: `'received' | 'assigned' | 'resolved'`
- `statusHistory`: Array of `{ status, timestamp, note }`
- `assignedDepartment`: string

---

## Verification Plan

### Automated & Build Verification
1. **TypeScript & Build Validation**: Run `compile_applet` to verify clean compilation with no type errors or broken imports.
2. **API Endpoint Testing**: Verify Express `/api/analyze-report` handles photo-only, audio-only, text-only, and full multi-input payloads gracefully with fallback error handling.

### End-to-End User Flow Testing
1. **Citizen Submission Flow**:
   - Capture photo / upload sample civic image.
   - Record voice note with hold-to-record mic; verify audio playback and delete/re-record capability.
   - Verify GPS coordinates auto-capture and manual area selector fallback (e.g. Hayatabad Phase 3).
   - Submit report and verify loading animation, followed by clean bilingual response card.
2. **My Complaints Flow**:
   - Verify the newly created complaint appears immediately in "My Complaints" with "Received" status chip.
   - Test expanding complaint details and playing back the recorded voice note.
3. **Admin Dashboard Flow**:
   - Inspect stat cards (Total, High Priority, Resolved).
   - Test filtering by category and status.
   - Update complaint status from Received to Assigned, then Resolved, and observe state reflection across tabs.
   - Switch between visual map and zone coordinate overview, verifying pins correspond to complaint severity.
