import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";

export type SidebarCategory = {
  slug: string;
  label: string;
  count: number;
  href: string;
  active: boolean;
};

/** A generic multi-select facet (e.g. file format — story-templates-04) below the categories. */
export type SidebarFacet = {
  title: string;
  options: { value: string; label: string; href: string; active: boolean }[];
};

/**
 * Shared listing sidebar (UI-DESIGN-HANDOFF.md §3.5): search input → category list with
 * counts → optional facet (e.g. file format) → "Clear all filters" → optional mini-newsletter.
 * Pure markup so it renders identically in the desktop rail and the mobile drawer.
 */
export function ListingSidebar({
  searchType,
  searchPlaceholder = "Search…",
  categories,
  facet,
  clearHref,
  newsletter,
}: {
  searchType: string;
  searchPlaceholder?: string;
  categories: SidebarCategory[];
  facet?: SidebarFacet;
  clearHref: string;
  newsletter?: ReactNode;
}) {
  return (
    <div className="space-y-8">
      <form action="/search" method="get" role="search" className="relative block">
        <input type="hidden" name="type" value={searchType} />
        <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
        <input
          type="search"
          name="q"
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          className="w-full rounded-md border-[1.5px] border-border bg-white py-2.5 pl-10 pr-3 font-body text-[0.86rem] text-text focus:border-primary focus:outline-none"
        />
      </form>

      <nav aria-label="Categories">
        <h2 className="mb-3.5 border-b border-border pb-3 font-heading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
          Categories
        </h2>
        <ul className="flex flex-col gap-0.5">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={c.href}
                aria-current={c.active ? "page" : undefined}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-body text-[0.9rem] font-medium transition-colors",
                  c.active ? "bg-primary text-white" : "text-muted hover:bg-surface-light hover:text-text",
                )}
              >
                <span>{c.label}</span>
                <span
                  className={cn(
                    "tabular-nums text-[0.76rem]",
                    c.active ? "text-white/75" : "text-muted-2",
                  )}
                >
                  {c.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={clearHref} className="mt-3 inline-block font-body text-[0.8rem] text-primary hover:underline">
          Clear all filters
        </Link>
      </nav>

      {facet ? (
        <nav aria-label={facet.title} data-testid="format-facet">
          <h2 className="mb-3.5 border-b border-border pb-3 font-heading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
            {facet.title}
          </h2>
          <ul className="flex flex-col gap-1.5">
            {facet.options.map((o) => (
              <li key={o.value}>
                <Link
                  href={o.href}
                  aria-current={o.active ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 font-body text-[0.88rem] font-medium transition-colors",
                    o.active ? "text-text" : "text-muted hover:text-text",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border-[1.5px]",
                      o.active ? "border-primary bg-primary text-white" : "border-border",
                    )}
                  >
                    {o.active ? <Icon name="check" size={11} stroke={3} /> : null}
                  </span>
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {newsletter ? <div>{newsletter}</div> : null}
    </div>
  );
}
