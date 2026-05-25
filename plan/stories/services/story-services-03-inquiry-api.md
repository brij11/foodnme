---
id: story-services-03
topic: services
sprint: 1
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
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
- [ ] Zod validation; 400 on parse fail
- [ ] Turnstile token verified server-side BEFORE the DB insert; 400 on fail
- [ ] Insert into `service_inquiries` succeeds; row contains all fields + `source` + `submitted_at = now()`
- [ ] ZeptoMail notification to `ADMIN_EMAIL`: subject "New inquiry: {service_needed}", body includes name + email + company + message
- [ ] ZeptoMail confirmation to user: subject "We received your inquiry — here's what's next", body summarizes next steps
- [ ] Idempotency-Key honored: same key within 5 min returns the same response without duplicate insert/emails
- [ ] If ZeptoMail send fails after DB insert, log to Sentry but return 200 (DB is source of truth; email retry is a separate concern)
- [ ] Unit tests cover happy path, Zod fail, Turnstile fail, Idempotency replay
- [ ] No service-role key in client bundle

## Tasks
- [new] Scaffold `app/api/inquiry/route.ts` reusing the shared Zod schema; 400 on parse fail (AC#1, AC#9)
- [new] Server-side Turnstile verification before any DB write; 400 on fail (AC#2)
- [new] Insert into `service_inquiries` (all fields + `source` + `submitted_at`) (AC#3)
- [new] ZeptoMail dual-send (founder notification + user confirmation) with the specified subjects/bodies; Sentry-log + 200 on send failure after insert (AC#4, AC#5, AC#7)
- [new] Idempotency-Key dedupe via Upstash (5-min window) + unit tests (happy / Zod fail / Turnstile fail / idempotency replay) (AC#6, AC#8)

## Notes
- Contract per blueprint §9 and `TECHNICAL-REQUIREMENTS.md` §6.2.
- ZeptoMail email templates per blueprint §10.
- No rate limit yet; tracked as open question (`TECHNICAL-REQUIREMENTS.md` Appendix OQ#1).
- _Analyzed 2026-05-23: grounded in §6.2; `design: none-needed` correct. Added `source` to the insert AC now that `service_inquiries.source` exists (§4.2) — the endpoint is shared by the services form (`source='services_page'`) and the consultation modal (`source='consultation_modal'`, `story-services-04`)._
