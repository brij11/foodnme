import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleCard } from "./ArticleCard";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";
import type { ArticleListItem } from "@/lib/articles";

const article: ArticleListItem = {
  title: "A practical HACCP rollout",
  slug: "haccp-rollout",
  excerpt: "How to scope a HACCP plan.",
  category: "food-safety",
  tags: ["HACCP"],
  cover_image_url: "https://images.unsplash.com/photo-1?w=1200",
  author_name: "Aarti Menon",
  read_time_mins: 9,
  published_at: "2026-05-12T09:00:00Z",
};

describe("ArticleCard (AC#6)", () => {
  it("renders category tag (rotation), read-time, title, excerpt, author/date, link", () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByText("Food Safety")).toBeInTheDocument(); // category label via rotation
    expect(screen.getByText("9 min read")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /practical HACCP rollout/i })).toBeInTheDocument();
    expect(screen.getByText("How to scope a HACCP plan.")).toBeInTheDocument();
    expect(screen.getByText("Aarti Menon")).toBeInTheDocument();
    expect(screen.getByText("May 12, 2026")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/blog/haccp-rollout");
  });
});

describe("EmptyState (AC#9, §5.4)", () => {
  it("renders title + message + action — never bare 'No results'", () => {
    render(
      <EmptyState
        variant="filter"
        title="No articles here"
        message="Try another category."
        action={{ label: "Browse all", href: "/blog" }}
      />,
    );
    expect(screen.getByRole("heading", { name: "No articles here" })).toBeInTheDocument();
    expect(screen.getByText("Try another category.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse all" })).toHaveAttribute("href", "/blog");
  });
});

describe("Pagination (AC#10)", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} hrefForPage={(p) => `/blog?page=${p}`} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders numbered + prev/next links with current marked", () => {
    render(<Pagination page={2} totalPages={3} hrefForPage={(p) => `/blog?page=${p}`} />);
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/blog?page=1");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/blog?page=3");
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
  });
});
