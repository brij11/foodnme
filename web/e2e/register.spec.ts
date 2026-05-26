import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";
import { ensureUser, deleteUserByEmail } from "./utils/supabase";

const PASSWORD = "Password123";
// Pre-existing confirmed user, used to exercise the duplicate-email path (AC#6).
const EXISTING = "register-existing@foodnme.test";
// New address per run for the happy path (AC#5); cleaned up after.
const FRESH = `register-fresh-${Date.now()}@foodnme.test`;

test.describe("/register (story-auth-02)", () => {
  test.beforeAll(async () => {
    await ensureUser(EXISTING, PASSWORD, { full_name: "Existing User", role: "seeker" });
  });
  test.afterAll(async () => {
    await deleteUserByEmail(EXISTING);
    await deleteUserByEmail(FRESH);
  });

  test("renders the single-form register with three role cards, no serious a11y violations", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Join foodnme" })).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    // AC#2 — exactly Job Seeker / Employer / Expert role cards.
    await expect(page.getByRole("radio", { name: /Job Seeker/ })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Employer/ })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Expert/ })).toBeVisible();
    // AC#9 — no social login buttons.
    await expect(page.getByRole("button", { name: /google|linkedin/i })).toHaveCount(0);
    await expectNoSeriousA11yViolations(page);
  });

  test("selecting a role card marks it checked (radiogroup)", async ({ page }) => {
    await page.goto("/register");
    const employer = page.getByRole("radio", { name: /Employer/ });
    await expect(employer).toHaveAttribute("aria-checked", "false");
    await employer.click();
    await expect(employer).toHaveAttribute("aria-checked", "true");
  });

  test("short password → inline validation error (AC#3)", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Email").fill("p@foodnme.test");
    await page.getByLabel("Password").fill("short7!");
    await page.getByRole("radio", { name: /Job Seeker/ }).click();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
  });

  test("missing role → 'Pick a role to continue.'", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Email").fill("norole@foodnme.test");
    await page.getByLabel("Password").fill("longenough8");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Pick a role to continue.")).toBeVisible();
  });

  test("valid signup → 'Check your inbox' verify state with resend (AC#5)", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Fresh Seeker");
    await page.getByLabel("Email").fill(FRESH);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("radio", { name: /Job Seeker/ }).click();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
    await expect(page.getByText(FRESH)).toBeVisible();
    await expect(page.getByRole("button", { name: "resend the link" })).toBeVisible();
  });

  test("duplicate email → 'account already exists' (AC#6)", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Dupe User");
    await page.getByLabel("Email").fill(EXISTING);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("radio", { name: /Expert/ }).click();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(
      page.getByText("An account with this email already exists. Try signing in."),
    ).toBeVisible();
  });
});
