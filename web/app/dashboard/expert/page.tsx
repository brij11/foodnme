import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExpertDashboard } from "@/components/dashboard/ExpertDashboard";

export const dynamic = "force-dynamic";

export default async function ExpertDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/expert");

  const { data } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  return <ExpertDashboard fullName={data?.full_name || user.email || "there"} />;
}
