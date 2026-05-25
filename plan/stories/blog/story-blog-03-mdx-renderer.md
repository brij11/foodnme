---
id: story-blog-03
topic: blog
sprint: 1
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
executed_date: 2026-05-25
dependencies:
  - story-blog-02
design:
  - design/screens-blog.jsx
---

# story-blog-03 — MDX renderer with custom component allowlist + shiki code highlighting

## User story
As the founder authoring articles, I want a rich-text body format that supports pull-quotes, CTA boxes, inline tags, and syntax-highlighted code, so that articles feel editorial without me writing HTML by hand.

## Description
Wire `next-mdx-remote/rsc` to render `articles.content_mdx`. Expose a custom component map: `PullQuote`, `CTABox`, `Image`, `Tag`. Code blocks use `shiki` for build-time syntax highlighting (zero runtime JS). Renderer applies the typography rules (H2/H3 in Inter 700, body in IBM Plex Sans, mono in IBM Plex Mono). No `dangerouslySetInnerHTML` anywhere in the article path — the MDX component allowlist is the only escape hatch.

## Acceptance criteria
- [x] `next-mdx-remote/rsc` renders article body inside `app/(public)/blog/[slug]/page.tsx` — _`ArticleBody` (MDXRemote rsc); E2E renders the seeded MDX_
- [x] Pull-quote callout: left border 4px `--color-primary`, background `--color-surface-light`, padding 16px 20px — _`PullQuote`; component test + E2E_
- [x] CTA box: surface-light background, headline + sub-copy + button — props title/body/ctaText/ctaHref — _`CTABox`; component test (props→render+link) + E2E_
- [x] Inline `<Tag>` component renders the same Tag primitive from `story-homepage-01` — _MDX `Tag` maps to homepage-01 `Tag`; E2E asserts the "CCP" tag_
- [x] Code blocks syntax-highlighted via shiki at build time (no runtime JS payload) — _`@shikijs/rehype` (`github-light-high-contrast`); E2E asserts `pre.shiki` + inline-style colors; build = 104 kB First Load (zero runtime shiki JS)_
- [x] Allowlist enforced: unknown component → plain `<div>` + dev console warning (dropped in prod) — _`buildMdxComponents` pre-scans source, injects a logging `<div>` fallback for non-allowlisted names; component test_
- [x] Sample MDX article in seed data exercises every custom component for visual QA — _seeded HACCP article exercises PullQuote/CTABox/Image/inline Tag + a fenced code block (enriched an existing article to keep listing counts stable)_

## Tasks
- [completed] Wire `next-mdx-remote/rsc` into the article body slot with the typography rules (H2/H3 Inter 700, body IBM Plex Sans, mono IBM Plex Mono); no `dangerouslySetInnerHTML` (AC#1)
- [completed] Build the custom component map — `PullQuote`, `CTABox` (title/body/ctaText/ctaHref), `Image`, inline `Tag` (reusing the homepage-01 primitive) (AC#2, AC#3, AC#4)
- [completed] Add `shiki` build-time code highlighting (zero runtime JS) (AC#5)
- [completed] Enforce the allowlist: unknown components → plain `<div>` + dev-only console warning (AC#6)
- [completed] Add a sample MDX article to `seed.sql` exercising every custom component for visual QA (AC#7)

## Notes
- Renderer choice + component allowlist from `TECHNICAL-REQUIREMENTS.md` §7.2 and §9.3 (OWASP XSS mitigation).
- shiki picked over `rehype-highlight` for zero-runtime-JS reasons (bundle budget §8.2).
- _Analyzed 2026-05-23: fully grounded in §7.2 / §9.3 — no open questions._
