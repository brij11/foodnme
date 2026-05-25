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

/**
 * Shared listing sidebar (UI-DESIGN-HANDOFF.md §3.5): search input → category list with
 * counts → "Clear all filters" → optional mini-newsletter slot (blog/category only).
 * Pure markup so it renders identically in the desktop rail and the mobile drawer.
 */
export function ListingSidebar({
  searchType,
  searchPlaceholder = "Search…",
  categories,
  clearHref,
  newsletter,
}: {
  searchType: string;
  searchPlaceholder?: string;
  categories: SidebarCategory[];
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

      {newsletter ? <div>{newsletter}</div> : null}
    </div>
  );
}
