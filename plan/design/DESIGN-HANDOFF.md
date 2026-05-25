# foodnme — Prototype Handoff

> Companion to `FoodTech_Hub_Project_Blueprint.md`.
> The blueprint defines **what to build**. This document describes **what was built in the prototype** — components, design decisions, copy patterns, and edge cases that emerged during design. Feed this into Claude Code (alongside the blueprint) when implementing the production Next.js app.

---

## 1. Project at a glance

- **Name:** foodnme
- **Tagline:** Practical resources for a safer food ecosystem
- **Positioning:** Niche knowledge + community platform for Indian food-technology professionals
- **Tone:** Calm, credible, quietly opinionated. Editorial, not corporate.
- **Phase 1 + Phase 2** both prototyped in a single HTML/React/Babel artifact.

### Pages built (15 screens)

| # | Route | Screen | Phase |
|---|---|---|---|
| 1 | `/` | Homepage | 1 |
| 2 | `/blog` | Knowledge Hub listing | 1 |
| 3 | `/blog/:slug` | Article detail (deep screen) | 1 |
| 4 | `/blog/category/:slug` | Category-filtered listing | 1 |
| 5 | `/templates` | Templates listing | 1 |
| 6 | `/templates/:slug` | Template detail | 1 |
| 7 | `/services` | Services + inquiry form | 1 |
| 8 | `/about` | About Us | added post-spec |
| 9 | `/login` | Sign in | 2 |
| 10 | `/register` | Register (with role picker) | 2 |
| 11 | `/reset-password` | Password reset | 2 |
| 12 | `/jobs` | Jobs board listing | 2 |
| 13 | `/jobs/:id` | Job detail + apply modal | 2 |
| 14 | `/experts` | Expert directory listing | 2 |
| 15 | `/experts/:id` | Expert profile + contact modal | 2 |
| 16 | `/dashboard/:role` | Role-aware dashboard (seeker / employer / expert) | 2 |

---

## 2. Design System

Built on the **Fresh Sustainability Minimal** palette defined in `FoodTech_Theme_Fresh_Sustainability_Minimal.md`. The prototype reflects that system, plus a few refinements documented here.

### 2.1 Color usage — refined

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

### 2.2 Tag color rotation

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

### 2.3 Typography hierarchy

Follows the blueprint exactly:

- **Fraunces** — Hero H1s ONLY. One per page. Used on: homepage hero, page-header pages, article-detail H1, About hero, testimonials, newsletter heading.
- **Inter** — All UI: nav, buttons, tags, card titles (h-card), section heads (h-section), stat numbers, overlines, form labels.
- **IBM Plex Sans** — All body and reading content. Articles, descriptions, captions, nav links.
- **IBM Plex Mono** — Reserved (not currently used). For code/formula blocks in articles.

### 2.4 Spacing / radius

Standard scale from blueprint (`--sp-1` through `--sp-16`, `--radius-sm/md/lg/xl/full`). No deviations.

### 2.5 Shadows

`--shadow-card` for hover elevation. `--shadow-dropdown` for menus. `--shadow-elevated` for modals. Subtle by design — heavy shadows clash with the editorial tone.

---

## 3. Information Architecture

### 3.1 Navigation order (top nav)

1. **About Us** (intentionally first — orients newcomers before they hit catalog screens)
2. Knowledge Hub
3. Templates
4. Jobs
5. Experts
6. Services

The "Get a Consultation" primary CTA stays at the far right alongside Sign in / Account menu.

### 3.2 Footer columns

- **Brand** (logo + 1-sentence positioning)
- **Explore** (all main sections including About)
- **Topics** (4 blog categories — deep links)
- **Contact** (email, LinkedIn, Newsletter)

### 3.3 Cross-linking conventions

- Every blog category in the article header is **clickable** → category filter page
- In-article CTAs link to relevant templates (manually mapped per article in admin)
- Template detail → "Request customization" → Services inquiry
- Apply / Contact modals route back to the matching dashboard tab on success

---

## 4. Component Inventory

All components live in `ui.jsx` unless noted otherwise.

### 4.1 Primitives

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

### 4.2 Cards

| Component | Used on |
|---|---|
| `<ArticleCard article compact>` | Blog listing, Category, Related articles, Homepage |
| `<TemplateCard template onDownload>` | Templates listing, Template detail similar, Homepage |
| `<ServiceCard service onClick>` | Services page, Homepage snapshot |
| `<JobCard job>` | Jobs listing, Job detail similar |
| `<ExpertCard expert>` | Experts listing, Expert detail similar |
| `<StatsRow stats>` | Homepage testimonials block, Services credibility, About |

#### Key card decision — Template card

