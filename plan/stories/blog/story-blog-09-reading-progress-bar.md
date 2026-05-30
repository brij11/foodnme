---
id: story-blog-09
topic: blog
sprint: 4
story_points: 2
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
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
- [ ] Scrolling the article updates the navbar's bottom-edge progress bar from 0% to 100% across the article body
- [ ] Progress reflects the article content region (not the whole document including footer)
- [ ] The variable resets/clears when navigating away from an article (no stale fill on non-article pages)
- [ ] Listener is throttled (rAF or passive scroll) and cleaned up on unmount — no scroll jank
- [ ] Respects `prefers-reduced-motion` (no animated easing when set; instantaneous width is fine)

## Tasks
- [new] Add a client island on `app/(public)/blog/[slug]/page.tsx` that computes reading progress (0–100%) over the article **content region** and sets `--reading-progress` on `:root`
- [new] Throttle the scroll handler with `requestAnimationFrame` (passive listener); remove the listener and reset `--reading-progress` to `0%` on unmount / navigation away (no stale fill on non-article pages)
- [new] Respect `prefers-reduced-motion` (instantaneous width, no animated easing when set)
- [new] Add a test asserting the variable advances on scroll within the content region and resets on unmount

## Notes
- Audit gap G2 / A4 (Partial): bar exists in chrome but is never driven. Verified: `web/components/chrome/Navbar.tsx` renders `after:w-[var(--reading-progress,0%)]` — this story only needs to drive the variable.
- Pure client; small island on the article page sets the CSS variable on `:root`. Design documented in `UI-DESIGN-HANDOFF.md` §3.7 (no doc change needed).
