// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: vi.fn() }));
vi.mock("@/lib/email/zeptomail", () => ({ sendEmail: vi.fn().mockResolvedValue({ sent: true }) }));
vi.mock("@/lib/idempotency", () => ({
  getCachedResponse: vi.fn().mockResolvedValue(null),
  cacheResponse: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyTurnstile } from "@/lib/turnstile";

function authClient(user: { id: string } | null, role = "seeker") {
  const maybeSingle = vi.fn().mockResolvedValue({ data: user ? { role } : null });
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }) })),
  };
}
function serviceClient({ jobStatus = "active", insertError = null as { code?: string; message: string } | null } = {}) {
  const jobMaybe = vi.fn().mockResolvedValue({ data: { id: "j", status: jobStatus, title: "QA", employer_id: "emp" }, error: null });
  const empMaybe = vi.fn().mockResolvedValue({ data: { email: "emp@x.test", full_name: "Emp" }, error: null });
  const insert = vi.fn().mockResolvedValue({ error: insertError });
  const from = vi.fn((t: string) =>
    t === "jobs"
      ? { select: () => ({ eq: () => ({ maybeSingle: jobMaybe }) }) }
      : t === "applications"
        ? { insert }
        : { select: () => ({ eq: () => ({ maybeSingle: empMaybe }) }) },
  );
  return { client: { from }, insert };
}
function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/applications", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  }) as never;
}

const valid = {
  job_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  resume_url: "http://localhost/storage/resumes/x.pdf",
  cover_note: "Keen to apply.",
  turnstile_token: "tok",
};

beforeEach(() => vi.clearAllMocks());

describe("POST /api/applications (story-jobs-06)", () => {
  it("seeker happy path → insert submitted + notify employer", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(createClient).mockReturnValue(authClient({ id: "s" }, "seeker") as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(svc.insert).toHaveBeenCalledWith(expect.objectContaining({ applicant_id: "s", status: "submitted" }));
  });

  it("duplicate (unique violation) → 409", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(createClient).mockReturnValue(authClient({ id: "s" }) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient({ insertError: { code: "23505", message: "dup" } }).client as never);
    expect((await POST(req(valid))).status).toBe(409);
  });

  it("inactive job → 400", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(createClient).mockReturnValue(authClient({ id: "s" }) as never);
    const svc = serviceClient({ jobStatus: "closed" });
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(400);
    expect(svc.insert).not.toHaveBeenCalled();
  });

  it("non-seeker → 403", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(createClient).mockReturnValue(authClient({ id: "e" }, "employer") as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    expect((await POST(req(valid))).status).toBe(403);
    expect(svc.insert).not.toHaveBeenCalled();
  });

  it("failed Turnstile → 400", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(false);
    vi.mocked(createClient).mockReturnValue(authClient({ id: "s" }) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    expect((await POST(req(valid))).status).toBe(400);
  });

  it("unauthenticated → 401", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(createClient).mockReturnValue(authClient(null) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    expect((await POST(req(valid))).status).toBe(401);
  });
});
