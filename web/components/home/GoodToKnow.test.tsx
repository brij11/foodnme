import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GoodToKnow } from "./GoodToKnow";

describe("GoodToKnow (story-homepage-06)", () => {
  it("renders the 5 static Q&As verbatim (AC#7)", () => {
    render(<GoodToKnow />);
    const questions = screen.getAllByRole("heading", { level: 3 });
    expect(questions).toHaveLength(5);
    expect(screen.getByText("How do you decide which templates to publish?")).toBeInTheDocument();
    expect(screen.getByText("Who writes the articles?")).toBeInTheDocument();
    expect(screen.getByText("How do you vet the experts?")).toBeInTheDocument();
    expect(screen.getByText("Where are you based?")).toBeInTheDocument();
    expect(screen.getByText("Can I trust the jobs board?")).toBeInTheDocument();
  });

  it("links to the full About page (AC#7)", () => {
    render(<GoodToKnow />);
    expect(screen.getByRole("link", { name: /Read the full About page/ })).toHaveAttribute(
      "href",
      "/about",
    );
  });

  it("keeps the section heading at H2 (page H1 stays the hero)", () => {
    render(<GoodToKnow />);
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/how foodnme works/);
  });
});
