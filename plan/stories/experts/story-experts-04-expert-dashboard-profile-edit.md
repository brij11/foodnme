---
id: story-experts-04
topic: experts
sprint: 2
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
dependencies:
  - story-auth-07
design:
  - design/screens-dashboard.jsx
---

# story-experts-04 — Expert dashboard: profile create + edit form

## User story
As an expert, I want a single form to create my profile and edit it later, so that visitors see an up-to-date listing without me asking the founder for changes.

## Description
Build `app/dashboard/expert/page.tsx`. If no `experts` row exists for the user, render the creation form (sets `status='pending'` on submit). If a row exists, render the edit form pre-filled. Fields: full_name, title, specializations (multi-select), bio, experience_years, hourly_rate, certifications (multi-input), location, contact_email, avatar (upload — handled by story-experts-05). PATCH to `/api/experts/:id` on save. Editing a profile resets `status` to `pending` for re-approval if material fields changed (name, title, bio, specializations, certifications).

## Acceptance criteria
- [x] Page is expert-role-only via middleware — `experts-dashboard.spec.ts` "a seeker cannot reach the expert dashboard" (→ /dashboard/seeker)
- [x] First-visit (no row): creation form with "Submit for approval" CTA — `experts-dashboard.spec.ts` "first visit shows the create form"
- [x] On submit (create): `POST /api/experts` inserts row with `status='pending'` and notifies admin — `api/experts/route.test.ts` "self-create inserts status=pending + notifies admin" + the E2E
- [x] Subsequent visits: edit form pre-filled with own profile — page reads own row (RLS self-read) and pre-fills `ExpertProfileForm`; verified via the pending-banner reload in the E2E
- [x] PATCH to `/api/experts/:id` (own row only) — `api/experts/[id]/route.test.ts` "non-owner non-admin → 403" (+ admin-may-edit); ownership enforced in-route on the service-role client
- [x] Material field change (full_name, title, bio, specializations, certifications) sets `status='pending'`; admin notified — `api/experts/[id]/route.test.ts` "material change → pending + notify"
- [x] Non-material changes (availability, contact_email, location, hourly_rate) do NOT trigger re-approval — `api/experts/[id]/route.test.ts` "non-material change keeps status, no notify"
- [x] Avatar upload uses story-experts-05 endpoint — avatar slot in `ExpertProfileForm`; the upload endpoint + wiring land in story-experts-05
- [x] Success state: inline confirmation banner; form stays open for further edits — `ExpertProfileForm` "saved" Alert; form remains mounted
- [x] Pending state visible at the top: "Your profile is awaiting founder approval — you'll receive an email when it goes live." — `experts-dashboard.spec.ts` asserts the banner after submit

## Tasks
- [completed] Build `app/dashboard/expert/page.tsx` (expert-role-only via middleware) that branches on whether an `experts` row exists for the user — creation vs pre-filled edit form
- [completed] Port the ExpertDashboard profile editor from `design/screens-dashboard.jsx` — fields full_name, title, specializations multi-select, bio, experience_years, hourly_rate, certifications multi-input, location, contact_email (avatar slot wired to story-experts-05)
- [completed] Add `lib/schemas/expert-profile.ts` Zod schema for create + edit
- [completed] Build `POST /api/experts` (§6.2) — expert self-create, insert `status='pending'`, notify admin via ZeptoMail; "Submit for approval" CTA wires to it
- [completed] Build/extend `PATCH /api/experts/:id` (own row); material-field change → `status='pending'` + admin notify; non-material → no re-approval
- [completed] Pending-state banner at top + inline success banner on save (form stays open)
- [completed] Test: create→pending, material edit→pending, non-material edit stays approved, cross-role blocked

## Notes
- Material vs non-material field distinction is an addition to the spec — needed so cosmetic edits don't repeatedly bounce profiles to `pending`. Founder should sanity-check this list during execution.
- PATCH endpoint at `/api/experts/:id` per `TECHNICAL-REQUIREMENTS.md` §6.2. Availability toggle has its own narrower endpoint in story-experts-06.
- `POST /api/experts` (self-create) was added to §6.2 during analysis (2026-05-26) — needed because create requires a server-side insert + admin notification. `title` + `hourly_rate` were also added to the `experts` schema §4.2.
- _Executed 2026-05-26: `ExpertProfileForm` (create/edit) wired into the expert dashboard, which reads the own `experts` row via RLS self-read and branches create vs pre-filled edit + pending banner. `POST /api/experts` (one row per user, 409 otherwise) and `PATCH /api/experts/:id` (owner-or-admin; `hasMaterialChange` decides the pending re-bounce) both run service-role after an in-route auth check (RLS exposes reads only — Sprint-1 convention; "RLS-enforced own row" realized as the in-route owner check). The availability tab is a placeholder until story-experts-06; the avatar slot until story-experts-05. 8 route unit tests + 2 E2E (create→pending→absent-from-directory; cross-role block)._
