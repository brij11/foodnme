import type { ReactNode } from "react";

/**
 * Shared listing/page header — overline + Fraunces display heading + optional sub.
 * The display heading is the page's single H1 (UI-DESIGN-HANDOFF.md §1.3).
 */
export function PageHeader({
  overline,
  title,
  sub,
}: {
  overline?: string;
  title: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <header className="pb-10 pt-16">
      {overline ? (
        <p className="mb-4 font-heading text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">
          {overline}
        </p>
      ) : null}
      <h1 className="font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-text">
        {title}
      </h1>
      {sub ? <p className="mt-4 max-w-[620px] font-body text-[1.05rem] leading-relaxed text-muted">{sub}</p> : null}
    </header>
  );
}
