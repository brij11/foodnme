import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * story-homepage-13: cosmetic-polish AC1 + AC3
 *
 * The About page is a Next.js server component. We verify the stat constants
 * directly from the page source rather than rendering it, which avoids the need
 * for an SSR environment setup.
 */

const aboutPageSrc = readFileSync(
  join(
    import.meta.dirname ?? __dirname,
    "page.tsx",
  ),
  "utf8",
);

const authShellSrc = readFileSync(
  join(
    import.meta.dirname ?? __dirname,
    "../../../components/auth/AuthShell.tsx",
  ),
  "utf8",
);

describe("About page stats (story-homepage-13)", () => {
  it("newsletter-subscriber stat is '4.2k' (§5.2 approximate style), not '4,200+' (AC1/D5)", () => {
    expect(aboutPageSrc).not.toContain("4,200+");
    expect(aboutPageSrc).toContain('"4.2k"');
  });

  it("no stat in the About page uses round-thousand format (§5.2 spot-check / AC3)", () => {
    // Regex: string literal "N,000+" (the prohibited pattern: round thousand with +)
    expect(aboutPageSrc).not.toMatch(/"\d+,000\+"/);
    // E.g. "4,200+" would match this broader pattern
    expect(aboutPageSrc).not.toMatch(/"\d,\d00\+"/);
  });
});

describe("Cross-surface round-thousand stat spot-check (story-homepage-13 AC3)", () => {
  it("AuthShell login panel uses '4.2k' not '4,200+'", () => {
    expect(authShellSrc).not.toContain("4,200+");
    expect(authShellSrc).toContain("4.2k");
  });
});
