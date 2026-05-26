import { describe, it, expect } from "vitest";
import { resetRequestSchema, resetConfirmSchema } from "./reset-password";

describe("resetRequestSchema (story-auth-04)", () => {
  it("accepts a valid email, rejects a malformed one", () => {
    expect(resetRequestSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
    expect(resetRequestSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("resetConfirmSchema (story-auth-04)", () => {
  it("accepts a matching password of at least 8 chars", () => {
    expect(
      resetConfirmSchema.safeParse({ password: "newpassword", confirm: "newpassword" }).success,
    ).toBe(true);
  });

  it("rejects a password shorter than 8 chars", () => {
    expect(resetConfirmSchema.safeParse({ password: "short7!", confirm: "short7!" }).success).toBe(
      false,
    );
  });

  it("rejects a confirmation mismatch with a path-scoped error", () => {
    const r = resetConfirmSchema.safeParse({ password: "newpassword", confirm: "different1" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.confirm?.[0]).toBe("Passwords don't match.");
    }
  });
});
