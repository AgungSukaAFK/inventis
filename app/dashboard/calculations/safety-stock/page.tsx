import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSafetyStockCalculations } from "./actions";
import { Plus, FileText, CheckCircle2, Archive, FilePen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalculationStatus } from "@/lib/supabase/types";

function StatusBadge({ status }: { status: CalculationStatus }) {
  const map = {
    completed: { label: "Selesai", icon: CheckCircle2, cls: "bg-green-500/10 text-green-700 dark:text-green-400" },
    draft: { label: "Draft", icon: FilePen, cls: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
    archived: { label: "Diarsipkan", icon: Archive, cls: "bg-muted text-muted-foreground" },
  } as const;
  const { label, icon: Icon, cls } = map[status] ?? map.draft;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", cls)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function SafetyStockCalculationsPage() {
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

  const calculations = await getSafetyStockCalculations();
  const canCreate = role === "kepala_gudang" || role === "kepala_toko";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Safety Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Riwayat kalkulasi TOPSIS untuk penentuan safety stock.
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/calculations/safety-stock/new"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Kalkulasi Baru
          </Link>
        )}
      </div>

      {calculations.length === 0 ? (
        <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-16 gap-3">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">Belum ada kalkulasi</p>
          {canCreate && (
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Mulai kalkulasi safety stock pertama untuk menentukan buffer stok optimal.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Judul</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Periode</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Alternatif</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {calculations.map((calc) => (
                <tr key={calc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/calculations/${calc.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {calc.title}
                    </Link>
                    {calc.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {calc.description}
                      </p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
