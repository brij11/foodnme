-- foodnme — dev seed (TECHNICAL-REQUIREMENTS.md §4.3). Ports prototype data.jsx content.
-- Applied by `supabase db reset`. Sections are added by the stories that need them:
--   • resources  → blog-05 (first to need it; templates-01/02/03 reuse the same rows)
--   • articles   → blog-01 (+ MDX sample article → blog-03)
-- Image URLs stay as Unsplash links for dev per §4.3.
-- `resources` is seeded before `articles` so `articles.related_resource_slug` FK resolves
-- (the in-article CTA box in blog-05 links the HACCP article → the dairy HACCP template).

-- ───────────────────────── resources / templates (blog-05) ─────────────────────────
-- file_type is lowercase 'pdf' | 'docx' (§4.1); file_url is the object key inside the
-- private `templates` storage bucket — the download API (templates-03) signs it on demand.
insert into resources (title, slug, description, category, file_url, file_type, is_free, download_count) values
('HACCP Plan Template — Dairy Processing', 'haccp-plan-template-dairy',
 'Complete HACCP plan structure tailored for dairy lines.
- Hazard identification worksheet
- Decision tree for CCPs
- Monitoring procedures (T/RH/pH)
- Corrective action log
- Verification & validation records
- Annual review checklist',
 'haccp', 'haccp-plan-template-dairy.docx', 'docx', true, 1840),
('Supplier Audit Checklist (GFSI-Aligned)', 'supplier-audit-checklist',
 '200-point audit checklist used by procurement teams to qualify ingredient and packaging suppliers.',
 'audit-checklists', 'supplier-audit-checklist.pdf', 'pdf', true, 2310),
('SOP — CIP Cleaning for Liquid Lines', 'sop-cip-cleaning',
 'Step-by-step Cleaning-in-Place SOP with chemical concentrations, temperature ranges, and verification logs.',
 'sop-templates', 'sop-cip-cleaning.docx', 'docx', true, 1260),
('QC Inspection Sheet — Incoming Materials', 'qc-inspection-incoming-materials',
 'Lot-level inspection record for raw materials including AQL tables and disposition workflow.',
 'qc-inspection', 'qc-inspection-incoming-materials.pdf', 'pdf', true, 980),
('FSSAI License Renewal Checklist', 'fssai-license-renewal-checklist',
 'Annual document review and renewal workflow with timelines, required attachments, and a fee schedule.',
 'compliance-docs', 'fssai-license-renewal-checklist.pdf', 'pdf', true, 3120),
('HACCP Team Charter & Roles Template', 'haccp-team-charter',
 'Defines team composition, decision authority, and the cadence of HACCP review meetings.',
 'haccp', 'haccp-team-charter.docx', 'docx', true, 720),
('Annual Internal Audit Plan', 'internal-audit-plan',
 'Quarterly audit calendar template with scope, audit type, lead auditor, and finding tracking.',
 'audit-checklists', 'internal-audit-plan.docx', 'docx', true, 1490),
('SOP — Allergen Changeover on Shared Lines', 'sop-allergen-changeover',
 'Validated changeover procedure including cleaning verification and first-product disposition rules.',
 'sop-templates', 'sop-allergen-changeover.docx', 'docx', true, 1080),
('Labeling Review Template (FSSAI 2026)', 'labelling-review-template',
 'Pre-print label review checklist aligned to current FSSAI labeling regulations and front-of-pack rules.',
 'compliance-docs', 'labelling-review-template.pdf', 'pdf', true, 1670);

