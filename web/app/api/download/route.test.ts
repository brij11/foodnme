// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));
// Idempotency no-ops without Upstash; force the no-op path explicitly so tests are hermetic.
vi.mock("@/lib/idempotency", () => ({
  getCachedResponse: vi.fn().mockResolvedValue(null),
  cacheResponse: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";
import { createServiceClient } from "@/lib/supabase/service";

// A valid v4 UUID (Zod 4's .uuid() enforces the RFC version/variant nibbles, as gen_random_uuid does).
const TEMPLATE_ID = "11111111-1111-4111-8111-111111111111";

function makeSupabase({
  rpcRows = [{ file_url: "haccp-plan-template-dairy.docx" }] as { file_url: string | null }[] | null,
  rpcError = null as { message: string } | null,
  signedUrl = "http://127.0.0.1:54321/storage/v1/object/sign/templates/x?token=abc",
  signError = null as { message: string } | null,
} = {}) {
  const rpc = vi.fn().mockResolvedValue({ data: rpcRows, error: rpcError });
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({ upsert }));
  const createSignedUrl = vi
    .fn()
    .mockResolvedValue({ data: signError ? null : { signedUrl }, error: signError });
  const storageFrom = vi.fn(() => ({ createSignedUrl }));
  return { client: { rpc, from, storage: { from: storageFrom } }, rpc, upsert, from, createSignedUrl, storageFrom };
}

function req(body: unknown) {
  return new Request("http://localhost/api/download", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

describe("POST /api/download", () => {
  beforeEach(() => vi.clearAllMocks());

  it("happy path: increments counter + returns a signed download_url (AC#2, AC#4, AC#5)", async () => {
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req({ template_id: TEMPLATE_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.download_url).toContain("/storage/v1/object/sign/templates/");
    expect(sb.rpc).toHaveBeenCalledWith("increment_template_download", { p_template_id: TEMPLATE_ID });
    expect(sb.createSignedUrl).toHaveBeenCalledWith("haccp-plan-template-dairy.docx", 60);
    expect(sb.upsert).not.toHaveBeenCalled(); // no email → no capture
  });

  it("upserts the email into newsletter_subscribers when provided (AC#3)", async () => {
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req({ template_id: TEMPLATE_ID, email: "qa@dairy.in" }));
    expect(res.status).toBe(200);
    expect(sb.from).toHaveBeenCalledWith("newsletter_subscribers");
    expect(sb.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ email: "qa@dairy.in", source: "template_detail", is_active: true }),
      { onConflict: "email" },
    );
  });

  it("download still succeeds when the email capture fails (ungated)", async () => {
    const sb = makeSupabase();
    sb.upsert.mockResolvedValueOnce({ error: { message: "boom" } });
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req({ template_id: TEMPLATE_ID, email: "qa@dairy.in" }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("invalid body → 400 invalid_body, no DB call (AC#1, AC#9)", async () => {
    const sb = makeSupabase();
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req({ template_id: "not-a-uuid" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_body");
    expect(sb.rpc).not.toHaveBeenCalled();
  });

  it("missing template → 404 not_found (AC#6)", async () => {
    const sb = makeSupabase({ rpcRows: [] });
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req({ template_id: TEMPLATE_ID }));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe("not_found");
    expect(sb.createSignedUrl).not.toHaveBeenCalled();
  });

  it("signed-url failure → 500 db_error", async () => {
    const sb = makeSupabase({ signError: { message: "object not found" } });
    vi.mocked(createServiceClient).mockReturnValue(sb.client as never);

    const res = await POST(req({ template_id: TEMPLATE_ID }));
    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe("db_error");
  });
});
