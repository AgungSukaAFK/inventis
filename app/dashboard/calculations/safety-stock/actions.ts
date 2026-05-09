"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TopsisCalculation } from "@/lib/supabase/types";

// ─── List ────────────────────────────────────────────────────────────────────

export async function getSafetyStockCalculations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topsis_calculations")
    .select("*")
    .eq("purpose", "safety_stock")
    .order("calculation_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as TopsisCalculation[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ProductMetrics = {
  productId: string;
  avgDailySales: number;
  cv: number;
  movementValue: number;
  stockoutDays: number;
  currentSafetyStock: number;
};

type SubCritRow = { value: number; range_min: number | null; range_max: number | null };

function matchScore(subs: SubCritRow[], rawValue: number): number {
  // Range-based matching (only for subs that have at least one bound)
  const ranged = subs.filter((s) => s.range_min !== null || s.range_max !== null);
  const sorted = [...ranged].sort((a, b) => (a.range_min ?? 0) - (b.range_min ?? 0));
  for (const sub of sorted) {
    const min = sub.range_min ?? -Infinity;
    const max = sub.range_max ?? Infinity;
    if (rawValue >= min && rawValue <= max) return sub.value;
  }
  // Exact value match (used for label-only subs like movement_category)
  const exact = subs.find((s) => s.value === Math.round(rawValue));
  return exact?.value ?? subs[subs.length - 1]?.value ?? 1;
}

// Maps a metric_key to a function that extracts the raw value from ProductMetrics
const METRIC_REGISTRY: Record<string, (m: ProductMetrics) => number> = {
  avg_daily_sales: (m) => m.avgDailySales,
  coefficient_of_variation: (m) => m.cv,
  movement_category: (m) => m.movementValue,
  stockout_days: (m) => m.stockoutDays,
};

// ─── New calculation ──────────────────────────────────────────────────────────

