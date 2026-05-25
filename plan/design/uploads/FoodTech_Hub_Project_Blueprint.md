# FoodTech Hub — Complete Project Blueprint
> Single reference document for all planning, architecture, and screen design decisions.
> Use this with Claude Code (terminal) and Claude (design/UI) for all build sessions.

---

## 1. Platform Overview

**Platform Name:** FoodTech Hub
**Tagline:** Practical resources for a safer food ecosystem
**Type:** Full-stack Next.js web application
**Target Audience:** Food technology professionals, QA/QC managers, food safety auditors, students, consultants, and food businesses — primarily India, with global reach.

### Core Idea
A niche online platform dedicated to the Food Technology industry. A centralized place where professionals, students, and companies in the food sector can access knowledge, tools, jobs, and expert services related to food technology. Combines industry content, practical resources, and professional networking into one focused portal.

### Vision
To build a digital knowledge and resource hub for the food technology industry that supports learning, hiring, compliance, and consulting.

---

## 2. Founder / Management Context

- **Solo founder** — you manage and operate everything
- **Phase 1 goal:** Establish content + credibility (blog-first strategy)
- Admin panel is required for solo operation — no team collaboration features needed in Phase 1
- Services section represents **direct revenue** from the founder's consulting practice

---

## 3. Tech Stack (Confirmed)

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR/SSG for SEO-heavy blog and templates |
| **Database** | Supabase (Postgres) | Auth + DB + Storage in one |
| **Auth** | Supabase Auth | Built-in, handles roles cleanly |
| **File Storage** | Supabase Storage | Template PDFs, expert avatars, resumes |
| **Email** | ZeptoMail (Zoho) | Transactional emails + newsletter |
| **Payments** | Razorpay | Phase 2 only — not in Phase 1 |
| **Deployment** | Vercel | Native Next.js, zero config |
| **Admin CMS** | Custom admin panel | Built within Next.js — no external CMS |

---

## 4. Full Module Overview (All Phases)

### Phase 1 — Content + Credibility (Build Now)
1. **Knowledge Hub** — Blog with articles
2. **Templates & Resources** — Free downloadable templates
3. **Services** — Founder's consulting services + inquiry form
4. **Homepage** — Central landing page
5. **Newsletter & Email Capture** — ZeptoMail powered, across all pages

### Phase 2 — Community + Self-Serve (Build Next)
6. **Authentication & User Accounts** — Supabase Auth, 3 roles
7. **FoodTech Jobs** — Self-serve job board
8. **Expert Profiles** — Self-serve expert directory

### Phase 3 — Operations & Growth
9. **Admin Panel** — Full content and submission management
10. **Search**, newsletter management, analytics integration

---

## 5. Module Specifications

### Module 1 — Authentication & User Accounts *(Phase 2)*
- User registration & login (email/password via Supabase Auth)
- Role selection at signup: `Job Seeker` | `Employer` | `Expert`
- Role-specific profile completion flow
- Password reset flow
- Basic user dashboard (role-gated views)
- **No social login in Phase 1**

### Module 2 — Knowledge Hub (Blog) *(Phase 1)*
- Article listing page with category/tag filters
- Single article detail page (full read)
- Category pages (Food Safety, QC, Regulatory, Processing, Industry Insights)
- Related articles widget
- Basic search (article titles + tags)
- Admin: write / edit / publish / unpublish (founder only)
- **No comments in Phase 1**

### Module 3 — Templates & Resources *(Phase 1)*
- Resource listing page with category filter
- Resource detail page (preview + download)
- **Free downloads, no login required**
- Optional email capture on download (not a hard gate)
- Categories: HACCP, SOP, Audit Checklists, QC Inspection, Compliance Docs
- Admin: upload / manage resources (PDF, DOCX via Supabase Storage)
- **Paid templates deferred to Phase 2** (Razorpay integration)

### Module 4 — FoodTech Jobs *(Phase 2)*
- **Employer (self-serve):** Post jobs, manage listings, view applicants
- **Job Seeker:** Browse, filter, apply with resume + cover note, track applications
- **Admin:** Approve/reject listings before going live
- Job submissions require user account (Employer role)
- Applications require user account (Job Seeker role)

