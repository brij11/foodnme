---
id: story-services-03
topic: services
sprint: 1
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
executed_date: 2026-05-26
dependencies:
  - story-services-02
design: none-needed
---

# story-services-03 — POST /api/inquiry: ZeptoMail dual-email + Supabase insert

## User story
As the founder, I want every inquiry to land in my inbox immediately and the visitor to get a confirmation email, so that I never miss a lead and the visitor knows their message was received.

## Description
Implement `POST /app/api/inquiry/route.ts`. Validates body with the shared Zod schema. Verifies Turnstile token server-side. Inserts row into `service_inquiries` (including the `source` column). Sends two emails via ZeptoMail: notification to founder + confirmation to user. Honors `Idempotency-Key` header via Upstash Redis (5-min window).

## Acceptance criteria
- [x] Zod validation; 400 on parse fail — _shared `inquirySchema.safeParse` → 400 `invalid_body`; unit test (short message) + the real-endpoint E2E (invalid body → 400)_
- [x] Turnstile token verified server-side BEFORE the DB insert; 400 on fail — _`verifyTurnstile` runs before `createServiceClient`/insert; unit test asserts a failed token → 400 with no insert_
- [x] Insert into `service_inquiries` succeeds; row contains all fields + `source` + `submitted_at = now()` — _`insert({ full_name, email, company_name, service_needed, message, source, submitted_at })`; unit asserts the insert args (incl. `source` default + `submitted_at`); real-endpoint E2E inserts against local Supabase and returns `{ ok: true }`_
- [x] ZeptoMail notification to `ADMIN_EMAIL`: subject "New inquiry: {service_needed}", body includes name + email + company + message — _`sendEmail` to `ADMIN_EMAIL`, subject `New inquiry: ${serviceName(...)}`, body has all four; unit asserts the subject prefix + 2 sends_
- [x] ZeptoMail confirmation to user: subject "We received your inquiry — here's what's next", body summarizes next steps — _second `sendEmail` to the visitor; unit asserts the exact subject_
- [x] Idempotency-Key honored: same key within 5 min returns the same response without duplicate insert/emails — _`Idempotency-Key` → `getCachedResponse`/`cacheResponse` (5-min Upstash window); unit test (cached key) asserts `{ ok: true }` with **no** insert and **no** emails. Best-effort: no-ops without Upstash (§6.1)_
- [x] If ZeptoMail send fails after DB insert, log to Sentry but return 200 (DB is source of truth; email retry is a separate concern) — _sends wrapped in try/catch → `logError` (Sentry in prod) + still `ok()`; unit test (send rejects) asserts 200_
- [x] Unit tests cover happy path, Zod fail, Turnstile fail, Idempotency replay — _`app/api/inquiry/route.test.ts`: happy, custom source, Zod fail, Turnstile fail, idempotency replay, email-fail→200 (6)_
- [x] No service-role key in client bundle — _server-only API route via `createServiceClient`; no direct `process.env.SUPABASE_SERVICE_ROLE_KEY`; `pnpm lint` (no-restricted-syntax) passes_

## Tasks
- [completed] Scaffold `app/api/inquiry/route.ts` reusing the shared Zod schema; 400 on parse fail (AC#1, AC#9)
- [completed] Server-side Turnstile verification before any DB write; 400 on fail (AC#2)
- [completed] Insert into `service_inquiries` (all fields + `source` + `submitted_at`) (AC#3)
- [completed] ZeptoMail dual-send (founder notification + user confirmation) with the specified subjects/bodies; Sentry-log + 200 on send failure after insert (AC#4, AC#5, AC#7)
- [completed] Idempotency-Key dedupe via Upstash (5-min window) + unit tests (happy / Zod fail / Turnstile fail / idempotency replay) (AC#6, AC#8)

## Notes
- Contract per blueprint §9 and `TECHNICAL-REQUIREMENTS.md` §6.2.
- ZeptoMail email templates per blueprint §10.
- No rate limit yet; tracked as open question (`TECHNICAL-REQUIREMENTS.md` Appendix OQ#1).
- _Analyzed 2026-05-23: grounded in §6.2; `design: none-needed` correct. Added `source` to the insert AC now that `service_inquiries.source` exists (§4.2) — the endpoint is shared by the services form (`source='services_page'`) and the consultation modal (`source='consultation_modal'`, `story-services-04`)._
- _Executed 2026-05-26: `app/api/inquiry/route.ts` mirrors the newsletter route (Zod → Turnstile → idempotency replay → service-role insert → best-effort dual ZeptoMail → ok). `source` is read off the raw body and constrained to a known set (`services_page` | `consultation_modal`, default `services_page`) — the shared `inquirySchema` stays source-free so services-02's form payload is unchanged. Verified by 6 unit tests (Supabase/Turnstile/email/idempotency mocked) + 2 real-endpoint E2E (`inquiry-api.spec.ts`, live local Supabase insert + always-pass Turnstile test secret). ZeptoMail no-ops locally (no key) so the user-facing path is unaffected (AC#7)._
