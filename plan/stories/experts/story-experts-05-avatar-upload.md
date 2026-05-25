---
id: story-experts-05
topic: experts
sprint: 2
story_points: 2
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-experts-04
design: none-needed
---

# story-experts-05 — Avatar upload via POST /api/upload (kind=avatar)

## User story
As an expert editing my profile, I want to upload a headshot that's validated and stored safely, so that my listing looks personal without me dealing with cropping tools.

## Description
Extend `POST /api/upload` (existing in `story-templates-03` schema but separately implemented in this iteration) to support `kind: 'avatar'` with PNG/JPEG/WebP + 2MB cap + magic-byte verification. Returns the public Supabase Storage URL, which the expert dashboard saves into `experts.avatar_url` via the PATCH endpoint.

## Acceptance criteria
- [ ] `POST /api/upload` with `kind='avatar'` accepts only image/png, image/jpeg, image/webp
- [ ] Magic-byte verification on the uploaded bytes (not just MIME)
- [ ] 2MB max size; 413 returned with friendly message otherwise
- [ ] Uploads to `avatars/{user_id}/{uuid}.{ext}` namespaced path
- [ ] RLS on storage bucket: anon can read; only the authed user can write to their own namespace
- [ ] Returns `{ ok: true, data: { url, path } }`
- [ ] Replacing avatar deletes the previous file (cleanup) — best-effort, log to Sentry on failure
- [ ] Unit + integration tests cover happy path, oversized, wrong-MIME, magic-byte mismatch

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- File validation per `TECHNICAL-REQUIREMENTS.md` §9.2.
- Same endpoint also serves `kind: 'resume'` (story-jobs-05/06) and `kind: 'template'` / `kind: 'cover'` (admin uploads). Each kind has its own size cap and MIME list.
- ClamAV scan (`TECHNICAL-REQUIREMENTS.md` Appendix OQ#3) gates self-serve uploads opening, not this story.
