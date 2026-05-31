import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation so SortSelect can be rendered in a unit test.
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/templates",
  useSearchParams: () => new URLSearchParams(""),
}));

import { SortSelect } from "./SortSelect";

const TEMPLATE_SORT_OPTIONS = [
  { value: "popular", label: "Most downloaded" },
  { value: "recent", label: "Most recent" },
];

describe("SortSelect (templates-05 AC#1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders default blog options when no options prop is provided", () => {
    render(<SortSelect />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Newest first")).toBeInTheDocument();
    expect(screen.getByText("Oldest first")).toBeInTheDocument();
  });

  it("renders template-specific options when passed: Most downloaded / Most recent", () => {
    render(
      <SortSelect
        options={TEMPLATE_SORT_OPTIONS}
        defaultValue="popular"
        srLabel="Sort templates"
      />,
    );
    expect(screen.getByText("Most downloaded")).toBeInTheDocument();
    expect(screen.getByText("Most recent")).toBeInTheDocument();
    // Excludes any page-count option — no 'Shortest' (AC#2)
    expect(screen.queryByText(/shortest/i)).not.toBeInTheDocument();
  });

  it("defaults to 'popular' (Most downloaded) for templates (AC#1)", () => {
    render(
      <SortSelect options={TEMPLATE_SORT_OPTIONS} defaultValue="popular" srLabel="Sort templates" />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("popular");
  });

  it("calls router.push with the updated sort param when selection changes (AC#1)", () => {
    render(
      <SortSelect options={TEMPLATE_SORT_OPTIONS} defaultValue="popular" srLabel="Sort templates" />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "recent" } });
    expect(mockPush).toHaveBeenCalledWith("/templates?sort=recent");
  });

  it("has a screen-reader label via the srLabel prop", () => {
    const { container } = render(
      <SortSelect options={TEMPLATE_SORT_OPTIONS} defaultValue="popular" srLabel="Sort templates" />,
    );
    // sr-only span contains the label text
    expect(container.querySelector(".sr-only")).toHaveTextContent("Sort templates");
  });
});
