"use client";

import { useActionState, useTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { upsertMonthlySales } from "./actions";
import { cn } from "@/lib/utils";
import { Printer } from "lucide-react";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function buildYears() {
  const current = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => current - i).reverse();
}

type Product = {
  id: string;
  sku: string;
  name: string;
  selling_price: number;
  movement_category: string;
};

type Props = {
  month: string;
  products: Product[];
  salesMap: Record<string, number>;
};

const MOVEMENT_LABEL: Record<string, string> = {
  fast_moving: "Fast",
  medium_moving: "Medium",
  slow_moving: "Slow",
};

export function SalesForm({ month, products, salesMap }: Props) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(upsertMonthlySales, null);
  const [isNavigating, startNavigating] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success(
        state.saved === 0
          ? "Data berhasil dikosongkan."
          : `${state.saved} produk berhasil disimpan.`,
      );
    }
  }, [state]);

  const [selectedYear, selectedMonthIdx] = month.split("-").map(Number);

  function handleMonthSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const mm = String(e.target.value).padStart(2, "0");
    startNavigating(() => {
      router.push(`/dashboard/sales?month=${selectedYear}-${mm}`);
    });
  }

  function handleYearSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const mm = String(selectedMonthIdx).padStart(2, "0");
    startNavigating(() => {
      router.push(`/dashboard/sales?month=${e.target.value}-${mm}`);
    });
  }

  const loading = isPending || isNavigating;
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const periodLabel = new Date(`${month}-01`).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const printDate   = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">

      {/* Print-only header */}
      <div className="invisible h-0 overflow-hidden print:visible print:h-auto print:overflow-visible print:flex items-center justify-between mb-6 pb-5 border-b-2 border-gray-300">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-bj.png" alt="Logo" width={64} height={64} className="object-contain rounded-full" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Laporan Penjualan Bulanan</p>
            <p className="text-lg font-bold text-black leading-tight">Toko Banten Jaya Sport Fashion</p>
            <p className="text-xs text-gray-500 mt-0.5">Periode: {periodLabel}</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 space-y-0.5">
          <p>Tanggal cetak:</p>
          <p className="font-medium text-gray-700">{printDate}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Input Penjualan Bulanan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan jumlah unit terjual per produk untuk bulan yang dipilih.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">Bulan:</span>
          <select
            value={selectedMonthIdx}
            onChange={handleMonthSelect}
            disabled={loading}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            {MONTHS.map((label, i) => (
              <option key={i} value={i + 1}>{label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={handleYearSelect}
            disabled={loading}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            {buildYears().map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <form ref={formRef} action={action}>
        <input type="hidden" name="month" value={month} />

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-4 py-3 flex items-center justify-between print:bg-gray-50 print:border-black/20">
            <div>
              <h2 className="text-sm font-semibold text-foreground print:text-black">
                Data Penjualan — {periodLabel}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground print:hidden">
                Isi 0 untuk produk yang tidak terjual bulan ini.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-8 print:hidden"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Cetak
              </Button>
              <Button type="submit" disabled={loading} className="h-8 print:hidden">
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-120">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-12 px-4 py-3 text-left font-medium text-muted-foreground">No</th>
                <th className="w-28 px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Produk</th>
                <th className="w-28 px-4 py-3 text-center font-medium text-muted-foreground">Kategori</th>
                <th className="w-40 px-4 py-3 text-center font-medium text-muted-foreground">Qty Terjual</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => {
                const isFocused = focusedId === p.id;
                return (
                  <tr
                    key={p.id}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors",
                      isFocused
                        ? "bg-primary/10"
                        : idx % 2 === 1
                          ? "bg-muted/25 hover:bg-muted/40"
                          : "hover:bg-muted/15",
                    )}
                  >
                    <td className={cn(
                      "px-4 py-2.5 tabular-nums text-xs font-mono border-l-2 transition-colors",
                      isFocused ? "border-l-primary text-primary font-semibold" : "border-l-transparent text-muted-foreground/60",
                    )}>
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                        {p.sku}
                      </span>
                    </td>
                    <td className={cn("px-4 py-2.5 font-medium transition-colors", isFocused ? "text-primary" : "text-foreground")}>
                      {p.name}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-xs text-muted-foreground">
                        {MOVEMENT_LABEL[p.movement_category] ?? p.movement_category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          id={`qty_${p.id}`}
                          name={`qty_${p.id}`}
                          min="0"
                          defaultValue={salesMap[p.id] ?? 0}
                          disabled={loading}
                          aria-label={`Qty terjual ${p.name}`}
                          onFocus={() => setFocusedId(p.id)}
                          onBlur={() => setFocusedId(null)}
                          className="h-8 w-20 rounded-lg border border-input bg-background px-2.5 text-center text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 print:border-0 print:bg-transparent print:ring-0 print:h-auto print:w-auto print:font-semibold print:text-black"
                        />
                        <span className="text-xs text-muted-foreground w-6 print:hidden">unit</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {products.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Belum ada produk aktif.
            </p>
          )}
        </div>
      </form>

      <div className="hidden print:flex mt-8 pt-4 border-t border-gray-300 text-xs text-gray-400 justify-between">
        <span>Toko Banten Jaya Sport Fashion — Data Penjualan {periodLabel}</span>
        <span>Dicetak pada {printDate}</span>
      </div>
    </div>
  );
}
