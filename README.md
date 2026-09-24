# MindFlow — Engineering Student Burnout Prediction & Wellbeing Platform

> **Study smarter. Code better. Recover better.**

MindFlow is a full-stack, AI-assisted burnout prediction and mental wellbeing platform built specifically for **engineering students** and **academic institutions**. It combines real-time student workload monitoring (DSA, labs, coding practice, semester projects, exam preparation) with automated fatigue analysis, personalized recovery nudges, interactive micro-breaks, and a secure **Faculty/Admin Early Intervention Portal**.

---

## 📌 Problem Being Solved

Engineering students often face a compounding cycle of heavy academic pressure:
* Overlapping assignment deadlines, semester projects, and high-stakes lab evaluations.
* Relentless competitive programming and technical placement preparation.
* Irregular sleep patterns and prolonged, uninterrupted screen time.
* Reluctance or stigma around seeking academic support until burnout leads to crisis.

MindFlow addresses this by providing:
1. **Early Burnout Detection**: Mathematical and AI-driven modeling that detects fatigue signals *before* academic performance or mental health collapses.
2. **Actionable Recovery Guidance**: Smart daily scheduling, focus timers, mindful breathing exercises, and micro-break resets.
3. **Institutional Support (Faculty Portal)**: Confidential, non-punitive visibility for university mentors to review flagged students, schedule counseling, adjust academic deadlines, and maintain an immutable compliance audit trail.

---

## ⚙️ How MindFlow Works

```
                                 ┌────────────────────────────────────────────────┐
                                 │             Student Client (React 19)          │
                                 │  Dashboard • Tasks • Timer • AI • Planner      │
                                 └───────────────────────┬────────────────────────┘
                                                         │ HTTP / REST API (JWT)
                                                         ▼
┌────────────────────────────────┐       ┌────────────────────────────────────────┐
│     Faculty & Admin Portal     │       │            Node.js / Express           │
│  Directory • Alerts • Insights ├──────►│  RBAC Middleware: Student/Faculty/Admin│
│  Thresholds • Audit Compliance │       └───────────────────┬────────────────────┘
└────────────────────────────────┘                           │
                                         ┌───────────────────┴────────────────────┐
                                         ▼                                        ▼
                             ┌───────────────────────┐                ┌───────────────────────┐
                             │  PostgreSQL + Prisma  │                │   Google Gemini API   │
                             │  Students, Alerts,    │                │  Multiturn Assistant  │
                             │  Check-ins, Logs      │                │  + Rule Fallback      │
                             └───────────────────────┘                └───────────────────────┘
```

1. **Daily Check-Ins**: Students log sleep hours, study hours, breaks taken, stress levels, energy, and primary workloads in a quick 15-second pulse check.
2. **Burnout Prediction Calculation**: The platform analyzes academic pressure (upcoming deadlines, exam proximity, continuous focus duration) against recovery metrics (sleep deficit relative to target, break frequency) to compute an objective **Burnout Risk Score (0–100)**.
3. **Supportive Nudges**: High fatigue prompts smart daily study schedule adjustments, Pomodoro intervals capped at 45 minutes, and cognitive resets.
4. **Faculty Escalation**: When a student's score crosses configured institutional thresholds (e.g., $\ge 70$ or $\ge 80$), an automated `BurnoutAlert` is created with cooldown deduplication, alerting assigned department faculty for early supportive intervention.

---

## 🚀 Implemented Features

### 1. Student Wellbeing Portal
* **Dynamic Personalized Header**: Greets the authenticated user dynamically with contextual time-of-day greetings and current date.
* **Global Light & Dark Mode**: Persistent theme switcher in the top navigation supporting seamless switching across all cards, modals, inputs, and charts.
* **Burnout Risk Engine (`0–100`)**:
  * Four risk tiers: **Low** ($<30$), **Moderate** ($30–59$), **High** ($60–79$), and **Critical** ($\ge 80$).
  * Contributing factor breakdowns (Workload %, Sleep %, Stress %, Breaks %).
  * Positive protecting factors and negative pressure factors explained in plain language.
* **Task Management & Smart Prioritization**:
  * Categorization: `DSA`, `CODING_PRACTICE`, `PROJECT`, `LAB`, `ASSIGNMENT`, `EXAM_PREP`, `PLACEMENT_PREP`, `ACADEMIC`, `OTHER`.
  * Priority levels (`HIGH`, `MEDIUM`, `LOW`) with deadline tracking and status toggle.
  * Smart recommendation algorithm that suggests the next best task based on urgency, difficulty, and current burnout risk.
