"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell, DashboardHeader, type DashboardTab } from "./DashboardShell";
import { EmptyState } from "@/components/listing/EmptyState";
import { Tag, type TagVariant } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { PostJobModal } from "./PostJobModal";

export type EmployerJob = {
  id: string;
  title: string;
  status: string;
  applicant_count: number;
};

export type ApplicantRow = {
  id: string;
  candidate_name: string;
  job_title: string;
  applied_at: string;
  status: string;
  resume_signed_url: string | null;
};

export type EmployerStats = {
  activeListings: number;
  totalApplicants: number;
  pendingReview: number;
};

const STATUS_TAG: Record<string, { variant: TagVariant; label: string }> = {
  pending: { variant: "orange", label: "Pending review" },
  active: { variant: "green", label: "Active" },
  closed: { variant: "neutral", label: "Closed" },
};

const APP_STATUS_TAG: Record<string, { variant: TagVariant; label: string }> = {
  submitted: { variant: "neutral", label: "Submitted" },
  reviewed: { variant: "orange", label: "Reviewed" },
  rejected: { variant: "accent", label: "Closed" },
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card-bg p-5">
      <div className="font-body text-[0.78rem] text-muted">{label}</div>
      {/* numbers in dark-olive per §4.1 */}
      <div className="mt-2 font-heading text-[1.6rem] font-bold text-text">{value}</div>
    </div>
  );
}

// Employer dashboard (story-jobs-04 listings; story-jobs-14 stats + applicant review).
export function EmployerDashboard({
  fullName,
  jobs,
  applicants,
  stats,
}: {
  fullName: string;
  jobs: EmployerJob[];
  applicants: ApplicantRow[];
  stats: EmployerStats;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [closing, setClosing] = useState<string | null>(null);

  async function closeJob(id: string) {
    setClosing(id);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (res.ok) router.refresh();
    } finally {
      setClosing(null);
    }
  }

  function JobList() {
    if (jobs.length === 0) {
      return (
        <EmptyState
          title="Post your first job to start receiving applications."
          message="Your listings and their applicant counts will appear here."
          action={<Button onClick={() => setModalOpen(true)}>Post a job</Button>}
        />
      );
    }
    return (
      <div className="flex flex-col gap-3">
        {jobs.map((job) => {
          const s = STATUS_TAG[job.status] ?? STATUS_TAG.pending!;
          return (
            <div key={job.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card-bg px-5 py-4">
              <div className="min-w-0 flex-1">
                <Link href={`/jobs/${job.id}`} className="font-heading text-[0.98rem] font-bold text-text hover:text-primary">
                  {job.title}
                </Link>
                <p className="mt-0.5 font-body text-[0.78rem] text-muted" data-testid="applicant-count">
                  {job.applicant_count} {job.applicant_count === 1 ? "applicant" : "applicants"}
                </p>
              </div>
              <Tag variant={s.variant}>{s.label}</Tag>
              {job.status !== "closed" ? (
                <button
                  type="button"
                  onClick={() => closeJob(job.id)}
                  disabled={closing === job.id}
                  className="rounded-md border-[1.5px] border-border px-3 py-1.5 font-heading text-[0.74rem] font-bold text-muted hover:border-error hover:text-error disabled:opacity-50"
                >
                  {closing === job.id ? "Closing…" : "Close"}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  const header = (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <DashboardHeader title="Employer dashboard" subtitle="Manage your job postings and review applicants." />
        <Button onClick={() => setModalOpen(true)}>Post a job</Button>
      </div>
      {/* 4-card stats grid (story-jobs-14). Avg. time to hire isn't modeled (no hire-event
          tracking) so it renders "—" — never a fabricated number; a future story wires it. */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="employer-stats">
        <StatCard label="Active listings" value={String(stats.activeListings)} />
        <StatCard label="Total applicants" value={String(stats.totalApplicants)} />
        <StatCard label="Pending review" value={String(stats.pendingReview)} />
        <StatCard label="Avg. time to hire" value="—" />
      </div>
    </>
  );

  function ApplicantsView() {
    if (applicants.length === 0) {
      return (
        <EmptyState
          title="No applicants yet"
          message="When candidates apply to your listings, they'll appear here with their resume and status."
          action={{ label: "Browse the job board", href: "/jobs" }}
        />
      );
    }
    return (
      <ul className="flex flex-col gap-3" data-testid="applicants-list">
        {applicants.map((a) => {
          const s = APP_STATUS_TAG[a.status] ?? APP_STATUS_TAG.submitted!;
          return (
            <li
              key={a.id}
              data-testid="applicant-row"
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card-bg px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <span className="font-heading text-[0.98rem] font-bold text-text">{a.candidate_name}</span>
                <p className="mt-0.5 font-body text-[0.78rem] text-muted">
                  {a.job_title} · Applied{" "}
                  {new Date(a.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              {a.resume_signed_url ? (
                <a
                  href={a.resume_signed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-border px-3 py-1.5 font-heading text-[0.74rem] font-bold text-primary hover:border-primary"
                >
                  View resume
                </a>
              ) : null}
              <Tag variant={s.variant}>{s.label}</Tag>
            </li>
          );
        })}
      </ul>
    );
  }

  const tabs: DashboardTab[] = [
    { id: "overview", label: "Overview", icon: "trending", render: () => (<>{header}<JobList /></>) },
    { id: "posted", label: "Posted jobs", icon: "briefcase", render: () => (<>{header}<JobList /></>) },
    {
      id: "applicants",
      label: "Applicants",
      icon: "user",
      render: () => (
        <>
          <DashboardHeader
            title="Applicants"
            subtitle="Everyone who applied to your listings. Open a resume or track review status."
          />
          <ApplicantsView />
        </>
      ),
    },
  ];

  return (
    <>
      <DashboardShell role="employer" fullName={fullName} tabs={tabs} />
      {modalOpen ? <PostJobModal onClose={() => setModalOpen(false)} /> : null}
    </>
  );
}
