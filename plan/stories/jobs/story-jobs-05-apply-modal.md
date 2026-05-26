---
id: story-jobs-05
topic: jobs
sprint: 2
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
dependencies:
  - story-jobs-02
design:
  - design/screens-jobs.jsx
---

# story-jobs-05 — Apply modal (resume upload + cover note) on job detail

## User story
As a seeker who found a relevant job, I want to apply in a focused modal that uploads my resume and lets me write a short cover note, so that I don't navigate away from the job listing to apply.

## Description
Build the `ApplyModal` component referenced in `design/screens-jobs.jsx`. Triggered from `/jobs/[id]` "Apply Now" CTA. Fields: resume file input (PDF or DOCX, ≤10MB), cover note textarea (≤2000 chars), submit. Resume uploads to Supabase Storage via `/api/upload` (story-templates-03 endpoint reused, kind=`resume`). On success, the modal closes and shows a confirmation toast.

## Acceptance criteria
- [x] Modal is focus-trapped, closes on Esc / overlay / success, locks background scroll
- [x] File input accepts only PDF/DOCX; client-side rejects oversized files (>10MB) before upload
- [x] Cover note textarea: ≤2000 chars with live counter
- [x] Modal renders a Cloudflare Turnstile widget (token required by `/api/applications` per §9.6 / §6.2)
- [x] Submit flow: (1) upload file via `/api/upload` kind=`resume`, get URL; (2) POST to `/api/applications` with `{ job_id, resume_url, cover_note, turnstile_token }` + `Idempotency-Key` header
- [x] Upload progress indicator while file uploads
- [x] Failure recovery: if `/api/applications` fails after upload succeeds, the orphan file is flagged in Sentry for later cleanup
- [x] Success toast: "Application submitted. The employer will be in touch."
- [x] Prevents duplicate apply: button disabled if user has already applied (check via existing application row)
- [x] Accessible: labels on every input, ARIA dialog, focus on first field on open

## Tasks
- [completed] Port `ApplyModal` + `ResumeUpload` from `design/screens-jobs.jsx` — focus-trap, Esc/overlay/success close, background-scroll lock, focus first field on open, labels + ARIA dialog
- [completed] Resume file input: accept PDF/DOCX only, client-reject >10MB before upload; cover-note textarea ≤2000 chars with live counter; render Turnstile widget
- [completed] Submit step 1: upload resume via `POST /api/upload` kind=`resume` (with progress indicator), capture returned URL
- [completed] Submit step 2: `POST /api/applications` with `{ job_id, resume_url, cover_note, turnstile_token }` + `Idempotency-Key`; success toast "Application submitted. The employer will be in touch."
- [completed] Duplicate-apply guard: disable submit if an application row already exists for this seeker+job
- [completed] Orphan-file recovery: if step 2 fails after step 1 succeeds, flag the uploaded file to Sentry for cleanup

## Notes
- File validation per `TECHNICAL-REQUIREMENTS.md` §9.2 (MIME + magic-byte + 10MB cap).
- ClamAV scan is open question Appendix OQ#3 — not blocking for first cut but flagged as gate item before self-serve uploads open.
- `/api/upload` endpoint signature handles `kind: 'resume'` — keep the resume in a namespaced Storage path tied to applicant_id.

## Execution
- _Executed 2026-05-26: `ApplyModal` + `ApplyButton` were built in story-jobs-02 (so the detail CTA opens it); this story added the `resumes` storage bucket, the duplicate-apply guard (detail page checks own application row via RLS and `ApplyButton` shows "You've applied"), and the apply E2E. Submit flow: upload resume via `/api/upload` (kind=resume) → POST `/api/applications` (jobs-06) with Idempotency-Key; orphan-file-on-failure is logged (Sentry in prod). 2 E2E (modal opens; upload→apply→re-apply blocked UI + 409). **Note:** resumes bucket is public for MVP parity — production should switch to private + signed URLs before employer resume viewing ships._
