import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  EmployerDashboard,
  type EmployerJob,
  type ApplicantRow,
  type EmployerStats,
} from "@/components/dashboard/EmployerDashboard";

export const dynamic = "force-dynamic";

/** Derive the storage object path from a stored resume_url (full public URL or bare path). */
function resumePath(resumeUrl: string | null): string | null {
  if (!resumeUrl) return null;
  const marker = "/resumes/";
  const idx = resumeUrl.indexOf(marker);
  return idx >= 0 ? resumeUrl.slice(idx + marker.length) : resumeUrl;
}

export default async function EmployerDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/employer");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  // Own jobs (RLS self-read).
  const { data: ownJobs } = await supabase
    .from("jobs")
    .select("id, title, status, created_at")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false });

  const ownJobRows = (ownJobs as { id: string; title: string; status: string; created_at: string }[] | null) ?? [];
  const jobIds = ownJobRows.map((j) => j.id);
  const titleById = new Map(ownJobRows.map((j) => [j.id, j.title]));

  // Applications across the employer's own jobs (service role; explicitly scoped to jobIds so an
  // employer never sees another's applicants).
  const svc = createServiceClient();
  type AppRow = {
    id: string;
    status: string;
    applied_at: string;
    job_id: string;
    applicant_id: string;
    resume_url: string | null;
  };
  let apps: AppRow[] = [];
  if (jobIds.length > 0) {
    const { data } = await svc
      .from("applications")
      .select("id, status, applied_at, job_id, applicant_id, resume_url")
      .in("job_id", jobIds)
      .order("applied_at", { ascending: false });
    apps = (data as AppRow[] | null) ?? [];
  }

  // Candidate display names from the public_profiles view.
  const applicantIds = [...new Set(apps.map((a) => a.applicant_id))];
  const nameById = new Map<string, string>();
  if (applicantIds.length > 0) {
    const { data: profs } = await svc
      .from("public_profiles")
      .select("id, full_name")
      .in("id", applicantIds);
    for (const p of (profs as { id: string; full_name: string | null }[] | null) ?? []) {
      nameById.set(p.id, p.full_name || "Candidate");
    }
  }

  const jobsWithCounts: EmployerJob[] = ownJobRows.map((j) => ({
    id: j.id,
    title: j.title,
    status: j.status,
    created_at: j.created_at,
    applicant_count: apps.filter((a) => a.job_id === j.id).length,
  }));

  // Short-lived (5 min) signed resume URLs — the bucket is private (no public exposure).
  const applicants: ApplicantRow[] = await Promise.all(
    apps.map(async (a) => {
      const path = resumePath(a.resume_url);
      let resumeSignedUrl: string | null = null;
      if (path) {
        const { data } = await svc.storage.from("resumes").createSignedUrl(path, 300);
        resumeSignedUrl = data?.signedUrl ?? null;
      }
      return {
        id: a.id,
        candidate_name: nameById.get(a.applicant_id) || "Candidate",
        job_title: titleById.get(a.job_id) || "—",
        applied_at: a.applied_at,
        status: a.status,
        resume_signed_url: resumeSignedUrl,
      };
    }),
  );

  const stats: EmployerStats = {
    activeListings: ownJobRows.filter((j) => j.status === "active").length,
    totalApplicants: apps.length,
    pendingReview: apps.filter((a) => a.status === "submitted").length,
  };

  return (
    <EmployerDashboard
      fullName={profile?.full_name || user.email || "there"}
      jobs={jobsWithCounts}
      applicants={applicants}
      stats={stats}
    />
  );
}
