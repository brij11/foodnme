# Design-Parity Deviations — `web/` build vs. original designs

**Date:** 2026-05-31
**Audited by:** screen-by-screen comparison of every implemented surface against the source of truth.
**Source of truth:** `plan/design/` prototype (16 screens) + `plan/UI-DESIGN-HANDOFF.md` design contract. Where the handoff and `plan/TECHNICAL-REQUIREMENTS.md §8` disagree, the tech-spec wins.
**Build audited:** production Next.js app at `web/` (story tracker reports 63/63 stories done).

> **Method note.** Every finding below cites exact files + lines on both sides. An early pass on summaries alone produced false positives (it wrongly claimed Scenarios shipped 3 role cards and Testimonials shipped 3 avatar cards — both are faithful), so nothing here rests on a summary. The highest-severity findings were re-verified by re-reading the cited lines directly.

## Severity legend

- **A — Missing / structural:** a designed screen or major section is absent, or structurally different.
- **B — Component / behavior:** section present but wrong composition, count, states, or interaction.
- **C — Design-system / rule:** violates a locked UI rule (§8 / handoff §1, §4).
- **D — Copy / cosmetic:** wording, color, spacing nits.

Each finding is also tagged **`[true]`** (a genuine gap to fix) or **`[justified]`** (deviates from the prototype but is defensible — schema constraint, documented decision, or production hardening). Triage the **`[true]` A/B** items first.

---

## Scoreboard

| Surface | Verdict | A | B | C | D |
|---|---|---|---|---|---|
| Design tokens | Faithful (1 justified C) | – | – | 1j | – |
| Navbar / Brand | Faithful | – | – | – | – |
| Footer | Deviations | – | 1 | – | 1 |
| AccountMenu | Deviations | – | 1 | – | – |
| Button (ghost) | Deviation | – | 1 | – | – |
| Cards (Article/Service) | Faithful | – | – | – | 1 |
| TemplateCard | Faithful (justified C) | – | – | 1j | – |
| JobCard / ExpertCard | Deviations | – | 4 | 1 | – |
| Modals (all 4) | Deviations | – | 5 | – | 1 |
| **Homepage** (10 beats) | All beats present | – | – | 3 | 1 |
| **Blog listing** | Deviations | 3 | 1 | – | – |
| **Category** | Deviations | 2 | 1 | – | 2 |
| **Article detail** | Faithful (minor) | – | – | 1 | 1 |
| **Templates listing** | Deviations | 2 | – | 1j | 1 |
| **Template detail** | Deviations | – | 2 | – | – |
| **Services** | Faithful | – | – | – | – |
| **About** | Faithful | – | – | – | 1 |
| **Login** | Deviation | – | 1 | – | – |
| **Register** | Faithful (single-form is §4.11) | – | – | – | – |
| **Reset password** | Faithful | – | – | – | – |
| **Jobs listing** | Deviations | – | 1 | 1j | 2 |
| **Job detail** | Faithful | – | – | – | 1 |
| **Experts listing** | Deviations | **2** | – | 1 | – |
| **Expert detail** | Deviations | – | 1 | – | 1 |
| **Dashboards** (3 roles) | Deviations | 1 | 6 | 1 | 2 |

**Bottom line:** no whole screen is missing — all 16 designed screens + `/search` (an addition) exist. The deviations cluster in: (1) **listing-page filters/controls** (blog, templates, experts lost sort/search/tags/toggles), (2) **dashboard stats** (several placeholders + a removed match-score section), (3) **modal entry animation** (systemic), and (4) a handful of **typography rule slips** (Fraunces vs Inter on stat numbers).

---

## Severity A — Missing / structural

