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
    />,
  );
}

describe("SeekerDashboard stats grid (story-jobs-13)", () => {
  it("shows the Applications total with a per-status breakdown (AC#2)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).getByText("Applications")).toBeInTheDocument();
    expect(within(grid).getByText("5")).toBeInTheDocument();
    expect(within(grid).getByText("2 submitted · 2 reviewed · 1 closed")).toBeInTheDocument();
  });

  it("shows the Saved jobs count (0 until story-jobs-15) (AC#3)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).getByText("Saved jobs")).toBeInTheDocument();
    expect(within(grid).getByText("0")).toBeInTheDocument();
  });

  it("renders Profile views + Match score as '—' — never fabricated (AC#5)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).getByText("Profile views")).toBeInTheDocument();
    expect(within(grid).getByText("Match score")).toBeInTheDocument();
    // two em-dash placeholders, no invented numbers.
    expect(within(grid).getAllByText("—")).toHaveLength(2);
  });
});
