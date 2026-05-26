"use client";

import { useEffect, useRef, useState } from "react";

export type CountUpProps = {
  value: number;
  /** Appended to the number, e.g. "+". Ignored when `thousands`. */
  suffix?: string;
  /** Render as one-decimal thousands ("4.2k") per §5.2. */
  thousands?: boolean;
  durationMs?: number;
};

function format(n: number, suffix: string, thousands: boolean): string {
  if (thousands) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n)}${suffix}`;
}

/**
 * Count-up stat number (UI-DESIGN-HANDOFF.md §4.10). SSR and the first client render emit
 * the final value — so the SSG snapshot is correct, accessible, and good for LCP with no
 * hydration mismatch. After mount, if motion is allowed, it animates 0 → value; under
 * `prefers-reduced-motion: reduce` it stays put (no animation).
 */
export function CountUp({ value, suffix = "", thousands = false, durationMs = 1400 }: CountUpProps) {
  const [n, setN] = useState(value);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || value <= 0) return;

    let raf = 0;
    const start = performance.now();
    setN(0);
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      if (p < 1) {
        setN(value * eased);
        raf = requestAnimationFrame(tick);
      } else {
        setN(value);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span>{format(n, suffix, thousands)}</span>;
}
