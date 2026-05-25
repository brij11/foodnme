# Technical Requirements — foodnme

> **Status:** Draft (ready for review) · **Last updated:** 2026-05-19
> **Tie-breaker:** This document is the source of truth on implementation rules. Where `PRODUCT.md`, `UI-DESIGN-HANDOFF.md`, `CLAUDE.md`, or the theme reference disagree with a rule stated here, this document wins.

---

## 1. Core Rules

Hard invariants. Violating any of these in code is a defect.

- **TypeScript strict.** `strict: true`, `noUncheckedIndexedAccess: true`. No `any` in production code paths.
- **RLS on.** Every Supabase table has Row Level Security enabled with restrictive defaults. Anon writes are impossible by policy. See §4.1.
- **Zod-validated APIs.** Every `/app/api/*` route validates the request body with a Zod schema from `lib/schemas/` before any DB read or write. See §6.1.
- **Turnstile on public writes.** Every public-form write verifies a Cloudflare Turnstile token server-side before any DB write. See §9.6.
- **Service-role key is server-only.** `SUPABASE_SERVICE_ROLE_KEY` never appears in client bundles. Lint rule bans the symbol outside `/app/api/**`.
- **No emoji in UI surfaces.** Icons via the SVG icon system only. See §8.
- **First-load JS budget.** Homepage first-load JS ≤ **150 KB gzipped**. CI fails the build above the ceiling.
- **Core Web Vitals at p75 (Google "Good").** LCP < 2.5s · INP < 200ms · CLS < 0.1. Lighthouse Performance score ≥ 90 in CI.
- **API latency budgets.** p95 `/api/*` < 500ms · p99 `/api/*` < 1s. Hero LCP image render < 2.0s on simulated 4G.
- **Accessibility gate.** Lighthouse a11y ≥ 95. Zero Axe-core "critical" or "serious" violations on key pages.

---

## 2. Tech Stack

| Layer | Decision | Notes |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | SSR/SSG for SEO-heavy content. |
| Language | **TypeScript, strict mode** | `strict: true`, `noUncheckedIndexedAccess: true`. Pairs with Supabase generated types. |
| Runtime | **Node 20 LTS** | Active LTS through 2026-Q2. |
| Package manager | **pnpm** | Fastest, disk-efficient. Native Vercel support. |
| Styling | **Tailwind CSS with theme extension** | `tailwind.config.ts` extends the design tokens from `FoodTech_Theme_Fresh_Sustainability_Minimal (1).md`. Thin `globals.css` for resets + `@font-face` only. |
| Lint/format | **ESLint + Prettier (Next defaults)** | `create-next-app` defaults + Prettier. |
| Database | **Supabase Postgres** | Project regioned at `ap-south-1` (Mumbai). |
| Auth | **Supabase Auth via `@supabase/ssr`** | See §5. |
| File storage | **Supabase Storage** | Template PDFs, expert avatars, resumes. |
| Email | **ZeptoMail (Zoho)** | Transactional + newsletter campaigns. |
| Hosting | **Vercel** | Native Next.js, zero-config deploys, edge image optimization. |
| Error tracking | **Sentry** | Stack traces, source maps, performance traces. |
| Anti-spam | **Cloudflare Turnstile** | Server-verified on public writes. |
| Idempotency | **Upstash Redis** | 5-minute dedupe window on critical writes. |

---

## 3. Project Structure

Next.js 14 App Router layout. Every file lives in one of these roots.

```
app/
  layout.tsx, page.tsx                 root layout + homepage
  blog/                                listings + [slug] + category/[slug]
  templates/                           listings + [slug]
  jobs/                                listings + [id]
  experts/                             listings + [id]
  services/, about/                    static pages
  login/, register/, reset-password/   auth surfaces (client + form)
  dashboard/                           gated; /dashboard/seeker, /employer, /expert
  admin/                               gated; admin CRUD surfaces
  api/                                 route handlers (POST/PATCH/DELETE + healthz)
lib/
  schemas/                             Zod schemas, one file per route or domain
  supabase/                            server/client/middleware factories
  email/                               ZeptoMail wrappers
  search/                              FTS query builders
  utils/                               misc utilities
supabase/
  migrations/                          *.sql, committed, applied via `supabase db push`
  seed.sql                             dev seed (ports `data.jsx` content)
types/
  database.ts                          generated via `supabase gen types`
components/                            shared React components (server + client)
middleware.ts                          route gating; see §5.4
tailwind.config.ts                     token extension; see §2
globals.css                            resets + @font-face only (no component CSS)
```

