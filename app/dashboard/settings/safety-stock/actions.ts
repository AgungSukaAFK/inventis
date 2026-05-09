"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Criteria, SubCriteria } from "@/lib/supabase/types";

export async function getCriteriaWithSubs(purpose: string) {
  const supabase = await createClient();

  const { data: criteria, error } = await supabase
    .from("criteria")
    .select("*, sub_criteria(*)")
    .eq("purpose", purpose)
    .order("code");

  if (error) throw new Error(error.message);
  return (criteria ?? []) as (Criteria & { sub_criteria: SubCriteria[] })[];
}

export async function updateCriteriaWeight(
  _prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const id = formData.get("id") as string;
  const weight = parseFloat(formData.get("weight") as string);

  if (isNaN(weight) || weight <= 0 || weight > 1) {
    return { error: "Bobot harus antara 0.01 dan 1." };
  }

  const { error } = await supabase
    .from("criteria")
    .update({ weight })
    .eq("id", id);

  if (error) return { error: "Gagal menyimpan bobot." };

  revalidatePath("/dashboard/settings/safety-stock");
  return { success: true };
}

export async function updateSubCriteriaValue(
  _prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const id = formData.get("id") as string;
  const value = parseInt(formData.get("value") as string, 10);

  if (isNaN(value) || value < 1) {
    return { error: "Nilai sub-kriteria harus >= 1." };
  }

  const { error } = await supabase
    .from("sub_criteria")
    .update({ value })
    .eq("id", id);

  if (error) return { error: "Gagal menyimpan nilai." };

  revalidatePath("/dashboard/settings/safety-stock");
  return { success: true };
}

const VALID_METRIC_KEYS = [
  "avg_daily_sales",
  "coefficient_of_variation",
  "movement_category",
  "stockout_days",
] as const;

export async function createCriteria(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const code = (formData.get("code") as string | null)?.trim() ?? "";
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const type = (formData.get("type") as string | null) ?? "benefit";
  const metricKey = (formData.get("metric_key") as string | null)?.trim() ?? "";
  const weightPct = parseFloat((formData.get("weight") as string | null) ?? "");

  if (!code) return { error: "Kode kriteria wajib diisi." };
  if (!name) return { error: "Nama kriteria wajib diisi." };
  if (type !== "benefit" && type !== "cost") {
    return { error: "Tipe kriteria tidak valid." };
  }
  if (!VALID_METRIC_KEYS.includes(metricKey as (typeof VALID_METRIC_KEYS)[number])) {
    return { error: "Metrik tidak valid." };
  }
  if (isNaN(weightPct) || weightPct <= 0 || weightPct > 100) {
    return { error: "Bobot harus antara 1 sampai 100." };
  }

  const { error } = await supabase.from("criteria").insert({
    code,
    name,
    description: description || null,
    type,
    metric_key: metricKey,
    weight: weightPct / 100,
    purpose: "safety_stock",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Kode kriteria sudah digunakan." };
    }
    return { error: "Gagal menambah kriteria." };
  }

  revalidatePath("/dashboard/settings/safety-stock");
  return { success: true };
}

export async function updateCriteria(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const id = (formData.get("id") as string | null) ?? "";
  const code = (formData.get("code") as string | null)?.trim() ?? "";
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const type = (formData.get("type") as string | null) ?? "benefit";
  const metricKey = (formData.get("metric_key") as string | null)?.trim() ?? "";
  const weightPct = parseFloat((formData.get("weight") as string | null) ?? "");

  if (!id) return { error: "ID kriteria tidak valid." };
  if (!code) return { error: "Kode kriteria wajib diisi." };
  if (!name) return { error: "Nama kriteria wajib diisi." };
  if (type !== "benefit" && type !== "cost") {
    return { error: "Tipe kriteria tidak valid." };
  }
  if (!VALID_METRIC_KEYS.includes(metricKey as (typeof VALID_METRIC_KEYS)[number])) {
    return { error: "Metrik tidak valid." };
  }
  if (isNaN(weightPct) || weightPct <= 0 || weightPct > 100) {
    return { error: "Bobot harus antara 1 sampai 100." };
  }

  const { error } = await supabase
    .from("criteria")
    .update({
      code,
      name,
      description: description || null,
      type,
      metric_key: metricKey,
      weight: weightPct / 100,
    })
    .eq("id", id)
    .eq("purpose", "safety_stock");

  if (error) {
    if (error.code === "23505") {
      return { error: "Kode kriteria sudah digunakan." };
    }
    return { error: "Gagal memperbarui kriteria." };
  }

  revalidatePath("/dashboard/settings/safety-stock");
  return { success: true };
}

export async function deleteCriteria(criteriaId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { count } = await supabase
    .from("sub_criteria")
    .select("id", { count: "exact", head: true })
    .eq("criteria_id", criteriaId);

  if (count && count > 0) {
    return {
      error:
        "Kriteria tidak bisa dihapus karena masih punya sub-kriteria. Hapus sub-kriteria terlebih dahulu.",
    };
  }

  const { error } = await supabase
    .from("criteria")
    .delete()
    .eq("id", criteriaId)
    .eq("purpose", "safety_stock");

  if (error) return { error: "Gagal menghapus kriteria." };

  revalidatePath("/dashboard/settings/safety-stock");
  return { success: true };
}

