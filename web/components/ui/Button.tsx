"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center gap-2 font-heading font-bold tracking-[0.01em] " +
  "rounded-md transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:cursor-not-allowed disabled:bg-border disabled:text-muted disabled:border-transparent " +
  "disabled:translate-y-0 disabled:shadow-none";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-deep hover:-translate-y-px",
  outline:
    "bg-card-bg text-primary border-[1.5px] border-border hover:border-primary hover:bg-tag-safe-bg",
  // Arrow-grow-on-hover per prototype .btn-ghost::after (plan/design/styles.css:230-241).
  // Trailing → shifts 4px right on hover via after:translate-x-1. No underline (DEVIATIONS B5).
  ghost:
    "bg-transparent text-primary " +
    "after:content-['→'] after:ml-1.5 after:inline-block after:transition-transform after:duration-200 " +
    "hover:text-primary-deep hover:after:translate-x-1",
};

const sizes: Record<Size, string> = {
  sm: "text-[0.72rem] px-4 py-2 rounded-sm",
  md: "text-[0.82rem] px-[22px] py-3",
  lg: "text-[0.92rem] px-7 py-4",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
});
