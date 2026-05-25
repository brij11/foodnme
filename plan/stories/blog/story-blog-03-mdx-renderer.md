---
id: story-blog-03
topic: blog
sprint: 1
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
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
- [ ] `next-mdx-remote/rsc` renders article body inside `app/(public)/blog/[slug]/page.tsx`
- [ ] Pull-quote callout: left border 4px `--color-primary`, background `--color-surface-light`, padding 16px 20px
- [ ] CTA box: surface-light background, headline + sub-copy + button — props pass title, body, ctaText, ctaHref
- [ ] Inline `<Tag>` component renders the same Tag primitive from `story-homepage-01`
- [ ] Code blocks syntax-highlighted via shiki at build time (no runtime JS payload)
- [ ] Allowlist enforced: any unknown component name in MDX renders as a plain `<div>` with a console warning in dev (silently dropped in prod)
- [ ] Sample MDX article in seed data exercises every custom component for visual QA

## Tasks
- [new] Wire `next-mdx-remote/rsc` into the article body slot with the typography rules (H2/H3 Inter 700, body IBM Plex Sans, mono IBM Plex Mono); no `dangerouslySetInnerHTML` (AC#1)
- [new] Build the custom component map — `PullQuote`, `CTABox` (title/body/ctaText/ctaHref), `Image`, inline `Tag` (reusing the homepage-01 primitive) (AC#2, AC#3, AC#4)
- [new] Add `shiki` build-time code highlighting (zero runtime JS) (AC#5)
- [new] Enforce the allowlist: unknown components → plain `<div>` + dev-only console warning (AC#6)
- [new] Add a sample MDX article to `seed.sql` exercising every custom component for visual QA (AC#7)

## Notes
- Renderer choice + component allowlist from `TECHNICAL-REQUIREMENTS.md` §7.2 and §9.3 (OWASP XSS mitigation).
- shiki picked over `rehype-highlight` for zero-runtime-JS reasons (bundle budget §8.2).
- _Analyzed 2026-05-23: fully grounded in §7.2 / §9.3 — no open questions._
