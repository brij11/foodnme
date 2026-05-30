---
id: story-blog-08
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

# story-blog-08 — Article share row

## User story
As a reader who found an article useful, I want quick share actions, so that I can send it to a colleague or post it without copying the URL by hand.

## Description
Add the designed share row to the article detail page (absent today). Per the prototype `screens-blog.jsx`: a row beneath the article body with Copy link, LinkedIn, Twitter/X, and Email actions. "Copy link" copies the canonical URL and confirms; the social/email actions open the standard share intents in a new tab.

## Acceptance criteria
- [ ] Share row renders beneath the article body (near the tags row), matching `screens-blog.jsx`
- [ ] "Copy link" copies the canonical article URL to the clipboard and shows transient confirmation
- [ ] LinkedIn, Twitter/X, and Email actions open the correct prefilled share/compose intents in a new tab (`rel="noopener noreferrer"`)
- [ ] Buttons are keyboard-accessible with discernible labels (icon-only buttons have `aria-label`)
- [ ] Uses the icon system (no emoji); green only on actionable elements

## Tasks
- [new] Build a `ShareRow` client island (Copy link, LinkedIn, Twitter/X, Email) per `screens-blog.jsx` `ShareRow`
- [new] "Copy link" → `navigator.clipboard.writeText(canonical URL)` with a transient "Copied ✓" confirmation and a graceful fallback if clipboard is unavailable
- [new] LinkedIn / Twitter-X / Email actions open the correct prefilled share/compose intents in a new tab with `rel="noopener noreferrer"`
- [new] Mount the row beneath the article body near the tags row in `app/(public)/blog/[slug]/page.tsx`
- [new] a11y: icon-only buttons get `aria-label`, keyboard-operable; icon system only (no emoji); green confined to actionable elements
- [new] Add a test for copy-to-clipboard confirmation and correct share-intent URLs

## Notes
- Audit gap A2 (Major): share row entirely absent. Design verified present in `screens-blog.jsx` (`ShareRow`).
- Pure client interaction; no schema or API dependency. Docs already cover this.
