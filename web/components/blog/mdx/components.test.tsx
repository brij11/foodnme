import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { buildMdxComponents } from "./components";
import { PullQuote } from "./PullQuote";
import { CTABox } from "./CTABox";

describe("buildMdxComponents allowlist (blog-03 AC#6)", () => {
  it("exposes the allowlisted custom components + typography", () => {
    const c = buildMdxComponents("# Title");
    expect(c.PullQuote).toBeDefined();
    expect(c.CTABox).toBeDefined();
    expect(c.Image).toBeDefined();
    expect(c.Tag).toBeDefined();
    expect(c.h2).toBeDefined();
    expect(c.p).toBeDefined();
  });

  it("creates a plain-div fallback (with dev warning) for an unknown component used in source", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const c = buildMdxComponents("Hello <DangerousWidget> world </DangerousWidget>") as unknown as Record<
      string,
      React.FC<{ children?: React.ReactNode }>
    >;
    const Fallback = c["DangerousWidget"]!;
    expect(Fallback).toBeTypeOf("function");
    const { container } = render(<Fallback>inner</Fallback>);
    expect(container.querySelector("div")).toHaveTextContent("inner");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("DangerousWidget"));
    warn.mockRestore();
  });

  it("does not add fallbacks for allowlisted components even when used", () => {
    const c = buildMdxComponents("<PullQuote>q</PullQuote>");
    expect(c.PullQuote).toBe(buildMdxComponents("").PullQuote);
  });
});

describe("custom MDX components (AC#2, #3)", () => {
  it("PullQuote renders a styled blockquote", () => {
    render(<PullQuote>Quoted wisdom</PullQuote>);
    const bq = screen.getByText("Quoted wisdom");
    expect(bq.tagName).toBe("BLOCKQUOTE");
    expect(bq.className).toContain("border-primary");
  });

  it("CTABox renders title/body and a button linking to ctaHref", () => {
    render(<CTABox title="Grab the template" body="Free HACCP plan" ctaText="Download" ctaHref="/templates/haccp" />);
    expect(screen.getByRole("heading", { name: "Grab the template" })).toBeInTheDocument();
    expect(screen.getByText("Free HACCP plan")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", "/templates/haccp");
  });
});
