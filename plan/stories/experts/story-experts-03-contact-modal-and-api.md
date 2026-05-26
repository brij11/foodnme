---
id: story-experts-03
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
  - story-experts-02
design:
  - design/screens-experts.jsx
---

# story-experts-03 — Contact expert modal + POST /api/expert-inquiry (ZeptoMail forward)

## User story
As a visitor, I want to send a short message to an expert without seeing their email address, so that I can reach them privately and they can respond at their own pace.

## Description
Build `ContactExpertModal` per `design/screens-experts.jsx`. Form: full name, email, message. Submits to `POST /api/expert-inquiry`. The API validates body + Turnstile, looks up `experts.contact_email`, sends the visitor's message via ZeptoMail to the expert (Reply-To set to visitor's email), and CCs the visitor with a confirmation copy. No DB row is required — this is a transient relay.

## Acceptance criteria
- [x] Modal: focus-trapped, ARIA dialog, Esc / overlay / success closes it — `ContactExpertModal` (focus-trap + Esc + overlay + success); `experts-detail.spec.ts` open/close
- [x] Form fields: full_name, email, message (≤2000 chars); Zod validated — `expertInquirySchema`; `experts-contact.spec.ts` "short message rejected"
- [x] Turnstile token required — schema requires `turnstile_token`; submit disabled until verified; route verifies server-side (unit test "failed Turnstile")
- [x] `POST /api/expert-inquiry`: body `{ expert_id, full_name, email, message, turnstile_token }` — `app/api/expert-inquiry/route.ts`
- [x] Looks up expert by id; 404 if not found or `status != 'active'` — `route.test.ts` "missing expert" + "inactive expert"
- [x] ZeptoMail to expert's `contact_email` with subject "New inquiry via foodnme — {visitor name}", Reply-To = visitor email — `route.test.ts` happy path asserts to/replyTo/subject (added `replyTo` to `sendEmail`)
- [x] Confirmation email to visitor with subject "Your message to {expert name} has been delivered" — `route.test.ts` asserts the second send + subject
- [x] Returns `{ ok: true }` on success — `route.test.ts` + `experts-contact.spec.ts` success state
- [x] On ZeptoMail failure to expert: 502 with retry guidance — do NOT silently swallow — `route.test.ts` "genuine relay failure → 502" (the local no-key skip is treated as delivered)
- [x] Unit tests: happy path, missing expert, Turnstile fail, Zod fail — `route.test.ts` (8 cases) + the full-submit E2E

## Tasks
- [completed] Port `ContactExpertModal` from `design/screens-experts.jsx` (modal UI scaffolded in experts-02 so the detail CTA opens it) — fields full_name, email, message (≤2000); focus-trap, ARIA dialog, Esc/overlay/success close; dropped company + engagement-type fields
- [completed] Add a Turnstile widget + `lib/schemas/expert-inquiry.ts` Zod schema (`expert_id`, full_name, email, message, turnstile_token)
- [completed] Build `POST /api/expert-inquiry` — verify Turnstile, look up expert by id (404 if not found / not active), no DB row written
- [completed] ZeptoMail relay to expert's `contact_email` (subject "New inquiry via foodnme — {visitor name}", Reply-To = visitor email) + confirmation copy to visitor; on send-to-expert failure return 502 with retry guidance
- [completed] Guarantee `contact_email` never appears in any response shape (typed response); unit tests: happy path, missing expert, Turnstile fail, Zod fail

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- No DB row stored: this is a relay, not a CRM. If founder wants to log inquiries later, add a `expert_inquiries` table — that becomes its own story + spec amendment.
- Anti-harvesting: `contact_email` never returns in any response shape; lint rule on response types should enforce this.
- _Executed 2026-05-26: `POST /api/expert-inquiry` (no DB row — transient relay). Extended `sendEmail` with `replyTo`/`replyToName` for the visitor-as-reply-address. The 502-on-failure rule distinguishes a genuine ZeptoMail error (`sent:false`) from the local no-key skip (`skipped:true` → treated as delivered → 200), so local E2E succeeds while a prod send failure surfaces. The modal UI was scaffolded in experts-02; this story added the schema + route + made submit functional. `contact_email` is never in any response (asserted in `route.test.ts`). Verified by 8 unit tests + 2 E2E (full submit + client validation). Note: zod v4 `.uuid()` enforces RFC version/variant bits — test fixtures must use valid v4 uuids._
