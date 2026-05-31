import type { ReactNode } from "react";

/**
 * Pull-quote callout (blog-12 AC#1 / DEVIATIONS C5 / UI-DESIGN-HANDOFF.md §3.7):
 * Accent/orange 4px left border + rgba(221,161,94,0.08) tint — distinct from the green-bordered
 * `<blockquote>` MDX element which uses border-primary. Design ref: plan/design/styles.css:911-913.
 */
export function PullQuote({ children }: { children?: ReactNode }) {
  return (
    <div
      className="my-6 rounded-r-md border-l-4 border-accent px-5 py-4 font-body text-[0.95rem] text-text"
      style={{ background: "rgba(221,161,94,0.08)" }}
    >
      {children}
    </div>
  );
}