### Module 5 — Expert Profiles *(Phase 2)*
- **Expert (self-serve):** Create/edit profile, set availability status
- **Visitor:** Browse directory, filter by specialization/location, contact via email form
- **Admin:** Approve/reject/feature profiles before going live
- Profile creation requires user account (Expert role)
- **No direct messaging in Phase 1** — contact via email form only

### Module 6 — Services *(Phase 1)*
- Services listing with individual service detail sections
- Consulting inquiry form → ZeptoMail to founder's email + saved in Supabase
- Optional Calendly embed for booking calls
- **No CRM integration needed in Phase 1**

### Module 7 — Homepage *(Phase 1)*
- Hero, Stats row, Featured articles, Featured templates, Services snapshot, Newsletter banner

### Module 8 — Admin Panel *(Phase 1 — basic, Phase 3 — full)*
- Dashboard overview
- Article manager (write, edit, publish, delete)
- Resource/template manager (upload, categorize, remove)
- Job listings manager — Phase 2 (approve, reject, remove)
- Expert profiles manager — Phase 2 (approve, reject, feature)
- Inquiry inbox (from services form)

---

## 6. Database Schema (Supabase / Postgres)

### `articles`
```
id              uuid PK
title           text
slug            text unique
excerpt         text
content         text (rich text / markdown)
category        text
tags            text[]
cover_image_url text
author_name     text
read_time_mins  integer
is_published    boolean default false
published_at    timestamptz
created_at      timestamptz default now()
```

### `resources` (Templates)
```
id              uuid PK
title           text
slug            text unique
description     text
category        text
file_url        text (Supabase Storage URL)
file_type       text (PDF / DOCX)
is_free         boolean default true
download_count  integer default 0
created_at      timestamptz default now()
```

### `newsletter_subscribers`
```
id              uuid PK
email           text unique
source          text (homepage / blog / template / services)
subscribed_at   timestamptz default now()
is_active       boolean default true
```

### `service_inquiries`
```
id              uuid PK
full_name       text
email           text
company_name    text
service_needed  text
message         text
submitted_at    timestamptz default now()
is_read         boolean default false
```

### `jobs` *(Phase 2)*
```
id              uuid PK
title           text
company_name    text
location        text
job_type        text (full-time / part-time / contract / remote)
salary_min      integer
salary_max      integer
experience_level text
description     text
skills          text[]
status          text (pending / active / closed) default 'pending'
employer_id     uuid FK → users
created_at      timestamptz
expires_at      timestamptz
```

### `applications` *(Phase 2)*
```
id              uuid PK
job_id          uuid FK → jobs
applicant_id    uuid FK → users
resume_url      text (Supabase Storage)
cover_note      text
status          text (submitted / reviewed / rejected) default 'submitted'
applied_at      timestamptz default now()
```

### `experts` *(Phase 2)*
```
id              uuid PK
user_id         uuid FK → users
full_name       text
avatar_url      text (Supabase Storage)
specializations text[]
bio             text
experience_years integer
certifications  text[]
location        text
contact_email   text
is_available    boolean default true
status          text (pending / active) default 'pending'
is_featured     boolean default false
created_at      timestamptz default now()
```

---

## 7. Project Folder Structure (Next.js 14 App Router)

