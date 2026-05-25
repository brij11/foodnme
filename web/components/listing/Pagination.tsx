import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Server-rendered pagination (UI-DESIGN-HANDOFF.md / blog-01 AC#10): numbered page links
 * (`/blog?page=2`) — NOT infinite scroll, so the back button and SEO both work.
 * Renders nothing for a single page.
 */
export function Pagination({
  page,
  totalPages,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} rel="prev" className="rounded-md border border-border px-3 py-2 font-body text-[0.85rem] text-muted hover:text-text">
          Previous
        </Link>
      ) : null}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefForPage(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "rounded-md px-3.5 py-2 font-heading text-[0.82rem] font-semibold",
            p === page ? "bg-primary text-white" : "border border-border text-muted hover:text-text",
          )}
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={hrefForPage(page + 1)} rel="next" className="rounded-md border border-border px-3 py-2 font-body text-[0.85rem] text-muted hover:text-text">
          Next
        </Link>
      ) : null}
    </nav>
  );
}
