---
name: analyze-sprint
description: Analyze every story in a named sprint, one at a time — ask clarifying questions, reconcile the story against TECHNICAL-REQUIREMENTS.md and UI-DESIGN-HANDOFF.md (proposing doc updates on approval), confirm or resolve design linkage, break the story into tasks, and mark it analyzed. Takes a sprint name or number as input.
---

# analyze-sprint

This skill runs the **analysis pass** that sits between story creation (`/manage-stories`) and execution. It takes a single sprint, walks its stories one at a time, and for each story: sharpens the requirement through questions, reconciles it against the technical and design docs, confirms the design linkage, breaks it into implementation tasks, and stamps it **analyzed**.

It is the gate that turns a `draft` story into a `ready` one. It reuses `manage-stories`' vocabulary, frontmatter schema, task-state set, and its design-linkage / tech-feasibility gates — read `.claude/skills/manage-stories/SKILL.md` first if anything here is ambiguous. Where the two skills overlap on a rule, `manage-stories` is the source of truth for *format*; this skill owns the *analysis workflow*.

## Working paths

All story and doc paths are under `plan/` (the effective working root for the planning tooling), even though this skill file lives at repo root under `.claude/skills/`:

- Stories: `plan/stories/<topic>/story-*.md`, index `plan/stories/INDEX.md`
- Technical document: `plan/TECHNICAL-REQUIREMENTS.md` (open questions live in its `## Appendix — Open Questions`)
- Design document: `plan/UI-DESIGN-HANDOFF.md` (the UI design contract — this is "the design.md file")
- Design source files: `plan/design/*.jsx` (`design:` frontmatter paths resolve here, written as `design/<file>`)

## Input — the sprint

The skill takes one argument: a sprint identifier. Accept any of these forms and resolve to a sprint number:

| Input form | Example | Resolves by |
|---|---|---|
| Bare number | `1` | `sprint:` frontmatter == 1 |
| `Sprint N` | `Sprint 2` | the number |
| Sprint name fragment | `Community`, `Content + Credibility` | matched against the sprint label in `INDEX.md` |

Sprint labels come from `INDEX.md` headings (`Sprint 1 — Content + Credibility`, `Sprint 2 — Community + Self-Serve`, `Sprint 3 — Operations + Growth`). Never invent a sprint number — only resolve to one that exists in the story frontmatter.

**If no argument is given, or it's ambiguous,** read the distinct `sprint:` values across all stories and ask via `AskUserQuestion` which sprint to analyze (show story count + SP per sprint as option descriptions).

## Story selection & ordering

1. Collect every `plan/stories/**/story-*.md` (exclude `_archive/`) whose `sprint:` matches the resolved number.
2. **Order dependency-first:** topologically sort by the `dependencies:` graph so a story is analyzed after the stories it depends on. Break ties by topic then sequence number (INDEX order). A within-sprint dependency cycle → report it and fall back to INDEX order.
3. **Skip already-analyzed stories** (`analyzed: true`) unless the user passed `--all` / `--reanalyze`, or explicitly asks to re-analyze. Report the skip count up front: e.g. `Sprint 1: 18 stories — 4 already analyzed, 14 to go.`

## Per-story loop

Process **one story at a time**. Never batch. For each story run steps 0–5, then checkpoint.

### Step 0 — Read & ground

Read the story file in full. Read its linked design source files (`design:` paths) and the relevant sections of `TECHNICAL-REQUIREMENTS.md` / `UI-DESIGN-HANDOFF.md` that the story touches. Print a 3–4 line orientation: title, the User story line, acceptance-criteria count, `design:` value, and `dependencies:`.

### Step 1 — Clarifying questions

Judge whether the Description + Acceptance criteria are complete, unambiguous, and testable enough to implement and verify. Ask via `AskUserQuestion` only when a real gap exists, such as:

- Vague or untestable criteria ("works correctly", "looks good"), or a `TBD —` line.
- Undefined behavior: empty states, error states, loading, pagination bounds, validation rules, permissions, edge cases.
- Scope ambiguity: what's in vs. out, which roles, which routes.
- A criterion the blueprint/docs don't ground.

Fold each answer back into the story — tighten the Description, rewrite/add Acceptance criteria, or record rationale in `## Notes`. **If the story is already clear, say so and skip — do not manufacture questions.**

