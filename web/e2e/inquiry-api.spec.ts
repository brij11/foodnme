import { test, expect } from "@playwright/test";

// Hits the real POST /api/inquiry against the local Supabase stack:
// Zod → Turnstile verify (local always-pass test secret) → insert into service_inquiries →
// best-effort dual email (skipped locally, no ZeptoMail key) → { ok: true } (services-03).
test.describe("POST /api/inquiry (services-03)", () => {
  test("valid inquiry → 200 { ok: true } (real insert)", async ({ request }) => {
    const res = await request.post("/api/inquiry", {
      data: {
        full_name: "Aarti Menon",
        email: `qa+${Date.now()}@dairy.in`,
        company_name: "Dairy Co",
        service_needed: "haccp-development",
        message: "We need a HACCP plan for a new dairy line before our certification audit.",
        turnstile_token: "dummy-passes-with-test-secret",
        source: "services_page",
      },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("invalid body → 400 invalid_body", async ({ request }) => {
    const res = await request.post("/api/inquiry", {
      data: { full_name: "A", email: "nope", message: "short", turnstile_token: "x" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_body");
  });
});
