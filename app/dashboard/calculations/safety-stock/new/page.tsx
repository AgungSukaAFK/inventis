import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewCalculationForm } from "./new-calculation-form";

export default async function NewSafetyStockPage() {
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
  if (role !== "kepala_gudang" && role !== "kepala_toko") {
    redirect("/dashboard/calculations/safety-stock");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Kalkulasi Baru</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Jalankan TOPSIS untuk menentukan safety stock semua produk aktif.
        </p>
      </div>

      <NewCalculationForm />
    </div>
  );
}
