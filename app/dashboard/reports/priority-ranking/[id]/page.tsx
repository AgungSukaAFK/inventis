import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCalculationDetail } from "@/app/dashboard/calculations/priority-ranking/actions";
import { PrintButton } from "./print-button";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatRupiah(n: number) {
  return "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);
}

function priorityLabel(vi: number): { label: string; cls: string } {
  if (vi >= 0.7) return { label: "Sangat Tinggi", cls: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30" };
  if (vi >= 0.5) return { label: "Tinggi",        cls: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30" };
  if (vi >= 0.3) return { label: "Sedang",         cls: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30" };
  return           { label: "Rendah",              cls: "bg-muted text-muted-foreground border-border" };
}

const CRITERIA = [
  { code: "C1", label: "Tingkat Penjualan", type: "Benefit", weight: "35%", note: "Total penjualan/bulan" },
  { code: "C2", label: "Stok Tersisa",      type: "Cost",    weight: "25%", note: "Stok saat kalkulasi" },
  { code: "C3", label: "Harga Modal",       type: "Cost",    weight: "15%", note: "Harga beli" },
  { code: "C4", label: "Margin Keuntungan", type: "Benefit", weight: "25%", note: "% dari harga jual" },
];

export default async function LaporanPRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (!["owner", "kepala_toko"].includes(profileData?.role ?? "")) redirect("/dashboard");

  const detail = await getCalculationDetail(id);
  if (!detail) notFound();

  const { calc, results } = detail;
  const maxPref = results[0]?.preference_score ?? 1;

  const periodeStr = calc.period_start && calc.period_end
    ? `${formatDate(calc.period_start)} – ${formatDate(calc.period_end)}`
    : "—";

  return (
    <div className="space-y-6">

      {/* Print-only header */}
      <div className="invisible h-0 overflow-hidden print:visible print:h-auto print:overflow-visible print:flex items-center justify-between mb-6 pb-5 border-b-2 border-gray-300">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-bj.png" alt="Logo" width={64} height={64} className="object-contain rounded-full" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Laporan Sistem Pendukung Keputusan</p>
            <p className="text-lg font-bold text-black leading-tight">Toko Banten Jaya Sport Fashion</p>
            <p className="text-xs text-gray-500 mt-0.5">Hasil Analisis Priority Ranking — Metode TOPSIS</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 space-y-0.5">
          <p>Tanggal cetak:</p>
          <p className="font-medium text-gray-700">
            {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <Link
        href="/dashboard/reports/priority-ranking"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors print:hidden"
      >
        <ChevronLeft className="h-4 w-4" />
        Laporan PR
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground print:text-xl print:font-bold">{calc.title}</h1>
          {calc.description && (
            <p className="text-sm text-muted-foreground mt-0.5 print:text-gray-600">{calc.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-xs text-muted-foreground print:text-gray-600">
            <span><span className="font-medium text-foreground print:text-black">Periode:</span> {periodeStr}</span>
            <span><span className="font-medium text-foreground print:text-black">Produk dianalisis:</span> {calc.total_alternatives}</span>
            <span><span className="font-medium text-foreground print:text-black">Tanggal kalkulasi:</span> {formatDate(calc.calculation_date)}</span>
          </div>
        </div>
        <div className="print:hidden shrink-0">
          <PrintButton />
        </div>
      </div>

      {/* Kriteria */}
      <div className="break-inside-avoid rounded-lg border border-border bg-muted/20 p-4 print:border-black/20 print:bg-gray-50">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 print:text-gray-500">
          Kriteria Penilaian
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CRITERIA.map((c) => (
            <div key={c.code} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded print:text-black print:bg-gray-200">
                  {c.code}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  c.type === "Benefit" ? "text-green-700 dark:text-green-400 print:text-green-800" : "text-orange-700 dark:text-orange-400 print:text-orange-800",
                )}>
                  {c.type}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground print:text-black">{c.label}</p>
              <p className="text-xs text-muted-foreground print:text-gray-500">{c.note} · W={c.weight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel hasil */}
      {results.length === 0 ? (
        <div className="rounded-xl border border-border bg-card flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Tidak ada hasil kalkulasi.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-x-auto print:overflow-visible print:border-black/20">
          <div className="px-4 py-3 border-b border-border bg-muted/20 print:bg-gray-50 print:border-black/20">
            <p className="text-sm font-semibold text-foreground print:text-black">Hasil Perangkingan TOPSIS</p>
            <p className="text-xs text-muted-foreground print:text-gray-500 mt-0.5">
              Urutan prioritas restock berdasarkan nilai preferensi Vi (semakin tinggi = semakin prioritas)
            </p>
          </div>

          <table className="w-full text-sm print:text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 print:bg-gray-100 print:border-black/20">
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-14 print:text-gray-600">Rank</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground print:text-gray-600">Nama Produk</th>
                <th className="px-3 py-3 text-right font-medium text-muted-foreground print:text-gray-600">
                  <span className="block text-xs font-semibold">C1</span>
                  <span className="block text-xs font-normal">/Bulan</span>
                </th>
                <th className="px-3 py-3 text-right font-medium text-muted-foreground print:text-gray-600">
                  <span className="block text-xs font-semibold">C2</span>
                  <span className="block text-xs font-normal">Stok</span>
                </th>
                <th className="px-3 py-3 text-right font-medium text-muted-foreground print:text-gray-600">
                  <span className="block text-xs font-semibold">C3</span>
                  <span className="block text-xs font-normal">Harga Modal</span>
                </th>
                <th className="px-3 py-3 text-right font-medium text-muted-foreground print:text-gray-600">
                  <span className="block text-xs font-semibold">C4</span>
                  <span className="block text-xs font-normal">Margin</span>
                </th>
                <th className="px-3 py-3 text-right font-medium text-muted-foreground print:text-gray-600">
                  <span className="block text-xs font-semibold">Vi</span>
                  <span className="block text-xs font-normal">Preferensi</span>
                </th>
                <th className="px-3 py-3 text-center font-medium text-muted-foreground print:text-gray-600">
                  <span className="block text-xs font-semibold">Prioritas</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-black/10">
              {results.map((r, idx) => {
                const isTop3   = r.rank_order <= 3;
                const vi       = r.preference_score;
                const prio     = priorityLabel(vi);
                const barWidth = maxPref > 0 ? (vi / maxPref) * 100 : 0;
                const stockCls = r.current_stock_snapshot != null
                  ? r.current_stock_snapshot <= 2 ? "text-destructive font-semibold"
                  : r.current_stock_snapshot <= 7 ? "text-yellow-600 dark:text-yellow-400 font-semibold"
                  : "text-foreground"
                  : "";

                return (
                  <tr
                    key={r.id}
                    className={cn(
                      "transition-colors print:transition-none",
                      isTop3
                        ? "bg-primary/5 hover:bg-primary/10 print:bg-blue-50"
                        : idx % 2 === 1
                          ? "bg-muted/15 hover:bg-muted/30"
                          : "hover:bg-muted/20",
                    )}
                  >
                    <td className="px-4 py-3 text-center">
                      {isTop3 ? (
                        <span className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold print:rounded-none print:bg-transparent",
                          r.rank_order === 1 ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 print:text-yellow-700" :
                          r.rank_order === 2 ? "bg-slate-400/20 text-slate-600 dark:text-slate-400 print:text-slate-700" :
                                               "bg-orange-400/20 text-orange-700 dark:text-orange-400 print:text-orange-700",
                        )}>
                          {r.rank_order}
                        </span>
                      ) : (
                        <span className="text-sm tabular-nums text-muted-foreground print:text-gray-500">
                          {r.rank_order}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium print:text-black">{r.product?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground font-mono print:text-gray-500">{r.product?.sku ?? ""}</p>
                    </td>

                    <td className="px-3 py-3 text-right tabular-nums text-sm print:text-xs print:text-gray-700">
                      {r.avg_daily_sales != null ? (
                        <span>{r.avg_daily_sales}<span className="text-xs text-muted-foreground ml-0.5 print:text-gray-500"> unit</span></span>
                      ) : "—"}
                    </td>

                    <td className={cn("px-3 py-3 text-right tabular-nums text-sm print:text-xs", stockCls)}>
                      {r.current_stock_snapshot != null ? r.current_stock_snapshot : "—"}
                    </td>

                    <td className="px-3 py-3 text-right tabular-nums text-sm text-muted-foreground print:text-xs print:text-gray-700">
                      {r.purchase_price_snapshot != null ? formatRupiah(r.purchase_price_snapshot) : "—"}
                    </td>

                    <td className="px-3 py-3 text-right tabular-nums text-sm text-muted-foreground print:text-xs print:text-gray-700">
                      {r.margin_percentage != null ? `${r.margin_percentage.toFixed(1)}%` : "—"}
                    </td>

                    <td className="px-3 py-3 text-right">
                      <span className={cn("text-sm font-semibold tabular-nums print:text-xs", isTop3 ? "text-primary print:text-blue-700" : "text-foreground print:text-black")}>
                        {vi.toFixed(4)}
                      </span>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden print:hidden">
                        <div
                          className={cn("h-full rounded-full", isTop3 ? "bg-primary" : "bg-muted-foreground/40")}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border print:rounded-none print:border-0 print:text-gray-700", prio.cls)}>
                        {prio.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-border bg-muted/30 px-5 py-4 print:border-black/20 print:bg-gray-50">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 print:text-gray-500">
          Catatan Penting
        </p>
        <p className="text-sm leading-6 text-muted-foreground print:text-gray-600 print:text-xs print:leading-5">
          Data di atas merupakan <strong className="text-foreground print:text-black">rekomendasi</strong> yang dihasilkan
          oleh Sistem Pendukung Keputusan (SPK) menggunakan metode <strong className="text-foreground print:text-black">TOPSIS</strong>.
          Hasil ini bersifat analitis dan hanya sebagai bahan pertimbangan — bukan keputusan final.
          Keputusan restock tetap sepenuhnya menjadi wewenang dan tanggung jawab pemilik toko.
        </p>
      </div>

      {/* Footer print — pakai pola invisible/h-0 agar selalu ada di flow, bukan display:none */}
      <div className="invisible h-0 overflow-hidden print:visible print:h-auto print:overflow-visible print:flex mt-6 pt-4 border-t border-gray-300 text-xs text-gray-400 justify-between">
        <span>Toko Banten Jaya Sport Fashion — Sistem Pendukung Keputusan Inventaris</span>
        <span>Dokumen ini digenerate otomatis oleh sistem. Bukan dokumen resmi pengadaan.</span>
      </div>
    </div>
  );
}
