"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Responsive two-column listing layout (UI-DESIGN-HANDOFF.md §3.5): a sticky sidebar rail
 * on desktop; on mobile the sidebar collapses into a bottom-sheet filter drawer opened by a
 * "Filters" button. The same `sidebar` node renders in both places.
 */
export function ListingShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="grid items-start gap-14 lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-[88px] hidden lg:block">{sidebar}</aside>

      <div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="mb-5 flex w-full items-center justify-between rounded-md border-[1.5px] border-border bg-white px-3.5 py-2.5 font-body text-[0.88rem] font-medium text-text lg:hidden"
        >
          Filters
          <Icon name="filter" size={16} />
        </button>
        {children}
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-[rgba(40,54,24,0.4)]"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[18px] bg-background p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-text">Filters</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-light"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      ) : null}
    </div>
  );
}
