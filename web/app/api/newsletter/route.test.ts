// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: vi.fn() }));
vi.mock("@/lib/email/zeptomail", () => ({ sendEmail: vi.fn().mockResolvedValue({ sent: true }) }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));

import { POST } from "./route";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email/zeptomail";
import { createServiceClient } from "@/lib/supabase/service";

function makeSupabase({ existing = null as { id: string } | null, upsertError = null as { message: string } | null }) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: existing, error: null });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const upsert = vi.fn().mockResolvedValue({ error: upsertError });
  const from = vi.fn(() => ({ select, upsert }));
  return { client: { from }, upsert, select };
}

function req(body: unknown) {
  return new Request("http://localhost/api/newsletter", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

const valid = { email: "qa@dairy.in", source: "homepage", turnstile_token: "tok" };

describe("POST /api/newsletter", () => {
  beforeEach(() => vi.clearAllMocks());

  it("happy path: new subscriber → upsert + welcome email + { ok: true }", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    const sb = makeSupabase({ existing: null });
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(sb.upsert).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("duplicate signup reactivates without a second welcome email (AC#4)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    const sb = makeSupabase({ existing: { id: "abc" } });
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(sb.upsert).toHaveBeenCalledOnce();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("invalid email → 400 invalid_body before Turnstile / DB", async () => {
    const sb = makeSupabase({});
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req({ ...valid, email: "nope" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("invalid_body");
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(sb.upsert).not.toHaveBeenCalled();
  });

  it("email send failure after upsert still returns 200 — DB is source of truth (AC#6)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error("zepto down"));
    const sb = makeSupabase({ existing: null });
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("failed Turnstile → 400 turnstile_failed, no DB write (§9.6)", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(false);
    const sb = makeSupabase({});
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("turnstile_failed");
    expect(sb.upsert).not.toHaveBeenCalled();
  });
});
