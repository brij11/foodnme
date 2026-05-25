import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Small neutral label pill — used for the file-format badge (PDF/DOCX) on template cards.
 * Distinct from `Tag` (category color rotation): a Badge is always a quiet neutral chip.
 */
export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-heading font-bold text-[0.62rem] tracking-[0.06em] " +
          "uppercase px-2.5 py-1 rounded-full bg-surface-light text-muted border border-border",
        className,
      )}
    >
      {children}
    </span>
  );
}