The card was originally a 2-button layout (Preview + Download), which became visually noisy at scale (12+ buttons in a 6-card grid). **Final design:**

- Whole card is a `<Link>` to the template detail page (acts as "Preview")
- A single **round icon-button in the top-right corner** triggers download (with hover tooltip "Download template", turns green on hover, calls `stopPropagation` to not navigate)
- Bottom row consolidated: `"{pages} pages · {downloads} downloads"` on left, `"View →"` ghost affordance on right (arrow grows on card hover)

### 4.3 Auth + role-based UI

| Component | Purpose |
|---|---|
| `<AuthProvider>` | localStorage-backed fake auth context (`user`, `signIn`, `register`, `signOut`) |
| `<AccountMenu>` | Navbar dropdown — shows initials avatar, name, role badge, dashboard link, sign out |
| `<RouterProvider>` | Hash-based client router (production should use Next.js App Router) |

In production: replace `AuthProvider` with Supabase Auth context, use `@supabase/auth-helpers-nextjs`, gate `/dashboard/*` and `/admin/*` via `middleware.ts`.

### 4.4 Modals & overlays

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

### 4.5 Listing layout (shared by Blog, Category, Templates, Jobs, Experts)

Originally built as horizontal pill-row filters. **Replaced with sidebar layout** because:
- Pills don't scale beyond 5-6 categories
- Sidebar gives more affordance for multi-select filters (job type, experience, specializations)
- Mobile pattern: sidebar collapses into a bottom-sheet filter drawer

Sidebar contains: search input → category list with counts → secondary filters (checkboxes / slider / toggles) → "Clear all filters" button → mini newsletter (on Blog/Category only).

Main column: result count + sort dropdown → card grid (2-col on desktop) → load-more button.

The legacy `<PillRow>` component is kept for future use (e.g. featured-categories row on homepage) but not currently rendered anywhere.

### 4.6 Homepage — narrative sections

The homepage was redesigned away from a directory of card grids ("look at everything") to a narrative arc:

1. Hero
2. Value strip (one-sentence positioning, left-edge accent)
3. **Scenarios** — 4 user-need framings ("Audit on Monday?", "Hiring a QC microbiologist?") each linking to the matching product
4. **Editorial feature** — ONE large article preview (image left, content right), not a 3-card grid
5. **Testimonials** — 2 large blockquotes on cream background, with Fraunces type and accent-color quote marks
6. **Stats row** — moved here as mid-page social proof
7. **Featured this week** — paired hero cards (one template + one expert, color-accent strips on top)
8. Final CTA (consultation)
9. **Good to know** — Q&A interlude (asymmetric 2-col layout: sticky intro left, numbered Q&A list right) — explicitly placed between two CTAs to prevent action fatigue
10. Newsletter

### 4.7 Article Detail (deep screen)

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

### 4.8 Dashboards — role-aware

Single `<DashboardPage role>` component dispatches to:

- **`<SeekerDashboard>`** — 4 stat cards (Applications, Saved, Profile views, Match score) + Applications table with status pills (`submitted`/`reviewed`/`interview`/`rejected`) + Saved jobs list with Apply CTAs
- **`<EmployerDashboard>`** — 4 stat cards (Active listings, Total applicants, Pending review, Avg. time to hire) + Posted jobs table with status + Recent applicants list with match scores + **Post-a-job modal**
- **`<ExpertDashboard>`** — Availability toggle (custom switch component) + 4 stat cards + **inline profile editor** (avatar, name, title, location, years, hourly rate, bio, clickable specialization tags) + Recent inquiries list with unread state

All dashboards share a left sidebar with user-block + nav buttons + "Back to site" + Sign out.

---

## 5. Key Design Decisions

> Why these things look the way they do, in case Claude Code is tempted to "improve" them and breaks the rationale.

### 5.1 Logo and stat numbers are dark, not green

The blueprint says primary green for "key UI elements". Taken literally, this puts green on ~10 high-weight elements per page. We rebalanced so **green only signifies action** — logo + stat numbers + service icons + overlines are dark olive (`--color-text`).

### 5.2 Templates do not say "Free"

Originally every template card had a `<Free>` accent tag. Removed because some templates will be paid in a future phase. The data schema still has `is_free boolean` per the blueprint — UI just doesn't render the "Free" badge when `is_free === true`. When paid templates land, render a "₹{price}" badge for `is_free === false`.

### 5.3 No emoji anywhere

Per the design-system "Do/Don't" list. The pulsing "live" dot on the newsletter badge is purely CSS.

### 5.4 No gradient backgrounds

Per design-system rules. The hero uses radial-gradient *soft tints* for blob shapes only — these are decorative atmospheric color washes, not surfaces. All actual surfaces are flat.