Component styles live in Tailwind utility classes inside the component. No per-component `.css` files. `globals.css` carries resets and `@font-face` declarations only.

---

## 4. Database

Supabase Postgres. Schema managed via CLI migrations in `supabase/migrations/`, applied via `supabase db push`. No ORM — use `@supabase/supabase-js` with generated types from `types/database.ts`. Local dev runs `supabase start` and `supabase db reset` to re-seed.

### 4.1 Row Level Security

RLS is on for every table with restrictive defaults. Server-side admin operations bypass RLS via the **service-role key**, used only inside `/app/api/*` route handlers.

| Table | Anon read | Authed read | Write |
|---|---|---|---|
| `articles` (published) | yes | yes | admin only |
| `resources` (templates) | yes | yes | admin only |
| `newsletter_subscribers` | no | self only | self insert; admin update |
| `service_inquiries` | no | no | anon insert; admin read/update |
| `profiles` | public-fields subset | self + public-fields | self update |
| `jobs` (status='active') | yes | yes | owner write; admin approve |
| `applications` | no | self (applicant) + employer-of-job | applicant insert; employer update status |
| `experts` (status='active') | yes | yes | self update; admin approve/feature |

### 4.2 Tables

```sql
articles            (id, title, slug UNIQUE, excerpt, content_mdx, category, tags[],
                     cover_image_url, author_name, read_time_mins, is_published,
                     published_at, related_resource_slug NULL REFERENCES resources(slug),
                     created_at, search_vector tsvector GENERATED)

resources           (id, title, slug UNIQUE, description, category, file_url, file_type,
                     is_free, download_count, created_at, search_vector tsvector GENERATED)

newsletter_subscribers (id, email UNIQUE, source, subscribed_at, is_active)

service_inquiries   (id, full_name, email, company_name, service_needed, message,
                     source DEFAULT 'services_page', submitted_at, is_read)

profiles            (id PK REFERENCES auth.users, email, full_name,
                     role CHECK IN ('seeker','employer','expert'),
                     is_admin DEFAULT false, avatar_url, created_at)

jobs                (id, title, company_name, location, job_type, salary_min, salary_max,
                     experience_level, description, skills[], status DEFAULT 'pending',
                     employer_id REFERENCES profiles, created_at, expires_at)

applications        (id, job_id REFERENCES jobs, applicant_id REFERENCES profiles,
                     resume_url, cover_note, status DEFAULT 'submitted', applied_at)

experts             (id, user_id REFERENCES profiles, full_name, avatar_url, specializations[],
                     bio, experience_years, certifications[], location, contact_email,
                     is_available DEFAULT true, status DEFAULT 'pending',
                     is_featured DEFAULT false, created_at,
                     search_vector tsvector GENERATED)
```

Indexes: `(category, is_published, published_at desc)` and `(slug)` on `articles`; GIN on every `search_vector`; `(employer_id)` on `jobs`; `(job_id, applicant_id)` unique on `applications`.

### 4.3 Seed

`supabase/seed.sql` ports prototype `data.jsx` content (articles, templates, jobs, experts) so `supabase db reset` produces a realistic dev environment. Image URLs in seed remain as Unsplash links for dev; production swaps to Supabase Storage uploads.

### 4.4 Backups

Supabase Pro plan: daily backups + 7-day point-in-time recovery. Acceptable RPO for a content-heavy, low-write site.

---

## 5. Auth

Supabase Auth via `@supabase/ssr`. HttpOnly cookies. Refresh-token rotation on.

### 5.1 Identity

- Email + password.
- **Email verification required** before first login.
- Min password length 8.
- No social login.

### 5.2 Roles

