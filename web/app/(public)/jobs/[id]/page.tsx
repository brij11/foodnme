import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJobById, getSimilarJobs, companyInitial, formatSalary, formatPostedDate } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { JobCard } from "@/components/jobs/JobCard";

/** "What you'll do" / "Who we're looking for" check-listed section (story-jobs-11). */
function CheckList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-[1.2rem] font-bold text-text">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 font-body text-[0.95rem] leading-relaxed text-text">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tag-safe-bg text-tag-safe-text">
              <Icon name="check" size={12} stroke={2.6} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await getJobById(params.id);
  if (!job) return { title: "Job not found — foodnme" };
  const desc = `${job.company_name} · ${job.location} · ${job.job_type}. ${job.skills.slice(0, 4).join(", ")}.`;
  return {
    title: `${job.title} at ${job.company_name} | foodnme`,
    description: desc,
    openGraph: { title: `${job.title} — ${job.company_name}`, description: desc, type: "website" },
  };
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id);
  if (!job) notFound();

  const similar = await getSimilarJobs(job, 3);

  // Role-aware Apply CTA: read the viewer's role server-side (null when signed out).
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let role: "seeker" | "employer" | "expert" | null = null;
  let alreadyApplied = false;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const r = data?.role;
    role = r === "seeker" || r === "employer" || r === "expert" ? r : null;
    if (role === "seeker") {
      // Duplicate-apply guard (story-jobs-05): own application row via RLS self-read.
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", job.id)
        .eq("applicant_id", user.id)
        .maybeSingle();
      alreadyApplied = !!existing;
    }
  }

  return (
    <div className="mx-auto max-w-content px-6 pt-8 lg:px-12">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Jobs", href: "/jobs" }, { label: job.title }]}
      />

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="flex items-start gap-4 border-b border-border pb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-tag-safe-bg font-heading text-[1.05rem] font-bold text-tag-safe-text">
              {companyInitial(job.company_name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="font-heading text-[1.8rem] font-bold tracking-[-0.02em] text-text">{job.title}</h1>
                {job.is_featured ? (
                  <Tag variant="accent" className="mt-1 shrink-0">
                    Featured
                  </Tag>
                ) : null}
              </div>
              <p className="mt-1 font-body text-[1rem] text-muted">{job.company_name}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-[0.84rem] text-muted">
                <span className="flex items-center gap-1.5"><Icon name="map-pin" size={13} stroke={1.8} /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Icon name="briefcase" size={13} stroke={1.8} /> {job.job_type}</span>
                <span>{job.experience_level}</span>
                <span className="flex items-center gap-1.5"><Icon name="clock" size={13} stroke={1.8} /> Posted {formatPostedDate(job.created_at)}</span>
              </div>
            </div>
          </div>

          <h2 className="mt-7 font-heading text-[1.2rem] font-bold text-text">About the role</h2>
          <p className="mt-3 whitespace-pre-line font-body text-[1rem] leading-relaxed text-text">{job.description}</p>

          {job.responsibilities.length > 0 ? (
            <CheckList title="What you'll do" items={job.responsibilities} />
          ) : null}
          {job.requirements.length > 0 ? (
            <CheckList title="Who we're looking for" items={job.requirements} />
          ) : null}

          <h3 className="mt-8 font-heading text-[1.05rem] font-bold text-text">Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <Tag key={s} variant="neutral">{s}</Tag>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card-bg p-6 lg:sticky lg:top-24">
          <div className="font-heading text-[1.3rem] font-extrabold tracking-[-0.02em] text-text">
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
          <p className="mt-1 font-body text-[0.78rem] text-muted">per year</p>
          <div className="mt-5">
            <ApplyButton jobId={job.id} jobTitle={job.title} role={role} alreadyApplied={alreadyApplied} />
          </div>

          <ul className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5 font-body text-[0.84rem]">
            {[
              { label: "Job type", value: job.job_type },
              { label: "Location", value: job.location },
              { label: "Experience", value: job.experience_level },
              { label: "Applicants", value: String(job.applicant_count) },
              { label: "Posted", value: formatPostedDate(job.created_at) },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-muted">{row.label}</span>
                <span className="font-medium text-text">{row.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center font-body text-[0.76rem] text-muted">
            Applications reviewed weekly. You&apos;ll hear from us within 7 days.
          </p>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-heading text-[1.3rem] font-bold text-text">Similar roles</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
