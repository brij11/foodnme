---
id: story-newsletter-02
topic: newsletter
sprint: 1
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
dependencies:
  - story-newsletter-01
design: none-needed
---

# story-newsletter-02 — POST /api/newsletter + Supabase upsert + ZeptoMail welcome

## User story
As a subscriber, I want my email to be saved and a welcome message to arrive immediately, so that I know the signup worked and can find foodnme in my inbox later.

## Description
Implement `POST /app/api/newsletter/route.ts`. Validates body via Zod: `{ email: string, source: string, turnstile_token: string }`. Verifies Turnstile. Upserts into `newsletter_subscribers` (re-activates `is_active=true` on existing rows). Sends ZeptoMail welcome email. Returns `{ ok: true }`.

## Acceptance criteria
- [ ] Zod validation; 400 on parse fail
- [ ] Turnstile token verified server-side before DB write
- [ ] Upsert by email: `on conflict (email) do update set is_active = true, source = excluded.source, subscribed_at = now()`
- [ ] ZeptoMail welcome email sent to new subscribers; existing-but-reactivated subscribers do NOT receive a duplicate welcome
- [ ] Response: `{ ok: true }` on success
- [ ] If ZeptoMail send fails after upsert, log to Sentry and return 200 — DB is source of truth
- [ ] `newsletter_subscribers.source` populated from request (e.g. `homepage`, `blog`, `template_detail`)
- [ ] Unit tests cover happy path, duplicate signup (no double welcome), invalid email, Turnstile fail
- [ ] No service-role key shipped to client

## Tasks
- [new] Scaffold `app/api/newsletter/route.ts` with the `{ email, source, turnstile_token }` Zod schema; 400 on parse fail (AC#1, AC#9)
- [new] Server-side Turnstile verification before any DB write (AC#2)
- [new] Email upsert with reactivation (`on conflict` set `is_active`, `source`, `subscribed_at`) + populate `source` (AC#3, AC#7)
- [new] ZeptoMail welcome to new subscribers only (no duplicate welcome on reactivation); Sentry-log + 200 on send failure (AC#4, AC#5, AC#6)
- [new] Unit tests: happy / duplicate (no double welcome) / invalid email / Turnstile fail (AC#8)

## Notes
- Endpoint contract from `TECHNICAL-REQUIREMENTS.md` §6.2 + blueprint §9.
- No-double-welcome behavior is a deliberate addition to the contract — avoids spamming returning subscribers who unsubscribed then resubscribed.
- ZeptoMail Campaigns API (broadcast/newsletter sender) is a Phase 3 story, not covered here.
- _Analyzed 2026-05-23: grounded in §6.2; `design: none-needed` correct. No open questions._
