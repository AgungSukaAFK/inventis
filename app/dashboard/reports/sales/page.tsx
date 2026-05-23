import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PeriodSelector } from "./period-selector";
import { PrintButton } from "./print-button";

function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default async function LaporanPenjualanPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profileData?.role !== "owner") redirect("/dashboard");

  const params = await searchParams;
  const now    = new Date();
  const year   = Number(params.year)  || now.getFullYear();
  const month  = Number(params.month) || (now.getMonth() === 0 ? 12 : now.getMonth());

  const periodStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const periodEnd   = `${year}-${String(month).padStart(2, "0")}-${lastDayOfMonth(year, month)}`;

  const [{ data: products }, { data: sales }] = await Promise.all([
    supabase
      .from("products")
      .select("id, sku, name, category_id, categories(name)")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("sales_history")
      .select("product_id, quantity_sold")
      .gte("sale_date", periodStart)
      .lte("sale_date", periodEnd),
  ]);

  type ProductRow = {
    id: string;
    sku: string;
    name: string;
    category_id: string | null;
    categories: { name: string } | null;
  };

  const salesMap = new Map<string, number>();
  for (const s of sales ?? []) {
    salesMap.set(s.product_id, (salesMap.get(s.product_id) ?? 0) + s.quantity_sold);
  }

  const rows = (products as unknown as ProductRow[] ?? [])
    .map((p) => ({
      ...p,
      totalSold: salesMap.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.totalSold - a.totalSold || a.name.localeCompare(b.name, "id"));

  const totalSold = rows.reduce((s, r) => s + r.totalSold, 0);
  const soldCount = rows.filter((r) => r.totalSold > 0).length;

  const periodeLabel = `${MONTH_NAMES[month - 1]} ${year}`;
  const printDate = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">

      {/* Print-only header */}
      <div className="invisible h-0 overflow-hidden print:visible print:h-auto print:overflow-visible print:flex items-center justify-between mb-6 pb-5 border-b-2 border-gray-300">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-bj.png" alt="Logo" width={64} height={64} className="object-contain rounded-full" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Laporan Penjualan Barang</p>
            <p className="text-lg font-bold text-black leading-tight">Toko Banten Jaya Sport Fashion</p>
            <p className="text-xs text-gray-500 mt-0.5">Periode: {periodeLabel}</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 space-y-0.5">
          <p>Tanggal cetak:</p>
          <p className="font-medium text-gray-700">{printDate}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Laporan Penjualan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Total penjualan barang per periode bulan.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-4 print:hidden">
        <span className="text-sm text-muted-foreground">Periode:</span>
        <PeriodSelector year={year} month={month} />
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card flex divide-x divide-border print:border-black/20 print:divide-black/20">
        {[
          { label: "Total Produk Aktif", value: rows.length },
          { label: "Produk Terjual",     value: soldCount },
          { label: "Total Unit Terjual", value: totalSold },
        ].map((s) => (
          <div key={s.label} className="flex-1 px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground print:text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1 tabular-nums print:text-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div className="rounded-xl border border-border bg-card overflow-hidden print:border-black/20">
        <div className="px-4 py-3 border-b border-border bg-muted/20 print:bg-gray-50 print:border-black/20">
          <p className="text-sm font-semibold text-foreground print:text-black">
            Rincian Penjualan — {periodeLabel}
          </p>
        </div>
        <table className="w-full text-sm print:text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30 print:bg-gray-100 print:border-black/20">
              <th className="px-4 py-3 text-center font-medium text-muted-foreground w-12 print:text-gray-600">No</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground print:text-gray-600">SKU</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground print:text-gray-600">Nama Barang</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground print:text-gray-600">Kategori</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground print:text-gray-600">Terjual (unit)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border print:divide-black/10">
            {rows.map((r, idx) => (
              <tr
                key={r.id}
                className={idx % 2 === 1 ? "bg-muted/15 print:bg-gray-50" : ""}
              >
                <td className="px-4 py-2.5 text-center text-muted-foreground tabular-nums print:text-gray-500">
                  {idx + 1}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground print:text-gray-500">
                  {r.sku}
                </td>
                <td className="px-4 py-2.5 font-medium text-foreground print:text-black">
                  {r.name}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground print:text-gray-600">
                  {r.categories?.name ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold print:text-black">
                  {r.totalSold > 0 ? r.totalSold : (
                    <span className="font-normal text-muted-foreground print:text-gray-400">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/30 print:bg-gray-100 print:border-black/30">
              <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-foreground print:text-black">
                Total
              </td>
              <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-foreground print:text-black">
                {totalSold}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer print */}
      <div className="hidden print:flex mt-8 pt-4 border-t border-gray-300 text-xs text-gray-400 justify-between">
        <span>Toko Banten Jaya Sport Fashion — Laporan Penjualan {periodeLabel}</span>
        <span>Dicetak pada {printDate}</span>
      </div>
    </div>
  );
}
