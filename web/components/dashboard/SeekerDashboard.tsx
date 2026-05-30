"use client";

import Link from "next/link";
import { DashboardShell, DashboardHeader, type DashboardTab } from "./DashboardShell";
import { EmptyState } from "@/components/listing/EmptyState";
import { Tag, type TagVariant } from "@/components/ui/Tag";
import { cn } from "@/lib/utils/cn";

export type ApplicationRow = {
  id: string;
  status: string;
  applied_at: string;
  job: { id: string; title: string; company_name: string; location: string } | null;
};

export type SeekerStats = {
  total: number;
  submitted: number;
  reviewed: number;
  rejected: number;
  saved: number;
};

export type SavedJob = { id: string; title: string; company_name: string; location: string };

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card-bg p-5">
      <div className="font-body text-[0.78rem] text-muted">{label}</div>
      {/* numbers in dark-olive per §4.1 */}
      <div className="mt-2 font-heading text-[1.6rem] font-bold text-text">{value}</div>
      {sub ? <div className="mt-1 font-body text-[0.74rem] text-muted">{sub}</div> : null}
    </div>
  );
}

const STATUS_TAG: Record<string, { variant: TagVariant; label: string }> = {
  submitted: { variant: "neutral", label: "Submitted" },
  reviewed: { variant: "orange", label: "Reviewed" },
  rejected: { variant: "accent", label: "Closed" },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "submitted", label: "Submitted" },
  { id: "reviewed", label: "Reviewed" },
  { id: "rejected", label: "Rejected" },
];

// Seeker dashboard: applications tracker (story-jobs-07).
export function SeekerDashboard({
  fullName,
  applications,
  activeFilter,
  stats,
  savedJobs,
}: {
  fullName: string;
  applications: ApplicationRow[];
  activeFilter: string;
  stats: SeekerStats;
  savedJobs: SavedJob[];
}) {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  function ApplicationsView() {
    return (
      <>
        <DashboardHeader title={`Welcome back, ${firstName}.`} subtitle="Track every role you've applied to." />

        {/* 4-card stats grid (story-jobs-13). Profile views / Match score are not yet modeled,
            so they render "—" rather than fabricated numbers (a future analytics story will wire them). */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="seeker-stats">
          <StatCard
            label="Applications"
            value={String(stats.total)}
            sub={`${stats.submitted} submitted · ${stats.reviewed} reviewed · ${stats.rejected} closed`}
          />
          <StatCard label="Saved jobs" value={String(stats.saved)} />
          <StatCard label="Profile views" value="—" />
          <StatCard label="Match score" value="—" />
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={f.id === "all" ? "/dashboard/seeker" : `/dashboard/seeker?status=${f.id}`}
              className={cn(
                "rounded-full border-[1.5px] px-3.5 py-1.5 font-heading text-[0.74rem] font-bold transition",
                activeFilter === f.id
                  ? "border-primary bg-tag-safe-bg text-primary-deep"
                  : "border-border bg-card-bg text-muted hover:border-primary",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="You haven't applied to any jobs yet."
            message="Browse the board and apply — your applications will show up here with their status."
            action={{ label: "Browse jobs", href: "/jobs" }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {applications.map((a) => {
              const s = STATUS_TAG[a.status] ?? STATUS_TAG.submitted!;
              return (
                <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card-bg px-5 py-4" data-testid="application-row">
                  <div className="min-w-0 flex-1">
                    {a.job ? (
                      <Link href={`/jobs/${a.job.id}`} className="font-heading text-[0.98rem] font-bold text-text hover:text-primary">
                        {a.job.title}
                      </Link>
                    ) : (
                      <span className="font-heading text-[0.98rem] font-bold text-text">Job removed</span>
                    )}
                    <p className="mt-0.5 font-body text-[0.78rem] text-muted">
                      {a.job ? `${a.job.company_name} · ${a.job.location}` : "—"} · Applied{" "}
                      {new Date(a.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <Tag variant={s.variant}>{s.label}</Tag>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }

  const tabs: DashboardTab[] = [
    { id: "overview", label: "Overview", icon: "trending", render: () => <ApplicationsView /> },
    { id: "applications", label: "Applications", icon: "briefcase", render: () => <ApplicationsView /> },
    {
      id: "saved",
      label: "Saved jobs",
      icon: "bookmark",
      render: () =>
        savedJobs.length === 0 ? (
          <EmptyState title="No saved jobs" message="Save roles you're interested in to revisit them later." action={{ label: "Browse jobs", href: "/jobs" }} />
        ) : (
          <>
            <DashboardHeader title="Saved jobs" subtitle="Roles you bookmarked to apply to later." />
            <ul className="flex flex-col gap-3" data-testid="saved-jobs-list">
              {savedJobs.map((j) => (
                <li
                  key={j.id}
                  data-testid="saved-job-row"
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card-bg px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <Link href={`/jobs/${j.id}`} className="font-heading text-[0.98rem] font-bold text-text hover:text-primary">
                      {j.title}
                    </Link>
                    <p className="mt-0.5 font-body text-[0.78rem] text-muted">
                      {j.company_name} · {j.location}
                    </p>
                  </div>
                  <Link
                    href={`/jobs/${j.id}`}
                    className="rounded-md bg-primary px-4 py-2 font-heading text-[0.78rem] font-bold text-white transition hover:bg-primary-deep"
                  >
                    View &amp; apply
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ),
    },
  ];

  return <DashboardShell role="seeker" fullName={fullName} tabs={tabs} />;
}
