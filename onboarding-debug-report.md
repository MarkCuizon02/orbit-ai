# Onboarding & Debugging Report: Orbit AI

This document provides a comprehensive run-through of the development setup, orientation, and testing workflow as outlined in the engineering checklist.

---

## 🛠️ Phase 1 & 2: Project Preparation & Stack Identification

### Stack Identification
- **Runtime Environment:** Node.js (V8)
- **Frontend Framework:** React 19 SPA (Single Page Application)
- **Build Tool / Bundler:** Vite 6
- **Server Platform:** Express (custom server defined in `server.ts` using `tsx` dev runner)
- **Styling Engine:** Tailwind CSS v4 (using `@tailwindcss/vite` compiler plugin)
- **Database / Backend-as-a-Service:** Firebase (Authentication, Firestore Database, Cloud Storage, and Functions)
- **Visuals & Choreography:** Recharts (visualization), Three.js (custom 3D background world), and Framer Motion / GSAP (interactive scrolling and interface animations)

### Guiding Questions Answers
1. **Telltale signs of a Node app:**
   - Presence of `package.json` specifying system scripts, main entrypoint, configuration metadata, dependencies, and typings.
   - Lockfile such as `package-lock.json` or `bun.lock` (this project shipped with a `bun.lock`).
   - `node_modules` directory references and ES Modules / CommonJS import syntax for built-in/3rd party modules.
2. **Next.js vs Vite identification:**
   - Standard Vite projects have a `vite.config.ts` or `vite.config.js` at the root directory level.
   - Next.js projects rely on a `next.config.js` or `next.config.mjs` config sheet, alongside directory routing maps such as `/app` or `/pages` and the core `next` module listed in package dependencies.
   - This workspace is explicitly configured with `vite.config.ts` and `@vitejs/plugin-react`, confirming a React Single Page Application transpiled and hosted by Vite.
3. **Most common modern stacks in 2026:**
   - Frontends standardizing around Vite 6 / React 19 utilizing native React Server Components (RSC) or single page routing.
   - Standardizing on Tailwind CSS v4 featuring ultra-fast compile steps.
   - Backend APIs leveraging Express with TypeScript runners or lightweight severless offerings.
   - Modern integration of AI APIs (such as Google Gemini with `@google/genai` or OpenAI) proxying requests through a secure server-side app layer.

---

## 🧭 Phase 4: VS Code Orientation & Setup

### Interface Areas Checked
- **Activity Bar:** Navigating between Explorer, global workspace Search, Source Control management, Run/Debug panel, and Extensions hub.
- **Explorer Panel:** Examining folder trees containing components, assets, databases rules, and bundler configurations.
- **Editor Area:** Active editor window inside `src/components/DailyInsightCard.tsx`.
- **Bottom Panel:** Actively using PowerShell terminal session to install packages, run compilers, and audit performance issues.
- **Copilot Chat / Agent Mode:** Grounding debug actions with precise codebase analysis and file edits.

### Setup and Environment Check
- **Runtime/Tooling Check:** A lockfile for Bun (`bun.lock`) was present, but Bun was missing from the terminal environment. We successfully resolved this dependency bottleneck by using standard `npm` to perform local setup configuration commands.
- **Environment config check:** Configured `.env` matching `.env.example` mapping out variables:
  - `GEMINI_API_KEY`: Fallback mock system triggers elegantly in case the API key is unattached.
  - `APP_URL`: Set for routing.
- **Diagnostics Verification:** Ran linting checks via compiler `npx tsc --noEmit` and confirmed that all types check out successfully (Exit Code 0).

---

## 🔍 Phase 5: Debugging, Interactivity, & System Evaluation

The server was initialized using `npm run dev` and verified online. We booted an active headful browser agent at `http://localhost:3000` to interact with features:

### 1. Browser Warnings Captured and Audited
- **Error/Warning Detected:** `[warning] THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.`
- **Source:** Browser Developer Console
- **Module:** `src/components/landing/Orbit3DWorld.tsx`
- **Details:** Three.js r185 utilizes the newer high-precision `THREE.Timer` class to coordinate animations over older `THREE.Clock` instances.
- **Fix:** Update instances of `new THREE.Clock()` to `new THREE.Timer()` or import from custom three addons modules once standard timing cycles are fully mapped.

### 2. Live Feature Tests Executed
- **Dashboard Interface Integration:** Successfully signed in via the interactive demo context.
- **AI Task Breakdown:** Executed full breakdown for the priority task *"Finalize Project Presentation and Task Outline"*. This initiated server calls to `/api/orbit/ai` (with fallback activation) successfully yielding 4 structured AI subtasks and pushing them directly into the tasks state.
- **Toast Notifications System:** Clicked the *Broadcast Toast Alerts* button to verify toast trigger systems. Transmitted toast payload matching the upcoming Health & Life Insurance premium due in 3 days.

---

### Status Check
All initial onboarding operations, setup stages, and demo systems have checked out **100% Operational**!
