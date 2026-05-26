import { test, expect } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./utils/axe";
import { ensureUser, deleteUserByEmail } from "./utils/supabase";

// A confirmed seeker used to exercise the success → redirect paths (AC#2, #3, #5).
const EMAIL = "login-e2e@foodnme.test";
const PASSWORD = "Password123";

test.describe("/login (story-auth-01)", () => {
  test.beforeAll(async () => {
    await ensureUser(EMAIL, PASSWORD, { full_name: "Login Tester", role: "seeker" });
  });
  test.afterAll(async () => {
    await deleteUserByEmail(EMAIL);
  });

  test("renders the login form with links to register + reset, no serious a11y violations", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back", exact: true })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    // AC#6 — links to Register and Reset Password.
    await expect(page.getByRole("link", { name: "Create one" })).toHaveAttribute("href", "/register");
    await expect(page.getByRole("link", { name: "Forgot?" })).toHaveAttribute("href", "/reset-password");
    // §10 accessibility gate — login is a key page.
    await expectNoSeriousA11yViolations(page);
  });

  test("invalid email → inline validation error, no auth call (AC#7)", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("whatever");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });

  test("wrong credentials → generic error that does not disambiguate email vs password (AC#4)", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nobody-here@foodnme.test");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid email or password.")).toBeVisible();
  });

  test("shows an in-flight loading state on the Sign in button (AC#8)", async ({ page }) => {
    await page.goto("/login");
    // Delay the token exchange so the in-flight label is observable.
    await page.route("**/auth/v1/token**", async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.continue();
    });
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("button", { name: "Signing in…" })).toBeDisabled();
  });

  test("success honors an internal ?redirect= target (AC#3)", async ({ page }) => {
    await page.goto("/login?redirect=%2Ftemplates");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/templates");
    expect(new URL(page.url()).pathname).toBe("/templates");
  });

  test("success rejects an external ?redirect= and falls back to /dashboard (AC#5)", async ({
    page,
  }) => {
    await page.goto("/login?redirect=https%3A%2F%2Fevil.com");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/dashboard");
    expect(new URL(page.url()).pathname).toBe("/dashboard");
  });
});
