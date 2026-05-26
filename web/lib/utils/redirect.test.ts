import { describe, it, expect } from "vitest";
import { safeRedirect } from "./redirect";

describe("safeRedirect (open-redirect allowlist, §9.3)", () => {
  it("accepts internal absolute paths, preserving query + hash", () => {
    expect(safeRedirect("/dashboard")).toBe("/dashboard");
    expect(safeRedirect("/dashboard/seeker?tab=saved")).toBe("/dashboard/seeker?tab=saved");
    expect(safeRedirect("/jobs/123#apply")).toBe("/jobs/123#apply");
  });

  it("falls back when the value is missing or empty", () => {
    expect(safeRedirect(null)).toBe("/dashboard");
    expect(safeRedirect(undefined)).toBe("/dashboard");
    expect(safeRedirect("")).toBe("/dashboard");
  });

  it("honors a custom fallback", () => {
    expect(safeRedirect(null, "/login")).toBe("/login");
    expect(safeRedirect("https://evil.com", "/")).toBe("/");
  });

  it("rejects absolute external URLs", () => {
    expect(safeRedirect("http://evil.com")).toBe("/dashboard");
    expect(safeRedirect("https://evil.com/dashboard")).toBe("/dashboard");
  });

  it("rejects protocol-relative and backslash network-path references", () => {
    expect(safeRedirect("//evil.com")).toBe("/dashboard");
    expect(safeRedirect("/\\evil.com")).toBe("/dashboard");
    expect(safeRedirect("/\\/evil.com")).toBe("/dashboard");
  });

  it("rejects non-leading-slash inputs (relative + scheme-bearing)", () => {
    expect(safeRedirect("evil.com")).toBe("/dashboard");
    expect(safeRedirect("dashboard")).toBe("/dashboard");
    expect(safeRedirect("javascript:alert(1)")).toBe("/dashboard");
    expect(safeRedirect("mailto:x@y.com")).toBe("/dashboard");
  });

  it("rejects values smuggling control characters or whitespace", () => {
    expect(safeRedirect("/foo\n/bar")).toBe("/dashboard");
    expect(safeRedirect("/foo\tbar")).toBe("/dashboard");
    expect(safeRedirect("/ /evil.com")).toBe("/dashboard");
  });
});