**Size guard:** if clarification reveals the story is now > 5 SP, stop analyzing it, tell the user, recommend `/manage-stories split <id>`, and **defer it to the backlog** (see *Deferral handling → backlog*). Do not mark it analyzed.

### Step 2 — Detect & reconcile doc changes

Compare what the (now-clarified) story requires against what the docs already record. Flag anything implied by the story but **absent**:

- **Technical** → routes, API endpoints, request/response shape, tables or columns, auth/role rules, integrations, env vars not in `TECHNICAL-REQUIREMENTS.md`.
- **Design** → components, layouts, interaction states, copy patterns, or tokens not in `UI-DESIGN-HANDOFF.md` and not already present in the linked `design/*.jsx` source.

For each gap: **propose the precise addition** — show the exact text and the target section (e.g. "append to `UI-DESIGN-HANDOFF.md` §3 Component inventory"). New technical open questions go to `TECHNICAL-REQUIREMENTS.md` → `## Appendix — Open Questions`. **Write the doc only after the user approves the shown text.** If the user declines, treat the story as **deferred** — record the unresolved item in `## Notes` and move it to the backlog (see *Deferral handling → backlog*). If no gap exists, state "docs already cover this" and move on.

### Step 3 — Confirm / resolve design linkage

Inspect the `design:` frontmatter and reconfirm it matches reality:

- **`design:` is `[]` or missing** ("design file not added") → re-run the `manage-stories` design-linkage gate. Scan `plan/design/` for candidate matches, then ask via `AskUserQuestion`:
  - **(a) Provide a path** — verify the file exists before recording.
  - **(b) `none-needed`** — explicit declaration of no UI surface.
  - **(c) `follows-template: <story-id>`** — reuse another story's design (the referenced story must have non-empty `design:`).
  - **(d) Upload now & re-run** — defer this story; record nothing for it this run.
- **`design: none-needed` but the clarified acceptance criteria now imply UI** → reconfirm with the user; switch to a path if they confirm UI is needed.
- **`design:` lists a path** → verify it still resolves on disk. If it 404s, ask for a corrected path.

A UI-bearing story whose design linkage is left unresolved (option d, or an unfixed missing path) is **deferred — not analyzed** → move it to the backlog (see *Deferral handling → backlog*).

### Step 4 — Break the story into tasks

Break the story into the natural number of tasks it needs (not a fixed count) — each task maps to one or more acceptance criteria and is small enough to land in a single commit. Write them into `## Tasks` using the five `manage-stories` task states, defaulting to `[new]`:

```markdown
## Tasks
- [new] <task that satisfies AC #1–2>
- [new] <task that satisfies AC #3>
- [new] <verification task — tests / a11y / perf budget where the AC demands it>
```

Set `tasks_populated: true` in frontmatter. Replace the `TODO — break this story` placeholder line entirely. Never use a state outside `new | started | completed | cancelled | hold`.

### Step 5 — Mark analyzed

Only when steps 1–4 fully resolved (no deferral), update frontmatter and write the file:

- Add `analyzed: true`
- Add `analyzed_date: <today's date, YYYY-MM-DD>`
- Bump `status: draft → ready` (only if it was `draft`; never downgrade `in-progress`/`done`/`blocked`)
- `tasks_populated: true` (from step 4)

Example resulting frontmatter:

```yaml
---
id: story-blog-03
topic: blog
sprint: 1
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
dependencies:
  - story-blog-01
design:
  - design/screens-blog.jsx
---
```

### Checkpoint

After each story print one line — `✓ story-blog-03 analyzed (3 questions resolved · 1 doc update · 4 tasks)` or `⏸ story-jobs-05 → backlog (deferred) — design upload pending` — then continue to the next story. The user may say "stop" at any checkpoint to pause the run; already-written stories stay analyzed.

## Deferral handling — move to backlog

When any step above can't be fully resolved, the story is **deferred** — not marked analyzed, and not left cluttering the active sprint. Instead:

