# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: experts-contact.spec.ts >> contact expert relay (story-experts-03) >> submitting the contact modal relays the message and shows success
- Location: e2e/experts-contact.spec.ts:6:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Message delivered')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Message delivered')

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
  - link "Sign in":
    - /url: /login
  - button "Get a Consultation"
- main:
  - navigation "Breadcrumb":
    - list:
      - listitem:
        - link "Home":
          - /url: /
      - listitem:
        - link "Experts":
          - /url: /experts
      - listitem: Dr. Aarti Menon
  - text: AM
  - heading "Dr. Aarti Menon" [level=1]
  - text: Verified
  - paragraph: FSSAI Lead Auditor
  - paragraph: Mumbai · India
  - strong: 12 years
  - text: experience Available ₹6,000/hr
  - button "Contact Aarti"
  - dialog "Message Dr. Aarti Menon":
    - button "Close"
    - paragraph: Contact
    - heading "Message Dr. Aarti Menon" [level=2]
    - paragraph: Your message goes straight to their inbox — your email is the reply address.
    - alert: We couldn't deliver your message. Please try again in a moment.
    - text: Your name
    - textbox "Your name": Test Visitor
    - text: Email
    - textbox "Email": visitor@example.com
    - text: Company (optional)
    - textbox "Company (optional)":
      - /placeholder: Your company or brand
    - text: Engagement type (optional)
    - combobox "Engagement type (optional)":
      - option "Not sure yet" [selected]
      - option "Hourly consult (30-60 min)"
      - option "Project engagement (2-6 weeks)"
      - option "Retainer (ongoing)"
    - text: What do you need help with?
    - textbox "What do you need help with?":
      - /placeholder: Share your facility, products, and what you're hoping to accomplish.
      - text: We need a HACCP audit for our new dairy line before our certification audit.
    - button "Send message"
  - button "Save profile"
  - heading "About" [level=2]
  - paragraph: Twelve years auditing and implementing food safety systems for Indian food businesses. Trainer at NIFTEM workshops.
  - heading "Specializations" [level=3]
  - text: Food Safety HACCP Auditing
  - heading "Certifications" [level=3]
  - list:
    - listitem: FSSAI Auditor
    - listitem: FSSC 22000 Lead Auditor
    - listitem: PhD Food Tech
  - heading "Engagement types" [level=3]
  - text: Hourly consult
  - paragraph: 30-60 min calls for specific questions.
  - text: ₹6,000/hr Project engagement
  - paragraph: Defined scope, 2-6 week timeline.
  - text: Project-based Retainer
  - paragraph: Ongoing support, 4-20 hrs/month.
  - text: From ₹40,000/mo
  - complementary:
    - heading "Quick stats" [level=2]
    - term: Rating
    - definition: 4.9 / 5.0
    - term: Reviews
    - definition: "38"
    - term: Response time
    - definition: < 24 hours
    - term: Experience
    - definition: 12 years
    - term: Rate
    - definition: ₹6,000/hr
    - term: Location
    - definition: Mumbai
  - heading "Similar experts" [level=2]
  - text: AM
  - heading "Dr. Aarti Menon" [level=3]
  - text: Verified
  - paragraph: FSSAI Lead Auditor
  - paragraph: Mumbai · India
  - strong: "4.9"
  - text: (38 reviews)
  - paragraph: Twelve years auditing and implementing food safety systems for Indian food businesses. Trainer at NIFTEM workshops.
  - text: Food Safety HACCP Auditing Available ₹6,000/hr
  - link "View profile":
    - /url: /experts/372fb921-fbab-4e46-a6e0-908bc96b22b8
  - text: KS
  - heading "Karthik Subramanian" [level=3]
  - paragraph: Plant Operations Consultant
  - paragraph: Hyderabad · India
  - strong: "4.8"
  - text: (36 reviews)
  - paragraph: Plant operations and turnaround specialist. Helps mid-sized food manufacturers improve OEE and pass audits the first time.
  - text: Process Engineering Bakery Auditing Unavailable ₹6,500/hr
  - link "View profile":
    - /url: /experts/9b0dfa16-a268-46a6-9cdd-39398175fabe
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
- alert: Dr. Aarti Menon — FSSAI Lead Auditor | foodnme
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | // Drives the full contact flow against the live stack: Turnstile auto-passes with the local
  4  | // test key; ZeptoMail no-ops locally (no key) so the relay is treated as delivered → success.
  5  | test.describe("contact expert relay (story-experts-03)", () => {
  6  |   test("submitting the contact modal relays the message and shows success", async ({ page }) => {
  7  |     await page.goto("/experts?location=Mumbai");
  8  |     await page.getByRole("link", { name: "View profile" }).first().click();
  9  |     await page.waitForURL(/\/experts\/[0-9a-f-]+$/);
  10 | 
  11 |     await page.getByRole("button", { name: /Contact Aarti/ }).click();
  12 |     const dialog = page.getByRole("dialog");
  13 |     await dialog.getByLabel("Your name").fill("Test Visitor");
  14 |     await dialog.getByLabel("Email").fill("visitor@example.com");
  15 |     await dialog
  16 |       .getByLabel("What do you need help with?")
  17 |       .fill("We need a HACCP audit for our new dairy line before our certification audit.");
  18 | 
  19 |     const submit = dialog.getByRole("button", { name: "Send message" });
  20 |     await expect(submit).toBeEnabled({ timeout: 15000 }); // waits for Turnstile to verify
  21 |     await submit.click();
  22 | 
> 23 |     await expect(page.getByText("Message delivered")).toBeVisible();
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  24 |   });
  25 | 
  26 |   test("a short message is rejected client-side (Zod min length)", async ({ page }) => {
  27 |     await page.goto("/experts?location=Mumbai");
  28 |     await page.getByRole("link", { name: "View profile" }).first().click();
  29 |     await page.waitForURL(/\/experts\/[0-9a-f-]+$/);
  30 | 
  31 |     await page.getByRole("button", { name: /Contact Aarti/ }).click();
  32 |     const dialog = page.getByRole("dialog");
  33 |     await dialog.getByLabel("Your name").fill("Test Visitor");
  34 |     await dialog.getByLabel("Email").fill("visitor@example.com");
  35 |     await dialog.getByLabel("What do you need help with?").fill("hi");
  36 |     const submit = dialog.getByRole("button", { name: "Send message" });
  37 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  38 |     await submit.click();
  39 |     await expect(page.getByText(/at least 20 characters/)).toBeVisible();
  40 |   });
  41 | });
  42 | 
```