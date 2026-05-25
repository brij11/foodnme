---
id: story-experts-03
topic: experts
sprint: 2
story_points: 4
status: draft
owner: brij
tasks_populated: false
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
- [ ] Modal: focus-trapped, ARIA dialog, Esc / overlay / success closes it
- [ ] Form fields: full_name, email, message (≤2000 chars); Zod validated
- [ ] Turnstile token required
- [ ] `POST /api/expert-inquiry`: body `{ expert_id, full_name, email, message, turnstile_token }`
- [ ] Looks up expert by id; 404 if not found or `status != 'active'`
- [ ] ZeptoMail to expert's `contact_email` with subject "New inquiry via foodnme — {visitor name}", Reply-To = visitor email
- [ ] Confirmation email to visitor with subject "Your message to {expert name} has been delivered"
- [ ] Returns `{ ok: true }` on success
- [ ] On ZeptoMail failure to expert: 502 with retry guidance — do NOT silently swallow
- [ ] Unit tests: happy path, missing expert, Turnstile fail, Zod fail

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- No DB row stored: this is a relay, not a CRM. If founder wants to log inquiries later, add a `expert_inquiries` table — that becomes its own story + spec amendment.
- Anti-harvesting: `contact_email` never returns in any response shape; lint rule on response types should enforce this.
