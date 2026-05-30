---
id: story-experts-11
topic: experts
sprint: 4
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-experts-03
  - story-experts-04
design:
  - design/screens-dashboard.jsx
---

# story-experts-11 — Expert dashboard stat cards + inquiries inbox

## User story
As an expert, I want stats on my profile and a list of inquiries I've received, so that I can track interest and respond from the dashboard.

## Description
The expert dashboard (`components/dashboard/ExpertDashboard.tsx`) has a profile form + availability toggle, but is missing the designed 4-card stats grid, and its "Inquiries" tab is a placeholder. Add the stats row and a real inquiries inbox per `screens-dashboard.jsx`. **Persistence gap resolved (2026-05-30): expert inquiries are currently email-only — `POST /api/expert-inquiry` sends via ZeptoMail without storing.** This story adds the new `expert_inquiries` table (+ RLS) and makes `/api/expert-inquiry` insert before notifying, then reads the inbox from it (sender, company, engagement type, time, message, unread indicator). Spans schema + UI — see Notes re: the size-cap override.

## Acceptance criteria
- [x] Migration adds the `expert_inquiries` table (per §4.2) with RLS: anon insert, owning expert reads own + updates `is_read`, admin read (never cross-expert) — `20260530000003_expert_inquiries.sql`; owning-expert select/update + admin select policies; inserts via the turnstile-gated service-role route (same convention as `service_inquiries`, §4.1 — see Notes); `e2e/expert-inquiries.spec.ts` proves RLS scoping + anon sees none
- [x] `POST /api/expert-inquiry` inserts an `expert_inquiries` row (sender, company, engagement type, message) before sending the ZeptoMail notification; existing email behavior preserved — route inserts before relay (non-fatal on storage error); `route.test.ts` asserts the insert + all prior email tests still green (8/8)
- [x] Expert dashboard renders a 4-card stats grid: **Inquiries** (count), **Avg rating** ("—" when `review_count=0`, not fabricated), **Response time** (`experts.response_time`), **Availability** (`is_available` state) — `ExpertDashboard` `expert-stats` grid; `e2e/expert-inquiries.spec.ts` asserts values
- [x] "Inquiries" tab renders a real list (no placeholder); each row shows sender name, company, engagement type, time, and message; unread inquiries are visually marked — `InquiriesInbox.tsx`; E2E asserts rows, company, engagement chip, unread marker
- [x] Data scoped to the signed-in expert via RLS; an expert never sees another expert's inquiries — `e2e/expert-inquiries.spec.ts` RLS test (expert two sees only their 1 row; never expert one's)
- [x] Empty state when no inquiries — `InquiriesInbox` renders `EmptyState` when `items.length === 0`
- [x] No fabricated metrics: "Profile views" / "Active engagements" are not tracked and are omitted (not shown with invented values) — only the four real stats render; E2E asserts the grid does not contain "Profile views"/"Active engagements"

## Tasks
- [completed] Write migration: `expert_inquiries` table (id, expert_id FK, sender_name, sender_email, company_name, engagement_type, message, is_read, created_at) + `(expert_id, created_at desc)` index
- [completed] Add RLS policies: owning expert reads own + updates `is_read`; admin read; no cross-expert access (inserts via service-role route — see Notes)
- [completed] Update `POST /api/expert-inquiry` to insert an `expert_inquiries` row before the ZeptoMail notify; keep existing email behavior + tests green
- [completed] Add the 4-card stats grid to `ExpertDashboard.tsx`: Inquiries count, Avg rating ("—" when no reviews), Response time, Availability
- [completed] Replace the "Inquiries" tab placeholder with a real inbox list (sender, company, engagement type, time, message; unread marker) reading the expert's own rows; empty state when none
- [completed] Add a "mark read" interaction that updates `is_read` (RLS-scoped)
- [completed] Add tests: inquiry insert on POST, RLS scoping (expert sees only own), stats render incl. "—" rating fallback, inbox empty state

## Notes
- Audit gap #16 Expert (Major): stats missing + Inquiries tab stubbed.
- **Persistence resolved 2026-05-30:** expert inquiries were email-only (`/api/expert-inquiry` did not store). Added `expert_inquiries` table + RLS + retention to `TECHNICAL-REQUIREMENTS.md` §4.1/§4.2/§6.2/§9.5, and endpoint now persists.
- **Size-cap override:** this story spans schema + endpoint + dashboard UI (~6 SP, over the 5-SP cap). Kept as a single story by explicit owner decision (2026-05-30) rather than split into a separate `expert_inquiries` schema story.
- **Execution (2026-05-30):** the AC's "anon insert" is realized through the turnstile-gated service-role `/api/expert-inquiry` route (which now persists the row), matching the established `service_inquiries`/`newsletter` convention — no direct anon-insert RLS policy (which would let callers bypass turnstile/validation). RLS exposes reads to the owning expert + admin and lets the owner flip `is_read`. Verified end-to-end (anon cannot read; expert two never sees expert one's rows).
- **Pre-existing env failure (not this story):** `e2e/experts-contact.spec.ts` "shows success" fails in this sandbox because `verifyTurnstile` performs a live `fetch` to Cloudflare siteverify that the headless Playwright environment can't complete — confirmed identical failure on the pre-experts-11 commit (stash test) and `curl` against the route returns `{ok:true}`. Belongs to the done story-experts-03; experts-11's own inquiry-insert is unit-tested and the dashboard/RLS flows pass E2E.
