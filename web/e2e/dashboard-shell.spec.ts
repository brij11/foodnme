import { test, expect } from "@playwright/test";
import { ensureUser, deleteUserByEmail } from "./utils/supabase";
import { signInViaUI } from "./utils/session";
import { expectNoSeriousA11yViolations } from "./utils/axe";

const PW = "Password123";
const SEEKER = "dash-seeker@foodnme.test";
const EMPLOYER = "dash-employer@foodnme.test";
const EXPERT = "dash-expert@foodnme.test";

test.describe("role dashboard shell (story-auth-07)", () => {
  test.beforeAll(async () => {
    await ensureUser(SEEKER, PW, { full_name: "Dash Seeker", role: "seeker" });
    await ensureUser(EMPLOYER, PW, { full_name: "Dash Employer", role: "employer" });
    await ensureUser(EXPERT, PW, { full_name: "Dash Expert", role: "expert" });
  });
  test.afterAll(async () => {
    await deleteUserByEmail(SEEKER);
    await deleteUserByEmail(EMPLOYER);
    await deleteUserByEmail(EXPERT);
  });

  test("/dashboard routes a seeker to /dashboard/seeker with its empty state; no a11y violations", async ({
    page,
  }) => {
    await signInViaUI(page, SEEKER, PW);
    await page.goto("/dashboard");
    await page.waitForURL("**/dashboard/seeker");
    await expect(page.getByRole("heading", { name: /Welcome back, Dash\./ })).toBeVisible();
    await expect(page.getByText("Start your job search")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse jobs" }).first()).toBeVisible();
    // §10 accessibility gate — dashboard is a key page.
    await expectNoSeriousA11yViolations(page);
  });

  test("/dashboard routes an employer to /dashboard/employer; CTA switches the in-page tab", async ({
    page,
  }) => {
    await signInViaUI(page, EMPLOYER, PW);
    await page.goto("/dashboard");
    await page.waitForURL("**/dashboard/employer");
    await expect(page.getByText("Post your first job")).toBeVisible();
    // The "Post a job" CTA switches to the in-page Post tab (no route change).
    await page.getByRole("button", { name: "Post a job" }).click();
    await expect(page.getByText("The job posting form opens here.")).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/dashboard/employer");
  });

  test("/dashboard routes an expert to /dashboard/expert with its empty state", async ({ page }) => {
    await signInViaUI(page, EXPERT, PW);
    await page.goto("/dashboard");
    await page.waitForURL("**/dashboard/expert");
    await expect(page.getByText("Complete your expert profile")).toBeVisible();
  });

  test("sign out clears the session and returns to the homepage", async ({ page }) => {
    await signInViaUI(page, SEEKER, PW);
    await page.goto("/dashboard/seeker");
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL((u) => u.pathname === "/");
    // Session gone → a gated route now bounces to login.
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
  });
});
