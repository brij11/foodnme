# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> public layout + homepage (homepage-02) >> renders the chrome, disabled Jobs/Experts, and footer (AC#1-3,6,9,10)
- Location: e2e/homepage.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('navigation', { name: 'Primary' }).locator('span[aria-disabled="true"]').filter({ hasText: 'Jobs' }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('navigation', { name: 'Primary' }).locator('span[aria-disabled="true"]').filter({ hasText: 'Jobs' }).first()

```

```yaml
- link "Skip to content":
  - /url: "#main"
- navigation "Primary":
  - link "foodnme":
    - /url: /
  - link "About Us":
    - /url: /about
  - link "Knowledge Hub":
    - /url: /blog
  - link "Templates":
    - /url: /templates
  - link "Jobs":
    - /url: /jobs
  - link "Experts":
    - /url: /experts
  - link "Services":
    - /url: /services
  - button "Get a Consultation"
- main:
  - text: India's Food-Tech Resource Hub
  - heading "Practical resources for a safer food ecosystem." [level=1]
  - paragraph: Field-tested HACCP plans, audit checklists, and expert writing — built for food safety, QC, and regulatory teams who ship product on Monday morning.
  - link "Browse templates":
    - /url: /templates
  - button "Book a consultation"
  - text: 0+ Articles 0 Templates 0+ Businesses Helped 0.0k Subscribers
  - paragraph: For QA · QC · Regulatory · R&D teams
  - paragraph: We share the templates, expertise, and people we use ourselves — so you don't have to rebuild from scratch.
  - paragraph: How foodnme helps
  - heading "Pick the thing you came here for." [level=2]
  - link "Audit on Monday? Download an audit-ready HACCP plan or supplier checklist in under a minute. Browse templates":
    - /url: /templates
    - heading "Audit on Monday?" [level=3]
    - paragraph: Download an audit-ready HACCP plan or supplier checklist in under a minute.
    - text: Browse templates
  - link "Wondering about the new FSSAI rules? Practical explainers on regulatory changes, written by working auditors. Read the blog":
    - /url: /blog
    - heading "Wondering about the new FSSAI rules?" [level=3]
    - paragraph: Practical explainers on regulatory changes, written by working auditors.
    - text: Read the blog
  - link "Hiring a QC microbiologist? Post a role to a curated network of food-tech professionals across India. Explore jobs":
    - /url: /jobs
    - heading "Hiring a QC microbiologist?" [level=3]
    - paragraph: Post a role to a curated network of food-tech professionals across India.
    - text: Explore jobs
  - link "Need expert eyes on a problem? Book a one-hour consult with an FSSAI auditor or processing specialist. Find an expert":
    - /url: /experts
    - heading "Need expert eyes on a problem?" [level=3]
    - paragraph: Book a one-hour consult with an FSSAI auditor or processing specialist.
    - text: Find an expert
  - paragraph: This week's read
  - heading "From the Knowledge Hub" [level=2]
  - link "All articles":
    - /url: /blog
  - paragraph: Need someone to look at it?
  - heading "Free 30-minute scoping call. No pitch, no commitment." [level=2]
  - paragraph: Tell us your situation. We'll point you to the right template, expert, or service — even if that's somewhere else.
  - button "Book a consultation"
  - link "See all services":
    - /url: /services
- contentinfo:
  - text: Newsletter
  - textbox "Newsletter":
    - /placeholder: you@company.com
  - button "Subscribe"
  - paragraph: No spam. Unsubscribe anytime.
  - link "foodnme":
    - /url: /
  - paragraph: Practical resources for a safer food ecosystem. Built for food technology professionals across India and beyond.
  - navigation "Explore":
    - heading "Explore" [level=2]
    - link "Knowledge Hub":
      - /url: /blog
    - link "Templates":
      - /url: /templates
    - link "Services":
      - /url: /services
    - link "About":
      - /url: /about
  - navigation "Topics":
    - heading "Topics" [level=2]
    - link "Food Safety":
      - /url: /blog/category/food-safety
    - link "Quality Control":
      - /url: /blog/category/quality-control
    - link "Regulatory":
      - /url: /blog/category/regulatory
    - link "Processing":
      - /url: /blog/category/processing
  - heading "Contact" [level=2]
  - link "hello@foodnme.in":
    - /url: mailto:hello@foodnme.in
  - link "LinkedIn":
    - /url: https://www.linkedin.com
  - text: © 2026 foodnme. All rights reserved. Made for the food-tech community in India.
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { expectNoSeriousA11yViolations } from "./utils/axe";
  3  | 
  4  | test.describe("public layout + homepage (homepage-02)", () => {
  5  |   test("renders the chrome, disabled Jobs/Experts, and footer (AC#1-3,6,9,10)", async ({ page }) => {
  6  |     await page.goto("/");
  7  | 
  8  |     // One Fraunces H1
  9  |     await expect(page.getByRole("heading", { level: 1 })).toContainText("safer food ecosystem");
  10 | 
  11 |     // Enabled nav link vs disabled "coming soon" items (scoped to the primary nav)
  12 |     const nav = page.getByRole("navigation", { name: "Primary" });
  13 |     await expect(nav.getByRole("link", { name: "Knowledge Hub", exact: true })).toBeVisible();
  14 |     const jobs = nav.locator('span[aria-disabled="true"]', { hasText: "Jobs" }).first();
> 15 |     await expect(jobs).toBeVisible();
     |                        ^ Error: expect(locator).toBeVisible() failed
  16 |     await expect(nav.getByRole("link", { name: "Jobs" })).toHaveCount(0);
  17 | 
  18 |     // Footer columns
  19 |     await expect(page.getByRole("heading", { name: "Explore" })).toBeVisible();
  20 |     await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
  21 |     await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
  22 |   });
  23 | 
  24 |   test("skip-to-content link reveals on focus (AC#10)", async ({ page }) => {
  25 |     await page.goto("/");
  26 |     await page.keyboard.press("Tab");
  27 |     await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  28 |   });
  29 | 
  30 |   test("Get a Consultation opens the modal; Esc closes it (AC#5)", async ({ page }) => {
  31 |     await page.goto("/");
  32 |     await page.getByRole("button", { name: "Get a Consultation" }).first().click();
  33 |     const dialog = page.getByRole("dialog");
  34 |     await expect(dialog).toBeVisible();
  35 |     await expect(dialog).toContainText("Tell us about your food business");
  36 |     await page.keyboard.press("Escape");
  37 |     await expect(dialog).toBeHidden();
  38 |   });
  39 | 
  40 |   test("homepage has no critical/serious a11y violations (§10)", async ({ page }) => {
  41 |     await page.goto("/");
  42 |     await expectNoSeriousA11yViolations(page);
  43 |   });
  44 | });
  45 | 
```