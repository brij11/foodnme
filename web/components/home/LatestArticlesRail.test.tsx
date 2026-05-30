import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LatestArticlesRail } from "./LatestArticlesRail";
import type { ArticleListItem } from "@/lib/articles";

function article(slug: string, title: string): ArticleListItem {
  return {
    title,
    slug,
    excerpt: "",
    category: "food-safety",
    tags: [],
    cover_image_url: null,
    author_name: "Test Author",
    author: {
      id: "1",
      full_name: "Test Author",
      title: "Auditor",
      avatar_url: null,
      bio: "",
      specializations: [],
      linkedin_url: null,
      twitter_url: null,
    },
    read_time_mins: 6,
    published_at: "2026-05-01T00:00:00Z",
  };
}

describe("LatestArticlesRail (story-homepage-04)", () => {
  it("renders each article as a compact link to /blog/[slug] (AC#1,#3)", () => {
    render(
      <LatestArticlesRail
        articles={[
          article("a", "Article A"),
          article("b", "Article B"),
          article("c", "Article C"),
          article("d", "Article D"),
        ]}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Article A/ })).toHaveAttribute("href", "/blog/a");
    expect(screen.getByRole("link", { name: /Article D/ })).toHaveAttribute("href", "/blog/d");
  });

  it("does NOT re-render the section header or an 'All articles' link (owned by the shell, AC#2)", () => {
    render(<LatestArticlesRail articles={[article("a", "Article A")]} />);
    expect(screen.queryByText("From the Knowledge Hub")).toBeNull();
    expect(screen.queryByRole("link", { name: /All articles/ })).toBeNull();
  });

  it("renders only the articles available — no placeholder rows (short-list, AC#6)", () => {
    render(
      <LatestArticlesRail articles={[article("a", "Article A"), article("b", "Article B")]} />,
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("renders nothing when there are no articles", () => {
    const { container } = render(<LatestArticlesRail articles={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("guards stagger motion with motion-reduce:animate-none (AC#4, §4.10)", () => {
    render(<LatestArticlesRail articles={[article("a", "Article A")]} />);
    const item = screen.getByRole("link", { name: /Article A/ }).closest("li");
    expect(item?.className).toContain("motion-reduce:animate-none");
    expect(item?.className).toContain("animate-fade-up");
  });
});
