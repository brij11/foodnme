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

const STATUS_TAG: Record<string, { variant: TagVariant; label: string }> = {
  pending: { variant: "orange", label: "Pending review" },
  active: { variant: "green", label: "Active" },
  closed: { variant: "neutral", label: "Closed" },
};

// Employer dashboard (story-jobs-04): post jobs + manage own listings.
export function EmployerDashboard({ fullName, jobs }: { fullName: string; jobs: EmployerJob[] }) {
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
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <DashboardHeader title="Employer dashboard" subtitle="Manage your job postings and review applicants." />
      <Button onClick={() => setModalOpen(true)}>Post a job</Button>
    </div>
  );

  const tabs: DashboardTab[] = [
    { id: "overview", label: "Overview", icon: "trending", render: () => (<>{header}<JobList /></>) },
    { id: "posted", label: "Posted jobs", icon: "briefcase", render: () => (<>{header}<JobList /></>) },
    {
      id: "applicants",
      label: "Applicants",
      icon: "user",
      render: () => (
        <EmptyState title="Applicants" message="Applicant counts show on each listing. A per-applicant review view ships next." action={{ label: "Browse the job board", href: "/jobs" }} />
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
