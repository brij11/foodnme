---
id: story-experts-04
topic: experts
sprint: 2
story_points: 4
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-auth-07
design:
  - design/screens-dashboard.jsx
---

# story-experts-04 — Expert dashboard: profile create + edit form

## User story
As an expert, I want a single form to create my profile and edit it later, so that visitors see an up-to-date listing without me asking the founder for changes.

## Description
Build `app/dashboard/expert/page.tsx`. If no `experts` row exists for the user, render the creation form (sets `status='pending'` on submit). If a row exists, render the edit form pre-filled. Fields: full_name, specializations (multi-select), bio, experience_years, certifications (multi-input), location, contact_email, avatar (upload — handled by story-experts-05). PATCH to `/api/experts/:id` on save. Editing a profile resets `status` to `pending` for re-approval if material fields changed (name, bio, specializations).

## Acceptance criteria
- [ ] Page is expert-role-only via middleware
- [ ] First-visit (no row): creation form with "Submit for approval" CTA
- [ ] On submit (create): insert row with `status='pending'`; admin notified via ZeptoMail
- [ ] Subsequent visits: edit form pre-filled with own profile
- [ ] PATCH to `/api/experts/:id` (own row only — RLS-enforced)
- [ ] Material field change (full_name, bio, specializations, certifications) sets `status='pending'`; admin notified
- [ ] Non-material changes (availability, contact_email, location) do NOT trigger re-approval
- [ ] Avatar upload uses story-experts-05 endpoint
- [ ] Success state: inline confirmation banner; form stays open for further edits
- [ ] Pending state visible at the top: "Your profile is awaiting founder approval — you'll receive an email when it goes live."

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Material vs non-material field distinction is an addition to the spec — needed so cosmetic edits don't repeatedly bounce profiles to `pending`. Founder should sanity-check this list during execution.
- PATCH endpoint at `/api/experts/:id` per `TECHNICAL-REQUIREMENTS.md` §6.2. Availability toggle has its own narrower endpoint in story-experts-06.
