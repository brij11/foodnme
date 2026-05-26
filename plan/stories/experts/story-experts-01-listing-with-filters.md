---
id: story-experts-01
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
  - story-auth-06
design:
  - design/screens-experts.jsx
---

# story-experts-01 — Experts listing /experts with specialization / location filters

## User story
As a visitor needing a food-safety auditor or HACCP consultant, I want a directory of approved experts I can filter by specialization and location, so that I can shortlist candidates without sifting through LinkedIn.

## Description
Build `app/(public)/experts/page.tsx` using the ExpertsListingPage layout from `design/screens-experts.jsx`. SSR with `searchParams` for `q` (free-text search), `specialization` (multi), `location`, and `available`. Only `status='active'` experts shown. Featured (`is_featured=true`) experts surface first. Cards: 2-letter avatar initial, name, specializations (top 2 as tags), location, availability dot, "View Profile" link.

Filter set decided during analysis: **free-text search + specialization multi-select + location ILIKE + "Available now" toggle**. The prototype's "Verified only" toggle and rating sort are dropped — the `experts` schema (§4.2) has no rating column, so featured-first + `created_at desc` is the only ordering.

## Acceptance criteria
- [x] `/experts` SSR; cache `s-maxage=60, stale-while-revalidate=300` — `next.config.mjs` LISTING_CACHE source `/experts`
- [x] Only `status='active'` rows returned (RLS enforced) — `experts_public_read_active` policy + explicit `.eq('status','active')`; anon client only sees active
- [x] Featured experts surface first, then by `created_at desc` (no rating sort — no rating column in §4.2) — `order(is_featured desc, created_at desc)`; `experts-listing.spec.ts` first card carries Verified
- [x] Free-text search box: matches `full_name` + `specializations` (via the experts `search_vector` FTS or ILIKE) — FTS over the generated `search_vector` (full_name+title+specializations); `experts-listing.spec.ts` "q=dairy → Priya"
- [x] Specialization filter: multi-select drawn from SPECIALIZATIONS list — array `.overlaps`; `experts-listing.spec.ts` "specialization=Dairy"
- [x] Location filter: text input, ILIKE match — `experts-listing.spec.ts` "location=Mumbai"
- [x] "Available now" toggle filters to `is_available = true` — `experts-listing.spec.ts` "available=true → 6 of 8"
- [x] Availability dot color: green when `is_available=true`, gray otherwise — `bg-secondary` vs `bg-muted-2`; dot asserted present
- [x] Avatar uses `full_name` initials (2 letters) — `avatar_url` is optional, fall back to initials — `expertInitials` (unit-tested) + `<img>` when `avatar_url` set
- [x] Card surfaces `title` (headline under name) and `hourly_rate` — added to the `experts` schema §4.2 during analysis — rendered on `ExpertCard` (`formatHourlyRate` unit-tested)
- [x] Empty state: "No experts match your filters. Try clearing one." + clear-filters CTA — three-part `EmptyState`; `experts-listing.spec.ts` "empty state"

## Tasks
- [completed] Scaffold `app/(public)/experts/page.tsx` — SSR reading `searchParams` (`q`, `specialization[]`, `location`, `available`), cache `s-maxage=60, stale-while-revalidate=300`
- [completed] Build the query: `status='active'` (RLS), specialization array-overlap, location ILIKE, free-text on `full_name`+`specializations`, `is_available` toggle; order `is_featured desc, created_at desc`
- [completed] Port the sidebar from `design/screens-experts.jsx` — free-text search, specialization multi-select (SPECIALIZATIONS), location text input, "Available now" toggle, "Clear all filters"; omit "Verified only" + sort
- [completed] Render `ExpertCard` — 2-letter `full_name` initials (fall back from `avatar_url`), name, `title`, `hourly_rate`, top specializations as tags, location, availability dot (green when `is_available`); links to `/experts/[id]`
- [completed] Empty state (title + message + "Clear filters" CTA); stagger card entry with `key=` reset on filter change, respect reduced-motion

## Notes
- 2-letter avatar fallback per `CLAUDE.md` (rendering-only field preserved from prototype shape).
- Featured surfacing per admin's `is_featured` flag — toggled in admin approval (`story-experts-07`).
- _Executed 2026-05-26: created the `experts` table + RLS + seed (8 experts ported from data.jsx as `status='active'`). **Schema infra:** this story owns the `experts` migration (no other story did, and the listing is the first consumer). The generated `search_vector` uses a user-defined IMMUTABLE wrapper `experts_search_doc()` — `array_to_string`/`array_out` are STABLE and rejected by generated columns. Writes are service-role-only (no RLS write policy); the listing reads via the anon client (RLS → active only). Filter sidebar is a plain GET form (SSR, no client JS). Enabled the "Experts" nav link. Verified by 8 E2E (`experts-listing.spec.ts`, incl. axe) + `experts.test.ts` (initials, rate format)._
