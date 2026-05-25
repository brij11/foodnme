---
id: story-homepage-04
topic: homepage
sprint: 1
original_sprint: 1
story_points: 3
status: deferred
owner: brij
tasks_populated: false
dependencies:
  - story-homepage-03
  - story-blog-01
  - story-templates-01
design:
  - design/screens-main.jsx
---

# story-homepage-04 — Featured articles + featured templates wiring on homepage

## User story
As a visitor scanning the homepage, I want to see the latest blog articles and a few templates without leaving the page, so that I can sample the content quality before clicking through.

## Description
Wire the "Latest from the Blog" and "Ready-to-Use Templates" sections on `/` to Supabase. Each section renders 3 `ArticleCard` / `TemplateCard` components plus a ghost "View All →" link to the listing page. Card components are introduced by `story-blog-01` and `story-templates-01` respectively.

## Acceptance criteria
- [ ] Featured articles section: 3 most-recent published articles ordered by `published_at desc`
- [ ] Featured templates section: 3 templates ordered by `created_at desc`, all free
- [ ] Overlines `KNOWLEDGE HUB` and `FREE RESOURCES` render per spec
- [ ] "View All Articles →" links to `/blog`; "Browse All Templates →" links to `/templates`
- [ ] Card grid staggers entry 80ms per child; respects `prefers-reduced-motion`
- [ ] Homepage still meets LCP < 2.0s after wiring (no DB call blocking initial render — uses SSG snapshot with revalidation)

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Stagger + reduced-motion is a cross-cutting interaction policy from `UI-DESIGN-HANDOFF.md` §4.10.
- The "Free" badge on featured templates is deliberately NOT shown per `UI-DESIGN-HANDOFF.md` §4.2.

> **⏸ DEFERRED to backlog during analysis 2026-05-23 (`status: deferred`, originally planned for Sprint 1).**
> Folded into the `story-homepage-03` narrative restructure. The narrative homepage (§3.6) replaces this story's two 3-card grids with: a single large **editorial feature** (#4) and a **"Featured this week"** paired template+expert block (#7). This story's "Featured this week" content belongs in the proposed **homepage-03c**. Re-scope or absorb this story when running `/manage-stories split story-homepage-03`. The expert half of the paired card depends on Sprint-2 experts data — ship template-only with a stub, or move it to Sprint 2.
