"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSafetyStockCalculation } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ActionState = { error?: string; success?: boolean; id?: string } | undefined;

export function NewCalculationForm() {
  const router = useRouter();

  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      const result = await createSafetyStockCalculation(_, formData);
      return result;
    },
    undefined,
  );

  useEffect(() => {
    if (state?.success && state.id) {
      router.push(`/dashboard/calculations/${state.id}`);
    }
  }, [state, router]);

  // Default period: last 30 days
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

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
            <Label htmlFor="title">Judul <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              name="title"
              placeholder="contoh: Safety Stock Mei 2025"
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
            Data penjualan dalam rentang ini digunakan untuk menghitung metrik (rata-rata harian, CV, hari tanpa penjualan).
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_start">Tanggal Mulai <span className="text-destructive">*</span></Label>
              <Input
                id="period_start"
                name="period_start"
                type="date"
                defaultValue={thirtyDaysAgo}
                max={today}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end">Tanggal Akhir <span className="text-destructive">*</span></Label>
              <Input
                id="period_end"
                name="period_end"
                type="date"
                defaultValue={today}
                max={today}
                required
              />
            </div>
          </div>
        </div>

        {/* Buffer */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Parameter Kalkulasi</h2>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="buffer_days">
              Buffer Hari <span className="text-destructive">*</span>
            </Label>
            <Input
              id="buffer_days"
              name="buffer_days"
              type="number"
              min={1}
              max={90}
              defaultValue={7}
              required
            />
            <p className="text-xs text-muted-foreground">
              Jumlah hari buffer untuk menghitung safety stock rekomendasi:{" "}
              <code className="text-xs bg-muted px-1 rounded">
                avg_harian × buffer × (1 + CV)
              </code>
            </p>
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
