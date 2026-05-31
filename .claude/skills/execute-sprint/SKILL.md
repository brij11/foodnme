---
name: execute-sprint
description: Builds a sprint's analyzed stories one at a time in dependency order — scaffolds (first run) then extends the production Next.js 14 + Supabase app, writes the code and tests each story calls for, runs them, verifies every acceptance criterion, and marks the story done. The build pass downstream of /analyze-sprint.
---

# execute-sprint

This skill runs the **build pass** that sits downstream of `/analyze-sprint`. It takes a single sprint, lines up its analyzed stories, and builds them **one at a time in dependency order**. It does **not** build them inline; it acts as a **thin orchestrator** that dispatches one `sprint-story-builder` subagent per story — on a per-story model — and that subagent implements the code + tests, runs the gate, verifies every acceptance criterion, and stamps the story **done** in its own isolated context. The orchestrator only resolves the sprint, orders the work, dispatches, reads each subagent's result, handles escalation, and regenerates the index.

It is the gate that turns a `ready` (analyzed) story into a `done` one. It reuses `analyze-sprint`'s sprint-resolution and dependency-ordering, and `manage-stories`' vocabulary, frontmatter schema, five-state task set, the `done`-gate, and idempotent `INDEX.md` generation — read `.claude/skills/analyze-sprint/SKILL.md` and `.claude/skills/manage-stories/SKILL.md` first if anything here is ambiguous. The per-story **build protocol** (Steps 0–5) lives in `.claude/agents/sprint-story-builder.md`; this skill owns the *orchestration* around it.

**This skill only executes `analyzed: true` stories.** It never analyzes, never breaks down tasks, and never reconciles the docs — if a story isn't ready or a doc gap surfaces, it stops and routes back to `/analyze-sprint`.

## Model & orchestration

Per-story work runs in subagents so the orchestrator's context stays tiny (it holds only story ids, pass/fail, and commit SHAs — never the file dumps, generated code, or test output). This both isolates context and lets each story run on the right-sized model.

