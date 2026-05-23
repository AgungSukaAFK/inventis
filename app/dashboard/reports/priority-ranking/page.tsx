import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPriorityRankingCalculations } from "@/app/dashboard/calculations/priority-ranking/actions";
import { FileText, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalculationStatus } from "@/lib/supabase/types";

function StatusBadge({ status }: { status: CalculationStatus }) {
  const map = {
    completed: { label: "Selesai",    cls: "bg-green-500/10 text-green-700 dark:text-green-400" },
    draft:     { label: "Draft",      cls: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
    archived:  { label: "Diarsipkan", cls: "bg-muted text-muted-foreground" },
  } as const;
  const { label, cls } = map[status] ?? map.draft;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", cls)}>
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function LaporanPRPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (!["owner", "kepala_toko"].includes(profileData?.role ?? "")) redirect("/dashboard");

  const calculations = await getPriorityRankingCalculations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Laporan Priority Ranking</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daftar hasil kalkulasi TOPSIS Priority Ranking. Pilih kalkulasi untuk mencetak laporan.
        </p>
      </div>

      {calculations.length === 0 ? (
        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 gap-3">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">Belum ada kalkulasi</p>
          <p className="text-xs text-muted-foreground">Kalkulasi Priority Ranking belum pernah dibuat.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Judul</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Periode Data</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Produk</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {calculations.map((calc) => (
                <tr key={calc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{calc.title}</p>
                    {calc.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{calc.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {calc.period_start && calc.period_end
                      ? `${formatDate(calc.period_start)} – ${formatDate(calc.period_end)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">
                    {calc.total_alternatives}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={calc.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(calc.calculation_date)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/reports/priority-ranking/${calc.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Cetak
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
