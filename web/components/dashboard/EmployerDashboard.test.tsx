import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signOut: vi.fn().mockResolvedValue({}) } }),
}));

import {
  EmployerDashboard,
  type ApplicantRow,
  type EmployerStats,
  type EmployerJob,
} from "./EmployerDashboard";

// story-jobs-16 D8: created_at added to EmployerJob type.
const jobs: EmployerJob[] = [
  { id: "j1", title: "QA Manager", status: "active", applicant_count: 2, created_at: "2020-01-01T09:00:00Z" },
];
const stats: EmployerStats = { activeListings: 1, totalApplicants: 2, pendingReview: 1 };
const applicants: ApplicantRow[] = [
  {
    id: "a1",
    candidate_name: "Sam Patel",
    job_title: "QA Manager",
    applied_at: "2026-05-20T09:00:00Z",
    status: "submitted",
    resume_signed_url: "https://signed.example/resume.pdf?token=abc",
  },
];

function renderDash(opts: { applicants?: ApplicantRow[] } = {}) {
  return render(
    <EmployerDashboard
      fullName="Emp Co"
      jobs={jobs}
      applicants={opts.applicants ?? applicants}
      stats={stats}
    />,
  );
}

describe("EmployerDashboard stats grid (story-auth-10)", () => {
  it("renders the 3 modeled stat tiles: Active listings, Total applicants, Pending review (AC#2)", () => {
    renderDash();
    const grid = screen.getByTestId("employer-stats");
    expect(within(grid).getByText("Active listings")).toBeInTheDocument();
    expect(within(grid).getByText("Total applicants")).toBeInTheDocument();
    expect(within(grid).getByText("Pending review")).toBeInTheDocument();
  });

  it("does NOT render an 'Avg. time to hire' tile (AC#2)", () => {
    renderDash();
    const grid = screen.getByTestId("employer-stats");
    expect(within(grid).queryByText("Avg. time to hire")).toBeNull();
  });

  it("stats grid has no em-dash placeholder cell (AC#5)", () => {
    renderDash();
    const grid = screen.getByTestId("employer-stats");
    expect(within(grid).queryByText("—")).toBeNull();
  });
});

describe("EmployerDashboard applicants list — no match-score column (story-auth-10 AC#3)", () => {
  it("Applicants tab lists candidate, role, status, and a resume link (AC#3)", () => {
    renderDash();
    fireEvent.click(screen.getByRole("button", { name: "Applicants" }));
    const row = screen.getByTestId("applicant-row");
    expect(within(row).getByText("Sam Patel")).toBeInTheDocument();
    expect(within(row).getByText(/QA Manager · Applied/)).toBeInTheDocument();
    expect(within(row).getByText("Submitted")).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: "View resume" })).toHaveAttribute(
      "href",
      "https://signed.example/resume.pdf?token=abc",
    );
  });

  it("applicant row does NOT display a match score percentage (AC#3)", () => {
    renderDash();
    fireEvent.click(screen.getByRole("button", { name: "Applicants" }));
    const row = screen.getByTestId("applicant-row");
    expect(within(row).queryByText(/match/i)).toBeNull();
    expect(within(row).queryByText(/%/)).toBeNull();
  });

  it("shows an empty state when no applicants (AC#3)", () => {
    renderDash({ applicants: [] });
    fireEvent.click(screen.getByRole("button", { name: "Applicants" }));
    expect(screen.getByText("No applicants yet")).toBeInTheDocument();
    expect(screen.queryByTestId("applicant-row")).toBeNull();
  });
});

describe("EmployerDashboard posted jobs row (story-jobs-16 D8)", () => {
  it("shows the posted date on the job row (AC D8)", () => {
    renderDash();
    const row = screen.getByTestId("posted-job-row");
    expect(within(row).getByText(/Posted/)).toBeInTheDocument();
    expect(within(row).getByText(/Posted.*Jan 1/)).toBeInTheDocument();
  });

  it("renders a View link (eye icon) on the job row (AC D8)", () => {
    renderDash();
    const row = screen.getByTestId("posted-job-row");
    expect(within(row).getByRole("link", { name: "View job listing" })).toHaveAttribute(
      "href",
      "/jobs/j1",
    );
  });

  it("renders a Close button for active jobs (AC D8)", () => {
    renderDash();
    const row = screen.getByTestId("posted-job-row");
    expect(within(row).getByRole("button", { name: "Close job listing" })).toBeInTheDocument();
  });
});
