---
id: story-experts-01
topic: experts
sprint: 2
story_points: 4
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-auth-06
design:
  - design/screens-experts.jsx
---

# story-experts-01 — Experts listing /experts with specialization / location filters

## User story
As a visitor needing a food-safety auditor or HACCP consultant, I want a directory of approved experts I can filter by specialization and location, so that I can shortlist candidates without sifting through LinkedIn.

## Description
Build `app/(public)/experts/page.tsx` using the ExpertsListingPage layout from `design/screens-experts.jsx`. SSR with `searchParams.specialization` and `searchParams.location`. Only `status='active'` experts shown. Featured (`is_featured=true`) experts surface first. Cards: 2-letter avatar initial, name, specializations (top 2 as tags), location, availability dot, "View Profile" link.

## Acceptance criteria
- [ ] `/experts` SSR; cache `s-maxage=60, stale-while-revalidate=300`
- [ ] Only `status='active'` rows returned (RLS enforced)
- [ ] Featured experts surface first, then by `created_at desc`
- [ ] Specialization filter: multi-select drawn from SPECIALIZATIONS list (from `data.jsx` shape)
- [ ] Location filter: text input, ILIKE match
- [ ] Availability dot color: green when `is_available=true`, gray otherwise
- [ ] Avatar uses `full_name` initials (2 letters) — `avatar_url` is optional, fall back to initials
- [ ] Empty state: "No experts match your filters. Try clearing one." + clear-filters CTA

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- 2-letter avatar fallback per `CLAUDE.md` (rendering-only field preserved from prototype shape).
- Featured surfacing per admin's `is_featured` flag — toggled in admin approval (`story-experts-07`).
