---
id: story-jobs-05
topic: jobs
sprint: 2
story_points: 3
status: draft
owner: brij
tasks_populated: false
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
- [ ] Modal is focus-trapped, closes on Esc / overlay / success, locks background scroll
- [ ] File input accepts only PDF/DOCX; client-side rejects oversized files (>10MB) before upload
- [ ] Cover note textarea: ≤2000 chars with live counter
- [ ] Submit flow: (1) upload file via `/api/upload` kind=`resume`, get URL; (2) POST to `/api/applications` with `{ job_id, resume_url, cover_note }`
- [ ] Upload progress indicator while file uploads
- [ ] Failure recovery: if `/api/applications` fails after upload succeeds, the orphan file is flagged in Sentry for later cleanup
- [ ] Success toast: "Application submitted. The employer will be in touch."
- [ ] Prevents duplicate apply: button disabled if user has already applied (check via existing application row)
- [ ] Accessible: labels on every input, ARIA dialog, focus on first field on open

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- File validation per `TECHNICAL-REQUIREMENTS.md` §9.2 (MIME + magic-byte + 10MB cap).
- ClamAV scan is open question Appendix OQ#3 — not blocking for first cut but flagged as gate item before self-serve uploads open.
- `/api/upload` endpoint signature handles `kind: 'resume'` — keep the resume in a namespaced Storage path tied to applicant_id.
