import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  const roleLabel: Record<string, string> = {
    owner: "Owner",
    kepala_toko: "Kepala Toko",
    kepala_gudang: "Kepala Gudang",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Selamat datang, {profile?.full_name ?? "Pengguna"} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {roleLabel[profile?.role ?? ""] ?? profile?.role} · Banten Jaya Sport
          Fashion
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Gunakan menu di sebelah kiri untuk navigasi sistem inventaris.
        </p>
      </div>
    </div>
  );
}