* **Focus Timer (Pomodoro & Deep Work)**:
  * Modes: Pomodoro (25m work / 5m break), Deep Work (50m work / 10m break), and Custom.
  * Activity tagging, streak tracking, daily goal rings, and focus point awards (+25 pts).
* **AI Wellbeing Assistant**:
  * Engineering-specific mental health conversational companion powered by Google Gemini (with deterministic offline rule-based fallback).
  * Formatted output with structured action steps, burnout callouts, and interactive prompt buttons.
* **Smart Daily Study Planner & Exam Mode**:
  * Auto-generates structured daily study plans with automatic 10-minute mindful recovery breaks.
  * Exam revision checklists tracking topic-by-topic readiness and exam dates.
* **Wellbeing Games & Cognitive Micro-Breaks**:
  * **Stress Bubbles**: Interactive 30-second bubble popping canvas with audio feedback.
  * **Memory Match**: Timed card-matching memory challenge featuring wellbeing icons.
  * **4-4-6 Mindful Breathing**: Guided breathing circle animation with visual and audio chimes.
* **Engineering Analytics**:
  * Visual distribution of weekly hours spent across technical domains.
  * Recharts correlation plots: Workload vs. Sleep vs. Stress vs. Burnout trends.
* **Privacy, Anonymous Mode & Data Sovereignty**:
  * One-click Anonymous Mode (masks real student name and email across all views).
  * GDPR/compliance data overview explaining stored attributes.
  * Full data export in JSON and CSV formats.
  * Account deletion with cascading database purge.

### 2. Faculty & Admin Portal
* **Role-Based Access Control (RBAC)**: Secure separation between `STUDENT`, `FACULTY`, and `ADMIN` users via backend middleware and React route guards.
* **Faculty Dashboard**:
  * Real-time metrics: Total Monitored Students, Critical Risk Count, High Risk Count, and Active Interventions.
  * Urgent Burnout Alert banner highlighting unreviewed critical cases.
  * Visual Risk Distribution bar chart and department risk index rankings.
* **Student Directory & Registry**:
  * Search by student name, email, or student ID.
  * Multi-filter controls: Department, Academic Year, and Risk Level.
  * Status badges and direct links to comprehensive student profiles.
* **Student Detail Wellbeing Profile**:
  * 14-day interactive Recharts burnout score trajectory with threshold reference lines.
  * Flagged risk drivers (sleep deficit, task load, consecutive study hours).
  * Historical check-in log and pending task lists.
  * Intervention timeline and modal to record confidential support actions.
* **Burnout Alerts & Escalations**:
  * Filter alerts by status: `UNREVIEWED`, `IN_PROGRESS`, `REVIEWED`, and `RESOLVED`.
  * Filter by severity: `CRITICAL` ($\ge 80$) and `HIGH` ($60–79$).
  * Action workflows: Mark Reviewed, Add Intervention Note, and Resolve Alert.
  * Categorized action types: `NOTE`, `CONTACTED_STUDENT`, `ACADEMIC_ADJUSTMENT`, `COUNSELLING_REFERRED`, `RESOLVED`.
* **Institutional Analytics**:
  * Department risk index comparison bar charts.
  * Campus-wide weekly burnout score trajectory.
  * Check-in participation telemetry.
* **Live Wellbeing Activity Stream**:
  * Real-time audit timeline of student check-ins, stress spikes, alert triggers, and faculty notes.
* **Admin Thresholds & Sensitivity Settings**:
  * Configurable institution thresholds: Standard Alert Threshold, High Risk Limit, Critical Limit, and Alert Cooldown Days.
  * Faculty onboarding interface to invite and assign faculty mentors to departments.
* **System Compliance & Audit Trail**:
  * Immutable event log capturing user ID, role, action, target entity, timestamp, and JSON metadata.

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | `^19.0.0` | Declarative UI component library |
| **Vite** | `^6.1.0` | High-speed frontend build tool and dev server |
| **Tailwind CSS** | `^3.4.17` | Utility-first CSS framework with dark mode support |
| **React Router** | `^7.1.5` | Client-side routing and protected route guards |
| **Recharts** | `^2.15.1` | Responsive data visualization and trend charts |
| **Lucide React** | `^0.475.0` | Accessible modern iconography |
| **Axios** | `^1.7.9` | HTTP client with JWT request/response interceptors |
| **Canvas Confetti** | `^1.9.4` | Gamification celebrations upon task/session completion |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | `>=18.0.0` | JavaScript server runtime environment |
| **Express.js** | `^4.21.2` | RESTful API server framework |
| **Prisma ORM** | `^6.4.1` | Next-generation type-safe database ORM |
| **PostgreSQL** | `14+ / 18` | Relational database engine |
| **JSON Web Tokens (JWT)** | `^9.0.2` | Stateless authentication and role bearer tokens |
| **bcryptjs** | `^2.4.3` | Secure password hashing |
| **Helmet** | `^8.0.0` | HTTP security headers |
| **CORS** | `^2.8.5` | Cross-Origin Resource Sharing control |
| **Google Generative AI SDK**| `^0.24.0` | Integration with Gemini multimodal/flash models |

