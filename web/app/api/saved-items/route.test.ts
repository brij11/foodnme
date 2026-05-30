// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { POST, DELETE } from "./route";
import { createClient } from "@/lib/supabase/server";

function makeClient(user: { id: string } | null) {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const del: Record<string, unknown> = {};
  del.eq = vi.fn(() => del);
  (del as { then: unknown }).then = (resolve: (r: { error: null }) => unknown) => resolve({ error: null });
  const from = vi.fn(() => ({ upsert, delete: () => del }));
  return { client: { auth: { getUser: async () => ({ data: { user } }) }, from }, from, upsert, del };
}

function req(body: unknown) {
  return new Request("http://localhost/api/saved-items", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

const USER = { id: "00000000-0000-4000-8000-000000000001" };
const JOB = "11111111-1111-4111-8111-111111111111";
const valid = { item_type: "job", item_id: JOB };

beforeEach(() => vi.clearAllMocks());

describe("POST/DELETE /api/saved-items (story-jobs-15)", () => {
  it("authed save → idempotent upsert (onConflict) → { ok: true } (AC#4, #7)", async () => {
    const sb = makeClient(USER);
    vi.mocked(createClient).mockReturnValue(sb.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sb.from).toHaveBeenCalledWith("saved_items");
    expect(sb.upsert).toHaveBeenCalledWith(
      { user_id: USER.id, item_type: "job", item_id: JOB },
      expect.objectContaining({ onConflict: "user_id,item_type,item_id", ignoreDuplicates: true }),
    );
  });

  it("anonymous → 401, no write (AC#3 server side)", async () => {
    const sb = makeClient(null);
    vi.mocked(createClient).mockReturnValue(sb.client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(401);
    expect(sb.upsert).not.toHaveBeenCalled();
  });

  it("invalid body → 400", async () => {
    vi.mocked(createClient).mockReturnValue(makeClient(USER).client as never);
    const res = await POST(req({ item_type: "gadget", item_id: "nope" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_body");
  });

  it("DELETE removes the matching saved row (self-scoped) → { ok: true }", async () => {
    const sb = makeClient(USER);
    vi.mocked(createClient).mockReturnValue(sb.client as never);
    const res = await DELETE(req(valid));
    expect(res.status).toBe(200);
    // user_id + item_type + item_id all constrain the delete.
    expect((sb.del.eq as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("user_id", USER.id);
    expect((sb.del.eq as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("item_id", JOB);
  });
});