### 5.5 No hand-drawn SVG illustrations beyond simple geometry

Empty states use minimal geometric shapes (circle, rect, line) plus 2-3 accent dots. No icon-as-illustration drawings.

### 5.6 Reading progress bar is the navbar edge

A floating stripe under the navbar created visual noise. Moved to be the navbar's **own bottom border**, growing left-to-right as you scroll. Article-detail page sets `--reading-progress: N%` on `:root` via `useReadingProgress()` hook; the navbar's `::after` pseudo-element reads it.

### 5.7 Consultation modal vs. /services inquiry form

The blueprint's services page has a long inquiry form. We **also** added a Consultation Modal triggered from the global nav CTA — same fields, but inside a modal for quicker conversion from any page. Both submit to the same `/api/inquiry` endpoint.

### 5.8 Homepage is narrative, not catalog

See section 4.6. The single biggest design decision in the prototype.

### 5.9 Variations exposed via Tweaks

Three tweakable params for design-time exploration (production should remove the Tweaks panel):

- `heroLayout`: `editorial` | `split` | `minimal` — three hero compositions
- `cardDensity`: `comfortable` | `compact` — card padding + line-clamp control
- `accent`: hex value — accent color override (default `#DDA15E`)

These are stored in a JSON block between `/*EDITMODE-BEGIN*/` / `/*EDITMODE-END*/` markers in `app.jsx`.

### 5.10 Animation policy

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

---

## 6. Content & Copy Patterns

### 6.1 Voice

Conversational + concrete. "Practical resources for a safer food ecosystem." "Pick the thing you came here for." "We respond within 24 hours. No commitment required."

Avoid: "leverage", "unlock", "revolutionize", "ecosystem of solutions", any sentence with the word "seamless".

### 6.2 Stats

Real-feeling, modest numbers: "120+", "48", "85+", "4.2k". Never round numbers like "1000+" or "10000+". If a number doesn't have a real origin, prefix or suffix it (`+`, `k`) to convey approximation.

### 6.3 Testimonial format

First name + last initial. Job title + segment (e.g. "QA Manager, mid-sized dairy" — not "QA Manager at Acme Corp."). Avoids fabricating company names while still conveying credibility.

### 6.4 Empty states

Always three parts: title (what happened) + message (what to do about it) + action button (do it). Never bare "No results."

---

## 7. Data Models (prototype shape)

These mirror the Supabase schemas in the blueprint, with a few fields added for the UI to render. Production should store the rendering-only fields client-side or derive them.

```ts
type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: 'food-safety' | 'quality-control' | 'regulatory' | 'processing' | 'industry-insights';
  categoryLabel: string;        // ← derived
  readTime: number;             // minutes
  publishedAt: string;          // display string e.g. "May 12, 2026"
  author: string;
  authorRole: string;
  tags: string[];
  cover: string;                // image URL
  featured?: boolean;
}

type Template = {
  slug: string;
  title: string;
  description: string;
  category: 'haccp' | 'audit-checklists' | 'sop-templates' | 'qc-inspection' | 'compliance-docs';
  categoryLabel: string;
  fileType: 'PDF' | 'DOCX';
  pages: number;
  downloads: number;
  updatedAt: string;
  sections: string[];           // "What's inside this template" bullets
  // is_free omitted in prototype — re-add for paid templates
}

type Job = {
  id: string;
  title: string;
  company_name: string;
  company_initial: string;      // 2-letter logo abbreviation
  location: string;
  job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  remote: boolean;
  salary_min: number;           // INR per year
  salary_max: number;
  experience_level: 'Entry-level' | 'Mid-level' | 'Senior' | 'Lead';
  description: string;
  skills: string[];
  posted: string;               // "2 days ago"
  applications: number;
  featured?: boolean;
}

type Expert = {
  id: string;
  name: string;
  avatar: string;               // 2-letter initials
  title: string;
  location: string;
  experience_years: number;
  rate: string;                 // "₹6,000/hr"
  rating: number;               // 0-5
  reviews: number;
  specializations: string[];
  certifications: string[];
  bio: string;
  available: boolean;
  featured?: boolean;
}

type Author = {
  name: string;
  role: string;
  bio: string;
  linkedin: string;             // URL
  twitter: string;              // URL
  articleCount: number;
}

type User = {
  id: string;
  email: string;
  name: string;
  role: 'seeker' | 'employer' | 'expert';
}
```

---

## 8. File Inventory (prototype)