1. **Move the file** to `stories/_backlog/` (create it if missing — it sits alongside `_archive/` and is excluded from sprint sections). Keep the filename.
2. **Set `status: deferred`** — a status specific to this skill (like `analyzed`), outside the five `manage-stories` lifecycle states.
3. **Add `original_sprint: <N>`** (the sprint being analyzed) so the planned home is never lost. **Leave the existing `sprint:` field unchanged.**
4. **Do not change the story's scope** — no edits to User story / Description / Acceptance criteria. The only allowed body change is a short `## Notes` paragraph stating *why* it was deferred and the recommended next step (`/manage-stories split <id>`, a design upload, a doc decision).
5. Leave `tasks_populated` and the `## Tasks` placeholder untouched — task breakdown happens only for analyzed stories.

**Deferral triggers:** > 5 SP after clarification (needs split) · an unresolved doc gap the user declined · an unresolved design linkage (upload pending / unfixed missing path).

A deferred story keeps its real `dependencies:`; if other stories depend on it, flag the block in the run summary. Re-slot a backlog story later via `/manage-stories split`/`add`, move it back into its topic folder, and re-run `/analyze-sprint`.

## After the sprint

1. **Regenerate `plan/stories/INDEX.md`** so Status / Tasks / Design reflect the run (idempotent `manage-stories` index flow). Add/refresh a **`## Backlog — deferred during analysis`** section listing every `stories/_backlog/` story with an **Orig. sprint** column (from `original_sprint:`); exclude backlog stories from their sprint section, add a `deferred` count to the Summary line, and keep backlog stories out of every sprint's story/SP totals.
2. **Print a summary:** stories analyzed vs. deferred, total questions resolved, doc additions made (with which doc + section), design linkages resolved, total tasks created. List deferred stories with their blocking reason and the suggested next step.

## Operating rules

- **One story at a time.** Never silently analyze in bulk.
- **Never fabricate** acceptance criteria, task content, or doc text the user hasn't grounded. Propose, then confirm.
- **Doc edits require explicit approval** and the exact text shown first. The only files this skill writes outside `plan/stories/` are `plan/TECHNICAL-REQUIREMENTS.md`, `plan/UI-DESIGN-HANDOFF.md`, and `plan/design/.gitkeep` (only if `plan/design/` is missing — it never creates design source files).
- **A story is marked analyzed only when fully resolved.** Any unresolved doc gap, unresolved design linkage, or >5 SP finding → defer, don't stamp.
- **Deferral parks to the backlog, not in place.** A deferred story is moved to `stories/_backlog/` with `status: deferred` + `original_sprint:` set (its `sprint:` and scope unchanged) and is excluded from the active sprint in `INDEX.md`.
- **Respect `manage-stories` invariants:** ≤5 SP per story (else recommend split), task states from the five-state set, design linkage never silently empty, `INDEX.md` is generated/idempotent with its "do not hand-edit" warning intact.
- **Never set `status: done`.** Analysis stops at `ready`. Execution and the completion gate are downstream.
- **Idempotent re-runs.** Already-`analyzed` stories are skipped unless re-analysis is explicitly requested.
- **Never invent a sprint.** Resolve only to a `sprint:` value that exists in the story frontmatter.

## Files this skill touches

- `plan/stories/<topic>/story-*.md` — frontmatter (`status`, `tasks_populated`, `analyzed`, `analyzed_date`, sometimes `design`), `## Tasks`, and clarified `## Description` / `## Acceptance criteria` / `## Notes`.
- `plan/stories/INDEX.md` — regenerated at the end (including the Backlog section).
- `plan/stories/_backlog/story-*.md` — deferred stories moved here: file relocated, `status: deferred` + `original_sprint:` set, `sprint:` and scope left unchanged.
- `plan/TECHNICAL-REQUIREMENTS.md` / `plan/UI-DESIGN-HANDOFF.md` — only on explicit approval of a shown addition.
- `plan/design/.gitkeep` — only if `plan/design/` is missing.

## When to bail and ask

- Sprint argument matches zero stories → list the sprints that do exist and ask.
- A within-sprint dependency cycle → report the cycle, suggest `/manage-stories lint`, fall back to INDEX order.
- A doc gap is ambiguous (the requirement could be built multiple supported/unsupported ways) → describe the interpretations and let the user pick before proposing text.
- A story's clarification implies it should be split → recommend `/manage-stories split <id>` and defer.
