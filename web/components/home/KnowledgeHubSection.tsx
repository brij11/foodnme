import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";

/**
 * §3.6 #4 — "From the Knowledge Hub" section container. The shell (story-homepage-05) owns
 * the header (overline + title) and the "All articles → /blog" link; the editorial feature
 * (story-homepage-06) and the "Latest from the blog" rail (story-homepage-04) mount as
 * children. Children-less until those stories fill the slot.
 */
export function KnowledgeHubSection({ children }: { children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-content px-6 py-16 lg:px-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-text">
            This week&apos;s read
          </p>
          <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-text">
            From the Knowledge Hub
          </h2>
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 font-heading text-[0.82rem] font-bold text-primary underline-offset-4 hover:text-primary-deep hover:underline"
        >
          All articles
          <Icon name="arrow" size={14} stroke={2.2} />
        </Link>
      </div>
      {children}
    </section>
  );
}
