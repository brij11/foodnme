# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> public layout + homepage (homepage-02) >> homepage has no critical/serious a11y violations (§10)
- Location: e2e/homepage.spec.ts:40:7

# Error details

```
Error: Axe critical/serious violations: [
  {
    "id": "color-contrast",
    "nodes": 4
  },
  {
    "id": "definition-list",
    "nodes": 1
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 252

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 3.16,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#8a9482",
+               "fontSize": "7.8pt (10.4px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.16 (foreground color: #8a9482, background color: #ffffff, font size: 7.8pt (10.4px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"absolute right-0 top-48 w-60 rounded-lg border border-border bg-card-bg p-4 shadow-elevated rotate-[1.5deg]\">",
+                 "target": Array [
+                   ".right-0",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.16 (foreground color: #8a9482, background color: #ffffff, font size: 7.8pt (10.4px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span>28 pages</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-\\[0\\.65rem\\] > span:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 3.16,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#8a9482",
+               "fontSize": "7.8pt (10.4px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.16 (foreground color: #8a9482, background color: #ffffff, font size: 7.8pt (10.4px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"absolute right-0 top-48 w-60 rounded-lg border border-border bg-card-bg p-4 shadow-elevated rotate-[1.5deg]\">",
+                 "target": Array [
+                   ".right-0",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.16 (foreground color: #8a9482, background color: #ffffff, font size: 7.8pt (10.4px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span>1,840 downloads</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-\\[0\\.65rem\\] > span:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 3.16,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#8a9482",
+               "fontSize": "7.2pt (9.6px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.16 (foreground color: #8a9482, background color: #ffffff, font size: 7.2pt (9.6px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"absolute bottom-2 left-10 rounded-lg border border-border bg-card-bg px-5 py-4 shadow-card\">",
+                 "target": Array [
+                   ".bottom-2",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.16 (foreground color: #8a9482, background color: #ffffff, font size: 7.2pt (9.6px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<div class=\"mt-1 font-body text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-2\">Subscribers</div>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".mt-1",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f5f0e8",
+               "contrastRatio": 4.27,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#4c7c59",
+               "fontSize": "8.4pt (11.2px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.27 (foreground color: #4c7c59, background color: #f5f0e8, font size: 8.4pt (11.2px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"rounded-xl bg-surface-light px-6 py-14 text-center\">",
+                 "target": Array [
+                   ".rounded-xl",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 4.27 (foreground color: #4c7c59, background color: #f5f0e8, font size: 8.4pt (11.2px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary\">Need someone to look at it?</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".tracking-\\[0\\.14em\\].text-\\[0\\.7rem\\].text-primary",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+   Object {
+     "description": "Ensure <dl> elements are structured correctly",
+     "help": "<dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script>, <template> or <div> elements",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/definition-list?application=playwright",
+     "id": "definition-list",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   dl element has direct children that are not allowed: div > div",
+         "html": "<dl data-testid=\"hero-stats\" class=\"mt-12 grid max-w-md grid-cols-2 gap-6 sm:grid-cols-4\">",
+         "impact": "serious",
+         "none": Array [
+           Object {
+             "data": Object {
+               "values": "div > div",
+             },
+             "id": "only-dlitems",
+             "impact": "serious",
+             "message": "dl element has direct children that are not allowed: div > div",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"font-display text-2xl font-bold leading-none tracking-tight text-text\"><span>0+</span></div>",
+                 "target": Array [
+                   "div:nth-child(1) > .text-2xl.leading-none.tracking-tight",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"mt-1.5 font-heading text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted-2\">Articles</div>",
+                 "target": Array [
+                   "div:nth-child(1) > .mt-1\\.5.text-\\[0\\.62rem\\].text-muted-2",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"font-display text-2xl font-bold leading-none tracking-tight text-text\"><span>0</span></div>",
+                 "target": Array [
+                   "div:nth-child(2) > .text-2xl.leading-none.tracking-tight",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"mt-1.5 font-heading text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted-2\">Templates</div>",
+                 "target": Array [
+                   "div:nth-child(2) > .mt-1\\.5.text-\\[0\\.62rem\\].text-muted-2",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"font-display text-2xl font-bold leading-none tracking-tight text-text\"><span>0+</span></div>",
+                 "target": Array [
+                   "div:nth-child(3) > .text-2xl.leading-none.tracking-tight",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"mt-1.5 font-heading text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted-2\">Businesses Helped</div>",
+                 "target": Array [
+                   "div:nth-child(3) > .mt-1\\.5.text-\\[0\\.62rem\\].text-muted-2",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"font-display text-2xl font-bold leading-none tracking-tight text-text\"><span>0.0k</span></div>",
+                 "target": Array [
+                   "dl > div:nth-child(4) > .text-2xl.leading-none.tracking-tight",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"mt-1.5 font-heading text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted-2\">Subscribers</div>",
+                 "target": Array [
+                   "div:nth-child(4) > .mt-1\\.5.text-\\[0\\.62rem\\].text-muted-2",
+                 ],
+               },
+             ],
+           },
+         ],
+         "target": Array [
+           "dl",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.structure",
+       "wcag2a",
+       "wcag131",
+       "EN-301-549",
+       "EN-9.1.3.1",
+       "RGAAv4",
+       "RGAA-9.3.3",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - navigation "Primary" [ref=e3]:
    - generic [ref=e4]:
      - link "foodnme" [ref=e5] [cursor=pointer]:
        - /url: /
        - text: foodnme
      - generic [ref=e7]:
        - link "About Us" [ref=e8] [cursor=pointer]:
          - /url: /about
        - link "Knowledge Hub" [ref=e9] [cursor=pointer]:
          - /url: /blog
        - link "Templates" [ref=e10] [cursor=pointer]:
          - /url: /templates
        - link "Jobs" [ref=e11] [cursor=pointer]:
          - /url: /jobs
        - link "Experts" [ref=e12] [cursor=pointer]:
          - /url: /experts
        - link "Services" [ref=e13] [cursor=pointer]:
          - /url: /services
      - button "Get a Consultation" [ref=e15] [cursor=pointer]
  - main [ref=e16]:
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]: India's Food-Tech Resource Hub
        - heading "Practical resources for a safer food ecosystem." [level=1] [ref=e24]
        - paragraph [ref=e25]: Field-tested HACCP plans, audit checklists, and expert writing — built for food safety, QC, and regulatory teams who ship product on Monday morning.
        - generic [ref=e26]:
          - link "Browse templates" [ref=e27] [cursor=pointer]:
            - /url: /templates
            - img [ref=e28]
            - text: Browse templates
          - button "Book a consultation" [ref=e30] [cursor=pointer]
        - generic [ref=e31]:
          - generic [ref=e32]:
            - generic [ref=e33]: 0+
            - generic [ref=e34]: Articles
          - generic [ref=e35]:
            - generic [ref=e36]: "0"
            - generic [ref=e37]: Templates
          - generic [ref=e38]:
            - generic [ref=e39]: 0+
            - generic [ref=e40]: Businesses Helped
          - generic [ref=e41]:
            - generic [ref=e42]: 0.0k
            - generic [ref=e43]: Subscribers
      - generic [ref=e44]:
        - generic [ref=e47]:
          - generic [ref=e48]: HACCP
          - paragraph [ref=e49]: HACCP Plan Template — Dairy Processing
          - generic [ref=e50]:
            - generic [ref=e51]: 28 pages
            - generic [ref=e52]: 1,840 downloads
        - generic [ref=e53]:
          - generic [ref=e54]: 4.2k
          - generic [ref=e55]: Subscribers
    - generic [ref=e57]:
      - paragraph [ref=e58]: For QA · QC · Regulatory · R&D teams
      - paragraph [ref=e59]: We share the templates, expertise, and people we use ourselves — so you don't have to rebuild from scratch.
    - generic [ref=e60]:
      - generic [ref=e61]:
        - paragraph [ref=e62]: How foodnme helps
        - heading "Pick the thing you came here for." [level=2] [ref=e63]
      - generic [ref=e64]:
        - link "Audit on Monday? Download an audit-ready HACCP plan or supplier checklist in under a minute. Browse templates" [ref=e65] [cursor=pointer]:
          - /url: /templates
          - img [ref=e67]
          - heading "Audit on Monday?" [level=3] [ref=e70]
          - paragraph [ref=e71]: Download an audit-ready HACCP plan or supplier checklist in under a minute.
          - generic [ref=e72]:
            - text: Browse templates
            - img [ref=e73]
        - link "Wondering about the new FSSAI rules? Practical explainers on regulatory changes, written by working auditors. Read the blog" [ref=e75] [cursor=pointer]:
          - /url: /blog
          - img [ref=e77]
          - heading "Wondering about the new FSSAI rules?" [level=3] [ref=e80]
          - paragraph [ref=e81]: Practical explainers on regulatory changes, written by working auditors.
          - generic [ref=e82]:
            - text: Read the blog
            - img [ref=e83]
        - link "Hiring a QC microbiologist? Post a role to a curated network of food-tech professionals across India. Explore jobs" [ref=e85] [cursor=pointer]:
          - /url: /jobs
          - img [ref=e87]
          - heading "Hiring a QC microbiologist?" [level=3] [ref=e90]
          - paragraph [ref=e91]: Post a role to a curated network of food-tech professionals across India.
          - generic [ref=e92]:
            - text: Explore jobs
            - img [ref=e93]
        - link "Need expert eyes on a problem? Book a one-hour consult with an FSSAI auditor or processing specialist. Find an expert" [ref=e95] [cursor=pointer]:
          - /url: /experts
          - img [ref=e97]
          - heading "Need expert eyes on a problem?" [level=3] [ref=e100]
          - paragraph [ref=e101]: Book a one-hour consult with an FSSAI auditor or processing specialist.
          - generic [ref=e102]:
            - text: Find an expert
            - img [ref=e103]
    - generic [ref=e106]:
      - generic [ref=e107]:
        - paragraph [ref=e108]: This week's read
        - heading "From the Knowledge Hub" [level=2] [ref=e109]
      - link "All articles" [ref=e110] [cursor=pointer]:
        - /url: /blog
        - text: All articles
        - img [ref=e111]
    - generic [ref=e114]:
      - paragraph [ref=e115]: Need someone to look at it?
      - heading "Free 30-minute scoping call. No pitch, no commitment." [level=2] [ref=e116]
      - paragraph [ref=e117]: Tell us your situation. We'll point you to the right template, expert, or service — even if that's somewhere else.
      - generic [ref=e118]:
        - button "Book a consultation" [ref=e119] [cursor=pointer]
        - link "See all services" [ref=e120] [cursor=pointer]:
          - /url: /services
  - contentinfo [ref=e121]:
    - generic [ref=e122]:
      - generic [ref=e124]:
        - generic [ref=e125]: Newsletter
        - generic [ref=e126]:
          - textbox "Newsletter" [ref=e127]:
            - /placeholder: you@company.com
          - button "Subscribe" [ref=e128] [cursor=pointer]
        - paragraph [ref=e131]: No spam. Unsubscribe anytime.
      - generic [ref=e132]:
        - generic [ref=e133]:
          - link "foodnme" [ref=e134] [cursor=pointer]:
            - /url: /
            - text: foodnme
          - paragraph [ref=e136]: Practical resources for a safer food ecosystem. Built for food technology professionals across India and beyond.
        - navigation "Explore" [ref=e137]:
          - heading "Explore" [level=2] [ref=e138]
          - link "Knowledge Hub" [ref=e139] [cursor=pointer]:
            - /url: /blog
          - link "Templates" [ref=e140] [cursor=pointer]:
            - /url: /templates
          - link "Services" [ref=e141] [cursor=pointer]:
            - /url: /services
          - link "About" [ref=e142] [cursor=pointer]:
            - /url: /about
        - navigation "Topics" [ref=e143]:
          - heading "Topics" [level=2] [ref=e144]
          - link "Food Safety" [ref=e145] [cursor=pointer]:
            - /url: /blog/category/food-safety
          - link "Quality Control" [ref=e146] [cursor=pointer]:
            - /url: /blog/category/quality-control
          - link "Regulatory" [ref=e147] [cursor=pointer]:
            - /url: /blog/category/regulatory
          - link "Processing" [ref=e148] [cursor=pointer]:
            - /url: /blog/category/processing
        - generic [ref=e149]:
          - heading "Contact" [level=2] [ref=e150]
          - link "hello@foodnme.in" [ref=e151] [cursor=pointer]:
            - /url: mailto:hello@foodnme.in
          - link "LinkedIn" [ref=e152] [cursor=pointer]:
            - /url: https://www.linkedin.com
      - generic [ref=e153]:
        - generic [ref=e154]: © 2026 foodnme. All rights reserved.
        - generic [ref=e155]: Made for the food-tech community in India.
  - alert [ref=e156]
```

