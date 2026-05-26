import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

test.use({ reducedMotion: "reduce" });

const SERVICE_NAMES = [
  "FSSAI Compliance",
  "HACCP Development",
  "Food Safety Documentation",
  "Product Development Guidance",
  "QMS Setup",
  "Audit Preparation & Support",
];

test.describe("/services page (services-01)", () => {
  test("hero: overline, Fraunces H1, CTA scrolls to #inquiry (AC#2)", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByText("Consulting Services").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Food Technology Consulting.");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveClass(/font-display/); // Fraunces (hero H1)
    await expect(page.getByRole("link", { name: "Request a free consultation" })).toHaveAttribute(
      "href",
      "#inquiry",
    );
    // the scroll target exists on the page
    await expect(page.locator("#inquiry")).toBeAttached();
  });

  test("services grid renders exactly the six named cards (AC#3)", async ({ page }) => {
    await page.goto("/services");
    for (const name of SERVICE_NAMES) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }
  });

  test("service-card icon + overline are dark olive (text), not green (AC#4, AC#5)", async ({ page }) => {
    await page.goto("/services");
    // FSSAI Compliance card overline is "Compliance" — dark-olive token, not primary green.
    const overline = page.getByText("Compliance", { exact: true });
    await expect(overline).toHaveClass(/text-text/);
    await expect(overline).not.toHaveClass(/text-primary/);
  });

  test("credibility section: founder + certifications + stats (AC#6)", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: "Aarti Menon" })).toBeVisible();
    await expect(page.getByText("FSSAI Accredited Auditor")).toBeVisible();
    await expect(page.getByText("Clients helped")).toBeVisible();
    await expect(page.getByText("Years experience")).toBeVisible();
  });

  test("'How it works' stepper renders the 4 steps (AC#7)", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
    for (const step of ["Submit inquiry", "Discovery call", "Proposal & plan", "Implementation"]) {
      await expect(page.getByRole("heading", { name: step })).toBeVisible();
    }
  });

  test("renders at the 375px mobile breakpoint without breaking (AC#8)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/services");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "FSSAI Compliance", exact: true })).toBeVisible();
  });

  test("services page has no critical/serious a11y violations (§10)", async ({ page }) => {
    await page.goto("/services");
    // The static page paints instantly; wait for the grid's fade-up stagger (≤0.4s anim +
    // 5×80ms delay) to settle to full opacity so axe scans the settled DOM, not a mid-fade frame.
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll(".animate-fade-up");
      return cards.length > 0 && [...cards].every((c) => getComputedStyle(c).opacity === "1");
    });
    await expectNoSeriousA11yViolations(page);
  });
});
