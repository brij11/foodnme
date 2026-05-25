---
name: finalize-tech-spec
description: Interactively finalize a technical requirements document by asking the user questions, starting from foundations and narrowing toward implementation details. Reads existing planning docs first, only asks about gaps, and writes TECHNICAL-REQUIREMENTS.md when the spec is closed.
---

# finalize-tech-spec

You are about to walk the user through closing out a technical requirements document. Your job is to extract what is already known from existing planning documents, then ask the user *only the unanswered questions*, layer by layer, until every required section has an answer. Then write `TECHNICAL-REQUIREMENTS.md` at the repo root.

This is a **conversational, multi-turn skill**. Do not try to draft the document in one shot. Do not invent answers the user has not given.

## Phase 1 — Ground yourself in existing context

Before asking anything, read the planning docs that already exist in this repo. Common locations:

- `foodnme-core-idea.md` (or any `*blueprint*.md`, `*project*.md` — the "what to build" doc)
- `UI-DESIGN-HANDOFF.md` (or any `DESIGN*.md`, `UI-SPEC*.md` — the "what the prototype decided" doc)
- `CLAUDE.md` (repo conventions)
- `README.md` if present
- Any existing `TECHNICAL-REQUIREMENTS.md`, `ARCHITECTURE.md`, `SPEC.md` — if found, you are in **update mode**, not create mode

Extract: tech stack, modules, data shapes, API contracts, phases, integrations, auth model. Build a mental map of what is already decided so you do not re-ask.

If no planning docs exist, the foundational questions in Phase 2 cover the basics from scratch.

## Phase 2 — Section-by-section interview

A complete tech spec needs answers across these sections. Walk them in this order — each layer assumes the previous is settled, so do not skip ahead.

1. **Product foundation** — what the system does, primary users, success criteria, in-scope vs out-of-scope for the current phase
2. **Tech stack & runtime** — framework + version, language, package manager, Node/runtime version, browser/device targets
3. **Data layer** — database choice, ORM/client, schema-source-of-truth (migrations vs declarative), seed strategy, storage for files/blobs
4. **Authentication & authorization** — auth provider, identity model, role model, session handling, route gating mechanism, password reset flow
5. **External integrations** — third-party services (email, payments, analytics, search, CDN, captcha, error tracking) with specific vendor + plan tier
6. **API contracts** — endpoints needed for the current phase with method, path, payload shape, auth requirement, rate limit
7. **Rendering strategy** — per route: SSG / SSR / ISR / CSR / streaming, revalidation cadence, cache headers
8. **Performance targets** — Core Web Vitals goals, p95 latency budgets, bundle size budget, image pipeline strategy
9. **Security & compliance** — input validation surface, CSRF/XSS posture, secrets management, data retention, regulatory obligations (GDPR/DPDP/etc.)
10. **Observability** — logging destination, error tracking tool, analytics tool, uptime monitoring, alert routing
11. **Deployment & environments** — host, environments (dev/staging/prod), branch strategy, CI/CD pipeline, preview-deploy behavior, secret injection
12. **Testing strategy** — what's tested (unit / integration / E2E / visual / a11y), tooling, coverage target, when tests must pass
13. **Migration & rollout** — for greenfield, the build sequence; for replatform, data migration plan + cutover plan + rollback plan
14. **Open questions & deferred decisions** — anything intentionally left for later, with the trigger that forces the decision

### How to ask

For each section, follow this loop:

1. **Check the docs first.** If existing planning material already pins a section down, summarize what it says in 1–3 lines, then ask the user *one* confirmation question: "Existing docs say X — keeping that, or revising?" Don't re-litigate decided items.
2. **For genuinely open sections, start broad and basic.** First question is the foundational one ("What database?"). Based on the answer, decide whether to drill (versions, schema strategy, pooling, backup cadence) or move on.
3. **Use the `AskUserQuestion` tool** for every question with 2–4 concrete options. Always include a recommendation as the first option labeled `(Recommended)` based on what the existing stack suggests. The user can always pick "Other" to free-text.
4. **Batch only related sub-questions in one `AskUserQuestion` call** (max 4). Do not pack unrelated topics together — they each deserve their own framing.
5. **After each answer, briefly state what you recorded** and what comes next ("Locked: Postgres via Supabase. Next: schema migration strategy."). Keeps the user oriented across many turns.
6. **Adapt depth to signal.** If the user gives terse one-word answers, they want to move fast — ask only the essential question per section. If they elaborate, drill deeper. Match their pace.

### Stop conditions

Move to Phase 3 when **either**:

- Every section above has a recorded answer (decided, deferred-with-trigger, or out-of-scope), or
- The user explicitly says "wrap it up" / "that's enough" / "draft what you have" — in which case mark unanswered sections as **Open** in the output rather than fabricating answers.

## Phase 3 — Write `TECHNICAL-REQUIREMENTS.md`

Write to the repo root unless the user specified a different location. Use this structure:

```markdown
# Technical Requirements — <project name>

> Status: <Draft | Approved> · Last updated: <YYYY-MM-DD>
> Companion to: <list the planning docs you read in Phase 1>

## 1. Product foundation
...
## 2. Tech stack & runtime
...
[one section per Phase 2 item, in the same order]
...
## 14. Open questions
| # | Question | Owner | Trigger to resolve |
|---|---|---|---|
| 1 | ... | ... | ... |
```

Inside each section:

- Lead with the decision in one or two lines (the "what")
- Follow with rationale or constraints in a short paragraph (the "why") — pull from the user's words in the interview, not from generic best-practice templates
- Use tables for enumerated items (routes × rendering strategy, endpoints × method+payload, environments × hosts)
- Cite the source doc for every decision that came from existing planning material (`[from: foodnme-core-idea.md §3]`) so a reader can trace it
- Flag any user-given answer that contradicts the existing planning docs — surface it as a **conflict** in the relevant section, do not silently overwrite

After writing, show the user a one-line summary per section ("§4 Auth: Supabase Auth, 3 roles, middleware-gated dashboards") and ask if any section needs revision before marking the doc Approved.

## Operating rules

- **Never invent answers.** If the user has not said it and the docs do not say it, ask — or write "Open" with a trigger.
- **Never widen scope.** If the user is finalizing Phase 1, do not interview them about Phase 3 features. Match the scope they set in §1.
- **Stay terse between questions.** The conversation will be long; keep your between-question text to 1–2 sentences.
- **Save progress as you go.** After every ~3 sections, write a draft of `TECHNICAL-REQUIREMENTS.md` with what's locked so far + remaining sections marked "In progress" — so an interruption does not lose state.
- **One file out.** The deliverable is `TECHNICAL-REQUIREMENTS.md`. Do not also produce summaries, plans, or sidecar documents unless the user asks.