-- ───────────────────────── articles (blog-01) ─────────────────────────
insert into articles (title, slug, excerpt, content_mdx, category, tags, cover_image_url, author_name, read_time_mins, is_published, published_at) values
('A practical HACCP rollout for small food businesses', 'haccp-implementation-small-food-businesses',
 $$How to scope, document, and verify a HACCP plan without a 200-page binder. The shortest path to a defensible system.$$,
 $$## Start with the flow diagram

A HACCP plan that survives an audit starts with an accurate process flow. Walk the line, not the SOP. Tag every step you touch, e.g. <Tag variant="green">CCP</Tag> vs <Tag variant="neutral">PRP</Tag>.

<PullQuote>A defensible HACCP plan is short, current, and walked — not a binder nobody reads.</PullQuote>

## Keep the hazard analysis honest

List only the hazards reasonably likely to occur. Auditors trust a short, defensible analysis more than an exhaustive one nobody maintains.

### A quick lethality check

```ts
function f0(tempsC: number[]): number {
  return tempsC.reduce((acc, t) => acc + 10 ** ((t - 121.1) / 10), 0);
}
```

<Image src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&q=80&auto=format&fit=crop" alt="Process line walk-through" caption="Walk the line, not the SOP." />

<CTABox title="Grab the dairy HACCP plan template" body="A ready-to-adapt starting point." ctaText="Download template" ctaHref="/templates/haccp-plan-template-dairy" />$$,
 'food-safety', '{HACCP,FSSAI,Compliance}',
 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&q=80&auto=format&fit=crop', 'Aarti Menon', 9, true, '2026-05-12T09:00:00Z'),

('FSSAI licensing updates that matter in 2026', 'fssai-licensing-changes-2026',
 $$Three changes to renewal timelines, a new category for cell-cultured products, and what is changed for nutraceuticals.$$,
 $$## Renewal timelines tightened

Plan renewals earlier this year — the grace window narrowed.

## A new category lands

Cell-cultured products now have a defined application path.$$,
 'regulatory', '{FSSAI,Regulatory}',
 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=1200&q=80&auto=format&fit=crop', 'Vikram Shah', 6, true, '2026-05-08T09:00:00Z'),

('Designing a shelf-life study that holds up to audit', 'shelf-life-testing-protocols',
 $$Accelerated vs. real-time, sample sizes, and the documentation auditors actually look for.$$,
 $$## Accelerated or real-time?

Accelerated studies estimate; real-time studies confirm. Auditors want to see both reconciled.$$,
 'quality-control', '{"Shelf Life",Testing,Microbiology}',
 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&q=80&auto=format&fit=crop', 'Priya Iyer', 11, true, '2026-05-03T09:00:00Z'),

('Allergen cross-contact: the controls auditors look for', 'allergen-cross-contact-controls',
 $$Cleaning validation, line scheduling, and labeling errors that have triggered recalls in the past 18 months.$$,
 $$## Validate cleaning, do not just verify it

A swab result is verification. A documented, repeatable cleaning procedure is validation.$$,
 'food-safety', '{Allergens,GMP}',
 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200&q=80&auto=format&fit=crop', 'Aarti Menon', 8, true, '2026-04-28T09:00:00Z'),

('Thermal process validation without the math anxiety', 'thermal-process-validation',
 $$F0 values, come-up time, and a worked example for a low-acid canned product line.$$,
 $$## What F0 really measures

F0 is lethality expressed in equivalent minutes at 121.1C. Once you anchor on that, the math follows.$$,
 'processing', '{Thermal,Validation}',
 'https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?w=1200&q=80&auto=format&fit=crop', 'Devansh Roy', 13, true, '2026-04-22T09:00:00Z'),

('Sampling plans for incoming QC: what is enough?', 'sampling-plans-q-c-2026',
 $$AQL vs. zero-acceptance, when to switch, and how to negotiate sampling levels with suppliers.$$,
 $$## AQL is a negotiation, not a law

Acceptable quality levels encode how much risk you are willing to accept. Make that explicit with suppliers.$$,
 'quality-control', '{Sampling,Inspection}',
 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=1200&q=80&auto=format&fit=crop', 'Priya Iyer', 7, true, '2026-04-18T09:00:00Z'),

('Where Indian food-tech capital is flowing in 2026', 'indian-food-tech-funding-2026',
 $$Cell-cultured, gut health, and the unexpected rise of B2B ingredient platforms. Numbers from the first quarter.$$,
 $$## B2B ingredients quietly led

The headline rounds went to consumer brands, but the steadiest capital flowed into B2B ingredient platforms.$$,
 'industry-insights', '{Funding,Trends}',
 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&q=80&auto=format&fit=crop', 'Naina Kapoor', 5, true, '2026-04-14T09:00:00Z'),

('Labeling compliance: the 12 errors we see repeatedly', 'labeling-compliance-checklist',
 $$Nutrition panel formatting, allergen declarations, and front-of-pack changes you might have missed.$$,
 $$## The nutrition panel still trips people up

Rounding rules and serving-size math cause more rejections than any single ingredient issue.$$,
 'regulatory', '{Labeling,FSSAI}',
 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&q=80&auto=format&fit=crop', 'Vikram Shah', 10, true, '2026-04-09T09:00:00Z'),

('Troubleshooting extrusion: density, expansion, and burn marks', 'extrusion-troubleshooting',
 $$A field guide for snack and breakfast cereal lines. With a screw configuration cheat sheet.$$,
 $$## Read the product, then the screws

Burn marks and inconsistent expansion usually point back to screw configuration and moisture, not temperature alone.$$,
 'processing', '{Extrusion,Troubleshooting}',
 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200&q=80&auto=format&fit=crop', 'Devansh Roy', 14, true, '2026-04-02T09:00:00Z');

-- ───────────────────────── article → template links (blog-05) ─────────────────────────
-- The HACCP rollout article surfaces a structured in-article CTA box for the HACCP team
-- charter template (a sensible next step). Its in-MDX CTABox already points at the dairy
-- plan template, so the structured CTA links to a distinct, complementary resource.
update articles set related_resource_slug = 'haccp-team-charter'
 where slug = 'haccp-implementation-small-food-businesses';

-- ───────────────────────── experts (experts-01) ─────────────────────────
-- Ported from prototype data.jsx EXPERTS as status='active' (no linked user — directory seed).
-- `rate` strings (₹6,000/hr) become integer hourly_rate; rating/reviews dropped (no schema).
insert into experts (full_name, title, location, experience_years, hourly_rate, specializations, certifications, bio, contact_email, is_available, is_featured, status) values
('Dr. Aarti Menon', 'FSSAI Lead Auditor', 'Mumbai · India', 12, 6000,
 '{"Food Safety","HACCP","Auditing"}', '{"FSSAI Auditor","FSSC 22000 Lead Auditor","PhD Food Tech"}',
 'Twelve years auditing and implementing food safety systems for Indian food businesses. Trainer at NIFTEM workshops.',
 'aarti.menon@expert.foodnme.test', true, true, 'active'),
('Vikram Shah', 'Regulatory Affairs Consultant', 'Delhi NCR · India', 9, 4500,
 '{"Regulatory Compliance","Labeling","Nutraceuticals"}', '{"MSc Food Tech","FSSAI Trainer"}',
 'Specializes in FSSAI licensing, nutraceutical compliance, and labeling reviews across India.',
 'vikram.shah@expert.foodnme.test', true, false, 'active'),
('Priya Iyer', 'QC Manager · Dairy', 'Anand, Gujarat', 14, 5500,
 '{"Quality Control","Dairy","Sensory Analysis"}', '{"BSc + MSc Food Tech","Six Sigma Black Belt"}',
 'Quality Control lead with deep experience in dairy. Shelf-life testing, sampling plans, and incoming-material inspection.',
 'priya.iyer@expert.foodnme.test', false, false, 'active'),
('Devansh Roy', 'Process Engineer', 'Pune, Maharashtra', 8, 4800,
 '{"Process Engineering","Product Development","Snacks"}', '{"BTech Food Engineering","Extrusion Specialist"}',
 'Process engineer with 8 years on extrusion, thermal, and aseptic lines. Helps food businesses scale up without sacrificing margins.',
 'devansh.roy@expert.foodnme.test', true, false, 'active'),
('Naina Kapoor', 'Industry Analyst & Strategy', 'Bengaluru · India', 6, 3800,
 '{"Strategy","Market Research","Nutraceuticals"}', '{"MBA · IIM","Food Tech Researcher"}',
 'Covers Indian food-tech investment, market structure, and category trends. Previously at a leading consumer-sector research firm.',
 'naina.kapoor@expert.foodnme.test', true, false, 'active'),
('Rohan Pillai', 'Sensory Scientist', 'Chennai, Tamil Nadu', 10, 5000,
 '{"Sensory Analysis","Product Development","Beverages"}', '{"MSc Food Tech","Certified Sensory Panel Leader"}',
 'Sensory scientist working with beverage and savory brands. Panel design, descriptive analysis, and consumer testing.',
 'rohan.pillai@expert.foodnme.test', true, false, 'active'),
('Meera Banerjee', 'Nutrition & Labeling Consultant', 'Kolkata · West Bengal', 11, 4200,
 '{"Labeling","Nutraceuticals","Regulatory Compliance"}', '{"MSc Nutrition","FSSAI Trainer"}',
 'Nutrition and labeling expert. Pre-print label reviews, claim substantiation, and front-of-pack compliance.',
 'meera.banerjee@expert.foodnme.test', true, true, 'active'),
('Karthik Subramanian', 'Plant Operations Consultant', 'Hyderabad · India', 15, 6500,
 '{"Process Engineering","Bakery","Auditing"}', '{"BTech + MTech","GFSI Trained"}',
 'Plant operations and turnaround specialist. Helps mid-sized food manufacturers improve OEE and pass audits the first time.',
 'karthik.subramanian@expert.foodnme.test', false, false, 'active');

-- ───────────────────────── jobs (jobs-01) ─────────────────────────
-- Ported from prototype data.jsx JOBS as status='active' (no employer — board seed). The
-- rendering-only `remote`/`company_initial`/`posted`/`applications` fields are dropped; the
-- card derives the company initial from company_name. expires_at set well into the future.
insert into jobs (title, company_name, location, job_type, salary_min, salary_max, experience_level, description, skills, status, expires_at) values
('Quality Assurance Manager', 'Amul Foods', 'Anand, Gujarat', 'Full-time', 1200000, 1800000, 'Senior',
 'Lead QA across two dairy lines (UHT milk and ice-cream). Own HACCP, GMP, and supplier qualification programs.',
 '{"HACCP","FSSAI","ISO 22000","Dairy"}', 'active', now() + interval '60 days'),
('Food Safety Auditor (Third-party)', 'TÜV India', 'Mumbai · Remote OK', 'Full-time', 900000, 1400000, 'Mid-level',
 'Conduct on-site audits across FSSC 22000, BRC, and SQF schemes. Heavy travel (40-50%).',
 '{"Auditing","FSSC 22000","BRC"}', 'active', now() + interval '60 days'),
('R&D Food Technologist', 'ITC Foods', 'Bengaluru, Karnataka', 'Full-time', 700000, 1100000, 'Mid-level',
 'New product development for the snacks and biscuits portfolio. Formulation, sensory, and pilot-scale trials.',
 '{"NPD","Formulation","Sensory","Snacks"}', 'active', now() + interval '60 days'),
('Regulatory Affairs Specialist', 'Hindustan Unilever', 'Gurugram, Haryana', 'Full-time', 1000000, 1500000, 'Senior',
 'Manage FSSAI submissions and labeling reviews for the nutraceuticals and packaged foods portfolio.',
 '{"FSSAI","Labeling","Nutraceuticals"}', 'active', now() + interval '60 days'),
('Production Supervisor — Bakery', 'Britannia Industries', 'Hyderabad, Telangana', 'Full-time', 500000, 750000, 'Mid-level',
 'Shift supervision on a high-speed biscuit line. GMP, line efficiency, and SOP adherence.',
 '{"Production","GMP","Bakery"}', 'active', now() + interval '60 days'),
('QC Microbiologist', 'Mother Dairy', 'Delhi NCR', 'Full-time', 450000, 650000, 'Entry-level',
 'Daily micro testing on incoming milk, in-process, and finished product. Method validation and report-out.',
 '{"Microbiology","QC","Method Validation"}', 'active', now() + interval '60 days'),
('Compliance Consultant (Contract)', 'Independent', 'Pan-India · Remote', 'Contract', 80000, 150000, 'Senior',
 '3-6 month engagements supporting growing F&B brands through FSSAI Tier-2 license upgrades and audits.',
 '{"FSSAI","Consulting","Audit Prep"}', 'active', now() + interval '60 days');

-- ───────────────────────── founder admin flag (auth-05) ─────────────────────────
-- Idempotent: promotes the founder's profile to admin once that account exists. No-op on a
-- fresh reset (no signups yet); the row is created by the on_auth_user_created trigger when the
-- founder registers. Second-admin onboarding is out of scope (Appendix OQ#8).
update profiles set is_admin = true where email = 'founder@foodnme.test';
