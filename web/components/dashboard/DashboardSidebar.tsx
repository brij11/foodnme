"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";

export type Role = "seeker" | "employer" | "expert";
export type SidebarTab = { id: string; label: string; icon: IconName };

const ROLE_LABEL: Record<Role, string> = {
  seeker: "Job Seeker",
  employer: "Employer",
  expert: "Expert",
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return initials || "FN";
}

/**
 * Dashboard left rail (ported from `design/screens-dashboard.jsx` DashboardSidebar). User block,
 * role-specific nav as in-page tabs (client state — not sub-routes, per story-auth-07 analysis),
 * "Back to site", and "Sign out".
 */
export function DashboardSidebar({
  fullName,
  role,
  tabs,
  activeTab,
  onSelect,
  onSignOut,
}: {
  fullName: string;
  role: Role;
  tabs: SidebarTab[];
  activeTab: string;
  onSelect: (id: string) => void;
  onSignOut: () => void;
}) {
  return (
    <aside className="lg:w-[248px] lg:shrink-0">
      <div className="rounded-lg border border-border bg-card-bg p-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-[0.86rem] font-bold text-white">
            {initialsOf(fullName)}
          </div>
          <div className="min-w-0">
            <div className="truncate font-body text-[0.92rem] font-semibold text-text">{fullName}</div>
            <div className="font-body text-[0.74rem] text-muted">{ROLE_LABEL[role]}</div>
          </div>
        </div>

        <nav className="mt-3 flex flex-col gap-1" aria-label="Dashboard sections">
          {tabs.map((t) => {
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onSelect(t.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left font-body text-[0.86rem] font-medium transition",
                  active
                    ? "bg-tag-safe-bg text-primary-deep"
                    : "text-muted hover:bg-surface-light hover:text-text",
                )}
              >
                <Icon name={t.icon} size={16} stroke={1.9} />
                {t.label}
              </button>
            );
          })}

          <div className="my-2 h-px bg-border" />

          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2.5 font-body text-[0.86rem] font-medium text-muted transition hover:bg-surface-light hover:text-text"
          >
            <Icon name="leaf" size={16} stroke={1.9} />
            Back to site
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left font-body text-[0.86rem] font-medium text-error transition hover:bg-error-bg"
          >
            <Icon name="logout" size={16} stroke={1.9} />
            Sign out
          </button>
        </nav>
      </div>
    </aside>
  );
}
