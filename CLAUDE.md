# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A **design/UX prototype** for **foodnme** — a knowledge + community platform for Indian food-technology professionals. The prototype renders 16 screens and exists to lock the UX before porting to the production Next.js 14 + Supabase stack. Do not treat this as the production codebase.

## Documents

In precedence order. Where any two disagree on a rule, the higher-precedence doc wins.

1. **`plan/PRODUCT.md`** — product description: positioning, tone, modules, surfaces, in/out scope.
2. **`plan/TECHNICAL-REQUIREMENTS.md`** — implementation rules (stack, structure, schema, auth, API, routing, UI rules, security, testing, env vars).
3. **`plan/UI-DESIGN-HANDOFF.md`** — UI design contract: design system, IA, component inventory, design-decision rationale, copy patterns.

Stories live under `plan/stories/` (managed via `/manage-stories`); the spec browser lives at `plan/viewer/`.

## Repo layout

```
/                              ← project root
├─ CLAUDE.md                   ← this file
└─ plan/
   ├─ PRODUCT.md
   ├─ TECHNICAL-REQUIREMENTS.md
   ├─ UI-DESIGN-HANDOFF.md
   ├─ stories/                 ← 40 story files + INDEX.md
   ├─ viewer/                  ← spec browser (serve.py, index.html, viewer.jsx, …)
   └─ design/                  ← prototype source + theme docs
      ├─ index.html            ← entry point
      ├─ app.jsx               ← AppShell, ScreenRouter, ReactDOM.createRoot
      ├─ data.jsx              ← window.FN_DATA (all sample content)
      ├─ ui.jsx                ← primitives + Navbar/Footer/cards/modals/providers
      ├─ tweaks-panel.jsx      ← design-time tweak controls
      ├─ styles.css            ← all design tokens + component styles
      ├─ screens-main.jsx
      ├─ screens-blog.jsx
      ├─ screens-jobs.jsx
      ├─ screens-experts.jsx
      ├─ screens-auth.jsx
      ├─ screens-dashboard.jsx
      ├─ FoodTech_Theme_…md    ← palette/theme reference
      └─ uploads/              ← stashed planning originals
```

## How to run

There is no build step, lint, or test suite — every `.jsx` is transformed in-browser via Babel-standalone.

```bash
./plan/viewer/serve.py start       # background — serves plan/ on first free 8000–8050 port
./plan/viewer/serve.py stop        # kill it
./plan/viewer/serve.py status      # check
```

- Spec browser: `http://localhost:<port>/viewer/`
- Prototype: `http://localhost:<port>/design/`

See `plan/viewer/README.md` for the full launcher lifecycle.

## Architecture (prototype only)

### Loading model

`plan/design/index.html` loads scripts in a specific order — this order **is** the dependency graph because every file writes globals into the window/JSX scope (no ES modules, no bundler):

```
data.jsx         → writes window.FN_DATA = { ARTICLES, TEMPLATES, JOBS, EXPERTS, ... }
tweaks-panel.jsx → useTweaks hook + TweaksPanel components
ui.jsx           → primitives, Navbar/Footer, cards, modals, hooks, AuthProvider, RouterProvider
screens-*.jsx    → page components, each consumes window.FN_DATA + hooks from ui.jsx
app.jsx          → AppShell, ScreenRouter, ReactDOM.createRoot
```

### Providers (order matters)

`AppShell` nests: `AuthProvider` → `RouterProvider` → `ConsultationModalProvider`. The consultation modal is global (triggered from the nav) so it must live above `ScreenRouter`.

### Hash router

Lives in `ui.jsx` (`RouterProvider` / `useRouter`). `ScreenRouter` in `app.jsx` dispatches `route.name` to page components. In production this is replaced by Next.js App Router (see `TECHNICAL-REQUIREMENTS.md` §3 and §7).

### Data layer

All sample content is static, exported via the single `window.FN_DATA` global from `plan/design/data.jsx` (`{ CATEGORIES, TEMPLATE_CATEGORIES, ARTICLES, TEMPLATES, SERVICES, STATS, AUTHORS, JOBS, EXPERTS, SPECIALIZATIONS, JOB_TYPES, EXPERIENCE_LEVELS }`). When adding content, preserve the rendering-only fields (`categoryLabel`, `company_initial`, `avatar` 2-letter initials) — screen components rely on them.

### Tweaks (design-time only)

`app.jsx` opens with an `EDITMODE-BEGIN/END` JSON block holding tweakable defaults (`heroLayout`, `cardDensity`, `accent`). The Tweaks panel mutates these at runtime via `useTweaks`. Removed when porting to production.

### Prototype auth

`AuthProvider` is a `localStorage`-backed fake (`user`, `signIn`, `register`, `signOut`) so role-aware screens can be demoed. Production replaces this with Supabase Auth via `@supabase/ssr` per `TECHNICAL-REQUIREMENTS.md` §5; `/dashboard/*` and `/admin/*` gated in `middleware.ts`.
