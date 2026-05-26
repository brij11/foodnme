# UI Design Handoff — foodnme

> The UI design contract: design system, IA, component inventory, and the rationale behind each design decision.
> **Companion docs:** `PRODUCT.md` (what we're building) · `TECHNICAL-REQUIREMENTS.md` (implementation rules).
> Where this doc and `TECHNICAL-REQUIREMENTS.md` disagree on a rule, the tech-spec wins; this doc keeps the rationale.

---

## 1. Design system

Built on the **Fresh Sustainability Minimal** palette defined in `design/FoodTech_Theme_Fresh_Sustainability_Minimal (1).md`. The prototype reflects that system, plus a few refinements documented below.

### 1.1 Color usage — refined

The original system specifies primary green for "CTAs, links, navigation active states, primary buttons". During design we found this was being over-applied (logo, stat numbers, overlines, service icons all in green). We **rebalanced** so green now appears **only on actionable elements**:

| Green is for | Neutral (text-color) is for |
|---|---|
| Primary buttons (CTAs) | Logo wordmark |
| Active sidebar category | Stat numbers (homepage, hero, services credibility) |
| Active nav link underline | Service-card icons |
| Focus rings + form input focus | Overlines (with 62% opacity) |
| Reading progress bar | Author avatars |
| Hero italic emphasis word ("safer") | |
| Step number circles | |
| Newsletter "live" pulsing dot | |

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 1.2 Tag color rotation

To avoid every article/template card showing the same green category tag, **categories rotate through tag variants**:

```js
// Articles
food-safety       → tag-green
quality-control   → tag-safe
regulatory        → tag-orange
processing        → tag-neutral
industry-insights → tag-accent

// Templates
haccp             → tag-green
audit-checklists  → tag-safe
sop-templates     → tag-neutral
qc-inspection     → tag-orange
compliance-docs   → tag-accent
```

This is encoded as `tag: "green|safe|orange|neutral|accent"` on each category in `data.jsx`. Card components read it and apply `tag tag-{variant}`.

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 1.3 Typography hierarchy

- **Fraunces** — Hero H1s ONLY. One per page. Used on: homepage hero, page-header pages, article-detail H1, About hero, testimonials, newsletter heading.
- **Inter** — All UI: nav, buttons, tags, card titles (h-card), section heads (h-section), stat numbers, overlines, form labels.
- **IBM Plex Sans** — All body and reading content. Articles, descriptions, captions, nav links.
- **IBM Plex Mono** — Reserved (not currently used). For code/formula blocks in articles.

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 1.4 Spacing / radius

Standard scale from theme: `--sp-1` through `--sp-16`, `--radius-sm/md/lg/xl/full`. No deviations.

### 1.5 Shadows

`--shadow-card` for hover elevation. `--shadow-dropdown` for menus. `--shadow-elevated` for modals. Subtle by design — heavy shadows clash with the editorial tone.

---

## 2. Information architecture

### 2.1 Top nav order

1. **About Us** (intentionally first — orients newcomers before they hit catalog screens)
2. Knowledge Hub
3. Templates
4. Jobs
5. Experts
6. Services

The "Get a Consultation" primary CTA stays at the far right alongside Sign in / Account menu.

**Sprint-1 rollout note (added 2026-05-23):** the nav renders all six items from the start, but **Jobs** and **Experts** ship as visible-but-disabled "coming soon" links until their Sprint-2 surfaces land — so the nav's shape never changes for returning visitors. The disabled state uses muted text, `cursor: not-allowed`, no underline-grow hover, and `aria-disabled="true"`.

### 2.2 Footer columns

- **Brand** (logo + 1-sentence positioning)
- **Explore** (all main sections including About)
- **Topics** (4 blog categories — deep links)
- **Contact** (email, LinkedIn, Newsletter)

### 2.3 Cross-linking conventions

- Every blog category in the article header is **clickable** → category filter page
- In-article CTAs link to relevant templates (manually mapped per article in admin)
- Template detail → "Request customization" → Services inquiry
- Apply / Contact modals route back to the matching dashboard tab on success

---

## 3. Component inventory

All components live in `ui.jsx` unless noted otherwise.

### 3.1 Primitives

| Component | Purpose |
|---|---|
| `<Brand size>` | "foodnme" wordmark with accent dot |
| `<Navbar>` | Sticky top nav with scrolled state, mobile drawer, reading-progress edge |
| `<Footer>` | Multi-column footer |
| `<Icon name size stroke>` | Inline SVG icon library — 23 icons total |
| `<Link to>` | Hash-router-aware link |
| `<Reveal delay>` | Scroll-triggered fade-up using IntersectionObserver |
| `<CountUp value duration format>` | Number animation, triggers on viewport entry |
| `<EmptyState variant title message action>` | Empty-results state with illustration variants: `search`, `filter`, `inbox` |
| `<Toast show message>` | Transient bottom-center notification |
| `<Breadcrumb items>` | Standard breadcrumb trail |
| `<PillRow items active onChange>` | Horizontal scrolling pill filter (legacy — most listings now use sidebar) |
| `<SearchInput value onChange placeholder>` | Input with leading search icon |

### 3.2 Cards

| Component | Used on |
|---|---|
| `<ArticleCard article compact>` | Blog listing, Category, Related articles, Homepage |
| `<TemplateCard template onDownload>` | Templates listing, Template detail similar, Homepage |
| `<ServiceCard service onClick>` | Services page, Homepage snapshot |
| `<JobCard job>` | Jobs listing, Job detail similar |
| `<ExpertCard expert>` | Experts listing, Expert detail similar |
| `<StatsRow stats>` | Homepage testimonials block, Services credibility, About |

**Template card decision:** the card was originally a 2-button layout (Preview + Download), which became visually noisy at scale (12+ buttons in a 6-card grid). Final design:

- Whole card is a `<Link>` to the template detail page (acts as "Preview")
- A single **round icon-button in the top-right corner** triggers download (with hover tooltip "Download template", turns green on hover, calls `stopPropagation` to not navigate)
- Bottom row consolidated: `"{pages} pages · {downloads} downloads"` on left, `"View →"` ghost affordance on right (arrow grows on card hover)

### 3.3 Auth + role-based UI

| Component | Purpose |
|---|---|
| `<AuthProvider>` | localStorage-backed fake auth context (`user`, `signIn`, `register`, `signOut`) |
| `<AccountMenu>` | Navbar dropdown — shows initials avatar, name, role badge, dashboard link, sign out |
| `<RouterProvider>` | Hash-based client router |

Production replaces `AuthProvider` with Supabase Auth via `@supabase/ssr` (`TECHNICAL-REQUIREMENTS.md` §5).

### 3.4 Modals & overlays

| Component | Trigger | Purpose |
|---|---|---|
| `<ConsultationModal>` | Nav CTA "Get a Consultation" | Lead-gen form: name, phone, work email, company, service dropdown, message |
| `<ApplyModal>` | Job detail "Apply for this job" | Resume drag-drop upload (PDF/DOCX) + cover note |
| `<ContactExpertModal>` | Expert detail "Contact {name}" | Engagement-type picker + inquiry message |
| `<PostJobModal>` | Employer dashboard "Post a new job" | Full job posting form with admin-review confirmation |

All modals share:
- Backdrop with blur + click-outside-to-close
- Escape key handler
- Body-scroll lock while open
- Animated entry (`modal-pop` keyframe — scale + opacity)
- Two-state pattern: form state → success state (with check-circle illustration)
- Close button top-right (`modal-close` class)

### 3.5 Listing layout

Shared by Blog, Category, Templates, Jobs, Experts. Originally built as horizontal pill-row filters; **replaced with sidebar layout** because:

- Pills don't scale beyond 5–6 categories
- Sidebar gives more affordance for multi-select filters (job type, experience, specializations)
- Mobile pattern: sidebar collapses into a bottom-sheet filter drawer

Sidebar contains: search input → category list with counts → secondary filters (checkboxes / slider / toggles) → "Clear all filters" button → mini newsletter (on Blog/Category only).

Main column: result count + sort dropdown → card grid (2-col on desktop) → load-more button.

The legacy `<PillRow>` component is kept for future use (e.g. featured-categories row on homepage) but not currently rendered anywhere.

### 3.6 Homepage — narrative sections

The homepage was redesigned away from a directory of card grids ("look at everything") to a narrative arc:

1. Hero
2. Value strip (one-sentence positioning, left-edge accent)
3. **Scenarios** — 4 user-need framings ("Audit on Monday?", "Hiring a QC microbiologist?") each linking to the matching product
4. **Editorial feature + latest rail** — under the "From the Knowledge Hub" header (overline "This week's read", "All articles → /blog" link): ONE large article preview (image left, content right), *not* a 3-card grid, accompanied by a compact **"Latest from the blog" rail** — the 4 most-recent published articles as plain title links (`published_at desc`) — so visitors can browse onward without leaving the narrative. (Rail added 2026-05-26; owned by `story-homepage-04`, feature by `story-homepage-06`.)
5. **Testimonials** — 2 large blockquotes on cream background, with Fraunces type and accent-color quote marks
6. **Stats row** — moved here as mid-page social proof
7. **Featured this week** — paired hero cards (one template + one expert, color-accent strips on top)
8. Final CTA (consultation)
9. **Good to know** — Q&A interlude (asymmetric 2-col layout: sticky intro left, numbered Q&A list right) — explicitly placed between two CTAs to prevent action fatigue
10. Newsletter

### 3.7 Article detail (deep screen)

Extra polish vs. other screens:

- **Reading progress** lives on the navbar's bottom edge (via `--reading-progress` CSS variable updated on scroll), not a separate stripe
- **Author chip** in the header — pill containing avatar, name, role, date, plus LinkedIn + Twitter icons
- **Article body** uses Fraunces only for the H1; H2/H3 are Inter, body is IBM Plex Sans
- **Pull-quote** with primary-green left border on `<blockquote>`
- **Accent pull-quote** with orange left border on `.pull-quote` div (different visual weight)
- **In-article CTA box** — surface-light card with overline + body + primary button → links to relevant template
- **Tags row** below article body (outline-green pill style)
- **Share row** — copy link / LinkedIn / Twitter / Email buttons
- **Prominent author bio card** at bottom — 96px avatar (cream background, dark text), role highlight in muted color, full bio, large LinkedIn + Twitter circle buttons with brand-color hover (#0a66c2 for LinkedIn, dark for Twitter), article count, contact email
- **Related articles** — 3-card grid below

### 3.8 Dashboards — role-aware

Single `<DashboardPage role>` component dispatches to:

- **`<SeekerDashboard>`** — 4 stat cards (Applications, Saved, Profile views, Match score) + Applications table with status pills (`submitted`/`reviewed`/`interview`/`rejected`) + Saved jobs list with Apply CTAs
- **`<EmployerDashboard>`** — 4 stat cards (Active listings, Total applicants, Pending review, Avg. time to hire) + Posted jobs table with status + Recent applicants list with match scores + **Post-a-job modal**
- **`<ExpertDashboard>`** — Availability toggle (custom switch component) + 4 stat cards + **inline profile editor** (avatar, name, title, location, years, hourly rate, bio, clickable specialization tags) + Recent inquiries list with unread state

All dashboards share a left sidebar with user-block + nav buttons + "Back to site" + Sign out.

---

## 4. Key design decisions

> Why these things look the way they do, in case anyone is tempted to "improve" them and breaks the rationale.

### 4.1 Logo and stat numbers are dark, not green

The theme says primary green for "key UI elements". Taken literally, this puts green on ~10 high-weight elements per page. We rebalanced so **green only signifies action** — logo + stat numbers + service icons + overlines are dark olive (`--color-text`).

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 4.2 Templates do not say "Free"

Originally every template card had a `<Free>` accent tag. Removed because some templates will be paid in a future iteration. The data schema still has `is_free boolean` — UI just doesn't render the "Free" badge when `is_free === true`. When paid templates land, render a "₹{price}" badge for `is_free === false`.

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 4.3 No emoji anywhere

Per the design-system "Do/Don't" list. The pulsing "live" dot on the newsletter badge is purely CSS.

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 4.4 No gradient backgrounds

Per design-system rules. The hero uses radial-gradient *soft tints* for blob shapes only — these are decorative atmospheric color washes, not surfaces. All actual surfaces are flat.

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 4.5 No hand-drawn SVG illustrations beyond simple geometry

Empty states use minimal geometric shapes (circle, rect, line) plus 2–3 accent dots. No icon-as-illustration drawings.

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 4.6 Reading progress bar is the navbar edge

A floating stripe under the navbar created visual noise. Moved to be the navbar's **own bottom border**, growing left-to-right as you scroll. Article-detail page sets `--reading-progress: N%` on `:root` via `useReadingProgress()` hook; the navbar's `::after` pseudo-element reads it.

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 4.7 Consultation modal vs. /services inquiry form

The services page has a long inquiry form. We **also** added a Consultation Modal triggered from the global nav CTA — same fields, but inside a modal for quicker conversion from any page. Both submit to the same `/api/inquiry` endpoint (`TECHNICAL-REQUIREMENTS.md` §6.2).

### 4.8 Homepage is narrative, not catalog

See §3.6. The single biggest design decision in the prototype.

### 4.9 Variations exposed via Tweaks

Three tweakable params for design-time exploration (production removes the Tweaks panel):

- `heroLayout`: `editorial` | `split` | `minimal` — three hero compositions
- `cardDensity`: `comfortable` | `compact` — card padding + line-clamp control
- `accent`: hex value — accent color override (default `#DDA15E`)

These are stored in a JSON block between `/*EDITMODE-BEGIN*/` / `/*EDITMODE-END*/` markers in `app.jsx`.

### 4.10 Animation policy

All animations respect `prefers-reduced-motion`. Animations used:

| Where | What | Why |
|---|---|---|
| Hero | Staggered fade-up on load | Sets tone |
| Hero collage | Continuous gentle float | Visual interest without being a video |
| Stat numbers | Count-up from 0 | Highlights impact metrics |
| Cards entering grids | Stagger-up (80ms per child) | Implies content loading |
| Filter changes | Re-stagger via `key=` reset | Confirms state change |
| Section headers | Scroll-reveal fade-up | Reading rhythm |
| Primary buttons | Shine sweep on hover | Subtle premium touch |
| Ghost links | Underline grow on hover | Editorial feel |
| Newsletter "live" dot | Slow pulse | "Active" signal |

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 4.11 Register is a single form, not the prototype's two-step wizard

The prototype `RegisterPage` (`design/screens-auth.jsx`) is a two-step wizard
(details → role picker). Production collapses this into a **single form** — name,
email, password, and an inline role-card picker, one "Sign Up" button. The
two-step split added friction with no payoff for a four-field form; the role
cards' visual treatment is retained. `signUp()` fires once on submit.

→ Story: story-auth-02.

---

## 5. Content & copy patterns

### 5.1 Voice

Conversational + concrete. "Practical resources for a safer food ecosystem." "Pick the thing you came here for." "We respond within 24 hours. No commitment required."

Avoid: "leverage", "unlock", "revolutionize", "ecosystem of solutions", any sentence with the word "seamless".

### 5.2 Stats

Real-feeling, modest numbers: "120+", "48", "85+", "4.2k". Never round numbers like "1000+" or "10000+". If a number doesn't have a real origin, prefix or suffix it (`+`, `k`) to convey approximation.

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.

### 5.3 Testimonial format

First name + last initial. Job title + segment (e.g. "QA Manager, mid-sized dairy" — not "QA Manager at Acme Corp."). Avoids fabricating company names while still conveying credibility.

### 5.4 Empty states

Always three parts: title (what happened) + message (what to do about it) + action button (do it). Never bare "No results."

→ Enforced in `TECHNICAL-REQUIREMENTS.md` §8.
