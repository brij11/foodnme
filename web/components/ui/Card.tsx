import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Apply the hover lift + shadow used by card grids (UI-DESIGN-HANDOFF.md §3.2). */
  hover?: boolean;
};

export function Card({ hover = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card-bg border border-border rounded-lg p-[22px]",
        hover &&
          "transition hover:-translate-y-[3px] hover:shadow-card hover:border-[#d8d3bf]",
        className,
      )}
      {...rest}
    />
  );
}
