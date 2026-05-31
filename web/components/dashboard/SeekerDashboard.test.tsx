import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signOut: vi.fn().mockResolvedValue({}) } }),
}));

import { SeekerDashboard, type SeekerStats, type SavedJob } from "./SeekerDashboard";

// story-jobs-16 C6: `interview` added as fourth status.
const stats: SeekerStats = { total: 5, submitted: 2, reviewed: 2, interview: 0, rejected: 1, saved: 0 };

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

  it("does NOT render a 'Profile views' tile (AC#1)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).queryByText("Profile views")).toBeNull();
  });

  it("does NOT render a 'Match score' tile (AC#1)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).queryByText("Match score")).toBeNull();
  });

  it("stat grid contains exactly the 2 modeled stat cards with no empty placeholder cells (AC#5)", () => {
    renderDash();
    const grid = screen.getByTestId("seeker-stats");
    expect(within(grid).queryByText("—")).toBeNull();
    expect(within(grid).getByText("Applications")).toBeInTheDocument();
    expect(within(grid).getByText("Saved jobs")).toBeInTheDocument();
  });
});

describe("SeekerDashboard interview status (story-jobs-16 C6)", () => {
  it("renders an Interview filter chip in the filter bar (AC C6)", () => {
    renderDash();
    expect(screen.getByRole("link", { name: "Interview" })).toBeInTheDocument();
  });

  it("shows an Interview pill for a status=interview application row (AC C6)", () => {
    render(
      <SeekerDashboard
        fullName="Sam Patel"
        applications={[
          {
            id: "a1",
            status: "interview",
            applied_at: "2026-01-01T09:00:00Z",
            job: { id: "j1", title: "QA Manager", company_name: "Amul", location: "Mumbai" },
          },
        ]}
        activeFilter="all"
        stats={{ ...stats }}
        savedJobs={[]}
      />,
    );
    // The filter chip and the status pill both say "Interview"
    const all = screen.getAllByText("Interview");
    expect(all.length).toBeGreaterThanOrEqual(2);
    // One of them should be the status pill (a span, not a link)
    const pill = all.find((el) => el.tagName === "SPAN");
    expect(pill).toBeTruthy();
  });
});

describe("SeekerDashboard saved jobs (story-jobs-16 D7)", () => {
  const savedJobs: SavedJob[] = [
    {
      id: "j1",
      title: "QA Lead",
      company_name: "Amul",
      location: "Anand",
      salary_min: 800000,
      salary_max: 1200000,
    },
  ];

  it("renders salary line on the saved job row (AC D7)", () => {
    render(
      <SeekerDashboard
        fullName="Sam Patel"
        applications={[]}
        activeFilter="all"
        stats={{ ...stats, saved: 1 }}
        savedJobs={savedJobs}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Saved jobs" }));
    const row = screen.getByTestId("saved-job-row");
    expect(within(row).getByTestId("saved-job-salary")).toHaveTextContent("LPA");
  });

  it("CTA on saved job row says 'Apply' (AC D7)", () => {
    render(
      <SeekerDashboard
        fullName="Sam Patel"
        applications={[]}
        activeFilter="all"
        stats={{ ...stats, saved: 1 }}
        savedJobs={savedJobs}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Saved jobs" }));
    expect(screen.getByTestId("saved-job-apply-cta")).toHaveTextContent("Apply");
    expect(screen.queryByText(/View.*apply/i)).toBeNull();
  });
});
