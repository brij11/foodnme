---
name: execute-sprint
description: Builds a sprint's analyzed stories one at a time in dependency order — scaffolds (first run) then extends the production Next.js 14 + Supabase app, writes the code and tests each story calls for, runs them, verifies every acceptance criterion, and marks the story done. The build pass downstream of /analyze-sprint.
---

# execute-sprint

This skill runs the **build pass** that sits downstream of `/analyze-sprint`. It takes a single sprint, lines up its analyzed stories, and executes them one at a time in dependency order. For each story it implements the production code, writes the tests the story's acceptance criteria demand, runs them, checks off every acceptance criterion, and stamps the story **done**.

It is the gate that turns a `ready` (analyzed) story into a `done` one. It reuses `analyze-sprint`'s sprint-resolution and dependency-ordering, and `manage-stories`' vocabulary, frontmatter schema, five-state task set, the `done`-gate, and idempotent `INDEX.md` generation — read `.claude/skills/analyze-sprint/SKILL.md` and `.claude/skills/manage-stories/SKILL.md` first if anything here is ambiguous. Where those skills own *format* and *analysis workflow*, this skill owns the *build workflow*.

**This skill only executes `analyzed: true` stories.** It never analyzes, never breaks down tasks, and never reconciles the docs — if a story isn't ready or a doc gap surfaces, it stops and routes back to `/analyze-sprint`.

## What it builds

The stories describe the **production app**, not the prototype. `plan/design/*.jsx` is a throwaway Babel-in-browser prototype with no build/test step; it is the **visual reference to port from**, not the thing being built. This skill builds the real Next.js 14 + Supabase app per `TECHNICAL-REQUIREMENTS.md`, in a new top-level **`web/`** directory.

## Working paths

Stories and planning docs live under `plan/`; the production app lives under `web/` (both at repo root):

- Stories: `plan/stories/<topic>/story-*.md`, index `plan/stories/INDEX.md`
- Technical document: `plan/TECHNICAL-REQUIREMENTS.md` — **source of truth** for stack (§2), structure (§3), database (§4), auth (§5), API (§6), routing (§7), UI rules (§8), security (§9), testing (§10), env vars (§11). It **outranks the prototype** wherever they disagree.
- Design contract: `plan/UI-DESIGN-HANDOFF.md` — the visual/UX contract.
- Prototype (visual reference only): `plan/design/*.jsx` — a story's `design:` paths (`design/<file>`) resolve here.
- **Production app: `web/`** — Next.js 14 App Router project root. Routes in `web/app/`, shared code in `web/lib/` + `web/components/`, DB in `web/supabase/migrations/`, generated types in `web/types/database.ts`, unit tests as `*.test.ts(x)` beside their source, E2E in `web/e2e/`. (`web/` rather than `app/` so the App Router's own `web/app/` isn't doubled into `app/app/`.)

## Input — the sprint

The skill takes one argument: a sprint identifier, resolved exactly as `analyze-sprint` does.

| Input form | Example | Resolves by |
|---|---|---|
| Bare number | `1` | `sprint:` frontmatter == 1 |
| `Sprint N` | `Sprint 2` | the number |
| Sprint name fragment | `Community`, `Content + Credibility` | matched against the sprint label in `INDEX.md` |

**If no argument is given, or it's ambiguous,** read the distinct `sprint:` values across all stories and ask via `AskUserQuestion` which sprint to build (show story count + SP per sprint). **Never invent a sprint number** — only resolve to one that exists in the story frontmatter.

## Pre-flight — align all stories

Before building anything, line the sprint up and confirm it's executable:

1. **Collect** every `plan/stories/**/story-*.md` (exclude `_archive/` and `_backlog/`) whose `sprint:` matches the resolved number.
2. **Require each is built-ready:** `analyzed: true` and `status: ready | in-progress`. Any story still `draft` or un-analyzed → **do not execute it**; list those stories and tell the user to run `/analyze-sprint <N>` first. (Already-`done` stories are skipped; report the skip count: `Sprint 1: 16 stories — 0 done, 16 to build.`)
3. **Order dependency-first:** topologically sort by the `dependencies:` graph so a story is built after the stories it depends on. Break ties by topic then sequence number (INDEX order). A within-sprint dependency cycle → report it, suggest `/manage-stories lint`, and fall back to INDEX order. A dependency that lives in an **earlier sprint and isn't `done`** → hard blocker (you can't build on a foundation that isn't there).
4. **Toolchain pre-flight:** confirm Node 20 + `pnpm` are available. Check whether `web/` exists:
   - **Absent** → run the **Scaffold** step below, then commit it as the bootstrap.
   - **Present** → reuse it.
5. **Print the execution plan** — the ordered story list with SP, deps, and design linkage, e.g. `Sprint 1 (16 stories): homepage-01 → homepage-02 → blog-01 → templates-01 → … `. This is the alignment output; building starts after it.

