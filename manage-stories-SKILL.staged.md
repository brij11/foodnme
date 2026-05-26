---
name: manage-stories
description: Create and maintain a modular agile-stories tree under `stories/`. First run bootstraps from the blueprint; subsequent runs support add / split / update / restore / lint / index. Enforces size cap (≤5 SP), owner assignment, dependency tracking, design linkage, and tech-feasibility against TECHNICAL-REQUIREMENTS.md.
---

# manage-stories

This skill creates and maintains a functional spec broken into independently developable units called **stories**. Each story is a small markdown file under `stories/<topic>/`. The skill enforces size limits, ownership, dependency tracking, design linkage, and tech-feasibility against the project's technical spec.

## Vocabulary

This skill uses agile terminology. Two words look alike but mean different things — read carefully:

- **story** (entity, this skill's unit of work) → a file like `stories/blog/story-blog-03-category-filter.md`
- **User story** (narrative section *inside* a story file) → the classic `As a … I want … So that …` block

Translation from source planning docs:

| Source doc says | This skill calls it |
|---|---|
| requirement | story |
| module (feature area grouping) | topic |
| phase (release grouping, "Phase 1/2/3" in `foodnme-core-idea.md`) | sprint |

A "sprint" here is a release grouping aligned to blueprint phases — **not** a 2-week iteration. Never invent sprint boundaries; only read them from the blueprint.

## Mode detection

At invocation, determine the mode:

| Condition | Mode |
|---|---|
| `stories/` folder does not exist | **init** |
| Subcommand `add` given | **add** |
| Subcommand `split <story-id>` given | **split** |
| Subcommand `update <story-id>` given | **update** |
| Subcommand `restore <story-id>` given | **restore** |
| Subcommand `lint` given | **lint** |
| Subcommand `index` given | **index** |
| No subcommand, `stories/` exists | Ask the user which mode via `AskUserQuestion` |

If `stories/` exists but contains only `.gitkeep` or is empty, treat it as init.

When the no-subcommand `AskUserQuestion` menu is shown and a `stories/_backlog/` folder with deferred stories exists, include a **"restore — bring a deferred story back into a sprint"** option alongside add / split / update / lint / index.

## Per-story file format

### Path

`stories/<topic>/story-<topic>-<NN>-<kebab-slug>.md`

Examples:
- `stories/blog/story-blog-03-category-filter.md`
- `stories/auth/story-auth-01-email-signup.md`

Sequence numbers (`<NN>`) are two-digit zero-padded and unique within a topic. Pick the next free number when creating.

### Frontmatter (8 required fields + `design`)

```yaml
---
id: story-<topic>-<NN>            # must match the filename's prefix
topic: <topic>                    # one of the topics in the topic→sprint table
sprint: <1|2|3>                   # release grouping; see topic→sprint table
story_points: <1-5>               # never > 5 — split if larger
status: <draft|ready|in-progress|done|blocked|deferred>
owner: <name-or-handle>           # required; single team member responsible for execute + test
tasks_populated: <true|false>     # set true only by downstream task-breakdown step
dependencies:                     # list of story IDs; empty list = no deps
  - story-<topic>-<NN>
design:                           # see "Design linkage" below
  - design/<file>.html
---
```

**`deferred` status & `original_sprint`.** `deferred` and the optional `original_sprint: <N>` field both originate in `/analyze-sprint`: when it can't fully analyze a story it parks the file in `stories/_backlog/`, sets `status: deferred`, and records `original_sprint:` to preserve the planned home (leaving `sprint:` unchanged). `manage-stories` recognizes both because it owns the format — the **restore flow** is the only flow here that reads them, and it clears `original_sprint` when it returns a story to an active sprint. No flow here ever *sets* `status: deferred`.

### Body sections, in this order

1. **User story** — `As a <role>, I want <capability>, so that <outcome>.`
2. **Description** — plain-prose paragraph describing the surface the story covers.
3. **Acceptance criteria** — checklist (`- [ ]`) of testable conditions. Never bare "works correctly" — each line must be independently verifiable.
4. **Tasks** — see below; created empty by this skill.
5. **Notes** — anything else worth recording (links to blueprint sections, design rationale, scope cuts).

### Task schema (contract for the downstream task-breakdown tool)

Tasks live as a checklist inside `## Tasks`. Each task line begins with a **lifecycle state** in square brackets.

States (exactly five — no others):

| State | Marker | Meaning |
|---|---|---|
| `new` | `[new]` | Identified but not picked up. Default for newly written tasks. |
| `started` | `[started]` | Work in progress. |
| `completed` | `[completed]` | Done. |
| `cancelled` | `[cancelled]` | Decided not to do (scope cut, duplicate, obsolete). |
| `hold` | `[hold]` | Paused — blocked on external input or another story. Append reason in parens. |

**This skill never populates the Tasks section.** When creating a story, write the section as:

```markdown
## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks
```

Set `tasks_populated: false` in frontmatter. Only flip to `true` if a future task-breakdown subcommand is explicitly invoked.

### Design linkage

The repo-root `design/` folder holds design artifacts — typically HTML or JSX files produced by a cloud design tool (Claude artifacts, Pencil, etc.). The `design:` frontmatter field links each story to its design.

Allowed values:

| Value | Meaning |
|---|---|
| List of file paths under `design/` | Normal case. Each path must resolve on disk at write time. |
| `none-needed` | Backend / API / data-only story with no UI surface. Must be chosen explicitly — never assumed. |
| `follows-template: <story-id>` | Reuses the design of an already-linked story. The referenced story must have a non-empty `design:`. |
| `[]` (empty list) | Only valid transiently while waiting for a design. Flagged by lint as `missing-design`. |

**Design-linkage flow** (run on every UI-touching story create):

1. Scan `design/` for files whose names (or quick keyword content match) plausibly map to the story.
2. **If a candidate match is found** → propose it to the user. They may accept, choose differently, or override to `none-needed` / `follows-template:`.
3. **If no candidate match** → ask via `AskUserQuestion` with four options:
   - **(a) Provide a path** — user types a path. Skill verifies the file exists before writing.
   - **(b) `none-needed` (no UI surface)** — explicit declaration that this story has no UI work.
   - **(c) `follows-template: <story-id>`** — reuse another story's design. Skill lists candidate IDs from the same topic.
   - **(d) Upload now and re-run** — user wants to drop a file into `design/` first. Skill writes nothing this run.

A UI-bearing story with an unresolved `design:` field is **never written**. One of the four exits must be chosen.

### Full example

```markdown
---
id: story-blog-03
topic: blog
sprint: 1
story_points: 3
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-blog-01
  - story-blog-02
design:
  - design/blog-category-page.html
---

# story-blog-03 — Category-filtered article listing

## User story
As a visitor interested in a specific topic, I want to filter blog articles by category, so that I can quickly find content relevant to my role.

## Description
Visitor lands on `/blog/category/<slug>` and sees only articles whose `category` matches. Listing layout is identical to `/blog` except the page header reflects the category name and the active category is highlighted in the filter UI.

## Acceptance criteria
- [ ] `/blog/category/food-safety` returns articles where `category = 'food-safety'`
- [ ] Page H1 reads "{Category Label} Articles"
- [ ] Active category pill is visually marked active per design tokens
- [ ] Breadcrumb: Home › Blog › {Category}
- [ ] Empty state renders if zero published articles in the category
- [ ] Page is SSG with `generateStaticParams` covering all categories
- [ ] Cards link to `/blog/[slug]`
- [ ] Lighthouse SEO score ≥ 95

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Categories enumerated in blueprint §5 Module 2: Food Safety, QC, Regulatory, Processing, Industry Insights
- Filter UI shared with `/blog` (single component)
```

## Topic → sprint default table

When proposing or adding a story, use this lookup to pre-fill the `sprint:` field. Single-sprint topics auto-suggest; multi-sprint topics always ask.

| Topic | Default sprint | Behavior |
|---|---|---|
| `homepage`, `blog`, `templates`, `services` | 1 | Pre-fill 1, single-keystroke confirm |
| `auth`, `jobs`, `experts` | 2 | Pre-fill 2, single-keystroke confirm |
| `search` | 3 | Pre-fill 3 |
| `newsletter` | — | **Always ask**: Sprint 1 (capture) or Sprint 3 (campaign sender)? |
| `admin` | — | **Always ask**: Sprint 1 (basic CMS) or Sprint 3 (full CRUD/search)? |

Never silently invent a sprint number. Never use a sprint not in the source blueprint.

## Init flow

This is the heaviest path. Run it on first invocation when `stories/` is missing.

1. **Read the blueprint.** `foodnme-core-idea.md` — extract §4 phase mapping (treat as sprint numbers) and §5 module specs (treat as topics).

2. **Read the tech spec.** `TECHNICAL-REQUIREMENTS.md` — especially §1 (success criteria) and §6 (API contracts; each endpoint usually implies ≥ 1 story). Build an in-memory **capability index** from §2 (stack), §3 (data layer / tables), §4 (auth model), §5 (integrations), §6 (endpoints), §11 (deployment) so the tech-feasibility check (step 5a) can run per-story without re-reading the file.

3. **Derive topics from blueprint §5:**

   | Topic folder | Source module | Default sprint |
   |---|---|---|
   | `homepage/` | Module 7 | 1 |
   | `blog/` | Module 2 (Knowledge Hub) | 1 |
   | `templates/` | Module 3 | 1 |
   | `services/` | Module 6 | 1 |
   | `newsletter/` | Cross-cutting | 1 (ask if Sprint 3) |
   | `auth/` | Module 1 | 2 |
   | `jobs/` | Module 4 | 2 |
   | `experts/` | Module 5 | 2 |
   | `admin/` | Module 8 | Ask (1 basic, 3 full) |
   | `search/` | Sprint 3 only | 3 |

4. **For each topic, propose a draft list of stories** (typically 3–8 per topic), each sized ≤ 5 SP. Unit-of-work signals to use:
   - One story per route × purpose (list, detail, filter, submit).
   - One story per API endpoint with its own auth + validation surface.
   - One story per cross-page reusable component family if non-trivial (e.g., NewsletterBanner).
   - Cross-check against `PRODUCT.md` §4 (16-screen surface inventory) to ensure no screen is missing.

5. **Ask for the primary owner once** (default name). Then **present the full proposed list to the user via `AskUserQuestion`**, topic-by-topic if too large. Confirm sizes, splits, sprint assignments (using the topic→sprint table to pre-fill), topic assignments, and the owner per story (default to the primary owner; override per-story if user specifies).

6. **Per story, run the tech-feasibility gate.** For each confirmed story, check every needed route / integration / table / auth assumption against the in-memory capability index from step 2. If a gap is found, ask the user:
   - **(a)** Update `TECHNICAL-REQUIREMENTS.md` first (offer to draft the addition; pause init).
   - **(b)** Defer this story (drop from this run).
   - **(c)** Record as an open question in tech-spec §14 and write the story with `status: blocked` + a `## Notes` entry pointing at the open question.
   Default offer is (a). Never silently write a story unsupported by the architecture.

7. **Per story, run the design-linkage gate.** Scan `design/` (create it empty with `.gitkeep` if missing), propose matches, resolve to a path list / `none-needed` / `follows-template:`. If user picks "upload now and re-run", drop that single story from this run with a summary line at the end.

8. **Compute dependencies:**
   - Base UI shell (`story-homepage-01`) → almost everything depends on it.
   - List → Detail → Filter ordering within a topic.
   - Auth (`story-auth-*`) → Sprint 2 dashboards, post-job, expert profile edit.
   - Admin approval flows depend on the entity's create/edit being done first.

9. **Write all files in one batch.** Then generate `stories/INDEX.md`.

10. **End with a summary message:** total stories per topic, per sprint, total SP across sprints, owner workload (`brij: 24 stories · ananya: 3 · vikram: 1`).

## Add flow

1. Ask: **topic**? **Title**? **User story** (As / I want / So that)? **Estimated SP**? **Sprint** (pre-fill from topic→sprint table; ask for multi-sprint topics)? **Owner** (default to most-recently-named in this session, or ask)?
2. **If SP > 5** → divert to split workflow before writing.
3. **Tech-feasibility gate** — check against `TECHNICAL-REQUIREMENTS.md`. If a needed capability is missing, present the (a/b/c) prompt. Do not proceed with an unresolved gap.
4. **Design-linkage gate** — run the design-linkage flow. Resolve `design:` to a path list / `none-needed` / `follows-template:`. Do not write a UI-bearing story with empty `design:`.
5. **Suggest dependencies** based on topic + sprint. User confirms or edits the list.
6. **Compute next sequence number** for that topic (read existing files in `stories/<topic>/`, find max, add 1).
7. **Write the file.** Then regenerate `stories/INDEX.md`.

## Split flow

Triggered explicitly by `split <story-id>` or implicitly when an add proposes > 5 SP.

1. Read the named story's file. Show the user its description + current acceptance criteria.
2. **Propose 2–3 candidate splits**, each ≤ 5 SP, with acceptance criteria redistributed. Each child inherits the parent's owner, topic, sprint unless the user overrides.
3. On user confirmation:
   - Move the original file to `stories/_archive/` with frontmatter `superseded_by: [new-id-1, new-id-2]` added.
   - Write the new files with fresh sequence numbers.
   - **Rewrite dependency arrays** in every other story file that pointed at the old ID — replace with the new IDs (usually all of them, since a consumer typically needs both halves; ask if unsure).
4. Regenerate `INDEX.md`.

## Update flow

Triggered by `update <story-id>`. User chooses which field to edit (`status`, `story_points`, `owner`, `dependencies`, `design`, `sprint`, `topic`).

**Completion gate on `status: done`:** the skill refuses to set `status: done` unless:
- `tasks_populated: true`, **and**
- Every task line in `## Tasks` is in state `completed` or `cancelled`.

If either fails, the skill prints the failing tasks (or the `tasks_populated: false` note), exits without writing, and suggests next steps.

After any field change, regenerate `INDEX.md`.

## Restore flow

Triggered by `restore <story-id>`. Brings a **deferred** story back from `stories/_backlog/` into an upcoming sprint. This flow **reshapes and re-slots only** — it never breaks the story into tasks (that stays `/analyze-sprint`'s job).

1. **Locate** the story in `stories/_backlog/` by ID. If it isn't there, or its `status` is not `deferred`, print why and stop (for a non-deferred story, suggest `update`/`split` instead).
2. **Show the deferral context** — the `## Notes` deferral paragraph and the recorded `original_sprint`, so the user sees *why* it was parked and what next step was recommended.
3. **Reshape / re-evaluate** (this is the "analyse it again" step, scoped to shape — never task breakdown):
   - **If `story_points > 5`** → divert into the **split flow**. It archives the backlog original to `stories/_archive/` with `superseded_by:`, writes the ≤5 SP children straight into `stories/<topic>/`, and rewrites dependents. The children take the re-slotted sprint (step 4) and `status: draft`.
   - **If the deferral cause was design or docs** → re-run the **design-linkage gate** / **tech-feasibility gate** and resolve to a path / `none-needed` / `follows-template:` / an approved tech-spec addition.
   - Allow editing `## Description` / `## Acceptance criteria` if the scope changed.
4. **Re-slot to the next open sprint.** Default to the lowest-numbered sprint that still has at least one non-`done` story; never a fully completed sprint. Set `sprint:` to it. The user may override to any non-completed sprint.
5. **Clear deferral state** — set `status: draft`, **remove the `original_sprint` field**, and keep `tasks_populated: false`.
6. **Move the file** from `stories/_backlog/` back to `stories/<topic>/`. (In the split case the children are already written to the topic folder and the original is archived — `_backlog/` is left clear of this story either way.)
7. **Regenerate `INDEX.md`.**
8. **Hand off** — print: `Restored story-<topic>-<NN> to Sprint <N> (status: draft). Run /analyze-sprint <N> to re-analyze and break it into tasks.`

## Lint flow

Read every `stories/**/story-*.md`. Parse frontmatter and Tasks section. Report issues; **never modify files**.

| Rule | Condition | Severity |
|---|---|---|
| **oversize** | `story_points > 5` | error |
| **broken-ref** | A dependency ID has no matching file | error |
| **cycle** | Dependency graph has a cycle | error |
| **status-inversion** | Status `done` but a dependency is not `done` | error |
| **sprint-violation** | Story in Sprint N depends on a story in Sprint > N | error |
| **untestable** | `## Acceptance criteria` is empty or only `TBD` lines | warning |
| **unassigned** | `owner:` missing or empty | error |
| **untasked** | `status: in-progress` but `tasks_populated: false` | warning |
| **task-marker-mismatch** | `tasks_populated: true` but Tasks section is empty / only TODO | warning |
| **premature-done** | `status: done` but ≥ 1 task in `new`, `started`, or `hold` | error |
| **invalid-task-state** | Task line missing `[<state>]` or using unknown state | error |
| **tech-arch-mismatch** | Story needs a capability not in `TECHNICAL-REQUIREMENTS.md` | warning |
| **missing-design** | `design:` is `[]` | warning |
| **design-not-found** | `design:` references a path that doesn't exist | error |
| **template-chain-empty** | `follows-template:` chain ends in empty `design:` | error |
| **design-claim-mismatch** | `design: none-needed` but acceptance criteria mention UI | warning |
| **deferred-parked** | `status: deferred` story sitting in `_backlog/` awaiting restore | info |
| **stale** | `status: draft` for > 30 days (file mtime) | info |

For `status: deferred` stories in `_backlog/`, **suppress** the `untasked`, `missing-design`, and `task-marker-mismatch` warnings — a deferred story legitimately has `tasks_populated: false` and may carry an unresolved design. Report only the single `deferred-parked` info line, and suggest `/manage-stories restore <id>` to bring it back into a sprint.

After scanning, print a grouped report (one section per rule), suggest the relevant subcommand to fix where applicable (e.g., `/manage-stories split <id>` for oversize).

## Index flow

Read every `stories/**/story-*.md` (excluding `_archive/`). Parse YAML frontmatter and count tasks in each Tasks section. Write `stories/INDEX.md` using this template:

```markdown
# Stories Index

> Generated by `/manage-stories index`. Do not hand-edit — changes overwrite.

**Summary:** <N> stories · <SP> SP · <done> done · <in-progress> in-progress · <ready> ready · <draft> draft · <blocked> blocked · <deferred> deferred (backlog)
**Owners:** <owner> (<count>) · <owner> (<count>) · …

---

## Sprint 1 — Content + Credibility   (<N> stories · <SP> SP)

### <topic>

| ID | Title | SP | Status | Owner | Tasks | Design | Depends on |
|---|---|---|---|---|---|---|---|
| story-<topic>-NN | Title | 3 | status | owner | M/N | basename or → ref or none-needed | comma list |

### <next topic>
…

---

## Sprint 2 — Community + Self-Serve   (<N> stories · <SP> SP)
…

---

## Sprint 3 — Operations + Growth   (<N> stories · <SP> SP)
…

---

## Backlog — deferred during analysis   (<N> stories · <SP> SP)

> Deferred stories live in `stories/_backlog/` (parked by `/analyze-sprint`). They are **excluded from every sprint section above and from all sprint story/SP totals**. Bring one back with `/manage-stories restore <id>`.

| ID | Title | SP | Orig. sprint | Status | Owner | Design | Depends on |
|---|---|---|---|---|---|---|---|
| story-<topic>-NN | Title | 4 | 1 | deferred | owner | basename or → ref or none-needed | comma list |

---

## Column meanings

- **Tasks:** `<completed + cancelled> / <total>`. A story is eligible for `status: done` only when this reads `N/N` and N > 0.
- **Owner:** team member responsible for execution + testing. Empty cells flagged by lint as `unassigned`.
- **Design:** linked filename basename, `none-needed`, or `→ story-<id>` for follows-template.
- **Depends on:** comma-separated story IDs. Empty cell = no dependencies.
- **Orig. sprint** (Backlog only): the sprint the story was planned for before deferral, from `original_sprint:`.
```

Sort within each topic by sequence number ascending. Sprint names (`Content + Credibility`, `Community + Self-Serve`, `Operations + Growth`) come from blueprint §4. Omit the Backlog section entirely when `stories/_backlog/` has no deferred stories.

The output must be **idempotent**: running `index` twice in a row produces zero diff.

## Operating rules

- **Every story must have an owner.** Single free-form string. Add asks; init uses a session-default after asking once. Lint flags `unassigned`.
- **Never auto-generate acceptance criteria the blueprint or tech-spec doesn't support.** If a criterion can't be grounded, write `- [ ] TBD — needs founder input on <topic>`.
- **Never populate the `## Tasks` section.** Task breakdown is a downstream step. Always write the empty TODO placeholder.
- **A story may only be marked `status: done`** when every task is `completed` or `cancelled` AND `tasks_populated: true`. The update flow enforces this and refuses to write otherwise.
- **Restore returns a deferred story to `status: draft`, never straight to `ready` or `done`.** It clears `original_sprint`, re-slots to a non-completed sprint, and hands off to `/analyze-sprint` for re-analysis. It never populates tasks.
- **Design-linkage check on every create.** Resolve `design:` to a path list / `none-needed` / `follows-template:`. Never silently write a UI-bearing story with empty design — user must explicitly choose `none-needed` if there's no UI surface.
- **Tech-feasibility check on every create.** Before writing, every needed route / integration / table / auth assumption must already be in `TECHNICAL-REQUIREMENTS.md`. If a gap is found, ask the user (update tech spec / defer / record as open question).
- **Sprint comes from the topic→sprint table.** Pre-fill on add; always ask on `admin` and `newsletter`. Never invent.
- **Never exceed 5 SP on a single story.** Always divert to split flow first.
- **Dependencies are real story IDs at write time.** Never list a planned-but-unwritten ID.
- **`stories/_archive/`** is the only place superseded files live. Never delete history.
- **`stories/INDEX.md` is generated, not edited.** Always write the warning comment at the top.
- **First-run never overwrites.** If `stories/` has any `story-*.md` files, refuse init and route to add/update/lint/index.

## Files this skill touches

The skill, when invoked, may create/edit:
- `stories/INDEX.md`
- `stories/<topic>/story-<topic>-<NN>-<slug>.md`
- `stories/_archive/<original-name>.md` (only on split)
- `stories/_backlog/<name>.md` → `stories/<topic>/<name>.md` (only on restore — moves a deferred story back into its topic folder; the file leaves `_backlog/`)
- `design/.gitkeep` (only if `design/` is missing — never creates design files themselves)

The skill never edits files outside `stories/` and `design/`, with one exception: if the tech-feasibility gate's option (c) is chosen, the skill may append to `TECHNICAL-REQUIREMENTS.md` §14 (Open questions). It must show the user the proposed addition and get explicit confirmation before appending.

## When to bail and ask

- Two stories collide on sequence number → ask which to keep.
- A dependency refers to an archived story → ask whether to rewrite to its successor IDs (usually yes).
- Tech-feasibility gap is ambiguous (the requirement could be implemented multiple ways, some supported, some not) → describe both interpretations and let the user pick.
- The blueprint or tech-spec has been updated since the last init → run lint first, then add or update one-by-one; do not re-init.
- A `restore` target story isn't in `_backlog/` or isn't `status: deferred` → say so and route to `update`/`split`; never fabricate a deferred state.
