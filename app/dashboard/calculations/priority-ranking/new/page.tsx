import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewCalculationForm } from "./new-calculation-form";

export default async function NewPriorityRankingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const role = profileData?.role;
  if (!role || !["kepala_gudang", "kepala_toko"].includes(role)) {
    redirect("/dashboard/calculations/priority-ranking");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/dashboard/calculations/priority-ranking"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Priority Ranking
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">Kalkulasi Baru</h1>
        <p className="text-sm text-muted-foreground mt-1">
          TOPSIS Priority Ranking — menentukan urutan prioritas restock produk.
        </p>
      </div>

      <NewCalculationForm />
    </div>
  );
}
