"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TopsisCalculation, TopsisResult } from "@/lib/supabase/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export type StepCriteria = {
  code: string;
  name: string;
  type: string;
  weight: number;
  unit: string;
  subs: { value: number; label: string; range_min: number | null; range_max: number | null }[];
};

export type TopsisStepsData = {
  criteria: StepCriteria[];
  products: { name: string; sku: string; rank: number }[];
  rawMetrics: number[][];   // actual values (avg_daily, stok, harga, margin)
  scores: number[][];       // 1–5 dari sub-kriteria
  colNorms: number[];
  normalized: number[][];
  weighted: number[][];
  idealBest: number[];
  idealWorst: number[];
  dPlus: number[];
  dMinus: number[];
  pref: number[];
};

const METRIC_TO_RESULT_KEY: Record<string, string> = {
  avg_daily_sales:   "avg_daily_sales",
  current_stock:     "current_stock_snapshot",
  purchase_price:    "purchase_price_snapshot",
  margin_percentage: "margin_percentage",
};

const METRIC_UNIT: Record<string, string> = {
  avg_daily_sales:   "unit/hari",
  current_stock:     "unit",
  purchase_price:    "Rp",
  margin_percentage: "%",
};

// ─── List ────────────────────────────────────────────────────────────────────

export async function getPriorityRankingCalculations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topsis_calculations")
    .select("*")
    .eq("purpose", "priority_ranking")
    .order("calculation_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as TopsisCalculation[];
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getCalculationDetail(id: string) {
  const supabase = await createClient();

  const { data: calc } = await supabase
    .from("topsis_calculations")
    .select("*")
    .eq("id", id)
    .eq("purpose", "priority_ranking")
    .single();

  if (!calc) return null;

  const { data: results } = await supabase
    .from("topsis_results")
    .select(`
      *,
      product:products(id, sku, name, current_stock, safety_stock, movement_category)
    `)
    .eq("calculation_id", id)
    .order("rank_order");

  return {
    calc: calc as TopsisCalculation,
    results: (results ?? []) as TopsisResult[],
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ProductMetrics = {
  productId: string;
  avgDailySales: number;
  currentStock: number;
  purchasePrice: number;
  sellingPrice: number;
  marginPercentage: number;
};

type SubCritRow = { value: number; range_min: number | null; range_max: number | null };

function matchScore(subs: SubCritRow[], rawValue: number): number {
  const ranged = subs.filter((s) => s.range_min !== null || s.range_max !== null);
  const sorted = [...ranged].sort((a, b) => (a.range_min ?? 0) - (b.range_min ?? 0));
  for (const sub of sorted) {
    const min = sub.range_min ?? -Infinity;
    const max = sub.range_max ?? Infinity;
    if (rawValue >= min && rawValue <= max) return sub.value;
  }
  return subs[subs.length - 1]?.value ?? 1;
}

const METRIC_REGISTRY: Record<string, (m: ProductMetrics) => number> = {
  avg_daily_sales:   (m) => m.avgDailySales,
  current_stock:     (m) => m.currentStock,
  purchase_price:    (m) => m.purchasePrice,
  margin_percentage: (m) => m.marginPercentage,
};

// ─── New calculation ──────────────────────────────────────────────────────────

export async function createPriorityRankingCalculation(
  _prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const title       = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const periodStart = formData.get("period_start") as string;
  const periodEnd   = formData.get("period_end") as string;

  if (!title) return { error: "Judul kalkulasi wajib diisi." };
  if (!periodStart || !periodEnd) return { error: "Periode kalkulasi wajib diisi." };
  if (periodStart >= periodEnd) return { error: "Tanggal akhir harus setelah tanggal awal." };

  // ── 1. Ambil kriteria aktif beserta sub_criteria ──────────────────────────
  const { data: criteriaRows, error: critErr } = await supabase
    .from("criteria")
    .select("*, sub_criteria(*)")
    .eq("purpose", "priority_ranking")
    .eq("is_active", true)
    .order("code");

  if (critErr) return { error: "Gagal mengambil data kriteria." };

  const activeCriteria = (criteriaRows ?? []).filter(
    (c) => c.metric_key && METRIC_REGISTRY[c.metric_key],
  );

  if (activeCriteria.length < 2) {
    return { error: "Minimal 2 kriteria aktif diperlukan. Cek pengaturan kriteria Priority Ranking." };
  }

  // ── 2. Ambil semua produk aktif ───────────────────────────────────────────
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, sku, name, current_stock, safety_stock, movement_category, purchase_price, selling_price")
    .eq("is_active", true)
    .order("name");

  if (prodErr || !products?.length) {
    return { error: "Tidak ada produk aktif untuk dikalkulasi." };
  }

  // ── 3. Ambil histori penjualan dalam periode ──────────────────────────────
  const { data: sales, error: salesErr } = await supabase
    .from("sales_history")
    .select("product_id, quantity_sold, sale_date")
    .gte("sale_date", periodStart)
    .lte("sale_date", periodEnd);

  if (salesErr) return { error: "Gagal mengambil data penjualan." };

  // ── 4. Hitung metrik per produk ───────────────────────────────────────────
  const start     = new Date(periodStart);
  const end       = new Date(periodEnd);
  const totalDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1,
  );

  const metrics: ProductMetrics[] = products.map((p) => {
    const productSales = (sales ?? []).filter((s) => s.product_id === p.id);
    const totalSold    = productSales.reduce((sum, s) => sum + s.quantity_sold, 0);
    const avgDailySales = totalSold / totalDays;

    const purchasePrice    = Number(p.purchase_price);
    const sellingPrice     = Number(p.selling_price);
    const marginPercentage = purchasePrice > 0
      ? ((sellingPrice - purchasePrice) / purchasePrice) * 100
      : 0;

    return {
      productId:         p.id,
      avgDailySales,
      currentStock:      p.current_stock,
      purchasePrice,
      sellingPrice,
      marginPercentage,
    };
  });

  // ── 5. Bangun matriks keputusan ───────────────────────────────────────────
  const decisionMatrix = metrics.map((m) => ({
    productId:  m.productId,
    rawMetrics: m,
    scores: activeCriteria.map((c) => {
      const rawValue = METRIC_REGISTRY[c.metric_key!](m);
      return matchScore(c.sub_criteria, rawValue);
    }),
  }));

  const numCols = activeCriteria.length;
  const weights = activeCriteria.map((c) => c.weight);
  const types   = activeCriteria.map((c) => c.type);

  // ── 6. TOPSIS ─────────────────────────────────────────────────────────────

  // Langkah 2: Normalisasi — bagi tiap nilai dengan sqrt(sum of squares kolom)
  const colNorms = Array.from({ length: numCols }, (_, j) =>
    Math.sqrt(decisionMatrix.reduce((s, row) => s + Math.pow(row.scores[j], 2), 0)) || 1,
  );

  const normalized = decisionMatrix.map((row) => ({
    productId:  row.productId,
    rawMetrics: row.rawMetrics,
    norm: row.scores.map((s, j) => s / colNorms[j]),
  }));

  // Langkah 3: Normalisasi terbobot — Yij = Rij × Wj
  const weighted = normalized.map((row) => ({
    ...row,
    w: row.norm.map((v, j) => v * weights[j]),
  }));

  // Langkah 4: Solusi ideal positif (A+) dan negatif (A−)
  const idealBest = Array.from({ length: numCols }, (_, j) => {
    const vals = weighted.map((r) => r.w[j]);
    return types[j] === "benefit" ? Math.max(...vals) : Math.min(...vals);
  });

  const idealWorst = Array.from({ length: numCols }, (_, j) => {
    const vals = weighted.map((r) => r.w[j]);
    return types[j] === "benefit" ? Math.min(...vals) : Math.max(...vals);
  });

  // Langkah 5: Jarak D+ dan D−, lalu nilai preferensi Vi = D− / (D+ + D−)
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

  // Langkah 6: Ranking — urutkan Vi dari besar ke kecil
  const ranked  = [...distances].sort((a, b) => b.pref - a.pref);
  const maxPref = ranked[0]?.pref ?? 1;

  const results = ranked.map((r, idx) => {
    const m = r.rawMetrics;
    return {
      product_id:              r.productId,
      distance_positive:       r.dPlus,
      distance_negative:       r.dMinus,
      preference_score:        r.pref,
      preference_percentage:   maxPref > 0 ? (r.pref / maxPref) * 100 : 0,
      rank_order:              idx + 1,
      recommended_qty:         0,
      estimated_cost:          0,
      // Snapshot metrik saat kalkulasi dilakukan
      avg_daily_sales:         m.avgDailySales,
      current_stock_snapshot:  m.currentStock,
      purchase_price_snapshot: m.purchasePrice,
      margin_percentage:       m.marginPercentage,
    };
  });

  // ── 7. Simpan ke DB ───────────────────────────────────────────────────────
  const { data: calc, error: calcErr } = await supabase
    .from("topsis_calculations")
    .insert({
      title,
      description,
      purpose:            "priority_ranking",
      calculation_date:   new Date().toISOString().slice(0, 10),
      period_start:       periodStart,
      period_end:         periodEnd,
      buffer_days:        0,
      budget:             0,
      total_alternatives: products.length,
      status:             "completed",
      calculated_by:      user.id,
    })
    .select("id")
    .single();

  if (calcErr || !calc) return { error: "Gagal menyimpan kalkulasi." };

  const { error: resErr } = await supabase
    .from("topsis_results")
    .insert(results.map((r) => ({ ...r, calculation_id: calc.id })));

  if (resErr) {
    await admin.from("topsis_calculations").delete().eq("id", calc.id);
    return { error: "Gagal menyimpan hasil kalkulasi." };
  }

  revalidatePath("/dashboard/calculations/priority-ranking");
  return { success: true, id: calc.id };
}

// ─── Steps ────────────────────────────────────────────────────────────────────

export async function getCalculationSteps(id: string): Promise<TopsisStepsData | null> {
  const supabase = await createClient();

  const { data: results } = await supabase
    .from("topsis_results")
    .select("*, product:products(name, sku)")
    .eq("calculation_id", id)
    .order("rank_order");

  if (!results?.length) return null;

  const { data: criteriaRows } = await supabase
    .from("criteria")
    .select("*, sub_criteria(*)")
    .eq("purpose", "priority_ranking")
    .eq("is_active", true)
    .order("code");

  if (!criteriaRows?.length) return null;

  const criteria = criteriaRows.filter((c) => c.metric_key && METRIC_REGISTRY[c.metric_key]);

  const rawMetrics = results.map((r) =>
    criteria.map((c) => Number((r as Record<string, unknown>)[METRIC_TO_RESULT_KEY[c.metric_key!]] ?? 0)),
  );

  const scores = rawMetrics.map((row) =>
    criteria.map((c, j) => matchScore(c.sub_criteria, row[j])),
  );

  const numCols = criteria.length;
  const colNorms = Array.from({ length: numCols }, (_, j) =>
    Math.sqrt(scores.reduce((s, row) => s + Math.pow(row[j], 2), 0)) || 1,
  );

  const normalized = scores.map((row) => row.map((v, j) => v / colNorms[j]));
  const weights    = criteria.map((c) => c.weight);
  const weighted   = normalized.map((row) => row.map((v, j) => v * weights[j]));
  const types      = criteria.map((c) => c.type);

  const idealBest = Array.from({ length: numCols }, (_, j) => {
    const vals = weighted.map((r) => r[j]);
    return types[j] === "benefit" ? Math.max(...vals) : Math.min(...vals);
  });
  const idealWorst = Array.from({ length: numCols }, (_, j) => {
    const vals = weighted.map((r) => r[j]);
    return types[j] === "benefit" ? Math.min(...vals) : Math.max(...vals);
  });

  return {
    criteria: criteria.map((c) => ({
      code:   c.code,
      name:   c.name,
      type:   c.type,
      weight: c.weight,
      unit:   METRIC_UNIT[c.metric_key!] ?? "",
      subs:   (c.sub_criteria as SubCritRow[]).map((s) => ({
        value:     s.value,
        label:     (s as unknown as { label: string }).label ?? "",
        range_min: s.range_min,
        range_max: s.range_max,
      })),
    })),
    products: results.map((r) => ({
      name: (r.product as { name: string } | null)?.name ?? "—",
      sku:  (r.product as { sku: string } | null)?.sku  ?? "",
      rank: r.rank_order,
    })),
    rawMetrics,
    scores,
    colNorms,
    normalized,
    weighted,
    idealBest,
    idealWorst,
    dPlus:  results.map((r) => r.distance_positive),
    dMinus: results.map((r) => r.distance_negative),
    pref:   results.map((r) => r.preference_score),
  };
}