Three application roles selected at signup, plus an implicit admin flag.

| Role | Set on | Stored in |
|---|---|---|
| `seeker` / `employer` / `expert` | Registration role picker | `auth.users.user_metadata.role` **and** `profiles.role` |
| `is_admin` | DB-only flag, seeded for founder email | `profiles.is_admin` |

Source of truth: `profiles` table. JWT carries `user_metadata.role` as a cheap projection for middleware; profile updates trigger a JWT refresh on next request.

### 5.3 Session mechanics

Three Supabase client factories:
- `createServerClient` — server components + route handlers.
- `createBrowserClient` — client components.
- Middleware client — cookie sync only, no business logic.

### 5.4 Route gating (`middleware.ts`)

```
/admin/*                  → require profiles.is_admin = true
/dashboard/*              → require authenticated user
/dashboard/seeker/*       → require role = 'seeker'
/dashboard/employer/*     → require role = 'employer'
/dashboard/expert/*       → require role = 'expert'
all other public routes   → no auth check
```

Unauthenticated → redirect to `/login?redirect=<original>`. Wrong role → redirect to user's own dashboard.

### 5.5 Password reset

Built-in Supabase Auth flow: `/reset-password` calls `supabase.auth.resetPasswordForEmail()`. User receives email with one-time link to `/reset-password?token=...` which calls `supabase.auth.updateUser({ password })`.

---

## 6. API Rules

### 6.1 Cross-cutting

- All `/app/api/*` routes use **Zod** for request body validation. Schemas live in `lib/schemas/`.
- Success: `{ ok: true, data?: ... }`. Error: `{ ok: false, error: { code: string, message: string, fields?: Record<string,string> } }` with appropriate HTTP status.
- **Idempotency-Key** header honored on `POST /api/inquiry`, `POST /api/applications`, `POST /api/jobs`. Server dedupes via Upstash Redis (5-minute window). Other endpoints rely on natural unique constraints.
- Turnstile token verification before any DB write on the endpoints listed in §9.6.

### 6.2 Endpoints

```
POST /api/newsletter
  body: { email, source, turnstile_token }
  → insert newsletter_subscribers (or update is_active=true on conflict)
  → ZeptoMail welcome email
  → 200 { ok: true }

POST /api/inquiry
  body: { full_name, email, company_name, service_needed, message, turnstile_token }
  Headers: Idempotency-Key (optional)
  → insert service_inquiries
  → ZeptoMail notification → founder
  → ZeptoMail confirmation → user
  → 200 { ok: true }

POST /api/download
  body: { template_id, email? }
  → increment resources.download_count
  → if email: upsert newsletter_subscribers (source='template_detail')
  → generate signed Supabase Storage URL (60s TTL)
  → 200 { ok: true, data: { download_url } }

POST /api/upload  (admin)
  multipart: { file, kind: 'template'|'cover'|'avatar' }
  → magic-byte + MIME whitelist + size cap (§9.2)
  → upload to Supabase Storage
  → 200 { ok: true, data: { url, path } }

GET /api/healthz
  → run: select 1 from articles limit 1   (verifies DB + RLS path)
  → 200 { ok: true, db: 'up', ts: <iso> } | 503 on failure

POST   /api/jobs                       (employer)        + turnstile + idempotency
PATCH  /api/jobs/:id                   (owner or admin)
POST   /api/applications               (seeker)          + turnstile + idempotency
POST   /api/expert-inquiry             (public)          + turnstile
PATCH  /api/experts/:id                (self or admin)
PATCH  /api/experts/:id/availability   (self)
POST   /api/admin/jobs/:id/approve     (admin)
POST   /api/admin/experts/:id/approve  (admin)

GET    /api/search?q=&type=articles|templates|experts|all
       → Postgres FTS via tsvector indexes
       → returns { ok, data: { results: [{type, id, title, excerpt, url, rank}] } }

POST   /api/admin/articles            (admin)  + revalidatePath on publish
PATCH  /api/admin/articles/:id        (admin)  + revalidatePath
DELETE /api/admin/articles/:id        (admin)  + revalidatePath
POST   /api/admin/resources           (admin)
PATCH  /api/admin/resources/:id       (admin)
DELETE /api/admin/resources/:id       (admin)
POST   /api/admin/newsletter/send     (admin)  → ZeptoMail Campaigns API
```

