"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Criteria, SubCriteria } from "@/lib/supabase/types";

export type CriteriaWithSubs = Criteria & { sub_criteria: SubCriteria[] };

export async function getCriteriaWithSubs(): Promise<CriteriaWithSubs[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("criteria")
    .select("*, sub_criteria(*)")
    .eq("purpose", "priority_ranking")
    .order("code");

  if (error) throw new Error(error.message);
  return (data ?? []) as CriteriaWithSubs[];
}

export async function updateCriteriaWeight(
  _prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const id     = formData.get("criteria_id") as string;
  const weight = parseFloat(formData.get("weight") as string);

  if (!id) return { error: "ID kriteria tidak valid." };
  if (isNaN(weight) || weight < 0 || weight > 1)
    return { error: "Bobot harus antara 0 dan 1." };

  const { error } = await supabase
    .from("criteria")
    .update({ weight })
    .eq("id", id)
    .eq("purpose", "priority_ranking");

  if (error) return { error: "Gagal menyimpan bobot." };

  revalidatePath("/dashboard/settings/priority-ranking");
  return { success: true };
}

export async function toggleCriteriaActive(id: string, current: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("criteria")
    .update({ is_active: !current })
    .eq("id", id)
    .eq("purpose", "priority_ranking");

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings/priority-ranking");
}

export async function updateSubCriteria(
  _prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const id          = formData.get("sub_id") as string;
  const label       = (formData.get("label") as string).trim();
  const value       = parseFloat(formData.get("value") as string);
  const range_min   = formData.get("range_min") !== "" ? parseFloat(formData.get("range_min") as string) : null;
  const range_max   = formData.get("range_max") !== "" ? parseFloat(formData.get("range_max") as string) : null;
  const description = (formData.get("description") as string | null)?.trim() || null;

  if (!id)            return { error: "ID sub-kriteria tidak valid." };
  if (!label)         return { error: "Label wajib diisi." };
  if (isNaN(value) || value < 1 || value > 5) return { error: "Nilai skor harus antara 1–5." };

  const { error } = await supabase
    .from("sub_criteria")
    .update({ label, value, range_min, range_max, description })
    .eq("id", id);

  if (error) return { error: "Gagal menyimpan sub-kriteria." };

  revalidatePath("/dashboard/settings/priority-ranking");
  return { success: true };
}