```
foodtech-hub/
├── app/
│   ├── (public)/                     # All public-facing pages
│   │   ├── page.tsx                  # Homepage
│   │   ├── blog/
│   │   │   ├── page.tsx              # Blog listing
│   │   │   ├── [slug]/page.tsx       # Article detail
│   │   │   └── category/
│   │   │       └── [category]/page.tsx  # Category filter page
│   │   ├── templates/
│   │   │   ├── page.tsx              # Templates listing
│   │   │   └── [slug]/page.tsx       # Template detail + download
│   │   ├── jobs/                     # Phase 2
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── experts/                  # Phase 2
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── services/
│   │       └── page.tsx              # Services + inquiry form
│   │
│   ├── (auth)/                       # Auth pages — Phase 2
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── dashboard/                    # User dashboards — Phase 2
│   │   ├── page.tsx                  # Role-based redirect
│   │   ├── employer/
│   │   ├── seeker/
│   │   └── expert/
│   │
│   ├── admin/                        # Founder-only admin panel
│   │   ├── page.tsx                  # Overview dashboard
│   │   ├── articles/
│   │   │   ├── page.tsx              # Article list
│   │   │   ├── new/page.tsx          # Create article
│   │   │   └── [id]/edit/page.tsx    # Edit article
│   │   ├── templates/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── jobs/page.tsx             # Phase 2
│   │   ├── experts/page.tsx          # Phase 2
│   │   └── inquiries/page.tsx
│   │
│   └── api/                          # Next.js API Routes
│       ├── newsletter/route.ts       # Email capture → ZeptoMail + Supabase
│       ├── inquiry/route.ts          # Services form → ZeptoMail + Supabase
│       ├── download/route.ts         # Template download handler + counter
│       └── upload/route.ts           # File uploads to Supabase Storage
│
├── components/
│   ├── ui/                           # Base design system components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx                 # Tags and pills
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   └── Alert.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── PageHeader.tsx            # Reusable page header with overline + H1
│   ├── blog/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleGrid.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── RelatedArticles.tsx
│   ├── templates/
│   │   ├── TemplateCard.tsx
│   │   ├── TemplateGrid.tsx
│   │   └── DownloadButton.tsx
│   ├── services/
│   │   ├── ServiceCard.tsx
│   │   └── InquiryForm.tsx
│   └── shared/
│       ├── NewsletterBanner.tsx      # Reusable across all pages
│       ├── StatsRow.tsx
│       └── SearchBar.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   └── server.ts                 # Server Supabase client (SSR)
│   ├── zeptomail/
│   │   └── mailer.ts                 # ZeptoMail send functions
│   └── utils.ts
│
├── types/
│   ├── article.ts
│   ├── template.ts
│   ├── inquiry.ts
│   └── newsletter.ts
│
└── middleware.ts                     # Route protection (admin, dashboard)
```

---

## 8. Phase 1 Screens — Full Detail

### Build sequence recommendation:
1. Design system setup (CSS variables, fonts, base components)
2. Layout: Navbar + Footer
3. Homepage
4. Blog Listing → Article Detail → Category Filter
5. Templates Listing → Template Detail
6. Services page
7. Newsletter API route + ZeptoMail integration
8. Admin panel (basic)

---

### Screen 1 — Homepage `/`

**Sections:**

