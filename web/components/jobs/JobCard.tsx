import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { type JobCardData, companyInitial, formatSalary, formatPostedDate } from "@/lib/jobs";
import { SaveButton } from "./SaveButton";

/** Jobs board card (story-jobs-01, enriched story-jobs-10, save control story-jobs-15). */
export function JobCard({ job }: { job: JobCardData }) {
  return (
    <Card hover data-testid="job-card" className="flex h-full flex-col gap-3.5">
      <div className="flex items-start gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-tag-safe-bg font-heading text-[0.92rem] font-bold text-tag-safe-text">
          {companyInitial(job.company_name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-[1.02rem] font-bold leading-snug tracking-[-0.01em] text-text">
            {job.title}
          </h3>
          <p className="mt-0.5 font-body text-[0.86rem] text-muted">{job.company_name}</p>
          <p className="mt-0.5 font-body text-[0.74rem] text-muted" data-testid="job-meta">
            {formatPostedDate(job.created_at)} · {job.applicant_count}{" "}
            {job.applicant_count === 1 ? "applicant" : "applicants"}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {job.is_featured ? <Tag variant="accent">Featured</Tag> : null}
          <SaveButton jobId={job.id} variant="card" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-[0.78rem] text-muted">
        <span className="flex items-center gap-1.5">
          <Icon name="map-pin" size={13} stroke={1.8} /> {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="briefcase" size={13} stroke={1.8} /> {job.job_type}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="trending" size={13} stroke={1.8} /> {job.experience_level}
        </span>
      </div>

      <p className="line-clamp-2 font-body text-[0.86rem] leading-relaxed text-muted">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {job.skills.slice(0, 3).map((s) => (
          <Tag key={s} variant="neutral">
            {s}
          </Tag>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3.5">
        <span className="font-heading text-[0.88rem] font-bold text-text">
          {formatSalary(job.salary_min, job.salary_max)}
        </span>
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-heading text-[0.78rem] font-bold text-white transition hover:bg-primary-deep"
        >
          View job
        </Link>
      </div>
    </Card>
  );
}
