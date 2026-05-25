---
id: story-blog-02
topic: blog
sprint: 1
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
dependencies:
  - story-blog-01
design:
  - design/screens-blog.jsx
---

# story-blog-02 — Article detail /blog/[slug] layout (header, breadcrumb, tags row)

## User story
As a visitor opening an article from the listing, I want a focused reading layout with clear breadcrumbs and keyword tags, so that I can read deeply and easily jump back to related categories.

## Description
Build `app/(public)/blog/[slug]/page.tsx` with breadcrumb (Home › Blog › Category), article header (category tag + read-time tag, H1 in Fraunces, **simple author line: name + publish date + read time**, optional cover image), MDX-rendered body inside max-width 720px column, keyword tags row at the bottom, and a newsletter banner. MDX renderer setup is `story-blog-03`. Related articles and in-article CTA box are `story-blog-05`. The richer §3.7 "deep screen" polish — author-chip (avatar/role/social), share row, and the prominent author-bio card — is split out to **`story-blog-06`** (needs the `authors` schema; see Notes).

## Acceptance criteria
- [ ] `/blog/[slug]` SSG via `generateStaticParams` over all published articles
- [ ] On-demand revalidation triggered by admin publish action
- [ ] Breadcrumb: Home > Blog > {Category} — IBM Plex Sans 0.75rem muted; category segment links to the category page
- [ ] H1 in Fraunces 700 ≈ 2.5rem — only place Fraunces appears on the page
- [ ] Header shows category tag + read-time tag and a simple author line (`author_name` + publish date + read time) — the rich author-chip is `story-blog-06`
- [ ] Cover image (if present) `border-radius: 16px`, full content width, `<Image priority>`
- [ ] Article body column max-width 720px, IBM Plex Sans 0.95rem, line-height 1.7
- [ ] Tags row renders outline green tags (transparent background, `--color-primary` border + text)
- [ ] Newsletter banner section renders `NewsletterBanner` (blog variant)
- [ ] `generateMetadata` reads from article row: title, description, OG image (per-article via `opengraph-image.tsx`)
- [ ] 404 if slug not found or `is_published = false`
- [ ] Lighthouse SEO score ≥ 95

## Tasks
- [new] Build `app/(public)/blog/[slug]/page.tsx` with `generateStaticParams` over published articles + 404 on missing/unpublished (AC#1, AC#11)
- [new] Build the article header: category + read-time tags, Fraunces H1, simple author line (name/date/read-time), optional `<Image priority>` cover at radius 16px (AC#4, AC#5, AC#6)
- [new] Breadcrumb (linked category segment) + bottom keyword tags row (outline-green) (AC#3, AC#8)
- [new] Body column (max-width 720px, IBM Plex Sans 0.95rem / lh 1.7) with a temporary raw-markdown fallback until `story-blog-03` MDX renderer lands (AC#7)
- [new] Slot in `NewsletterBanner` (blog variant) (AC#9)
- [new] `generateMetadata` + per-article `opengraph-image.tsx` via `next/og`; wire on-demand revalidation on admin publish; confirm Lighthouse SEO ≥ 95 (AC#2, AC#10, AC#12)

## Notes
- Rendering: SSG + on-demand revalidation per `TECHNICAL-REQUIREMENTS.md` §7.
- Per-article OG image generated via `next/og` per `TECHNICAL-REQUIREMENTS.md` §7.3.
- MDX renderer comes from `story-blog-03`; until then, body renders as raw markdown via a temporary fallback.
- _Analyzed 2026-05-23: founder chose to build all three §3.7 polish elements (author-chip, share row, author-bio card). Together with the base layout they exceed 5 SP **and** require author metadata the schema lacks, so they are **split into a recommended new `story-blog-06`** (create via `/manage-stories add`). blog-02 keeps a simple author line that the current schema (`articles.author_name`) supports._
- **Schema follow-up for `story-blog-06`:** `articles` has only `author_name` (no avatar/role/bio/social/contact/article-count). Recommended addition — an `authors` table `(id, name, slug, avatar_url, role, bio, linkedin_url, twitter_url, contact_email)` + `articles.author_id` FK — proposed in the run summary, to be applied when blog-06 is created.
