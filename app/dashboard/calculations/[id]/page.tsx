import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCalculationDetail } from "./actions";
import { ApplyButton } from "./apply-button";
import { ApplyItemButton } from "./apply-item-button";
import { PrintButton } from "./print-button";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function MovementBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    fast_moving: "bg-green-500/10 text-green-700 dark:text-green-400",
    medium_moving: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    slow_moving: "bg-muted text-muted-foreground",
  };
  const labels: Record<string, string> = {
    fast_moving: "Fast",
    medium_moving: "Medium",
    slow_moving: "Slow",
  };
  return (
    <span
      className={cn(
        "text-xs px-1.5 py-0.5 rounded-full font-medium",
        map[cat] ?? map.slow_moving,
      )}
    >
      {labels[cat] ?? cat}
    </span>
  );
}

export default async function CalculationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const detail = await getCalculationDetail(id);
  if (!detail) notFound();

  const { calc, results } = detail;
  const canApply = role === "kepala_toko";

  const purposeLabel: Record<string, string> = {
    safety_stock: "Safety Stock",
    priority_ranking: "Priority Ranking",
    restock_quantity: "Restock Quantity",
  };
  const purposeHref: Record<string, string> = {
    safety_stock: "/dashboard/calculations/safety-stock",
    priority_ranking: "/dashboard/calculations/priority-ranking",
    restock_quantity: "/dashboard/calculations/restock-quantity",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href={
          purposeHref[calc.purpose] ?? "/dashboard/calculations/safety-stock"
        }
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {purposeLabel[calc.purpose] ?? "Kalkulasi"}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {calc.title}
          </h1>
          {calc.description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {calc.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span>
              Periode:{" "}
              {calc.period_start && calc.period_end
                ? `${formatDate(calc.period_start)} – ${formatDate(calc.period_end)}`
                : "—"}
            </span>
            <span>Buffer: {calc.buffer_days} hari</span>
            <span>{calc.total_alternatives} produk</span>
            <span>Dihitung {formatDate(calc.calculation_date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <PrintButton />
          {canApply && results.length > 0 && (
            <ApplyButton calculationId={calc.id} />
          )}
        </div>
      </div>

      {/* Results table */}
      {results.length === 0 ? (
        <div className="rounded-xl border border-border bg-card flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">
            Tidak ada hasil kalkulasi.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-12">
                  Rank
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Produk
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Kategori
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Avg/Hari
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  CV
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Skor TOPSIS
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  SS Saat Ini
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  SS Rekomendasi
                </th>
                {canApply && (
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground print:hidden">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((r) => {
                const isTop3 = r.rank_order <= 3;
                const diff =
                  (r.recommended_safety_stock ?? 0) -
                  (r.current_safety_stock ?? 0);
                return (
                  <tr
                    key={r.id}
                    className={cn(
                      "transition-colors",
                      isTop3
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/20",
                    )}
                  >
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isTop3 && (
                          <Trophy className="h-3 w-3 text-yellow-500" />
                        )}
                        <span
                          className={cn(
                            "tabular-nums font-semibold",
                            isTop3 ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {r.rank_order}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {r.product?.name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.product?.sku ?? ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <MovementBadge
                        cat={r.product?.movement_category ?? "slow_moving"}
                      />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {r.avg_daily_sales != null
                        ? r.avg_daily_sales.toFixed(2)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {r.coefficient_of_variation != null
                        ? r.coefficient_of_variation.toFixed(3)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${Math.min(100, r.preference_percentage)}%`,
                            }}
                          />
                        </div>
                        <span className="tabular-nums text-foreground font-medium w-10 text-right">
                          {r.preference_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {r.current_safety_stock ?? r.product?.safety_stock ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="tabular-nums font-semibold text-foreground">
                        {r.recommended_safety_stock ?? 0}
                      </span>
                      {diff !== 0 && (
                        <span
                          className={cn(
                            "ml-1.5 text-xs",
                            diff > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-destructive",
                          )}
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </td>
                    {canApply && (
                      <td className="px-4 py-3 text-center print:hidden">
                        <ApplyItemButton
                          calculationId={calc.id}
                          productId={r.product_id}
                          recommendedSafetyStock={
                            r.recommended_safety_stock ?? 0
                          }
                          productName={r.product?.name ?? "Produk"}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
