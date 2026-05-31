/**
 * story-jobs-16 — B13 (sort in results header) + D9 (salary slider live readout)
 *
 * B13: The sort control (recent / salary) must appear in the results header, not in the
 *      sidebar.  We verify SortSelect renders correctly for jobs (Recent / Salary) and
 *      that the sidebar has no sort control.
 * D9:  SalarySliderIsland shows a live LPA readout that updates when the slider moves.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ──────────────────────────────────────────────────────────────────────────────
// Navigation mocks (SortSelect + SalarySliderIsland both need next/navigation)
// ──────────────────────────────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/jobs",
  useSearchParams: () => new URLSearchParams(""),
}));

// SalarySliderIsland is a client component — no server/supabase deps needed
import { SalarySliderIsland } from "./SalarySliderIsland";
import { SortSelect } from "@/components/listing/SortSelect";
import { JobsFilterSidebar } from "./JobsFilterSidebar";

// ──────────────────────────────────────────────────────────────────────────────
// AC D9 — Salary slider live readout
// ──────────────────────────────────────────────────────────────────────────────
describe("SalarySliderIsland — live LPA readout (story-jobs-16 AC D9)", () => {
  it("renders 'Any salary' when initialValue is 0 (AC D9)", () => {
    render(<SalarySliderIsland initialValue={0} />);
    expect(screen.getByTestId("salary-readout")).toHaveTextContent("Any salary");
  });

  it("renders the formatted ₹X L/yr+ readout for a non-zero initial value (AC D9)", () => {
    render(<SalarySliderIsland initialValue={1000000} />);
    // 1000000 / 100000 = 10.0 → "₹10.0 L/yr+"
    expect(screen.getByTestId("salary-readout")).toHaveTextContent("₹10.0 L/yr+");
  });

  it("updates the readout live when the slider moves (AC D9)", () => {
    render(<SalarySliderIsland initialValue={0} />);
    const slider = screen.getByRole("slider");
    // Simulate dragging to ₹5L
    fireEvent.change(slider, { target: { value: "500000" } });
    expect(screen.getByTestId("salary-readout")).toHaveTextContent("₹5.0 L/yr+");
  });

  it("has an aria-live region so screen readers announce the change (AC D9)", () => {
    render(<SalarySliderIsland initialValue={0} />);
    const readout = screen.getByTestId("salary-readout");
    expect(readout).toHaveAttribute("aria-live", "polite");
  });

  it("slider range is 0–2000000, step 100000 (AC D9)", () => {
    render(<SalarySliderIsland initialValue={0} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "2000000");
    expect(slider).toHaveAttribute("step", "100000");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// AC B13 — Sort control in results header, not the sidebar
// ──────────────────────────────────────────────────────────────────────────────
describe("Jobs sort control placement (story-jobs-16 AC B13)", () => {
  it("SortSelect renders jobs-specific options: Most recent / Highest salary (AC B13)", () => {
    const JOBS_SORT_OPTIONS = [
      { value: "recent", label: "Most recent" },
      { value: "salary", label: "Highest salary" },
    ];
    render(
      <SortSelect
        options={JOBS_SORT_OPTIONS}
        defaultValue="recent"
        srLabel="Sort jobs"
      />,
    );
    expect(screen.getByText("Most recent")).toBeInTheDocument();
    expect(screen.getByText("Highest salary")).toBeInTheDocument();
  });

  it("JobsFilterSidebar does NOT render a sort dropdown (AC B13)", () => {
    render(
      <JobsFilterSidebar q="" jobTypes={[]} experienceLevels={[]} location="" salaryMin={0} />,
    );
    // The sidebar must not have "Most recent" or "Highest salary"
    expect(screen.queryByText("Most recent")).toBeNull();
    expect(screen.queryByText("Highest salary")).toBeNull();
    // And no sort option at all
    expect(screen.queryByText("Sort:")).toBeNull();
  });

  it("JobsFilterSidebar has a salary slider for the filter rail (no regression)", () => {
    render(
      <JobsFilterSidebar q="" jobTypes={[]} experienceLevels={[]} location="" salaryMin={0} />,
    );
    expect(screen.getByTestId("jobs-filter-sidebar")).toBeInTheDocument();
    // fallback readout visible (no island injected in this test)
    expect(screen.getByTestId("salary-readout-fallback")).toBeInTheDocument();
  });

  it("SortSelect with jobs options defaults to 'recent' (AC B13)", () => {
    const JOBS_SORT_OPTIONS = [
      { value: "recent", label: "Most recent" },
      { value: "salary", label: "Highest salary" },
    ];
    render(
      <SortSelect options={JOBS_SORT_OPTIONS} defaultValue="recent" srLabel="Sort jobs" />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("recent");
  });
});
