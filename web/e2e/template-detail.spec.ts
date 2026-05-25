import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

test.use({ reducedMotion: "reduce" });

const BULLETS = "haccp-plan-template-dairy"; // description carries markdown bullets
const PLAIN = "supplier-audit-checklist"; // plain-paragraph description (fallback)

async function captureDownloadPost(page: import("@playwright/test").Page) {
  const captured: { body: { template_id?: string; email?: string } }[] = [];
  await page.route("**/api/download", async (route) => {
    captured.push({ body: route.request().postDataJSON() });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { download_url: "about:blank" } }),
    });
  });
  return captured;
}

test.describe("/templates/[slug] detail (templates-02)", () => {
  test("breadcrumb, Inter H1, and What's Included bullet list (AC#3, AC#4, AC#5)", async ({ page }) => {
    await page.goto(`/templates/${BULLETS}`);

    // breadcrumb Home › Templates › HACCP
    const crumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumb.getByRole("link", { name: "Templates" })).toHaveAttribute("href", "/templates");
    await expect(crumb.getByText("HACCP")).toHaveAttribute("aria-current", "page");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("HACCP Plan Template — Dairy Processing");

    // bullets parsed from description
    await expect(page.getByText("What's inside this template")).toBeVisible();
    await expect(page.getByText("Hazard identification worksheet")).toBeVisible();
    await expect(page.getByText("Annual review checklist")).toBeVisible();
  });

  test("What's Included falls back to a plain paragraph when there are no bullets (AC#5)", async ({ page }) => {
    await page.goto(`/templates/${PLAIN}`);
    await expect(page.getByText("What's inside this template")).toBeVisible();
    await expect(page.getByText(/200-point audit checklist/i)).toBeVisible();
    // no checklist bullets for this template
    await expect(page.locator("ul li")).toHaveCount(0);
  });

  test("download caption copy + Similar templates + cross-sell CTA (AC#7, AC#9, AC#10)", async ({ page }) => {
    await page.goto(`/templates/${BULLETS}`);

    await expect(
      page.getByText("Enter your email to receive updates when this template is revised."),
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "Similar templates" })).toBeVisible();
    const similar = page.locator('section[aria-labelledby="similar-heading"]');
    await expect(similar.locator('a[href^="/templates/"]')).toHaveCount(3);

    await expect(page.getByRole("link", { name: "Request customization" })).toHaveAttribute(
      "href",
      "/services#inquiry",
    );
  });

  test("download works WITHOUT email — POST carries template_id, no email (AC#6, AC#8)", async ({ page }) => {
    const captured = await captureDownloadPost(page);
    await page.goto(`/templates/${BULLETS}`);

    await page.getByRole("button", { name: "Download template" }).click();
    await expect.poll(() => captured.length).toBe(1);
    expect(captured[0]!.body.template_id).toBeTruthy();
    expect(captured[0]!.body.email).toBeUndefined();
  });

  test("download includes the email when the optional field is filled (AC#6)", async ({ page }) => {
    const captured = await captureDownloadPost(page);
    await page.goto(`/templates/${BULLETS}`);

    await page.getByLabel(/Enter your email/i).fill("qa@dairy.example");
    await page.getByRole("button", { name: "Download template" }).click();
    await expect.poll(() => captured.length).toBe(1);
    expect(captured[0]!.body.email).toBe("qa@dairy.example");
  });

  test("unknown template slug 404s (AC#1)", async ({ page }) => {
    const res = await page.goto("/templates/not-a-real-template");
    expect(res?.status()).toBe(404);
  });

  test("per-template metadata title (AC#11)", async ({ page }) => {
    await page.goto(`/templates/${BULLETS}`);
    await expect(page).toHaveTitle(/HACCP Plan Template — Dairy Processing — foodnme/);
  });

  test("template detail has no critical/serious a11y violations (§10)", async ({ page }) => {
    await page.goto(`/templates/${BULLETS}`);
    await expectNoSeriousA11yViolations(page);
  });
});
