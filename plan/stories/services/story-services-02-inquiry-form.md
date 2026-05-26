---
id: story-services-02
topic: services
sprint: 1
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
executed_date: 2026-05-26
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
- [x] Form fields render per blueprint §8 Screen 7 — _`InquiryForm` (Full name, Business email, Company name, Service needed select w/ 6 options, Describe your challenge); E2E asserts all five labelled fields render_
- [x] Zod schema validates: full_name min 2, email valid format, company_name min 1, service_needed in enum, message min 20 chars — _shared `inquirySchema` (`lib/schemas/inquiry.ts`); 7 unit tests cover each rule + email normalization + the `service_needed` enum (from `SERVICE_SLUGS`)_
- [x] Inline field errors render below each input on blur (not just on submit) — _`validateField` on `onBlur` via `inquirySchema.shape[name]`; E2E blurs an empty name and asserts "Please enter your full name." before any submit_
- [x] Turnstile widget renders; submit button disabled until token resolves — _`<Turnstile onVerify={setToken}>`; submit `disabled={!token}`; E2E asserts the button is disabled with no token (and enabled once the token resolves)_
- [x] Submit POSTs to `/api/inquiry` (story-services-03) with `{ full_name, email, company_name, service_needed, message, turnstile_token }` — _E2E intercepts the POST and asserts the body matches the payload (endpoint built in services-03)_
- [x] Idempotency-Key header set per submission to dedupe accidental double-clicks — _`crypto.randomUUID()` set as the `Idempotency-Key` header; E2E asserts the header is present_
- [x] Success state: form replaced by confirmation message "We received your inquiry — we'll respond within 24 hours." — _on `{ ok: true }` the form is replaced by a `role="status"` confirmation; E2E asserts the message + that the fields are gone_
- [x] Failure state: inline error banner with retry; do not lose form input — _on a non-ok response a `role="alert"` banner renders and values are kept; E2E (500 response) asserts the banner + that "Full name" still holds its value_
- [x] Caption below button: "We respond within 24 hours. No commitment required." — _rendered under the submit; E2E asserts the copy_
- [x] Accessibility: every input has a `<label>`; form is submittable via Enter; focus moves to first error on validation fail — _all fields use the labelled `Input`/`Select`/`Textarea` primitives (`getByLabel` resolves each); native `<form onSubmit>` is Enter-submittable; on a failed submit the first errored field (in order) is `.focus()`-ed. The services-page axe scan (zero serious/critical) covers the form with the page_

## Tasks
- [completed] Author the shared Zod schema in `lib/schemas/inquiry.ts` (full_name≥2, email, company_name≥1, service_needed enum of the 6 services, message≥20) (AC#2)
- [completed] Build the `InquiryForm` fields per §8 Screen 7 with on-blur inline errors + a11y (labels, Enter-submit, focus-to-first-error) (AC#1, AC#3, AC#10)
- [completed] Render inline Turnstile; disable submit until token resolves (AC#4)
- [completed] Wire submit → `POST /api/inquiry` with the payload + `Idempotency-Key` header (AC#5, AC#6)
- [completed] Success-replaces-form + inline failure banner that preserves input + button caption (AC#7, AC#8, AC#9)

## Notes
- Zod schema lives in `lib/schemas/inquiry.ts` and is imported by both client and server per `TECHNICAL-REQUIREMENTS.md` §6.1.
- Turnstile required per §9.6.
- Idempotency-Key handling per §6.1.
- _Analyzed 2026-05-23: fully grounded in §6.1 / §9.6 — no open questions. `service_needed` enum must match the 6 services named in `story-services-01`._
- _Executed 2026-05-26: `lib/schemas/inquiry.ts` (shared `inquirySchema`, `service_needed` from `SERVICE_SLUGS`) + `components/services/InquiryForm.tsx` (`"use client"`, reuses the `Input`/`Select`/`Textarea` primitives + `Turnstile`), mounted in the `#inquiry` section of `/services`. Submit POSTs `/api/inquiry` with an `Idempotency-Key`; success replaces the form, failure shows a retry banner preserving input. `InquiryForm` takes an optional `source` prop (forwarded to the API) so **services-04's consultation modal reuses the same component** — services-02 sends exactly the AC#5 payload (no source). Tests: 7 unit (schema) + 5 E2E (`services-inquiry.spec.ts`, Turnstile stubbed via `addInitScript` for a deterministic submit gate). The endpoint itself lands in services-03 — the form E2E stubs `/api/inquiry`._