export async function createSubCriteria(
  _prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const criteriaId = (formData.get("criteria_id") as string | null) ?? "";
  const label = (formData.get("label") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const value = parseInt((formData.get("value") as string | null) ?? "", 10);
  const rangeMinRaw =
    (formData.get("range_min") as string | null)?.trim() ?? "";
  const rangeMaxRaw =
    (formData.get("range_max") as string | null)?.trim() ?? "";

  if (!criteriaId) return { error: "Kriteria tidak valid." };
  if (!label) return { error: "Label sub-kriteria wajib diisi." };
  if (isNaN(value) || value < 1) {
    return { error: "Nilai sub-kriteria harus >= 1." };
  }

  const rangeMin = rangeMinRaw === "" ? null : Number(rangeMinRaw);
  const rangeMax = rangeMaxRaw === "" ? null : Number(rangeMaxRaw);

  if (
    (rangeMinRaw !== "" && Number.isNaN(rangeMin)) ||
    (rangeMaxRaw !== "" && Number.isNaN(rangeMax))
  ) {
    return { error: "Range minimum/maksimum harus berupa angka." };
  }
  if (rangeMin !== null && rangeMax !== null && rangeMin > rangeMax) {
    return { error: "Range minimum tidak boleh lebih besar dari maksimum." };
  }

  const { data: criteria } = await supabase
    .from("criteria")
    .select("id, purpose")
    .eq("id", criteriaId)
    .single();

  if (!criteria || criteria.purpose !== "safety_stock") {
    return { error: "Kriteria tidak ditemukan untuk safety stock." };
  }

  const { error } = await supabase.from("sub_criteria").insert({
    criteria_id: criteriaId,
    label,
    value,
    description: description || null,
    range_min: rangeMin,
    range_max: rangeMax,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Sub-kriteria dengan data serupa sudah ada." };
    }
    return { error: "Gagal menambah sub-kriteria." };
  }

  revalidatePath("/dashboard/settings/safety-stock");
  return { success: true };
}

export async function updateSubCriteria(
  _prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const id = (formData.get("id") as string | null) ?? "";
  const label = (formData.get("label") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const value = parseInt((formData.get("value") as string | null) ?? "", 10);
  const rangeMinRaw =
    (formData.get("range_min") as string | null)?.trim() ?? "";
  const rangeMaxRaw =
    (formData.get("range_max") as string | null)?.trim() ?? "";

  if (!id) return { error: "ID sub-kriteria tidak valid." };
  if (!label) return { error: "Label sub-kriteria wajib diisi." };
  if (isNaN(value) || value < 1) {
    return { error: "Nilai sub-kriteria harus >= 1." };
  }

  const rangeMin = rangeMinRaw === "" ? null : Number(rangeMinRaw);
  const rangeMax = rangeMaxRaw === "" ? null : Number(rangeMaxRaw);

  if (
    (rangeMinRaw !== "" && Number.isNaN(rangeMin)) ||
    (rangeMaxRaw !== "" && Number.isNaN(rangeMax))
  ) {
    return { error: "Range minimum/maksimum harus berupa angka." };
  }
  if (rangeMin !== null && rangeMax !== null && rangeMin > rangeMax) {
    return { error: "Range minimum tidak boleh lebih besar dari maksimum." };
  }

  const { data: subCriteria } = await supabase
    .from("sub_criteria")
    .select("id, criteria_id")
    .eq("id", id)
    .single();

  if (!subCriteria) return { error: "Sub-kriteria tidak ditemukan." };

  const { data: criteria } = await supabase
    .from("criteria")
    .select("id, purpose")
    .eq("id", subCriteria.criteria_id)
    .single();

  if (!criteria || criteria.purpose !== "safety_stock") {
    return { error: "Sub-kriteria ini bukan bagian dari safety stock." };
  }

  const { error } = await supabase
    .from("sub_criteria")
    .update({
      label,
      value,
      description: description || null,
      range_min: rangeMin,
      range_max: rangeMax,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Sub-kriteria dengan data serupa sudah ada." };
    }
    return { error: "Gagal memperbarui sub-kriteria." };
  }

  revalidatePath("/dashboard/settings/safety-stock");
  return { success: true };
}

export async function deleteSubCriteria(subCriteriaId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { data: subCriteria } = await supabase
    .from("sub_criteria")
    .select("id, criteria_id")
    .eq("id", subCriteriaId)
    .single();

  if (!subCriteria) return { error: "Sub-kriteria tidak ditemukan." };

  const { data: criteria } = await supabase
    .from("criteria")
    .select("id, purpose")
    .eq("id", subCriteria.criteria_id)
    .single();

  if (!criteria || criteria.purpose !== "safety_stock") {
    return { error: "Sub-kriteria ini bukan bagian dari safety stock." };
  }

  const { error } = await supabase
    .from("sub_criteria")
    .delete()
    .eq("id", subCriteriaId);

  if (error) return { error: "Gagal menghapus sub-kriteria." };

  revalidatePath("/dashboard/settings/safety-stock");
  return { success: true };
}
