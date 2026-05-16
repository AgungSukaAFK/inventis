import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "@/lib/hooks/use-user";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
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
      <div className="flex h-screen overflow-hidden bg-muted print:block print:h-auto print:overflow-visible print:bg-white">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">{children}</main>
        </div>
      </div>
      <Toaster richColors />
    </UserProvider>
  );
}