**Navbar** (global)
- Logo: "FoodTech Hub" — Inter 800, `--color-primary` (#4C7C59)
- Nav links: Blog / Templates / Services — IBM Plex Sans 500, muted color
- CTA button: "Get a Consultation" — primary green button, radius 10px

**Hero**
- Overline: `INDIA'S FOOD TECHNOLOGY RESOURCE HUB` — Inter 700, 0.65rem, uppercase, letter-spacing 0.14em, primary green
- H1 (Fraunces 700, 2.5rem): *"Practical resources for a safer food ecosystem."*
- Subtext (IBM Plex Sans, muted): 2-line description of the platform
- CTAs: "Browse Free Templates" (primary button) + "Read the Blog" (ghost/outline button)
- Background: `#FCFCF8` — no hero image, clean typographic layout

**Stats Row**
- 4 numbers: Articles Published / Templates Available / Industry Topics / Consultations Done
- Style: Inter 800, 2rem, `--color-primary` for numbers; IBM Plex Sans 500 uppercase caption below

**Featured Articles**
- Overline: `KNOWLEDGE HUB`
- H2: "Latest from the Blog"
- 3 ArticleCard components in a grid
- "View All Articles →" ghost link

**Featured Templates**
- Overline: `FREE RESOURCES`
- H2: "Ready-to-Use Templates"
- 3 TemplateCard components
- "Browse All Templates →" ghost link

**Services Snapshot**
- Background: `#F5F0E8` (surface-light)
- Overline: `CONSULTING`
- H2: "Expert Guidance for Food Businesses"
- 3 service summary cards: FSSAI Compliance, HACCP Implementation, Food Safety Documentation
- Primary CTA: "View All Services"

**Newsletter Banner**
- Background: `#F5F0E8`
- H3: "Stay ahead in Food Technology."
- Subtext: "Weekly insights on food safety, QC, and regulatory compliance."
- Email input + "Subscribe" button (inline)
- Caption: "No spam. Unsubscribe anytime."
- On submit: POST to `/api/newsletter` → ZeptoMail welcome email + Supabase insert

**Footer** (global)
- 3 columns: Brand info / Quick links / Contact
- Mini newsletter input above the footer on pages without a full newsletter section

---

### Screen 2 — Blog Listing `/blog`

**Sections:**

**Page Header**
- Overline: `KNOWLEDGE HUB`
- H1 (Inter): "Food Technology Blog"
- One-line subtext

**Category Filter Bar**
- Horizontal scrollable pill row: All · Food Safety · Quality Control · Regulatory Compliance · Processing · Industry Insights
- Active pill: `--color-primary` background, white text
- Inactive pill: `--color-tag-neutral-bg` background, muted text
- Search input (right-aligned): IBM Plex Sans, 0.85rem, icon left

**Article Grid**
- 3-column grid (2 on tablet, 1 on mobile), 24px gap
- ArticleCard: category tag + read time tag → title (Inter 700) → 2-line excerpt → author + date footer
- Hover: card lifts with `--shadow-card`, `translateY(-2px)`

**Pagination**
- "Load More" button (secondary) or numbered pagination
- Not infinite scroll — important for SEO

**Newsletter Banner**
- Copy variant: "Get new articles in your inbox every week."

---

### Screen 3 — Article Detail `/blog/[slug]`

**Sections:**

**Breadcrumb**
- Home > Blog > [Category] — IBM Plex Sans 0.75rem, muted, with `>` separators

**Article Header**
- Category tag + read time tag
- H1 (Fraunces 700, 2.5rem): article title — *only place Fraunces is used on this page*
- Author name + publish date + read time — caption row, IBM Plex Sans 0.75rem, muted
- Cover image below headline (optional, `border-radius: 16px`, full content width)

**Article Body** (max-width 720px, centered)
- Body text: IBM Plex Sans 0.95rem, line-height 1.7, `--color-muted`
- H2 / H3 section headers: Inter 700
- Pull-quote callout: left border 4px `--color-primary`, background `--color-surface-light`, padding 16px 20px
- Code/formula blocks: IBM Plex Mono, `--color-surface-light` background

**Tags Row**
- Keyword pills below article body: "HACCP", "FSSAI", "Microbiology" etc.
- Style: outline green tags (transparent bg, `--color-primary` border + text)

**In-Article CTA Box**
- Accent-colored card (`--color-surface-light` or `--color-accent` tinted)
- Copy: "Looking for HACCP templates? Download our free checklist."
- Links to relevant template — contextually set per article in admin

**Related Articles**
- H3: "You might also like"
- 3 ArticleCard components in a row

**Newsletter Banner**
- Same component as blog listing

---

### Screen 4 — Category Filter `/blog/category/[category]`

Identical to Blog Listing with two differences:
- Page H1 reflects category name: e.g. "Food Safety Articles"
- Category filter bar has the current category pre-selected/highlighted
- Breadcrumb: Home > Blog > Food Safety

---

### Screen 5 — Templates Listing `/templates`

**Sections:**

**Page Header**
- Overline: `FREE RESOURCES`
- H1: "Templates & Checklists"
- Subtext: "Download ready-to-use HACCP plans, audit checklists, SOPs, and compliance documents."

**Filter Bar**
- Category pills: All · HACCP · Audit Checklists · SOP Templates · QC Inspection · Compliance Docs
- Same pill component as the blog filter
- Search input on the right

**Template Grid**
- 3-column grid
- TemplateCard: category tag (green) + file format badge (PDF/DOCX) → title → 2-line description → "Download Free" primary button
- No login required — direct download
- Download counter increments via `/api/download` route

**Newsletter Banner**
- Copy: "Get notified when new templates are added."
- Source tag: `template` (saved in Supabase `newsletter_subscribers.source`)

---

### Screen 6 — Template Detail `/templates/[slug]`

**Sections:**

**Breadcrumb**
- Home > Templates > HACCP Templates

**Template Header**
- Category tag (green) + file format badge (PDF/DOCX) + "Free" badge (accent orange)
- H1 (Inter 700): template title
- Short description paragraph (IBM Plex Sans, muted)

**What's Included Card**
- White card (`--color-card-bg`), border `--color-border`, radius 16px
- H3: "What's inside this template"
- Bullet list of document sections (e.g. "Hazard identification, Critical Control Points, Monitoring procedures, Corrective actions, Verification records")
- File details row: Format: PDF · Pages: 8 · Last updated: March 2026
- Small "Preview" ghost link if a preview image is available

**Download Section**
- Large primary button: "Download Free Template" — full width or large centered
- Below: optional email capture field
  - Label: "Enter your email to receive updates when this template is revised."
  - Input + small "Notify Me" button (secondary)
  - Not a hard gate — download works with or without email
  - If email entered: saved to Supabase with source = `template_detail`
- Download click: POST to `/api/download` → increments `download_count` → returns signed Supabase Storage URL → browser initiates file download

**Similar Templates**
- H3: "Similar Templates"
- 3 TemplateCard components in a row

**Cross-Sell CTA**
- Surface-light background box
- Copy: "Need a customized version for your facility?"
- Sub-copy: "We can adapt any template to your specific processes and regulatory requirements."
- CTA button: "Request Customization" → scrolls to or links to `/services#inquiry`

---

### Screen 7 — Services `/services`

**Sections:**

**Hero**
- Overline: `CONSULTING SERVICES`
- H1 (Fraunces): "Food Technology Consulting."
- 2-line subtext: founder's expertise and who they help
- Primary CTA: "Request a Free Consultation" (smooth-scrolls to inquiry form)
- Background: `#FCFCF8`

**Services Grid**
- 6 service cards in 3×2 grid
- Each card: icon (Lucide/Phosphor, 24px, primary green) + service name (Inter 700) + 2-line description + ghost "Learn More" link
- Services:
  1. FSSAI Compliance
  2. HACCP Development
  3. Food Safety Documentation
  4. Product Development Guidance
  5. Quality Management System (QMS) Setup
  6. Audit Preparation & Support

**Credibility / About Section**
- 2-column layout
- Left: founder photo + name + title
- Right: short bio paragraph + certifications bullet list + years of experience + clients helped
- Purpose: trust-building before the inquiry form

**How It Works**
- H2: "How it works"
- 4-step horizontal stepper:
  1. Submit Inquiry
  2. Discovery Call
  3. Proposal & Plan
  4. Implementation
- Each step: number circle (primary green) + step title + one-line description

**Inquiry Form** (`id="inquiry"` for anchor scroll)
- H2: "Start a conversation."
- Fields:
  - Full Name (text input)
  - Business Email (email input)
  - Company Name (text input)
  - Service Needed (dropdown — all 6 services)
  - Describe your challenge (textarea, 4 rows)
- Submit button: "Send My Inquiry" (primary, full width)
- On submit: POST to `/api/inquiry` → ZeptoMail email to founder + Supabase `service_inquiries` insert + confirmation email to user via ZeptoMail
- Below button caption: "We respond within 24 hours. No commitment required."

---

## 9. API Routes

### `POST /api/newsletter`
```
Input:  { email: string, source: string }
Action: Insert into Supabase newsletter_subscribers
        Send welcome email via ZeptoMail
Output: { success: boolean }
```

### `POST /api/inquiry`
```
Input:  { full_name, email, company_name, service_needed, message }
Action: Insert into Supabase service_inquiries
        Send notification email to founder via ZeptoMail
        Send confirmation email to user via ZeptoMail
Output: { success: boolean }
```

### `POST /api/download`
```
Input:  { template_id: string, email?: string }
Action: Increment download_count in Supabase resources
        If email provided, upsert into newsletter_subscribers (source: template_detail)
        Generate signed Supabase Storage URL (expires in 60 seconds)
Output: { download_url: string }
```

---

## 10. Email Flows (ZeptoMail)

| Trigger | Recipient | Email Type | Subject |
|---|---|---|---|
| Newsletter signup | Subscriber | Welcome | "Welcome to FoodTech Hub 👋" |
| Service inquiry submitted | Founder | Notification | "New inquiry: [service_needed]" |
| Service inquiry submitted | User | Confirmation | "We received your inquiry — here's what's next" |
| Template email capture | Subscriber | Confirmation | "You'll be notified of template updates" |

---

## 11. Design System Reference

**Full design system is documented in:** `FoodTech_Theme_Fresh_Sustainability_Minimal.md`

### Quick Reference — Core Palette
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#4C7C59` | CTAs, links, nav active, primary buttons |
| `--color-secondary` | `#7FB069` | Secondary actions, tags, hover states |
| `--color-accent` | `#DDA15E` | Featured badges, warm highlights |
| `--color-background` | `#FCFCF8` | Page background (not pure white) |
| `--color-text` | `#283618` | Primary text and headings |
| `--color-muted` | `#5f6b53` | Body text, descriptions, captions |
| `--color-border` | `#ece8d7` | Card borders, dividers |
| `--color-card-bg` | `#ffffff` | Card surfaces |
| `--color-surface-light` | `#F5F0E8` | Section backgrounds |

### Quick Reference — Typography
| Role | Font | Usage |
|---|---|---|
| Display / Hero | Fraunces | H1 hero headline ONLY — one per page |
| Headings / UI | Inter | H2, H3, buttons, tags, nav, stats |
| Body / Content | IBM Plex Sans | Articles, descriptions, form text, captions |
| Code / Mono | IBM Plex Mono | Code blocks, formulas |

### Google Fonts Import
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## 12. Component Reuse Map

| Component | Used On |
|---|---|
| `<Navbar />` | All pages |
| `<Footer />` | All pages |
| `<NewsletterBanner />` | Homepage, Blog listing, Article detail, Templates listing, Template detail |
| `<ArticleCard />` | Blog listing, Homepage featured, Article detail (related) |
| `<TemplateCard />` | Templates listing, Homepage featured, Template detail (similar) |
| `<CategoryFilter />` | Blog listing, Category filter, Templates listing |
| `<PageHeader />` | Blog listing, Templates listing, Services |
| `<StatsRow />` | Homepage |
| `<ServiceCard />` | Services, Homepage snapshot |
| `<InquiryForm />` | Services page |

---

## 13. Phase 1 Screen Summary

| Screen | URL | Primary Purpose | Email Capture |
|---|---|---|---|
| Homepage | `/` | First impression, discovery | Newsletter banner |
| Blog Listing | `/blog` | Browse articles | Newsletter banner |
| Article Detail | `/blog/[slug]` | Read content | Newsletter banner |
| Category Filter | `/blog/category/[cat]` | Filtered browsing | Newsletter banner |
| Templates Listing | `/templates` | Browse templates | Newsletter (updates) |
| Template Detail | `/templates/[slug]` | Download templates | Optional on download |
| Services | `/services` | Lead generation | Inquiry form |

**Total Phase 1 screens: 7**
**Total Phase 1 API routes: 3** (`/api/newsletter`, `/api/inquiry`, `/api/download`)

---

## 14. Build Order (Recommended for Solo Developer)

```
Step 1 — Setup
  - Init Next.js 14 project (App Router)
  - Configure Supabase (create project, run schema migrations)
  - Set up CSS variables + Google Fonts in globals.css
  - Build base UI components: Button, Card, Badge, Input

Step 2 — Layout
  - Navbar component
  - Footer component
  - Page wrapper layout

Step 3 — Homepage
  - All homepage sections using placeholder data
  - Wire NewsletterBanner to /api/newsletter

Step 4 — Blog
  - Blog listing page + ArticleCard component
  - Article detail page (full layout)
  - Category filter page
  - Connect to Supabase articles table

Step 5 — Templates
  - Templates listing + TemplateCard component
  - Template detail page
  - Wire download to /api/download + Supabase Storage

Step 6 — Services
  - Services page (all sections)
  - Wire InquiryForm to /api/inquiry + ZeptoMail

Step 7 — Admin Panel
  - Basic admin dashboard
  - Article create/edit/publish
  - Template upload
  - Inquiry inbox

Step 8 — Polish
  - SEO metadata (generateMetadata per page)
  - Sitemap.xml
  - Robots.txt
  - OG images
  - Performance audit
```

---

## 15. SEO Notes

- All blog articles: SSG with `generateStaticParams` → pre-rendered at build time
- Article slugs are canonical URLs
- `generateMetadata` function per page for dynamic title, description, OG tags
- Template detail pages: SSG for indexability
- Sitemap.xml auto-generated (next-sitemap package)
- No client-side-only rendering for any content pages — all content must be server-rendered or static for Googlebot

---

## 16. Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ZeptoMail
ZEPTOMAIL_API_KEY=
ZEPTOMAIL_FROM_EMAIL=
ZEPTOMAIL_FROM_NAME=FoodTech Hub

# App
NEXT_PUBLIC_SITE_URL=https://foodtechhub.in
ADMIN_EMAIL=your@email.com
```

---

*Last updated: Based on full planning session — May 2026*
*Design system reference: FoodTech_Theme_Fresh_Sustainability_Minimal.md*
*Core concept reference: foodtech_platform_core_concept_v1.md*
