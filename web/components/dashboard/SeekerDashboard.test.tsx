import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signOut: vi.fn().mockResolvedValue({}) } }),
}));

import { SeekerDashboard, type SeekerStats } from "./SeekerDashboard";

const stats: SeekerStats = { total: 5, submitted: 2, reviewed: 2, rejected: 1, saved: 0 };

function renderDash(overrides: Partial<SeekerStats> = {}) {
  return render(
    <SeekerDashboard
      fullName="Sam Patel"
      applications={[]}
      activeFilter="all"
      stats={{ ...stats, ...overrides }}
      savedJobs={[]}
    />,
  );
}

describe("SeekerDashboard stats grid (story-auth-10)", () => {
  it("shows the Applications total (AC#1)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).getByText("Applications")).toBeInTheDocument();
    expect(within(grid).getByText("5")).toBeInTheDocument();
  });

  it("shows the Saved jobs count (AC#1)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).getByText("Saved jobs")).toBeInTheDocument();
    expect(within(grid).getByText("0")).toBeInTheDocument();
  });

  // story-auth-10 AC#1: Profile views tile removed entirely — no "—" placeholder
  it("does NOT render a 'Profile views' tile (AC#1)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).queryByText("Profile views")).toBeNull();
  });

  // story-auth-10 AC#1: Match score tile removed entirely — no "—" placeholder
  it("does NOT render a 'Match score' tile (AC#1)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).queryByText("Match score")).toBeNull();
  });

  // story-auth-10 AC#5: grid reflows cleanly with 2 tiles — no stray em-dash placeholder
  it("stat grid contains exactly the 2 modeled stat cards with no empty placeholder cells (AC#5)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).queryByText("\u2014")).toBeNull();
    expect(within(grid).getByText("Applications")).toBeInTheDocument();
    expect(within(grid).getByText("Saved jobs")).toBeInTheDocument();
  });
});
