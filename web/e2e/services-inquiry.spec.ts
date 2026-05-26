import { test, expect, type Page } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

// Stub the Cloudflare Turnstile widget so the submit gate resolves deterministically without
// the external script: render() immediately fires the verify callback with a dummy token.
async function stubTurnstile(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { turnstile: unknown }).turnstile = {
      render: (_el: HTMLElement, opts: { callback: (t: string) => void }) => {
        setTimeout(() => opts.callback("e2e-dummy-token"), 0);
        return "w1";
      },
      reset: () => {},
      remove: () => {},
    };
  });
}

async function fillValid(page: Page) {
  await page.getByLabel("Full name").fill("Aarti Menon");
  await page.getByLabel("Business email").fill("aarti@dairy.in");
  await page.getByLabel("Company name").fill("Dairy Co");
  await page.getByLabel("Service needed").selectOption("haccp-development");
  await page
    .getByLabel("Describe your challenge")
    .fill("We need a HACCP plan for a new dairy line before our certification audit.");
}

test.describe("services inquiry form (services-02)", () => {
  test("renders all fields with labels + button caption (AC#1, AC#9)", async ({ page }) => {
    await page.goto("/services#inquiry");
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Business email")).toBeVisible();
    await expect(page.getByLabel("Company name")).toBeVisible();
    await expect(page.getByLabel("Service needed")).toBeVisible();
    await expect(page.getByLabel("Describe your challenge")).toBeVisible();
    await expect(page.getByText("We respond within 24 hours. No commitment required.")).toBeVisible();
  });

  test("inline field error on blur, before submit (AC#3)", async ({ page }) => {
    await page.goto("/services#inquiry");
    await page.getByLabel("Full name").click();
    await page.getByLabel("Business email").click(); // blur full_name (empty)
    await expect(page.getByText("Please enter your full name.")).toBeVisible();
  });

  test("submit is disabled until the Turnstile token resolves (AC#4)", async ({ page }) => {
    // No stub here → no token → submit stays disabled.
    await page.goto("/services#inquiry");
    await expect(page.getByRole("button", { name: "Send my inquiry" })).toBeDisabled();
  });

  test("submit POSTs the payload to /api/inquiry with an Idempotency-Key; success replaces the form (AC#5, AC#6, AC#7)", async ({
    page,
  }) => {
    await stubTurnstile(page);

    let captured: { headers: Record<string, string>; body: Record<string, unknown> } | null = null;
    await page.route("**/api/inquiry", async (route) => {
      captured = { headers: route.request().headers(), body: route.request().postDataJSON() };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });

    await page.goto("/services#inquiry");
    await fillValid(page);
    const submit = page.getByRole("button", { name: "Send my inquiry" });
    await expect(submit).toBeEnabled(); // token resolved
    await submit.click();

    // success state replaces the form
    await expect(page.getByText("We received your inquiry — we'll respond within 24 hours.")).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveCount(0);

    expect(captured!.headers["idempotency-key"]).toBeTruthy();
    expect(captured!.body).toMatchObject({
      full_name: "Aarti Menon",
      email: "aarti@dairy.in",
      company_name: "Dairy Co",
      service_needed: "haccp-development",
      turnstile_token: "e2e-dummy-token",
    });
    expect(captured!.body.message).toContain("HACCP plan");
  });

  test("failure shows an inline banner and preserves the input (AC#8)", async ({ page }) => {
    await stubTurnstile(page);
    await page.route("**/api/inquiry", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: { code: "db_error", message: "nope" } }),
      });
    });

    await page.goto("/services#inquiry");
    await fillValid(page);
    await page.getByRole("button", { name: "Send my inquiry" }).click();

    await expect(page.getByText(/something went wrong sending your inquiry/i)).toBeVisible();
    // input preserved
    await expect(page.getByLabel("Full name")).toHaveValue("Aarti Menon");
  });
});
