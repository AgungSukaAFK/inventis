"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Calculator, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopsisStepsData, StepCriteria } from "../actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 4) {
  return n.toFixed(decimals);
}

function fmtRaw(value: number, unit: string) {
  if (unit === "Rp") return "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(value));
  if (unit === "%")  return value.toFixed(2) + "%";
  if (unit === "unit") return Math.round(value).toString();
  return value.toFixed(2);
}

function matchedSub(subs: StepCriteria["subs"], rawValue: number) {
  const sorted = [...subs]
    .filter((s) => s.range_min !== null || s.range_max !== null)
    .sort((a, b) => (a.range_min ?? 0) - (b.range_min ?? 0));
  for (const s of sorted) {
    const min = s.range_min ?? -Infinity;
    const max = s.range_max ?? Infinity;
    if (rawValue >= min && rawValue <= max) return s;
  }
  return subs[subs.length - 1];
}

// ─── UI primitives ─────────────────────────────────────────────────────────────

function StepCard({
  step,
  title,
  desc,
  children,
}: {
  step: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
      >
        <span className="shrink-0 text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {step}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="overflow-x-auto border-t border-border">{children}</div>}
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

function Td({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn("px-3 py-2 text-xs tabular-nums", className)}>{children}</td>
  );
}

// ─── Keseluruhan ──────────────────────────────────────────────────────────────

function MatrixTable({
  criteria,
  products,
  data,
  formatVal,
  footer,
}: {
  criteria: StepCriteria[];
  products: TopsisStepsData["products"];
  data: number[][];
  formatVal: (v: number, col: number) => string;
  footer?: { label: string; values: number[]; format: (v: number, col: number) => string };
}) {
  return (
    <table className="w-full text-xs min-w-max">
      <thead>
        <tr className="bg-muted/30 border-b border-border">
          <Th className="text-left sticky left-0 bg-muted/30 w-52">Produk</Th>
          {criteria.map((c) => (
            <Th key={c.code} className="text-center">
              {c.code}
              <span className="block font-normal text-muted-foreground/70">{c.name}</span>
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {products.map((p, i) => (
          <tr key={i} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-muted/10")}>
            <Td className="sticky left-0 bg-background font-medium">
              <span className="font-mono text-muted-foreground mr-1.5">{p.rank}.</span>
              {p.name}
              <span className="block text-muted-foreground font-mono">{p.sku}</span>
            </Td>
            {data[i].map((v, j) => (
              <Td key={j} className="text-center">{formatVal(v, j)}</Td>
            ))}
          </tr>
        ))}
        {footer && (
          <tr className="border-t-2 border-border bg-primary/5">
            <Td className="sticky left-0 bg-primary/5 font-semibold text-primary">{footer.label}</Td>
            {footer.values.map((v, j) => (
              <Td key={j} className="text-center font-semibold text-primary">{footer.format(v, j)}</Td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
}

function OverallView({ steps }: { steps: TopsisStepsData }) {
  const { criteria, products, scores, colNorms, normalized, weighted, idealBest, idealWorst, dPlus, dMinus, pref } = steps;

  return (
    <div className="space-y-3">
      {/* Step 1 */}
      <StepCard step="L1" title="Matriks Keputusan" desc="Konversi nilai aktual → skor 1–5 berdasarkan sub-kriteria">
        <MatrixTable
          criteria={criteria}
          products={products}
          data={scores}
          formatVal={(v) => v.toString()}
        />
      </StepCard>

      {/* Step 2 */}
      <StepCard step="L2" title="Normalisasi" desc="Rij = Xij / √ΣXij² (per kolom)">
        <MatrixTable
          criteria={criteria}
          products={products}
          data={normalized}
          formatVal={(v) => fmt(v)}
          footer={{
            label: "√ΣXij²",
            values: colNorms,
            format: (v) => fmt(v),
          }}
        />
      </StepCard>

      {/* Step 3 */}
      <StepCard step="L3" title="Normalisasi Terbobot" desc="Yij = Rij × Wj">
        <MatrixTable
          criteria={criteria}
          products={products}
          data={weighted}
          formatVal={(v) => fmt(v)}
          footer={{
            label: "Bobot (Wj)",
            values: criteria.map((c) => c.weight),
            format: (v) => fmt(v),
          }}
        />
      </StepCard>

      {/* Step 4 */}
      <StepCard step="L4" title="Solusi Ideal" desc="A+ (terbaik) dan A− (terburuk) per kriteria">
        <table className="w-full text-xs min-w-max">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <Th className="text-left">Solusi</Th>
              {criteria.map((c) => (
                <Th key={c.code} className="text-center">
                  {c.code}
                  <span className="block font-normal text-muted-foreground/70">{c.type === "benefit" ? "Benefit" : "Cost"}</span>
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border bg-green-500/5">
              <Td className="font-semibold text-green-700 dark:text-green-400">A+ (Ideal+)</Td>
              {idealBest.map((v, j) => <Td key={j} className="text-center text-green-700 dark:text-green-400 font-medium">{fmt(v)}</Td>)}
            </tr>
            <tr className="bg-orange-500/5">
              <Td className="font-semibold text-orange-700 dark:text-orange-400">A− (Ideal−)</Td>
              {idealWorst.map((v, j) => <Td key={j} className="text-center text-orange-700 dark:text-orange-400 font-medium">{fmt(v)}</Td>)}
            </tr>
          </tbody>
        </table>
      </StepCard>

      {/* Step 5 */}
      <StepCard step="L5" title="Jarak D+ dan D−" desc="D+ = jarak ke A+, D− = jarak ke A−">
        <table className="w-full text-xs min-w-max">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <Th className="text-left sticky left-0 bg-muted/30 w-52">Produk</Th>
              <Th className="text-center">D+</Th>
              <Th className="text-center">D−</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-muted/10")}>
                <Td className="sticky left-0 bg-background font-medium">
                  <span className="font-mono text-muted-foreground mr-1.5">{p.rank}.</span>{p.name}
                </Td>
                <Td className="text-center">{fmt(dPlus[i], 6)}</Td>
                <Td className="text-center">{fmt(dMinus[i], 6)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </StepCard>

      {/* Step 6 */}
      <StepCard step="L6" title="Nilai Preferensi & Ranking" desc="Vi = D− / (D+ + D−)">
        <table className="w-full text-xs min-w-max">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <Th className="text-left sticky left-0 bg-muted/30 w-52">Produk</Th>
              <Th className="text-center">D+</Th>
              <Th className="text-center">D−</Th>
              <Th className="text-center">D+ + D−</Th>
              <Th className="text-center">Vi</Th>
              <Th className="text-center">Rank</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className={cn("border-b border-border last:border-0", p.rank <= 3 ? "bg-primary/5" : i % 2 === 1 ? "bg-muted/10" : "")}>
                <Td className="sticky left-0 bg-background font-medium">
                  <span className="font-mono text-muted-foreground mr-1.5">{p.rank}.</span>{p.name}
                </Td>
                <Td className="text-center">{fmt(dPlus[i], 6)}</Td>
                <Td className="text-center">{fmt(dMinus[i], 6)}</Td>
                <Td className="text-center">{fmt(dPlus[i] + dMinus[i], 6)}</Td>
                <Td className="text-center font-semibold">{fmt(pref[i], 4)}</Td>
                <Td className="text-center font-bold text-primary">{p.rank}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </StepCard>
    </div>
  );
}

// ─── Per Produk ───────────────────────────────────────────────────────────────

function PerProductView({ steps }: { steps: TopsisStepsData }) {
  const [selected, setSelected] = useState(0);
  const { criteria, products, rawMetrics, scores, colNorms, normalized, weighted, idealBest, idealWorst, dPlus, dMinus, pref } = steps;
  const i = selected;

  return (
    <div className="space-y-4">
      {/* Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">Pilih produk:</span>
        <select
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 flex-1 max-w-xs"
        >
          {products.map((p, idx) => (
            <option key={idx} value={idx}>#{p.rank} — {p.name} ({p.sku})</option>
          ))}
        </select>
      </div>

      {/* Steps for selected product */}
      <div className="space-y-3">

        {/* Step 1 */}
        <StepCard step="L1" title="Matriks Keputusan" desc="Nilai aktual → skor sub-kriteria">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <Th className="text-left">Kriteria</Th>
                <Th className="text-left">Nilai Aktual</Th>
                <Th className="text-left">Rentang yang Cocok</Th>
                <Th className="text-center">Skor (Xij)</Th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c, j) => {
                const raw  = rawMetrics[i][j];
                const sub  = matchedSub(c.subs, raw);
                return (
                  <tr key={j} className="border-b border-border last:border-0 odd:bg-muted/10">
                    <Td className="font-medium">
                      <span className="font-mono text-primary mr-1">{c.code}</span> {c.name}
                      <span className={cn("ml-1.5 text-xs px-1 rounded", c.type === "benefit" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-orange-500/10 text-orange-700 dark:text-orange-400")}>
                        {c.type}
                      </span>
                    </Td>
                    <Td>{fmtRaw(raw, c.unit)}</Td>
                    <Td className="text-muted-foreground">{sub?.label ?? "—"}</Td>
                    <Td className="text-center font-bold text-foreground">{scores[i][j]}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </StepCard>

        {/* Step 2 */}
        <StepCard step="L2" title="Normalisasi" desc="Rij = Xij / √ΣXij²">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <Th className="text-left">Kriteria</Th>
                <Th className="text-center">Xij (skor)</Th>
                <Th className="text-center">√ΣXij² (norm kolom)</Th>
                <Th className="text-center">Rij = Xij / √ΣXij²</Th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c, j) => (
                <tr key={j} className="border-b border-border last:border-0 odd:bg-muted/10">
                  <Td className="font-medium"><span className="font-mono text-primary mr-1">{c.code}</span> {c.name}</Td>
                  <Td className="text-center">{scores[i][j]}</Td>
                  <Td className="text-center">{fmt(colNorms[j])}</Td>
                  <Td className="text-center font-semibold">{fmt(normalized[i][j])}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </StepCard>

        {/* Step 3 */}
        <StepCard step="L3" title="Normalisasi Terbobot" desc="Yij = Rij × Wj">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <Th className="text-left">Kriteria</Th>
                <Th className="text-center">Rij</Th>
                <Th className="text-center">Bobot (Wj)</Th>
                <Th className="text-center">Yij = Rij × Wj</Th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c, j) => (
                <tr key={j} className="border-b border-border last:border-0 odd:bg-muted/10">
                  <Td className="font-medium"><span className="font-mono text-primary mr-1">{c.code}</span> {c.name}</Td>
                  <Td className="text-center">{fmt(normalized[i][j])}</Td>
                  <Td className="text-center">{c.weight}</Td>
                  <Td className="text-center font-semibold">{fmt(weighted[i][j])}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </StepCard>

        {/* Step 4 */}
        <StepCard step="L4" title="Jarak ke Solusi Ideal" desc="Selisih Yij terhadap A+ dan A−">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <Th className="text-left">Kriteria</Th>
                <Th className="text-center">Yij (produk ini)</Th>
                <Th className="text-center text-green-700 dark:text-green-400">A+</Th>
                <Th className="text-center text-orange-700 dark:text-orange-400">A−</Th>
                <Th className="text-center">(Yij−A+)²</Th>
                <Th className="text-center">(Yij−A−)²</Th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c, j) => {
                const y   = weighted[i][j];
                const dP2 = Math.pow(y - idealBest[j], 2);
                const dM2 = Math.pow(y - idealWorst[j], 2);
                return (
                  <tr key={j} className="border-b border-border last:border-0 odd:bg-muted/10">
                    <Td className="font-medium"><span className="font-mono text-primary mr-1">{c.code}</span> {c.name}</Td>
                    <Td className="text-center">{fmt(y)}</Td>
                    <Td className="text-center text-green-700 dark:text-green-400">{fmt(idealBest[j])}</Td>
                    <Td className="text-center text-orange-700 dark:text-orange-400">{fmt(idealWorst[j])}</Td>
                    <Td className="text-center">{fmt(dP2)}</Td>
                    <Td className="text-center">{fmt(dM2)}</Td>
                  </tr>
                );
              })}
              <tr className="bg-muted/20 border-t-2 border-border font-semibold">
                <Td className="text-right text-muted-foreground" colSpan={4}>Jumlah (Σ)</Td>
                <Td className="text-center">{fmt(criteria.reduce((s, _, j) => s + Math.pow(weighted[i][j] - idealBest[j], 2), 0))}</Td>
                <Td className="text-center">{fmt(criteria.reduce((s, _, j) => s + Math.pow(weighted[i][j] - idealWorst[j], 2), 0))}</Td>
              </tr>
            </tbody>
          </table>
        </StepCard>

        {/* Step 5 */}
        <StepCard step="L5" title="D+ dan D−" desc="Akar dari jumlah kuadrat jarak ke solusi ideal">
          <div className="p-4 grid grid-cols-2 gap-4 text-xs">
            {[
              { label: "D+ (jarak ke A+)", value: dPlus[i], color: "text-blue-700 dark:text-blue-400" },
              { label: "D− (jarak ke A−)", value: dMinus[i], color: "text-purple-700 dark:text-purple-400" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                <p className="text-muted-foreground mb-1">{item.label}</p>
                <p className={cn("text-2xl font-mono font-bold", item.color)}>{fmt(item.value, 6)}</p>
              </div>
            ))}
          </div>
        </StepCard>

        {/* Step 6 */}
        <StepCard step="L6" title="Nilai Preferensi & Ranking" desc="Vi = D− / (D+ + D−)">
          <div className="p-4 space-y-3 text-xs">
            <div className="rounded-lg border border-border bg-muted/10 px-4 py-3 font-mono text-sm">
              Vi = D− / (D+ + D−) = {fmt(dMinus[i], 6)} / ({fmt(dPlus[i], 6)} + {fmt(dMinus[i], 6)}) = {fmt(dPlus[i] + dMinus[i], 6)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                <p className="text-muted-foreground mb-1">Nilai Preferensi (Vi)</p>
                <p className="text-xl font-mono font-bold text-foreground">{fmt(pref[i], 6)}</p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                <p className="text-muted-foreground mb-1">Ranking</p>
                <p className="text-3xl font-mono font-bold text-primary">#{products[i].rank}</p>
              </div>
            </div>
          </div>
        </StepCard>

      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function TopsisSteps({ steps }: { steps: TopsisStepsData }) {
  const [visible, setVisible] = useState(false);
  const [tab, setTab]         = useState<"overall" | "per-product">("overall");

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors print:hidden"
      >
        <Calculator className="h-4 w-4 text-muted-foreground" />
        Lihat Langkah Perhitungan TOPSIS
      </button>
    );
  }

  return (
    <div className="space-y-4 print:hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Calculator className="h-4 w-4 text-muted-foreground" />
          Langkah Perhitungan TOPSIS
        </h2>
        <div className="flex items-center gap-2">
          {/* Tab toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
            <button
              onClick={() => setTab("overall")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 transition-colors", tab === "overall" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted/50")}
            >
              <BarChart2 className="h-3 w-3" /> Keseluruhan
            </button>
            <button
              onClick={() => setTab("per-product")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 transition-colors border-l border-border", tab === "per-product" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted/50")}
            >
              <ChevronRight className="h-3 w-3" /> Per Produk
            </button>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Sembunyikan
          </button>
        </div>
      </div>

      {tab === "overall"
        ? <OverallView steps={steps} />
        : <PerProductView steps={steps} />
      }
    </div>
  );
}
