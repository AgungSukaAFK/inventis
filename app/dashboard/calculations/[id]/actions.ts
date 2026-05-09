"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TopsisCalculation, TopsisResult } from "@/lib/supabase/types";

export async function getCalculationDetail(id: string) {
  const supabase = await createClient();

  const { data: calc, error: calcErr } = await supabase
    .from("topsis_calculations")
    .select("*")
    .eq("id", id)
    .single();

  if (calcErr || !calc) return null;

  const { data: results, error: resErr } = await supabase
    .from("topsis_results")
    .select(
      `
      *,
      product:products(id, sku, name, current_stock, safety_stock, movement_category)
    `,
    )
    .eq("calculation_id", id)
    .order("rank_order");

  if (resErr) return null;

  return {
    calc: calc as TopsisCalculation,
    results: (results ?? []) as TopsisResult[],
  };
}

export async function applyRecommendedSafetyStock(calculationId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { data: results, error } = await supabase
    .from("topsis_results")
    .select("product_id, recommended_safety_stock")
    .eq("calculation_id", calculationId);

  if (error || !results?.length)
    return { error: "Tidak ada hasil untuk diterapkan." };

  // Update each product's safety_stock
  const updates = results.map((r) =>
    supabase
      .from("products")
      .update({ safety_stock: r.recommended_safety_stock ?? 0 })
      .eq("id", r.product_id),
  );

  const settled = await Promise.allSettled(updates);
  const failed = settled.filter((r) => r.status === "rejected").length;

  if (failed > 0) {
    return { error: `${failed} produk gagal diperbarui. Coba lagi.` };
  }

  // Audit log
  await admin.from("audit_logs").insert({
    user_id: user.id,
    action: "APPLY_SAFETY_STOCK",
    table_name: "products",
    record_id: calculationId,
    new_data: { calculation_id: calculationId, applied_count: results.length },
  });

  revalidatePath(`/dashboard/calculations/${calculationId}`);
  revalidatePath("/dashboard/products");
  return { success: true, count: results.length };
}

export async function applyRecommendedSafetyStockForProduct(
  calculationId: string,
  productId: string,
  recommendedSafetyStock: number,
) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { error } = await supabase
    .from("products")
    .update({ safety_stock: recommendedSafetyStock })
    .eq("id", productId);

  if (error) return { error: "Gagal menerapkan rekomendasi." };

  await admin.from("audit_logs").insert({
    user_id: user.id,
    action: "APPLY_SAFETY_STOCK_SINGLE",
    table_name: "products",
    record_id: productId,
    new_data: {
      calculation_id: calculationId,
      product_id: productId,
      safety_stock: recommendedSafetyStock,
    },
  });

  revalidatePath(`/dashboard/calculations/${calculationId}`);
  revalidatePath("/dashboard/products");
  return { success: true };
}
