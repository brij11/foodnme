import { test, expect, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";

test.use({ reducedMotion: "reduce" });

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

async function openModal(page: Page) {
  await page.goto("/"); // global nav CTA → modal opens from any page
  await page.getByRole("button", { name: "Get a Consultation" }).first().click();
  return page.getByRole("dialog", { name: "Tell us about your food business." });
}

test.describe("consultation modal (services-04)", () => {
  test("nav CTA opens an ARIA dialog labelled by its H2, focus on first input (AC#2, AC#9)", async ({ page }) => {
    const dialog = await openModal(page);
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeFocused();
  });

  test("closes on Esc and on overlay click (AC#3)", async ({ page }) => {
    const dialog = await openModal(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);

    // reopen, then click the overlay (top-left, outside the centered card)
    await page.getByRole("button", { name: "Get a Consultation" }).first().click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog).toHaveCount(0);
  });

  test("slim fields render (Full Name, Business Email, Message) (AC#4)", async ({ page }) => {
    await openModal(page);
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Business email")).toBeVisible();
    await expect(page.getByLabel("What do you need help with?")).toBeVisible();
  });

  test("submit POSTs /api/inquiry with the modal service + source; success then auto-close (AC#6, AC#7)", async ({
    page,
  }) => {
    await stubTurnstile(page);
    let body: Record<string, unknown> | null = null;
    await page.route("**/api/inquiry", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });

    const dialog = await openModal(page);
    await page.getByLabel("Full name").fill("Ravi Kumar");
    await page.getByLabel("Business email").fill("ravi@snacks.in");
    await page.getByLabel("What do you need help with?").fill("Need help scoping a HACCP rollout for a new snack line.");
    const submit = page.getByRole("button", { name: "Request consultation" });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByText("Inquiry received.")).toBeVisible();
    expect(body).toMatchObject({
      service_needed: "Consultation (from modal)",
      source: "consultation_modal",
      full_name: "Ravi Kumar",
    });
    // auto-closes after ~2s
    await expect(dialog).toHaveCount(0, { timeout: 4000 });
  });

  test("open modal has no critical/serious a11y violations (§10)", async ({ page }) => {
    await openModal(page);
    await expectNoSeriousA11yViolations(page);
  });
});