export async function createSafetyStockCalculation(
  _prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  // Parse inputs
  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const periodStart = formData.get("period_start") as string;
  const periodEnd = formData.get("period_end") as string;
  const bufferDays = parseInt(formData.get("buffer_days") as string, 10);

  if (!title) return { error: "Judul kalkulasi wajib diisi." };
  if (!periodStart || !periodEnd) return { error: "Periode kalkulasi wajib diisi." };
  if (periodStart >= periodEnd) return { error: "Tanggal akhir harus setelah tanggal awal." };
  if (isNaN(bufferDays) || bufferDays < 1) return { error: "Buffer hari harus minimal 1." };

  // ── 1. Fetch active criteria with sub_criteria ────────────────────────────
  const { data: criteriaRows, error: critErr } = await supabase
    .from("criteria")
    .select("*, sub_criteria(*)")
    .eq("purpose", "safety_stock")
    .eq("is_active", true)
    .order("code");

  if (critErr) return { error: "Gagal mengambil data kriteria." };

  // Filter to criteria that have a recognized metric_key
  const activeCriteria = (criteriaRows ?? []).filter(
    (c) => c.metric_key && METRIC_REGISTRY[c.metric_key],
  );

  if (activeCriteria.length < 2) {
    return {
      error:
        "Minimal 2 kriteria aktif dengan metrik valid diperlukan. Cek pengaturan kriteria.",
    };
  }

  // ── 2. Fetch all active products ──────────────────────────────────────────
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, sku, name, current_stock, safety_stock, movement_category")
    .eq("is_active", true)
    .order("name");

  if (prodErr || !products?.length) {
    return { error: "Tidak ada produk aktif untuk dikalkulasi." };
  }

  // ── 3. Fetch sales history in period ─────────────────────────────────────
  const { data: sales, error: salesErr } = await supabase
    .from("sales_history")
    .select("product_id, quantity_sold, sale_date")
    .gte("sale_date", periodStart)
    .lte("sale_date", periodEnd);

  if (salesErr) return { error: "Gagal mengambil data penjualan." };

  // ── 4. Compute per-product metrics ────────────────────────────────────────
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const totalDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1,
  );

  const movementScore: Record<string, number> = {
    slow_moving: 1,
    medium_moving: 2,
    fast_moving: 3,
  };

  const metrics: ProductMetrics[] = products.map((p) => {
    const productSales = (sales ?? []).filter((s) => s.product_id === p.id);
    const salesByDate = new Map<string, number>();
    for (const s of productSales) {
      salesByDate.set(s.sale_date, (salesByDate.get(s.sale_date) ?? 0) + s.quantity_sold);
    }

    const dailyQtys: number[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 10);
      dailyQtys.push(salesByDate.get(key) ?? 0);
      cur.setDate(cur.getDate() + 1);
    }

    const totalSold = dailyQtys.reduce((a, b) => a + b, 0);
    const avg = totalSold / totalDays;
    const variance =
      dailyQtys.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / totalDays;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? stdDev / avg : 0;
    const stockoutDays = dailyQtys.filter((q) => q === 0).length;

    return {
      productId: p.id,
      avgDailySales: avg,
      cv,
      movementValue: movementScore[p.movement_category] ?? 1,
      stockoutDays,
      currentSafetyStock: p.safety_stock,
    };
  });

  // ── 5. Build decision matrix dynamically ─────────────────────────────────
  const decisionMatrix = metrics.map((m) => ({
    productId: m.productId,
    rawMetrics: m,
    scores: activeCriteria.map((c) => {
      const rawValue = METRIC_REGISTRY[c.metric_key!](m);
      return matchScore(c.sub_criteria, rawValue);
    }),
  }));

  const numCols = activeCriteria.length;
  const weights = activeCriteria.map((c) => c.weight);
  const types = activeCriteria.map((c) => c.type);

  // ── 6. TOPSIS ─────────────────────────────────────────────────────────────

  // Step A: Normalize
  const colNorms = Array.from({ length: numCols }, (_, j) =>
    Math.sqrt(
      decisionMatrix.reduce((s, row) => s + Math.pow(row.scores[j], 2), 0),
    ) || 1,
  );

  const normalized = decisionMatrix.map((row) => ({
    productId: row.productId,
    rawMetrics: row.rawMetrics,
    norm: row.scores.map((s, j) => s / colNorms[j]),
  }));

  // Step B: Weighted normalized
  const weighted = normalized.map((row) => ({
    ...row,
    w: row.norm.map((v, j) => v * weights[j]),
  }));

  // Step C: Ideal best/worst
  const idealBest = Array.from({ length: numCols }, (_, j) => {
    const vals = weighted.map((r) => r.w[j]);
    return types[j] === "benefit" ? Math.max(...vals) : Math.min(...vals);
  });

  const idealWorst = Array.from({ length: numCols }, (_, j) => {
    const vals = weighted.map((r) => r.w[j]);
    return types[j] === "benefit" ? Math.min(...vals) : Math.max(...vals);
  });

  // Step D: Distance to ideal
  const distances = weighted.map((row) => {
    const dPlus = Math.sqrt(
      row.w.reduce((s, v, j) => s + Math.pow(v - idealBest[j], 2), 0),
    );
    const dMinus = Math.sqrt(
      row.w.reduce((s, v, j) => s + Math.pow(v - idealWorst[j], 2), 0),
    );
    const pref = dPlus + dMinus > 0 ? dMinus / (dPlus + dMinus) : 0;
    return { productId: row.productId, rawMetrics: row.rawMetrics, dPlus, dMinus, pref };
  });

  // Step E: Rank
  const ranked = [...distances].sort((a, b) => b.pref - a.pref);
  const maxPref = ranked[0]?.pref ?? 1;

  // Step F: Recommended safety stock = avg_daily_sales * buffer_days * (1 + cv)
  const results = ranked.map((r, idx) => {
    const m = r.rawMetrics;
    const recommended = Math.ceil(
      m.avgDailySales * bufferDays * (1 + Math.min(m.cv, 2)),
    );
    return {
      product_id: r.productId,
      distance_positive: r.dPlus,
      distance_negative: r.dMinus,
      preference_score: r.pref,
      preference_percentage: maxPref > 0 ? (r.pref / maxPref) * 100 : 0,
      rank_order: idx + 1,
      recommended_qty: recommended,
      estimated_cost: 0,
      avg_daily_sales: m.avgDailySales,
      coefficient_of_variation: m.cv,
      stockout_days: m.stockoutDays,
      current_safety_stock: m.currentSafetyStock,
      recommended_safety_stock: recommended,
    };
  });

  // ── 7. Persist ────────────────────────────────────────────────────────────
  const { data: calc, error: calcErr } = await supabase
    .from("topsis_calculations")
    .insert({
      title,
      description,
      purpose: "safety_stock",
      calculation_date: new Date().toISOString().slice(0, 10),
      period_start: periodStart,
      period_end: periodEnd,
      buffer_days: bufferDays,
      budget: 0,
      total_alternatives: products.length,
      status: "completed",
      calculated_by: user.id,
    })
    .select("id")
    .single();

  if (calcErr || !calc) return { error: "Gagal menyimpan kalkulasi." };

  const { error: resErr } = await supabase.from("topsis_results").insert(
    results.map((r) => ({ ...r, calculation_id: calc.id })),
  );

  if (resErr) {
    await admin.from("topsis_calculations").delete().eq("id", calc.id);
    return { error: "Gagal menyimpan hasil kalkulasi." };
  }

  revalidatePath("/dashboard/calculations/safety-stock");
  return { success: true, id: calc.id };
}
