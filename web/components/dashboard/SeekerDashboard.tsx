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
}: {
  fullName: string;
  applications: ApplicationRow[];
  activeFilter: string;
}) {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  function ApplicationsView() {
    return (
      <>
        <DashboardHeader title={`Welcome back, ${firstName}.`} subtitle="Track every role you've applied to." />
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
      render: () => (
        <EmptyState title="No saved jobs" message="Save roles you're interested in to revisit them later." action={{ label: "Browse jobs", href: "/jobs" }} />
      ),
    },
  ];

  return <DashboardShell role="seeker" fullName={fullName} tabs={tabs} />;
}
