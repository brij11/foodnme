import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShareRow } from "./ShareRow";

const TITLE = "A practical HACCP rollout";

describe("ShareRow (story-blog-08)", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("builds correct LinkedIn / Twitter / Email share intents in a new tab (AC#3)", async () => {
    render(<ShareRow title={TITLE} />);
    const url = window.location.href; // jsdom → http://localhost:3000/
    const encUrl = encodeURIComponent(url);
    const encTitle = encodeURIComponent(TITLE);

    await waitFor(() => {
      const li = screen.getByRole("link", { name: "Share on LinkedIn" });
      expect(li).toHaveAttribute(
        "href",
        `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
      );
      expect(li).toHaveAttribute("target", "_blank");
      expect(li).toHaveAttribute("rel", "noopener noreferrer");
    });

    const tw = screen.getByRole("link", { name: "Share on Twitter" });
    expect(tw).toHaveAttribute("href", `https://twitter.com/intent/tweet?url=${encUrl}&text=${encTitle}`);
    expect(tw).toHaveAttribute("rel", "noopener noreferrer");

    const mail = screen.getByRole("link", { name: "Share by email" });
    expect(mail).toHaveAttribute("href", `mailto:?subject=${encTitle}&body=${encUrl}`);
  });

  it("copies the canonical URL and shows a transient confirmation (AC#2)", async () => {
    render(<ShareRow title={TITLE} />);
    const button = screen.getByRole("button", { name: "Copy link to this article" });
    expect(button).toHaveTextContent("Copy link");

    fireEvent.click(button);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() => expect(button).toHaveTextContent("Copied"));
  });

  it("icon-only-safe: every action has a discernible accessible name (AC#4)", () => {
    render(<ShareRow title={TITLE} />);
    expect(screen.getByRole("button", { name: "Copy link to this article" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Share on LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Share on Twitter" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Share by email" })).toBeInTheDocument();
  });
});
