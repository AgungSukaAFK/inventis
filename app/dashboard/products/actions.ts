"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MovementCategory } from "@/lib/supabase/types";

function getAdminClient() {
  return createAdminClient();
}

export async function createProduct(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi tidak valid. Silakan login ulang." };

  const sku = (formData.get("sku") as string).trim();
  const name = (formData.get("name") as string).trim();
  const category_id = (formData.get("category_id") as string) || null;
  const purchase_price = Number(formData.get("purchase_price"));
  const selling_price = Number(formData.get("selling_price"));
  const current_stock = Number(formData.get("current_stock"));
  const safety_stock = Number(formData.get("safety_stock"));
  const movement_category = formData.get("movement_category") as MovementCategory;
  const description = (formData.get("description") as string).trim() || null;

  if (!sku || !name) return { error: "SKU dan nama wajib diisi." };
  if (purchase_price < 0 || selling_price < 0) return { error: "Harga tidak boleh negatif." };
  if (current_stock < 0 || safety_stock < 0) return { error: "Stok tidak boleh negatif." };

  const { error } = await supabase
    .from("products")
    .insert({
      sku,
      name,
      category_id,
      purchase_price,
      selling_price,
      current_stock,
      safety_stock,
      movement_category,
      description,
      is_active: true,
      created_by: user.id,
    });

  if (error) {
    if (error.code === "23505") return { error: "SKU sudah digunakan. Gunakan SKU lain." };
    return { error: "Gagal menyimpan barang. Coba lagi." };
  }

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function updateStock(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi tidak valid. Silakan login ulang." };

  const product_id = formData.get("product_id") as string;
  const new_stock = Number(formData.get("new_stock"));
  const note = (formData.get("note") as string | null)?.trim() || null;

  if (!product_id) return { error: "ID barang tidak valid." };
  if (new_stock < 0) return { error: "Stok tidak boleh negatif." };

  const { data: current, error: fetchErr } = await supabase
    .from("products")
    .select("current_stock")
    .eq("id", product_id)
    .single();

  if (fetchErr || !current) return { error: "Barang tidak ditemukan." };

  const old_stock = (current as { current_stock: number }).current_stock;

  const { error } = await supabase
    .from("products")
    .update({ current_stock: new_stock })
    .eq("id", product_id);

  if (error) return { error: "Gagal memperbarui stok. Coba lagi." };

  await getAdminClient().from("audit_logs").insert({
    user_id: user.id,
    action: "STOCK_UPDATE",
    table_name: "products",
    record_id: product_id,
    old_data: { current_stock: old_stock },
    new_data: { current_stock: new_stock, note },
  });

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function getStockHistory(productId: string) {
  const { data } = await getAdminClient()
    .from("audit_logs")
    .select("id, created_at, old_data, new_data, user:profiles(full_name)")
    .eq("table_name", "products")
    .eq("action", "STOCK_UPDATE")
    .eq("record_id", productId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function toggleProductActive(productId: string, currentActive: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi tidak valid." };

  const { error } = await supabase
    .from("products")
    .update({ is_active: !currentActive })
    .eq("id", productId);

  if (error) return { error: "Gagal mengubah status barang." };

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  return data ?? [];
}
