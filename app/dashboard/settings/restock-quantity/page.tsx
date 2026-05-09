import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Construction } from "lucide-react";

export default async function RestockQuantitySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (profileData?.role !== "kepala_toko") redirect("/dashboard");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Kriteria Restock Quantity
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Atur bobot dan sub-kriteria untuk kalkulasi TOPSIS restock quantity.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 gap-3">
        <Construction className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">Segera Hadir</p>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Manajemen kriteria Restock Quantity sedang dalam pengembangan.
        </p>
      </div>
    </div>
  );
}
