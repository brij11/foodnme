import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KnowledgeHubSection } from "./KnowledgeHubSection";

describe("KnowledgeHubSection (story-homepage-05 #4 container)", () => {
  it("renders the header, the All-articles link, and the children slot (AC#2)", () => {
    render(
      <KnowledgeHubSection>
        <div data-testid="slot-child">feature + rail</div>
      </KnowledgeHubSection>,
    );
    expect(screen.getByText(/This week's read/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "From the Knowledge Hub" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /All articles/ })).toHaveAttribute("href", "/blog");
    expect(screen.getByTestId("slot-child")).toBeInTheDocument();
  });
});