```
index.html              # Shell + script imports
styles.css              # All design tokens + component styles
data.jsx                # Static content (articles, templates, jobs, experts, authors)

tweaks-panel.jsx        # Design-time controls (REMOVE in production)
ui.jsx                  # Shared primitives + Navbar/Footer/cards/modals + Auth context

screens-main.jsx        # Homepage, Templates, Template detail, Services, About
screens-blog.jsx        # Blog listing, Article detail, Category page
screens-jobs.jsx        # Jobs listing, Job detail, Apply modal
screens-experts.jsx     # Experts listing, Expert detail, Contact modal
screens-auth.jsx        # Login, Register, Reset password
screens-dashboard.jsx   # Role-aware dashboards

app.jsx                 # Root app, router, screen dispatcher, Tweaks panel mount
```

---

## 9. Notes for production (Next.js 14 / Supabase)

### 9.1 Route mapping

| Prototype hash | Next.js App Router path |
|---|---|
| `#/` | `app/page.tsx` |
| `#/blog` | `app/(public)/blog/page.tsx` |
| `#/blog/:slug` | `app/(public)/blog/[slug]/page.tsx` |
| `#/blog/category/:slug` | `app/(public)/blog/category/[category]/page.tsx` |
| `#/templates` | `app/(public)/templates/page.tsx` |
| `#/templates/:slug` | `app/(public)/templates/[slug]/page.tsx` |
| `#/jobs` | `app/(public)/jobs/page.tsx` |
| `#/jobs/:id` | `app/(public)/jobs/[id]/page.tsx` |
| `#/experts` | `app/(public)/experts/page.tsx` |
| `#/experts/:id` | `app/(public)/experts/[id]/page.tsx` |
| `#/services` | `app/(public)/services/page.tsx` |
| `#/about` | `app/(public)/about/page.tsx` |
| `#/login` `#/register` `#/reset-password` | `app/(auth)/...` |
| `#/dashboard/:role` | `app/dashboard/[role]/page.tsx` |

### 9.2 Server-rendering

- Blog articles + template detail → **SSG** with `generateStaticParams` (per blueprint §15)
- Listing pages → **SSR** for filter state in URL searchParams
- Dashboards → **client + middleware-gated**

### 9.3 What to drop from the prototype

- `tweaks-panel.jsx` and the `<TweaksPanel>` mount in `app.jsx`
- The hash router — replace with App Router `<Link>` from `next/link`
- The localStorage `<AuthProvider>` — replace with Supabase Auth context
- Inline data in `data.jsx` — fetch from Supabase server-side
- The Unsplash image URLs — replace with images uploaded to Supabase Storage

### 9.4 What to keep

- All of `styles.css` (rename to `globals.css` and move into `app/`)
- Component structure in `ui.jsx`, `screens-*.jsx` — port one-to-one to TSX files in `components/`
- Animation classes (`.reveal`, `.stagger-grid`, `.frame-enter`, etc.)
- All CSS custom properties — same names work for Tailwind theme extension if you prefer Tailwind

### 9.5 API endpoint contracts (per blueprint §9)

- `POST /api/newsletter` — fired by every `<NewsletterBanner>` instance with `source` param
- `POST /api/inquiry` — fired by `<ConsultationModal>` AND the inline services-page form (both send the same payload shape)
- `POST /api/download` — fired by template download icon button; returns a 60-second signed URL
- `POST /api/jobs` — new endpoint for Phase 2: employer job posting (admin-review queue)
- `POST /api/applications` — Phase 2: seeker applying to a job
- `POST /api/expert-inquiry` — Phase 2: visitor contacting an expert
- `PATCH /api/experts/:id` — Phase 2: expert editing their own profile + availability toggle

---

## 10. Open questions for the founder

Things the prototype made placeholder decisions about — confirm before production:

1. **Author social URLs** — Each author has a `linkedin` + `twitter` URL in the data. Currently placeholders.
2. **Founder photo** — Used a stock photo on `/about` and `/services`. Swap for real.
3. **Real testimonials** — Currently fabricated short-attributed quotes. Replace with real ones (with permission) before launch.
4. **Stat numbers** — `120+ articles`, `48 templates`, `85+ businesses helped`, `4.2k subscribers`. These are illustrative. Confirm actuals before launch.
5. **Pricing for paid templates** — When introduced, decide on the badge style (`₹{price}` next to `Free`-removed slot, or a single "Premium" indicator).
6. **Expert engagement pricing** — Each expert detail shows three engagement types (Hourly / Project / Retainer). Confirm format and whether "Project-based" + "From ₹40,000/mo" stay generic.
7. **Newsletter mini-form on blog sidebar** — Currently uses the same `/api/newsletter` with `source: "blog-sidebar"`. Decide on actual source tagging granularity.

---

*Generated from the foodnme prototype, May 2026.*