# Test source

```ts
  1  | import AxeBuilder from "@axe-core/playwright";
  2  | import { expect, type Page } from "@playwright/test";
  3  | 
  4  | /**
  5  |  * Asserts the page has zero critical/serious Axe-core violations
  6  |  * (TECHNICAL-REQUIREMENTS.md §1, §10 accessibility gate).
  7  |  */
  8  | export async function expectNoSeriousA11yViolations(page: Page) {
  9  |   // The card-grid fade-up stagger animates opacity 0→1 (UI-DESIGN-HANDOFF.md §4.10). Scanning
  10 |   // mid-fade yields transient low-contrast false positives — the settled DOM is what ships and
  11 |   // is the contract under test. Wait for any `.animate-fade-up` element to reach full opacity
  12 |   // (resolves immediately when there are none). Falls through after the timeout so a genuinely
  13 |   // stuck animation still gets scanned (and would fail loudly).
  14 |   await page
  15 |     .waitForFunction(
  16 |       () => Array.from(document.querySelectorAll(".animate-fade-up")).every((el) => getComputedStyle(el).opacity === "1"),
  17 |       undefined,
  18 |       { timeout: 5000 },
  19 |     )
  20 |     .catch(() => {});
  21 | 
  22 |   const results = await new AxeBuilder({ page }).analyze();
  23 |   const serious = results.violations.filter(
  24 |     (v) => v.impact === "critical" || v.impact === "serious",
  25 |   );
  26 |   expect(
  27 |     serious,
  28 |     `Axe critical/serious violations: ${JSON.stringify(
  29 |       serious.map((v) => ({ id: v.id, nodes: v.nodes.length })),
  30 |       null,
  31 |       2,
  32 |     )}`,
> 33 |   ).toEqual([]);
     |     ^ Error: Axe critical/serious violations: [
  34 | }
  35 | 
```