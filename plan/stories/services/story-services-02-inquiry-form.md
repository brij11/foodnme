---
id: story-services-02
topic: services
sprint: 1
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
dependencies:
  - story-services-01
design:
  - design/screens-main.jsx
---

# story-services-02 — Inquiry form UI with Zod validation + Cloudflare Turnstile

## User story
As a potential client, I want a simple inquiry form on the services page that validates input clearly and resists spam, so that submitting my question takes seconds and I don't get auto-filtered as a bot.

## Description
Build the `InquiryForm` component mounted at `#inquiry` on `/services`. Fields: Full Name (text), Business Email (email), Company Name (text), Service Needed (Select — 6 options), Describe Your Challenge (textarea, 4 rows). Submit button: "Send My Inquiry". Cloudflare Turnstile widget renders inline above submit. Client-side validation via Zod shared schema (re-used by the API route in `story-services-03`).

## Acceptance criteria
- [ ] Form fields render per blueprint §8 Screen 7
- [ ] Zod schema validates: full_name min 2, email valid format, company_name min 1, service_needed in enum, message min 20 chars
- [ ] Inline field errors render below each input on blur (not just on submit)
- [ ] Turnstile widget renders; submit button disabled until token resolves
- [ ] Submit POSTs to `/api/inquiry` (story-services-03) with `{ full_name, email, company_name, service_needed, message, turnstile_token }`
- [ ] Idempotency-Key header set per submission to dedupe accidental double-clicks
- [ ] Success state: form replaced by confirmation message "We received your inquiry — we'll respond within 24 hours."
- [ ] Failure state: inline error banner with retry; do not lose form input
- [ ] Caption below button: "We respond within 24 hours. No commitment required."
- [ ] Accessibility: every input has a `<label>`; form is submittable via Enter; focus moves to first error on validation fail

## Tasks
- [new] Author the shared Zod schema in `lib/schemas/inquiry.ts` (full_name≥2, email, company_name≥1, service_needed enum of the 6 services, message≥20) (AC#2)
- [new] Build the `InquiryForm` fields per §8 Screen 7 with on-blur inline errors + a11y (labels, Enter-submit, focus-to-first-error) (AC#1, AC#3, AC#10)
- [new] Render inline Turnstile; disable submit until token resolves (AC#4)
- [new] Wire submit → `POST /api/inquiry` with the payload + `Idempotency-Key` header (AC#5, AC#6)
- [new] Success-replaces-form + inline failure banner that preserves input + button caption (AC#7, AC#8, AC#9)

## Notes
- Zod schema lives in `lib/schemas/inquiry.ts` and is imported by both client and server per `TECHNICAL-REQUIREMENTS.md` §6.1.
- Turnstile required per §9.6.
- Idempotency-Key handling per §6.1.
- _Analyzed 2026-05-23: fully grounded in §6.1 / §9.6 — no open questions. `service_needed` enum must match the 6 services named in `story-services-01`._
