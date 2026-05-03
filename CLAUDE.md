# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

There is **no build step**. The app is vanilla HTML/CSS/JS served as static files.

To develop locally, serve the root directory with any static server:
```bash
npx serve .          # or: python -m http.server 8080
```

Then open `http://localhost:3000` (landing) or `http://localhost:3000/app.html` (main app).

Deployment is via **Vercel** — `vercel.json` maps `/app` → `app.html`, `/admin` → `admin.html`, and `/auth/callback` → `auth-callback.html`. Deploy with `vercel --prod`.

## Architecture

This is a **mobile-first SPA** (max-width 430px) with three HTML entry points:

- `index.html` — Public landing page
- `app.html` — Main app shell containing **all 25 screens** as `<section id="screen-*">` elements, only one visible at a time
- `admin.html` — Separate admin dashboard

### State & Navigation

All mutable state lives in a single global `state` object (defined in `app.js`, persisted to `localStorage` under key `enem_state`). Shape:
```js
state = {
  user: { name, email, plan, xp, streak, level, ... },
  progress: { stats: { humanas, natureza, linguagens, matematica } },
  quizHistory: [...],
  wrongAnswers: [...],
  badges: { ofensiva, especialista, maratonista },
  notifications: [...],
}
```

Navigation is a single function: `navigate('screenName')`. It toggles `.active` on the target `<section>`, then calls `renderScreen(screenName)` which dispatches to per-screen render functions (e.g. `renderDashboard()`, `renderQuizSetup()`). `screenMap` in `app.js` maps logical names to DOM IDs.

### Module Responsibilities

| File | Owns |
|------|------|
| `app.js` | Router, `state`, `PLANS`, `PAYWALL_MESSAGES`, gamification (XP/streak/badges/achievements), `renderDashboard()`, `finishOnboarding()`, `showPaywall()` |
| `supabase-config.js` | All Supabase calls: auth, `saveUserData`, `loadUserData`, `loadUserPlan`, `answerQuestionSecure` (RPC), `startSyncLoop` (30 s bidirectional sync) |
| `quiz.js` | `quizSetup` object, `initQuizFromSetup()`, `startQuiz(discipline, count, forceLocal, customTime)`, timer, scoring, daily-limit enforcement |
| `questions.js` | Local question bank (`window.LOCAL_QUESTIONS`) + `api.enem.dev` fetching, caching under `enem_q_*` localStorage keys |
| `premium.js` | `showPaywall(title, body)`, Cakto checkout URLs, `checkPremiumAccess()`, `redeemActivationCode()` |
| `social.js` | ENEM countdown widget, push notifications (`_scheduleDailyStudyReminder`), result share cards (Canvas), `shareResultWhatsApp()` |
| `onboarding.js` | Multi-step form (steps 1–3), `onboardingNext()`, `finishOnboarding()` is in `app.js` |
| `achievements.js` | Badge definitions, unlock logic, XP bonuses |
| `ranking.js` | Leaderboard fetch, tier system (Iniciante → Diamante), `inviteFriends()` |
| `redacao.js` | Essay themes, AI grading via Groq (Premium), 5-competency rubric |
| `tutor-ia.js` | Chat with Groq Llama 3.3 via Supabase Edge Function (Premium) |
| `conteudo.js` | Flashcard database (hardcoded, ~150 cards), `renderConteudo()` |
| `admin.js` | Admin KPIs, user management, webhook log viewer |

### Plan & Paywall System

Plan config is the single source of truth in `PLANS` (app.js). Never hardcode limits elsewhere:
```js
PLANS.free.dailyLimit   // 10
PLANS.premium.features  // { enemMode, redacaoIA, largeQuiz }
```

To check access: `isPremium()`, `planHas('enemMode')`, `getRemainingQuestions()`.

To show a paywall: `showFeaturePaywall('enemMode')` — uses `PAYWALL_MESSAGES` + injects ENEM countdown dynamically. Direct call: `showPaywall(title, body)` (defined in `premium.js`).

### Supabase Patterns

- `getCurrentUser()` — always fast-path via `getSession()` (offline-safe); never call `getUser()` in hot paths
- `startSyncLoop(userId)` — call once after login; handles bidirectional sync every 30 s and on visibility change
- `answerQuestionSecure(userId, qId, isCorrect)` — RPC that atomically enforces daily limits; returns `{ success, errorCode: 'DAILY_LIMIT' }` on breach
- `loadUserPlan(userId)` — call before quiz start to verify premium hasn't expired
- The `handle_new_user` trigger auto-inserts into `public.users` on auth signup; see `SUPABASE_SETUP.md`

### CSS

Styles are split into `css/*.css` files imported by `style.css`. CSS variables (colors, radii, shadows) are defined in `css/base.css`. Dark theme: bg `#0a1929`, accent `#00b4a6` (`--teal`). Don't add inline styles for anything thematic — use CSS variables.

### Key Globals

All JS files assume these globals exist (loaded via `<script>` tags in order):
- `supabase` — Supabase client (from CDN, initialized in `supabase-config.js`)
- `state` — app state (from `app.js`)
- `quizState` — active quiz state (from `quiz.js`)
- `_DEV` — `true` only on `localhost`
- `_trackEvent(name, props)` — thin wrapper to `analytics_events` table

Script load order in `app.html` matters: `questions.js` → `app.js` → `supabase-config.js` → feature modules.

## Supabase Setup

Credentials live directly in `supabase-config.js` (not env vars — this is a client-side app with a public anon key). Full table setup and RLS policies are in `SUPABASE_SETUP.md`. The canonical schema is `create_tables.sql`.

The more authoritative schema (with RPCs, webhook handling, and activation codes) is in `create_tables.sql`, not `SUPABASE_SETUP.md` which is an older setup guide.
