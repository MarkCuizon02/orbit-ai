<div align="center">

# 🪐 Orbit AI

**An AI-powered Life Operating System that organizes your tasks, schedule, habits, fitness, meals, bills, notes, and long-term goals — all in one dashboard.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

</div>

---

## 📖 Purpose / Overview

Orbit AI is a full-stack personal productivity and wellness platform. It combines a React single-page application with an Express backend that calls the **Google Gemini API**, giving users an "AI Copilot" for daily planning and life management.

**What Orbit AI does:**

- **Unified life dashboard** — tasks, schedule, habits, fitness, meals, bills, notes, and goals in one place.
- **Orbit AI Copilot** — an executive-performance-coach style AI that generates daily digests, optimized schedules, task breakdowns, workout plans, meal plans, goal roadmaps, note summaries, and productivity insights.
- **Smart financial tools** — AI bill categorization, bills calendar, budget forecasting, trend charts, debt paydown calculator, emergency fund tracker, and monthly savings targets.
- **Orbit Harmony Score** — a wellness/productivity score banner with daily and weekly AI insights.
- **Firebase integration** — authentication (auth modal), Firestore data persistence, and Firebase Storage support.
- **Polish & motion** — Tailwind CSS v4 styling, Framer Motion / GSAP animations, Three.js 3D landing experience, Lucide icons, Recharts visualizations, and confetti celebrations.

**Architecture at a glance:**

```
Browser (React 19 SPA)
        │
        ▼
Express server (server.ts, port 3000)
  ├── Vite dev middleware (development) / static dist (production)
  ├── GET  /api/health        → health check
  └── POST /api/orbit/ai      → Gemini AI actions (with offline fallback)
        │
        ▼
Google Gemini API (gemini-3.6-flash)  — optional; graceful fallback if no key
```

---

## ✨ Features

| Area | Capabilities |
| --- | --- |
| **Tasks** | Task views, quick-look modal, analytics widget, AI task breakdown |
| **Schedule** | Schedule view, AI hour-by-hour day optimization |
| **Habits** | Habit tracking view with streaks and consistency insights |
| **Fitness** | Fitness view plus AI-customized workout routines |
| **Meals** | Meal planning view plus AI meal plans with macros and grocery lists |
| **Bills & Budget** | Bills calendar, AI expense analyzer, budget forecast/trend charts, debt paydown, emergency fund, savings target |
| **Goals** | Goals view plus AI 3-phase goal roadmaps |
| **Notes** | Notes view plus AI summarization into action items |
| **AI Copilot** | Drawer-based assistant, daily digest, daily/weekly insights, command palette |
| **Onboarding** | Onboarding modal and welcome header for new users |
| **Auth & Data** | Firebase Auth, Firestore, Firebase Storage, local storage layer |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Framer Motion, GSAP, Three.js, Recharts, Lucide React, canvas-confetti
- **Backend:** Node.js, Express 4, tsx (dev), esbuild (prod bundle)
- **AI:** Google Gemini via `@google/genai` (`gemini-3.6-flash`), with a deterministic offline fallback generator
- **Data / Auth:** Firebase 12 (Auth, Firestore, Storage), local storage helpers
- **Tooling:** TypeScript (`tsc --noEmit` type check), Vite, esbuild

---

## 📋 Prerequisites

- **Node.js** 18+ (LTS recommended) and npm
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey) (optional — the app falls back to canned intelligent responses without it)
- A **Firebase project** (optional — needed only for auth/Firestore/Storage features)
- Git

---

## ⚙️ Setup Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MarkCuizon02/orbit-ai.git
   cd orbit-ai
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Copy the example env file and fill in your keys:

   ```bash
   cp .env.example .env
   ```

   | Variable | Required | Description |
   | --- | --- | --- |
   | `GEMINI_API_KEY` | Recommended | Enables live Gemini AI responses for the Orbit Copilot. Without it, the server returns built-in fallback responses. |
   | `APP_URL` | Optional | Public URL where the app is hosted (used for self-referential links/callbacks). |

   > Firebase configuration lives in `src/firebase.ts` and `firebase-applet-config.json`. Update those with your own project credentials if you want cloud auth and data sync.

4. **(Optional) Review Firestore security rules** in `firestore.rules` before deploying to production.

---

## ▶️ Run Instructions

**Development mode** (Vite dev middleware + Express API on port 3000):

```bash
npm run dev
```

Then open **http://localhost:3000** in your browser.

**Production build and run:**

```bash
npm run build   # bundles the frontend (vite build) and server (esbuild → dist/server.cjs)
npm run start   # serves the built app from dist/ on port 3000
```

**Other available scripts:**

| Script | Command | Description |
| --- | --- | --- |
| `npm run dev` | `tsx server.ts` | Start dev server with hot reload (port 3000) |
| `npm run build` | `vite build && esbuild ...` | Build frontend and bundle server to `dist/server.cjs` |
| `npm run start` | `node dist/server.cjs` | Run the production server |
| `npm run preview` | `vite preview` | Preview the built frontend only |
| `npm run lint` | `tsc --noEmit` | Type-check the project (no emit) |
| `npm run clean` | `rm -rf dist server.cjs` | Remove build output |