---

## 📁 Project Folder Structure

```
MindFlow/
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js                        # HTTP server bootstrapper (Port 5000)
│   ├── prisma/
│   │   ├── schema.prisma                # PostgreSQL Prisma schema & enums
│   │   └── seed.js                      # Synthetic demo seeder (Admin, Faculty, 20 Students)
│   └── src/
│       ├── app.js                       # Express app configuration & middleware
│       ├── config/
│       │   └── db.js                    # Prisma client singleton
│       ├── controllers/
│       │   ├── adminController.js       # Institution settings, faculty & audit logs
│       │   ├── aiController.js          # Chatbot & conversational history
│       │   ├── analyticsController.js   # Student productivity & correlation metrics
│       │   ├── authController.js        # Registration, login, session validation
│       │   ├── checkinController.js     # Daily check-ins & automatic alert triggers
│       │   ├── dashboardController.js   # Student home overview data
│       │   ├── examController.js        # Exam prep & checklist tracking
│       │   ├── facultyController.js     # Faculty monitoring, directory & interventions
│       │   ├── focusController.js       # Pomodoro sessions & streak logs
│       │   ├── gameController.js        # Wellbeing game sessions & mood telemetry
│       │   ├── habitController.js       # Daily habit tracker & log history
│       │   ├── notificationController.js# User notifications & alert dispatches
│       │   ├── plannerController.js     # Automated daily study schedule generator
│       │   ├── privacyController.js     # Anonymous mode, data exports & deletion
│       │   └── taskController.js        # Task CRUD & algorithmic prioritization
│       ├── middleware/
│       │   └── auth.js                  # authenticate, requireFaculty, requireAdmin
│       ├── routes/
│       │   ├── adminRoutes.js
│       │   ├── aiRoutes.js
│       │   ├── analyticsRoutes.js
│       │   ├── authRoutes.js
│       │   ├── checkinRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── examRoutes.js
│       │   ├── facultyRoutes.js
│       │   ├── focusRoutes.js
│       │   ├── gameRoutes.js
│       │   ├── habitRoutes.js
│       │   ├── notificationRoutes.js
│       │   ├── plannerRoutes.js
│       │   ├── privacyRoutes.js
│       │   └── taskRoutes.js
│       └── services/
│           ├── alertService.js          # Alert creation, deduplication & cooldown
│           ├── burnoutService.js        # 0–100 Burnout score calculation algorithm
│           ├── geminiService.js         # Google Gemini integration & fallback
│           └── prioritizationService.js # Task prioritization scoring engine
└── frontend/
    ├── package.json
    ├── vite.config.js                   # Vite config with /api proxy to port 5000
    ├── tailwind.config.js               # Tailwind design system & dark mode classes
    ├── index.html
    └── src/
        ├── main.jsx                     # React entrypoint
        ├── App.jsx                      # Route configurations & role-based guards
        ├── index.css                    # Tailwind directives & global utility styling
        ├── context/
        │   ├── AuthContext.jsx          # User state, token, role flags, anonymous mode
        │   ├── NotificationContext.jsx  # Notification polling & read state
        │   └── ThemeContext.jsx         # Global Light/Dark mode state
        ├── services/
        │   └── api.js                   # Axios client & organized API modules
        ├── utils/
        │   └── confetti.js              # Canvas confetti animations
        ├── components/
        │   ├── checkin/                 # DailyCheckInModal.jsx
        │   ├── dashboard/               # BurnoutCard, TrendChart, TodoList, HabitTracker, etc.
        │   ├── faculty/                 # FacultyLayout, FacultySidebar, FacultyTopbar
        │   └── layout/                  # Student Layout, Sidebar, Topbar
        └── pages/
            ├── AIAssistantPage.jsx      # AI Wellbeing conversational chat
            ├── AnalyticsPage.jsx        # Workload & correlation analytics
            ├── DashboardPage.jsx        # Student home overview
            ├── FocusPage.jsx            # Pomodoro timer & deep work
            ├── GamesPage.jsx            # Micro-break cognitive games
            ├── LoginPage.jsx            # Sign in with 1-click demo account switcher
            ├── MoodCheckInPage.jsx      # Daily wellbeing pulse check
            ├── PlannerPage.jsx          # Schedule generator & exam checklists
            ├── RegisterPage.jsx         # New student onboarding
            ├── SettingsPage.jsx         # Privacy controls & academic profile
            ├── TasksPage.jsx            # Prioritized to-do list
            └── faculty/
                ├── AdminAuditLogsPage.jsx
                ├── AdminSettingsPage.jsx
                ├── FacultyActivityPage.jsx
                ├── FacultyAlertsPage.jsx
                ├── FacultyAnalyticsPage.jsx
                ├── FacultyDashboardPage.jsx
                ├── FacultyStudentDetailPage.jsx
                └── FacultyStudentsPage.jsx
```

