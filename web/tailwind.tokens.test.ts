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
