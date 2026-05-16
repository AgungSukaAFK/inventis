"use client";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from "@/components/ui/dialog";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Banknote,
  Boxes,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

export type ProductDetail = {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  safety_stock: number;
  movement_category: string;
};

export type SaleDetail = {
  product_id: string;
  productName: string;
  productSku: string;
  quantity_sold: number;
  revenue: number;
};

export type DashboardCardsProps = {
  totalProducts: number;
  criticalCount: number;
  currentMonthQty: number;
  currentMonthRevenue: number;
  fastMovingCount: number;
  slowMovingCount: number;
  showRevenue: boolean;
  currentMonthLabel: string;
  allProducts: ProductDetail[];
  criticalProducts: ProductDetail[];
  currentMonthSales: SaleDetail[];
  fastMovingProducts: ProductDetail[];
  slowMovingProducts: ProductDetail[];
};

function fmtRupiah(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

const MOVEMENT_CONFIG: Record<string, { label: string; cls: string }> = {
  fast_moving: { label: "Fast Moving", cls: "text-green-600 bg-green-50" },
  medium_moving: { label: "Medium Moving", cls: "text-amber-600 bg-amber-50" },
  slow_moving: { label: "Slow Moving", cls: "text-red-600 bg-red-50" },
};

function StatCardDialog({
  label,
  value,
  sub,
  icon,
  iconCls,
  valueCls,
  dialogTitle,
  dialogSub,
  children,
}: {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  iconCls: string;
  valueCls?: string;
  dialogTitle: string;
  dialogSub?: string;
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "group w-full text-left rounded-xl border border-border bg-card p-5 transition-all",
          "hover:border-primary/40 hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "cursor-pointer",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground leading-none">{label}</p>
            <p
              className={cn(
                "text-2xl font-bold mt-2 tabular-nums leading-none",
                valueCls ?? "text-foreground",
              )}
            >
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 truncate">{sub}</p>
          </div>
          <div
            className={cn(
              "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center",
              iconCls,
            )}
          >
            {icon}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div>
            <DialogTitle>{dialogTitle}</DialogTitle>
            {dialogSub && <DialogDescription>{dialogSub}</DialogDescription>}
          </div>
          <DialogCloseButton />
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 px-4">
      <p className="text-sm text-muted-foreground text-center">{message}</p>
    </div>
  );
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-2.5 text-xs font-medium text-muted-foreground", className)}>
      {children}
    </th>
  );
}

function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}