### A1 `[true]` Experts listing — "Verified experts only" toggle removed
- **Design:** featured-only toggle filtering `e.featured` — `plan/design/screens-experts.jsx:55-58` `<span>Verified experts only</span>`. Handoff lists it as an expert filter.
- **Build:** Quick filters has only "Available now"; no verified toggle — `web/components/experts/ExpertsFilterSidebar.tsx:45-51`.
- **Note:** the build's own docstring justifies the drop as *"no rating column, §4.2"* (`ExpertsFilterSidebar.tsx:7-8`) — **this is false**: `experts.is_featured` exists (`TECHNICAL-REQUIREMENTS.md:144`). Genuine regression.
- **Fix:** restore the "Verified only" checkbox, filtering on `is_featured`.

### A2 `[true]` Experts listing — sort control entirely missing
- **Design:** sort dropdown "Top rated / Most experienced" in the results header — `plan/design/screens-experts.jsx:79-85`.
- **Build:** results header shows only the count, no sort anywhere — `web/app/(public)/experts/page.tsx:62-67`; sidebar has none either.
- **Note:** `experts.rating` + `experience_years` both exist (`TECHNICAL-REQUIREMENTS.md:140-141`) — fully supportable.
- **Fix:** add a sort control (rating / experience).

### A3 `[true]` Templates listing — sort dropdown missing
- **Design:** result count + sort dropdown (Most downloaded / Most recent) — `plan/design/screens-main.jsx:546`; handoff §3.5 "result count + sort dropdown".
- **Build:** result-count row only, no sort control — `web/app/(public)/templates/page.tsx:99`.
- **Fix:** add a popular/recent sort dropdown. ("Shortest by pages" can't survive — no `pages` column.)

### A4 `[true]` Templates listing — full-width newsletter banner missing
- **Design:** `<NewsletterBanner source="templates" …>` below the grid — `plan/design/screens-main.jsx:572`.
- **Build:** page ends at `</ListingShell>` — `web/app/(public)/templates/page.tsx:118`.
- **Fix:** add the templates newsletter banner section after the listing. (This is the full-width banner, distinct from the sidebar mini-newsletter that §3.5 correctly excludes for templates.)

### A5 `[true]` Employer dashboard — recent-applicant MATCH SCORES removed
- **Design:** each applicant row shows a colored `{score}% match` — `plan/design/screens-dashboard.jsx:248-249`.
- **Build:** rows show name, job, applied-date, resume link, status tag — no score field on `ApplicantRow` — `web/components/dashboard/EmployerDashboard.tsx:165-182`.
- **Fix:** add a match-score (or remove from the design contract if matching is out of scope).

### A6 `[true]` Blog listing — featured editorial slot removed
- **Design:** when unfiltered, a large `<FeaturedArticle>` renders above the grid — `plan/design/screens-blog.jsx:44-48`.
- **Build:** PageHeader → ListingShell with no featured slot — `web/app/(public)/blog/page.tsx:84-113`.
- **Fix:** render a featured article on page 1 / "all" category (or confirm intentionally cut).

### A7 `[true]` Blog + Category — "Popular tags" sidebar block removed
- **Design:** sidebar "Popular tags" block with clickable neutral pills — `plan/design/screens-blog.jsx:76-83`.
- **Build:** `ListingSidebar` renders search → categories → facet → clear-all → newsletter; no tags block — `web/components/listing/ListingSidebar.tsx:40-121`.
- **Fix:** add a Popular-tags block, or document removal.

### A8 `[partial]` Blog + Category — in-page search replaced by navigation to `/search`
- **Design:** sidebar search filters articles in place; result count reacts — `plan/design/screens-blog.jsx:56-59,107`.
- **Build:** sidebar search is `<form action="/search" method="get">` — it leaves the listing; the listing has no `?q=` filter — `web/components/listing/ListingSidebar.tsx:42-52`.
- **Fix:** decide product intent — either accept search delegated to the global `/search` page (reasonable, since `/search` was added), or wire an in-page `?q=` filter so blog/category results react. **Needs a product call.**

---

## Severity B — Component / behavior

### B1 `[true]` All 4 modals — no `modal-pop` entry animation (systemic)
- **Design:** `.modal { animation: modal-pop 280ms … }` scale+opacity; backdrop `modal-fade` — `plan/design/styles.css:1166,1178-1184`; handoff §3.4 "Animated entry (`modal-pop`)".
- **Build:** every modal has `backdrop-blur-sm` but no entry animation; `modal-pop` is never defined — `web/tailwind.config.ts:74-82` (only `fade-up`). Affects `ConsultationModal.tsx`, `ApplyModal.tsx:128`, `ContactExpertModal.tsx:116`, `PostJobModal.tsx:100`.
- **Fix:** add a `modal-pop` keyframe (translateY+scale+opacity) and apply to all dialogs, gated by `motion-reduce`.

### B2 `[true]` PostJobModal — no two-state form→success view
- **Design:** all modals share form→success (check-circle) — handoff §3.4.
- **Build:** on success it just calls `onClose()` + `router.refresh()` — `web/components/dashboard/PostJobModal.tsx:83-85`; the admin-review confirmation is only a pre-submit subtitle (`:107`).
- **Fix:** show a success state with the admin-review confirmation + check-circle before closing.

### B3 `[true]` Footer — Contact column missing "Newsletter" link
- **Design:** Contact = email, LinkedIn, **Newsletter** — `plan/design/ui.jsx:201-206`; handoff §2.2.
- **Build:** Contact has only email + LinkedIn — `web/components/chrome/Footer.tsx:66-74`.
- **Fix:** add a Newsletter link, or amend §2.2 (the inline mini-banner at `Footer.tsx:30-34` is an addition, not a Contact-column link).

### B4 `[true]` AccountMenu — "Settings" item dropped
- **Design:** menu = Dashboard, Settings (role-routed), divider, Sign out — `plan/design/ui.jsx:634-637`.
- **Build:** Dashboard, divider, Sign out only — `web/components/chrome/AccountMenu.tsx:80-99`.
- **Fix:** add the role-routed Settings item, or confirm intentionally cut.

### B5 `[true]` Button — ghost variant uses underline instead of arrow-grow
- **Design:** `.btn-ghost` = green text + trailing `→` that grows on hover, no underline — `plan/design/styles.css:230-241`.
- **Build:** `text-primary underline`, no arrow — `web/components/ui/Button.tsx:25`.
- **Fix:** restore the arrow-grow affordance.

### B6 `[true]` Login — "Keep me signed in" checkbox dropped
- **Design:** checked-by-default "Keep me signed in for 30 days" below password — `plan/design/screens-auth.jsx:86-88`.
- **Build:** password field → submit button, nothing between — `web/app/(auth)/login/page.tsx:159-177`.
- **Fix:** add the remember-me checkbox, or document the omission.

### B7 `[deferred]` Seeker dashboard — "Profile views" stat is a placeholder
- **Design:** real value (`28`, "+12% vs. last week") — `plan/design/screens-dashboard.jsx:120-124`.
- **Build:** `<StatCard label="Profile views" value="—" />` — `web/components/dashboard/SeekerDashboard.tsx:80`.
- **Fix:** wire a counter or accept "—" until a story models it (code comment marks this a deliberate deferral, `:71-72`).

### B8 `[deferred]` Seeker dashboard — "Match score" stat is a placeholder
- **Design:** real value (`82%`, "Strong fit") — `plan/design/screens-dashboard.jsx:125-129`.
- **Build:** `value="—"` — `web/components/dashboard/SeekerDashboard.tsx:81`.
- **Fix:** compute or accept "—" (tied to A5 — matching is unmodeled).

### B9 `[deferred]` Employer dashboard — "Avg. time to hire" stat is a placeholder
- **Design:** `12d`, "-3d vs. avg" — `plan/design/screens-dashboard.jsx:209-213`.
- **Build:** `value="—"` — `web/components/dashboard/EmployerDashboard.tsx:140`.
- **Fix:** track hire events, or accept "—".

### B10 `[true]` Expert dashboard — stat tiles relabeled
- **Design:** Profile views, Inquiries, Avg. rating, Active engagements — `plan/design/screens-dashboard.jsx:396-415`.
- **Build:** Inquiries, Avg rating, Response time, Availability — "Profile views" + "Active engagements" dropped — `web/components/dashboard/ExpertDashboard.tsx:117-132`.
- **Fix:** restore prototype labels or document the swap.

### B11 `[choice]` Expert dashboard — availability toggle moved from header to its own tab
- **Design:** toggle inline in the dashboard header — `plan/design/screens-dashboard.jsx:385-392`.
- **Build:** toggle only under a separate "Availability" tab — `web/components/dashboard/ExpertDashboard.tsx:186-206`.
- **Fix:** surface it on the overview header, or accept the tab placement.

### B12 `[true]` Expert detail — engagement types render as a list, not a 3-card grid
- **Design:** 3-up card grid (Hourly / Project / Retainer) — `plan/design/screens-experts.jsx:173-186`.
- **Build:** vertical stacked rows — `web/app/(public)/experts/[id]/page.tsx:138-156`.
- **Fix:** render engagement types as a responsive 3-col card grid.

### B13 `[true]` Jobs listing — sort control in the sidebar, not the results header
- **Design:** sort dropdown in the main column above the grid — `plan/design/screens-jobs.jsx:90-96`; handoff §3.5 "Main column: result count + sort dropdown".
- **Build:** sort moved into the sidebar form — `web/components/jobs/JobsFilterSidebar.tsx:78-84`; results header has only the count — `web/app/(public)/jobs/page.tsx:79-83`.
- **Fix:** move the sort select to the results header (functionally present, wrong place).

### B14 `[true]` Template detail — metadata strip removed
- **Design:** Format / Pages / Last updated / Downloads strip inside the What's-Inside card — `plan/design/screens-main.jsx:638`.
- **Build:** `WhatsIncluded` renders heading + bullets only — `web/components/templates/WhatsIncluded.tsx:20`.
- **Fix:** add a Format / Last updated / Downloads footer (Pages unavailable per schema).

### B15 `[choice]` Template detail — "notify on revision" affordance downgraded
- **Design:** email + "Notify" submit button + success/error microcopy — `plan/design/screens-main.jsx:662`.
- **Build:** a bare optional email input on the download panel, no submit/feedback — `web/components/templates/TemplateDownloadPanel.tsx:71`.
- **Fix:** restore the standalone notify CTA + confirmation copy if parity desired (functional reinterpretation otherwise acceptable).

### B16–B19 `[choice]` JobCard / ExpertCard restructures
- **JobCard** header reordered + skills moved to own row + explicit "View job" button replacing whole-card link, plus an added `SaveButton` — `web/components/jobs/JobCard.tsx:12-65` vs `plan/design/ui.jsx:542-562`. Largely intentional (stories jobs-10/15).
- **ExpertCard** availability moved to bottom row (`ExpertCard.tsx:71-84`); featured shown as a "Verified" text tag + a "View profile" button + "Unavailable"/"New" copy (`ExpertCard.tsx:33-37,56-57,83`) vs the prototype's bare verified icon + whole-card link + "Busy" (`ui.jsx:578,586`).
- **Fix:** mostly accept as evolution; align copy ("Busy" vs "Unavailable") if exact parity wanted.

---

## Severity C — Design-system / rule

### C1 `[true]` Hero stat-strip numbers use Fraunces, should be Inter
- **Design:** `.stat-num { font-family: var(--font-heading) }` (Inter) — `plan/design/styles.css:808-813`; §1.3 lists stat numbers under Inter.
- **Build:** `font-display` (Fraunces) — `web/components/home/Hero.tsx:17`.
- **Fix:** `font-display` → `font-heading`.

### C2 `[true]` Homepage stats-row numbers use Fraunces, should be Inter
- **Build:** `font-display` — `web/components/home/HomeStats.tsx:25`. Same rule as C1.
- **Fix:** `font-display` → `font-heading`. (Numbers are correctly dark `text-text`, so §4.1 is satisfied — only the family is wrong.)

### C3 `[true]` Testimonials blockquote uses IBM Plex, should be Fraunces
- **Design:** `.testimonial blockquote { font-family: var(--font-display) }` — `plan/design/styles.css:2661-2662`; §3.6 #5 + §1.3 both explicitly mandate Fraunces here.
- **Build:** `font-body` — `web/components/home/Testimonials.tsx:45`.
- **Fix:** `font-body` → `font-display`. (Note: this is the one beat where §1.3 overrides the "Fraunces = H1 only" rule.)

### C4 `[true]` ExpertCard specialization tags use outline-green instead of neutral
- **Design:** `<span className="tag tag-neutral">` — `plan/design/ui.jsx:590`.
- **Build:** `<Tag variant="outline-green">` — `web/components/experts/ExpertCard.tsx:65` (outline-green is reserved for the article-detail keyword row).
- **Fix:** change variant to `neutral`.

### C5 `[true]` Article detail — orange accent pull-quote variant missing
- **Design:** two callouts — green-bordered `<blockquote>` AND an orange-bordered `.pull-quote` div — `plan/design/styles.css:911-913` (`border-left: 4px solid var(--color-accent)`).
- **Build:** both MDX `blockquote` and `PullQuote` use `border-primary` (green) — `web/components/.../components.tsx:27` + `PullQuote.tsx:9`. The orange variant doesn't exist.
- **Fix:** give `PullQuote` an accent/orange left border + tint to restore the two-weight distinction.

### C6 `[true]` Seeker dashboard — missing 'interview' status pill
- **Design:** four statuses incl. `interview: { label: "Interview" }` — `plan/design/screens-dashboard.jsx:97-102`.
- **Build:** only submitted / reviewed / rejected; `interview` absent repo-wide (grep-confirmed) — `web/components/dashboard/SeekerDashboard.tsx:37-41`.
- **Fix:** add an `interview` entry once the application-status schema supports it.

### C7 `[justified]` TemplateCard / detail — page count dropped
- **Design:** "{pages} pages · {downloads} downloads" — `plan/design/ui.jsx:431`, handoff §3.2.
- **Build:** downloads only — `web/components/templates/TemplateCard.tsx:42`. **Justified:** the `resources` schema has no `pages` column (`TECHNICAL-REQUIREMENTS.md:115`) and §8 wins ties.

### C8 `[justified]` Jobs listing — "Remote-friendly only" toggle dropped
- **Design:** remote toggle filtering `j.remote` — `plan/design/screens-jobs.jsx:75-81`.
- **Build:** none; comment cites no schema column — `web/components/jobs/JobsFilterSidebar.tsx:4`. **Justified:** `jobs` table has no `remote` column (`TECHNICAL-REQUIREMENTS.md:127`). (Contrast A1: the experts justification was false; this one is real.)

### C9 `[justified]` Token — `--color-tag-neutral-text` darkened for WCAG AA
- **Design:** `#6B7280` — `plan/design/styles.css:30`.
- **Build:** `#4b5563` with an inline a11y comment — `web/app/globals.css:37`. **Justified** accessibility override.

---

## Severity D — Copy / cosmetic

- **D1 Footer Explore** omits Jobs + Experts now that they're live — `web/components/chrome/Footer.tsx:8-13` vs `plan/design/ui.jsx:189-190`. Add them.
- **D2 ValueStrip** left-edge accent is amber (`border-accent`) vs prototype green primary — `web/components/home/ValueStrip.tsx:8` vs `plan/design/styles.css:2528-2529`. (Spec §3.6 #2 only says "left-edge accent" — confirm intended color.)
- **D3 Category page** drops the sub-copy and uses a generic "Knowledge Hub" overline instead of `cat.label` — `web/app/(public)/blog/category/[category]/page.tsx:83` vs `plan/design/screens-blog.jsx:309,311`.
- **D4 Article detail** header author chip lacks the bordered-pill chrome — `web/components/blog/AuthorChip.tsx:27` vs `.header-author-chip` `plan/design/styles.css:3081+`.
- **D5 About** newsletter stat reads "4,200+" vs prototype "4.2k" (violates §5.2 "never round thousands" feel) — `web/app/(public)/about/page.tsx:55` vs `plan/design/screens-main.jsx:896`.
- **D6 ServiceCard** "Learn more" is an anchor, not a ghost button — `web/components/services/ServiceCard.tsx:22-30` vs `plan/design/ui.jsx:444`.
- **D7 Seeker dashboard** saved-job CTA reads "View & apply" + shows location not salary — `web/components/dashboard/SeekerDashboard.tsx:160-168`.
- **D8 Employer dashboard** posted-jobs row drops "Posted {time}" sub + eye/edit/trash icon actions (shows applicant count + "Close") — `web/components/dashboard/EmployerDashboard.tsx:106-120`.
- **D9 Jobs listing** salary slider has no live LPA readout — `web/components/jobs/JobsFilterSidebar.tsx:65-76` vs `plan/design/screens-jobs.jsx:70-73` (SSR-form tradeoff).
- **D10 Job detail** CTA "Apply now" vs design "Apply for this job" — `web/components/jobs/ApplyButton.tsx:63`.
- **D11 ConsultationModal** success uses a left-border banner, not the centered check-circle — `web/components/consultation/ConsultationForm.tsx:81-88`.
- **D12 Expert detail** quick-stats aside reorders + conditionally hides rating/reviews/response-time rows — `web/app/(public)/experts/[id]/page.tsx:161-201` (graceful "New" handling).
- **D13 Jobs/Experts listing** add a free-text Location filter not in the prototype — `JobsFilterSidebar.tsx:59-62`, `ExpertsFilterSidebar.tsx:53-63` (acceptable enhancement).

---

## Intentional / documented — NOT deviations

These differ from the prototype but are correct by the design contract or were deliberate decisions — listed so they aren't re-flagged:

- **Register single form** (not the prototype's two-step wizard) — handoff §4.11.
- **Dashboards: one route per role + tabbed shell** (vs the prototype's single role-switch route) — story-auth-07, with active `aria-current` wiring (an improvement).
- **Single hero layout** (editorial) — production drops the tweaks panel; editorial is the documented default (§4.9).
- **Auth pages have no Navbar/Footer** — intentional, client-rendered (§7).
- **Numbered pagination on blog/category** (vs load-more) — framed as intentional for back-button/SEO (blog-01 AC#10); confirm this supersedes the prototype's load-more.
- **2-col card grids** on jobs/experts (vs the prototype's one-off vertical job column) — aligns with handoff §3.5 "card grid (2-col on desktop)".
- **Production hardening added everywhere:** Turnstile, Zod validation, email verification + resend, reset-confirm flow, modal focus-traps, role-aware Apply/Contact CTAs, Save buttons, real avatar/resume uploads. All additive.
- **`StatsRow` reimplemented as `HomeStats` + `CountUp`** — exists with count-up animation (`web/components/home/HomeStats.tsx`, `CountUp.tsx`); the earlier "missing" flag was a false alarm.

---

## Recommended triage order

1. **Fix the false-justified regressions first** — A1 (verified toggle) + A2 (experts sort). The code comment claiming "no rating column" is wrong; these are easy wins on existing schema.
2. **Restore listing controls** — A3/A4 (templates sort + newsletter), A6/A7 (blog featured slot + popular tags), B13 (jobs sort placement).
3. **Decide the search model** — A8: in-page `?q=` filter vs delegating to `/search`. Product call.
4. **Typography sweep** — C1/C2/C3 (Fraunces↔Inter on stat numbers + testimonials) + C4/C5 (tag variant + orange pull-quote). Small, high-polish.
5. **Modal polish** — B1 (`modal-pop` keyframe, systemic) + B2 (PostJob success state).
6. **Dashboard data** — A5 + B7/B8/B9/B10 depend on modeling profile-views / match-score / time-to-hire / engagements. Group as one "dashboard metrics" story; "—" placeholders are deliberate until then.
7. **Cosmetic batch (D1–D13)** — sweep in one pass.

**Justified items (C7, C8, C9) need no code change** — note them in the handoff so they aren't re-raised.
