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

const jobs: EmployerJob[] = [
  { id: "j1", title: "QA Manager", status: "active", applicant_count: 2 },
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

describe("EmployerDashboard stats + applicants (story-jobs-14)", () => {
  it("renders the 4-card stats grid with Avg time-to-hire as '—' (AC#1, #7)", () => {
    renderDash();
    const grid = screen.getByTestId("employer-stats");
    expect(within(grid).getByText("Active listings")).toBeInTheDocument();
    expect(within(grid).getByText("Total applicants")).toBeInTheDocument();
    expect(within(grid).getByText("Pending review")).toBeInTheDocument();
    expect(within(grid).getByText("Avg. time to hire")).toBeInTheDocument();
    expect(within(grid).getByText("—")).toBeInTheDocument(); // never fabricated
  });

  it("Applicants tab lists candidate, role, status, and a resume link (AC#2, #3, #4)", () => {
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

  it("shows an empty state when no applicants (AC#6)", () => {
    renderDash({ applicants: [] });
    fireEvent.click(screen.getByRole("button", { name: "Applicants" }));
    expect(screen.getByText("No applicants yet")).toBeInTheDocument();
    expect(screen.queryByTestId("applicant-row")).toBeNull();
  });
});
