"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { expertInitials } from "@/lib/experts";

export type NavUser = { name: string; email: string; role: string };

const ROLE_LABEL: Record<string, string> = {
  seeker: "Job Seeker",
  employer: "Employer",
  expert: "Expert",
};

/**
 * Signed-in account dropdown in the navbar (story-homepage-09, ported from `design/ui.jsx`
 * AccountMenu). Avatar-initials button → menu with name, email, role badge, Dashboard, and a
 * danger Sign-out. Dismisses on click-outside + Escape; `aria-expanded` + menu roles.
 */
export function AccountMenu({ user, onSignOut }: { user: NavUser; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = expertInitials(user.name);
  const firstName = user.name.trim().split(/\s+/)[0] || "Account";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition hover:border-primary"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[0.72rem] font-bold text-tag-safe-text">
          {initials}
        </span>
        <span className="font-heading text-[0.82rem] font-semibold text-text">{firstName}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-lg border border-border bg-card-bg shadow-elevated"
        >
          <div className="flex items-center gap-3 border-b border-border p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tag-safe-bg font-heading text-[0.9rem] font-bold text-tag-safe-text">
              {initials}
            </span>
            <div className="min-w-0">
              <div className="truncate font-heading text-[0.92rem] font-semibold text-text">
                {user.name}
              </div>
              <div className="truncate font-body text-[0.78rem] text-muted">{user.email}</div>
              <div className="mt-1">
                <Tag variant="safe">{ROLE_LABEL[user.role] ?? "Member"}</Tag>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 font-body text-[0.88rem] text-text hover:bg-surface-light"
          >
            <Icon name="user" size={15} stroke={1.8} /> Dashboard
          </Link>
          <div className="border-t border-border" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left font-body text-[0.88rem] text-error hover:bg-surface-light"
          >
            <Icon name="logout" size={15} stroke={1.8} /> Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
