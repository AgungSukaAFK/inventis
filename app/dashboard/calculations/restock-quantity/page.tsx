import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Construction } from "lucide-react";

export default async function RestockQuantityCalculationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const role = profileData?.role;
  if (!role || !["kepala_gudang", "kepala_toko", "owner"].includes(role)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Restock Quantity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Riwayat kalkulasi TOPSIS untuk penentuan jumlah restock.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 gap-3">
        <Construction className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">Segera Hadir</p>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Kalkulasi Restock Quantity sedang dalam pengembangan.
        </p>
      </div>
    </div>
  );
}
