import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// Five fill variants (UI-DESIGN-HANDOFF.md §1.2 tag color rotation) plus two outline
// variants used by the article-detail keyword row.
export type TagVariant =
  | "green" | "safe" | "orange" | "neutral" | "accent"
  | "outline-green" | "outline-accent";

const variants: Record<TagVariant, string> = {
  green: "bg-tag-green-bg text-tag-green-text",
  safe: "bg-tag-safe-bg text-tag-safe-text",
  orange: "bg-tag-orange-bg text-tag-orange-text",
  neutral: "bg-tag-neutral-bg text-tag-neutral-text",
  accent: "bg-[rgba(221,161,94,0.14)] text-[#8c5a23]",
  "outline-green": "bg-transparent text-primary border-[1.5px] border-primary",
  "outline-accent": "bg-transparent text-accent border-[1.5px] border-accent",
};

export function Tag({
  variant = "neutral",
  children,
  className,
}: {
  variant?: TagVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-heading font-bold text-[0.66rem] " +
          "tracking-[0.05em] uppercase px-[11px] py-1.5 rounded-full whitespace-nowrap",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
