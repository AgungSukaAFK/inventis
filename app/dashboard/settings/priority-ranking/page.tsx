import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCriteriaWithSubs } from "./actions";
import { CriteriaTable } from "./criteria-table";

export default async function PriorityRankingSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profileData?.role !== "kepala_toko") redirect("/dashboard");

  const criteria = await getCriteriaWithSubs();
  const activeCriteria = criteria.filter((c) => c.is_active);
  const totalWeight = activeCriteria.reduce((sum, c) => sum + c.weight, 0);
  const weightOk = Math.abs(totalWeight - 1) < 0.001;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Kriteria Priority Ranking</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Atur bobot dan sub-kriteria yang digunakan dalam kalkulasi TOPSIS Priority Ranking.
        </p>
      </div>

      {/* Total bobot */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total bobot kriteria aktif</p>
          {!weightOk && (
            <p className="text-xs text-destructive mt-0.5">
              Total bobot harus = 100% agar kalkulasi TOPSIS valid.
            </p>
          )}
        </div>
        <span className={weightOk
          ? "text-sm font-semibold text-green-700 dark:text-green-400"
          : "text-sm font-semibold text-destructive"
        }>
          {(totalWeight * 100).toFixed(0)}%
          {!weightOk && <span className="ml-1.5 font-normal text-xs">(harus = 100%)</span>}
        </span>
      </div>

      {criteria.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Belum ada kriteria. Jalankan migrasi database terlebih dahulu.
        </p>
      ) : (
        <CriteriaTable criteria={criteria} />
      )}
    </div>
  );
}
