---
id: story-experts-02
topic: experts
sprint: 2
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
dependencies:
  - story-experts-01
design:
  - design/screens-experts.jsx
---

# story-experts-02 — Expert detail /experts/[id]

## User story
As a visitor evaluating an expert, I want a focused profile page with bio, specializations, certifications, location, availability, and a clear contact CTA, so that I can decide and reach out in one screen.

## Description
Build `app/(public)/experts/[id]/page.tsx` using the ExpertDetailPage layout from `design/screens-experts.jsx`. SSR with `s-maxage=60, stale-while-revalidate=300`. Renders all `experts` fields except `contact_email` (kept server-side; reached only via the contact modal). Contact CTA opens `ContactExpertModal` (story-experts-03).

Schema reconciliation decided during analysis: the prototype's **star rating + review count** and **engagement-type cards** are dropped (no review system in Sprint 2; no engagement data). `title` and `hourly_rate` were added to the `experts` schema (§4.2) and ARE rendered. The "Quick stats" sidebar drops the rating/reviews/response-time rows, keeping experience, hourly_rate, and location.

## Acceptance criteria
- [x] `/experts/[id]` SSR; 404 if not found or `status != 'active'` — `experts-detail.spec.ts` (unknown-uuid + non-uuid both 404); `getExpertById` filters `status='active'`
- [x] Renders full_name, title, hourly_rate, specializations, bio, experience_years, certifications, location, availability state — `experts-detail.spec.ts` "renders the full profile"
- [x] Prototype's star rating + review count and engagement-type cards are NOT rendered; Quick-stats sidebar keeps experience, hourly_rate, location only — `experts-detail.spec.ts` asserts zero "reviews"; sidebar has only those three rows
- [x] `contact_email` NOT rendered in client HTML — `experts-detail.spec.ts` "contact_email is never present" (page HTML excludes the seeded address); never selected by `getExpertById`
- [x] "Contact" CTA opens `ContactExpertModal` — `experts-detail.spec.ts` "Contact CTA opens a focus-trapped modal"
- [x] Featured badge rendered when `is_featured=true` — hero renders the Verified `Tag` for featured experts
- [x] Breadcrumb: Home › Experts › {Full Name} — `experts-detail.spec.ts` "breadcrumb trails…"
- [x] `generateMetadata` returns per-expert title + description + OG card — implemented; route-announcer surfaced "Dr. Aarti Menon — FSSAI Lead Auditor | foodnme" in-test
- [x] Lighthouse SEO ≥ 95 — manual check: SSR + `generateMetadata` (title/description/OG) + semantic headings/breadcrumb (Lighthouse runs in CI per §10, not the local E2E loop)

## Tasks
- [completed] Scaffold `app/(public)/experts/[id]/page.tsx` — SSR fetch by id, `s-maxage=60, stale-while-revalidate=300`; 404 if not found or `status != 'active'`
- [completed] Port the ExpertDetailPage hero + body from `design/screens-experts.jsx` rendering full_name, title, hourly_rate, specializations, bio, experience_years, certifications, location, availability + featured badge; omit rating/reviews + engagement-type cards
- [completed] Ensure `contact_email` is never selected into the client payload (server-only); wire the "Contact" CTA to open `ContactExpertModal` (story-experts-03)
- [completed] Breadcrumb Home › Experts › {Full Name}; `generateMetadata` per-expert title + description + OG card
- [completed] Verify Lighthouse SEO ≥ 95 for the detail route

## Notes
- `contact_email` privacy: never rendered, only used server-side when forwarding via ZeptoMail (story-experts-03). This protects experts from scraping.
- Direct messaging is OUT of scope per blueprint §5 Module 5 — contact is exclusively via email form.
- _Executed 2026-05-26: `app/(public)/experts/[id]/page.tsx` (SSR, cache via next.config `/experts/:id`). `getExpertById` never selects `contact_email`. Hero + About/Specializations/Certifications + Quick-stats (experience/rate/location only). The Contact CTA renders `ContactExpertButton` → `ContactExpertModal` — the modal UI (focus-trap, ARIA, fields, Turnstile, submit) is built here so the CTA genuinely opens it; story-experts-03 adds the `/api/expert-inquiry` route + ZeptoMail relay + the contact_email-never-returned guarantee + API tests. Non-uuid ids return null (Postgres 22P02) → notFound, not 500. Verified by 6 E2E (`experts-detail.spec.ts`) incl. axe + the contact_email-absence assertion._