---

## 🔐 Authentication & Authorization Flow

MindFlow implements JSON Web Token (JWT) authentication combined with Role-Based Access Control (RBAC):

1. **Sign In**: User submits credentials to `POST /api/auth/login`.
2. **Token Issuance**: The server verifies the bcrypt hash and issues a signed JWT containing `{ userId, role }`.
3. **Storage & Headers**: The token is stored in client `localStorage` and automatically injected into outbound HTTP requests via Axios interceptors: `Authorization: Bearer <token>`.
4. **Access Control**:
   - `authenticate`: Validates JWT signature and loads user model.
   - `requireFaculty`: Restricts endpoints to users with role `FACULTY` or `ADMIN`.
   - `requireAdmin`: Restricts sensitive endpoints exclusively to `ADMIN`.
   - Frontend route guards (`ProtectedRoute`, `FacultyRoute`, `AdminRoute`) prevent unauthorized client routing.
5. **Anonymous Mode**: Students can toggle Anonymous Mode. The server masks real names and emails in client payloads while retaining internal integrity.

---

## 🌐 Main API Routes

### Authentication & Privacy (`/api/auth`, `/api/privacy`)
* `POST /api/auth/register` — Register a student account with initial academic profile.
* `POST /api/auth/login` — Authenticate and receive JWT token and user profile.
* `GET /api/auth/me` — Validate session and retrieve current user context.
* `PATCH /api/privacy/anonymous` — Toggle Anonymous Mode.
* `GET /api/privacy/export` — Export student data as JSON or CSV.
* `DELETE /api/privacy/account` — Purge student account and associated data.

### Student Core APIs
* `GET /api/dashboard` — Aggregated student dashboard data (burnout score, upcoming tasks, habits).
* `GET /api/tasks` & `POST /api/tasks` — List and create academic/engineering tasks.
* `PATCH /api/tasks/:id/complete` — Toggle task completion status.
* `GET /api/tasks/prioritize` — Algorithmic task recommendations.
* `POST /api/checkins` — Submit daily check-in (recalculates burnout risk and triggers alerts).
* `GET /api/checkins` — Check-in history.
* `POST /api/focus/start` & `POST /api/focus/complete/:id` — Track Pomodoro and deep work sessions.
* `POST /api/planner/generate` — Generate burnout-balanced daily study schedule.
* `GET /api/exams` & `POST /api/exams` — Manage semester exams and preparation checklists.
* `POST /api/ai/chat` — Context-aware chat with AI assistant.
* `GET /api/habits` & `PATCH /api/habits/:id/toggle` — Track daily wellbeing habits.
* `POST /api/games/log` — Record micro-break game session and mood change.
* `GET /api/notifications` — Retrieve notifications and alert dispatches.

### Faculty Portal APIs (`/api/faculty` — Requires `FACULTY` or `ADMIN`)
* `GET /api/faculty/dashboard` — Overview KPIs, risk distributions, and recent alerts.
* `GET /api/faculty/students` — Search, filter, and paginate institution students.
* `GET /api/faculty/students/:id` — Detailed student wellbeing profile (automatically writes an audit log).
* `GET /api/faculty/alerts` — List burnout alerts filtered by status and severity.
* `PATCH /api/faculty/alerts/:id/review` — Mark alert as reviewed.
* `PATCH /api/faculty/alerts/:id/resolve` — Mark alert as resolved.
* `POST /api/faculty/alerts/:id/notes` — Log supportive intervention action and notes.
* `GET /api/faculty/analytics` — Aggregated institutional fatigue and participation data.
* `GET /api/faculty/activity` — Live wellbeing activity timeline.

