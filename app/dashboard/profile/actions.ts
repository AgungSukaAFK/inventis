"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi tidak valid. Silakan login ulang." };

  const full_name = (formData.get("full_name") as string).trim();
  const phone = (formData.get("phone") as string).trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone })
    .eq("id", user.id);

  if (error) return { error: "Gagal menyimpan perubahan. Coba lagi." };

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function changePassword(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi tidak valid. Silakan login ulang." };

  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!currentPassword) {
    return { error: "Password lama wajib diisi." };
  }
  if (newPassword.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  // Verifikasi password lama dengan re-autentikasi
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Password lama tidak sesuai." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: "Gagal mengubah password. Coba lagi." };

  return { success: true };
}
