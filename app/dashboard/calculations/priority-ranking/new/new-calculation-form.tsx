"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPriorityRankingCalculation } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function buildYears() {
  const current = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => current - i).reverse();
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

type ActionState = { error?: string; success?: boolean; id?: string } | undefined;

export function NewCalculationForm() {
  const router = useRouter();

  const now = new Date();
  const defaultMonth = now.getMonth() === 0 ? 12 : now.getMonth(); // bulan lalu
  const defaultYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const [selMonth, setSelMonth] = useState(defaultMonth);
  const [selYear,  setSelYear]  = useState(defaultYear);

  const mm          = String(selMonth).padStart(2, "0");
  const periodStart = `${selYear}-${mm}-01`;
  const periodEnd   = `${selYear}-${mm}-${lastDayOfMonth(selYear, selMonth)}`;

  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      const result = await createPriorityRankingCalculation(_, formData);
      return result;
    },
    undefined,
  );

  useEffect(() => {
    if (state?.success && state.id) {
      router.push(`/dashboard/calculations/priority-ranking/${state.id}`);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {/* Identitas */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Identitas Kalkulasi</h2>
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="contoh: Priority Ranking Mei 2025"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Catatan tambahan mengenai kalkulasi ini..."
              rows={2}
            />
          </div>
        </div>

        {/* Periode */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Periode Data Penjualan</h2>
          <p className="text-xs text-muted-foreground -mt-2">
            Data penjualan bulan yang dipilih digunakan untuk menghitung rata-rata penjualan harian (C1).
          </p>
          <input type="hidden" name="period_start" value={periodStart} />
          <input type="hidden" name="period_end"   value={periodEnd} />
          <div className="flex items-center gap-3">
            <select
              value={selMonth}
              onChange={(e) => setSelMonth(Number(e.target.value))}
              disabled={pending}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              {MONTHS.map((label, i) => (
                <option key={i} value={i + 1}>{label}</option>
              ))}
            </select>
            <select
              value={selYear}
              onChange={(e) => setSelYear(Number(e.target.value))}
              disabled={pending}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              {buildYears().map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              {periodStart} — {periodEnd}
            </span>
          </div>
        </div>

        {/* Info kriteria */}
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Kriteria yang Digunakan</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { code: "C1", label: "Tingkat Penjualan", type: "Benefit", weight: "35%", note: "Dari histori penjualan" },
              { code: "C2", label: "Stok Tersisa",      type: "Cost",    weight: "25%", note: "Snapshot stok saat ini" },
              { code: "C3", label: "Harga Modal",       type: "Cost",    weight: "15%", note: "Snapshot harga beli" },
              { code: "C4", label: "Margin Keuntungan", type: "Benefit", weight: "25%", note: "Dari harga jual & beli" },
            ].map((c) => (
              <div key={c.code} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{c.code} — {c.label}</span>
                  <span className={c.type === "Benefit"
                    ? "text-green-700 dark:text-green-400 font-medium"
                    : "text-orange-700 dark:text-orange-400 font-medium"}>
                    {c.type}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>{c.note}</span>
                  <span className="font-medium">W={c.weight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menghitung..." : "Jalankan Kalkulasi"}
        </Button>
      </div>
    </form>
  );
}