- **Run the orchestrator itself on a cheap model** (Haiku or Sonnet). It only dispatches, parses each subagent's `RESULT` block, and regenerates `INDEX.md` — no heavy reasoning.
- **Each story's model is chosen by `analyze-sprint`** and recorded in the story's `exec_model` frontmatter field: `sonnet` (default) or `opus` (set when the story is complex — schema/migration, cross-story data coordination, algorithmic/stateful logic, spec reconciliation, security surface, or a net-new pattern). A story with no `exec_model` field defaults to **`sonnet`**.
- **Auto-escalation:** if a Sonnet subagent returns `status: failed` (couldn't green the gate within its 3 fix attempts), the orchestrator escalates that one story to **Opus** (see *Escalation* below). Opus failing too → the story is `blocked`.
- The subagent's `model` is set via the Agent tool's `model` parameter per spawn; it overrides the `sonnet` default in the agent definition.

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
5. **Print the execution plan** — the ordered story list with SP, deps, and the **per-story `exec_model`** (default `sonnet`; `opus` where analysis flagged it), e.g. `Sprint 1 (16 stories): homepage-01 [opus] → homepage-02 [sonnet] → blog-01 [sonnet] → … `. This is the alignment output; building starts after it.

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

## Dispatch loop — one subagent per story

Process **one story at a time**, in the dependency order from pre-flight. **Never batch and never run two builders in parallel** — await each story's subagent fully before dispatching the next (sequential execution is required; it also means no git contention, so no worktrees are needed). The orchestrator does **not** read the story's design/docs or write any `web/` code itself — that all happens inside the subagent.

For each story:

1. **Read just the routing facts from the story file** — its `exec_model` (default `sonnet` if absent) and confirm its `dependencies:` are all `done` (a not-`done` dependency is a hard blocker — halt). Do **not** read the design or docs here; the subagent does.
2. **Spawn a `sprint-story-builder` subagent** via the Agent tool, with `model` set to the story's `exec_model`, passing a prompt that contains: the `story_id`, the story file path, `exec_model`, and `escalation: false`. The subagent runs the Steps 0–5 build protocol in its own context and returns a `RESULT` block.
3. **Parse the `RESULT` block** and act on `status`:
   - **`green`** → confirm the evidence cheaply (`git log -1` shows the story's final commit; the `tests:` line is a pass summary). Print the checkpoint line and continue to the next story. Do **not** re-run the suite in the orchestrator — that would re-import the cost the subagent just isolated.
   - **`failed`** → the gate couldn't be greened within the subagent's 3 attempts. If the model was `sonnet`, **escalate** (below). If it was already `opus`, treat as a hard blocker: the story is `blocked` — halt.
   - **`blocked`** → a hard blocker the subagent already recorded in the story's `## Notes` (with `status: blocked`). Halt and report.

### Escalation — Sonnet failed → retry on Opus

When a `sonnet` subagent returns `failed`:

1. **Discard the failed attempt's uncommitted changes** so Opus starts from clean committed state: `git checkout -- .` (and `git clean -fd` for stray new files) in `web/`. Per-task commits the Sonnet attempt already landed are **kept** — they're green, tested work Opus will resume from.
2. **Stamp the story frontmatter** `exec_model: opus` and `escalated: true`, then write the file.
3. **Spawn a fresh `sprint-story-builder` subagent with `model: opus`**, passing `escalation: true` plus a **short prior-failure summary** (what Sonnet attempted and the failing test output from its `RESULT`) so Opus skips the dead-end and resumes from the committed task progress.
4. Act on the Opus `RESULT` as above. Opus returning `failed` or `blocked` → the story is `blocked`; halt.

### Checkpoint

After each story print one line — `✓ story-homepage-01 done [sonnet] (6 tasks · 7 ACs · 14 tests green)`, `↑ story-homepage-06 done [opus, escalated] (…)`, or `⛔ story-services-03 blocked — ZeptoMail key absent, inquiry-send E2E can't pass`. In fully-autonomous mode, **continue automatically to the next story**; only a hard blocker (a `blocked` result, an Opus `failed`, or a not-`done` dependency) halts the run. The user may say "stop" at any checkpoint — already-`done` stories stay done.

## Hard blockers — halt even in autonomous mode

A story is **blocked** (and the run halts) when:

- A story's dependency isn't `done` (within-sprint not yet built, or a cross-sprint dependency that's incomplete) — the **orchestrator** catches this before dispatch.
- The gate can't be greened after **both** the Sonnet attempt (3 fix tries) **and** the Opus escalation — i.e. an Opus subagent returns `failed`.
- An acceptance criterion needs an **external secret/service** (ZeptoMail, Turnstile, Sentry, Upstash, a hosted Supabase) that isn't available and can't be stubbed without violating the AC's intent.
- The **toolchain is unavailable** — no Node/`pnpm`, no Docker for the local Supabase stack, Playwright browsers won't install.
- An acceptance criterion is ambiguous or contradicts the docs — analysis should have caught it; route back to `/analyze-sprint`.

The **subagent** marks the in-place state for blockers it detects (`status: blocked`, reason + next step in `## Notes`, finished tasks `[completed]`, the blocking task `[hold]`) and returns `status: blocked`. The **orchestrator**, on a `blocked` result (or an Opus `failed`, or a not-`done` dependency it caught itself), **regenerates `INDEX.md`, then halts and reports**. Never check off an AC that isn't satisfied, and never edit an AC to make a test pass.

## After the sprint

1. **Regenerate `plan/stories/INDEX.md`** via the `manage-stories` index flow (same template, idempotent) so the Status and Tasks columns reflect the run (`done` / `in-progress` / `blocked`, and `N/N` task counts).
2. **Print a summary** (from the subagents' `RESULT` blocks — the orchestrator never re-derives it): stories done vs. blocked, **which model each ran on and which escalated** (`sonnet` / `opus` / `opus (escalated)`), total tasks completed, tests passing, and commits made. List every blocked story with its reason and suggested next step.
3. *(Optional)* a single end-of-sprint `pnpm test` from `web/` as a belt-and-suspenders check that the accumulated work is green — the only time the orchestrator runs the suite itself.

## Operating rules

- **One subagent at a time, dependency-first, never parallel.** Await each story's builder before dispatching the next. Never build a story before the stories it depends on are `done`.
- **The orchestrator stays thin and cheap.** It dispatches, parses `RESULT` blocks, escalates, and regenerates `INDEX.md` — it never reads the design/docs or writes per-story `web/` code itself (that's the subagent's job, in isolated context). The **one exception is the first-run Scaffold bootstrap**, which the orchestrator performs before any story. Run it on Haiku/Sonnet (bump to a stronger model just for the Scaffold if needed).
- **Per-story model = the story's `exec_model`** (default `sonnet`), escalated to `opus` on a Sonnet `failed`. The orchestrator records `escalated: true` when it escalates.
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

The **subagents** (`sprint-story-builder`) write the per-story output:
- `web/**` — the production Next.js + Supabase app: code, tests, config, migrations.
- `plan/stories/<topic>/story-*.md` — frontmatter (`status`, `tasks_populated`, `executed_date`), `## Tasks` state markers, `## Acceptance criteria` checkboxes, and `## Notes` (blocker reasons / manual-check records).

The **orchestrator** (this skill) writes only:
- `plan/stories/<topic>/story-*.md` — the `exec_model` / `escalated` frontmatter fields when escalating, and the working-tree reset before an Opus retry.
- `plan/stories/INDEX.md` — regenerated at the end.

Neither writes `plan/PRODUCT.md`, `plan/TECHNICAL-REQUIREMENTS.md`, `plan/UI-DESIGN-HANDOFF.md`, or `plan/design/*`. (The one-time **Scaffold** is performed by the orchestrator on first run before any story.)

## When to bail and ask

- Sprint argument matches zero stories → list the sprints that do exist and ask.
- One or more of the sprint's stories aren't `analyzed`/`ready` → list them and route to `/analyze-sprint <N>` before building.
- A within-sprint dependency cycle → report the cycle, suggest `/manage-stories lint`, fall back to INDEX order.
- A cross-sprint dependency isn't `done` → halt and report (build the earlier sprint first).
