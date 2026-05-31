import { describe, it, expect } from "vitest";
import config from "@/tailwind.config";

// AC#1 — tailwind.config exposes the design tokens as theme colors, each bound to a
// `--color-*` custom property declared in globals.css :root.
describe("tailwind theme tokens", () => {
  const colors = (config.theme?.extend?.colors ?? {}) as Record<string, string>;

  it.each([
    ["primary", "var(--color-primary)"],
    ["secondary", "var(--color-secondary)"],
    ["accent", "var(--color-accent)"],
    ["background", "var(--color-background)"],
    ["text", "var(--color-text)"],
    ["muted", "var(--color-muted)"],
    ["border", "var(--color-border)"],
    ["card-bg", "var(--color-card-bg)"],
    ["surface-light", "var(--color-surface-light)"],
  ])("exposes %s → %s", (key, value) => {
    expect(colors[key]).toBe(value);
  });

  it("registers the four typography roles", () => {
    const fonts = (config.theme?.extend?.fontFamily ?? {}) as Record<string, string[]>;
    expect(fonts.display?.[0]).toBe("var(--font-display)");
    expect(fonts.heading?.[0]).toBe("var(--font-heading)");
    expect(fonts.body?.[0]).toBe("var(--font-body)");
    expect(fonts.mono?.[0]).toBe("var(--font-mono)");
  });
});

// story-homepage-10 — Modal entry animation (AC#1, AC#2)
describe("modal-pop animation (story-homepage-10)", () => {
  it("defines a modal-pop keyframe with translateY + scale + opacity (AC#1)", () => {
    const keyframes = (config.theme?.extend?.keyframes ?? {}) as Record<
      string,
      Record<string, Record<string, string>>
    >;
    expect(keyframes["modal-pop"]).toBeDefined();
    const from = keyframes["modal-pop"]?.["0%"];
    expect(from?.opacity).toBe("0");
    expect(from?.transform).toContain("translateY");
    expect(from?.transform).toContain("scale");
  });

  it("registers animate-modal-pop utility (~280ms, cubic-bezier spring) (AC#1)", () => {
    const animations = (config.theme?.extend?.animation ?? {}) as Record<string, string>;
    expect(animations["modal-pop"]).toBeDefined();
    expect(animations["modal-pop"]).toContain("modal-pop");
    expect(animations["modal-pop"]).toContain("280ms");
  });
});