### Administrative APIs (`/api/admin` — Requires `ADMIN`)
* `GET /api/admin/settings` — Get institution threshold parameters.
* `PATCH /api/admin/settings` — Update sensitivity thresholds and alert cooldown days.
* `GET /api/admin/faculty` — View institution faculty list.
* `POST /api/admin/faculty` — Onboard new faculty member.
* `GET /api/admin/audit-logs` — Retrieve immutable compliance audit logs.

---

## 🗄️ Database & Prisma Schema

The application uses PostgreSQL with Prisma ORM. Core models include:

* **Institution**: Organization profile with configurable `burnoutThreshold`, `highThreshold`, `criticalThreshold`, and `alertCooldownDays`.
* **User**: Core entity storing email, password hash, role (`STUDENT`, `FACULTY`, `ADMIN`), department, section, and institution relation.
* **Profile & AcademicProfile**: College name, daily targets, branch, year, semester, enrolled subjects, and workload level.
* **BurnoutScore**: Historical calculation records including 0–100 score, risk level, factor breakdowns, explanation, and positive/negative drivers.
* **DailyCheckIn**: Daily telemetry storing study hours, sleep hours, stress level (1–10), energy level (1–10), mood enum, and primary workload category.
* **Task**: Prioritized to-do items with category enum, priority enum, estimated minutes, and deadlines.
* **FocusSession**: Pomodoro and deep work durations, break durations, points earned, and completion flags.
* **Habit & HabitLog**: Daily habit tracking (Sleep, Exercise, Hydration, Meditation, Breaks).
* **BurnoutAlert**: Automated triggers linking students, institution, risk score, severity, status (`UNREVIEWED`, `REVIEWED`, `IN_PROGRESS`, `RESOLVED`), and factors.
* **InterventionNote**: Supportive actions taken by faculty linked to alerts.
* **AuditLog**: Immutable compliance trail tracking user actions, target types, and metadata.
* **Notification, Nudge, AIConversation, AIMessage, ExamPreparation, Achievement, PlannerSession**.

---

## 📦 Setup and Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **PostgreSQL**: Running instance on `localhost:5432`

---

### Step 1: Clone and Configure Environment

In `backend/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME>?schema=public"
JWT_SECRET="<YOUR_SECURE_JWT_SECRET>"
CLIENT_URL="http://localhost:5173"
AI_API_KEY="<YOUR_OPTIONAL_GEMINI_API_KEY>"
AI_MODEL="gemini-3.6-flash"
```

> **Note**: If `AI_API_KEY` is omitted, MindFlow automatically switches to its built-in rule-based engineering wellbeing advisor.

---

### Step 2: Backend Setup & Database Migration

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Push schema migrations to PostgreSQL
npm run prisma:push

# Seed demo dataset (Institution, Admin, Faculty, 20 Students with historical data)
npm run seed

# Start backend server
npm start
```
The backend will launch at `http://localhost:5000`. Healthcheck: `http://localhost:5000/api/health`.

---

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory in a new terminal
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend will launch at `http://localhost:5173`.

---

## 👥 Demo Accounts & Credentials

The database seeder automatically populates representative accounts across all three user roles:

| Role | Account Name | Email | Password | Primary Portal Route |
|---|---|---|---|---|
| **Student** | Vipin | `vipin@mindflow.edu` | `password123` | `/dashboard` |
| **Student** | Vishal | `vipin@mindflow.edu` | `password123` | `/dashboard` |
| **Faculty** | Prof. Rajesh Sharma (CSE) | `prof.sharma@mindflow.edu` | `password123` | `/faculty/dashboard` |
| **Faculty** | Dr. Priya Patel (IT) | `dr.patel@mindflow.edu` | `password123` | `/faculty/dashboard` |
| **Faculty** | Prof. Alok Gupta (ECE) | `prof.gupta@mindflow.edu` | `password123` | `/faculty/dashboard` |
| **Admin** | Dr. Ramesh Verma (Dean) | `admin@mindflow.edu` | `password123` | `/faculty/admin/settings` |

> **Tip**: The `/login` page features a **Quick Demo Switcher** with one-click auto-fill buttons for Student, Faculty, and Admin personas.

---

## 📊 Current Project Status & Known Notes

* **Platform Status**: Fully functional full-stack application. Both Student and Faculty/Admin portals are fully implemented, verified, and operational.
* **AI Provider**: Uses Google Gemini via `@google/generative-ai`. If an API key is not supplied or if rate limits occur, the application gracefully falls back to deterministic guidance without throwing client errors.
* **Rate Limiting**: Built-in Express in-memory rate limiter configured for 300 requests per 15 minutes per IP.
* **Privacy Compliance**: All faculty data queries are scoped by institution and department; viewing individual student profiles automatically commits an immutable compliance log entry.
