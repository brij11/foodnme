"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Sort control for listing headers (blog-01 AC#5). Updates the `sort` search param and
 * resets to page 1. Progressive-enhancement note: the listing is fully server-rendered;
 * this only changes ordering once JS is available.
 */
export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("sort") === "oldest" ? "oldest" : "newest";

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set("sort", value);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 font-body text-[0.84rem] text-muted">
      <span className="sr-only">Sort articles</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border-[1.5px] border-border bg-white px-3 py-2 font-body text-[0.84rem] text-text focus:border-primary focus:outline-none"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </label>
  );
}