## Scaffold (first run only — when `web/` is absent)

Create the production project per `TECHNICAL-REQUIREMENTS.md` §2–§3, then commit it before building any story:

- Next.js 14 **App Router** + **TypeScript strict** (`strict: true`, `noUncheckedIndexedAccess: true`), Node 20, **pnpm**.
- **Tailwind CSS** with `web/tailwind.config.ts` extending the design tokens (from `plan/design/FoodTech_Theme_*.md` / `UI-DESIGN-HANDOFF.md`); thin `web/globals.css` for resets + `@font-face` only (no per-component CSS).
- **Supabase** via `@supabase/ssr` — server/client/middleware factories in `web/lib/supabase/`; `web/supabase/migrations/` + `seed.sql`; `web/types/database.ts` for generated types. Use the local Supabase dev stack for running tests.
- `web/middleware.ts` gating `/dashboard/*` and `/admin/*` per §5.4.
- Directory roots per §3: `web/app/`, `web/lib/{schemas,supabase,email,search,utils}/`, `web/components/`, `web/supabase/`, `web/types/`.
- **Test toolchain (§10):** Vitest + React Testing Library (unit, with the Supabase client mocked), Playwright + axe-core (E2E + a11y). Wire `pnpm` scripts: `typecheck`, `lint`, `test` (vitest), `build`, `e2e` (playwright).
- **Env:** a committed `web/.env.example` listing every var from §11 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ZEPTOMAIL_*`, `SENTRY_DSN`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_*`, …) and a git-ignored `web/.env.local` populated with whatever is available (local Supabase keys + safe test stubs). External-service keys absent → fine for the scaffold; they only matter when a specific story's tests need them (see Hard blockers).

The scaffold is **not** a story — it's the substrate Sprint-1 stories build on (`homepage-01` "design tokens + UI primitives" assumes a configured Tailwind/Next project exists).

## Per-story loop

Process **one story at a time**, in the dependency order from pre-flight. Never batch. For each story run steps 0–5, then checkpoint.

### Step 0 — Read & ground

Read the story file in full. Read its linked `design/*.jsx` prototype screens (the visual source to port) and the relevant sections of `TECHNICAL-REQUIREMENTS.md` / `UI-DESIGN-HANDOFF.md` the story touches. Confirm every `dependencies:` story is already `done`. Print a 3–4 line orientation: title, the User-story line, acceptance-criteria count, task count, and `design:` value.

### Step 1 — Mark in-progress

