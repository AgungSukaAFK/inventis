"use client";

import { useState, useActionState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  updateCriteriaWeight,
  toggleCriteriaActive,
  updateSubCriteria,
} from "./actions";
import type { CriteriaWithSubs } from "./actions";
import type { SubCriteria } from "@/lib/supabase/types";

const METRIC_LABEL: Record<string, string> = {
  avg_daily_sales:   "Rata-rata penjualan/hari",
  current_stock:     "Stok saat ini",
  purchase_price:    "Harga modal",
  margin_percentage: "Margin keuntungan (%)",
};

// ─── Sub-criteria row ─────────────────────────────────────────────────────────

function SubCriteriaRow({ sub }: { sub: SubCriteria }) {
  const [editing, setEditing] = useState(false);

  const [state, action, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await updateSubCriteria(_, formData);
      if (result?.success) setEditing(false);
      return result;
    },
    undefined,
  );

  if (!editing) {
    return (
      <tr className="hover:bg-muted/20 transition-colors group">
        <td className="px-3 py-2.5 text-center">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {sub.value}
          </span>
        </td>
        <td className="px-3 py-2.5 text-sm font-medium text-foreground">{sub.label}</td>
        <td className="px-3 py-2.5 text-sm tabular-nums text-muted-foreground text-right">
          {sub.range_min != null ? sub.range_min : "—"}
        </td>
        <td className="px-3 py-2.5 text-sm tabular-nums text-muted-foreground text-right">
          {sub.range_max != null ? sub.range_max : "∞"}
        </td>
        <td className="px-3 py-2.5 text-xs text-muted-foreground">{sub.description ?? "—"}</td>
        <td className="px-3 py-2.5 text-right">
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 inline-flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-muted/40">
      <td colSpan={6} className="px-3 py-3">
        <form action={action} className="space-y-3">
          <input type="hidden" name="sub_id" value={sub.id} />
          {state?.error && (
            <p className="text-xs text-destructive">{state.error}</p>
          )}
          <div className="grid grid-cols-6 gap-2 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Skor</label>
              <Input
                name="value"
                type="number"
                min={1}
                max={5}
                step={1}
                defaultValue={sub.value}
                className="h-7 text-xs"
                required
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground">Label</label>
              <Input
                name="label"
                defaultValue={sub.label}
                className="h-7 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Range Min</label>
              <Input
                name="range_min"
                type="number"
                step="any"
                defaultValue={sub.range_min ?? ""}
                placeholder="—"
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Range Max</label>
              <Input
                name="range_max"
                type="number"
                step="any"
                defaultValue={sub.range_max ?? ""}
                placeholder="∞"
                className="h-7 text-xs"
              />
            </div>
            <div className="flex gap-1 justify-end">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-accent transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Deskripsi (opsional)</label>
            <Input
              name="description"
              defaultValue={sub.description ?? ""}
              placeholder="Penjelasan singkat"
              className="h-7 text-xs"
            />
          </div>
        </form>
      </td>
    </tr>
  );
}

// ─── Single criteria card ─────────────────────────────────────────────────────

function CriteriaCard({ criteria }: { criteria: CriteriaWithSubs }) {
  const [weightState, weightAction, weightPending] = useActionState(
    updateCriteriaWeight,
    undefined,
  );

  return (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden transition-colors",
      criteria.is_active ? "border-border" : "border-border/50 opacity-60",
    )}>
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3">
        <span className="shrink-0 text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {criteria.code}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{criteria.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {METRIC_LABEL[criteria.metric_key ?? ""] ?? criteria.metric_key}
          </p>
        </div>
        <span className={cn(
          "shrink-0 text-xs font-medium px-2 py-0.5 rounded-full",
          criteria.type === "benefit"
            ? "bg-green-500/10 text-green-700 dark:text-green-400"
            : "bg-orange-500/10 text-orange-700 dark:text-orange-400",
        )}>
          {criteria.type === "benefit" ? "Benefit" : "Cost"}
        </span>
      </div>

      {/* Weight + toggle */}
      <div className="px-4 pb-4 flex items-end gap-3">
        <form action={weightAction} className="flex items-end gap-2 flex-1">
          <input type="hidden" name="criteria_id" value={criteria.id} />
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Bobot (0–1)</label>
            <div className="flex items-center gap-2">
              <Input
                name="weight"
                type="number"
                min={0}
                max={1}
                step={0.01}
                defaultValue={criteria.weight}
                className="h-8 w-24 text-sm"
                required
              />
              <span className="text-sm text-muted-foreground w-12">
                = {(criteria.weight * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <Button type="submit" size="sm" disabled={weightPending} className="h-8">
            {weightPending ? "..." : "Simpan"}
          </Button>
          {weightState?.error && (
            <p className="text-xs text-destructive self-center">{weightState.error}</p>
          )}
        </form>

        <form
          action={async () => {
            await toggleCriteriaActive(criteria.id, criteria.is_active);
          }}
        >
          <button
            type="submit"
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
              criteria.is_active
                ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                : "border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/10",
            )}
          >
            {criteria.is_active ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </form>

      </div>

      {/* Sub-criteria table */}
      <div className="border-t border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground w-14">Skor</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Label</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground w-28">Range Min</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground w-28">Range Max</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Deskripsi</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...criteria.sub_criteria]
                .sort((a, b) => a.value - b.value)
                .map((sub) => (
                  <SubCriteriaRow key={sub.id} sub={sub} />
                ))}
            </tbody>
          </table>
        </div>
    </div>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

export function CriteriaTable({ criteria }: { criteria: CriteriaWithSubs[] }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {criteria.map((c) => (
        <CriteriaCard key={c.id} criteria={c} />
      ))}
    </div>
  );
}
