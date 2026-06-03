import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "@/lib/hooks/use-user";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/navigation-progress";
import type { Profile } from "@/lib/supabase/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    redirect("/login?error=inactive");
  }

  return (
    <UserProvider initialProfile={profile as Profile}>
      <NavigationProgress />
      <DashboardShell>{children}</DashboardShell>
      <Toaster richColors />
    </UserProvider>
  );
}