Rate limiting is not enforced at the application layer; revisit per Appendix OQ#1.

---

## 7. Routing

| Route | Strategy | Cache |
|---|---|---|
| `/` (homepage) | SSG with on-demand revalidation | edge-cached until revalidated |
| `/blog`, `/templates`, `/jobs`, `/experts` (listings) | SSR with `searchParams` | `s-maxage=60, stale-while-revalidate=300` |
| `/blog/[slug]`, `/templates/[slug]` | SSG via `generateStaticParams` | on-demand revalidation from admin |
| `/blog/category/[category]` | SSG one page per category | on-demand revalidation |
| `/jobs/[id]`, `/experts/[id]` | SSR | `s-maxage=60, stale-while-revalidate=300` |
| `/services`, `/about` | SSG | on-demand revalidation |
| `/login`, `/register`, `/reset-password` | Client (forms) | no-cache |
| `/dashboard/*` | Client + middleware-gated | no-cache |
| `/admin/*` | Client + middleware-gated | no-cache |

### 7.1 Revalidation

Admin actions (publish article, edit template, approve job, approve expert) call `revalidatePath()` from the route handler:

```ts
revalidatePath('/blog/' + slug)
revalidatePath('/blog')
revalidatePath('/blog/category/' + category)
```

No time-based ISR; revalidation is exclusively on-demand. Zero stale content after admin saves.

### 7.2 Article body format

- `articles.content_mdx` stores **MDX** (markdown with embeddable React components).
- Renderer: `next-mdx-remote/rsc` with a custom component allowlist exposing `PullQuote`, `CTABox`, `Image`, and inline `Tag` to article authors.
- Code blocks via `shiki` (build-time syntax highlighting, zero runtime JS).
- Admin editor: textarea + live preview baseline; upgrade to a code-editor experience (Monaco-light) when admin scope expands.

### 7.3 OG / Twitter card images

Per-article: `app/blog/[slug]/opengraph-image.tsx` renders an OG image via `next/og` using article title + author + accent color overlay on cover. Cached by Vercel edge after first request. Same pattern for templates.

### 7.4 SEO

- `generateMetadata` per page (dynamic title, description, OG, Twitter).
- Slugs are canonical URLs.
- `next-sitemap` generates `sitemap.xml` + `robots.txt` at build time, updated on revalidation.
- All content is server-rendered or static — no client-side-only content pages.

### 7.5 Images

- Source images live in Supabase Storage (`covers/`, `avatars/`, `templates/`).
- Render via `next/image` with a `loader` configured for Supabase public URLs.
- Vercel handles resize, format negotiation (AVIF → WebP → JPEG fallback), DPR awareness.
- Above-fold cover/hero image: `<Image priority>` + `sizes` attribute.

---

## 8. UI Rules

Enforceable rules. See `UI-DESIGN-HANDOFF.md` for the design system, component inventory, and rationale behind each rule.

- **No emoji** in UI surfaces. Icons via the inline SVG icon system only. → UI-DESIGN-HANDOFF.md §4.3
- **No gradient surfaces, no hand-drawn SVG illustrations beyond simple geometry.** → UI-DESIGN-HANDOFF.md §4.4, §4.5
- **Green only on actionable elements.** Logo, stat numbers, service-card icons, and overlines stay dark olive (`--color-text`), not `--color-primary`. → UI-DESIGN-HANDOFF.md §1.1, §4.1
- **Typography roles fixed.** Fraunces = hero H1 only (one per page) · Inter = UI · IBM Plex Sans = body. → UI-DESIGN-HANDOFF.md §1.3
- **No "Free" badge on templates** even though the schema supports `is_free`. Re-introduce only when paid templates land. → UI-DESIGN-HANDOFF.md §4.2
- **Card grids stagger entry by 80ms per child.** Respect `prefers-reduced-motion`. Filter changes re-stagger via `key=` reset — never strip the keys when refactoring filters. → UI-DESIGN-HANDOFF.md §4.10
- **Empty states are three parts:** title + message + action. Never bare "No results." → UI-DESIGN-HANDOFF.md §5.4
- **Stat copy uses approximate numbers** (`120+`, `4.2k`) — never round thousands. → UI-DESIGN-HANDOFF.md §5.2
- **Tag color rotation per category.** Categories carry a `tag: "green|safe|orange|neutral|accent"` field so card grids don't flood the page with one color. Mapping in UI-DESIGN-HANDOFF.md §1.2.
- **Reading-progress strip** on the nav bottom edge for article pages. Strip width tracks `--reading-progress` CSS variable set by the scroll hook. → UI-DESIGN-HANDOFF.md §4.6

