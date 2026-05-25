import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { TemplateCard } from "./TemplateCard";
import type { Resource } from "@/lib/resources";

const template: Resource = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "HACCP Plan Template — Dairy Processing",
  slug: "haccp-plan-template-dairy",
  description: "Complete HACCP plan structure with hazard analysis and monitoring forms.",
  category: "haccp",
  file_type: "docx",
  is_free: true,
  download_count: 1840,
};

describe("TemplateCard (templates-01 §3.2)", () => {
  it("renders category tag, file-format badge, title, description, downloads + View; links whole card to detail", () => {
    render(<TemplateCard template={template} />);
    expect(screen.getByText("HACCP")).toBeInTheDocument(); // category label (rotation)
    expect(screen.getByText("DOCX")).toBeInTheDocument(); // file-format badge, uppercased
    expect(
      screen.getByRole("heading", { name: /HACCP Plan Template — Dairy Processing/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Complete HACCP plan structure/)).toBeInTheDocument();
    expect(screen.getByText("1,840 downloads")).toBeInTheDocument();
    expect(screen.getByText("View")).toBeInTheDocument();
    // whole-card stretched link → detail page
    expect(screen.getByRole("link", { name: /View HACCP Plan Template/ })).toHaveAttribute(
      "href",
      "/templates/haccp-plan-template-dairy",
    );
  });

  it("has a download icon-button and never shows a 'Free' badge (AC#7)", () => {
    render(<TemplateCard template={template} />);
    expect(
      screen.getByRole("button", { name: /Download HACCP Plan Template/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/free/i)).not.toBeInTheDocument();
  });

  it("has no serious a11y violations — download control is a sibling, not nested in the card link", async () => {
    const { container } = render(<TemplateCard template={template} />);
    const results = await axe.run(container, { resultTypes: ["violations"] });
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toHaveLength(0);
  });
});
