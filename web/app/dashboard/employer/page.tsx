import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployerDashboard } from "@/components/dashboard/EmployerDashboard";

export const dynamic = "force-dynamic";

export default async function EmployerDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/employer");

  const { data } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  return <EmployerDashboard fullName={data?.full_name || user.email || "there"} />;
}
