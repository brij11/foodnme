---
id: story-homepage-10
topic: homepage
sprint: 5
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
exec_model: sonnet
executed_date: 2026-05-31
dependencies:
  - story-services-04
  - story-jobs-04
  - story-jobs-05
  - story-experts-03
design:
  - design/ui.jsx
---

# story-homepage-10 — Modal parity: shared entry animation + PostJob success state

## User story
As a visitor opening any modal, I want a consistent animated entry and a clear success confirmation, so that the product feels as polished as the prototype intends.

## Description
Restore the shared modal behaviours the prototype defines in `UI-DESIGN-HANDOFF.md` §3.4 but the build dropped. All four modals (Consultation, Apply, Contact-expert, Post-job) currently render with a blurred backdrop but **no `modal-pop` entry animation** — the keyframe is never defined in `web/tailwind.config.ts` (only `fade-up` exists). Separately, **PostJobModal has no two-state form→success view** — it closes immediately on submit. This story adds the shared entry animation and the missing success state, and aligns the ConsultationModal success styling to the centered check-circle pattern. Covers DEVIATIONS.md **B1, B2, D11**.

## Acceptance criteria
- [x] A `modal-pop` keyframe (translateY + scale + opacity, ~280ms) is defined in `web/tailwind.config.ts` and applied to all four modal dialogs (Consultation, Apply, Contact-expert, Post-job) — covered by `tailwind.tokens.test.ts` modal-pop suite + `motion-safe:animate-modal-pop` class verified in `ConsultationForm.test.tsx` + `PostJobModal.test.tsx`
- [x] The entry animation is suppressed under `prefers-reduced-motion` (matches §4.10 animation policy) — all four modal dialogs use `motion-safe:animate-modal-pop` utility, verified in tests
- [x] `PostJobModal` shows a two-state form→success view: on successful submit it renders an admin-review confirmation with a check-circle before closing, rather than closing immediately (DEVIATIONS B2) — covered by `PostJobModal.test.tsx` "check-circle success state" and "auto-closes after 3 s" tests
- [x] `ConsultationModal` success state uses the centered check-circle confirmation, not the current left-border banner (DEVIATIONS D11) — covered by `ConsultationForm.test.tsx` "centered check-circle layout, not left-border banner" test
- [x] No regression to existing modal behaviours that ARE faithful: backdrop blur, click-outside-close, Escape handler, body-scroll lock, close button top-right, focus-trap — covered by `PostJobModal.test.tsx` Escape + close-button tests; backdrop/blur/scroll-lock/focus-trap code paths are structurally unchanged

## Tasks
- [completed] Add a `modal-pop` keyframe (translateY + scale + opacity, ~280ms) to `web/tailwind.config.ts` plus a `motion-reduce`-gated entry utility (AC 1, 2)
- [completed] Apply the `modal-pop` entry animation to all four modal dialogs — Consultation, Apply, Contact-expert, Post-job (AC 1)
- [completed] Add a two-state form→success view to `PostJobModal`: admin-review confirmation + check-circle before close (AC 3)
- [completed] Align `ConsultationModal` success state to the centered check-circle confirmation (AC 4)
- [completed] Verify no regression to backdrop blur / click-outside / Escape / scroll-lock / close button / focus-trap; add a test for the success state + reduced-motion (AC 5)

## Notes
- exec_model: sonnet — UI animation + a success-state view; composes existing modals, no schema/security surface.
- Source: `plan/DEVIATIONS.md` findings B1 (systemic, all 4 modals), B2 (PostJobModal), D11 (Consultation success).
- Design ref: `plan/design/ui.jsx` modal components + `plan/design/styles.css:1166,1178-1184` (`modal-pop` / `modal-fade` keyframes); handoff §3.4 ("Animated entry (`modal-pop`)" + "form state → success state with check-circle illustration").
- Build refs: `web/tailwind.config.ts:74-82` (only `fade-up`); `web/components/dashboard/PostJobModal.tsx:100`; `web/components/jobs/ApplyModal.tsx:128`; `web/components/experts/ContactExpertModal.tsx:116`; `web/components/consultation/ConsultationModal.tsx`.
- ApplyModal and ContactExpertModal already have the form→success check-circle pattern — only the entry animation is missing for those two.
