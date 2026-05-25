---
id: story-experts-02
topic: experts
sprint: 2
story_points: 3
status: draft
owner: brij
tasks_populated: false
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

## Acceptance criteria
- [ ] `/experts/[id]` SSR; 404 if not found or `status != 'active'`
- [ ] Renders full_name, specializations, bio, experience_years, certifications, location, availability state
- [ ] `contact_email` NOT rendered in client HTML — surfaced only via the email-form submission flow
- [ ] "Contact" CTA opens `ContactExpertModal` (story-experts-03)
- [ ] Featured badge rendered when `is_featured=true`
- [ ] Breadcrumb: Home › Experts › {Full Name}
- [ ] `generateMetadata` returns per-expert title + description + OG card
- [ ] Lighthouse SEO ≥ 95

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- `contact_email` privacy: never rendered, only used server-side when forwarding via ZeptoMail (story-experts-03). This protects experts from scraping.
- Direct messaging is OUT of scope per blueprint §5 Module 5 — contact is exclusively via email form.
