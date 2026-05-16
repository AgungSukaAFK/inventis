import { createClient } from "@/lib/supabase/server";
import { Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DashboardCards,
  type ProductDetail,
  type SaleDetail,
} from "./dashboard-cards";
import {
  SalesTrendChart,
  MovementDonutChart,
  type MonthlySale,
  type DistItem,
} from "./dashboard-charts";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const MOVEMENT_COLORS: Record<string, string> = {
  fast_moving: "#16a34a",
  medium_moving: "#d97706",
  slow_moving: "#dc2626",
};

const MOVEMENT_LABELS: Record<string, string> = {
  fast_moving: "Fast Moving",
  medium_moving: "Medium Moving",
  slow_moving: "Slow Moving",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  kepala_toko: "Kepala Toko",
  kepala_gudang: "Kepala Gudang",
};

function priorityLabel(vi: number) {
  if (vi >= 0.7) return { label: "Sangat Tinggi", cls: "text-red-600 bg-red-50" };
  if (vi >= 0.5) return { label: "Tinggi", cls: "text-orange-600 bg-orange-50" };
  if (vi >= 0.3) return { label: "Sedang", cls: "text-yellow-600 bg-yellow-50" };
  return { label: "Rendah", cls: "text-green-600 bg-green-50" };
}

const RANK_COLORS = [
  "text-amber-500",
  "text-slate-400",
  "text-orange-400",
  "text-muted-foreground",
  "text-muted-foreground",
];

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

  const role = profile?.role;
  const showRevenue = role === "kepala_toko" || role === "owner";

  // All active products
  const { data: rawProducts } = await supabase
    .from("products")
    .select("id, name, sku, current_stock, safety_stock, movement_category")
    .eq("is_active", true);

  const products: ProductDetail[] = (rawProducts ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    current_stock: p.current_stock,
    safety_stock: p.safety_stock,
    movement_category: p.movement_category,
  }));

  const totalProducts = products.length;

  const criticalProducts = products
    .filter((p) => p.current_stock <= p.safety_stock)
    .sort(
      (a, b) =>
        (a.current_stock - a.safety_stock) - (b.current_stock - b.safety_stock),
    );

  const movementCounts = { fast_moving: 0, medium_moving: 0, slow_moving: 0 };
  const fastMovingProducts: ProductDetail[] = [];
  const slowMovingProducts: ProductDetail[] = [];
  for (const p of products) {
    if (p.movement_category === "fast_moving") {
      movementCounts.fast_moving++;
      fastMovingProducts.push(p);
    } else if (p.movement_category === "medium_moving") {
      movementCounts.medium_moving++;
    } else if (p.movement_category === "slow_moving") {
      movementCounts.slow_moving++;
      slowMovingProducts.push(p);
    }
  }

  const movementDist: DistItem[] = [
    {
      name: MOVEMENT_LABELS.fast_moving,
      value: movementCounts.fast_moving,
      color: MOVEMENT_COLORS.fast_moving,
    },
    {
      name: MOVEMENT_LABELS.medium_moving,
      value: movementCounts.medium_moving,
      color: MOVEMENT_COLORS.medium_moving,
    },
    {
      name: MOVEMENT_LABELS.slow_moving,
      value: movementCounts.slow_moving,
      color: MOVEMENT_COLORS.slow_moving,
    },
  ];

  // Sales history — last 6 months, newest first for deduplication
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const sixMonthsAgoStr = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, "0")}-01`;

  const { data: salesHistory } = await supabase
    .from("sales_history")
    .select("sale_date, quantity_sold, revenue, product_id")
    .gte("sale_date", sixMonthsAgoStr)
    .order("sale_date", { ascending: false });

  // Deduplicate per (product_id, month).
  // The sales form always saves with sale_date = YYYY-MM-01 (first of month).
  // Seeded data may have used the actual run date (e.g. 2026-05-16), creating extra rows.
  // Strategy: prefer first-of-month records (form-entered, authoritative).
  // For months with no first-of-month record, fall back to the latest available (salesHistory is DESC).
  const seen = new Set<string>();
  const deduped: NonNullable<typeof salesHistory> = [];

  // Pass 1: collect authoritative first-of-month records
  for (const row of salesHistory ?? []) {
    if (!row.sale_date.endsWith("-01")) continue;
    const monthKey = row.sale_date.slice(0, 7);
    const k = `${row.product_id}:${monthKey}`;
    if (!seen.has(k)) {
      seen.add(k);
      deduped.push(row);
    }
  }

  // Pass 2: fill remaining product+month gaps with the latest seeded record
  for (const row of salesHistory ?? []) {
    const monthKey = row.sale_date.slice(0, 7);
    const k = `${row.product_id}:${monthKey}`;
    if (!seen.has(k)) {
      seen.add(k);
      deduped.push(row);
    }
  }

  // Aggregate by month
  const monthlyMap: Record<string, { qty: number; revenue: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = { qty: 0, revenue: 0 };
  }
  for (const row of deduped) {
    const key = row.sale_date.slice(0, 7);
    if (key in monthlyMap) {
      monthlyMap[key].qty += row.quantity_sold;
      monthlyMap[key].revenue += row.revenue;
    }
  }

  const monthlyTrend: MonthlySale[] = Object.entries(monthlyMap).map(([key, val]) => ({
    month: MONTH_NAMES[parseInt(key.split("-")[1]) - 1],
    qty: val.qty,
    revenue: val.revenue,
  }));

  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonth = monthlyMap[currentMonthKey] ?? { qty: 0, revenue: 0 };

  // Per-product breakdown for current month (for card dialogs)
  const productMap = new Map(products.map((p) => [p.id, p]));
  const currentMonthSales: SaleDetail[] = deduped
    .filter((row) => row.sale_date.slice(0, 7) === currentMonthKey)
    .map((row) => {
      const prod = productMap.get(row.product_id);
      return {
        product_id: row.product_id,
        productName: prod?.name ?? "—",
        productSku: prod?.sku ?? row.product_id.slice(0, 8),
        quantity_sold: row.quantity_sold,
        revenue: row.revenue,
      };
    });

  const currentMonthLabel = now.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // Latest priority ranking top 5
  const { data: latestCalc } = await supabase
    .from("topsis_calculations")
    .select("id, title, calculation_date")
    .eq("purpose", "priority_ranking")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  type RankRow = {
    rank_order: number;
    preference_score: number;
    product_id: string;
    productName?: string;
    productSku?: string;
  };

  let topRanking: RankRow[] = [];
  if (latestCalc) {
    const { data: results } = await supabase
      .from("topsis_results")
      .select("rank_order, preference_score, product_id")
      .eq("calculation_id", latestCalc.id)
      .order("rank_order")
      .limit(5);

    topRanking = (results ?? []).map((r) => {
      const prod = productMap.get(r.product_id);
      return { ...r, productName: prod?.name, productSku: prod?.sku };
    });
  }

  const today = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Selamat datang, {profile?.full_name ?? "Pengguna"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {ROLE_LABELS[role ?? ""] ?? role} · {today}
        </p>
      </div>

      {/* Stat Cards — interactive, client component */}
      <DashboardCards
        totalProducts={totalProducts}
        criticalCount={criticalProducts.length}
        currentMonthQty={currentMonth.qty}
        currentMonthRevenue={currentMonth.revenue}
        fastMovingCount={movementCounts.fast_moving}
        slowMovingCount={movementCounts.slow_moving}
        showRevenue={showRevenue}
        currentMonthLabel={currentMonthLabel}
        allProducts={products}
        criticalProducts={criticalProducts}
        currentMonthSales={currentMonthSales}
        fastMovingProducts={fastMovingProducts}
        slowMovingProducts={slowMovingProducts}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {showRevenue
                ? "Tren Revenue 6 Bulan Terakhir"
                : "Tren Penjualan 6 Bulan Terakhir"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {showRevenue
                ? "Total revenue bulanan dari data penjualan"
                : "Total unit terjual per bulan"}
            </p>
          </div>
          <SalesTrendChart data={monthlyTrend} showRevenue={showRevenue} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Distribusi Pergerakan Barang
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kategori pergerakan stok barang
            </p>
          </div>
          <div className="flex items-center justify-center">
            <MovementDonutChart data={movementDist} />
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Critical Stock */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Produk Stok Kritis</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Stok saat ini ≤ safety stock
              </p>
            </div>
            <Link
              href="/dashboard/products"
              className="text-xs text-primary hover:underline shrink-0"
            >
              Lihat semua →
            </Link>
          </div>

          {criticalProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground">Semua stok aman</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tidak ada produk dengan stok kritis saat ini
              </p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      Produk
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                      Stok
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                      Safety
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground">
                      Kekurangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {criticalProducts.slice(0, 5).map((p, idx) => (
                    <tr
                      key={p.id}
                      className={cn(
                        "border-b border-border last:border-0",
                        idx % 2 === 1 ? "bg-muted/20" : "",
                      )}
                    >
                      <td className="px-5 py-3">
                        <p className="text-xs font-medium text-foreground leading-snug">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-xs tabular-nums font-medium">
                        {p.current_stock}
                      </td>
                      <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
                        {p.safety_stock}
                      </td>
                      <td className="px-5 py-3 text-right text-xs tabular-nums font-semibold text-red-600">
                        {p.current_stock - p.safety_stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {criticalProducts.length > 5 && (
                <div className="px-5 py-2.5 text-xs text-muted-foreground border-t border-border bg-muted/10">
                  +{criticalProducts.length - 5} produk lainnya dengan stok kritis
                </div>
              )}
            </>
          )}
        </div>

        {/* Priority Ranking */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Ranking Prioritas Terbaru
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {latestCalc
                  ? new Date(latestCalc.calculation_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Belum ada kalkulasi"}
              </p>
            </div>
            <Link
              href="/dashboard/calculations/priority-ranking"
              className="text-xs text-primary hover:underline shrink-0"
            >
              Lihat semua →
            </Link>
          </div>

          {topRanking.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Belum ada kalkulasi</p>
              <p className="text-xs text-muted-foreground mt-1">
                Jalankan kalkulasi TOPSIS priority ranking untuk melihat data
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-2.5 text-center text-xs font-medium text-muted-foreground w-12">
                    #
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                    Produk
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                    Skor Vi
                  </th>
                  <th className="px-5 py-2.5 text-center text-xs font-medium text-muted-foreground">
                    Prioritas
                  </th>
                </tr>
              </thead>
              <tbody>
                {topRanking.map((r, idx) => {
                  const pri = priorityLabel(r.preference_score);
                  return (
                    <tr
                      key={r.product_id}
                      className={cn(
                        "border-b border-border last:border-0",
                        idx % 2 === 1 ? "bg-muted/20" : "",
                      )}
                    >
                      <td className="px-5 py-3 text-center">
                        <span
                          className={cn(
                            "text-sm font-bold tabular-nums",
                            RANK_COLORS[idx],
                          )}
                        >
                          {r.rank_order}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground leading-snug">
                          {r.productName ?? "—"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {r.productSku ?? r.product_id.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono tabular-nums">
                        {r.preference_score.toFixed(4)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            pri.cls,
                          )}
                        >
                          {pri.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
