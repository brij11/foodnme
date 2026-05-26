---
id: story-homepage-06
topic: homepage
sprint: 3
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
dependencies:
  - story-homepage-05
  - story-blog-01
design:
  - design/screens-main.jsx
---

# story-homepage-06 — Homepage mid-page: editorial feature, testimonials, stats, Q&A

## User story
As a visitor evaluating foodnme, I want to see a flagship piece of content, social proof, headline numbers, and quick answers, so that I trust the platform enough to engage.

## Description
Add the mid-page narrative sections to `app/(public)/page.tsx` per `UI-DESIGN-HANDOFF.md` §3.6: one large **editorial feature** (a single highlighted published article), two **testimonial** blockquotes, the **stats row** (4 Supabase-derived counts), and the "**Good to know**" Q&A. Depends on the page shell (`story-homepage-05`) and on published articles (`story-blog-01`) for the editorial feature.

## Acceptance criteria
- [ ] Editorial feature renders ONE highlighted published article (cover image left, content right per §3.6): tags row, H2 title, excerpt/dek, author row, link to `/blog/[slug]`
- [ ] Feature selection: `WHERE is_featured AND is_published ORDER BY published_at desc LIMIT 1`, falling back to the most-recent published article when none is flagged (`is_featured` added to `TECHNICAL-REQUIREMENTS.md` §4.2 on 2026-05-26)
- [ ] The "From the Knowledge Hub" section header (overline "This week's read") + "All articles → /blog" link render with the feature; this §3.6 #4 section also hosts the `story-homepage-04` rail (which excludes the featured article)
- [ ] Two testimonial blockquotes render per §3.6 / §5.3, static (no testimonials table) — verbatim prototype copy: Sneha P. ("QA Manager, mid-sized dairy") + Rohan I. ("Regulatory Lead, snacks brand"), accent-color quote marks on cream (`--color-surface-light`) background
- [ ] Stats row renders 4 live Supabase counts: Articles Published = `count(articles WHERE is_published)`; Templates = `count(resources)`; Industry Topics = `count(DISTINCT category)` over published articles; Consultations Done = `count(service_inquiries)`
- [ ] Stat copy is approximate per §5.2 (`+`/`k` suffixes) — never rounded thousands
- [ ] Stat numbers rendered in `--color-text` (dark olive), not `--color-primary` (§4.1/§8)
- [ ] "Good to know" Q&A section renders per §3.6: asymmetric 2-col (sticky intro left, numbered Q&A list right), 5 static Q&As verbatim from the prototype, with a "Read the full About page → /about" link
- [ ] Sections mount within the `story-homepage-05` shell at §3.6 positions 4 (feature), 5 (testimonials), 6 (stats), 9 (Q&A) — positions 7 (Featured this week) + 8 (Final CTA) fall between this story's #6 and #9
- [ ] Counts computed server-side at build/revalidate (SSG) — no client DB call; the feature title is H2 (the single page H1 stays the hero, per `story-homepage-05`)

## Tasks
- [new] Editorial feature — fetch the flagship article (`is_featured AND is_published` desc, fallback most-recent published) in the shell's server-side page data; render cover-left/content-right with tags, H2 title, excerpt, author row, link to `/blog/[slug]`; render the "From the Knowledge Hub" header + "All articles →" link (shared host for the homepage-04 rail)
- [new] Testimonials section — 2 static §5.3-format blockquotes (verbatim prototype copy), cream background, accent quote marks (§3.6 #5)
- [new] Stats row — 4 Supabase COUNT queries (published articles, resources, distinct categories, service_inquiries) computed at build/revalidate; dark-olive numbers, approximate copy per §5.2 (§3.6 #6)
- [new] "Good to know" Q&A — asymmetric 2-col, 5 static Q&As (verbatim), sticky intro + "Read the full About page → /about" link (§3.6 #9)
- [new] Mount the four sections into the homepage-05 shell slots at §3.6 positions 4, 5, 6, 9; confirm §3.6 order holds with 07's sections (7, 10) interleaved
- [new] Verification — stats reflect live counts after revalidate; single-H1 invariant preserved (feature title is H2)

## Notes
- Split from `story-homepage-03` during restore 2026-05-26.
- Stat copy rule from `UI-DESIGN-HANDOFF.md` §5.2 — approximate, not exact rounded thousands.
- SSG + on-demand revalidate inherited from the `story-homepage-05` page shell.
- **Analyzed 2026-05-26:** Editorial-feature selection now grounded — `is_featured` added to the `articles` table (`TECHNICAL-REQUIREMENTS.md` §4.2, with approval) so the flagship is admin-curated, distinct from the auto latest-4 rail. The rail (`story-homepage-04`) excludes the featured article to prevent duplication.
- **Testimonials + Q&A copy is static** (no DB table) and grounded verbatim from the prototype `HomePage` (`design/screens-main.jsx`) — no founder input was needed; the prototype copy is the contract. §5.3 format (first name + last initial; role + segment, not company name).
- **Stats appear twice on the page by decision** — hero strip (`story-homepage-05`) + this mid-page row. Different metric sets: hero = articles/templates/businesses/subscribers; mid-page = articles/templates/industry-topics/consultations. All Supabase-derived.
