"use client";

import { useActionState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { upsertMonthlySales } from "./actions";

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

  function handleMonthChange(e: React.ChangeEvent<HTMLInputElement>) {
    startNavigating(() => {
      router.push(`/dashboard/sales?month=${e.target.value}`);
    });
  }

  const loading = isPending || isNavigating;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Input Penjualan Bulanan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan jumlah unit terjual per produk untuk bulan yang dipilih.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="month-picker"
            className="text-sm font-medium text-foreground whitespace-nowrap"
          >
            Bulan:
          </label>
          <input
            id="month-picker"
            type="month"
            defaultValue={month}
            onChange={handleMonthChange}
            disabled={loading}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          />
        </div>
      </div>

      <form ref={formRef} action={action}>
        <input type="hidden" name="month" value={month} />

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Data Penjualan —{" "}
                {new Date(`${month}-01`).toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Isi 0 untuk produk yang tidak terjual bulan ini.
              </p>
            </div>
            <Button type="submit" disabled={loading} className="h-8">
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-14 px-4 py-3 text-left font-medium text-muted-foreground">
                  No
                </th>
                <th className="w-28 px-4 py-3 text-left font-medium text-muted-foreground">
                  SKU
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Nama Produk
                </th>
                <th className="w-28 px-4 py-3 text-center font-medium text-muted-foreground">
                  Kategori
                </th>
                <th className="w-36 px-4 py-3 text-center font-medium text-muted-foreground">
                  Qty Terjual
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                      {p.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-muted-foreground">
                      {MOVEMENT_LABEL[p.movement_category] ?? p.movement_category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      name={`qty_${p.id}`}
                      min="0"
                      defaultValue={salesMap[p.id] ?? 0}
                      disabled={loading}
                      className="h-8 w-24 rounded-lg border border-input bg-background px-2.5 text-center text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Belum ada produk aktif.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
