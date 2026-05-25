import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ArticleBody } from "./ArticleBody";

describe("Breadcrumb (blog-02 AC#3)", () => {
  it("links every crumb that has an href — incl. the trailing category (links out)", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: "Food Safety", href: "/blog/category/food-safety" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    expect(screen.getByRole("link", { name: "Food Safety" })).toHaveAttribute(
      "href",
      "/blog/category/food-safety",
    );
  });

  it("renders an href-less crumb as the current page", () => {
    render(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services" }]} />);
    expect(screen.getByText("Services")).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Services" })).not.toBeInTheDocument();
  });
});

describe("ArticleBody fallback (blog-02 AC#7)", () => {
  it("renders paragraphs and ##/### headings from markdown", () => {
    render(<ArticleBody mdx={"## Heading two\n\nA paragraph.\n\n### Heading three"} />);
    expect(screen.getByRole("heading", { level: 2, name: "Heading two" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Heading three" })).toBeInTheDocument();
    expect(screen.getByText("A paragraph.")).toBeInTheDocument();
  });
});
