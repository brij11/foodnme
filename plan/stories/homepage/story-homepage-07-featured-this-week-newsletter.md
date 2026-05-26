---
id: story-homepage-07
topic: homepage
sprint: 3
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
dependencies:
  - story-homepage-05
  - story-newsletter-01
  - story-templates-01
  - story-experts-01
design:
  - design/screens-main.jsx
---

# story-homepage-07 — Homepage "Featured this week" + newsletter slot

## User story
As a returning visitor, I want a weekly highlighted template and expert plus an easy way to subscribe, so that I keep coming back and stay in the loop.

## Description
Add the "**Featured this week**" paired-card block (a featured template paired with a featured expert) and the **newsletter banner** slot (`<NewsletterBanner />` from `story-newsletter-01`) to `app/(public)/page.tsx` per `UI-DESIGN-HANDOFF.md` §3.6. The expert half depends on Sprint-2 experts data; ship the template+expert pairing, falling back to an expert stub when data is unavailable. This child absorbs the "Featured this week" scope that the backlog `story-homepage-04` described.

## Acceptance criteria
- [ ] "Featured this week" renders a paired card per §3.6 (color-accent strips on top), under header overline "Featured this week" / "Two things worth your time."
- [ ] Featured template = most-downloaded resource (`ORDER BY download_count desc LIMIT 1`); card shows "Most downloaded · {count}", file type, title, description, pages + updated date, links to `/templates/[slug]`
- [ ] Featured expert = `WHERE is_featured AND status = 'approved' ORDER BY created_at desc LIMIT 1`, falling back to the most-recent approved expert; card shows avatar, name, title · years, bio, availability badge, links to `/experts/[id]`
- [ ] If no approved expert exists, the expert half renders a stub empty-state (e.g. "More experts coming soon" → `/experts`) per §5.4 — never a broken/empty card
- [ ] Newsletter section renders the shared `<NewsletterBanner source="homepage" />` (from `story-newsletter-01`)
- [ ] Sections mount within the `story-homepage-05` shell at §3.6 positions 7 (Featured this week) + 10 (Newsletter, page foot)
- [ ] Both blocks computed server-side at build/revalidate (SSG) — no client DB call blocks initial render

## Tasks
- [new] "Featured this week" template card — fetch most-downloaded resource server-side; render the template hero card (most-downloaded badge, file type, title, description, pages/updated footer) linking to `/templates/[slug]` (§3.6 #7)
- [new] "Featured this week" expert card — fetch `is_featured` + approved expert (fallback most-recent approved); render the expert hero card (avatar, name, title · years, bio, availability badge) linking to `/experts/[id]` (§3.6 #7)
- [new] Expert-half stub — render a §5.4 empty-state card ("More experts coming soon" → `/experts`) when no approved expert exists
- [new] Newsletter section — mount `<NewsletterBanner source="homepage" />` at §3.6 position 10 (§3.6 #10)
- [new] Mount both sections into the homepage-05 shell slots (positions 7 + 10); verify §3.6 order holds with 05/06's interleaved sections (8, 9)

## Notes
- Split from `story-homepage-03` during restore 2026-05-26.
- **Analyzed 2026-05-26 — no doc gap, no founder question:** selection rules grounded directly from the prototype `HomePage` + §4.2 schema. Template = most-downloaded (`resources.download_count desc`); expert = `experts.is_featured` (column already in §4.2) filtered to `status='approved'`, fallback most-recent approved, then a §5.4 stub. `<NewsletterBanner>` is the shared component from `story-newsletter-01` (done).
- Covers the "Featured this week" template/expert scope that the old `story-homepage-04` once described. `story-homepage-04` has since been **restored and re-scoped** (2026-05-26) to a complementary "Latest from the blog" rail (Sprint 3), so the two no longer overlap.
- The paired card pairs a template with an **expert** (experts are Sprint 2, done) — use real data, stub the expert half if unavailable.
- SSG + on-demand revalidate inherited from the `story-homepage-05` page shell.
- Per-section detail + tasks to be grounded by `/analyze-sprint 3` against §3.6.
