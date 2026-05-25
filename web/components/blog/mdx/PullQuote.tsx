import type { ReactNode } from "react";

/**
 * Pull-quote callout (blog-03 AC#2 / UI-DESIGN-HANDOFF.md §3.7):
 * 4px primary left border, surface-light background, 16px 20px padding.
 */
export function PullQuote({ children }: { children?: ReactNode }) {
  return (
    <blockquote className="my-8 rounded-r-md border-l-4 border-primary bg-surface-light px-5 py-4 font-display text-[1.2rem] leading-snug text-text">
      {children}
    </blockquote>
  );
}
