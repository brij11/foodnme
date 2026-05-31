"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type SortOption = { value: string; label: string };

/**
 * Sort control for listing headers (blog-01 AC#5, story-experts-12 AC#2, story-templates-05
 * AC#1). Updates the `sort` search param and resets to page 1. Progressive-enhancement note:
 * the listing is fully server-rendered; this only changes ordering once JS is available.
 *
 * Pass `options` to override the default blog-specific values with a custom set of sort
 * options (e.g. experts "Top rated / Most experienced", templates "Most downloaded / Most
 * recent"). `defaultValue` sets the selected-when-no-param value; `srLabel` overrides the
 * accessible label.
 */
export function SortSelect({
  options,
  defaultValue,
  srLabel = "Sort results",
}: {
  options?: SortOption[];
  defaultValue?: string;
  srLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const resolvedOptions: SortOption[] = options ?? [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
  ];
  const resolvedDefault = defaultValue ?? resolvedOptions[0]?.value ?? "";

  const currentRaw = params.get("sort") ?? "";
  const current = resolvedOptions.some((o) => o.value === currentRaw)
    ? currentRaw
    : resolvedDefault;

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set("sort", value);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 font-body text-[0.84rem] text-muted">
      <span className="sr-only">{srLabel}</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border-[1.5px] border-border bg-white px-3 py-2 font-body text-[0.84rem] text-text focus:border-primary focus:outline-none"
      >
        {resolvedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
