import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { EmployerDashboard, type EmployerJob } from "@/components/dashboard/EmployerDashboard";

export const dynamic = "force-dynamic";

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

  // Own jobs (RLS self-read) + applicant counts (service role aggregates across applications).
  const { data: ownJobs } = await supabase
    .from("jobs")
    .select("id, title, status, created_at")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false });

  const svc = createServiceClient();
  const jobs: EmployerJob[] = [];
  for (const j of (ownJobs as { id: string; title: string; status: string }[] | null) ?? []) {
    const { count } = await svc
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", j.id);
    jobs.push({ id: j.id, title: j.title, status: j.status, applicant_count: count ?? 0 });
  }

  return (
    <EmployerDashboard fullName={profile?.full_name || user.email || "there"} jobs={jobs} />
  );
}
