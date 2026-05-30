---
id: story-blog-09
topic: blog
sprint: 4
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-blog-02
design:
  - design/screens-blog.jsx
---

# story-blog-09 — Reading-progress bar wired to article scroll

## User story
As a reader working through a long article, I want a progress indicator on the navbar, so that I can see how much of the piece remains.

## Description
The navbar already renders a progress bar driven by the `--reading-progress` CSS variable (`components/chrome/Navbar.tsx`), but no page ever sets it, so it never moves. Wire it on the article detail page per `UI-DESIGN-HANDOFF.md` §3.7: a scroll listener updates `--reading-progress` (0–100%) as the reader moves through the article body.

## Acceptance criteria
- [x] Scrolling the article updates the navbar's bottom-edge progress bar from 0% to 100% across the article body — `components/blog/ReadingProgress.tsx` sets `--reading-progress`; `ReadingProgress.test.tsx` (50→100→0%), `e2e/article-share-progress.spec.ts` (0% at top → >0% scrolled; probe confirmed 100% at bottom)
- [x] Progress reflects the article content region (not the whole document including footer) — computed over `#article-body` (the MDX content region), not `document`
- [x] The variable resets/clears when navigating away from an article (no stale fill on non-article pages) — cleanup sets `--reading-progress: 0%` on unmount; `ReadingProgress.test.tsx` unmount case
- [x] Listener is throttled (rAF or passive scroll) and cleaned up on unmount — no scroll jank — `requestAnimationFrame`-coalesced passive `scroll`/`resize` listeners; removed + `cancelAnimationFrame` on unmount (verified in test via captured-rAF flush)
- [x] Respects `prefers-reduced-motion` (no animated easing when set; instantaneous width is fine) — the island applies no easing itself; the navbar's `after:transition-[width]` is neutralized by the existing global `@media (prefers-reduced-motion: reduce)` rule in `app/globals.css` (`transition-duration: 0.001ms`)

## Tasks
- [completed] Add a client island on `app/(public)/blog/[slug]/page.tsx` that computes reading progress (0–100%) over the article **content region** and sets `--reading-progress` on `:root`
- [completed] Throttle the scroll handler with `requestAnimationFrame` (passive listener); remove the listener and reset `--reading-progress` to `0%` on unmount / navigation away (no stale fill on non-article pages)
- [completed] Respect `prefers-reduced-motion` (instantaneous width, no animated easing when set)
- [completed] Add a test asserting the variable advances on scroll within the content region and resets on unmount

## Notes
- Audit gap G2 / A4 (Partial): bar exists in chrome but is never driven. Verified: `web/components/chrome/Navbar.tsx` renders `after:w-[var(--reading-progress,0%)]` — this story only needs to drive the variable.
- Pure client; small island on the article page sets the CSS variable on `:root`. Design documented in `UI-DESIGN-HANDOFF.md` §3.7 (no doc change needed).
