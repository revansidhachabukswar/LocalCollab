import { redirect } from "next/navigation";
import Dashboard from "./dashboard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  let supabase;
  try { supabase = await createClient(); } catch { redirect("/login?setup=supabase"); }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile, error } = await supabase.from("profiles").select("role,display_name,city,region").eq("id", user.id).maybeSingle();
  if (error) throw new Error(`Could not load your profile: ${error.message}`);
  if (!profile) redirect("/onboarding");
  return <Dashboard role={profile.role === "creator" ? "creator" : "business"} displayName={profile.display_name} city={profile.city ?? ""} region={profile.region ?? ""} email={user.email ?? ""} />;
}