**Verify the server is healthy:**

```bash
curl http://localhost:3000/api/health
# → {"status":"ok","app":"Orbit AI"}
```

---

## 📁 Project Structure

```
orbit-ai/
├── server.ts                 # Express server: API routes + Vite/static serving
├── index.html                # App entry HTML
├── vite.config.ts            # Vite + React + Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── firestore.rules           # Firebase Firestore security rules
├── firebase-applet-config.json
├── firebase-blueprint.json
├── .env.example              # Environment variable template
├── assets/                   # Static assets
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Root app shell / routing between views
    ├── auth.ts               # Firebase authentication helpers
    ├── firebase.ts           # Firebase app initialization
    ├── firestore.ts          # Firestore read/write helpers
    ├── storage.ts            # Firebase Storage helpers
    ├── types.ts              # Shared TypeScript types
    ├── functions.ts          # Shared utility functions
    ├── components/
    │   ├── views/            # Dashboard, Tasks, Schedule, Habits, Fitness,
    │   │                     # Meals, Bills, Goals, Notes views
    │   ├── landing/          # 3D landing page (Three.js canvas/world, motion card)
    │   ├── OrbitCopilotDrawer.tsx   # AI assistant drawer
    │   ├── CommandPalette.tsx       # Keyboard command palette
    │   ├── AIExpenseAnalyzerCard.tsx, BillsCalendarCard.tsx,
    │   │   BudgetForecastCard.tsx, BudgetTrendChart.tsx,
    │   │   DebtPaydownCalculatorCard.tsx, EmergencyFundCard.tsx,
    │   │   MonthlySavingsTargetCard.tsx  # Finance toolkit
    │   ├── DailyDigest.tsx, DailyInsightCard.tsx,
    │   │   WeeklyInsightSection.tsx, OrbitScoreBanner.tsx  # Insights
    │   └── AuthModal.tsx, OnboardingModal.tsx, Navigation.tsx,
    │       ToastSystem.tsx, WelcomeHeader.tsx              # Shell UI
    └── lib/
        ├── archiver.ts       # Data archiving utilities
        ├── cleanAiText.ts    # Sanitizes AI-generated text
        ├── tagger.ts         # Automatic content tagging
        ├── mockData.ts       # Demo/seed data
        └── storage.ts        # Local storage persistence layer
```

---

## 🔌 API Reference

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | Returns `{ "status": "ok", "app": "Orbit AI" }` |
| `POST` | `/api/orbit/ai` | `{ action, prompt, contextData }` | Runs an AI action and returns `{ success, source, result }` |

**Supported `action` values:**

`daily_digest`, `optimize_day`, `breakdown_task`, `workout_plan`, `meal_plan`, `goal_roadmap`, `note_summarize`, `task_analytics`, `weekly_insight`, `daily_insight`, `analyze_bill`, `audit_bills`

`source` in the response is `gemini` when the live API answered, or `fallback` / `fallback_error` when canned responses were used — the app stays fully usable without an API key.

---

## 📊 Current Status / Scope

**Status:** ✅ Functional MVP / Phase 2 — actively developed.

**In scope (implemented):**

- Full React SPA with nine core views (Dashboard, Tasks, Schedule, Habits, Fitness, Meals, Bills, Goals, Notes)
- Express backend with Gemini-powered AI Copilot and offline fallback for 12 AI actions
- Financial toolkit: bill analyzer, calendar, forecasts, charts, debt/emergency-fund/savings calculators
- Firebase authentication, Firestore persistence, and Storage integration
- 3D animated landing page, onboarding flow, command palette, toasts, Harmony Score
- Production build pipeline (`vite build` + `esbuild` server bundle)

**Out of scope / not yet done:**

- Automated test suite (no unit/integration tests yet)
- CI/CD pipeline and deployment configuration
- Mobile/Responsive QA across all breakpoints
- Production-hardened rate limiting and authentication on AI endpoints
- Public deployment (currently local/self-host only)

**Known notes:**

- The AI endpoint is unauthenticated — add rate limiting and user auth before exposing publicly.
- `npm run clean` uses `rm -rf`, which requires a POSIX shell (Git Bash/WSL on Windows).
- HMR can be disabled via `DISABLE_HMR=true` (used by the AI Studio environment).

---

## 🚀 Deployment

```bash
npm run build
NODE_ENV=production npm run start
```

The server serves the compiled `dist/` folder with an SPA catch-all route on port `3000`. Set `GEMINI_API_KEY` in the production environment to enable live AI responses.

---

## 🤝 Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes and verify with `npm run lint`
3. Commit using clear messages: `git commit -m "Add my feature"`
4. Push and open a Pull Request: `git push origin feature/my-feature`

---

## 📄 License

All rights reserved. Contact the repository owner for usage permissions.

---

## 👤 Author

**Mark Cuizon** — [github.com/MarkCuizon02](https://github.com/MarkCuizon02)

Repository: [https://github.com/MarkCuizon02/orbit-ai](https://github.com/MarkCuizon02/orbit-ai)

Originally generated from [Google AI Studio](https://ai.studio/apps/c381d9be-71bd-41dc-9e6e-c4fcab924fb1).