---

## 9. Security

### 9.1 Cookie consent (DPDP + GDPR)

GA4 sets identifiable cookies and requires explicit opt-in under India's DPDP Act and EU GDPR.

- **Google Consent Mode v2** with default `denied` for `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`.
- Banner on first visit; user choice persisted in a first-party cookie `foodnme_consent` (1-year expiry).
- GA4 only fires after user grants `analytics_storage`. Denied users still produce aggregated modeled data via Consent Mode.
- "Manage preferences" link in footer reopens the banner.

### 9.2 File upload validation

Server-side, in `POST /api/upload` and any user-upload route:

| Kind | Allowed MIME | Magic-byte check | Size cap |
|---|---|---|---|
| Template | `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | yes | 10 MB |
| Cover image | `image/png`, `image/jpeg`, `image/webp` | yes | 5 MB |
| Avatar | `image/png`, `image/jpeg`, `image/webp` | yes | 2 MB |
| Resume | `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | yes | 10 MB |

Supabase Storage RLS restricts each bucket so anon writes are impossible and authenticated writes only land in the requester's namespaced path. Active virus scan (ClamAV or equivalent) tracked in Appendix OQ#3.

### 9.3 OWASP posture

| Risk | Mitigation |
|---|---|
| XSS | React auto-escapes; MDX renderer uses a vetted component allowlist; no `dangerouslySetInnerHTML` in app code. |
| CSRF | Same-site cookies (Lax) on Supabase Auth; mutation routes require auth or Turnstile. |
| SQL injection | Parameterized queries via `supabase-js`; raw SQL only in migrations (developer-authored). |
| SSRF | No user-supplied URLs fetched server-side. If added later, allowlist hosts. |
| Open redirect | `/login?redirect=` validated against an internal-path allowlist. |
| Secret leakage | No service-role key in client bundle (lint rule: ban `SUPABASE_SERVICE_ROLE_KEY` in non-`/api/*` files). |

### 9.4 Secrets

- Vercel encrypted env vars, separate per environment (dev / preview / production).
- `.env.local` for local dev (gitignored).
- Sentry source-map upload uses a CI-only `SENTRY_AUTH_TOKEN`.

### 9.5 PII retention

Implemented as a scheduled Supabase Edge Function (`pg_cron`):

| Data | Retention |
|---|---|
| `service_inquiries` | 24 months from `submitted_at`, then purge |
| `applications` | 12 months from `applied_at`, then purge |
| `resume_url` in Storage | 12 months after parent `jobs.status` becomes 'closed' |
| `newsletter_subscribers` | retain while `is_active=true`; unsubscribed rows pseudonymized (email hashed) after 6 months |

Implementation tracked in Appendix OQ#4.

### 9.6 Turnstile placement

Required on every public form write — server-side token verification in the corresponding `/api/*` route **before** any DB write:

- Newsletter signup
- Service inquiry
- Consultation modal
- Job application
- Expert contact form
- Employer post-a-job

---

## 10. Testing

| Layer | Tool | What |
|---|---|---|
| Unit | Vitest | Zod schemas, utilities, route-handler business logic (with Supabase client mocked). |
| E2E | Playwright | Critical user flows. Runs against Vercel preview URL with a seeded Supabase preview DB. |
| A11y | Axe-core (via Playwright) + Lighthouse CI | Run on each E2E target page. |
| Visual / snapshot | None | Tailwind tweaks break snapshots; ROI is low for editorial site. |

