---
id: story-services-04
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
- [x] `ConsultationModalProvider` lives above the route content in the layout tree (per `CLAUDE.md` "Providers order matters") — _`app/(public)/layout.tsx` nests `ConsultationModalProvider` outermost; verified by the modal opening from the homepage nav (any page)_
- [x] Nav CTA opens the modal with focus trapped on first input — _Navbar "Get a Consultation" → `open()`; E2E asserts the dialog opens and "Full name" is focused; a Tab focus-trap keeps focus inside the dialog_
- [x] Modal closes on Esc, on overlay click, and on successful submit — _Esc (provider) + overlay click (backdrop `onClick`) + success auto-close; E2E covers Esc, overlay click, and the post-submit close_
- [x] Form fields: Full Name, Business Email, Message — Zod-validated (reuses the shared inquiry schema, message min 20) — _`ConsultationForm` uses `consultationSchema` (`.pick()` of the shared `inquirySchema`, so `message` min 20 is inherited); E2E renders the 3 fields; unit test asserts a short modal message → 400_
- [x] Turnstile widget renders inside the modal (per §9.6) — _`<Turnstile>` in `ConsultationForm`; submit is `disabled` until the token resolves (E2E asserts it enables after the token; stubbed for determinism)_
- [x] Submit reuses `/api/inquiry` with `service_needed = 'Consultation (from modal)'` and `source = 'consultation_modal'` — _E2E intercepts the POST and asserts both values; the route's additive modal branch validates `consultationSchema` and stores `service_needed='Consultation (from modal)'`, `company_name=''`, `source='consultation_modal'`; unit test asserts the insert args_
- [x] Success state shows confirmation, modal auto-closes after 2 seconds — _on `{ ok: true }` a `role="status"` confirmation renders then `setTimeout(onClose, 2000)`; E2E asserts "Inquiry received." then the dialog disappears within 4s_
- [x] Modal is responsive (full-screen on mobile, centered card on desktop) — _`items-stretch min-h-full rounded-none` on mobile → `sm:items-start sm:max-w-[580px] sm:min-h-0 sm:rounded-xl` on desktop; the overlay-click E2E (click at 5,5) confirms the desktop centered layout. **Visual** at the other breakpoints_
- [x] Trapped focus + ARIA dialog role + labeled by H2 — _`role="dialog"` + `aria-modal` + `aria-labelledby="consultation-modal-title"`; Tab/Shift-Tab cycle within the dialog; E2E resolves the dialog by its H2 accessible name + asserts first-input focus; open-modal axe scan is clean_
- [x] Background scroll locked while open — _`ConsultationModalProvider` sets `document.body.style.overflow = "hidden"` while open and restores it on close (code-verified)_

## Tasks
- [completed] Build `ConsultationModalProvider` above route content in `app/(public)/layout.tsx`; expose `openConsultationModal()` wired to the navbar CTA (AC#1, AC#2)
- [completed] Build the modal shell: ARIA dialog + H2 label, focus trap, Esc / overlay-click / success close, body-scroll lock, responsive (mobile full-screen / desktop card) (AC#2, AC#3, AC#8, AC#9, AC#10)
- [completed] Slimmer form (Full Name, Business Email, Message) reusing the shared Zod schema + inline Turnstile (AC#4, AC#5)
- [completed] Submit → `POST /api/inquiry` with `service_needed='Consultation (from modal)'` + `source='consultation_modal'`; success confirmation + 2s auto-close (AC#6, AC#7)

## Notes
- Design follows-template `story-services-02` — the consultation modal reuses the inquiry-form layout pattern.
- Separation of `/services#inquiry` vs. consultation modal is intentional per `UI-DESIGN-HANDOFF.md` §4.7.
- _Analyzed 2026-05-23: (1) lead-origin tracking is now backed by the **`service_inquiries.source` column** added to §4.2 this run (founder-approved); (2) reconciled the modal field set — Sprint 1 ships the **slimmer 3-field modal** (Full Name, Business Email, Message) per this story's intent; the fuller field set in `UI-DESIGN-HANDOFF.md` §3.4 (phone, company, service dropdown) was the prototype's `ConsultationModal` and is intentionally not carried into the Sprint-1 quick-conversion modal._
- _Executed 2026-05-26: `ConsultationForm` (`"use client"`) reuses `consultationSchema` (`inquirySchema.pick(...)`); `ConsultationModal` fleshed out with a Tab focus-trap, initial focus on the first input, and responsive full-screen-mobile/centered-desktop layout (Esc + scroll-lock already owned by the pre-existing `ConsultationModalProvider`). **Schema reconciliation:** the 3-field modal + AC#6's literal `service_needed='Consultation (from modal)'` are incompatible with the strict shared `inquirySchema` (enum service + `company_name` min 1) that services-02/03 require. Resolved **additively** — the modal posts `source='consultation_modal'` and the `/api/inquiry` route branches to `consultationSchema`, supplying `service_needed='Consultation (from modal)'` + `company_name=''` server-side; the strict `services_page` path is untouched (services-02/03 ACs still hold). Tests: +2 unit on the route's modal branch (now 8 in `inquiry/route.test.ts`) + 5 E2E (`consultation-modal.spec.ts`, Turnstile stubbed). AC#8 (other breakpoints) + AC#10 (scroll-lock) are code-verified/visual checks._
