# MathsFunda Interactive — Technical Requirements Document

**Stack lock:** Frontend / Backend / Database / Hosting  
**Product:** Interactive CBSE maths lessons (iPad-first PWA)  
**Version:** v1

## 1. Frontend (locked)

| Layer | Choice | Reason |
|---|---|---|
| Framework | **React 18** (Vite) | Matches UI libraries shortlisted (Watermelon, Magic UI, Motion Primitives, Tailark, Origin UI are all React/Tailwind); component ecosystem for interactive widgets |
| Styling | **Tailwind CSS v4** | Utility-first, rapid UI, dark/light, iPad-safe touch utilities |
| Primitives | **Radix UI** | Accessible dialogs, popovers, toggles, menus (keyboard + touch) |
| Animation | **Motion (Framer Motion)** | Interruptible micro-interactions, celebration confetti, page transitions, gesture drag |
| Math rendering | **KaTeX** (existing) | Fast, server/Client-safe formula rendering; tap-to-zoom wrapper |
| Markdown | **marked + dompurify** (existing) | Lesson authoring with XSS sanitization |
| Build tool | **Vite** (existing) | Fast dev, multi-page entry points, PWA plugin |
| Offline / install | **vite-plugin-pwa** (existing) | Service Worker, web app manifest, Add to Home Screen on iPad |
| State | **Zustand** (lightweight) | Client progress, lesson state, UI state; no heavy Redux |
| Forms | **React Hook Form + Zod** | Validation for practice/quiz inputs and parent gate |

Existing vanilla-JS pages (`index`, `learn`, `reader`, `flashcards`, `formulas`, `methods`, `studio`, `admin`, `diagnostic`, `confirmation`) remain the content shell. The interactive lesson widgets mount inside the reader as React islands (or a new `/interactive` route) sharing the same `js/curriculum.js` content model.

## 2. Backend (v1: none required; v2 optional)

- **v1:** Zero backend. All progress, schedules, and content stay in `localStorage` / IndexedDB per device. No user accounts, no network calls. This keeps COPPA/GDPR-K risk near zero and works fully offline on iPad.
- **v2 (future):** Node.js (Hono/Express) serverless API on Vercel/Netlify functions; Postgres via Supabase; optional cross-device sync + parent dashboard.

## 3. Database (v1: local-first)

| Store | Tech | Holds |
|---|---|---|
| Lesson progress / page / done | `localStorage` key `mathfunda-progress-v1` (existing `progress.js`) | per-lesson state, streak, days |
| Flashcard SM-2 schedules | same `localStorage` | card box, due dates, reps |
| Adaptive plan / concepts | `localStorage` key `mathfunda-adaptive-plan-v1` | diagnostic mastery, priority, 45-day plan |
| Lessons (content) | `chapters/class-9/*.md` imported at build via Vite glob | lesson text, formulas, tables |

v2 schema (see `docs/05-backend-schema.md`): `users`, `student_profiles`, `lesson_progress`, `attempts`, `badges`, `streaks`, `formula_recalls`, `parent_gate_logs`.

## 4. Hosting & deployment

| Environment | Target | Notes |
|---|---|---|
| Development | `npm run dev` (Vite, `http://127.0.0.1:5173`) | local |
| Preview | `npm run preview` (`http://127.0.0.1:4173`) | production-like local |
| Staging | GitHub Pages deploy from `staging` branch | pre-prod smoke |
| Production | GitHub Pages (`https://developersunilb.github.io/mathfunda/`) | HTTPS required for Service Worker + iPad install |
| CI/CD | `.github/workflows/deploy-pages.yml` | build + deploy on push to `main`; branch protection with 1 approving review |

## 5. iPad-specific constraints

- Install via Safari **Share → Add to Home Screen** (`display: standalone` in manifest)
- HTTPS mandatory (GitHub Pages) — LAN `http://192.168.x.x` cannot install offline app
- No navigation fallback in SW (multi-page site): each page precached on its own URL
- Touch gestures: swipe page turns, tap zones, long-press for formula zoom
- Landscape preferred for geometry sketchpad and two-page reader

## 6. Build & test commands

```powershell
npm install
npm run dev        # dev server
npm run build      # static output in dist/
npm run preview    # serve production build
# tests (if added): npm test / vitest run
# lint: npm run lint (eslint) — to be added
```

## 7. Dependencies added (v1)

`react`, `react-dom`, `framer-motion`, `@radix-ui/react-*`, `zustand`, `zod`, `react-hook-form` — consumed only in new interactive layer; existing pages unchanged.
