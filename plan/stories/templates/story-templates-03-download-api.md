---
id: story-templates-03
topic: templates
sprint: 1
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
executed_date: 2026-05-26
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
- [x] Zod schema validates body; returns 400 `{ ok: false, error: { code: 'invalid_body' } }` on parse fail — _`downloadSchema` (`template_id` UUID + optional `email`); unit test asserts a non-UUID → 400 `invalid_body` with no DB call_
- [x] Increment `resources.download_count` atomically (`update ... set download_count = download_count + 1 returning *`) — _`increment_template_download(uuid)` SQL function (migration `20260526000001`) does `update … set download_count = download_count + 1 … returning file_url`; the route calls it via `supabase.rpc`; unit test asserts the rpc call + args_
- [x] If `email` provided: upsert into `newsletter_subscribers` (`on conflict (email) do update set is_active = true`) — _`upsert(..., { onConflict: "email" })` with `source: 'template_detail'`, `is_active: true`; unit test asserts the upsert shape; a capture failure never blocks the download_
- [x] Generate signed Storage URL with `expiresIn: 60` — _`storage.from('templates').createSignedUrl(file_url, 60)`; unit test asserts the 60s TTL arg_
- [x] Response: `{ ok: true, data: { download_url } }` on success — _`ok({ download_url })`; unit happy-path asserts the envelope + signed URL_
- [x] 404 if `template_id` not found — _empty rpc result → `err('not_found', 404)`; unit test asserts 404 + that signing is skipped_
- [x] Idempotent on counter when client retries the same request within 5 seconds (best-effort — track via Upstash, optional) — _`Idempotency-Key` header → `getCachedResponse`/`cacheResponse` over `lib/idempotency.ts` (5-min Upstash window). **Best-effort/optional:** no Upstash env locally → the helpers no-op (every request processes), per the AC's "optional"_
- [x] Unit test covers happy path + Zod fail + missing template — _`app/api/download/route.test.ts`: happy path, email upsert, ungated-on-capture-failure, Zod fail, missing template (404), signed-url failure (500) — 6 tests_
- [x] No service-role key shipped to client bundle (lint rule passes) — _route is a server-only API route using `createServiceClient` (the `server-only` `lib/supabase/service.ts`); never references `process.env.SUPABASE_SERVICE_ROLE_KEY` directly; `pnpm lint` (no-restricted-syntax rule) passes_

## Tasks
- [completed] Scaffold `app/api/download/route.ts` with the `{ template_id, email? }` Zod schema in `lib/schemas/`; 400 on parse fail (AC#1, AC#9)
- [completed] Atomic `download_count` increment + 404 when `template_id` not found (AC#2, AC#6)
- [completed] Optional email upsert into `newsletter_subscribers` (`source='template_detail'`, reactivate on conflict) (AC#3)
- [completed] Generate 60s-TTL Supabase Storage signed URL; return `{ ok: true, data: { download_url } }` (AC#4, AC#5)
- [completed] Best-effort 5s idempotency via Upstash (optional) + unit tests (happy / Zod fail / missing template) (AC#7, AC#8)

## Notes
- Endpoint contract from `TECHNICAL-REQUIREMENTS.md` §6.2 and blueprint §9.
- Counter increment happens server-side via service-role key; client never has write access (RLS denies anon writes to `resources`).
- No Turnstile here per §9.6 (download is not a write surface that spam targets).
- _Analyzed 2026-05-23: fully grounded in §6.2; `design: none-needed` is correct (no UI surface). No open questions._
- _Executed 2026-05-26: `app/api/download/route.ts` + `lib/schemas/download.ts` + migration `20260526000001_download_counter_rpc.sql` (atomic `increment_template_download` RPC, execute granted to `service_role` only — anon can't increment). `template_id` is the `resources.id` UUID the `TemplateDownloadButton`/`TemplateDownloadPanel` (templates-01/02) already POST. Verified by 6 unit tests (Supabase + idempotency mocked). **Storage note:** against the live local stack `createSignedUrl` only resolves once the referenced object exists in the private `templates` bucket; Sprint 1 seeds `file_url` paths but uploads no files (admin upload populates the bucket in Sprint 3), so the signed-URL leg is exercised via the unit mock — the download-flow E2E in templates-01/02 stubs `/api/download`. **Toolchain fix:** `package.json` `db:reset`/`db:types` now call `npx supabase` (bare `supabase` isn't on PATH and the failing `db:types` redirect had truncated `types/database.ts`); regenerated `types/database.ts` so the RPC type-checks. **AC#7 idempotency** is best-effort/optional — no-ops without Upstash env._
