"use client";

import { toggleProductActive } from "./actions";
import { EditStockDialog } from "./edit-stock-dialog";
import { StockHistoryDialog } from "./stock-history-dialog";
import { cn } from "@/lib/utils";
import type { Product, UserRole } from "@/lib/supabase/types";

const MOVEMENT_LABEL: Record<string, string> = {
  fast_moving: "Fast Moving",
  medium_moving: "Medium Moving",
  slow_moving: "Slow Moving",
};

const MOVEMENT_CLASS: Record<string, string> = {
  fast_moving: "bg-green-500/10 text-green-700 dark:text-green-400",
  medium_moving: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  slow_moving: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

function formatRupiah(n: number) {
  return "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);
}

type Props = {
  products: Product[];
  role: UserRole;
};

export function ProductsTable({ products, role }: Props) {
  const canEditStock = role === "kepala_toko" || role === "kepala_gudang";
  const isKepalaToko = role === "kepala_toko";

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card py-16 text-center text-sm text-muted-foreground">
        Tidak ada barang ditemukan.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Barang</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kategori</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kategori Gerak</th>
            {isKepalaToko && (
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Harga Beli</th>
            )}
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Harga Jual</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stok</th>
            {isKepalaToko && (
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Safety Stock</th>
            )}
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            {canEditStock && (
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => {
            const lowStock = p.current_stock <= p.safety_stock && p.current_stock > 0;
            const outOfStock = p.current_stock === 0;

            return (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                <td className="px-4 py-3 font-medium">
                  {p.name}
                  {p.description && (
                    <p className="text-xs text-muted-foreground font-normal truncate max-w-48">
                      {p.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.category?.name ?? <span className="italic text-muted-foreground/60">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      MOVEMENT_CLASS[p.movement_category],
                    )}
                  >
                    {MOVEMENT_LABEL[p.movement_category]}
                  </span>
                </td>
                {isKepalaToko && (
                  <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(p.purchase_price)}</td>
                )}
                <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(p.selling_price)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span
                    className={cn(
                      "font-medium",
                      outOfStock
                        ? "text-destructive"
                        : lowStock
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-foreground",
                    )}
                  >
                    {p.current_stock}
                  </span>
                  {lowStock && !outOfStock && (
                    <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">(rendah)</span>
                  )}
                  {outOfStock && (
                    <span className="ml-1 text-xs text-destructive">(habis)</span>
                  )}
                </td>
                {isKepalaToko && (
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {p.safety_stock}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      p.is_active
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {p.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                {canEditStock && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <StockHistoryDialog productId={p.id} productName={p.name} />
                      <EditStockDialog product={p} role={role} />
                      {isKepalaToko && (
                        <form
                          action={async () => {
                            await toggleProductActive(p.id, p.is_active);
                          }}
                        >
                          <button
                            type="submit"
                            className={cn(
                              "inline-flex h-7 cursor-pointer items-center rounded-md border px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                              p.is_active
                                ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                                : "border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/10",
                            )}
                          >
                            {p.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
