---
id: story-experts-11
topic: experts
sprint: 4
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
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
- [ ] Migration adds the `expert_inquiries` table (per §4.2) with RLS: anon insert, owning expert reads own + updates `is_read`, admin read (never cross-expert)
- [ ] `POST /api/expert-inquiry` inserts an `expert_inquiries` row (sender, company, engagement type, message) before sending the ZeptoMail notification; existing email behavior preserved
- [ ] Expert dashboard renders a 4-card stats grid: **Inquiries** (count), **Avg rating** ("—" when `review_count=0`, not fabricated), **Response time** (`experts.response_time`), **Availability** (`is_available` state)
- [ ] "Inquiries" tab renders a real list (no placeholder); each row shows sender name, company, engagement type, time, and message; unread inquiries are visually marked
- [ ] Data scoped to the signed-in expert via RLS; an expert never sees another expert's inquiries
- [ ] Empty state when no inquiries
- [ ] No fabricated metrics: "Profile views" / "Active engagements" are not tracked and are omitted (not shown with invented values)

## Tasks
- [new] Write migration: `expert_inquiries` table (id, expert_id FK, sender_name, sender_email, company_name, engagement_type, message, is_read, created_at) + `(expert_id, created_at desc)` index
- [new] Add RLS policies: anon insert; owning expert reads own + updates `is_read`; admin read; no cross-expert access
- [new] Update `POST /api/expert-inquiry` to insert an `expert_inquiries` row before the ZeptoMail notify; keep existing email behavior + tests green
- [new] Add the 4-card stats grid to `ExpertDashboard.tsx`: Inquiries count, Avg rating ("—" when no reviews), Response time, Availability
- [new] Replace the "Inquiries" tab placeholder with a real inbox list (sender, company, engagement type, time, message; unread marker) reading the expert's own rows; empty state when none
- [new] Add a "mark read" interaction that updates `is_read` (RLS-scoped)
- [new] Add tests: inquiry insert on POST, RLS scoping (expert sees only own), stats render incl. "—" rating fallback, inbox empty state

## Notes
- Audit gap #16 Expert (Major): stats missing + Inquiries tab stubbed.
- **Persistence resolved 2026-05-30:** expert inquiries were email-only (`/api/expert-inquiry` did not store). Added `expert_inquiries` table + RLS + retention to `TECHNICAL-REQUIREMENTS.md` §4.1/§4.2/§6.2/§9.5, and endpoint now persists.
- **Size-cap override:** this story spans schema + endpoint + dashboard UI (~6 SP, over the 5-SP cap). Kept as a single story by explicit owner decision (2026-05-30) rather than split into a separate `expert_inquiries` schema story.
