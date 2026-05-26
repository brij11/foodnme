import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJobById, companyInitial, formatSalary } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { ApplyButton } from "@/components/jobs/ApplyButton";

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

  // Role-aware Apply CTA: read the viewer's role server-side (null when signed out).
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let role: "seeker" | "employer" | "expert" | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const r = data?.role;
    role = r === "seeker" || r === "employer" || r === "expert" ? r : null;
  }

  return (
    <div className="mx-auto max-w-content px-6 pt-8 lg:px-12">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Jobs", href: "/jobs" }, { label: job.title }]}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="flex items-start gap-4 border-b border-border pb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-tag-safe-bg font-heading text-[1.05rem] font-bold text-tag-safe-text">
              {companyInitial(job.company_name)}
            </div>
            <div>
              <h1 className="font-heading text-[1.8rem] font-bold tracking-[-0.02em] text-text">{job.title}</h1>
              <p className="mt-1 font-body text-[1rem] text-muted">{job.company_name}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-[0.84rem] text-muted">
                <span className="flex items-center gap-1.5"><Icon name="map-pin" size={13} stroke={1.8} /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Icon name="briefcase" size={13} stroke={1.8} /> {job.job_type}</span>
                <span>{job.experience_level}</span>
              </div>
            </div>
          </div>

          <h2 className="mt-7 font-heading text-[1.2rem] font-bold text-text">About the role</h2>
          <p className="mt-3 whitespace-pre-line font-body text-[1rem] leading-relaxed text-text">{job.description}</p>

          <h3 className="mt-7 font-heading text-[1.05rem] font-bold text-text">Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <Tag key={s} variant="neutral">{s}</Tag>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card-bg p-6">
          <div className="font-heading text-[1.3rem] font-extrabold tracking-[-0.02em] text-text">
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
          <p className="mt-1 font-body text-[0.78rem] text-muted">per year</p>
          <div className="mt-5">
            <ApplyButton jobId={job.id} jobTitle={job.title} role={role} />
          </div>
        </aside>
      </div>
    </div>
  );
}
