import { test, expect } from "@playwright/test";

// §10 critical flow #1 — newsletter signup. Exercises the real route end-to-end against the
// local Supabase stack: Zod → Turnstile verify (local always-pass test secret) → upsert.
test.describe("POST /api/newsletter (newsletter-02)", () => {
  test("valid signup returns { ok: true } and is idempotent on the unique email", async ({ request }) => {
    const email = `e2e-${Date.now()}@dairy.in`;
    const body = { email, source: "e2e", turnstile_token: "dummy-passes-with-test-secret" };

    const first = await request.post("/api/newsletter", { data: body });
    expect(first.status()).toBe(200);
    expect(await first.json()).toEqual({ ok: true });

    // Re-subscribing the same email reactivates without error (unique-email upsert).
    const second = await request.post("/api/newsletter", { data: body });
    expect(second.status()).toBe(200);
    expect(await second.json()).toEqual({ ok: true });
  });

  test("invalid email is rejected with 400 invalid_body", async ({ request }) => {
    const res = await request.post("/api/newsletter", {
      data: { email: "not-an-email", source: "e2e", turnstile_token: "x" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_body");
  });
});
