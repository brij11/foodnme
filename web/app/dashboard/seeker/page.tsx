import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeekerDashboard } from "@/components/dashboard/SeekerDashboard";

export const dynamic = "force-dynamic";

export default async function SeekerDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/seeker");

  const { data } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  return <SeekerDashboard fullName={data?.full_name || user.email || "there"} />;
}
