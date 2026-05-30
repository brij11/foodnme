// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: vi.fn() }));
vi.mock("@/lib/email/zeptomail", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));

import { POST } from "./route";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email/zeptomail";
import { createServiceClient } from "@/lib/supabase/service";

function makeSupabase(expert: Record<string, unknown> | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: expert, error: null });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  // story-experts-11: the route persists the inquiry (from("expert_inquiries").insert(...)).
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({ select, insert }));
  return { client: { from }, from, maybeSingle, insert };
}

function req(body: unknown) {
  return new Request("http://localhost/api/expert-inquiry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

const EXPERT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"; // valid v4 uuid (variant bits matter in zod v4)
const valid = {
  expert_id: EXPERT_ID,
  full_name: "Test Visitor",
  email: "visitor@example.com",
  message: "We need a HACCP audit for our new dairy line before certification.",
  turnstile_token: "tok",
};
const activeExpert = { full_name: "Dr. Aarti Menon", contact_email: "aarti@expert.test", status: "active" };

beforeEach(() => vi.clearAllMocks());

describe("POST /api/expert-inquiry (story-experts-03)", () => {
  it("happy path: relays to the expert (Reply-To = visitor) + confirms to the visitor → { ok: true }", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(sendEmail).mockResolvedValue({ sent: true });
    const sb = makeSupabase(activeExpert);
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(sb.from).toHaveBeenCalledWith("experts");
    // story-experts-11: the inquiry is persisted before the relay.
    expect(sb.from).toHaveBeenCalledWith("expert_inquiries");
    expect(sb.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        expert_id: EXPERT_ID,
        sender_name: "Test Visitor",
        sender_email: "visitor@example.com",
        message: valid.message,
      }),
    );
    expect(sendEmail).toHaveBeenCalledTimes(2);
    const relay = vi.mocked(sendEmail).mock.calls[0]![0];
    expect(relay.to).toBe("aarti@expert.test");
    expect(relay.replyTo).toBe("visitor@example.com");
    expect(relay.subject).toBe("New inquiry via foodnme — Test Visitor");
    const confirm = vi.mocked(sendEmail).mock.calls[1]![0];
    expect(confirm.to).toBe("visitor@example.com");
    expect(confirm.subject).toContain("has been delivered");
  });

  it("never leaks the expert contact_email in the response", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(sendEmail).mockResolvedValue({ sent: true });
    vi.mocked(createServiceClient).mockReturnValue(makeSupabase(activeExpert).client as never);
    const res = await POST(req(valid));
    expect(JSON.stringify(await res.json())).not.toContain("aarti@expert.test");
  });

  it("invalid body → 400, no Turnstile / lookup", async () => {
    const sb = makeSupabase(activeExpert);
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);
    const res = await POST(req({ ...valid, message: "too short" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_body");
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(sb.from).not.toHaveBeenCalled();
  });

  it("failed Turnstile → 400, no lookup", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(false);
    const sb = makeSupabase(activeExpert);
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("turnstile_failed");
    expect(sb.from).not.toHaveBeenCalled();
  });

  it("missing expert → 404, no relay", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(createServiceClient).mockReturnValue(makeSupabase(null).client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(404);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("inactive expert → 404", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(createServiceClient).mockReturnValue(
      makeSupabase({ ...activeExpert, status: "pending" }).client as never,
    );
    const res = await POST(req(valid));
    expect(res.status).toBe(404);
  });

  it("genuine relay failure (not the local no-key skip) → 502, no confirmation", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(sendEmail).mockResolvedValueOnce({ sent: false }); // relay fails
    vi.mocked(createServiceClient).mockReturnValue(makeSupabase(activeExpert).client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(502);
    expect(sendEmail).toHaveBeenCalledTimes(1); // confirmation never attempted
  });

  it("local no-key skip is treated as delivered → 200", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(sendEmail).mockResolvedValue({ sent: false, skipped: true });
    vi.mocked(createServiceClient).mockReturnValue(makeSupabase(activeExpert).client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
  });
});