### Critical E2E flows

1. Visitor signs up to newsletter from homepage banner → confirmation email triggered.
2. Visitor submits service inquiry → ZeptoMail notification + confirmation sent.
3. Visitor downloads a template (anon and with-email paths).
4. Seeker registers → email-verifies → logs in → reaches `/dashboard/seeker`.
5. Employer posts a job → admin approves → job appears at `/jobs`.
6. Seeker applies to a job → application visible in employer dashboard.
7. Expert edits profile and toggles availability → reflected on directory.

### Coverage

No numeric coverage target. Hard requirement: each new `/api/*` route ships with at least one unit test; each new user flow ships with an E2E. Coverage reported on PRs (`vitest --coverage`) as a trend, not a gate.

### Accessibility gate

- Lighthouse a11y score ≥ 95 required in CI.
- Axe-core run on key pages: homepage, blog listing, article detail, template detail, services, login, dashboard. Zero "critical" or "serious" violations.

### CI gate

Branch protection on `main`: PR cannot merge if CI is red. Required checks: typecheck, lint, unit, build, bundle-size assertion, Playwright E2E, Lighthouse CI.

---

## 11. Env Vars

One row per env var. `NEXT_PUBLIC_*` are inlined at build time and exposed in the client bundle; all others are server-only.

| Name | Purpose | Scope | Required |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | client + server | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (RLS-bound) | client + server | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key for admin operations | server only | yes |
| `ZEPTOMAIL_API_KEY` | ZeptoMail transactional + campaign API auth | server only | yes |
| `ZEPTOMAIL_FROM_EMAIL` | `From:` address on outbound mail | server only | yes |
| `ZEPTOMAIL_FROM_NAME` | `From:` display name | server only | yes |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID; gated by consent (§9.1) | client | optional |
| `SENTRY_DSN` | Sentry project DSN, used at boot for error reporting | client + server | yes |
| `SENTRY_AUTH_TOKEN` | CI-only token for source-map upload | CI only | yes (in CI) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget site key | client | yes |
| `TURNSTILE_SECRET_KEY` | Turnstile server-side verification key | server only | yes |
| `UPSTASH_REDIS_REST_URL` | Idempotency dedupe (§6.1) | server only | yes |
| `UPSTASH_REDIS_REST_TOKEN` | Idempotency dedupe auth | server only | yes |

---

## Appendix — Open Questions

| # | Question | Trigger to resolve |
|---|---|---|
| OQ#1 | **Rate limiting.** Ship without rate limits; add Upstash `@upstash/ratelimit` when triggered. | Spam in inquiry inbox **OR** newsletter signups > 50/day from one IP **OR** 1,000 cumulative form submissions reached |
| OQ#2 | **GA4 → Plausible (cookieless) alternative.** Reconsider if DPDP enforcement hardens or consent-banner accept rate is too low. | DPDP enforcement clarification **OR** banner accept rate < 30% over 30 days |
| OQ#3 | **ClamAV scan on file uploads.** Add active virus scan before self-serve uploads open. | Before self-serve upload surfaces (employer post-a-job, expert avatar) ship |
| OQ#4 | **PII retention scheduled job.** Implement `pg_cron` Edge Function for retention rules in §9.5. | 6 months after first production records exist |
| OQ#5 | **Razorpay integration design.** No flow specified. Which features go paid (templates? featured expert listings? consultation deposits?). | When first paid feature is committed |
| OQ#6 | **Long-retention log drain (Axiom / Better Stack).** Add when Vercel's 7-day log retention becomes insufficient. | Production traffic > 500 unique users/day |
| OQ#7 | **Tailwind reconciliation.** ✅ **Resolved 2026-05-23.** Tailwind (per §2) is the confirmed approach; the earlier plain-CSS migration suggestion is dropped. Locked during analysis of `story-homepage-01` (the first frontend port). | — (resolved) |
| OQ#8 | **Second-admin onboarding.** `profiles.is_admin` is set manually. No invite UI exists for adding a second admin or editorial collaborator. | When a non-founder needs admin access |
