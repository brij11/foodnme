import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail } from "./utils/supabase";
import { signInViaUI } from "./utils/session";

// story-homepage-09 — auth-aware navbar (Sign in link vs account menu).
const EMAIL = "navbar-auth@foodnme.test";
const PW = "Password123";

test.describe("Navbar auth region (story-homepage-09)", () => {
  test.beforeAll(async () => {
    await ensureUser(EMAIL, PW, { full_name: "Nav Tester", role: "seeker" });
  });
  test.afterAll(async () => {
    await deleteUserByEmail(EMAIL);
  });

  test("signed out: navbar shows a 'Sign in' link to /login (AC#1)", async ({ page }) => {
    await page.goto("/");
    const signIn = page.getByRole("link", { name: "Sign in" }).first();
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", "/login");
    await expect(page.getByRole("button", { name: "Account menu" })).toHaveCount(0);
  });

  test("signed in: account menu opens, reaches Dashboard, and Sign out returns home (AC#2-4,6)", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await signInViaUI(page, EMAIL, PW);

    // Without a reload, the navbar reflects the session: the account button appears.
    await page.goto("/");
    const acct = page.getByRole("button", { name: "Account menu" });
    await expect(acct).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveCount(0);

    await acct.click();
    const menu = page.getByRole("menu");
    await expect(menu.getByText("Nav Tester")).toBeVisible();
    await expect(menu.getByText(EMAIL)).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      "/dashboard",
    );

    // Sign out → back to the homepage with the Sign-in link restored.
    await menu.getByRole("menuitem", { name: /Sign out/ }).click();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Account menu" })).toHaveCount(0);
  });
});
