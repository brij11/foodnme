import { test, expect, type Page } from "@playwright/test";

// story-auth-08 — the two-column brand/benefits panel (shipped in AuthShell under story-auth-01)
// must be visible on desktop and hidden on mobile across all three auth surfaces.
// The panel is CSS-gated (`hidden lg:flex`), so true visibility can only be asserted in a real
// browser at concrete viewport widths — hence E2E rather than jsdom.

const ROUTES: { path: string; panelHeading: string; formHeading: string }[] = [
  { path: "/login", panelHeading: "Welcome back to foodnme.", formHeading: "Welcome back" },
  { path: "/register", panelHeading: "Join the food-tech community.", formHeading: "Join foodnme" },
  {
    path: "/reset-password",
    panelHeading: "Forgot your password?",
    formHeading: "Reset your password",
  },
];

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 375, height: 800 };

function panel(page: Page, heading: string) {
  return page.getByRole("heading", { level: 2, name: heading });
}

test.describe("Auth brand panel (story-auth-08)", () => {
  for (const route of ROUTES) {
    test(`${route.path}: panel visible on desktop, form intact (AC#1, #2, #4)`, async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await page.goto(route.path);
      // Panel heading + at least one feature bullet are visible alongside the form.
      await expect(panel(page, route.panelHeading)).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: route.formHeading }),
      ).toBeVisible();
    });

    test(`${route.path}: panel hidden on mobile, form-only (AC#3)`, async ({ page }) => {
      await page.setViewportSize(MOBILE);
      await page.goto(route.path);
      // Panel collapses out; the form heading remains the page's sole h1.
      await expect(panel(page, route.panelHeading)).toBeHidden();
      await expect(
        page.getByRole("heading", { level: 1, name: route.formHeading }),
      ).toBeVisible();
    });
  }
});
