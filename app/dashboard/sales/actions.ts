"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getActiveProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, sku, name, selling_price, movement_category")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMonthlySales(month: string) {
  // month = "YYYY-MM"
  const supabase = await createClient();
  const dateStart = `${month}-01`;

  const { data, error } = await supabase
    .from("sales_history")
    .select("product_id, quantity_sold")
    .eq("sale_date", dateStart);

  if (error) throw new Error(error.message);

  // Return as a map: productId → qty
  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    map[row.product_id] = (map[row.product_id] ?? 0) + row.quantity_sold;
  }
  return map;
}

export async function upsertMonthlySales(
  _prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const month = formData.get("month") as string;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return { error: "Bulan tidak valid." };
  }

  const saleDate = `${month}-01`;

  // Collect qty entries from formData (key = "qty_<productId>")
  const entries: { product_id: string; qty: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("qty_")) continue;
    const productId = key.slice(4);
    const qty = parseInt(value as string, 10);
    if (isNaN(qty) || qty < 0) continue;
    entries.push({ product_id: productId, qty });
  }

  if (entries.length === 0) return { error: "Tidak ada data untuk disimpan." };

  // Fetch selling prices for revenue calculation
  const productIds = entries.map((e) => e.product_id);
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, selling_price")
    .in("id", productIds);

  if (prodErr) return { error: "Gagal mengambil data produk." };

  const priceMap: Record<string, number> = {};
  for (const p of products ?? []) priceMap[p.id] = p.selling_price;

  // Delete existing records for this month (on saleDate only)
  const { error: delErr } = await supabase
    .from("sales_history")
    .delete()
    .eq("sale_date", saleDate)
    .in("product_id", productIds);

  if (delErr) return { error: "Gagal menghapus data lama." };

  // Insert new records (skip qty = 0)
  const toInsert = entries
    .filter((e) => e.qty > 0)
    .map((e) => ({
      product_id: e.product_id,
      sale_date: saleDate,
      quantity_sold: e.qty,
      revenue: e.qty * (priceMap[e.product_id] ?? 0),
    }));

  if (toInsert.length > 0) {
    const { error: insErr } = await supabase
      .from("sales_history")
      .insert(toInsert);

    if (insErr) return { error: "Gagal menyimpan data penjualan." };
  }

  revalidatePath("/dashboard/sales");
  return { success: true, saved: toInsert.length };
}
