---
id: story-templates-03
topic: templates
sprint: 1
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
dependencies:
  - story-templates-02
design: none-needed
---

# story-templates-03 — POST /api/download + Supabase Storage signed URL + counter + optional email upsert

## User story
As a system, I want the template download endpoint to atomically increment a counter, optionally capture an email, and return a short-lived signed URL, so that downloads are tracked and storage links cannot be hot-linked indefinitely.

## Description
Implement `POST /app/api/download/route.ts`. Validates body with Zod: `{ template_id: string, email?: string }`. If `email` present, upserts into `newsletter_subscribers` with `source = 'template_detail'`. Increments `resources.download_count`. Generates a Supabase Storage signed URL with 60-second TTL. Response: `{ ok: true, data: { download_url } }`. No auth required.

## Acceptance criteria
- [ ] Zod schema validates body; returns 400 `{ ok: false, error: { code: 'invalid_body' } }` on parse fail
- [ ] Increment `resources.download_count` atomically (`update ... set download_count = download_count + 1 returning *`)
- [ ] If `email` provided: upsert into `newsletter_subscribers` (`on conflict (email) do update set is_active = true`)
- [ ] Generate signed Storage URL with `expiresIn: 60`
- [ ] Response: `{ ok: true, data: { download_url } }` on success
- [ ] 404 if `template_id` not found
- [ ] Idempotent on counter when client retries the same request within 5 seconds (best-effort — track via Upstash, optional)
- [ ] Unit test covers happy path + Zod fail + missing template
- [ ] No service-role key shipped to client bundle (lint rule passes)

## Tasks
- [new] Scaffold `app/api/download/route.ts` with the `{ template_id, email? }` Zod schema in `lib/schemas/`; 400 on parse fail (AC#1, AC#9)
- [new] Atomic `download_count` increment + 404 when `template_id` not found (AC#2, AC#6)
- [new] Optional email upsert into `newsletter_subscribers` (`source='template_detail'`, reactivate on conflict) (AC#3)
- [new] Generate 60s-TTL Supabase Storage signed URL; return `{ ok: true, data: { download_url } }` (AC#4, AC#5)
- [new] Best-effort 5s idempotency via Upstash (optional) + unit tests (happy / Zod fail / missing template) (AC#7, AC#8)

## Notes
- Endpoint contract from `TECHNICAL-REQUIREMENTS.md` §6.2 and blueprint §9.
- Counter increment happens server-side via service-role key; client never has write access (RLS denies anon writes to `resources`).
- No Turnstile here per §9.6 (download is not a write surface that spam targets).
- _Analyzed 2026-05-23: fully grounded in §6.2; `design: none-needed` is correct (no UI surface). No open questions._
