# foodnme — Product

> What we're building, and for whom.
> **Companion docs:** `UI-DESIGN-HANDOFF.md` (how it looks) · `TECHNICAL-REQUIREMENTS.md` (how it's built).

## 1. Identity

- **Name:** foodnme
- **Tagline:** Practical resources for a safer food ecosystem
- **Positioning:** Niche knowledge + community platform for Indian food-technology professionals
- **Tone:** Calm, credible, quietly opinionated. Editorial, not corporate.

## 2. Target users

QA/QC managers, food-safety auditors, food-tech students, consultants, and food businesses. India-first, global-reachable.

## 3. Modules

| Module | What it does |
|---|---|
| **Knowledge Hub** | SEO-indexable editorial articles, MDX-authored, categorized + tagged, with category-filter pages |
| **Templates & Resources** | Downloadable compliance templates (HACCP, audit checklists, SOPs, QC inspection, compliance docs) |
| **Services** | Founder consulting — page + inquiry form + nav-CTA Consultation modal |
| **Newsletter** | Email capture on every content page; transactional welcome + (later) campaign sender |
| **Jobs** | Self-serve employer postings (admin-approved) + seeker apply flow |
| **Experts** | Self-serve expert directory (admin-approved) with availability toggle + contact form |
| **Auth + Dashboards** | Email/password auth, three roles (seeker / employer / expert), role-aware dashboards |
| **Admin** | CMS for articles + templates, approval queue for jobs + experts, inquiry inbox |

## 4. Surfaces (16 screens)

| # | Route | Screen |
|---|---|---|
| 1 | `/` | Homepage |
| 2 | `/blog` | Knowledge Hub listing |
| 3 | `/blog/:slug` | Article detail |
| 4 | `/blog/category/:slug` | Category-filtered listing |
| 5 | `/templates` | Templates listing |
| 6 | `/templates/:slug` | Template detail |
| 7 | `/services` | Services + inquiry form |
| 8 | `/about` | About Us |
| 9 | `/login` | Sign in |
| 10 | `/register` | Register (with role picker) |
| 11 | `/reset-password` | Password reset |
| 12 | `/jobs` | Jobs board listing |
| 13 | `/jobs/:id` | Job detail + apply modal |
| 14 | `/experts` | Expert directory listing |
| 15 | `/experts/:id` | Expert profile + contact modal |
| 16 | `/dashboard/:role` | Role-aware dashboard (seeker / employer / expert) |

## 5. In scope

- SEO-indexable content (blog + templates) with on-demand revalidation
- Self-serve employer + expert flows gated by founder approval
- Newsletter capture on every content page
- Three-role auth + role-aware dashboards
- Founder admin panel for all entities

## 6. Out of scope (explicit)

- **No social login** (Google/LinkedIn) — email + password only
- **No comments** on articles
- **No direct messaging** between users (Apply / Contact modals route through admin or email)
- **No paid templates yet** — `is_free` flag exists in schema but UI renders no "Free" badge
- **No CRM integration**
- **No mobile app** — responsive web only

Boundary changes (e.g. adding paid templates) update both this doc and the related rules in `TECHNICAL-REQUIREMENTS.md` and `UI-DESIGN-HANDOFF.md`.
