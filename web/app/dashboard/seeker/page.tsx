import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { SeekerDashboard, type ApplicationRow } from "@/components/dashboard/SeekerDashboard";

export const dynamic = "force-dynamic";

const FILTERS = new Set(["submitted", "reviewed", "rejected"]);

export default async function SeekerDashboardPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/seeker");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  const filter = searchParams.status && FILTERS.has(searchParams.status) ? searchParams.status : "all";

  // Service role joins jobs so a closed job's title still shows (the seeker can't read closed
  // jobs via RLS). The seeker is already authenticated above.
  const svc = createServiceClient();
  let query = svc
    .from("applications")
    .select("id, status, applied_at, job:jobs(id, title, company_name, location)")
    .eq("applicant_id", user.id)
    .order("applied_at", { ascending: false });
  if (filter !== "all") query = query.eq("status", filter);
  const { data } = await query;

  const applications = ((data as unknown as ApplicationRow[] | null) ?? []).map((a) => ({
    ...a,
    job: Array.isArray(a.job) ? (a.job[0] ?? null) : a.job,
  }));

  return (
    <SeekerDashboard
      fullName={profile?.full_name || user.email || "there"}
      applications={applications}
      activeFilter={filter}
    />
  );
}
