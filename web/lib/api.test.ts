import { describe, it, expect } from "vitest";
import { ok, err, fieldErrors } from "@/lib/api";

describe("api envelope", () => {
  it("ok() wraps data with ok:true", async () => {
    const res = ok({ hello: "world" });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, data: { hello: "world" } });
  });

  it("ok() omits data when undefined", async () => {
    const res = ok();
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("err() sets code/message/status", async () => {
    const res = err("invalid_body", "bad", 400, { email: "required" });
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: { code: "invalid_body", message: "bad", fields: { email: "required" } },
    });
  });

  it("fieldErrors() flattens first message per field", () => {
    expect(fieldErrors({ email: ["Invalid"], name: undefined, msg: [] })).toEqual({
      email: "Invalid",
    });
  });
});
