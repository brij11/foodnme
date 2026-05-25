-- foodnme — dev seed (TECHNICAL-REQUIREMENTS.md §4.3). Ports prototype data.jsx content.
-- Applied by `supabase db reset`. Sections are added by the stories that need them:
--   • resources  → templates-01
--   • articles   → blog-01 (+ MDX sample article → blog-03)
-- Image URLs stay as Unsplash links for dev per §4.3.

-- ───────────────────────── articles (blog-01) ─────────────────────────
insert into articles (title, slug, excerpt, content_mdx, category, tags, cover_image_url, author_name, read_time_mins, is_published, published_at) values
('A practical HACCP rollout for small food businesses', 'haccp-implementation-small-food-businesses',
 $$How to scope, document, and verify a HACCP plan without a 200-page binder. The shortest path to a defensible system.$$,
 $$## Start with the flow diagram

A HACCP plan that survives an audit starts with an accurate process flow. Walk the line, not the SOP.

## Keep the hazard analysis honest

List only the hazards reasonably likely to occur. Auditors trust a short, defensible analysis more than an exhaustive one nobody maintains.$$,
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
