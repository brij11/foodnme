import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

/** Standard breadcrumb trail (UI-DESIGN-HANDOFF.md §2.3). Last crumb is the current page. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-7">
      <ol className="flex flex-wrap items-center gap-2 font-body text-[0.78rem] text-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          // A crumb with an href is always a link (the category crumb links out even when it's
          // last, since the current page — e.g. an article — isn't itself in the trail). A crumb
          // without an href is the current page.
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li>
                {item.href ? (
                  <Link href={item.href} className="hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-medium text-text">
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast ? <li aria-hidden className="text-muted-2">›</li> : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