function ProductMovementTable({ products }: { products: ProductDetail[] }) {
  if (products.length === 0) {
    return <EmptyState message="Tidak ada produk dalam kategori ini" />;
  }
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 z-10 bg-card">
        <tr className="border-b border-border bg-muted/30">
          <Th className="text-left">Produk</Th>
          <Th className="text-right">Stok Saat Ini</Th>
          <Th className="text-right">Safety Stock</Th>
        </tr>
      </thead>
      <tbody>
        {products.map((p, idx) => (
          <tr
            key={p.id}
            className={cn(
              "border-b border-border last:border-0",
              idx % 2 === 1 ? "bg-muted/20" : "",
            )}
          >
            <Td>
              <p className="text-xs font-medium text-foreground leading-snug">{p.name}</p>
              <p className="text-[11px] text-muted-foreground">{p.sku}</p>
            </Td>
            <Td className="text-right text-xs tabular-nums font-medium">{p.current_stock}</Td>
            <Td className="text-right text-xs tabular-nums text-muted-foreground">
              {p.safety_stock}
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DashboardCards({
  totalProducts,
  criticalCount,
  currentMonthQty,
  currentMonthRevenue,
  fastMovingCount,
  slowMovingCount,
  showRevenue,
  currentMonthLabel,
  allProducts,
  criticalProducts,
  currentMonthSales,
  fastMovingProducts,
  slowMovingProducts,
}: DashboardCardsProps) {
  const salesByQty = [...currentMonthSales].sort((a, b) => b.quantity_sold - a.quantity_sold);
  const salesByRev = [...currentMonthSales].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Total Produk Aktif */}
      <StatCardDialog
        label="Total Produk Aktif"
        value={totalProducts.toLocaleString("id-ID")}
        sub="produk terdaftar"
        icon={<Package className="h-4 w-4" />}
        iconCls="text-blue-600 bg-blue-50"
        dialogTitle="Semua Produk Aktif"
        dialogSub={`${totalProducts} produk terdaftar dalam sistem`}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border bg-muted/30">
              <Th className="text-left">Produk</Th>
              <Th className="text-right">Stok</Th>
              <Th className="text-center">Kategori Gerak</Th>
            </tr>
          </thead>
          <tbody>
            {allProducts.map((p, idx) => (
              <tr
                key={p.id}
                className={cn(
                  "border-b border-border last:border-0",
                  idx % 2 === 1 ? "bg-muted/20" : "",
                )}
              >
                <Td>
                  <p className="text-xs font-medium text-foreground leading-snug">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                </Td>
                <Td className="text-right text-xs tabular-nums font-medium">
                  {p.current_stock}
                </Td>
                <Td className="text-center">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                      MOVEMENT_CONFIG[p.movement_category]?.cls,
                    )}
                  >
                    {MOVEMENT_CONFIG[p.movement_category]?.label ?? p.movement_category}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatCardDialog>

      {/* Stok Kritis */}
      <StatCardDialog
        label="Stok Kritis"
        value={criticalCount.toLocaleString("id-ID")}
        sub={criticalCount === 0 ? "semua stok aman" : "perlu segera restock"}
        icon={<AlertTriangle className="h-4 w-4" />}
        iconCls={criticalCount > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}
        valueCls={criticalCount > 0 ? "text-red-600" : undefined}
        dialogTitle="Produk Stok Kritis"
        dialogSub="Produk dengan stok saat ini ≤ safety stock, diurutkan dari yang paling kritis"
      >
        {criticalProducts.length === 0 ? (
          <EmptyState message="Tidak ada produk dengan stok kritis saat ini" />
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border bg-muted/30">
                <Th className="text-left">Produk</Th>
                <Th className="text-right">Stok</Th>
                <Th className="text-right">Safety</Th>
                <Th className="text-right">Kekurangan</Th>
              </tr>
            </thead>
            <tbody>
              {criticalProducts.map((p, idx) => (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-border last:border-0",
                    idx % 2 === 1 ? "bg-muted/20" : "",
                  )}
                >
                  <Td>
                    <p className="text-xs font-medium text-foreground leading-snug">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                  </Td>
                  <Td className="text-right text-xs tabular-nums font-medium">
                    {p.current_stock}
                  </Td>
                  <Td className="text-right text-xs tabular-nums text-muted-foreground">
                    {p.safety_stock}
                  </Td>
                  <Td className="text-right text-xs tabular-nums font-semibold text-red-600">
                    {p.current_stock - p.safety_stock}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </StatCardDialog>

      {showRevenue ? (
        <>
          {/* Penjualan Bulan Ini */}
          <StatCardDialog
            label="Penjualan Bulan Ini"
            value={currentMonthQty.toLocaleString("id-ID")}
            sub="unit terjual bulan ini"
            icon={<ShoppingCart className="h-4 w-4" />}
            iconCls="text-primary bg-primary/10"
            dialogTitle={`Penjualan ${currentMonthLabel}`}
            dialogSub={
              currentMonthSales.length > 0
                ? `${currentMonthQty.toLocaleString("id-ID")} unit dari ${currentMonthSales.length} produk`
                : `Belum ada data penjualan ${currentMonthLabel}`
            }
          >
            {salesByQty.length === 0 ? (
              <EmptyState message={`Belum ada data penjualan untuk ${currentMonthLabel}`} />
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border bg-muted/30">
                    <Th className="text-left">Produk</Th>
                    <Th className="text-right">Qty Terjual</Th>
                    <Th className="text-right">Revenue</Th>
                  </tr>
                </thead>
                <tbody>
                  {salesByQty.map((s, idx) => (
                    <tr
                      key={s.product_id}
                      className={cn(
                        "border-b border-border last:border-0",
                        idx % 2 === 1 ? "bg-muted/20" : "",
                      )}
                    >
                      <Td>
                        <p className="text-xs font-medium text-foreground leading-snug">
                          {s.productName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{s.productSku}</p>
                      </Td>
                      <Td className="text-right text-xs tabular-nums font-semibold">
                        {s.quantity_sold}
                      </Td>
                      <Td className="text-right text-xs tabular-nums text-muted-foreground">
                        {fmtRupiah(s.revenue)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </StatCardDialog>

          {/* Revenue Bulan Ini */}
          <StatCardDialog
            label="Revenue Bulan Ini"
            value={fmtRupiah(currentMonthRevenue)}
            sub="dari data penjualan"
            icon={<Banknote className="h-4 w-4" />}
            iconCls="text-emerald-600 bg-emerald-50"
            dialogTitle={`Revenue ${currentMonthLabel}`}
            dialogSub={
              currentMonthSales.length > 0
                ? `Total ${fmtRupiah(currentMonthRevenue)} dari ${currentMonthSales.length} produk`
                : `Belum ada data penjualan ${currentMonthLabel}`
            }
          >
            {salesByRev.length === 0 ? (
              <EmptyState message={`Belum ada data penjualan untuk ${currentMonthLabel}`} />
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border bg-muted/30">
                    <Th className="text-left">Produk</Th>
                    <Th className="text-right">Revenue</Th>
                    <Th className="text-right">Qty</Th>
                  </tr>
                </thead>
                <tbody>
                  {salesByRev.map((s, idx) => (
                    <tr
                      key={s.product_id}
                      className={cn(
                        "border-b border-border last:border-0",
                        idx % 2 === 1 ? "bg-muted/20" : "",
                      )}
                    >
                      <Td>
                        <p className="text-xs font-medium text-foreground leading-snug">
                          {s.productName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{s.productSku}</p>
                      </Td>
                      <Td className="text-right text-xs tabular-nums font-semibold">
                        {fmtRupiah(s.revenue)}
                      </Td>
                      <Td className="text-right text-xs tabular-nums text-muted-foreground">
                        {s.quantity_sold}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </StatCardDialog>
        </>
      ) : (
        <>
          {/* Fast Moving */}
          <StatCardDialog
            label="Fast Moving"
            value={fastMovingCount.toLocaleString("id-ID")}
            sub="produk perputaran cepat"
            icon={<TrendingUp className="h-4 w-4" />}
            iconCls="text-green-600 bg-green-50"
            dialogTitle="Produk Fast Moving"
            dialogSub={`${fastMovingCount} produk dengan perputaran stok cepat`}
          >
            <ProductMovementTable products={fastMovingProducts} />
          </StatCardDialog>

          {/* Slow Moving */}
          <StatCardDialog
            label="Slow Moving"
            value={slowMovingCount.toLocaleString("id-ID")}
            sub="produk perputaran lambat"
            icon={<Boxes className="h-4 w-4" />}
            iconCls="text-amber-600 bg-amber-50"
            dialogTitle="Produk Slow Moving"
            dialogSub={`${slowMovingCount} produk dengan perputaran stok lambat`}
          >
            <ProductMovementTable products={slowMovingProducts} />
          </StatCardDialog>
        </>
      )}
    </div>
  );
}
