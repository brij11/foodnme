import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { AuthShell, type AuthContext } from "./AuthShell";

// Per-context panel copy, ported from `design/screens-auth.jsx` (AuthSidePanel).
// Asserting it here locks parity with the prototype (story-auth-08 AC#2).
const EXPECTED: Record<AuthContext, { heading: string; features: string[] }> = {
  login: {
    heading: "Welcome back to foodnme.",
    features: [
      "100+ active job listings across India",
      "Vetted experts available for short engagements",
      "Templates, articles, and weekly newsletter",
      "Trusted by 4.2k food-tech professionals",
    ],
  },
  register: {
    heading: "Join the food-tech community.",
    features: [
      "Build a profile recruiters actually find",
      "Apply with one click using your saved resume",
      "Track applications and saved jobs in one place",
      "Get curated job alerts every week",
    ],
  },
  reset: {
    heading: "Forgot your password?",
    features: [
      "We'll email you a secure reset link",
      "Links expire in 30 minutes",
      "Never reused — every request issues a fresh link",
    ],
  },
};

const CONTEXTS: AuthContext[] = ["login", "register", "reset"];

describe("AuthShell brand panel (story-auth-08)", () => {
  it("renders a two-column desktop grid wrapping panel + form (AC#1, #5)", () => {
    const { container } = render(
      <AuthShell context="login">
        <h1>Welcome back</h1>
      </AuthShell>,
    );
    // One shared layout: a grid that becomes two columns at `lg`.
    const grid = container.firstElementChild as HTMLElement;
    expect(grid.className).toContain("lg:grid-cols-2");
    expect(grid.className).toContain("min-h-screen");
    // Both columns present: the brand <aside> panel and the form <main>.
    expect(container.querySelector("aside")).not.toBeNull();
    expect(container.querySelector("main")).not.toBeNull();
  });

  it("hides the panel below `lg` and shows it from `lg` up — collapses to form-only on mobile (AC#3)", () => {
    const { container } = render(
      <AuthShell context="login">
        <h1>Welcome back</h1>
      </AuthShell>,
    );
    const aside = container.querySelector("aside") as HTMLElement;
    // Tailwind `hidden lg:flex` = not rendered on mobile, flex column from `lg`.
    expect(aside.className).toContain("hidden");
    expect(aside.className).toContain("lg:flex");
    // The form column is never hidden.
    const main = container.querySelector("main") as HTMLElement;
    expect(main.className).not.toContain("hidden");
  });

  it.each(CONTEXTS)(
    "renders the %s panel heading + feature list matching the prototype (AC#2)",
    (context) => {
      const { container } = render(
        <AuthShell context={context}>
          <h1>Form heading</h1>
        </AuthShell>,
      );
      const aside = container.querySelector("aside") as HTMLElement;
      const panel = within(aside);
      // Panel headline is an h2 (form keeps the single h1) — AC#6 heading order.
      const h2 = panel.getByRole("heading", { level: 2 });
      expect(h2).toHaveTextContent(EXPECTED[context].heading);
      for (const feature of EXPECTED[context].features) {
        expect(panel.getByText(feature)).toBeInTheDocument();
      }
      // Each feature carries a check icon (rendered as an inline svg).
      expect(aside.querySelectorAll("svg").length).toBeGreaterThanOrEqual(
        EXPECTED[context].features.length,
      );
    },
  );

  it("keeps a single h1 for the form and an h2 for the panel — accessible heading order (AC#6)", () => {
    render(
      <AuthShell context="register">
        <h1>Join foodnme</h1>
      </AuthShell>,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Join foodnme");
    // Panel contributes exactly one h2, never a competing h1.
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
  });

  it("contains no emoji in the panel copy (AC#6)", () => {
    const { container } = render(
      <AuthShell context="login">
        <h1>Welcome back</h1>
      </AuthShell>,
    );
    const aside = container.querySelector("aside") as HTMLElement;
    // Match emoji / pictographic codepoints.
    expect(aside.textContent ?? "").not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