Set `status: ready → in-progress` and flip the first `## Tasks` entry `[new] → [started]`, then write the story file. (Never downgrade a story that's already further along.)

### Step 2 — Implement the tasks

Walk `## Tasks` in order. For each task:

- Write the production code it calls for, following `TECHNICAL-REQUIREMENTS.md` for stack/structure/schema/auth/API/routing/security, and porting the visual design from the linked prototype screen + the `UI-DESIGN-HANDOFF.md` tokens/components.
- **Reuse, don't duplicate** — compose from the design system and primitives earlier stories built (e.g. `homepage-01`'s UI primitives, `blog-01`'s shared sidebar) rather than re-implementing.
- Flip the task `[started] → [completed]` when its code (and its tests, Step 3) land.
- Make an **atomic commit** per task or coherent unit, referencing the story id and the AC(s) it satisfies.

Never invent behaviour the story's Description / Acceptance criteria don't specify. If a task can't be built as written because the spec is silent or contradictory, that's a **hard blocker** — stop (do not guess).

### Step 3 — Write the tests

Per `TECHNICAL-REQUIREMENTS.md` §10:

- **Every `/api/*` route → at least one Vitest unit test** (Supabase client mocked; external services — ZeptoMail, Turnstile, Upstash, Sentry — stubbed). Also unit-test Zod schemas and non-trivial utilities.
- **Each page / user flow → a Playwright E2E**, plus an **axe-core** a11y check on each §10 key page (homepage, blog listing, article detail, template detail, services, login, dashboard) with zero critical/serious violations.
- **Map each acceptance criterion to a concrete assertion.** Where an AC is purely visual and not automatable, record it as a documented manual check in `## Notes` rather than silently skipping it.

### Step 4 — Run tests & verify every acceptance criterion

- Run the suite: `pnpm typecheck`, `pnpm lint`, `pnpm test` (Vitest), `pnpm build`, and the relevant `pnpm e2e` (Playwright against the local Supabase stack + stubbed externals).
- Walk the story's `## Acceptance criteria`. Flip each `- [ ] → - [x]` **only** when a passing test (or a recorded manual check) backs it, and note which test covers it.
- A failing test → fix the code and re-run, up to a **bounded number of attempts** (≈3). If it still can't be made to pass, treat it as a **hard blocker**.

### Step 5 — Mark done

Only when **all** tasks are `[completed]`/`[cancelled]`, **all** acceptance criteria are `[x]`, and the full suite is green — update frontmatter and write the file:

- `status: in-progress → done`
- ensure `tasks_populated: true`
- add `executed_date: <today's date, YYYY-MM-DD>`

Then make the final atomic commit for the story.

```yaml
---
id: story-homepage-01
topic: homepage
sprint: 1
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
executed_date: 2026-05-25
dependencies: []
design:
  - design/screens-main.jsx
---
```

### Checkpoint

After each story print one line — `✓ story-homepage-01 done (6 tasks · 7 ACs verified · 14 tests green)` or `⛔ story-services-03 blocked — ZeptoMail key absent, inquiry-send E2E can't pass`. In fully-autonomous mode, **continue automatically to the next story**; only a **hard blocker** halts the run. The user may still say "stop" at any checkpoint — already-`done` stories stay done.

## Hard blockers — halt even in autonomous mode

Stop the run and surface the blocker when:

- A story's dependency isn't `done` (within-sprint not yet built, or a cross-sprint dependency that's incomplete).
- Tests can't be made to pass after the bounded fix attempts.
- An acceptance criterion needs an **external secret/service** (ZeptoMail, Turnstile, Sentry, Upstash, a hosted Supabase) that isn't available and can't be stubbed without violating the AC's intent.
- The **toolchain is unavailable** — no Node/`pnpm`, no Docker for the local Supabase stack, Playwright browsers won't install.
- An acceptance criterion is ambiguous or contradicts the docs — analysis should have caught it; route back to `/analyze-sprint`.

On a hard blocker: set the story `status: blocked`, record the reason **and the next step** in `## Notes`, leave already-finished tasks `[completed]` and the blocking task `[hold]`, regenerate `INDEX.md`, then halt and report. Never check off an AC that isn't actually satisfied, and never edit an AC to make a test pass.

## After the sprint

1. **Regenerate `plan/stories/INDEX.md`** via the `manage-stories` index flow (same template, idempotent) so the Status and Tasks columns reflect the run (`done` / `in-progress` / `blocked`, and `N/N` task counts).
2. **Print a summary:** stories done vs. blocked, total tasks completed, tests written and passing, commits made, and files/directories created under `web/`. List every blocked story with its reason and suggested next step.

## Operating rules

- **One story at a time, dependency-first.** Never build a story before the stories it depends on are `done`.
- **Only `analyzed: true` stories execute.** A `draft`/un-analyzed story is never built — route it to `/analyze-sprint`.
- **Code obeys `TECHNICAL-REQUIREMENTS.md`** (highest precedence: stack, structure, schema, auth, API, routing, security). Visuals follow `UI-DESIGN-HANDOFF.md` + the linked prototype screens. The prototype never overrides the tech spec.
- **Tests are mandatory, per §10.** Every `/api` route ships ≥1 unit test; every user flow ships an E2E. A story is `done` **only** when its tests are green and every AC is checked.
- **Respect `manage-stories` invariants:** task states from the five-state set (`new | started | completed | cancelled | hold`) only; a story is `done` only when `tasks_populated: true` and every task is `completed`/`cancelled`; `INDEX.md` is generated/idempotent with its "do not hand-edit" warning intact.
- **Never edit an acceptance criterion to make it pass.** If an AC is wrong or unbuildable, halt and flag — reconciliation is `/analyze-sprint`'s job, not this skill's.
- **This skill does not edit the planning docs.** It never writes `PRODUCT.md`, `TECHNICAL-REQUIREMENTS.md`, or `UI-DESIGN-HANDOFF.md`. A surfaced doc gap is a blocker routed back to `/analyze-sprint`.
- **Atomic commits** referencing the story id (and AC where useful).
- **Never touch `_backlog/` or `_archive/`** stories.
- **Never invent a sprint.** Resolve only to a `sprint:` value that exists in the story frontmatter.

## Files this skill touches

- `web/**` — the production Next.js + Supabase app: code, tests, config, migrations (**created**; the only place this skill writes code).
- `plan/stories/<topic>/story-*.md` — frontmatter (`status`, `tasks_populated`, `executed_date`), `## Tasks` state markers, `## Acceptance criteria` checkboxes, and `## Notes` (blocker reasons / manual-check records).
- `plan/stories/INDEX.md` — regenerated at the end.
- It does **not** write `plan/PRODUCT.md`, `plan/TECHNICAL-REQUIREMENTS.md`, `plan/UI-DESIGN-HANDOFF.md`, or `plan/design/*`.

## When to bail and ask

- Sprint argument matches zero stories → list the sprints that do exist and ask.
- One or more of the sprint's stories aren't `analyzed`/`ready` → list them and route to `/analyze-sprint <N>` before building.
- A within-sprint dependency cycle → report the cycle, suggest `/manage-stories lint`, fall back to INDEX order.
- A cross-sprint dependency isn't `done` → halt and report (build the earlier sprint first).
