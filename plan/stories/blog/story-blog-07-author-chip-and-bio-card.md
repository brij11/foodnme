---
id: story-blog-07
topic: blog
sprint: 4
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-blog-02
  - story-blog-06
design:
  - design/screens-blog.jsx
---

# story-blog-07 — Article author chip (header) + author bio card (foot)

## User story
As a reader, I want to see who wrote an article — with their photo, role, and a short bio — so that I can gauge the author's authority and find more of their work.

## Description
Add the two designed author surfaces to `app/(public)/blog/[slug]/page.tsx`, which today shows only a plain "name · date · read time" line. Per `UI-DESIGN-HANDOFF.md` §3.7: (1) a header **author chip** (avatar, name, role, date, LinkedIn + Twitter icons) and (2) an end-of-article **author bio card** (96px avatar, name, role in muted color, full bio, large LinkedIn/Twitter buttons, article count, contact email). Both read the **author-expert** linked in `story-blog-06` (`articles.expert_id → experts`): chip/card fields map to `full_name`, `title` (role), `avatar_url`, `bio`, `linkedin_url`, `twitter_url`, `contact_email`, and a derived per-expert `article_count`.

## Acceptance criteria
- [x] Article header renders an author chip: avatar (or initials), name, role, publish date, and LinkedIn + Twitter icon links (omitted gracefully when a handle is absent) — `components/blog/AuthorChip.tsx`; `author.test.tsx` (full + bare author), `e2e/article-author.spec.ts` (chip LinkedIn link visible)
- [x] End-of-article author bio card renders: 96px avatar, name, role (muted), full bio, LinkedIn/Twitter buttons, article count, and contact email — `components/blog/AuthorBioCard.tsx` (h-24 avatar, mailto site contact `hello@foodnme.in` — never the expert's server-only `contact_email`); `author.test.tsx`
- [x] Bio card sits below the article body / tags row and above Related articles — `page.tsx`: `<AuthorBioCard>` between the tags row and `<RelatedArticles>`
- [x] Author display fields come from the `story-blog-06` entity (no hard-coded author data) — both components take `article.author` (the linked expert) + `article.author_article_count`
- [x] Social links open in a new tab with `rel="noopener noreferrer"` — `author.test.tsx` asserts `target="_blank"` + `rel="noopener noreferrer"` on chip and card links
- [x] Layout matches `screens-blog.jsx` spacing/type; green only on actionable elements; no emoji — Tailwind tokens (`text-muted`, `bg-surface-light`, primary on hover); icons not emoji; `e2e` a11y check on detail page passes (no critical/serious)
- [x] Renders correctly when optional fields (bio, social, avatar) are missing — `author.test.tsx` `bareAuthor` case (no role/bio/socials/avatar → initials + count still render)

## Tasks
- [completed] Build the header author chip (avatar/initials, name, `title` role, publish date, LinkedIn + Twitter icon links) per `screens-blog.jsx` `HeaderAuthorChip`; omit a social link gracefully when its handle is absent
- [completed] Build the end-of-article author bio card (96px avatar, name, role muted, full bio, large LinkedIn/Twitter buttons with brand-color hover, article count, contact email) per `AuthorBioCard`
- [completed] Wire both into `app/(public)/blog/[slug]/page.tsx`: chip in the header (replacing the plain name·date·read-time line); bio card below the article body/tags row and above Related articles
- [completed] Source all author fields from the `lib/articles` author-expert read (blog-06) incl. derived `article_count` — no hard-coded author data
- [completed] Social links open in a new tab with `rel="noopener noreferrer"`; verify graceful render when bio/social/avatar are missing
- [completed] Match `screens-blog.jsx` spacing/type; green confined to actionable elements; no emoji; accessible labels on icon links
- [completed] Add a test asserting chip + bio card render from the linked expert and degrade cleanly when optional fields are null

## Notes
- Audit gaps A1 + A3 (header chip Major-ish, bio card Major).
- Hard-depends on `story-blog-06` (author-expert linkage). OQ#9 resolved 2026-05-30 — author fields come from the linked `experts` row. Design documented in `UI-DESIGN-HANDOFF.md` §3.7 (no doc change needed).
