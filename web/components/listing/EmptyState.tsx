import Link from "next/link";
import type { ReactNode } from "react";

export type EmptyStateVariant = "filter" | "search" | "inbox";

// Minimal geometric illustration only (UI-DESIGN-HANDOFF.md §4.5 — no icon-as-illustration).
function Illustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden className="text-muted-2">
      <circle cx="36" cy="30" r="18" stroke="currentColor" strokeWidth="2" />
      <line x1="49" y1="43" x2="60" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="56" r="2" fill="currentColor" />
      <circle cx="62" cy="20" r="2" fill="currentColor" />
    </svg>
  );
}

/**
 * Three-part empty state — title + message + action (UI-DESIGN-HANDOFF.md §5.4).
 * Never a bare "No results."
 */
export function EmptyState({
  title,
  message,
  action,
}: {
  variant?: EmptyStateVariant;
  title: string;
  message: string;
  action: { label: string; href: string } | ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-lg border border-dashed border-border bg-card-bg px-8 py-14 text-center">
      <Illustration />
      <h3 className="font-heading text-[1.1rem] font-bold tracking-[-0.01em] text-text">{title}</h3>
      <p className="max-w-[380px] font-body text-[0.92rem] leading-relaxed text-muted">{message}</p>
      <div className="mt-2">
        {action && typeof action === "object" && "href" in action ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-md bg-primary px-[22px] py-3 font-heading text-[0.82rem] font-bold text-white transition hover:bg-primary-deep"
          >
            {action.label}
          </Link>
        ) : (
          action
        )}
      </div>
    </div>
  );
}
