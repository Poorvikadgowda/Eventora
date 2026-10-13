# EVENTORA 🎟️
### "Plan. Automate. Manage. Celebrate."

**Eventora** is a complete, production-grade end-to-end event management automation platform for colleges, universities, student clubs, and event organizers. It automates every facet of the campus event lifecycle: discovery, capacity-capped registration, 15-second rotating dynamic anti-fraud QR check-ins, webcam/upload/manual attendance scanning, cryptographic certificate issuance & public verification, 5-criterion feedback rubrics, 30/40/30 composite Success Score computation, interactive campus maps, and an AI Event Copilot.

---

## 🚀 Key Highlights & Architectural Parity

- **1:1 Visual & Layout Fidelity**: Faithfully recreated using the reference Stitch UI design tokens, including deep navy `#00152A`, `#102A43`, `#0051D5`, `#316BF3`, clean `#F7F9FB` surface cards, Inter typography, and Google Material Symbols Outlined icons.
- **Dual Mode Resiliency**: Works 100% offline out-of-the-box via rich seeded Demo Mode (8 events, 10 students, 25+ registrations, certificates, feedback, campus venues) and supports production FastAPI + SQLite / Supabase PostgreSQL.
- **15-Second Dynamic Anti-Fraud QR Engine**: Dynamically rotates HMAC-SHA256 signed QR tokens every 15 seconds with visual progress rings, pause/resume/regenerate controls, and automatic replay prevention.
- **Tri-Mode Attendance Scanner**: Supports live webcam scanning (via `jsQR`), image file upload scanning, and instant manual USN check-in.
- **Cryptographic Certificate Studio & Vault**: Issues verified credentials with unique certificate numbers (e.g. `CERT-894201-ET25`), SHA-256 digital proof digests, public URL verification at `/verify/:certificateId`, and high-res PDF downloads.
- **5-Criterion Feedback Rubric**: Gathers granular ratings across Organization, Content Quality, Speaker Effectiveness, Venue & Platform, and Overall Value with automated sentiment classification.
- **Algorithmic 30/40/30 Success Score**: Implements the exact composite formula:
  $$\text{Success Score} = (0.30 \times \text{Registration Fill}) + (0.40 \times \text{Attendance Rate}) + (0.30 \times \text{Feedback Score})$$
- **AI Event Copilot**: Generates comprehensive event blueprints, 6-phase agendas, targeted marketing copy, itemized budget breakdowns, and answers natural language operational queries.
- **Interactive Campus Live Map**: Visualizes campus buildings and venues (Auditorium A, Lab 4B, Seminar Hall 3, Science Atrium, Main Sports Arena) with real-time occupancy percentages and temperature telemetry.
- **Global Search (⌘K / Ctrl+K)**: Instant keyboard-driven global search across events, venues, students, certificates, and quick actions.

---

## 🛠️ Technology Stack

### Frontend
- **React 19** & **Vite 6**
- **Tailwind CSS 3** with custom theme palette & tokens
- **React Router 7**
- **Lucide React** & **Google Material Symbols Outlined**
- **Leaflet** (Campus Interactive Map)
- **Recharts** (Success Score & Attendance telemetry)
- **jsQR**, **QRCode**, **jspdf**, **html2canvas**, **canvas-confetti**

### Backend
- **Python 3.10+** / **FastAPI**
- **Uvicorn** ASGI server
- **SQLite 3** (local zero-configuration embedded database `eventora.db`)
- **Pydantic v2** validation schemas
- **HMAC-SHA256** & **PBKDF2** cryptographic engines
- **Supabase PostgreSQL** (dual production configuration)

---

## ⚡ Quick Start

### 1. Launch Everything with 1 Click (Windows)
Double-click:
```cmd
start_all.bat
```
This automatically starts both the FastAPI backend on port `8000` and the Vite frontend on port `5173`.

---

### 2. Manual Startup

#### Frontend
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Backend
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 👤 Demo Accounts & Credentials

The platform includes two pre-configured demo user personas with 1-click role switching:

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Student** | Alexander Wright | `student@eventora.demo` | `demo123` | USN: `1MS22CS042`, Computer Science, 94% Attendance, 6 Certificates |
| **Admin / Organizer** | Dr. Eleanor Vance | `admin@eventora.demo` | `demo123` | Chief Academic Officer & Event Director |

*(You can also use the **Quick Demo Switcher** in the top navigation header or register any new account on `/register`.)*

---

## 🗺️ Application Routes

### Public Pages
- `/` - Landing Page with live hero stats, feature showcase, and upcoming events preview
- `/login` - Login portal with role selector and 1-click demo login buttons
- `/register` - Student & Organizer registration
- `/forgot-password` - Password recovery flow
- `/verify/:certificateId` - Public tamper-evident certificate verification page (e.g. `/verify/CERT-894201-ET25`)

