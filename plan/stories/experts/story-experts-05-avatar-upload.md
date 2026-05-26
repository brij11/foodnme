---
id: story-experts-05
topic: experts
sprint: 2
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
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
- [x] `POST /api/upload` with `kind='avatar'` requires an authenticated expert and accepts only image/png, image/jpeg, image/webp — `route.test.ts` (401 unauthed, 403 seeker) + `upload.test.ts` MIME whitelist
- [x] Magic-byte verification on the uploaded bytes (not just MIME) — `detectMime`/`validateUpload` (`upload.test.ts` "magic-byte mismatch"; route test sends a PDF lying as image/png → 415)
- [x] 2MB max size; 413 returned with friendly message otherwise — `upload.test.ts` "oversized → 413"
- [x] Uploads to `avatars/{user_id}/{uuid}.{ext}` namespaced path — `route.test.ts` asserts the path shape `u1/<uuid>.png`; `avatar-upload.spec.ts` asserts the stored URL
- [x] RLS on storage bucket: anon can read; only the authed user can write to their own namespace — `avatars` bucket is public-read; writes only via the authed service-role route which pins the `{user_id}/` namespace (no anon write policy)
- [x] Returns `{ ok: true, data: { url, path } }` — `route.test.ts` happy path
- [x] Replacing avatar deletes the previous file (cleanup) — best-effort `list`+`remove` of the user's prior namespace files; failures logged (Sentry in prod)
- [x] Unit + integration tests cover happy path, oversized, wrong-MIME, magic-byte mismatch — `upload.test.ts` (6) + `route.test.ts` (4) + `avatar-upload.spec.ts` E2E (real storage round-trip)

## Tasks
- [completed] Implement `POST /api/upload` route with the per-kind auth gate (§6.2 amendment) — `kind='avatar'` requires authenticated expert
- [completed] Validate avatar uploads: MIME whitelist (png/jpeg/webp) + magic-byte check + 2MB cap (413 on oversize) per §9.2
- [completed] Upload to `avatars/{user_id}/{uuid}.{ext}`; configure Storage bucket RLS (anon read, self-only write to own namespace)
- [completed] Best-effort delete of the previous avatar file on replace; log cleanup failures to Sentry
- [completed] Return `{ ok: true, data: { url, path } }`; expert dashboard saves `url` into `experts.avatar_url` via the profile save
- [completed] Unit + integration tests: happy path, oversized, wrong-MIME, magic-byte mismatch

## Notes
- File validation per `TECHNICAL-REQUIREMENTS.md` §9.2.
- Same endpoint also serves `kind: 'resume'` (story-jobs-05/06) and `kind: 'template'` / `kind: 'cover'` (admin uploads). Each kind has its own size cap, MIME list, and required role. §6.2 was amended during analysis (2026-05-26) to add `'resume'` to the kind enum and make auth per-kind (template/cover=admin, avatar=expert, resume=seeker).
- ClamAV scan (`TECHNICAL-REQUIREMENTS.md` Appendix OQ#3) gates self-serve uploads opening, not this story.
