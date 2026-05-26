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
import { getCachedResponse } from "@/lib/idempotency";

function authClient(user: { id: string } | null, role = "employer") {
  const maybeSingle = vi.fn().mockResolvedValue({ data: user ? { role } : null });
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }) })),
  };
}
function serviceClient() {
  const single = vi.fn().mockResolvedValue({ data: { id: "job-1" }, error: null });
  const insert = vi.fn(() => ({ select: () => ({ single }) }));
  return { client: { from: vi.fn(() => ({ insert })) }, insert };
}
function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/jobs", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  }) as never;
}

const future = new Date(Date.now() + 30 * 86400000).toISOString();
const valid = {
  title: "QA Manager",
  company_name: "Amul",
  location: "Anand",
  job_type: "Full-time",
  experience_level: "Senior",
  description: "Lead QA across two dairy lines and own the HACCP and supplier qualification program.",
  skills: ["HACCP"],
  expires_at: future,
  turnstile_token: "tok",
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ADMIN_EMAIL = "founder@foodnme.test";
});

describe("POST /api/jobs (story-jobs-03)", () => {
  it("employer happy path → insert pending + employer_id, returns { id }", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(createClient).mockReturnValue(authClient({ id: "emp" }, "employer") as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);

    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { id: "job-1" } });
    expect(svc.insert).toHaveBeenCalledWith(expect.objectContaining({ status: "pending", employer_id: "emp" }));
  });

  it("non-employer role → 403, no insert", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(createClient).mockReturnValue(authClient({ id: "s" }, "seeker") as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(403);
    expect(svc.insert).not.toHaveBeenCalled();
  });

  it("Zod failure (short description / salary inversion) → 400", async () => {
    vi.mocked(createClient).mockReturnValue(authClient({ id: "emp" }) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    expect((await POST(req({ ...valid, description: "short" }))).status).toBe(400);
    expect((await POST(req({ ...valid, salary_min: 200, salary_max: 100 }))).status).toBe(400);
  });

  it("failed Turnstile → 400, no insert", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(false);
    vi.mocked(createClient).mockReturnValue(authClient({ id: "emp" }) as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req(valid));
    expect(res.status).toBe(400);
    expect(svc.insert).not.toHaveBeenCalled();
  });

  it("unauthenticated → 401", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(createClient).mockReturnValue(authClient(null) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient().client as never);
    expect((await POST(req(valid))).status).toBe(401);
  });

  it("idempotency replay → returns cached id without a second insert", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true);
    vi.mocked(getCachedResponse).mockResolvedValueOnce({ id: "prior" });
    vi.mocked(createClient).mockReturnValue(authClient({ id: "emp" }) as never);
    const svc = serviceClient();
    vi.mocked(createServiceClient).mockReturnValue(svc.client as never);
    const res = await POST(req(valid, { "idempotency-key": "dup" }));
    expect(await res.json()).toEqual({ ok: true, data: { id: "prior" } });
    expect(svc.insert).not.toHaveBeenCalled();
  });
});
