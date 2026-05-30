"use client";

import { useEffect } from "react";

/**
 * Reading-progress driver (story-blog-09, UI-DESIGN-HANDOFF.md §3.7). The navbar renders a
 * bottom-edge bar sized by `--reading-progress`; this island is the only thing that drives it.
 * It tracks scroll over the article **content region** (`targetId`), updates the CSS variable on
 * `:root` via `requestAnimationFrame`, and resets it to `0%` on unmount so no stale fill leaks
 * onto non-article pages. Easing is left to the navbar's `transition-[width]`, which globals.css
 * neutralizes under `prefers-reduced-motion` — so width changes are instantaneous when requested.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;

    const set = (pct: number) => root.style.setProperty("--reading-progress", `${pct}%`);

    const compute = () => {
      raf = 0;
      const el = document.getElementById(targetId);
      if (!el) return set(0);
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) {
        // Content shorter than the viewport — "read" once its bottom scrolls into view.
        return set(rect.bottom <= window.innerHeight ? 100 : 0);
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      set(Math.round((scrolled / scrollable) * 100));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      set(0); // clear fill when leaving the article
    };
  }, [targetId]);

  return null;
}
