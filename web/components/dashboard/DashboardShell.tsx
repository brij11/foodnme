"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar, type Role, type SidebarTab } from "./DashboardSidebar";

export type { Role } from "./DashboardSidebar";

/**
 * A dashboard tab. `render` receives `goToTab` so an empty-state CTA can switch the active tab
 * (e.g. employer "Post a job" → the Post tab) without leaving the route.
 */
export type DashboardTab = SidebarTab & {
  render: (ctx: { goToTab: (id: string) => void }) => ReactNode;
};

/**
 * Role dashboard shell (story-auth-07): sidebar + the active tab's content. One route per role
 * (`/dashboard/<role>`); sub-nav is in-page client tab state. Content per tab is filled by
 * later stories (jobs-04 / jobs-07 / experts-04); auth-07 ships empty states.
 */
export function DashboardShell({
  role,
  fullName,
  tabs,
}: {
  role: Role;
  fullName: string;
  tabs: DashboardTab[];
}) {
  const router = useRouter();
  const [active, setActive] = useState(tabs[0]!.id);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const current = tabs.find((t) => t.id === active) ?? tabs[0]!;

  return (
    <div className="mx-auto flex max-w-content flex-col gap-8 px-6 py-10 lg:flex-row lg:px-12">
      <DashboardSidebar
        fullName={fullName}
        role={role}
        tabs={tabs}
        activeTab={active}
        onSelect={setActive}
        onSignOut={signOut}
      />
      <section className="min-w-0 flex-1">{current.render({ goToTab: setActive })}</section>
    </div>
  );
}

/** Standard dashboard content header (title + one-line subtitle). */
export function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-8">
      <h1 className="font-heading text-[1.7rem] font-bold tracking-[-0.01em] text-text">{title}</h1>
      <p className="mt-1.5 font-body text-[0.95rem] text-muted">{subtitle}</p>
    </header>
  );
}
