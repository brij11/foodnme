// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: vi.fn() }));
vi.mock("@/lib/email/zeptomail", () => ({ sendEmail: vi.fn().mockResolvedValue({ sent: true }) }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/idempotency", () => ({
  getCachedResponse: vi.fn().mockResolvedValue(null),
  cacheResponse: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email/zeptomail";
import { createServiceClient } from "@/lib/supabase/service";
import { getCachedResponse } from "@/lib/idempotency";

function makeSupabase({ insertError = null as { message: string } | null } = {}) {
  const insert = vi.fn().mockResolvedValue({ error: insertError });
  const from = vi.fn(() => ({ insert }));
  return { client: { from }, from, insert };
}

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  }) as never;
}

const valid = {
  full_name: "Aarti Menon",
  email: "aarti@dairy.in",
  company_name: "Dairy Co",
  service_needed: "haccp-development",
  message: "We need a HACCP plan for a new dairy line before our audit.",
  turnstile_token: "tok",
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ADMIN_EMAIL = "founder@foodnme.test";
});

describe("POST /api/inquiry", () => {
  it("happy path: inserts the row (+ source) and sends both emails → { ok: true }", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(sb.from).toHaveBeenCalledWith("service_inquiries");
    expect(sb.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: "Aarti Menon",
        email: "aarti@dairy.in",
        company_name: "Dairy Co",
        service_needed: "haccp-development",
        source: "services_page", // default when none provided
      }),
    );
    expect(sb.insert.mock.calls[0]![0].submitted_at).toBeTruthy();
    // founder notification + user confirmation
    expect(sendEmail).toHaveBeenCalledTimes(2);
    const subjects = vi.mocked(sendEmail).mock.calls.map((c) => c[0].subject);
    expect(subjects.some((s) => s.startsWith("New inquiry:"))).toBe(true);
    expect(subjects).toContain("We received your inquiry — here's what's next");
  });

  it("persists a known custom source (consultation modal)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    await POST(req({ ...valid, source: "consultation_modal" }));
    expect(sb.insert).toHaveBeenCalledWith(expect.objectContaining({ source: "consultation_modal" }));
  });

  it("consultation modal: slim payload inserts with forced service + empty company (services-04)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(
      req({
        full_name: "Ravi Kumar",
        email: "ravi@snacks.in",
        message: "Need help scoping a HACCP rollout for a new snack line.",
        turnstile_token: "tok",
        source: "consultation_modal",
      }),
    );
    expect(res.status).toBe(200);
    expect(sb.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: "Ravi Kumar",
        company_name: "",
        service_needed: "Consultation (from modal)",
        source: "consultation_modal",
      }),
    );
  });

  it("consultation modal: short message → 400 (shared schema's min 20 still applies)", async () => {
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(
      req({ full_name: "Ravi", email: "ravi@snacks.in", message: "hi", turnstile_token: "t", source: "consultation_modal" }),
    );
    expect(res.status).toBe(400);
    expect(sb.insert).not.toHaveBeenCalled();
  });

  it("invalid body → 400 invalid_body, no Turnstile / DB (AC#1)", async () => {
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req({ ...valid, message: "too short" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_body");
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(sb.insert).not.toHaveBeenCalled();
  });

  it("failed Turnstile → 400, no DB insert (AC#2)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(false);
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("turnstile_failed");
    expect(sb.insert).not.toHaveBeenCalled();
  });

  it("idempotency replay: cached key returns ok without a second insert/emails (AC#6)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(getCachedResponse).mockResolvedValueOnce({ ok: true });
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req(valid, { "idempotency-key": "dup-1" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sb.insert).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("email send failure after insert still returns 200 — DB is source of truth (AC#7)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error("zepto down"));
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
