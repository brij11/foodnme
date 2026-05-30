import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ReadingProgress } from "./ReadingProgress";

function rect(top: number, height: number): DOMRect {
  return { top, height, bottom: top + height, left: 0, right: 0, width: 0, x: 0, y: top, toJSON() {} } as DOMRect;
}

const root = document.documentElement;
const progress = () => root.style.getPropertyValue("--reading-progress");

// Capture the rAF callback and flush it on demand — models the real async frame (the handler
// schedules, then the frame later runs compute and clears the pending flag).
let rafCb: FrameRequestCallback | null = null;
const flushRaf = () => {
  const cb = rafCb;
  rafCb = null;
  cb?.(0);
};

describe("ReadingProgress (story-blog-09)", () => {
  beforeEach(() => {
    rafCb = null;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCb = cb;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {
      rafCb = null;
    });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    root.style.setProperty("--reading-progress", "0%");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.getElementById("article-body")?.remove();
  });

  it("advances the variable as the content region scrolls past the viewport (AC#1, #2)", () => {
    const el = document.createElement("div");
    el.id = "article-body";
    document.body.appendChild(el);

    // height 2800, viewport 800 → scrollable 2000. Scrolled 1000px in → 50%.
    el.getBoundingClientRect = () => rect(-1000, 2800);
    render(<ReadingProgress targetId="article-body" />);
    expect(progress()).toBe("50%"); // computed directly on mount

    // Fully scrolled past → clamps to 100%.
    el.getBoundingClientRect = () => rect(-2000, 2800);
    fireEvent.scroll(window);
    flushRaf();
    expect(progress()).toBe("100%");

    // Back to top → 0%.
    el.getBoundingClientRect = () => rect(0, 2800);
    fireEvent.scroll(window);
    flushRaf();
    expect(progress()).toBe("0%");
  });

  it("resets the variable to 0% on unmount — no stale fill on other pages (AC#3)", () => {
    const el = document.createElement("div");
    el.id = "article-body";
    document.body.appendChild(el);
    el.getBoundingClientRect = () => rect(-1000, 2800);

    const { unmount } = render(<ReadingProgress targetId="article-body" />);
    expect(progress()).toBe("50%");

    unmount();
    expect(progress()).toBe("0%");
  });
});
