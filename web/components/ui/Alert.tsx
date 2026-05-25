import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "./Icon";

export type AlertTone = "success" | "info" | "warning" | "error";

// Left-border keeps the semantic color (theme §6.6); text uses the higher-contrast tag
// text colors so every tone clears the Axe-core contrast check (TECHNICAL-REQUIREMENTS.md §1).
const tones: Record<AlertTone, { box: string; icon: IconName }> = {
  success: { box: "bg-tag-green-bg text-tag-green-text border-l-secondary", icon: "check" },
  info: { box: "bg-[#eef6ee] text-primary border-l-primary", icon: "verified" },
  warning: { box: "bg-tag-orange-bg text-tag-orange-text border-l-accent", icon: "shield" },
  error: { box: "bg-error-bg text-error border-l-error", icon: "close" },
};

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 px-[18px] py-[14px] rounded-md border-l-4 " +
          "font-body text-[0.82rem] font-medium",
        t.box,
        className,
      )}
    >
      <Icon name={t.icon} size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
