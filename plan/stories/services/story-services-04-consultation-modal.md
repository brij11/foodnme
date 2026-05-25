---
id: story-services-04
topic: services
sprint: 1
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
dependencies:
  - story-homepage-02
  - story-services-03
design: "follows-template: story-services-02"
---

# story-services-04 — Consultation modal (global, nav-triggered) + ConsultationModalProvider

## User story
As a visitor on any page, I want a one-click "Get a Consultation" path from the nav that opens a focused modal, so that I don't have to scroll to the services page when I'm ready to ask.

## Description
Implement a global `ConsultationModalProvider` wrapping the public layout. The "Get a Consultation" CTA in the navbar triggers `openConsultationModal()`. The modal hosts a slimmer variant of the inquiry form (Full Name, Business Email, "What do you need help with?" textarea) and submits to the same `/api/inquiry` endpoint with `source: 'consultation_modal'` so the founder can distinguish lead origin.

## Acceptance criteria
- [ ] `ConsultationModalProvider` lives above the route content in the layout tree (per `CLAUDE.md` "Providers order matters")
- [ ] Nav CTA opens the modal with focus trapped on first input
- [ ] Modal closes on Esc, on overlay click, and on successful submit
- [ ] Form fields: Full Name, Business Email, Message — Zod-validated (reuses the shared inquiry schema, message min 20)
- [ ] Turnstile widget renders inside the modal (per §9.6)
- [ ] Submit reuses `/api/inquiry` with `service_needed = 'Consultation (from modal)'` and `source = 'consultation_modal'`
- [ ] Success state shows confirmation, modal auto-closes after 2 seconds
- [ ] Modal is responsive (full-screen on mobile, centered card on desktop)
- [ ] Trapped focus + ARIA dialog role + labeled by H2
- [ ] Background scroll locked while open

## Tasks
- [new] Build `ConsultationModalProvider` above route content in `app/(public)/layout.tsx`; expose `openConsultationModal()` wired to the navbar CTA (AC#1, AC#2)
- [new] Build the modal shell: ARIA dialog + H2 label, focus trap, Esc / overlay-click / success close, body-scroll lock, responsive (mobile full-screen / desktop card) (AC#2, AC#3, AC#8, AC#9, AC#10)
- [new] Slimmer form (Full Name, Business Email, Message) reusing the shared Zod schema + inline Turnstile (AC#4, AC#5)
- [new] Submit → `POST /api/inquiry` with `service_needed='Consultation (from modal)'` + `source='consultation_modal'`; success confirmation + 2s auto-close (AC#6, AC#7)

## Notes
- Design follows-template `story-services-02` — the consultation modal reuses the inquiry-form layout pattern.
- Separation of `/services#inquiry` vs. consultation modal is intentional per `UI-DESIGN-HANDOFF.md` §4.7.
- _Analyzed 2026-05-23: (1) lead-origin tracking is now backed by the **`service_inquiries.source` column** added to §4.2 this run (founder-approved); (2) reconciled the modal field set — Sprint 1 ships the **slimmer 3-field modal** (Full Name, Business Email, Message) per this story's intent; the fuller field set in `UI-DESIGN-HANDOFF.md` §3.4 (phone, company, service dropdown) was the prototype's `ConsultationModal` and is intentionally not carried into the Sprint-1 quick-conversion modal._
