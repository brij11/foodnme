"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ApplyModal } from "./ApplyModal";

type Role = "seeker" | "employer" | "expert" | null;

/**
 * Role-aware Apply CTA on the job detail page (story-jobs-02).
 *   not signed in → link to /login?redirect=/jobs/[id]
 *   seeker        → opens the apply modal (resume + cover note; story-jobs-05/06)
 *   employer/expert → inline "switch to a seeker account" note
 *
 * story-jobs-16 D10: CTA copy aligned to "Apply for this job"
 * (DEVIATIONS D10; prototype screens-jobs.jsx:195).
 */
export function ApplyButton({
  jobId,
  jobTitle,
  role,
  alreadyApplied = false,
}: {
  jobId: string;
  jobTitle: string;
  role: Role;
  alreadyApplied?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (role === null) {
    return (
      <Link
        href={`/login?redirect=/jobs/${jobId}`}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-heading text-[0.88rem] font-bold text-white transition hover:bg-primary-deep"
      >
        <Icon name="briefcase" size={15} stroke={2} /> Sign in to apply
      </Link>
    );
  }

  if (role !== "seeker") {
    return (
      <p className="font-body text-[0.82rem] text-muted">
        Switch to a seeker account to apply for jobs.
      </p>
    );
  }

  if (alreadyApplied) {
    return (
      <p className="inline-flex items-center gap-2 font-body text-[0.86rem] font-semibold text-tag-safe-text">
        <Icon name="check" size={15} stroke={2.4} /> You&apos;ve applied to this role
      </p>
    );
  }

  return (
    <>
      {/* story-jobs-16 D10: CTA copy aligned to prototype "Apply for this job" */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-heading text-[0.88rem] font-bold text-white transition hover:bg-primary-deep"
        data-testid="apply-cta"
      >
        <Icon name="briefcase" size={15} stroke={2} /> Apply for this job
      </button>
      {open ? <ApplyModal jobId={jobId} jobTitle={jobTitle} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
