"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCategory(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi tidak valid. Silakan login ulang." };

  const name = (formData.get("name") as string).trim();
  if (!name) return { error: "Nama kategori wajib diisi." };

  const { error } = await supabase.from("categories").insert({ name });

  if (error) {
    if (error.code === "23505") return { error: "Kategori dengan nama ini sudah ada." };
    return { error: "Gagal menyimpan kategori. Coba lagi." };
  }

  revalidatePath("/dashboard/settings/categories");
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi tidak valid." };

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (count && count > 0) {
    return {
      error: `Kategori ini digunakan oleh ${count} barang. Hapus atau ubah kategori barang terlebih dahulu.`,
    };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) return { error: "Gagal menghapus kategori. Coba lagi." };

  revalidatePath("/dashboard/settings/categories");
  return { success: true };
}
