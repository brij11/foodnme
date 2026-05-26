import { describe, it, expect } from "vitest";
import { detectMime, validateUpload } from "./upload";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0]);
const garbage = new Uint8Array([0x00, 0x01, 0x02, 0x03]);

describe("detectMime (story-experts-05, §9.2)", () => {
  it("sniffs image + document signatures from leading bytes", () => {
    expect(detectMime(png)).toBe("image/png");
    expect(detectMime(jpeg)).toBe("image/jpeg");
    expect(detectMime(webp)).toBe("image/webp");
    expect(detectMime(pdf)).toBe("application/pdf");
    expect(detectMime(zip)).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(detectMime(garbage)).toBeNull();
  });
});

describe("validateUpload (story-experts-05)", () => {
  it("accepts a PNG avatar within the size cap", () => {
    const r = validateUpload("avatar", png);
    expect(r).toEqual({ ok: true, mime: "image/png", ext: "png" });
  });

  it("rejects an oversized avatar with 413", () => {
    const big = new Uint8Array(2 * 1024 * 1024 + 1);
    big.set(png, 0);
    const r = validateUpload("avatar", big);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(413);
  });

  it("rejects a disallowed type (PDF as avatar) with 415", () => {
    const r = validateUpload("avatar", pdf);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(415);
  });

  it("rejects a magic-byte mismatch (garbage bytes) with 415 — declared MIME is never trusted", () => {
    const r = validateUpload("avatar", garbage);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("bad_type");
  });

  it("accepts a PDF resume but rejects a PNG resume", () => {
    expect(validateUpload("resume", pdf).ok).toBe(true);
    expect(validateUpload("resume", png).ok).toBe(false);
  });
});