### Student Portal (`/student`)
- `/student` - Student Dashboard (quick stats, active rotating QR pass modal, registered events, notifications)
- `/student/explore` - Explore Events catalog with categories, dates, search, and instant registration
- `/student/events/:id` - Detailed Event View (speakers, 5-phase agenda, venue details, registration actions)
- `/student/attendance` - Attendance History with status badges and check-in methods
- `/student/certificates` - Digital Certificate Vault with preview, cryptographic proof, and PDF download
- `/student/feedback` - 5-Criterion Feedback Rubric submission
- `/student/recommendations` - AI-powered personalized event recommendations
- `/student/map` - Interactive Campus Live Map with venue cards and occupancy tracking
- `/student/notifications` - Real-time alerts and event reminders
- `/student/profile` - Student profile, USN, department, interests, and activity stats

### Admin Portal (`/admin`)
- `/admin` - Executive Admin Dashboard (platform KPI metrics, registration & attendance trends, quick actions)
- `/admin/events` - Events Management list with live filter, status badges, and CRUD controls
- `/admin/events/create` - 3-Step Event Creator (Basic Info, Schedule & Venue, Advanced Anti-Fraud & Certificates)
- `/admin/events/:id` - Admin Event Overview with registered student roster and export tools
- `/admin/qr-scanner` - Tri-Mode Attendance Scanner (Webcam, File Upload, Manual USN check-in)
- `/admin/anti-fraud` - Smart QR Anti-Fraud Dashboard with 15-second rotation controls and security audit log
- `/admin/certificates` - Certificate Studio for template preview, instant issuance, and verification tracking
- `/admin/feedback` - Feedback Analytics with 5-rubric radar breakdown and sentiment distribution
- `/admin/ai-copilot` - AI Event Blueprint Generator with budget breakdown, marketing copy, and operational Q&A
- `/admin/success-score` - 30/40/30 Success Score Leaderboard and mathematical formula inspection
- `/admin/live-map` - Campus Venue Management & real-time occupancy monitor
- `/admin/users` - User directory with role filters and USN search
- `/admin/settings` - Platform settings (attendance thresholds, notification gateways, Supabase sync)

---

## 📡 Backend API Endpoints

| Category | Method | Path | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Service health status and module checklist |
| **Auth** | `POST` | `/api/auth/login` | Authenticate with email and password |
| **Auth** | `POST` | `/api/auth/register` | Register student or admin account |
| **Auth** | `GET` | `/api/auth/me` | Fetch active user profile |
| **Auth** | `PUT` | `/api/auth/profile` | Update profile attributes and interests |
| **Auth** | `GET` | `/api/auth/users` | List platform users with search/role filters |
| **Events** | `GET` | `/api/events` | List events with category, search, and live filters |
| **Events** | `GET` | `/api/events/{id}` | Get event details and agenda |
| **Events** | `POST` | `/api/events` | Create a new campus event |
| **Events** | `PUT` | `/api/events/{id}` | Update event metadata |
| **Events** | `DELETE` | `/api/events/{id}` | Remove event |
| **Events** | `POST` | `/api/events/{id}/register` | Register student for event |
| **Events** | `DELETE` | `/api/events/{id}/register` | Cancel student registration |
| **Dynamic QR** | `POST` | `/api/qr/session` | Initiate rotating dynamic QR session |
| **Dynamic QR** | `GET` | `/api/qr/token/{event_id}` | Fetch active HMAC-SHA256 token and seconds remaining |
| **Dynamic QR** | `POST` | `/api/qr/validate` | Validate scanned token with anti-fraud rules |
| **Attendance** | `POST` | `/api/attendance/scan` | Check-in via scanner, upload, or USN |
| **Attendance** | `GET` | `/api/attendance/event/{id}` | Attendance records for event |
| **Attendance** | `GET` | `/api/attendance/student/{id}` | Student attendance history |
| **Attendance** | `GET` | `/api/attendance/anti-fraud-logs` | Telemetry security audit logs |
| **Certificates**| `GET` | `/api/certificates` | List issued credentials |
| **Certificates**| `GET` | `/api/certificates/verify/{id}` | Public cryptographic verification proof |
| **Certificates**| `POST` | `/api/certificates/generate` | Generate signed certificate |
| **Feedback** | `POST` | `/api/feedback` | Submit 5-criterion rubric rating |
| **Feedback** | `GET` | `/api/feedback/event/{id}` | Rubric averages and comments for event |
| **Feedback** | `GET` | `/api/feedback/analytics` | Sentiment and rubric breakdown |
| **Analytics** | `GET` | `/api/analytics/dashboard` | Overall KPIs and platform success score |
| **Analytics** | `GET` | `/api/analytics/events` | Events ranked by 30/40/30 Success Score |
| **Analytics** | `GET` | `/api/analytics/success-score/{id}` | Detailed score formula breakdown |
| **AI Copilot** | `POST` | `/api/ai/copilot` | Generate event blueprint, copy, budget, or answer |
| **Venues** | `GET` | `/api/venues` | Campus venues and live coordinates |
| **Recomms** | `GET` | `/api/recommendations/{id}` | Personalized event recommendations |
>>>>>>> b73bba3 (Initial commit: Eventora End-to-End Campus Event Management Platform)
