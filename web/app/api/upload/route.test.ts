// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));

import { POST } from "./route";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

function authClient(user: { id: string } | null, role = "expert", isAdmin = false) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: user ? { role, is_admin: isAdmin } : null });
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }) })),
  };
}

function serviceClient({ uploadError = null as { message: string } | null } = {}) {
  const upload = vi.fn().mockResolvedValue({ error: uploadError });
  const list = vi.fn().mockResolvedValue({ data: [] });
  const remove = vi.fn().mockResolvedValue({ data: [] });
  const getPublicUrl = vi.fn(() => ({ data: { publicUrl: "http://localhost/storage/avatars/x.png" } }));
  return { client: { storage: { from: () => ({ upload, list, remove, getPublicUrl }) } }, upload };
}

function uploadReq(kind: string, bytes: Uint8Array, type = "image/png") {
  const fd = new FormData();
  fd.set("kind", kind);
  fd.set("file", new Blob([Buffer.from(bytes)], { type }), "a.bin");
  return new Request("http://localhost/api/upload", { method: "POST", body: fd }) as never;
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/upload (story-experts-05)", () => {
  it("expert uploads a valid PNG avatar → 200 { url, path }", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "u1" }, "expert") as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await POST(uploadReq("avatar", PNG));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.url).toContain("avatars");
    expect(body.data.path).toMatch(/^u1\/[0-9a-f-]+\.png$/);
    expect(svc.upload).toHaveBeenCalled();
  });

  it("unauthenticated → 401", async () => {
    vi.mocked(createClient).mockReturnValue(authClient(null) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    const res = await POST(uploadReq("avatar", PNG));
    expect(res.status).toBe(401);
  });

  it("wrong role (seeker uploading an avatar) → 403", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "u1" }, "seeker") as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(uploadReq("avatar", PNG));
    expect(res.status).toBe(403);
    expect(svc.upload).not.toHaveBeenCalled();
  });

  it("wrong file type (PDF as avatar) → 415, no upload", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "u1" }, "expert") as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(uploadReq("avatar", PDF, "image/png")); // lies about type
    expect(res.status).toBe(415);
    expect(svc.upload).not.toHaveBeenCalled();
  });
});
